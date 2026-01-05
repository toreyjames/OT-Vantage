'use client'

import { useState, useMemo } from 'react'

// ============================================================================
// THE AI MANHATTAN PROJECT THESIS
// ============================================================================
// The Heart: Civilizational problems AI will solve (cancer, heart disease, aging, climate, food)
// The Brain: AI infrastructure (data centers, semiconductors, fusion, advanced nuclear)
// The Foundation: Prerequisites (water, grid, materials, fuel, transmission)

type Category = 'heart' | 'brain' | 'foundation'
type Priority = 'hot' | 'warm' | 'tracking'

interface Opportunity {
  id: string
  company: string
  project: string
  category: Category
  subcategory: string
  value: number // millions
  prerequisites: string[]
  deloitteServices: string[]
  nextMilestone?: { date: string; action: string }
  priority: Priority
  whyItMatters: string
  contacts?: string[]
  location?: string
}

// ============================================================================
// COMPREHENSIVE OPPORTUNITIES — AI Manhattan Project Scale
// ============================================================================
const opportunities: Opportunity[] = [
  // =========================================================================
  // THE HEART — Civilizational Problems AI Will Solve
  // =========================================================================
  
  // --- CANCER ---
  {
    id: 'heart-cancer-1',
    company: 'NVIDIA / National Cancer Institute',
    project: 'MOSAIX Cancer AI Platform',
    category: 'heart',
    subcategory: 'Cancer AI',
    value: 500,
    prerequisites: ['GPU Compute Access', 'Federated Data Infrastructure', 'Clinical Trial Integration'],
    deloitteServices: ['AI Governance', 'Data Platform Security', 'Regulatory Compliance'],
    nextMilestone: { date: '2026-01-20', action: 'Phase 2 partnership expansion' },
    priority: 'hot',
    whyItMatters: 'AI that detects cancer years before symptoms. Analyzing 10M+ patient records to find patterns humans miss.',
    location: 'Bethesda, MD',
  },
  {
    id: 'heart-cancer-2',
    company: 'Tempus AI',
    project: 'Precision Oncology Platform',
    category: 'heart',
    subcategory: 'Cancer AI',
    value: 800,
    prerequisites: ['Genomic Sequencing Capacity', 'Clinical Data Pipelines', 'Hospital System Integration'],
    deloitteServices: ['Healthcare AI Security', 'Data Governance', 'EHR Integration'],
    nextMilestone: { date: '2026-02-15', action: 'FDA clearance decision' },
    priority: 'hot',
    whyItMatters: 'AI matching cancer patients to optimal treatments based on tumor genomics. 50%+ of US oncologists use it.',
    location: 'Chicago, IL',
  },
  {
    id: 'heart-cancer-3',
    company: 'Recursion Pharmaceuticals',
    project: 'AI Drug Discovery for Rare Cancers',
    category: 'heart',
    subcategory: 'Cancer AI',
    value: 350,
    prerequisites: ['HPC Compute', 'Biological Data Infrastructure', 'Lab Automation'],
    deloitteServices: ['AI Model Security', 'IP Protection', 'Regulatory Strategy'],
    priority: 'warm',
    whyItMatters: 'Using AI to find treatments for cancers too rare for traditional drug development economics.',
    location: 'Salt Lake City, UT',
  },

  // --- HEART DISEASE ---
  {
    id: 'heart-cardio-1',
    company: 'Viz.ai',
    project: 'AI Stroke & Heart Attack Detection',
    category: 'heart',
    subcategory: 'Heart Disease AI',
    value: 200,
    prerequisites: ['Hospital Network Integration', 'Real-time Imaging Pipeline', '5G/Edge Compute'],
    deloitteServices: ['Healthcare AI Deployment', 'Clinical Workflow Integration', 'FDA Compliance'],
    nextMilestone: { date: '2026-01-15', action: 'VA hospital system rollout' },
    priority: 'hot',
    whyItMatters: 'AI that alerts doctors to strokes/heart attacks in real-time from CT scans. Minutes = brain cells.',
    location: 'San Francisco, CA',
  },
  {
    id: 'heart-cardio-2',
    company: 'HeartFlow',
    project: 'AI Coronary Analysis Platform',
    category: 'heart',
    subcategory: 'Heart Disease AI',
    value: 150,
    prerequisites: ['CT Scanner Integration', 'Cloud Compute', 'Cardiologist Training'],
    deloitteServices: ['Healthcare AI Security', 'Workflow Optimization', 'Payer Integration'],
    priority: 'warm',
    whyItMatters: 'Non-invasive AI analysis replaces cardiac catheterization. Finds blockages without surgery.',
    location: 'Redwood City, CA',
  },

  // --- AGING & LONGEVITY ---
  {
    id: 'heart-aging-1',
    company: 'Altos Labs',
    project: 'AI-Driven Cellular Reprogramming',
    category: 'heart',
    subcategory: 'Longevity AI',
    value: 3000,
    prerequisites: ['Massive Compute (GPU clusters)', 'Biological Data Platform', 'Lab Automation'],
    deloitteServices: ['AI Research Security', 'IP Protection', 'Data Governance'],
    priority: 'hot',
    whyItMatters: 'Backed by Bezos. Using AI to reverse cellular aging. If it works, it changes everything.',
    location: 'San Francisco, CA',
  },
  {
    id: 'heart-aging-2',
    company: 'Insilico Medicine',
    project: 'AI Aging Drug Pipeline',
    category: 'heart',
    subcategory: 'Longevity AI',
    value: 400,
    prerequisites: ['Drug Discovery Compute', 'Clinical Trial Infrastructure', 'Regulatory Pathway'],
    deloitteServices: ['AI Drug Discovery Security', 'Regulatory Strategy', 'Clinical Operations'],
    nextMilestone: { date: '2026-03-01', action: 'Phase 2 trial results' },
    priority: 'warm',
    whyItMatters: 'First AI-discovered drug in human trials for aging-related disease.',
    location: 'Hong Kong / New York',
  },

  // --- DRUG DISCOVERY ---
  {
    id: 'heart-drug-1',
    company: 'Isomorphic Labs (Alphabet)',
    project: 'AlphaFold Drug Discovery',
    category: 'heart',
    subcategory: 'Drug Discovery AI',
    value: 2000,
    prerequisites: ['TPU/GPU Compute', 'Protein Structure Database', 'Pharma Partnerships'],
    deloitteServices: ['AI Model Security', 'Partnership Structuring', 'IP Strategy'],
    priority: 'hot',
    whyItMatters: 'AlphaFold solved protein folding. Now using it to design drugs. Could compress decades of R&D.',
    location: 'London / Bay Area',
  },
  {
    id: 'heart-drug-2',
    company: 'Generate Biomedicines',
    project: 'Generative AI Protein Design',
    category: 'heart',
    subcategory: 'Drug Discovery AI',
    value: 700,
    prerequisites: ['Compute Infrastructure', 'Lab Manufacturing', 'Clinical Pipeline'],
    deloitteServices: ['AI Platform Security', 'Manufacturing Strategy', 'Regulatory'],
    priority: 'warm',
    whyItMatters: 'Designing entirely new proteins that don\'t exist in nature. New class of medicines.',
    location: 'Somerville, MA',
  },

  // --- CLIMATE & WEATHER ---
  {
    id: 'heart-climate-1',
    company: 'Google DeepMind',
    project: 'GraphCast Weather Prediction',
    category: 'heart',
    subcategory: 'Climate AI',
    value: 300,
    prerequisites: ['Global Sensor Network', 'Massive Compute', 'Weather Service Integration'],
    deloitteServices: ['AI Deployment Strategy', 'Government Partnership', 'Data Governance'],
    priority: 'warm',
    whyItMatters: '10-day weather forecasts in 1 minute vs 6 hours. Better hurricane prediction = lives saved.',
    location: 'London / Mountain View',
  },
  {
    id: 'heart-climate-2',
    company: 'ClimateAi',
    project: 'Agricultural Climate Resilience',
    category: 'heart',
    subcategory: 'Climate AI',
    value: 100,
    prerequisites: ['Satellite Data', 'Farm Sensor Networks', 'Supply Chain Integration'],
    deloitteServices: ['AgTech Strategy', 'Supply Chain Resilience', 'Data Platform'],
    priority: 'tracking',
    whyItMatters: 'AI predicting crop failures before they happen. Food security in a changing climate.',
    location: 'San Francisco, CA',
  },

  // --- EDUCATION ---
  {
    id: 'heart-edu-1',
    company: 'Khan Academy',
    project: 'Khanmigo AI Tutor (GPT-4)',
    category: 'heart',
    subcategory: 'Education AI',
    value: 50,
    prerequisites: ['LLM Access (OpenAI)', 'School District Partnerships', 'Privacy Framework'],
    deloitteServices: ['EdTech Strategy', 'Privacy Compliance', 'Implementation'],
    nextMilestone: { date: '2026-02-01', action: 'State-wide pilot expansion' },
    priority: 'warm',
    whyItMatters: 'AI tutor for every student. Personalized learning at scale. Could close achievement gaps.',
    location: 'Mountain View, CA',
  },

  // =========================================================================
  // THE BRAIN — AI Infrastructure
  // =========================================================================

  // --- DATA CENTERS ---
  {
    id: 'brain-dc-1',
    company: 'Microsoft',
    project: 'Wisconsin AI Data Center Complex',
    category: 'brain',
    subcategory: 'AI Data Centers',
    value: 3300,
    prerequisites: ['GPU Supply (NVIDIA)', 'Water Infrastructure', 'Grid Capacity (2GW)', 'Cooling Systems'],
    deloitteServices: ['Commissioning OT Security', 'EPC Vendor Governance', 'OT Asset Canonization'],
    nextMilestone: { date: '2026-01-10', action: 'Phase 1 OT security RFP' },
    priority: 'hot',
    whyItMatters: 'The Brain that runs AI. Training GPT-5 class models. Every AI breakthrough needs compute.',
    location: 'Mount Pleasant, WI',
  },
  {
    id: 'brain-dc-2',
    company: 'Amazon (AWS)',
    project: 'Mississippi AI Infrastructure Hub',
    category: 'brain',
    subcategory: 'AI Data Centers',
    value: 10000,
    prerequisites: ['Custom Chips (Trainium)', 'Power Infrastructure', 'Water/Cooling', 'Fiber Connectivity'],
    deloitteServices: ['Greenfield OT Security', 'Supply Chain Security', 'Workforce Planning'],
    nextMilestone: { date: '2026-02-15', action: 'Construction phase 2 kickoff' },
    priority: 'hot',
    whyItMatters: '$10B AI infrastructure. Custom AI chips. Powers AWS AI services used by millions.',
    location: 'Mississippi',
  },
  {
    id: 'brain-dc-3',
    company: 'Google',
    project: 'Texas AI Hyperscale Campus',
    category: 'brain',
    subcategory: 'AI Data Centers',
    value: 5000,
    prerequisites: ['TPU Manufacturing', 'Renewable Energy (solar/wind)', 'Water Recycling', 'Grid Connection'],
    deloitteServices: ['Sustainability Strategy', 'OT Security', 'Energy Procurement'],
    priority: 'hot',
    whyItMatters: 'Training Gemini models. Google\'s AI future. 100% renewable power target.',
    location: 'Texas',
  },
  {
    id: 'brain-dc-4',
    company: 'Meta',
    project: 'AI Research Supercluster Expansion',
    category: 'brain',
    subcategory: 'AI Data Centers',
    value: 4000,
    prerequisites: ['350,000 H100 GPUs', 'Power Infrastructure', 'Cooling Innovation', 'Network Fabric'],
    deloitteServices: ['Infrastructure Security', 'Supply Chain Risk', 'Energy Strategy'],
    priority: 'hot',
    whyItMatters: 'Training Llama models. Open-source AI. Needs more compute than anyone except Microsoft.',
    location: 'Multiple US Sites',
  },
  {
    id: 'brain-dc-5',
    company: 'Oracle',
    project: 'Stargate AI Infrastructure (w/ OpenAI)',
    category: 'brain',
    subcategory: 'AI Data Centers',
    value: 100000,
    prerequisites: ['Massive GPU Supply', 'Nuclear/Clean Energy', 'Water Infrastructure', 'Land'],
    deloitteServices: ['Mega-project Strategy', 'OT Security Architecture', 'Energy Partnership'],
    nextMilestone: { date: '2026-01-30', action: 'Site selection announcement' },
    priority: 'hot',
    whyItMatters: '$100B Stargate project. Largest AI infrastructure ever. Will train AGI-class models.',
    location: 'TBD (Texas likely)',
  },

  // --- SEMICONDUCTORS ---
  {
    id: 'brain-semi-1',
    company: 'Intel',
    project: 'Ohio Mega-Fab Complex',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 28000,
    prerequisites: ['Semiconductor Materials', 'ASML EUV Tools', 'Ultra-pure Water', 'Skilled Workforce'],
    deloitteServices: ['Smart Factory OT Security', 'Commissioning Security', 'Workforce Planning'],
    nextMilestone: { date: '2026-03-31', action: 'Tool install wave / OT integration' },
    priority: 'hot',
    whyItMatters: 'AI chips made in America. $8.5B CHIPS funding. 3,000+ OT assets to secure.',
    location: 'New Albany, OH',
  },
  {
    id: 'brain-semi-2',
    company: 'TSMC',
    project: 'Arizona Fab 2 (3nm/2nm AI Chips)',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 65000,
    prerequisites: ['EUV Lithography', 'Ultra-pure Chemicals', 'Water (4.8M gal/day)', 'Power Grid'],
    deloitteServices: ['Commissioning OT Security', 'EPC Vendor Governance', 'Supply Chain Security'],
    nextMilestone: { date: '2026-02-15', action: 'Fab 2 construction milestone' },
    priority: 'hot',
    whyItMatters: 'Most advanced chips on US soil. Makes the chips for NVIDIA, Apple, AMD. Semiconductor sovereignty.',
    location: 'Phoenix, AZ',
  },
  {
    id: 'brain-semi-3',
    company: 'Samsung',
    project: 'Taylor Advanced Logic Fab',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 17000,
    prerequisites: ['EUV Tools', 'Chemicals Supply', 'Water Infrastructure', 'Grid Capacity'],
    deloitteServices: ['OT Security', 'Supply Chain', 'Workforce Development'],
    priority: 'warm',
    whyItMatters: 'Third major leading-edge fab on US soil. Diversifies from TSMC concentration.',
    location: 'Taylor, TX',
  },
  {
    id: 'brain-semi-4',
    company: 'Micron',
    project: 'Idaho HBM Expansion (AI Memory)',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 15000,
    prerequisites: ['Advanced Packaging Equipment', 'Materials Supply', 'Clean Power'],
    deloitteServices: ['Smart Factory Security', 'Supply Chain Resilience'],
    nextMilestone: { date: '2026-01-30', action: 'HBM3E production ramp' },
    priority: 'hot',
    whyItMatters: 'High-bandwidth memory for AI chips. NVIDIA H100/H200 need HBM. AI bottleneck.',
    location: 'Boise, ID',
  },
  {
    id: 'brain-semi-5',
    company: 'Micron',
    project: 'New York Mega-Fab (DRAM)',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 100000,
    prerequisites: ['EUV Tools', 'Water Treatment', 'Power (500MW+)', 'Workforce (9,000)'],
    deloitteServices: ['Greenfield OT Security', 'Workforce Strategy', 'Community Relations'],
    priority: 'hot',
    whyItMatters: '$100B over 20 years. Largest CHIPS award ($6.1B). Memory for AI systems.',
    location: 'Clay, NY',
  },

  // --- FUSION ENERGY ---
  {
    id: 'brain-fusion-1',
    company: 'Helion Energy',
    project: 'Polaris Fusion Plant',
    category: 'brain',
    subcategory: 'Fusion Energy',
    value: 5000,
    prerequisites: ['Superconducting Magnets', 'Plasma Control Systems', 'Grid Connection', 'Helium-3'],
    deloitteServices: ['Energy Project OT Security', 'Regulatory Strategy', 'Utility Partnership'],
    nextMilestone: { date: '2026-06-01', action: 'Polaris commissioning target' },
    priority: 'hot',
    whyItMatters: 'First commercial fusion plant. Microsoft PPA signed. Unlimited clean energy for AI.',
    location: 'Everett, WA',
  },
  {
    id: 'brain-fusion-2',
    company: 'Commonwealth Fusion Systems',
    project: 'SPARC / ARC Fusion',
    category: 'brain',
    subcategory: 'Fusion Energy',
    value: 2000,
    prerequisites: ['High-temp Superconductors', 'Magnet Manufacturing', 'Regulatory Framework'],
    deloitteServices: ['Energy OT Security', 'Project Controls', 'Regulatory'],
    nextMilestone: { date: '2026-12-01', action: 'SPARC first plasma target' },
    priority: 'hot',
    whyItMatters: 'MIT spin-out. Compact fusion. $2B+ raised. Could power entire AI data center campuses.',
    location: 'Devens, MA',
  },
  {
    id: 'brain-fusion-3',
    company: 'TAE Technologies',
    project: 'Copernicus Fusion Reactor',
    category: 'brain',
    subcategory: 'Fusion Energy',
    value: 1200,
    prerequisites: ['Beam Injection Systems', 'Plasma Diagnostics', 'Grid Integration'],
    deloitteServices: ['Energy Security', 'Technology Strategy', 'Commercialization'],
    priority: 'warm',
    whyItMatters: 'Alternative fusion approach. Google partnership for AI-controlled plasma.',
    location: 'Foothill Ranch, CA',
  },

  // --- ADVANCED NUCLEAR ---
  {
    id: 'brain-nuclear-1',
    company: 'TerraPower',
    project: 'Natrium SMR (Wyoming)',
    category: 'brain',
    subcategory: 'Advanced Nuclear',
    value: 4000,
    prerequisites: ['HALEU Fuel Supply', 'NRC Licensing', 'Component Manufacturing', 'Grid Connection'],
    deloitteServices: ['Nuclear OT Security', 'NRC Compliance', 'AI QA Documentation'],
    nextMilestone: { date: '2026-03-15', action: 'Construction permit decision' },
    priority: 'hot',
    whyItMatters: 'Bill Gates-backed. Sodium-cooled reactor. 24/7 clean power for AI. Needs HALEU.',
    location: 'Kemmerer, WY',
  },
  {
    id: 'brain-nuclear-2',
    company: 'X-energy',
    project: 'Xe-100 SMR (Dow Chemical)',
    category: 'brain',
    subcategory: 'Advanced Nuclear',
    value: 2500,
    prerequisites: ['TRISO Fuel Production', 'NRC Design Certification', 'Industrial Site Prep'],
    deloitteServices: ['Industrial OT Security', 'Regulatory', 'Project Controls'],
    nextMilestone: { date: '2026-04-01', action: 'NRC design certification milestone' },
    priority: 'hot',
    whyItMatters: 'First SMR for industrial process heat. Powers chemical plant. Template for AI data centers.',
    location: 'Seadrift, TX',
  },
  {
    id: 'brain-nuclear-3',
    company: 'Kairos Power',
    project: 'Hermes Test Reactor',
    category: 'brain',
    subcategory: 'Advanced Nuclear',
    value: 500,
    prerequisites: ['Molten Salt Systems', 'TRISO Fuel', 'NRC Construction Permit'],
    deloitteServices: ['Nuclear OT Security', 'Regulatory Strategy'],
    nextMilestone: { date: '2026-01-15', action: 'Construction progress review' },
    priority: 'warm',
    whyItMatters: 'First advanced reactor construction permit in 50 years. Google partnership.',
    location: 'Oak Ridge, TN',
  },
  {
    id: 'brain-nuclear-4',
    company: 'NuScale Power',
    project: 'UAMPS Carbon Free Power Project',
    category: 'brain',
    subcategory: 'Advanced Nuclear',
    value: 5300,
    prerequisites: ['NRC Operating License', 'Module Manufacturing', 'Site Preparation'],
    deloitteServices: ['Utility Partnership', 'Project Controls', 'OT Security'],
    priority: 'warm',
    whyItMatters: 'Only NRC-certified SMR design. 6-module plant for western utilities.',
    location: 'Idaho Falls, ID',
  },

  // =========================================================================
  // THE FOUNDATION — Prerequisites That Make It All Work
  // =========================================================================

  // --- NUCLEAR RESTARTS ---
  {
    id: 'found-restart-1',
    company: 'Constellation Energy',
    project: 'Three Mile Island Restart (Microsoft)',
    category: 'foundation',
    subcategory: 'Nuclear Restarts',
    value: 1600,
    prerequisites: ['NRC License Renewal', 'Equipment Refurbishment', 'Grid Connection Upgrade', 'Workforce'],
    deloitteServices: ['Nuclear OT Security', 'NRC Compliance', 'Workforce Planning'],
    nextMilestone: { date: '2026-02-01', action: 'NRC restart approval timeline' },
    priority: 'hot',
    whyItMatters: 'First nuclear restart in US history. 835MW clean power for Microsoft AI data centers.',
    location: 'Middletown, PA',
  },
  {
    id: 'found-restart-2',
    company: 'Holtec International',
    project: 'Palisades Nuclear Restart',
    category: 'foundation',
    subcategory: 'Nuclear Restarts',
    value: 1500,
    prerequisites: ['NRC Approval', 'Equipment Restoration', 'Steam Generator Work', 'Fuel'],
    deloitteServices: ['Nuclear OT Security', 'Regulatory Support', 'Project Controls'],
    nextMilestone: { date: '2026-03-01', action: 'Target restart date' },
    priority: 'hot',
    whyItMatters: 'Second nuclear restart. $1.5B DOE loan. 800MW clean baseload. Michigan grid stability.',
    location: 'Covert, MI',
  },
  {
    id: 'found-restart-3',
    company: 'Energy Harbor / Talen',
    project: 'Additional Restart Candidates',
    category: 'foundation',
    subcategory: 'Nuclear Restarts',
    value: 3000,
    prerequisites: ['NRC Framework', 'Economic Analysis', 'Grid Contracts', 'Workforce'],
    deloitteServices: ['Feasibility Analysis', 'Regulatory Strategy', 'Utility Partnership'],
    priority: 'warm',
    whyItMatters: '5+ reactors being evaluated for restart. Each = 800-1200MW clean power for AI.',
    location: 'Multiple Sites',
  },

  // --- HALEU FUEL ---
  {
    id: 'found-haleu-1',
    company: 'Centrus Energy',
    project: 'HALEU Production Scale-Up',
    category: 'foundation',
    subcategory: 'Nuclear Fuel',
    value: 2600,
    prerequisites: ['Centrifuge Manufacturing', 'NRC Security Upgrades', 'DOE Contracts'],
    deloitteServices: ['Nuclear Security', 'NRC Compliance', 'Supply Chain'],
    nextMilestone: { date: '2026-02-28', action: 'Production capacity milestone' },
    priority: 'hot',
    whyItMatters: 'No HALEU = no advanced reactors. Russia has 90% of global supply. National security critical.',
    location: 'Piketon, OH',
  },
  {
    id: 'found-haleu-2',
    company: 'Urenco USA',
    project: 'HALEU Enrichment Expansion',
    category: 'foundation',
    subcategory: 'Nuclear Fuel',
    value: 500,
    prerequisites: ['Cascade Modifications', 'NRC License Amendment', 'DOE Partnership'],
    deloitteServices: ['Nuclear Security', 'Regulatory', 'Program Management'],
    priority: 'warm',
    whyItMatters: 'Second US HALEU source. Reduces single-point-of-failure risk.',
    location: 'Eunice, NM',
  },

  // --- RARE EARTHS ---
  {
    id: 'found-rare-1',
    company: 'MP Materials',
    project: 'Mountain Pass + Magnetics Facility',
    category: 'foundation',
    subcategory: 'Rare Earths',
    value: 700,
    prerequisites: ['Separation Chemistry', 'Metal Reduction', 'Magnet Manufacturing Equipment'],
    deloitteServices: ['OT Security for Chemical Processing', 'Supply Chain', 'DOD Partnership'],
    nextMilestone: { date: '2026-01-25', action: 'Magnet production ramp' },
    priority: 'hot',
    whyItMatters: 'Only US rare earth mine. Building full supply chain to magnets. China has 90% of refining.',
    location: 'Mountain Pass, CA',
  },
  {
    id: 'found-rare-2',
    company: 'Lynas Rare Earths',
    project: 'Texas Separation Facility',
    category: 'foundation',
    subcategory: 'Rare Earths',
    value: 500,
    prerequisites: ['Australian Ore Supply', 'Chemical Processing', 'Water/Waste Management'],
    deloitteServices: ['OT Security', 'Process Control Security', 'Environmental Compliance'],
    nextMilestone: { date: '2026-02-01', action: 'Phase 2 capacity decision' },
    priority: 'hot',
    whyItMatters: 'Only non-Chinese rare earth separation in the West. DOD funded. Defense critical.',
    location: 'Hondo, TX',
  },
  {
    id: 'found-rare-3',
    company: 'USA Rare Earth',
    project: 'Oklahoma Processing Hub',
    category: 'foundation',
    subcategory: 'Rare Earths',
    value: 200,
    prerequisites: ['Ore Supply Agreements', 'Processing Technology', 'Permits'],
    deloitteServices: ['Supply Chain Strategy', 'OT Security', 'Government Relations'],
    priority: 'warm',
    whyItMatters: 'Third US processing option. Diversifies from MP Materials dependency.',
    location: 'Stillwater, OK',
  },

  // --- WATER INFRASTRUCTURE ---
  {
    id: 'found-water-1',
    company: 'Various Data Center Operators',
    project: 'Data Center Water Recycling Systems',
    category: 'foundation',
    subcategory: 'Water Infrastructure',
    value: 2000,
    prerequisites: ['Treatment Technology', 'Local Water Agreements', 'Cooling Innovation'],
    deloitteServices: ['Sustainability Strategy', 'Water Risk Assessment', 'Technology Selection'],
    priority: 'hot',
    whyItMatters: 'AI data centers use billions of gallons. Arizona/Nevada facing water crisis. Must recycle.',
    location: 'Multiple Sites',
  },
  {
    id: 'found-water-2',
    company: 'IDE Technologies / Various',
    project: 'Desalination for Tech Hubs',
    category: 'foundation',
    subcategory: 'Water Infrastructure',
    value: 1500,
    prerequisites: ['Coastal Permits', 'Energy Supply', 'Brine Disposal', 'Distribution'],
    deloitteServices: ['Project Development', 'Energy Strategy', 'Environmental'],
    priority: 'warm',
    whyItMatters: 'Desalination = water independence for coastal AI hubs. Energy intensive but necessary.',
    location: 'California / Texas Coast',
  },
  {
    id: 'found-water-3',
    company: 'Semiconductor Fabs (All)',
    project: 'Ultra-Pure Water Systems',
    category: 'foundation',
    subcategory: 'Water Infrastructure',
    value: 3000,
    prerequisites: ['Treatment Equipment', 'Recycling Systems', 'Local Water Rights'],
    deloitteServices: ['Fab Water Strategy', 'Sustainability', 'Regulatory'],
    priority: 'hot',
    whyItMatters: 'TSMC Arizona needs 4.8M gallons/day. Intel Ohio similar. Desert locations = water crisis.',
    location: 'AZ, OH, TX',
  },

  // --- GRID & TRANSMISSION ---
  {
    id: 'found-grid-1',
    company: 'Various Utilities / FERC',
    project: 'AI Data Center Grid Connections',
    category: 'foundation',
    subcategory: 'Grid Infrastructure',
    value: 5000,
    prerequisites: ['Transmission Lines', 'Substation Capacity', 'Interconnection Queue'],
    deloitteServices: ['Grid Strategy', 'Utility Partnership', 'Regulatory'],
    priority: 'hot',
    whyItMatters: 'AI data centers need 1-2GW each. Grid connection queue = 5+ years. Bottleneck.',
    location: 'National',
  },
  {
    id: 'found-grid-2',
    company: 'PJM / ERCOT / CAISO',
    project: 'Grid Operator AI Integration',
    category: 'foundation',
    subcategory: 'Grid Infrastructure',
    value: 500,
    prerequisites: ['AI/ML Platforms', 'Sensor Networks', 'Cybersecurity Upgrades'],
    deloitteServices: ['Grid OT Security', 'AI Integration Security', 'NERC CIP'],
    nextMilestone: { date: '2026-02-10', action: 'AI forecasting pilot' },
    priority: 'warm',
    whyItMatters: 'AI to optimize the grid that powers AI. Ironic but necessary. Prevents blackouts.',
    location: 'Multiple RTOs',
  },
  {
    id: 'found-grid-3',
    company: 'DOE / National Labs',
    project: 'HVDC Transmission Backbone',
    category: 'foundation',
    subcategory: 'Grid Infrastructure',
    value: 10000,
    prerequisites: ['Route Permitting', 'Converter Stations', 'Land Rights'],
    deloitteServices: ['Program Management', 'Stakeholder Engagement', 'Regulatory'],
    priority: 'warm',
    whyItMatters: 'Move renewable power from where it\'s generated to where AI needs it. Critical.',
    location: 'National (Midwest to Coasts)',
  },

  // --- BATTERY MATERIALS ---
  {
    id: 'found-battery-1',
    company: 'Albemarle',
    project: 'Kings Mountain Lithium Expansion',
    category: 'foundation',
    subcategory: 'Battery Materials',
    value: 1300,
    prerequisites: ['Mining Permits', 'Processing Technology', 'Water Management'],
    deloitteServices: ['OT Security', 'Environmental', 'Supply Chain'],
    nextMilestone: { date: '2026-03-01', action: 'Production ramp' },
    priority: 'hot',
    whyItMatters: 'Domestic lithium = battery independence. China processes 65% of global lithium.',
    location: 'Kings Mountain, NC',
  },
  {
    id: 'found-battery-2',
    company: 'Redwood Materials',
    project: 'Nevada Battery Recycling Campus',
    category: 'foundation',
    subcategory: 'Battery Materials',
    value: 3500,
    prerequisites: ['Collection Network', 'Processing Technology', 'Offtake Agreements'],
    deloitteServices: ['Circular Economy Strategy', 'OT Security', 'Supply Chain'],
    priority: 'hot',
    whyItMatters: 'Recycle EV batteries → new battery materials. Reduces virgin mining need. JB Straubel (Tesla).',
    location: 'McCarran, NV',
  },
  {
    id: 'found-battery-3',
    company: 'Ford / SK On',
    project: 'BlueOval SK Battery Parks',
    category: 'foundation',
    subcategory: 'Battery Manufacturing',
    value: 11400,
    prerequisites: ['Cathode/Anode Materials', 'Separator Supply', 'Workforce Training'],
    deloitteServices: ['Commissioning OT Security', 'Workforce Planning', 'Supply Chain'],
    priority: 'hot',
    whyItMatters: 'Massive battery production for EVs. Korean JV. 3 plants across KY/TN.',
    location: 'Kentucky / Tennessee',
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const formatValue = (millions: number) => {
  if (millions >= 1000) return '$' + (millions / 1000).toFixed(1) + 'B'
  return '$' + millions + 'M'
}

const getCategoryLabel = (cat: Category) => {
  switch (cat) {
    case 'heart': return 'The Heart'
    case 'brain': return 'The Brain'
    case 'foundation': return 'The Foundation'
  }
}

const getCategoryDescription = (cat: Category) => {
  switch (cat) {
    case 'heart': return 'Civilizational problems AI will solve'
    case 'brain': return 'AI infrastructure'
    case 'foundation': return 'Prerequisites that make it all work'
  }
}

const getCategoryColor = (cat: Category) => {
  switch (cat) {
    case 'heart': return '#f472b6'
    case 'brain': return '#60a5fa'
    case 'foundation': return '#fbbf24'
  }
}

const getPriorityColor = (p: Priority) => {
  switch (p) {
    case 'hot': return '#ef4444'
    case 'warm': return '#f59e0b'
    case 'tracking': return '#6b7280'
  }
}

const isThisWeek = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return date >= now && date <= weekFromNow
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BuildClockRadar() {
  const [filter, setFilter] = useState<'this-week' | 'hot' | 'all' | Category | string>('hot')
  const [selected, setSelected] = useState<Opportunity | null>(null)
  const [search, setSearch] = useState('')

  // Get unique subcategories
  const subcategories = useMemo(() => {
    const subs = new Set<string>()
    opportunities.forEach(o => subs.add(o.subcategory))
    return Array.from(subs).sort()
  }, [])

  const filtered = useMemo(() => {
    let result = [...opportunities]

    // Apply category/priority filter
    switch (filter) {
      case 'this-week':
        result = result.filter(o => o.nextMilestone && isThisWeek(o.nextMilestone.date))
        break
      case 'hot':
        result = result.filter(o => o.priority === 'hot')
        break
      case 'heart':
      case 'brain':
      case 'foundation':
        result = result.filter(o => o.category === filter)
        break
      case 'all':
        break
      default:
        // Subcategory filter
        result = result.filter(o => o.subcategory === filter)
    }

    // Apply search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        o.company.toLowerCase().includes(q) ||
        o.project.toLowerCase().includes(q) ||
        o.subcategory.toLowerCase().includes(q) ||
        o.whyItMatters.toLowerCase().includes(q)
      )
    }

    return result
  }, [filter, search])

  const stats = {
    thisWeek: opportunities.filter(o => o.nextMilestone && isThisWeek(o.nextMilestone.date)).length,
    hot: opportunities.filter(o => o.priority === 'hot').length,
    heart: opportunities.filter(o => o.category === 'heart').length,
    brain: opportunities.filter(o => o.category === 'brain').length,
    foundation: opportunities.filter(o => o.category === 'foundation').length,
    total: opportunities.length,
    totalValue: opportunities.reduce((sum, o) => sum + o.value, 0),
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🇺🇸 Build Clock</h1>
          <p style={styles.subtitle}>AI Manhattan Project — Opportunity Radar</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.headerStat}>
            <div style={styles.headerStatValue}>{formatValue(stats.totalValue)}</div>
            <div style={styles.headerStatLabel}>Total Pipeline</div>
          </div>
          <div style={styles.headerStat}>
            <div style={styles.headerStatValue}>{stats.total}</div>
            <div style={styles.headerStatLabel}>Opportunities</div>
          </div>
        </div>
      </header>

      {/* Thesis */}
      <div style={styles.thesis}>
        <strong style={{ color: getCategoryColor('heart') }}>The Heart</strong> solves civilizational problems.{' '}
        <strong style={{ color: getCategoryColor('brain') }}>The Brain</strong> runs the AI.{' '}
        <strong style={{ color: getCategoryColor('foundation') }}>The Foundation</strong> makes it all work.
      </div>

      {/* Search */}
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search companies, projects, or themes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button
          style={{ ...styles.filterBtn, ...(filter === 'this-week' ? styles.filterActive : {}) }}
          onClick={() => setFilter('this-week')}
        >
          📅 This Week ({stats.thisWeek})
        </button>
        <button
          style={{ ...styles.filterBtn, ...(filter === 'hot' ? styles.filterActive : {}) }}
          onClick={() => setFilter('hot')}
        >
          🔥 Hot ({stats.hot})
        </button>
        <button
          style={{ ...styles.filterBtn, ...(filter === 'heart' ? { ...styles.filterActive, borderColor: getCategoryColor('heart') } : {}) }}
          onClick={() => setFilter('heart')}
        >
          ❤️ Heart ({stats.heart})
        </button>
        <button
          style={{ ...styles.filterBtn, ...(filter === 'brain' ? { ...styles.filterActive, borderColor: getCategoryColor('brain') } : {}) }}
          onClick={() => setFilter('brain')}
        >
          🧠 Brain ({stats.brain})
        </button>
        <button
          style={{ ...styles.filterBtn, ...(filter === 'foundation' ? { ...styles.filterActive, borderColor: getCategoryColor('foundation') } : {}) }}
          onClick={() => setFilter('foundation')}
        >
          🔧 Foundation ({stats.foundation})
        </button>
        <button
          style={{ ...styles.filterBtn, ...(filter === 'all' ? styles.filterActive : {}) }}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
      </div>

      {/* Subcategory Pills */}
      <div style={styles.subcategoryRow}>
        {subcategories.map(sub => (
          <button
            key={sub}
            style={{
              ...styles.subcategoryPill,
              ...(filter === sub ? styles.subcategoryActive : {}),
            }}
            onClick={() => setFilter(filter === sub ? 'all' : sub)}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* List */}
        <div style={styles.list}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>No opportunities match this filter</div>
          ) : (
            filtered.map(opp => (
              <div
                key={opp.id}
                style={{
                  ...styles.card,
                  borderLeftColor: getCategoryColor(opp.category),
                  ...(selected?.id === opp.id ? styles.cardSelected : {}),
                }}
                onClick={() => setSelected(opp)}
              >
                {opp.nextMilestone && isThisWeek(opp.nextMilestone.date) && (
                  <div style={styles.thisWeekBadge}>THIS WEEK</div>
                )}
                <div style={styles.cardHeader}>
                  <div style={styles.cardCompany}>{opp.company}</div>
                  <div style={{ ...styles.cardPriority, color: getPriorityColor(opp.priority) }}>
                    {opp.priority.toUpperCase()}
                  </div>
                </div>
                <div style={styles.cardProject}>{opp.project}</div>
                <div style={styles.cardMeta}>
                  <span style={{ color: getCategoryColor(opp.category) }}>{opp.subcategory}</span>
                  <span>•</span>
                  <span>{formatValue(opp.value)}</span>
                  {opp.location && (
                    <>
                      <span>•</span>
                      <span>{opp.location}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div style={styles.detail}>
          {selected ? (
            <>
              <div style={styles.detailCategory}>
                <span style={{ color: getCategoryColor(selected.category) }}>
                  {getCategoryLabel(selected.category)}
                </span>
                <span style={styles.detailSubcategory}>{selected.subcategory}</span>
              </div>

              <h2 style={styles.detailCompany}>{selected.company}</h2>
              <h3 style={styles.detailProject}>{selected.project}</h3>
              <div style={styles.detailValue}>{formatValue(selected.value)}</div>
              {selected.location && (
                <div style={styles.detailLocation}>📍 {selected.location}</div>
              )}

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Why It Matters</div>
                <div style={styles.detailText}>{selected.whyItMatters}</div>
              </div>

              {selected.nextMilestone && (
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Next Milestone</div>
                  <div style={styles.milestone}>
                    <div style={styles.milestoneDate}>
                      {new Date(selected.nextMilestone.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                      })}
                    </div>
                    <div>{selected.nextMilestone.action}</div>
                  </div>
                </div>
              )}

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>⚠️ Prerequisites</div>
                <div style={styles.prereqList}>
                  {selected.prerequisites.map((p, i) => (
                    <div key={i} style={styles.prereqItem}>→ {p}</div>
                  ))}
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>🎯 Deloitte Services</div>
                <div style={styles.serviceList}>
                  {selected.deloitteServices.map((s, i) => (
                    <span key={i} style={styles.serviceTag}>{s}</span>
                  ))}
                </div>
              </div>

              {selected.contacts && selected.contacts.length > 0 && (
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Key Contacts</div>
                  <div style={styles.detailText}>{selected.contacts.join(', ')}</div>
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyDetail}>
              <div style={styles.emptyIcon}>👈</div>
              <div>Select an opportunity</div>
              <div style={styles.emptyHint}>
                See why it matters, prerequisites, and Deloitte services
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STYLES
// ============================================================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e5e5e5',
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#737373',
    margin: 0,
  },
  headerStats: {
    display: 'flex',
    gap: '1.5rem',
  },
  headerStat: {
    textAlign: 'right',
  },
  headerStatValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#22c55e',
    fontFamily: "'JetBrains Mono', monospace",
  },
  headerStatLabel: {
    fontSize: '0.625rem',
    color: '#525252',
    textTransform: 'uppercase',
  },
  thesis: {
    padding: '0.75rem 1rem',
    backgroundColor: '#171717',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#a3a3a3',
    borderLeft: '3px solid #3b82f6',
  },
  searchRow: {
    marginBottom: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    backgroundColor: '#171717',
    border: '1px solid #262626',
    borderRadius: '6px',
    color: '#e5e5e5',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.5rem 0.875rem',
    backgroundColor: '#171717',
    border: '1px solid #262626',
    borderRadius: '6px',
    color: '#737373',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  filterActive: {
    backgroundColor: '#1f1f1f',
    borderColor: '#3b82f6',
    color: '#e5e5e5',
  },
  subcategoryRow: {
    display: 'flex',
    gap: '0.375rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  subcategoryPill: {
    padding: '0.25rem 0.625rem',
    backgroundColor: 'transparent',
    border: '1px solid #262626',
    borderRadius: '999px',
    color: '#525252',
    fontSize: '0.6875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  subcategoryActive: {
    backgroundColor: '#262626',
    color: '#e5e5e5',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(400px, 1fr) 380px',
    gap: '1.5rem',
    alignItems: 'start',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
    maxHeight: 'calc(100vh - 320px)',
    overflowY: 'auto',
  },
  empty: {
    padding: '3rem',
    textAlign: 'center',
    color: '#404040',
  },
  card: {
    padding: '0.875rem 1rem',
    backgroundColor: '#171717',
    borderRadius: '6px',
    borderLeft: '4px solid',
    cursor: 'pointer',
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: '#1f1f1f',
    outline: '1px solid #3b82f6',
  },
  thisWeekBadge: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#f59e0b',
    color: '#000',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: 700,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.125rem',
  },
  cardCompany: {
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  cardPriority: {
    fontSize: '0.5625rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  cardProject: {
    fontSize: '0.8125rem',
    color: '#a3a3a3',
    marginBottom: '0.375rem',
  },
  cardMeta: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    color: '#525252',
  },
  detail: {
    width: '380px',
    flexShrink: 0,
    padding: '1.25rem',
    backgroundColor: '#171717',
    borderRadius: '8px',
    position: 'sticky',
    top: '1.5rem',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
  },
  detailCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
  },
  detailSubcategory: {
    color: '#525252',
    fontWeight: 400,
  },
  detailCompany: {
    fontSize: '1.125rem',
    fontWeight: 700,
    margin: 0,
    marginBottom: '0.125rem',
  },
  detailProject: {
    fontSize: '0.875rem',
    color: '#a3a3a3',
    margin: 0,
    marginBottom: '0.5rem',
    fontWeight: 400,
  },
  detailValue: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: '#22c55e',
    marginBottom: '0.25rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  detailLocation: {
    fontSize: '0.75rem',
    color: '#525252',
    marginBottom: '1rem',
  },
  detailSection: {
    marginBottom: '1rem',
  },
  detailLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#525252',
    marginBottom: '0.375rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailText: {
    fontSize: '0.8125rem',
    color: '#d4d4d4',
    lineHeight: 1.5,
  },
  milestone: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.8125rem',
  },
  milestoneDate: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#262626',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#f59e0b',
  },
  prereqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  prereqItem: {
    fontSize: '0.8125rem',
    color: '#fbbf24',
  },
  serviceList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  serviceTag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#1e3a5f',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    color: '#60a5fa',
  },
  emptyDetail: {
    textAlign: 'center',
    color: '#404040',
    padding: '3rem 1rem',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
  },
  emptyHint: {
    fontSize: '0.6875rem',
    marginTop: '0.375rem',
    color: '#333',
  },
}
