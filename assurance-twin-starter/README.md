# Assurance Twin - Genesis Assurance Layer

**The truth layer that prevents AI from acting on fiction.**

Assurance Twin is the Genesis Assurance Layer that makes reality legible before it can be changed safely. It provides continuous discovery of what actually exists, verification of how systems really behave, and explicit tracking of uncertainty and blind spots.

> **Genesis Mission:** No irreversible decision is made without an explicit, evidence-backed assurance of readiness — or a documented acknowledgment of uncertainty.

See [GENESIS_MISSION.md](./GENESIS_MISSION.md) for the complete mission statement and principles.

---

## What It Does

1. **Asset Canonization** - Merges all data sources (engineering, network, compliance, operations) into single source of truth
2. **Gap Identification** - Finds blind spots, shadow OT, orphaned assets
3. **System Mapping** - Maps dependencies, critical paths, failure impacts
4. **Assurance Judgment** - Provides Ready/Not Ready, Safe/Unsafe, Scalable/Non-scalable assessments with:
   - **Evidence Chains** - Explicit, defensible evidence for every judgment
   - **Dissent Tracking** - Reasons for dissent when judgments are contested
   - **Uncertainty Inventory** - First-class tracking of what is not yet knowable
5. **Continuous Discovery** - Tracks discovery over time and detects reality drift
6. **Digital Twin** - Creates real-time system state for AI training

---

## Architecture

```
assurance-twin/
├── backend/          # Python API (FastAPI)
│   ├── canonization/ # Core canonization logic
│   ├── data_sources/ # Connectors (engineering, network, compliance)
│   └── api/          # REST API
├── frontend/         # Next.js dashboard
│   └── app/          # Pages and components
├── database/         # Schema and migrations
└── docs/            # Documentation
```

---

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

```bash
# SQLite for development (or PostgreSQL for production)
python backend/database/init_db.py
```

---

## Core Concepts

### Asset Canonization

Merges multiple data sources into a single canonical asset list:
- Engineering data (P&IDs, asset registers, CMMS)
- Network discovery (Claroty, Dragos, Nozomi)
- Compliance inventories
- Real-time operational data

### Gap Analysis

Identifies:
- **Blind spots:** In engineering but not on network
- **Shadow OT:** On network but not in engineering
- **Orphaned assets:** In compliance but nowhere else
- **Data conflicts:** Engineering says X, network says Y

### Assurance Judgment

Provides decision-grade outputs with explicit evidence chains:
- **Ready / Not Ready** - Evidence-backed readiness assessment
  - Evidence chains with source attribution
  - Dissent tracking for contested judgments
  - Explicit acknowledgment of uncertainty
- **Safe / Unsafe** - Safety assessment with confidence levels
  - Unknown asset risk assessment
  - Unverified behavior tracking
- **Scalable / Non-scalable** - Scalability assessment with constraints
  - Blind spot impact analysis
  - Dependency constraint identification
- **Known / Unknown Risk** - Risk assessment with uncertainty inventory
  - **Uncertainty as first-class risk** - Not a rounding error
  - Explicit inventory of what is not yet knowable
  - Severity-based uncertainty categorization

### Continuous Discovery & Reality Drift

Genesis principle: **Continuous discovery of what actually exists and detection of drift between plan and reality.**

- Discovery snapshots over time
- Reality drift detection (plan vs. reality divergence)
- Documentation drift tracking
- Behavior change detection

---

## API Endpoints

- `POST /api/canonize` - Canonize assets from multiple sources
- `GET /api/assets` - Get canonical asset list
- `GET /api/gaps` - Get gap analysis
- `GET /api/assurance` - Get assurance judgment with evidence chains and dissent
- `GET /api/dependencies` - Get system dependency map
- `GET /api/discovery` - Get continuous discovery tracking and reality drift
- `GET /api/uncertainty` - Get explicit uncertainty inventory

---

## License

Private - Internal Use Only








