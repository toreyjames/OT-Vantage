"""
Full Workflow Example - Genesis Assurance Layer

This example demonstrates the complete workflow:
1. Canonize assets from multiple sources
2. Assess assurance with evidence chains
3. Make decisions with assurance gates
4. Track continuous discovery and drift
"""

import sys
import os
from datetime import datetime
from typing import List

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from canonization.models import (
    Asset, DataSource, DataSourceType, AssetType, AssetStatus
)
from canonization.engine import CanonizationEngine


def create_sample_data() -> List[DataSource]:
    """Create sample data sources for demonstration."""
    
    # Engineering data (from P&IDs, CMMS)
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
        ),
        Asset(
            id="eng_sensor_001",
            name="Temperature Sensor T-101",
            asset_type=AssetType.SENSOR,
            source=DataSourceType.ENGINEERING,
            source_id="T-101",
            location="Process Line 1",
            vendor="Honeywell",
            model="STT3000",
            status=AssetStatus.ACTIVE
        ),
        # This asset is in engineering but NOT on network (blind spot)
        Asset(
            id="eng_plc_002",
            name="Backup Controller",
            asset_type=AssetType.PLC,
            source=DataSourceType.ENGINEERING,
            source_id="PLC-002",
            location="Building B",
            vendor="Siemens",
            model="S7-1200",
            status=AssetStatus.ACTIVE
        )
    ]
    
    # Network discovery data (from Claroty, Dragos, etc.)
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
        Asset(
            id="net_192_168_1_101",
            name="192.168.1.101",
            asset_type=AssetType.HMI,
            source=DataSourceType.NETWORK,
            source_id="192.168.1.101",
            ip_address="192.168.1.101",
            mac_address="00:1B:44:11:3A:B8",
            vendor="Siemens",
            model="TP700",
            status=AssetStatus.ACTIVE
        ),
        # This asset is on network but NOT in engineering (shadow OT)
        Asset(
            id="net_192_168_1_200",
            name="192.168.1.200",
            asset_type=AssetType.OTHER,
            source=DataSourceType.NETWORK,
            source_id="192.168.1.200",
            ip_address="192.168.1.200",
            mac_address="00:1B:44:11:3A:C9",
            status=AssetStatus.ACTIVE
        )
    ]
    
    # Compliance data (manual inventory)
    compliance_assets = [
        Asset(
            id="comp_plc_001",
            name="Main Process Controller",
            asset_type=AssetType.PLC,
            source=DataSourceType.COMPLIANCE,
            source_id="COMP-PLC-001",
            location="Building A",
            vendor="Siemens",
            status=AssetStatus.ACTIVE
        ),
        # This asset is in compliance but nowhere else (orphaned)
        Asset(
            id="comp_old_001",
            name="Legacy Controller (Decommissioned)",
            asset_type=AssetType.PLC,
            source=DataSourceType.COMPLIANCE,
            source_id="COMP-OLD-001",
            location="Building C",
            status=AssetStatus.INACTIVE
        )
    ]
    
    return [
        DataSource(source_type=DataSourceType.ENGINEERING, assets=engineering_assets),
        DataSource(source_type=DataSourceType.NETWORK, assets=network_assets),
        DataSource(source_type=DataSourceType.COMPLIANCE, assets=compliance_assets)
    ]


def print_separator(title: str = ""):
    """Print a visual separator."""
    print("\n" + "=" * 80)
    if title:
        print(f"  {title}")
        print("=" * 80)
    print()


def demonstrate_canonization():
    """Demonstrate asset canonization."""
    print_separator("STEP 1: Asset Canonization")
    
    engine = CanonizationEngine()
    sources = create_sample_data()
    
    print("Canonizing assets from multiple sources...")
    print(f"  - Engineering: {len(sources[0].assets)} assets")
    print(f"  - Network: {len(sources[1].assets)} assets")
    print(f"  - Compliance: {len(sources[2].assets)} assets")
    print()
    
    result = engine.canonize(sources)
    
    print(f"✅ Canonized {len(result.canonized_assets)} assets")
    print()
    
    # Show canonized assets
    print("Canonized Assets:")
    for asset in result.canonized_assets:
        print(f"  - {asset.name} ({asset.asset_type.value})")
        print(f"    Sources: {', '.join(asset.sources)}")
        print(f"    Confidence: {asset.confidence:.2%}")
        if asset.conflicts:
            print(f"    ⚠️  Conflicts: {len(asset.conflicts)}")
        print()
    
    # Show gaps
    print("Gap Analysis:")
    print(f"  - Blind Spots: {len(result.gaps.blind_spots)}")
    for gap in result.gaps.blind_spots:
        print(f"    • {gap.description} (severity: {gap.severity})")
    
    print(f"  - Shadow OT: {len(result.gaps.shadow_ot)}")
    for gap in result.gaps.shadow_ot:
        print(f"    • {gap.description} (severity: {gap.severity})")
    
    print(f"  - Orphaned Assets: {len(result.gaps.orphaned_assets)}")
    for gap in result.gaps.orphaned_assets:
        print(f"    • {gap.description} (severity: {gap.severity})")
    
    return engine, result


