from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class DataSourceType(str, Enum):
    ENGINEERING = "engineering"  # P&IDs, asset registers, CMMS
    NETWORK = "network"  # OT security tools (Claroty, Dragos, Nozomi)
    COMPLIANCE = "compliance"  # Manual inventories, audit lists
    OPERATIONS = "operations"  # SCADA, historian, real-time data

class AssetType(str, Enum):
    PLC = "plc"
    HMI = "hmi"
    SENSOR = "sensor"
    ACTUATOR = "actuator"
    CONTROLLER = "controller"
    SWITCH = "switch"
    ROUTER = "router"
    HISTORIAN = "historian"
    SCADA = "scada"
    OTHER = "other"

class AssetStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    UNKNOWN = "unknown"
    CONFLICT = "conflict"

class AssuranceStatus(str, Enum):
    READY = "ready"
    NOT_READY = "not_ready"
    SAFE = "safe"
    UNSAFE = "unsafe"
    SCALABLE = "scalable"
    NON_SCALABLE = "non_scalable"
    KNOWN_RISK = "known_risk"
    UNKNOWN_RISK = "unknown_risk"

class Asset(BaseModel):
    """Raw asset from a data source."""
    id: str
    name: str
    asset_type: AssetType
    source: DataSourceType
    source_id: str  # ID in the source system
    location: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    vendor: Optional[str] = None
    model: Optional[str] = None
    firmware: Optional[str] = None
    status: AssetStatus = AssetStatus.UNKNOWN
    metadata: Dict[str, Any] = Field(default_factory=dict)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)

class DataSource(BaseModel):
    """Data source input for canonization."""
    source_type: DataSourceType
    assets: List[Asset]
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CanonizedAsset(BaseModel):
    """Canonical asset (merged from multiple sources)."""
    canonical_id: str
    name: str
    asset_type: AssetType
    location: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    vendor: Optional[str] = None
    model: Optional[str] = None
    firmware: Optional[str] = None
    status: AssetStatus
    sources: List[str]  # Which sources contributed to this asset
    conflicts: List[Dict[str, Any]] = Field(default_factory=list)  # Conflicting data
    confidence: float = Field(ge=0.0, le=1.0)  # Confidence in canonical data
    metadata: Dict[str, Any] = Field(default_factory=dict)
    canonized_at: datetime = Field(default_factory=datetime.utcnow)

class Gap(BaseModel):
    """Gap identified in asset discovery."""
    gap_type: str  # "blind_spot", "shadow_ot", "orphaned", "conflict"
    asset_id: Optional[str] = None
    description: str
    sources_involved: List[str]
    severity: str  # "critical", "high", "medium", "low"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GapAnalysis(BaseModel):
    """Complete gap analysis."""
    blind_spots: List[Gap] = Field(default_factory=list)
    shadow_ot: List[Gap] = Field(default_factory=list)
    orphaned_assets: List[Gap] = Field(default_factory=list)
    conflicts: List[Gap] = Field(default_factory=list)

