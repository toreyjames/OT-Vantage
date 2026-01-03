# Getting Started with Genesis Assurance Layer

Welcome! This guide will help you understand what you have and how to use it.

## What You Have

The **Genesis Assurance Layer** is a complete implementation of the truth layer that prevents AI from acting on fiction. It includes:

✅ **Asset Canonization** - Merges multiple data sources into single source of truth  
✅ **Assurance Assessment** - Decision-grade judgments with evidence chains  
✅ **Uncertainty Tracking** - First-class risk management  
✅ **Continuous Discovery** - Tracks reality over time  
✅ **Reality Drift Detection** - Detects when plan diverges from reality  
✅ **Decision Gates** - Enforces Genesis principles before irreversible actions  

## Quick Start (10 minutes)

### 1. Read the Mission
Start here: [`GENESIS_MISSION.md`](./GENESIS_MISSION.md)

This explains **why** this layer exists and what problem it solves.

### 2. Run the Example
```bash
# Start backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn api.main:app --reload

# In another terminal, run example
cd backend
python examples/full_workflow_example.py
```

This shows you **how it works** in practice.

### 3. Review Implementation Guide
Read: [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)

This shows you **how to implement** it in your systems.

## Documentation Structure

```
assurance-twin-starter/
├── GENESIS_MISSION.md          # Mission statement and principles
├── GENESIS_ALIGNMENT.md        # How implementation aligns with mission
├── IMPLEMENTATION_GUIDE.md     # Comprehensive implementation guide
├── QUICK_IMPLEMENTATION.md     # Condensed quick start
├── GETTING_STARTED.md          # This file
├── README.md                   # Project overview
├── QUICK_START.md              # Technical setup
└── backend/
    ├── examples/
    │   └── full_workflow_example.py  # Complete workflow demo
    └── ...
```

## Key Concepts

### 1. Asset Canonization
Merges engineering, network, compliance, and operations data into one truth.

**Why:** Different systems have different views. We need one canonical view.

### 2. Assurance Judgment
Provides Ready/Not Ready, Safe/Unsafe, Scalable/Non-scalable with evidence.

**Why:** Decisions need defensible evidence, not assumptions.

### 3. Uncertainty as First-Class Risk
Explicitly tracks what is not yet knowable.

**Why:** Ignorance is a risk, not a rounding error. It must be acknowledged.

### 4. Continuous Discovery
Tracks discovery over time and detects changes.

**Why:** Reality changes. We must keep discovering.

### 5. Decision Gates
Enforces: "No irreversible decision without explicit assurance."

**Why:** Prevents confident error at scale.

## Implementation Path

### Phase 1: Understand (1 hour)
1. Read `GENESIS_MISSION.md`
2. Run `examples/full_workflow_example.py`
3. Review `GENESIS_ALIGNMENT.md`

### Phase 2: Test (2 hours)
1. Set up environment
2. Test with sample data
3. Explore API endpoints
4. Review assurance outputs

### Phase 3: Integrate (varies)
1. Connect your data sources
2. Integrate decision gates
3. Set up continuous discovery
4. Configure monitoring

See `IMPLEMENTATION_GUIDE.md` for detailed steps.

## Common Use Cases

### Use Case 1: Pre-AI Action Check
**Scenario:** AI wants to optimize a system.

**Implementation:**
```python
assurance = engine.assess_assurance()
if assurance.readiness.status.value != "ready":
    # Block AI action
    return {"blocked": True, "reason": assurance.readiness.gaps}
```

### Use Case 2: Capital Commitment Gate
**Scenario:** Committing capital to infrastructure.

**Implementation:**
```python
assurance = engine.assess_assurance()
if assurance.readiness.confidence < 0.8:
    raise Exception("Capital commitment blocked: Low confidence")
```

### Use Case 3: Continuous Monitoring
**Scenario:** Monitor system state over time.

**Implementation:**
```python
# Run every hour
snapshot = engine.create_discovery_snapshot()
discovery = engine.get_continuous_discovery()

# Check for drift
if discovery.drift_detected:
    alert_on_drift(discovery.drift_detected)
```

## API Endpoints

- `GET /api/assurance` - Get assurance judgment with evidence chains
- `GET /api/discovery` - Get continuous discovery tracking
- `GET /api/uncertainty` - Get uncertainty inventory
- `POST /api/canonize` - Canonize assets from sources
- `GET /api/gaps` - Get gap analysis

See `IMPLEMENTATION_GUIDE.md` for detailed API usage.

## Next Steps

1. **Understand the Mission** - Read `GENESIS_MISSION.md`
2. **See It Work** - Run `examples/full_workflow_example.py`
3. **Learn to Implement** - Read `IMPLEMENTATION_GUIDE.md`
4. **Connect Your Data** - Follow integration patterns
5. **Deploy** - Set up production environment

## Support

- **Mission Questions:** See `GENESIS_MISSION.md`
- **Implementation Questions:** See `IMPLEMENTATION_GUIDE.md`
- **Code Examples:** See `backend/examples/`
- **API Reference:** See `backend/api/main.py`

## Remember

**Genesis Principle:**
> "No irreversible decision is made without an explicit, evidence-backed assurance of readiness — or a documented acknowledgment of uncertainty."

The Assurance Layer enforces this principle. Use it to prevent AI and capital from acting on fiction.

---

**Reality must be made legible before it can be changed safely.**

This is what the Genesis Assurance Layer does.


