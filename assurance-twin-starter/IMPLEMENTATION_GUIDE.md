# Genesis Assurance Layer - Implementation Guide

This guide explains how to implement and use the Genesis Assurance Layer in practice.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Workflow](#core-workflow)
3. [Integration Patterns](#integration-patterns)
4. [Real-World Scenarios](#real-world-scenarios)
5. [Decision Gate Integration](#decision-gate-integration)
6. [Connecting Real Data Sources](#connecting-real-data-sources)
7. [Production Deployment](#production-deployment)

---

## Quick Start

### 1. Setup Environment

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Initialize Database

```bash
cd backend
python database/init_db.py
```

### 3. Start Services

```bash
# Terminal 1: Backend
cd backend
uvicorn api.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 4. Test the System

```bash
# Health check
curl http://localhost:8000/api/health

# Get initial assurance (will show default/empty state)
curl http://localhost:8000/api/assurance
```

---

## Core Workflow

### Step 1: Canonize Assets from Multiple Sources

The system merges data from engineering, network discovery, compliance, and operations into a single source of truth.

```python
from backend.canonization.models import Asset, DataSource, DataSourceType, AssetType, AssetStatus
from backend.canonization.engine import CanonizationEngine

# Initialize engine
engine = CanonizationEngine()

# Example: Engineering data (from P&IDs, CMMS)
engineering_assets = [
    Asset(
        id="eng_plc_001",
        name="Main Process Controller",
        asset_type=AssetType.PLC,
        source=DataSourceType.ENGINEERING,
        source_id="PLC-001",
        location="Building A, Floor 2",
        vendor="Siemens",
        model="S7-1500",
        status=AssetStatus.ACTIVE
    ),
    Asset(
        id="eng_hmi_001",
        name="Operator Station 1",
        asset_type=AssetType.HMI,
        source=DataSourceType.ENGINEERING,
        source_id="HMI-001",
        location="Control Room",
        vendor="Siemens",
        model="TP700",
        status=AssetStatus.ACTIVE
    )
]

# Example: Network discovery data (from Claroty, Dragos, etc.)
network_assets = [
    Asset(
        id="net_192_168_1_100",
        name="192.168.1.100",
        asset_type=AssetType.PLC,
        source=DataSourceType.NETWORK,
        source_id="192.168.1.100",
        ip_address="192.168.1.100",
        mac_address="00:1B:44:11:3A:B7",
        vendor="Siemens",
        model="S7-1500",
        status=AssetStatus.ACTIVE
    ),
    # Shadow OT: Device on network but not in engineering
    Asset(
        id="net_192_168_1_101",
        name="192.168.1.101",
        asset_type=AssetType.OTHER,
        source=DataSourceType.NETWORK,
        source_id="192.168.1.101",
        ip_address="192.168.1.101",
        mac_address="00:1B:44:11:3A:B8",
        status=AssetStatus.ACTIVE
    )
]

# Canonize
sources = [
    DataSource(source_type=DataSourceType.ENGINEERING, assets=engineering_assets),
    DataSource(source_type=DataSourceType.NETWORK, assets=network_assets)
]

result = engine.canonize(sources)

print(f"Canonized {len(result.canonized_assets)} assets")
print(f"Blind spots: {len(result.gaps.blind_spots)}")
print(f"Shadow OT: {len(result.gaps.shadow_ot)}")
```

### Step 2: Assess Assurance

Get decision-grade assurance judgments with evidence chains.

```python
# Assess assurance
assurance = engine.assess_assurance()

# Check readiness
print(f"Readiness: {assurance.readiness.status}")
print(f"Confidence: {assurance.readiness.confidence:.2%}")

# View evidence chain
if assurance.readiness.evidence_chain:
    print("\nEvidence Chain:")
    for link in assurance.readiness.evidence_chain.links:
        print(f"  - {link.description} (confidence: {link.confidence:.2%})")
    print(f"\nConclusion: {assurance.readiness.evidence_chain.conclusion}")

# Check for dissent
if assurance.readiness.dissent:
    print("\n⚠️  DISSENT RAISED:")
    for dissent in assurance.readiness.dissent:
        print(f"  - {dissent.reason} (severity: {dissent.severity})")

# Check uncertainty
print(f"\nUncertainty Inventory:")
print(f"  Critical: {assurance.risk.uncertainty.critical_count}")
print(f"  High: {assurance.risk.uncertainty.high_count}")
print(f"  Total items: {len(assurance.risk.uncertainty.items)}")
```

### Step 3: Make Decision with Assurance Gate

**Genesis Principle:** No irreversible decision without explicit assurance or documented uncertainty.

```python
def make_decision_with_assurance(decision_type: str):
    """
    Decision gate that enforces Genesis assurance principle.
    """
    assurance = engine.assess_assurance()
    
    # Check readiness
    if assurance.readiness.status.value == "not_ready":
        if not assurance.readiness.uncertainty_acknowledged:
            raise Exception(
                f"DECISION BLOCKED: System not ready. "
                f"Uncertainty must be explicitly acknowledged before proceeding. "
                f"Gaps: {assurance.readiness.gaps}"
            )
    
    # Check for critical dissent
    critical_dissent = [d for d in assurance.readiness.dissent if d.severity == "critical"]
    if critical_dissent:
        raise Exception(
            f"DECISION BLOCKED: Critical dissent raised. "
            f"Reasons: {[d.reason for d in critical_dissent]}"
        )
    
    # Check uncertainty threshold
    if assurance.risk.uncertainty.critical_count > 0:
        raise Exception(
            f"DECISION BLOCKED: {assurance.risk.uncertainty.critical_count} critical uncertainties. "
            f"Must be resolved or acknowledged before proceeding."
        )
    
    # Decision approved
    print(f"✅ Decision approved: {decision_type}")
    print(f"   Readiness: {assurance.readiness.status.value}")
    print(f"   Confidence: {assurance.readiness.confidence:.2%}")
    print(f"   Evidence: {len(assurance.readiness.evidence_chain.links)} links")
    
    return True

# Example usage
try:
    make_decision_with_assurance("Deploy AI optimization")
except Exception as e:
    print(f"❌ {e}")
```

---

## Integration Patterns

### Pattern 1: API Integration (REST)

```python
import requests

API_BASE = "http://localhost:8000"

# 1. Canonize assets
def canonize_assets(sources_data):
    response = requests.post(
        f"{API_BASE}/api/canonize",
        json=[source.dict() for source in sources_data]
    )
    return response.json()

# 2. Get assurance
def get_assurance():
    response = requests.get(f"{API_BASE}/api/assurance")
    return response.json()

# 3. Check if ready for decision
def is_ready_for_decision():
    assurance = get_assurance()
    readiness = assurance["assurance"]["readiness"]
    
    if readiness["status"] != "ready":
        return False, readiness["gaps"]
    
    if readiness["uncertainty_acknowledged"] == False:
        return False, "Uncertainty not acknowledged"
    
    if len(readiness["dissent"]) > 0:
        return False, readiness["dissent"]
    
    return True, readiness

# Usage
assurance = get_assurance()
ready, reason = is_ready_for_decision()

if ready:
    print("✅ System ready for AI-driven action")
else:
    print(f"❌ System not ready: {reason}")
```

### Pattern 2: Continuous Monitoring

```python
import time
from datetime import datetime

def continuous_discovery_loop(interval_seconds=3600):
    """
    Continuous discovery loop that runs periodically.
    Genesis principle: Continuous discovery of what actually exists.
    """
    while True:
        print(f"\n[{datetime.now()}] Running discovery cycle...")
        
        # 1. Fetch latest data from all sources
        sources = fetch_all_data_sources()
        
        # 2. Canonize
        result = engine.canonize(sources)
        
        # 3. Create snapshot (automatically detects drift)
        snapshot = engine.create_discovery_snapshot()
        
        # 4. Get drift events
        discovery = engine.get_continuous_discovery()
        recent_drift = [d for d in discovery.drift_detected if not d.acknowledged]
        
        if recent_drift:
            print(f"⚠️  {len(recent_drift)} unacknowledged drift events detected")
            for drift in recent_drift:
                print(f"   - {drift.description} (severity: {drift.severity})")
        
        # 5. Assess assurance
        assurance = engine.assess_assurance()
        print(f"Readiness: {assurance.readiness.status.value} "
              f"(confidence: {assurance.readiness.confidence:.2%})")
        
        # 6. Alert if critical issues
        if assurance.risk.uncertainty.critical_count > 0:
            send_alert(f"Critical uncertainty: {assurance.risk.uncertainty.critical_count} items")
        
        time.sleep(interval_seconds)

# Run in background
# continuous_discovery_loop(interval_seconds=3600)  # Every hour
```

### Pattern 3: Pre-Decision Assurance Check

```python
def pre_decision_assurance_check(decision_context: dict) -> dict:
    """
    Pre-decision assurance check that must pass before any irreversible action.
    
    Genesis principle: No irreversible decision without explicit assurance.
    """
    assurance = engine.assess_assurance()
    
    check_result = {
        "approved": False,
        "reason": None,
        "evidence_chain": None,
        "uncertainty_acknowledged": False,
        "dissent": []
    }
    
    # Check 1: Readiness
    if assurance.readiness.status.value != "ready":
        check_result["reason"] = f"System not ready: {assurance.readiness.gaps}"
        check_result["evidence_chain"] = assurance.readiness.evidence_chain.dict() if assurance.readiness.evidence_chain else None
        return check_result
    
    # Check 2: Safety
    if assurance.safety.status.value != "safe":
        check_result["reason"] = f"System unsafe: {assurance.safety.risks}"
        return check_result
    
    # Check 3: Uncertainty acknowledgment
    if not assurance.readiness.uncertainty_acknowledged:
        check_result["reason"] = "Uncertainty not explicitly acknowledged"
        check_result["uncertainty_acknowledged"] = False
        return check_result
    
    # Check 4: Critical dissent
    critical_dissent = [d for d in assurance.readiness.dissent if d.severity == "critical"]
    if critical_dissent:
        check_result["reason"] = "Critical dissent raised"
        check_result["dissent"] = [d.dict() for d in critical_dissent]
        return check_result
    
    # Check 5: Critical uncertainty
    if assurance.risk.uncertainty.critical_count > 0:
        check_result["reason"] = f"{assurance.risk.uncertainty.critical_count} critical uncertainties"
        return check_result
    
    # Approved
    check_result["approved"] = True
    check_result["evidence_chain"] = assurance.readiness.evidence_chain.dict() if assurance.readiness.evidence_chain else None
    check_result["uncertainty_acknowledged"] = True
    
    return check_result

# Usage in decision system
def execute_ai_optimization(optimization_params):
    # Pre-decision check
    check = pre_decision_assurance_check({"action": "ai_optimization"})
    
    if not check["approved"]:
        raise Exception(f"Decision blocked: {check['reason']}")
    
    # Proceed with optimization
    print("✅ Assurance check passed, proceeding with optimization")
    # ... execute optimization ...
```

---

## Real-World Scenarios

### Scenario 1: Energy Grid Optimization

**Context:** AI wants to optimize grid load distribution.

```python
# 1. Canonize grid assets
grid_sources = [
    DataSource(
        source_type=DataSourceType.ENGINEERING,
        assets=get_engineering_assets_from_cmmss()
    ),
    DataSource(
        source_type=DataSourceType.NETWORK,
        assets=get_network_assets_from_claroty()
    ),
    DataSource(
        source_type=DataSourceType.OPERATIONS,
        assets=get_operational_assets_from_scada()
    )
]

result = engine.canonize(grid_sources)

# 2. Assess assurance
assurance = engine.assess_assurance()

# 3. Decision gate
if assurance.readiness.status.value == "ready":
    if assurance.risk.uncertainty.critical_count == 0:
        print("✅ Grid ready for AI optimization")
        # Proceed with optimization
    else:
        print(f"❌ {assurance.risk.uncertainty.critical_count} critical uncertainties")
        # Block optimization, require acknowledgment
else:
    print(f"❌ Grid not ready: {assurance.readiness.gaps}")
    # Block optimization
```

### Scenario 2: Manufacturing Line Deployment

**Context:** Deploying new AI-driven quality control system.

```python
# 1. Continuous discovery before deployment
for i in range(7):  # 7 days of discovery
    sources = fetch_all_sources()
    result = engine.canonize(sources)
    snapshot = engine.create_discovery_snapshot()
    time.sleep(86400)  # 24 hours

# 2. Check for stability (no drift)
discovery = engine.get_continuous_discovery()
recent_drift = [d for d in discovery.drift_detected[-7:] if not d.acknowledged]

if recent_drift:
    print(f"⚠️  {len(recent_drift)} drift events in last 7 days")
    # Require investigation before deployment

# 3. Final assurance check
assurance = engine.assess_assurance()

if (assurance.readiness.status.value == "ready" and 
    assurance.safety.status.value == "safe" and
    len(recent_drift) == 0):
    print("✅ Manufacturing line ready for AI deployment")
else:
    print("❌ Deployment blocked - resolve issues first")
```

### Scenario 3: Infrastructure Capital Commitment

**Context:** Committing capital to infrastructure build-out.

```python
# Genesis principle: Capital flows only where readiness is proven

def capital_commitment_gate(commitment_amount: float, project_id: str):
    """
    Capital commitment gate that requires explicit assurance.
    """
    assurance = engine.assess_assurance()
    
    # Required evidence
    evidence_required = {
        "readiness": assurance.readiness.evidence_chain is not None,
        "safety": assurance.safety.evidence_chain is not None,
        "scalability": assurance.scalability.evidence_chain is not None,
        "uncertainty_acknowledged": assurance.readiness.uncertainty_acknowledged
    }
    
    if not all(evidence_required.values()):
        missing = [k for k, v in evidence_required.items() if not v]
        raise Exception(f"Capital commitment blocked: Missing evidence for {missing}")
    
    # Check thresholds
    if assurance.readiness.confidence < 0.8:
        raise Exception(f"Capital commitment blocked: Readiness confidence too low ({assurance.readiness.confidence:.2%})")
    
    if assurance.risk.uncertainty.critical_count > 0:
        raise Exception(f"Capital commitment blocked: {assurance.risk.uncertainty.critical_count} critical uncertainties")
    
    # Approved
    print(f"✅ Capital commitment approved: ${commitment_amount:,.0f}")
    print(f"   Project: {project_id}")
    print(f"   Readiness: {assurance.readiness.status.value} ({assurance.readiness.confidence:.2%})")
    print(f"   Evidence chains: {sum(evidence_required.values())}/4")
    
    return {
        "approved": True,
        "assurance": assurance.dict(),
        "commitment_amount": commitment_amount,
        "project_id": project_id
    }

# Usage
try:
    result = capital_commitment_gate(commitment_amount=10_000_000, project_id="infra-2024-001")
except Exception as e:
    print(f"❌ {e}")
```

---

## Decision Gate Integration

### Integration with AI Planning Systems

```python
class GenesisAssuranceGate:
    """
    Assurance gate that AI planning systems must pass through.
    """
    
    def __init__(self, engine: CanonizationEngine):
        self.engine = engine
    
    def check_before_action(self, action_type: str, action_params: dict) -> dict:
        """
        Check that must pass before AI takes any irreversible action.
        """
        assurance = self.engine.assess_assurance()
        
        # Build check result
        check = {
            "approved": False,
            "action_type": action_type,
            "assurance": {
                "readiness": assurance.readiness.status.value,
                "safety": assurance.safety.status.value,
                "confidence": assurance.readiness.confidence,
                "evidence_chain_id": assurance.readiness.evidence_chain.chain_id if assurance.readiness.evidence_chain else None
            },
            "blocking_reasons": []
        }
        
        # Check readiness
        if assurance.readiness.status.value != "ready":
            check["blocking_reasons"].append({
                "type": "readiness",
                "reason": f"System not ready: {assurance.readiness.gaps}"
            })
        
        # Check safety
        if assurance.safety.status.value != "safe":
            check["blocking_reasons"].append({
                "type": "safety",
                "reason": f"System unsafe: {assurance.safety.risks}"
            })
        
        # Check uncertainty
        if not assurance.readiness.uncertainty_acknowledged:
            check["blocking_reasons"].append({
                "type": "uncertainty",
                "reason": "Uncertainty not explicitly acknowledged"
            })
        
        # Check critical dissent
        critical_dissent = [d for d in assurance.readiness.dissent if d.severity == "critical"]
        if critical_dissent:
            check["blocking_reasons"].append({
                "type": "dissent",
                "reason": f"Critical dissent: {[d.reason for d in critical_dissent]}"
            })
        
        # Approve if no blocking reasons
        if len(check["blocking_reasons"]) == 0:
            check["approved"] = True
        
        return check

# Usage in AI system
assurance_gate = GenesisAssuranceGate(engine)

def ai_optimize_grid():
    # Check before action
    check = assurance_gate.check_before_action("grid_optimization", {})
    
    if not check["approved"]:
        # Block action, return reasons
        return {
            "action": "blocked",
            "reasons": check["blocking_reasons"],
            "assurance": check["assurance"]
        }
    
    # Proceed with optimization
    return {
        "action": "approved",
        "assurance_evidence_chain": check["assurance"]["evidence_chain_id"]
    }
```

---

## Connecting Real Data Sources

### Example: Claroty Integration

```python
import requests
from backend.canonization.models import Asset, DataSource, DataSourceType, AssetType, AssetStatus

class ClarotyConnector:
    """Connector for Claroty OT security platform."""
    
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def fetch_assets(self) -> List[Asset]:
        """Fetch assets from Claroty."""
        response = requests.get(
            f"{self.base_url}/api/v2/assets",
            headers=self.headers
        )
        data = response.json()
        
        assets = []
        for item in data.get("assets", []):
            assets.append(Asset(
                id=f"claroty_{item['id']}",
                name=item.get("name", item.get("ip_address", "Unknown")),
                asset_type=self._map_asset_type(item.get("device_type")),
                source=DataSourceType.NETWORK,
                source_id=item["id"],
                ip_address=item.get("ip_address"),
                mac_address=item.get("mac_address"),
                vendor=item.get("vendor"),
                model=item.get("model"),
                firmware=item.get("firmware_version"),
                status=AssetStatus.ACTIVE if item.get("status") == "online" else AssetStatus.INACTIVE,
                metadata={
                    "claroty_id": item["id"],
                    "risk_score": item.get("risk_score"),
                    "last_seen": item.get("last_seen")
                }
            ))
        
        return assets
    
    def _map_asset_type(self, device_type: str) -> AssetType:
        """Map Claroty device type to AssetType."""
        mapping = {
            "PLC": AssetType.PLC,
            "HMI": AssetType.HMI,
            "SCADA": AssetType.SCADA,
            "Switch": AssetType.SWITCH,
            "Router": AssetType.ROUTER,
            "Controller": AssetType.CONTROLLER
        }
        return mapping.get(device_type, AssetType.OTHER)

# Usage
claroty = ClarotyConnector(
    api_key=os.getenv("CLAROTY_API_KEY"),
    base_url=os.getenv("CLAROTY_BASE_URL")
)

claroty_assets = claroty.fetch_assets()
claroty_source = DataSource(
    source_type=DataSourceType.NETWORK,
    assets=claroty_assets
)
```

### Example: CMMS Integration

```python
class CMMSConnector:
    """Connector for Computerized Maintenance Management System."""
    
    def fetch_assets(self) -> List[Asset]:
        """Fetch assets from CMMS."""
        # Implementation depends on CMMS API
        # Example: Maximo, SAP PM, etc.
        pass
```

---

## Production Deployment

### 1. Environment Configuration

```bash
# .env file
DATABASE_URL=postgresql://user:pass@localhost/assurance_twin
CLAROTY_API_KEY=your_key
CLAROTY_BASE_URL=https://api.claroty.com
DRAGOS_API_KEY=your_key
NOZOMI_API_KEY=your_key
```

### 2. Database Migration

```python
# Use Alembic for migrations
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### 3. Scheduled Discovery

```python
# Using APScheduler or similar
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.add_job(
    continuous_discovery_cycle,
    'interval',
    hours=1,  # Run every hour
    id='discovery_cycle'
)
scheduler.start()
```

### 4. Monitoring and Alerting

```python
def monitor_assurance():
    """Monitor assurance and alert on critical issues."""
    assurance = engine.assess_assurance()
    
    # Alert on critical uncertainty
    if assurance.risk.uncertainty.critical_count > 0:
        send_alert(
            severity="critical",
            message=f"{assurance.risk.uncertainty.critical_count} critical uncertainties",
            details=assurance.risk.uncertainty.items
        )
    
    # Alert on drift
    discovery = engine.get_continuous_discovery()
    unacknowledged_drift = [d for d in discovery.drift_detected if not d.acknowledged]
    if unacknowledged_drift:
        send_alert(
            severity="high",
            message=f"{len(unacknowledged_drift)} unacknowledged drift events",
            details=unacknowledged_drift
        )
```

---

## Next Steps

1. **Connect Real Data Sources** - Implement connectors for your specific OT security tools
2. **Customize Assurance Logic** - Adjust thresholds and criteria for your domain
3. **Integrate Decision Gates** - Add assurance checks to your AI/planning systems
4. **Set Up Monitoring** - Configure alerts and dashboards
5. **Document Uncertainty** - Establish process for acknowledging and resolving uncertainty

---

## Key Principles to Remember

1. **No silent uncertainty** - All uncertainty must be explicitly tracked
2. **Evidence chains required** - Every judgment needs defensible evidence
3. **Dissent is valuable** - Track and address dissent, don't suppress it
4. **Continuous discovery** - Reality changes, keep discovering
5. **Reality drift matters** - Detect when plan diverges from reality
6. **Decision gates enforce** - Don't allow decisions without assurance

**Genesis succeeds only to the extent that asset discovery and assurance prevent AI and capital from acting on fiction.**