class EvidenceLink(BaseModel):
    """Single link in an evidence chain."""
    evidence_id: str
    description: str
    source: str  # Where this evidence came from
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: float = Field(ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EvidenceChain(BaseModel):
    """Explicit evidence chain supporting a judgment."""
    chain_id: str
    judgment_type: str  # "readiness", "safety", "scalability", "risk"
    links: List[EvidenceLink] = Field(default_factory=list)
    conclusion: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Dissent(BaseModel):
    """Reason for dissent in an assurance judgment."""
    dissent_id: str
    judgment_type: str
    reason: str
    evidence: List[str] = Field(default_factory=list)
    severity: str  # "critical", "high", "medium", "low"
    raised_by: Optional[str] = None  # System or user who raised dissent
    raised_at: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = False
    resolution: Optional[str] = None

class UncertaintyItem(BaseModel):
    """Explicit uncertainty that must be tracked."""
    uncertainty_id: str
    category: str  # "unknown_asset", "unverified_behavior", "missing_dependency", "data_conflict"
    description: str
    impact: str  # What decisions this uncertainty affects
    severity: str  # "critical", "high", "medium", "low"
    sources: List[str] = Field(default_factory=list)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    acknowledged: bool = False
    mitigation: Optional[str] = None

class UncertaintyInventory(BaseModel):
    """Complete inventory of uncertainties and blind spots."""
    items: List[UncertaintyItem] = Field(default_factory=list)
    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class AssuranceJudgment(BaseModel):
    """Assurance judgment for a specific dimension."""
    status: AssuranceStatus
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: List[str] = Field(default_factory=list)  # Legacy - use evidence_chain
    evidence_chain: Optional[EvidenceChain] = None  # Explicit evidence chain
    gaps: List[str] = Field(default_factory=list)
    dissent: List[Dissent] = Field(default_factory=list)  # Reasons for dissent
    uncertainty_acknowledged: bool = False  # Whether uncertainty has been explicitly acknowledged
    not_yet_knowable: List[str] = Field(default_factory=list)  # What is not yet knowable

class ReadinessJudgment(AssuranceJudgment):
    """Ready / Not Ready assessment."""
    pass

class SafetyJudgment(AssuranceJudgment):
    """Safe / Unsafe assessment."""
    risks: List[Dict[str, Any]] = Field(default_factory=list)

class ScalabilityJudgment(AssuranceJudgment):
    """Scalable / Non-scalable assessment."""
    constraints: List[str] = Field(default_factory=list)

class RiskAssessment(BaseModel):
    """Known / Unknown Risk assessment."""
    known_risks: List[Dict[str, Any]] = Field(default_factory=list)
    unknown_risks: List[Dict[str, Any]] = Field(default_factory=list)
    uncertainty_inventory: List[str] = Field(default_factory=list)  # Legacy
    uncertainty: UncertaintyInventory = Field(default_factory=UncertaintyInventory)  # Explicit uncertainty tracking

class Assurance(BaseModel):
    """Complete assurance assessment."""
    readiness: ReadinessJudgment
    safety: SafetyJudgment
    scalability: ScalabilityJudgment
    risk: RiskAssessment
    assessed_at: datetime = Field(default_factory=datetime.utcnow)

class CanonizationResult(BaseModel):
    """Result of canonization process."""
    canonized_assets: List[CanonizedAsset]
    gaps: GapAnalysis
    conflicts: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DependencyNode(BaseModel):
    """Node in dependency graph."""
    asset_id: str
    name: str
    dependencies: List[str] = Field(default_factory=list)  # Asset IDs this depends on
    dependents: List[str] = Field(default_factory=list)  # Asset IDs that depend on this

class DependencyMap(BaseModel):
    """System dependency map."""
    network_topology: List[Dict[str, Any]] = Field(default_factory=list)
    process_dependencies: List[DependencyNode] = Field(default_factory=list)
    critical_paths: List[List[str]] = Field(default_factory=list)  # Lists of asset IDs
    failure_impacts: Dict[str, List[str]] = Field(default_factory=dict)  # Asset ID -> affected asset IDs

class RealityDrift(BaseModel):
    """Detection of drift between plan and reality."""
    drift_id: str
    asset_id: Optional[str] = None
    drift_type: str  # "plan_reality_divergence", "documentation_drift", "behavior_change", "dependency_change"
    description: str
    plan_state: Dict[str, Any] = Field(default_factory=dict)
    reality_state: Dict[str, Any] = Field(default_factory=dict)
    severity: str  # "critical", "high", "medium", "low"
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    acknowledged: bool = False

class DiscoverySnapshot(BaseModel):
    """Snapshot of discovery state at a point in time."""
    snapshot_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_assets: int
    assets_by_source: Dict[str, int] = Field(default_factory=dict)
    gaps: GapAnalysis
    confidence_distribution: Dict[str, int] = Field(default_factory=dict)  # confidence ranges -> count
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ContinuousDiscovery(BaseModel):
    """Tracking of continuous discovery over time."""
    snapshots: List[DiscoverySnapshot] = Field(default_factory=list)
    drift_detected: List[RealityDrift] = Field(default_factory=list)
    last_discovery_run: Optional[datetime] = None
    discovery_frequency: Optional[str] = None  # "continuous", "hourly", "daily", etc.








