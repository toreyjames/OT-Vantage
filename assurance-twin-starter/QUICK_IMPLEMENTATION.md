# Quick Implementation Guide

A condensed guide for getting started quickly.

## 1. Setup (5 minutes)

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend  
cd frontend
npm install
```

## 2. Run Example (2 minutes)

```bash
# Terminal 1: Start backend
cd backend
uvicorn api.main:app --reload

# Terminal 2: Run example
cd backend
python examples/full_workflow_example.py
```

This demonstrates:
- Asset canonization
- Assurance assessment
- Decision gates
- Continuous discovery

## 3. Use the API (3 minutes)

```python
import requests

# Get assurance
response = requests.get("http://localhost:8000/api/assurance")
assurance = response.json()

# Check if ready
if assurance["assurance"]["readiness"]["status"] == "ready":
    print("✅ System ready")
else:
    print("❌ System not ready")
    print(assurance["assurance"]["readiness"]["gaps"])
```

## 4. Integrate Decision Gate (5 minutes)

```python
from backend.canonization.engine import CanonizationEngine

engine = CanonizationEngine()

def check_before_action():
    assurance = engine.assess_assurance()
    
    if assurance.readiness.status.value != "ready":
        raise Exception("Action blocked: System not ready")
    
    if not assurance.readiness.uncertainty_acknowledged:
        raise Exception("Action blocked: Uncertainty not acknowledged")
    
    return True

# Use in your code
try:
    check_before_action()
    # Proceed with action
except Exception as e:
    print(f"Blocked: {e}")
```

## 5. Connect Real Data (varies)

See `IMPLEMENTATION_GUIDE.md` section "Connecting Real Data Sources" for examples:
- Claroty integration
- CMMS integration
- SCADA integration

## Key Files

- `backend/examples/full_workflow_example.py` - Complete workflow demo
- `IMPLEMENTATION_GUIDE.md` - Comprehensive guide
- `GENESIS_MISSION.md` - Mission and principles
- `backend/api/main.py` - API endpoints

## Next Steps

1. Run the example to see it in action
2. Review `IMPLEMENTATION_GUIDE.md` for detailed patterns
3. Connect your data sources
4. Integrate decision gates into your systems


