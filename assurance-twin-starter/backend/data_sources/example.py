"""
Example data source connectors.
These would connect to actual systems (Claroty, Dragos, CMMS, etc.)
"""

from typing import List
from ..canonization.models import Asset, DataSource, DataSourceType, AssetType, AssetStatus

def load_engineering_data(file_path: str) -> DataSource:
    """Load engineering data from P&IDs, asset registers, CMMS exports."""
    # Example: Load from CSV, Excel, or API
    assets = [
        Asset(
            id="eng_001",
            name="PLC-001",
            asset_type=AssetType.PLC,
            source=DataSourceType.ENGINEERING,
            source_id="PLC-001",
            location="Building A, Floor 2",
            vendor="Siemens",
            model="S7-1500",
            status=AssetStatus.ACTIVE,
            metadata={"from": "CMMS export"}
        )
    ]
    return DataSource(
        source_type=DataSourceType.ENGINEERING,
        assets=assets,
        metadata={"file": file_path}
    )

def load_network_data(api_endpoint: str) -> DataSource:
    """Load network discovery data from OT security tools."""
    # Example: Connect to Claroty, Dragos, Nozomi API
    assets = [
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
            status=AssetStatus.ACTIVE,
            metadata={"from": "Claroty API"}
        )
    ]
    return DataSource(
        source_type=DataSourceType.NETWORK,
        assets=assets,
        metadata={"endpoint": api_endpoint}
    )

def load_compliance_data(file_path: str) -> DataSource:
    """Load compliance inventory data."""
    assets = [
        Asset(
            id="comp_001",
            name="PLC-001",
            asset_type=AssetType.PLC,
            source=DataSourceType.COMPLIANCE,
            source_id="PLC-001",
            location="Building A",
            status=AssetStatus.ACTIVE,
            metadata={"from": "compliance audit"}
        )
    ]
    return DataSource(
        source_type=DataSourceType.COMPLIANCE,
        assets=assets,
        metadata={"file": file_path}
    )



