/**
 * Agent Coordinator
 * 
 * Orchestrates all agents, deduplicates findings, and manages execution cycles.
 * Provides a unified interface for running and managing the agent system.
 */

import fs from 'fs'
import path from 'path'

import {
  AgentInsight,
  AgentRunResult,
  CoordinatorRunResult,
  AgentMetrics,
  AgentStatus,
  AgentAlert,
  InsightFilter,
  InsightSortOptions,
  AgentId,
} from './types'

// Import all agents
import { whiteSpaceHunter, investmentTracker, actionRecommender } from './strategic'
import { sectorAgents } from './sectors'
import { capabilityAgents } from './capabilities'
import { BaseAgent } from './base-agent'

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATA_DIR = path.join(process.cwd(), 'data')
const INSIGHTS_FILE = path.join(DATA_DIR, 'agent-insights.json')
const ALERTS_FILE = path.join(DATA_DIR, 'agent-alerts.json')

// ============================================================================
// COORDINATOR CLASS
// ============================================================================

class AgentCoordinator {
  private agents: Map<AgentId, BaseAgent> = new Map()
  private insights: AgentInsight[] = []
  private alerts: AgentAlert[] = []
  private lastRunResult: CoordinatorRunResult | null = null
  
  constructor() {
    this.registerAgents()
    this.loadPersistedData()
  }
  
  /**
   * Register all agents with the coordinator
   */
  private registerAgents(): void {
    // Strategic agents
    this.agents.set('white-space-hunter', whiteSpaceHunter)
    this.agents.set('investment-tracker', investmentTracker)
    this.agents.set('action-recommender', actionRecommender)
    
    // Sector agents
    for (const agent of sectorAgents) {
      this.agents.set(agent.getConfig().id, agent)
    }
    
    // Capability agents
    for (const agent of capabilityAgents) {
      this.agents.set(agent.getConfig().id, agent)
    }
  }
  
  /**
   * Load persisted insights and alerts
   */
  private loadPersistedData(): void {
    this.ensureDataDir()
    
    // Load insights
    if (fs.existsSync(INSIGHTS_FILE)) {
      try {
        const data = fs.readFileSync(INSIGHTS_FILE, 'utf-8')
        this.insights = JSON.parse(data)
      } catch (error) {
        console.error('Failed to load insights:', error)
        this.insights = []
      }
    }
    
    // Load alerts
    if (fs.existsSync(ALERTS_FILE)) {
      try {
        const data = fs.readFileSync(ALERTS_FILE, 'utf-8')
        this.alerts = JSON.parse(data)
      } catch (error) {
        console.error('Failed to load alerts:', error)
        this.alerts = []
      }
    }
  }
  
