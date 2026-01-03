# Quick Start Guide

## Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload
```

Backend will run on `http://localhost:8000`

## Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Initialize Database

```bash
cd backend
python database/init_db.py
```

## Test the API

```bash
# Health check
curl http://localhost:8000/api/health

# Get assets (will be empty initially)
curl http://localhost:8000/api/assets

# Get assurance (will show default values)
curl http://localhost:8000/api/assurance
```

## Example: Canonize Assets

```python
from backend.canonization.models import Asset, DataSource, DataSourceType, AssetType, AssetStatus
from backend.canonization.engine import CanonizationEngine

# Create sample data
engineering_assets = [
    Asset(
        id="eng_001",
        name="PLC-001",
        asset_type=AssetType.PLC,
        source=DataSourceType.ENGINEERING,
        source_id="PLC-001",
        location="Building A",
        vendor="Siemens",
        model="S7-1500",
        status=AssetStatus.ACTIVE
    )
]

network_assets = [
    Asset(
        id="net_001",
        name="192.168.1.100",
        asset_type=AssetType.PLC,
        source=DataSourceType.NETWORK,
        source_id="192.168.1.100",
        ip_address="192.168.1.100",
        mac_address="00:1B:44:11:3A:B7",
        vendor="Siemens",
        model="S7-1500",
        status=AssetStatus.ACTIVE
    )
]

# Canonize
engine = CanonizationEngine()
sources = [
    DataSource(source_type=DataSourceType.ENGINEERING, assets=engineering_assets),
    DataSource(source_type=DataSourceType.NETWORK, assets=network_assets)
]

result = engine.canonize(sources)
print(f"Canonized {len(result.canonized_assets)} assets")
print(f"Found {len(result.gaps.blind_spots)} blind spots")
print(f"Found {len(result.gaps.shadow_ot)} shadow OT")
```

## Next Steps

1. Connect real data sources (Claroty, Dragos, CMMS APIs)
2. Enhance matching logic (fuzzy matching, ML-based)
3. Build dependency mapping (network topology, process flows)
4. Add real-time updates (WebSocket for live data)
5. Enhance UI (visualizations, dashboards)



