/**
 * Sector Agents
 * 
 * Each agent monitors a specific sector of the Build Economy:
 * - Nuclear (fission + fusion)
 * - Semiconductor
 * - Data Center
 * - Energy (grid, clean energy, hydrogen, storage)
 * - Critical Minerals
 * - Defense & Aerospace
 * - Life Sciences & Pharma
 */

// Import agents to use in the sectorAgents array
import { nuclearAgent } from './nuclear'
import { semiconductorAgent } from './semiconductor'
import { dataCenterAgent } from './data-center'
import { energyAgent } from './energy'
import { criticalMineralsAgent } from './critical-minerals'
import { defenseSectorAgent } from './defense'
import { lifeSciencesSectorAgent } from './life-sciences'

// Re-export types and classes
export { BaseSectorAgent } from './base-sector-agent'
export type { SectorConfig } from './base-sector-agent'

// Re-export agent classes and instances
export { NuclearSectorAgent, nuclearAgent } from './nuclear'
export { SemiconductorSectorAgent, semiconductorAgent } from './semiconductor'
export { DataCenterSectorAgent, dataCenterAgent } from './data-center'
export { EnergySectorAgent, energyAgent } from './energy'
export { CriticalMineralsSectorAgent, criticalMineralsAgent } from './critical-minerals'
export { DefenseSectorAgent, defenseSectorAgent } from './defense'
export { LifeSciencesSectorAgent, lifeSciencesSectorAgent } from './life-sciences'

// All sector agents
export const sectorAgents = [
  nuclearAgent,
  semiconductorAgent,
  dataCenterAgent,
  energyAgent,
  criticalMineralsAgent,
  defenseSectorAgent,
  lifeSciencesSectorAgent,
]