def demonstrate_assurance(engine: CanonizationEngine):
    """Demonstrate assurance assessment."""
    print_separator("STEP 2: Assurance Assessment")
    
    print("Assessing assurance with evidence chains...")
    print()
    
    assurance = engine.assess_assurance()
    
    # Readiness
    print("📊 READINESS ASSESSMENT")
    print(f"  Status: {assurance.readiness.status.value.upper()}")
    print(f"  Confidence: {assurance.readiness.confidence:.2%}")
    print()
    
    if assurance.readiness.evidence_chain:
        print("  Evidence Chain:")
        for i, link in enumerate(assurance.readiness.evidence_chain.links, 1):
            print(f"    {i}. {link.description}")
            print(f"       Source: {link.source}, Confidence: {link.confidence:.2%}")
        print()
        print(f"  Conclusion: {assurance.readiness.evidence_chain.conclusion}")
        print()
    
    if assurance.readiness.dissent:
        print("  ⚠️  DISSENT RAISED:")
        for dissent in assurance.readiness.dissent:
            print(f"    - {dissent.reason}")
            print(f"      Severity: {dissent.severity}")
            print(f"      Evidence: {dissent.evidence}")
        print()
    
    if assurance.readiness.not_yet_knowable:
        print("  ❓ Not Yet Knowable:")
        for item in assurance.readiness.not_yet_knowable[:3]:
            print(f"    - {item}")
        print()
    
    # Safety
    print("🛡️  SAFETY ASSESSMENT")
    print(f"  Status: {assurance.safety.status.value.upper()}")
    print(f"  Confidence: {assurance.safety.confidence:.2%}")
    if assurance.safety.risks:
        print(f"  Risks Identified: {len(assurance.safety.risks)}")
    print()
    
    # Scalability
    print("📈 SCALABILITY ASSESSMENT")
    print(f"  Status: {assurance.scalability.status.value.upper()}")
    if assurance.scalability.constraints:
        print(f"  Constraints: {len(assurance.scalability.constraints)}")
    print()
    
    # Uncertainty
    print("❓ UNCERTAINTY INVENTORY")
    uncertainty = assurance.risk.uncertainty
    print(f"  Total Items: {len(uncertainty.items)}")
    print(f"  Critical: {uncertainty.critical_count}")
    print(f"  High: {uncertainty.high_count}")
    print(f"  Medium: {uncertainty.medium_count}")
    print(f"  Low: {uncertainty.low_count}")
    print()
    
    if uncertainty.items:
        print("  Sample Uncertainties:")
        for item in uncertainty.items[:3]:
            print(f"    - [{item.severity.upper()}] {item.description}")
            print(f"      Impact: {item.impact}")
            print(f"      Acknowledged: {item.acknowledged}")
        print()
    
    return assurance


def demonstrate_decision_gate(assurance):
    """Demonstrate decision gate enforcement."""
    print_separator("STEP 3: Decision Gate - Genesis Principle")
    
    print("Genesis Principle: No irreversible decision without explicit assurance")
    print("                   or documented acknowledgment of uncertainty.")
    print()
    
    # Simulate decision request
    decision_type = "Deploy AI Optimization"
    print(f"Decision Request: {decision_type}")
    print()
    
    # Check readiness
    if assurance.readiness.status.value != "ready":
        print("❌ DECISION BLOCKED")
        print(f"   Reason: System not ready")
        print(f"   Gaps: {assurance.readiness.gaps}")
        print()
        print("   Action Required:")
        print("   1. Resolve critical gaps")
        print("   2. OR explicitly acknowledge uncertainty")
        return False
    
    # Check uncertainty acknowledgment
    if not assurance.readiness.uncertainty_acknowledged:
        print("❌ DECISION BLOCKED")
        print("   Reason: Uncertainty not explicitly acknowledged")
        print()
        print("   Action Required:")
        print("   1. Review uncertainty inventory")
        print("   2. Acknowledge uncertainties")
        print("   3. Document mitigation plans")
        return False
    
    # Check critical dissent
    critical_dissent = [d for d in assurance.readiness.dissent if d.severity == "critical"]
    if critical_dissent:
        print("❌ DECISION BLOCKED")
        print("   Reason: Critical dissent raised")
        for dissent in critical_dissent:
            print(f"   - {dissent.reason}")
        return False
    
    # Check critical uncertainty
    if assurance.risk.uncertainty.critical_count > 0:
        print("❌ DECISION BLOCKED")
        print(f"   Reason: {assurance.risk.uncertainty.critical_count} critical uncertainties")
        return False
    
    # Approved
    print("✅ DECISION APPROVED")
    print(f"   Readiness: {assurance.readiness.status.value}")
    print(f"   Confidence: {assurance.readiness.confidence:.2%}")
    print(f"   Evidence Chain ID: {assurance.readiness.evidence_chain.chain_id if assurance.readiness.evidence_chain else 'N/A'}")
    print()
    print("   Proceeding with decision execution...")
    return True


