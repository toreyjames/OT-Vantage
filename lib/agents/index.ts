/**
 * Strategic Subagent System
 * 
 * Multi-layered autonomous agent system for OT Vantage that:
 * - Hunts for white space opportunities
 * - Tracks investment flows
 * - Generates actionable recommendations
 * 
 * Agent Types:
 * - Strategic: White Space Hunter, Investment Tracker, Action Recommender
 * - Sector: Nuclear, Semiconductor, Data Center, Energy, Critical Minerals
 * - Capability: OT Canonization, Commissioning, Industrial AI, EPC Governance, Build Intelligence
 */

// Types
export * from './types'

// Base classes and constants
export { BaseAgent, COMPETITORS, DELOITTE_CAPABILITIES, NICHE_CAPABILITIES } from './base-agent'
export type { AgentDataContext, CreateInsightParams } from './base-agent'

// Strategic agents
export { whiteSpaceHunter, investmentTracker, actionRecommender } from './strategic'

// Sector agents
export { sectorAgents, nuclearAgent, semiconductorAgent, dataCenterAgent, energyAgent, criticalMineralsAgent, defenseSectorAgent, lifeSciencesSectorAgent } from './sectors'

// Capability agents
export { capabilityAgents, otCanonizationAgent, commissioningAgent, industrialAiAgent, epcGovernanceAgent, buildIntelligenceAgent } from './capabilities'

// Coordinator
export { agentCoordinator } from './coordinator'

// All agents in a single list
import { whiteSpaceHunter, investmentTracker, actionRecommender } from './strategic'
import { sectorAgents } from './sectors'
import { capabilityAgents } from './capabilities'

export const allAgents = [
  whiteSpaceHunter,
  investmentTracker,
  actionRecommender,
  ...sectorAgents,
  ...capabilityAgents,
]