  /**
   * Ensure data directory exists
   */
  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  }
  
  /**
   * Save insights to file
   */
  private saveInsights(): void {
    this.ensureDataDir()
    fs.writeFileSync(INSIGHTS_FILE, JSON.stringify(this.insights, null, 2))
  }
  
  /**
   * Save alerts to file
   */
  private saveAlerts(): void {
    this.ensureDataDir()
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(this.alerts, null, 2))
  }
  
  // ============================================================================
  // EXECUTION METHODS
  // ============================================================================
  
  /**
   * Run all enabled agents
   */
  async runAll(): Promise<CoordinatorRunResult> {
    const startedAt = new Date()
    const agentResults: AgentRunResult[] = []
    const errors: { agentId: AgentId; error: string }[] = []
    
    console.log(`[Coordinator] Starting full agent run at ${startedAt.toISOString()}`)
    
    // Run strategic agents first (they don't depend on others)
    const strategicAgentIds: AgentId[] = ['white-space-hunter', 'investment-tracker']
    const strategicResults = await this.runAgentGroup(strategicAgentIds)
    agentResults.push(...strategicResults.results)
    errors.push(...strategicResults.errors)
    
    // Collect insights from strategic agents for action recommender
    const strategicInsights = strategicResults.results.flatMap(r => r.insightsGenerated)
    
    // Run sector agents in parallel
    const sectorAgentIds = sectorAgents.map(a => a.getConfig().id)
    const sectorResults = await this.runAgentGroup(sectorAgentIds)
    agentResults.push(...sectorResults.results)
    errors.push(...sectorResults.errors)
    
    // Run capability agents in parallel
    const capabilityAgentIds = capabilityAgents.map(a => a.getConfig().id)
    const capabilityResults = await this.runAgentGroup(capabilityAgentIds)
    agentResults.push(...capabilityResults.results)
    errors.push(...capabilityResults.errors)
    
    // Now run action recommender with insights from other agents
    const allInsightsForRecommender = [
      ...strategicInsights,
      ...sectorResults.results.flatMap(r => r.insightsGenerated),
      ...capabilityResults.results.flatMap(r => r.insightsGenerated),
    ]
    
    actionRecommender.injectInsights(allInsightsForRecommender)
    const recommenderResult = await actionRecommender.run()
    agentResults.push(recommenderResult)
    if (!recommenderResult.success && recommenderResult.error) {
      errors.push({ agentId: 'action-recommender', error: recommenderResult.error })
    }
    
    // Collect all new insights
    const allNewInsights = agentResults.flatMap(r => r.insightsGenerated)
    
    // Deduplicate and add to store
    const deduplicatedInsights = this.deduplicateInsights(allNewInsights)
    this.addInsights(deduplicatedInsights)
    
    // Generate alerts for high-priority insights
    const newAlerts = this.generateAlerts(deduplicatedInsights)
    this.alerts.push(...newAlerts)
    this.saveAlerts()
    
    const completedAt = new Date()
    
    const result: CoordinatorRunResult = {
      startedAt,
      completedAt,
      totalDurationMs: completedAt.getTime() - startedAt.getTime(),
      agentResults,
      totalInsightsGenerated: deduplicatedInsights.length,
      newHighPriorityCount: deduplicatedInsights.filter(i => 
        i.priority === 'critical' || i.priority === 'high'
      ).length,
      errors,
    }
    
    this.lastRunResult = result
    
    console.log(`[Coordinator] Run complete. ${result.totalInsightsGenerated} insights, ${result.newHighPriorityCount} high-priority, ${errors.length} errors`)
    
    return result
  }
  
  /**
   * Run a specific agent by ID
   */
  async runAgent(agentId: AgentId): Promise<AgentRunResult> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }
    
    const result = await agent.run()
    
    if (result.success && result.insightsGenerated.length > 0) {
      const deduped = this.deduplicateInsights(result.insightsGenerated)
      this.addInsights(deduped)
      
      const newAlerts = this.generateAlerts(deduped)
      this.alerts.push(...newAlerts)
      this.saveAlerts()
    }
    
    return result
  }
  
  /**
   * Run a group of agents in parallel
   */
  private async runAgentGroup(agentIds: AgentId[]): Promise<{
    results: AgentRunResult[]
    errors: { agentId: AgentId; error: string }[]
  }> {
    const results: AgentRunResult[] = []
    const errors: { agentId: AgentId; error: string }[] = []
    
    const promises = agentIds.map(async (id) => {
      const agent = this.agents.get(id)
      if (!agent) {
        errors.push({ agentId: id, error: 'Agent not found' })
        return null
      }
      
      if (!agent.getConfig().enabled) {
        return null
      }
      
      try {
        return await agent.run()
      } catch (error) {
        errors.push({ 
          agentId: id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        return null
      }
    })
    
    const allResults = await Promise.all(promises)
    
    for (const result of allResults) {
      if (result) {
        results.push(result)
        if (!result.success && result.error) {
          errors.push({ agentId: result.agentId, error: result.error })
        }
      }
    }
    
    return { results, errors }
  }
  
  // ============================================================================
  // INSIGHT MANAGEMENT
  // ============================================================================
  
  /**
   * Add new insights (deduplicates)
   */
  private addInsights(newInsights: AgentInsight[]): void {
    for (const insight of newInsights) {
      // Check for duplicates by title similarity
      const isDuplicate = this.insights.some(existing =>
        this.isSimilarInsight(existing, insight)
      )
      
      if (!isDuplicate) {
        this.insights.push(insight)
      }
    }
    
    // Sort by date (newest first)
    this.insights.sort((a, b) => 
      new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
    )
    
    // Keep only last 500 insights
    if (this.insights.length > 500) {
      this.insights = this.insights.slice(0, 500)
    }
    
    this.saveInsights()
  }
  
  /**
   * Check if two insights are similar (for deduplication)
   */
  private isSimilarInsight(a: AgentInsight, b: AgentInsight): boolean {
    // Same title = duplicate
    const titleA = a.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    const titleB = b.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    if (titleA === titleB) return true
    
    // Very similar title (>80% overlap) = duplicate
    const minLength = Math.min(titleA.length, titleB.length)
    let matches = 0
    for (let i = 0; i < minLength; i++) {
      if (titleA[i] === titleB[i]) matches++
    }
    const similarity = matches / Math.max(titleA.length, titleB.length)
    
    return similarity > 0.8
  }
  
  /**
   * Deduplicate insights within a batch
   */
  private deduplicateInsights(insights: AgentInsight[]): AgentInsight[] {
    const seen = new Set<string>()
    const unique: AgentInsight[] = []
    
    for (const insight of insights) {
      const key = insight.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(insight)
      }
    }
    
    return unique
  }
  
  /**
   * Get insights with filtering and sorting
   */
  getInsights(
    filter?: InsightFilter,
    sort?: InsightSortOptions,
    limit?: number
  ): AgentInsight[] {
    let result = [...this.insights]
    
    // Apply filters
    if (filter) {
      if (filter.agentIds?.length) {
        result = result.filter(i => filter.agentIds!.includes(i.agentId))
      }
      if (filter.agentTypes?.length) {
        result = result.filter(i => filter.agentTypes!.includes(i.agentType))
      }
      if (filter.insightTypes?.length) {
        result = result.filter(i => filter.insightTypes!.includes(i.insightType))
      }
      if (filter.priorities?.length) {
        result = result.filter(i => filter.priorities!.includes(i.priority))
      }
      if (filter.statuses?.length) {
        result = result.filter(i => filter.statuses!.includes(i.status))
      }
      if (filter.sectors?.length) {
        result = result.filter(i => 
          i.relevantSectors.some(s => filter.sectors!.includes(s))
        )
      }
      if (filter.minConfidence !== undefined) {
        result = result.filter(i => i.confidence >= filter.minConfidence!)
      }
      if (filter.dateRange) {
        result = result.filter(i => {
          const date = new Date(i.discoveredAt)
          return date >= filter.dateRange!.start && date <= filter.dateRange!.end
        })
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase()
        result = result.filter(i =>
          i.title.toLowerCase().includes(query) ||
          i.summary.toLowerCase().includes(query)
        )
      }
    }
    
    // Apply sorting
    if (sort) {
      result.sort((a, b) => {
        let comparison = 0
        switch (sort.field) {
          case 'discoveredAt':
            comparison = new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime()
            break
          case 'confidence':
            comparison = a.confidence - b.confidence
            break
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
            break
          case 'impactScore':
            comparison = a.impactScore - b.impactScore
            break
        }
        return sort.direction === 'desc' ? -comparison : comparison
      })
    }
    
    // Apply limit
    if (limit) {
      result = result.slice(0, limit)
    }
    
    return result
  }
  
  /**
   * Update insight status
   */
  updateInsightStatus(
    insightId: string,
    status: AgentInsight['status'],
    notes?: string
  ): AgentInsight | null {
    const insight = this.insights.find(i => i.id === insightId)
    if (!insight) return null
    
    insight.status = status
    if (status === 'reviewed' || status === 'actioned' || status === 'dismissed') {
      insight.reviewedAt = new Date()
    }
    if (notes) {
      insight.notes = notes
    }
    
    this.saveInsights()
    return insight
  }
  
  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================
  
  /**
   * Generate alerts for high-priority insights
   */
  private generateAlerts(insights: AgentInsight[]): AgentAlert[] {
    const alerts: AgentAlert[] = []
    
    for (const insight of insights) {
      // Only generate alerts for critical and high priority
      if (insight.priority !== 'critical' && insight.priority !== 'high') continue
      
      let alertType: AgentAlert['type'] = 'critical-insight'
      if (insight.insightType === 'white-space') alertType = 'opportunity-match'
      if (insight.insightType === 'competitive') alertType = 'competitor-move'
      if (insight.insightType === 'policy') alertType = 'policy-change'
      
      alerts.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        insightId: insight.id,
        type: alertType,
        title: insight.title,
        message: insight.summary,
        priority: insight.priority,
        createdAt: new Date(),
        acknowledged: false,
        linkTo: `/agents?insight=${insight.id}`,
      })
    }
    
    return alerts
  }
  
  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): AgentAlert[] {
    return this.alerts.filter(a => !a.acknowledged)
  }
  
  /**
   * Get all alerts
   */
  getAllAlerts(limit?: number): AgentAlert[] {
    const sorted = [...this.alerts].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return limit ? sorted.slice(0, limit) : sorted
  }
  
  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): AgentAlert | null {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return null
    
    alert.acknowledged = true
    alert.acknowledgedAt = new Date()
    
    this.saveAlerts()
    return alert
  }
  
  /**
   * Acknowledge all alerts
   */
  acknowledgeAllAlerts(): number {
    const unacknowledged = this.alerts.filter(a => !a.acknowledged)
    const now = new Date()
    
    for (const alert of unacknowledged) {
      alert.acknowledged = true
      alert.acknowledgedAt = now
    }
    
    this.saveAlerts()
    return unacknowledged.length
  }
  
  // ============================================================================
  // STATUS & METRICS
  // ============================================================================
  
  /**
   * Get all agent statuses
   */
  getAllAgentStatuses(): AgentStatus[] {
    return Array.from(this.agents.values()).map(agent => agent.getStatus())
  }
  
  /**
   * Get agent status by ID
   */
  getAgentStatus(agentId: AgentId): AgentStatus | null {
    const agent = this.agents.get(agentId)
    return agent ? agent.getStatus() : null
  }
  
  /**
   * Get system metrics
   */
  getMetrics(): AgentMetrics {
    const statuses = this.getAllAgentStatuses()
    
    // Count by type
    const insightsByType: Record<string, number> = {}
    const insightsByPriority: Record<string, number> = {}
    const insightsByAgent: Record<string, number> = {}
    
    for (const insight of this.insights) {
      insightsByType[insight.insightType] = (insightsByType[insight.insightType] || 0) + 1
      insightsByPriority[insight.priority] = (insightsByPriority[insight.priority] || 0) + 1
      insightsByAgent[insight.agentId] = (insightsByAgent[insight.agentId] || 0) + 1
    }
    
    // Calculate average confidence
    const avgConfidence = this.insights.length > 0
      ? this.insights.reduce((sum, i) => sum + i.confidence, 0) / this.insights.length
      : 0
    
    // Calculate actioned rate
    const actioned = this.insights.filter(i => i.status === 'actioned').length
    const reviewed = this.insights.filter(i => i.status !== 'new').length
    const actionedRate = reviewed > 0 ? actioned / reviewed : 0
    
    return {
      totalAgents: this.agents.size,
      activeAgents: statuses.filter(s => s.status !== 'disabled').length,
      totalInsights: this.insights.length,
      insightsByType: insightsByType as any,
      insightsByPriority: insightsByPriority as any,
      insightsByAgent: insightsByAgent as any,
      averageConfidence: avgConfidence,
      actionedRate,
      lastFullScan: this.lastRunResult?.completedAt,
    }
  }
  
  /**
   * Get last run result
   */
  getLastRunResult(): CoordinatorRunResult | null {
    return this.lastRunResult
  }
  
  /**
   * Enable/disable an agent
   */
  setAgentEnabled(agentId: AgentId, enabled: boolean): boolean {
    const agent = this.agents.get(agentId)
    if (!agent) return false
    
    agent.setEnabled(enabled)
    return true
  }
  
  /**
   * Get count of insights
   */
  getInsightCount(): number {
    return this.insights.length
  }
  
  /**
   * Get count of unacknowledged alerts
   */
  getAlertCount(): number {
    return this.alerts.filter(a => !a.acknowledged).length
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const agentCoordinator = new AgentCoordinator()

// Export types for API routes
export type { AgentCoordinator }
