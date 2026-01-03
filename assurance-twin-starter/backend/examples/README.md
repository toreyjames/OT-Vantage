# Examples

This directory contains example implementations demonstrating how to use the Genesis Assurance Layer.

## Examples

### `full_workflow_example.py`

Complete end-to-end demonstration of:
- Asset canonization from multiple sources
- Assurance assessment with evidence chains
- Decision gate enforcement
- Continuous discovery and reality drift detection

**Run it:**
```bash
cd backend
python examples/full_workflow_example.py
```

## Usage Patterns

### Pattern 1: Basic Canonization

```python
from canonization.engine import CanonizationEngine
from canonization.models import Asset, DataSource, DataSourceType

engine = CanonizationEngine()
sources = [DataSource(...)]
result = engine.canonize(sources)
```

### Pattern 2: Assurance Check

```python
assurance = engine.assess_assurance()
if assurance.readiness.status.value == "ready":
    # Proceed
else:
    # Block action
```

### Pattern 3: Decision Gate

```python
def make_decision():
    assurance = engine.assess_assurance()
    
    if assurance.readiness.status.value != "ready":
        raise Exception("Decision blocked")
    
    if not assurance.readiness.uncertainty_acknowledged:
        raise Exception("Uncertainty not acknowledged")
    
    # Proceed with decision
```

See `IMPLEMENTATION_GUIDE.md` in the root directory for more detailed patterns.


