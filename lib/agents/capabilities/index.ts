/**
 * Capability Agents
 * 
 * Each agent monitors opportunities for a specific niche capability
 * (from DELOITTE_NICHE_OPPORTUNITIES.md):
 * 1. OT Asset Canonization
 * 2. Commissioning-to-Operate Security
 * 3. Industrial AI Security
 * 4. EPC/Vendor Governance
 * 5. Build Cycle Intelligence
 */

// Import agents to use in the capabilityAgents array
import { otCanonizationAgent } from './ot-canonization'
import { commissioningAgent } from './commissioning'
import { industrialAiAgent } from './industrial-ai'
import { epcGovernanceAgent } from './epc-governance'
import { buildIntelligenceAgent } from './build-intelligence'

// Re-export types and classes
export { BaseCapabilityAgent } from './base-capability-agent'
export type { CapabilityConfig } from './base-capability-agent'

// Re-export agent classes and instances
export { OtCanonizationAgent, otCanonizationAgent } from './ot-canonization'
export { CommissioningAgent, commissioningAgent } from './commissioning'
export { IndustrialAiAgent, industrialAiAgent } from './industrial-ai'
export { EpcGovernanceAgent, epcGovernanceAgent } from './epc-governance'
export { BuildIntelligenceAgent, buildIntelligenceAgent } from './build-intelligence'

// All capability agents
export const capabilityAgents = [
  otCanonizationAgent,
  commissioningAgent,
  industrialAiAgent,
  epcGovernanceAgent,
  buildIntelligenceAgent,
]
