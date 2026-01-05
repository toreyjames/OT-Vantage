// AI Classification Engine
// Uses LLM to analyze and match opportunities to policies

import { PolicyUpdate, OpportunitySignal, PolicyCategory } from './types'

// Policy descriptions for AI context
const POLICY_CONTEXT: Record<PolicyCategory, string> = {
  'eo-14179-ai-leadership': 
    'Executive Order 14179 - Removing Barriers to American Leadership in AI. Focus on accelerating AI development, reducing regulatory burden, maintaining US AI dominance globally.',
  
  'genesis-mission': 
    'GENESIS Mission - Defense AI infrastructure and autonomous systems. Partnership between DOD and private sector for military AI capabilities.',
  
  'stargate-project': 
    'Stargate Project - $500B AI infrastructure initiative. OpenAI, SoftBank, Oracle partnership to build massive AI compute infrastructure in the US.',
  
  'eo-14365-national-ai-framework': 
    'Executive Order 14365 - Advancing AI Governance. National framework for responsible AI development and deployment.',
  
  'ai-action-plan': 
    'National AI Action Plan - Comprehensive strategy for maintaining US AI leadership. Covers research, workforce, infrastructure, and international competitiveness.',
  
  'chips-sovereignty': 
    'CHIPS and Science Act implementation. $52.7B for domestic semiconductor manufacturing. Focus on advanced chips, supply chain security, and reducing dependence on Asia.',
  
  'energy-dominance': 
    'Energy Dominance agenda - Expanding energy production, grid modernization, powering AI data centers. Focus on reliable, affordable energy for industrial growth.',
  
  'nuclear-restart': 
    'Nuclear restart initiatives - Restarting shuttered plants, extending licenses, enabling SMRs. Clean baseload power for data centers and grid stability.'
}

// Prompt template for classification
function buildClassificationPrompt(text: string, type: 'policy' | 'opportunity'): string {
  const policyList = Object.entries(POLICY_CONTEXT)
    .map(([key, desc]) => `- ${key}: ${desc}`)
    .join('\n')
  
  return `You are an AI analyst for the "AI Manhattan Project" - tracking US policy and infrastructure investments.

POLICIES WE'RE TRACKING:
${policyList}

TASK: Analyze the following ${type} and:
1. Identify which policies (if any) it relates to
2. Rate the relevance/impact (1-10)
3. Extract key details (company, value, location if applicable)
4. Summarize why this matters

${type.toUpperCase()} TO ANALYZE:
${text}

Respond in JSON format:
{
  "relevantPolicies": ["policy-key-1", "policy-key-2"],
  "impactScore": 7,
  "company": "Company Name or null",
  "estimatedValue": "dollar amount or null",
  "location": "State or null",
  "summary": "Brief explanation of relevance",
  "actionable": true/false
}`
}

// Mock AI classification (replace with actual LLM call)
export async function classifyWithAI(
  text: string, 
  type: 'policy' | 'opportunity'
): Promise<{
  relevantPolicies: PolicyCategory[]
  impactScore: number
  company?: string
  estimatedValue?: number
  location?: string
  summary: string
  actionable: boolean
}> {
  // TODO: Integrate with actual LLM API (OpenAI, Anthropic, etc.)
  // For now, use keyword-based heuristics
  
  const textLower = text.toLowerCase()
  const policies: PolicyCategory[] = []
  let impactScore = 5
  
  // Keyword matching
  if (textLower.includes('artificial intelligence') || textLower.includes(' ai ')) {
    policies.push('eo-14179-ai-leadership')
    impactScore += 1
  }
  if (textLower.includes('semiconductor') || textLower.includes('chip')) {
    policies.push('chips-sovereignty')
    impactScore += 1
  }
  if (textLower.includes('nuclear') || textLower.includes('reactor')) {
    policies.push('nuclear-restart')
    impactScore += 1
  }
  if (textLower.includes('energy') || textLower.includes('power')) {
    policies.push('energy-dominance')
  }
  if (textLower.includes('data center') || textLower.includes('compute')) {
    policies.push('eo-14179-ai-leadership')
    if (textLower.includes('stargate') || textLower.includes('openai')) {
      policies.push('stargate-project')
      impactScore += 2
    }
  }
  if (textLower.includes('defense') || textLower.includes('military')) {
    policies.push('genesis-mission')
  }
  
  // Extract value
  let estimatedValue: number | undefined
  const billionMatch = text.match(/\$?(\d+(?:\.\d+)?)\s*(?:billion|B\b)/i)
  if (billionMatch) {
    estimatedValue = parseFloat(billionMatch[1]) * 1000
    impactScore += 2
  }
  
  return {
    relevantPolicies: [...new Set(policies)],
    impactScore: Math.min(10, impactScore),
    estimatedValue,
    summary: `Detected ${policies.length} policy alignments via keyword analysis.`,
    actionable: policies.length > 0 && impactScore >= 6
  }
}

// Batch classify multiple items
export async function batchClassify(
  items: Array<{ id: string; text: string; type: 'policy' | 'opportunity' }>
): Promise<Map<string, Awaited<ReturnType<typeof classifyWithAI>>>> {
  const results = new Map()
  
  // Process in parallel with rate limiting
  const batchSize = 5
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const promises = batch.map(item => 
      classifyWithAI(item.text, item.type).then(result => ({ id: item.id, result }))
    )
    
    const batchResults = await Promise.all(promises)
    for (const { id, result } of batchResults) {
      results.set(id, result)
    }
  }
  
  return results
}

// Get AI-generated insights for the dashboard
export function generateInsights(
  policyUpdates: PolicyUpdate[],
  opportunitySignals: OpportunitySignal[]
): string[] {
  const insights: string[] = []
  
  // High-impact policy changes
  const highImpactPolicies = policyUpdates.filter(p => p.impactScore >= 8)
  if (highImpactPolicies.length > 0) {
    insights.push(`🚨 ${highImpactPolicies.length} high-impact policy changes detected requiring attention`)
  }
  
  // New opportunities by sector
  const sectorCounts = opportunitySignals.reduce((acc, s) => {
    acc[s.sector] = (acc[s.sector] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  for (const [sector, count] of Object.entries(sectorCounts)) {
    if (count >= 3) {
      insights.push(`📈 ${count} new ${sector} opportunities discovered`)
    }
  }
  
  // Total pipeline value from new signals
  const totalNewValue = opportunitySignals
    .filter(s => s.estimatedValue)
    .reduce((sum, s) => sum + (s.estimatedValue || 0), 0)
  
  if (totalNewValue > 0) {
    const formatted = totalNewValue >= 1000 
      ? `$${(totalNewValue / 1000).toFixed(1)}B` 
      : `$${totalNewValue}M`
    insights.push(`💰 ${formatted} in potential pipeline from new signals`)
  }
  
  return insights
}