def demonstrate_continuous_discovery(engine: CanonizationEngine):
    """Demonstrate continuous discovery and drift detection."""
    print_separator("STEP 4: Continuous Discovery & Reality Drift")
    
    print("Genesis Principle: Continuous discovery of what actually exists")
    print("                   and detection of drift between plan and reality.")
    print()
    
    # Create first snapshot
    print("Creating discovery snapshot #1...")
    snapshot1 = engine.create_discovery_snapshot()
    print(f"  Snapshot ID: {snapshot1.snapshot_id}")
    print(f"  Total Assets: {snapshot1.total_assets}")
    print(f"  Blind Spots: {len(snapshot1.gaps.blind_spots)}")
    print(f"  Shadow OT: {len(snapshot1.gaps.shadow_ot)}")
    print()
    
    # Simulate second discovery run (with changes)
    print("Simulating second discovery run (with changes)...")
    
    # Add a new asset to simulate change
    new_asset = Asset(
        id="net_new_001",
        name="192.168.1.250",
        asset_type=AssetType.OTHER,
        source=DataSourceType.NETWORK,
        source_id="192.168.1.250",
        ip_address="192.168.1.250",
        status=AssetStatus.ACTIVE
    )
    
    # Re-canonize with new asset
    sources = create_sample_data()
    sources[1].assets.append(new_asset)  # Add to network source
    result = engine.canonize(sources)
    
    # Create second snapshot (will detect drift)
    print("Creating discovery snapshot #2...")
    snapshot2 = engine.create_discovery_snapshot()
    print(f"  Snapshot ID: {snapshot2.snapshot_id}")
    print(f"  Total Assets: {snapshot2.total_assets}")
    print()
    
    # Check for drift
    discovery = engine.get_continuous_discovery()
    if discovery.drift_detected:
        print("⚠️  REALITY DRIFT DETECTED:")
        for drift in discovery.drift_detected[-5:]:  # Last 5
            print(f"  - [{drift.severity.upper()}] {drift.description}")
            print(f"    Type: {drift.drift_type}")
            print(f"    Acknowledged: {drift.acknowledged}")
        print()
    else:
        print("✅ No drift detected")
        print()
    
    print(f"Discovery History:")
    print(f"  Total Snapshots: {len(discovery.snapshots)}")
    print(f"  Total Drift Events: {len(discovery.drift_detected)}")
    print(f"  Last Discovery Run: {discovery.last_discovery_run}")


def main():
    """Run the complete workflow demonstration."""
    print("\n" + "=" * 80)
    print("  GENESIS ASSURANCE LAYER - FULL WORKFLOW DEMONSTRATION")
    print("=" * 80)
    print()
    print("This demonstration shows how the Genesis Assurance Layer:")
    print("  1. Canonizes assets from multiple sources")
    print("  2. Assesses assurance with evidence chains")
    print("  3. Enforces decision gates")
    print("  4. Tracks continuous discovery and reality drift")
    print()
    
    try:
        # Step 1: Canonization
        engine, result = demonstrate_canonization()
        
        # Step 2: Assurance
        assurance = demonstrate_assurance(engine)
        
        # Step 3: Decision Gate
        approved = demonstrate_decision_gate(assurance)
        
        # Step 4: Continuous Discovery
        demonstrate_continuous_discovery(engine)
        
        # Summary
        print_separator("SUMMARY")
        print("Genesis Assurance Layer provides:")
        print("  ✅ Explicit evidence chains for all judgments")
        print("  ✅ First-class uncertainty tracking")
        print("  ✅ Dissent tracking for contested judgments")
        print("  ✅ Continuous discovery over time")
        print("  ✅ Reality drift detection")
        print("  ✅ Decision gates that prevent acting on fiction")
        print()
        print("Key Principle:")
        print("  'No irreversible decision without explicit, evidence-backed assurance'")
        print("  'or documented acknowledgment of uncertainty.'")
        print()
        
        if not approved:
            print("⚠️  In this example, the decision was blocked due to:")
            print("   - System not ready (gaps present)")
            print("   - Uncertainty not acknowledged")
            print()
            print("   This is the correct behavior - Genesis prevents confident error.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()


