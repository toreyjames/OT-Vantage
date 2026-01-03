from typing import List, Dict, Any, Optional
from collections import defaultdict
from datetime import datetime

from .models import (
    Asset, DataSource, CanonizedAsset, CanonizationResult,
    GapAnalysis, Gap, Assurance, ReadinessJudgment, SafetyJudgment,
    ScalabilityJudgment, RiskAssessment, DependencyMap, DependencyNode,
    AssetStatus, AssuranceStatus, DataSourceType,
    EvidenceChain, EvidenceLink, Dissent, UncertaintyItem, UncertaintyInventory,
    RealityDrift, DiscoverySnapshot, ContinuousDiscovery
)
import uuid

class CanonizationEngine:
    """
    Core canonization engine that merges multiple data sources into single source of truth.
    
    Genesis principle: Reality must be made legible before it can be changed safely.
    This engine enforces continuous discovery and explicit uncertainty tracking.
    """
    
    def __init__(self):
        self.canonized_assets: Dict[str, CanonizedAsset] = {}
        self.source_assets: Dict[DataSourceType, List[Asset]] = defaultdict(list)
        self.gap_analysis: Optional[GapAnalysis] = None
        self.discovery_history: ContinuousDiscovery = ContinuousDiscovery()
        self.previous_snapshot: Optional[DiscoverySnapshot] = None
        
    def canonize(self, sources: List[DataSource]) -> CanonizationResult:
        """
        Canonize assets from multiple data sources.
        
        Process:
        1. Load assets from all sources
        2. Match assets across sources (by IP, MAC, name, location)
        3. Merge matched assets into canonical assets
        4. Identify gaps (blind spots, shadow OT, orphaned assets)
        5. Resolve conflicts
        """
        # Reset state
        self.canonized_assets = {}
        self.source_assets = defaultdict(list)
        
        # Load assets from all sources
        for source in sources:
            self.source_assets[source.source_type].extend(source.assets)
        
        # Match assets across sources
        matched_groups = self._match_assets()
        
        # Create canonical assets
        for group in matched_groups:
            canonical = self._create_canonical_asset(group)
            self.canonized_assets[canonical.canonical_id] = canonical
        
        # Identify gaps
        self.gap_analysis = self._identify_gaps()
        
        # Identify conflicts
        conflicts = self._identify_conflicts()
        
        # Create discovery snapshot for continuous tracking
        snapshot = self.create_discovery_snapshot()
        
        return CanonizationResult(
            canonized_assets=list(self.canonized_assets.values()),
            gaps=self.gap_analysis,
            conflicts=conflicts,
            metadata={
                "total_sources": len(sources),
                "total_assets": len(self.canonized_assets),
                "timestamp": datetime.utcnow().isoformat(),
                "snapshot_id": snapshot.snapshot_id
            }
        )
    
    def _match_assets(self) -> List[List[Asset]]:
        """
        Match assets across sources using multiple strategies:
        - IP address match
        - MAC address match
        - Name similarity
        - Location + type match
        """
        matched_groups: List[List[Asset]] = []
        unmatched: List[Asset] = []
        
        # Collect all assets
        all_assets: List[Asset] = []
        for assets in self.source_assets.values():
            all_assets.extend(assets)
        
        # Match by IP address (most reliable)
        ip_groups: Dict[str, List[Asset]] = defaultdict(list)
        for asset in all_assets:
            if asset.ip_address:
                ip_groups[asset.ip_address].append(asset)
        
        # Match by MAC address
        mac_groups: Dict[str, List[Asset]] = defaultdict(list)
        for asset in all_assets:
            if asset.mac_address:
                mac_groups[asset.mac_address].append(asset)
        
        # Combine matches
        matched_ids = set()
        for group in ip_groups.values():
            if len(group) > 1:
                matched_groups.append(group)
                matched_ids.update(a.id for a in group)
        
        for group in mac_groups.values():
            if len(group) > 1:
                # Check if already matched
                group_ids = {a.id for a in group}
                if not group_ids.intersection(matched_ids):
                    matched_groups.append(group)
                    matched_ids.update(group_ids)
        
        # Unmatched assets (single-source assets)
        for asset in all_assets:
            if asset.id not in matched_ids:
                unmatched.append(asset)
        
        # Add unmatched as single-asset groups
        for asset in unmatched:
            matched_groups.append([asset])
        
        return matched_groups
    
    def _create_canonical_asset(self, assets: List[Asset]) -> CanonizedAsset:
        """
        Create canonical asset from matched group.
        Merges data from multiple sources, resolves conflicts.
        """
        if len(assets) == 1:
            # Single source - use as-is
            asset = assets[0]
            return CanonizedAsset(
                canonical_id=f"canonical_{asset.id}",
                name=asset.name,
                asset_type=asset.asset_type,
                location=asset.location,
                ip_address=asset.ip_address,
                mac_address=asset.mac_address,
                vendor=asset.vendor,
                model=asset.model,
                firmware=asset.firmware,
                status=asset.status,
                sources=[asset.source.value],
                conflicts=[],
                confidence=0.7,  # Lower confidence for single source
                metadata=asset.metadata
            )
        
        # Multiple sources - merge
        # Use most authoritative source for each field
        # Priority: Engineering > Network > Operations > Compliance
        
        source_priority = {
            DataSourceType.ENGINEERING: 4,
            DataSourceType.NETWORK: 3,
            DataSourceType.OPERATIONS: 2,
            DataSourceType.COMPLIANCE: 1
        }
        
        # Sort by priority
        sorted_assets = sorted(assets, key=lambda a: source_priority.get(a.source, 0), reverse=True)
        
        # Merge fields (take from highest priority source)
        canonical = sorted_assets[0]
        conflicts = []
        
        # Check for conflicts
        for other in sorted_assets[1:]:
            if canonical.ip_address and other.ip_address and canonical.ip_address != other.ip_address:
                conflicts.append({
                    "field": "ip_address",
                    "canonical": canonical.ip_address,
                    "conflict": other.ip_address,
                    "source": other.source.value
                })
            if canonical.mac_address and other.mac_address and canonical.mac_address != other.mac_address:
                conflicts.append({
                    "field": "mac_address",
                    "canonical": canonical.mac_address,
                    "conflict": other.mac_address,
                    "source": other.source.value
                })
            if canonical.name != other.name:
                conflicts.append({
                    "field": "name",
                    "canonical": canonical.name,
                    "conflict": other.name,
                    "source": other.source.value
                })
        
        # Confidence based on number of sources and conflicts
        confidence = min(1.0, 0.5 + (len(assets) * 0.15) - (len(conflicts) * 0.1))
        
        return CanonizedAsset(
            canonical_id=f"canonical_{canonical.id}",
            name=canonical.name,
            asset_type=canonical.asset_type,
            location=canonical.location or next((a.location for a in sorted_assets if a.location), None),
            ip_address=canonical.ip_address or next((a.ip_address for a in sorted_assets if a.ip_address), None),
            mac_address=canonical.mac_address or next((a.mac_address for a in sorted_assets if a.mac_address), None),
            vendor=canonical.vendor or next((a.vendor for a in sorted_assets if a.vendor), None),
            model=canonical.model or next((a.model for a in sorted_assets if a.model), None),
            firmware=canonical.firmware or next((a.firmware for a in sorted_assets if a.firmware), None),
            status=canonical.status,
            sources=[a.source.value for a in assets],
            conflicts=conflicts,
            confidence=confidence,
            metadata={**canonical.metadata, "merged_from": len(assets)}
        )
    
    def _identify_gaps(self) -> GapAnalysis:
        """
        Identify gaps: blind spots, shadow OT, orphaned assets.
        """
        blind_spots: List[Gap] = []
        shadow_ot: List[Gap] = []
        orphaned_assets: List[Gap] = []
        
        # Blind spots: In engineering but not on network
        engineering_assets = {a.id for a in self.source_assets[DataSourceType.ENGINEERING]}
        network_assets = {a.id for a in self.source_assets[DataSourceType.NETWORK]}
        
        for asset in self.source_assets[DataSourceType.ENGINEERING]:
            if asset.id not in network_assets:
                blind_spots.append(Gap(
                    gap_type="blind_spot",
                    asset_id=asset.id,
                    description=f"Asset '{asset.name}' in engineering but not discovered on network",
                    sources_involved=["engineering"],
                    severity="high" if asset.asset_type in ["plc", "controller", "scada"] else "medium",
                    metadata={"asset_type": asset.asset_type.value}
                ))
        
        # Shadow OT: On network but not in engineering
        for asset in self.source_assets[DataSourceType.NETWORK]:
            if asset.id not in engineering_assets:
                shadow_ot.append(Gap(
                    gap_type="shadow_ot",
                    asset_id=asset.id,
                    description=f"Asset '{asset.name}' discovered on network but not in engineering documentation",
                    sources_involved=["network"],
                    severity="high" if asset.asset_type in ["plc", "controller", "scada"] else "medium",
                    metadata={"asset_type": asset.asset_type.value, "ip_address": asset.ip_address}
                ))
        
        # Orphaned assets: In compliance but nowhere else
        compliance_assets = {a.id for a in self.source_assets[DataSourceType.COMPLIANCE]}
        all_other_assets = set()
        for source_type in [DataSourceType.ENGINEERING, DataSourceType.NETWORK, DataSourceType.OPERATIONS]:
            all_other_assets.update(a.id for a in self.source_assets[source_type])
        
        for asset in self.source_assets[DataSourceType.COMPLIANCE]:
            if asset.id not in all_other_assets:
                orphaned_assets.append(Gap(
                    gap_type="orphaned",
                    asset_id=asset.id,
                    description=f"Asset '{asset.name}' in compliance inventory but not found in other sources",
                    sources_involved=["compliance"],
                    severity="low",
                    metadata={"asset_type": asset.asset_type.value}
                ))
        
        return GapAnalysis(
            blind_spots=blind_spots,
            shadow_ot=shadow_ot,
            orphaned_assets=orphaned_assets,
            conflicts=[]  # Conflicts handled separately
        )
    
    def _identify_conflicts(self) -> List[Dict[str, Any]]:
        """Identify conflicts in canonical assets."""
        conflicts = []
        for asset in self.canonized_assets.values():
            if asset.conflicts:
                conflicts.extend(asset.conflicts)
        return conflicts
    
    def get_assets(
        self,
        source: Optional[str] = None,
        asset_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[CanonizedAsset]:
        """Get canonical assets with optional filters."""
        assets = list(self.canonized_assets.values())
        
        if source:
            assets = [a for a in assets if source in a.sources]
        if asset_type:
            assets = [a for a in assets if a.asset_type.value == asset_type]
        if status:
            assets = [a for a in assets if a.status.value == status]
        
        return assets
    
    def analyze_gaps(self) -> GapAnalysis:
        """Get gap analysis."""
        if not self.gap_analysis:
            self.gap_analysis = self._identify_gaps()
        return self.gap_analysis
    
    def _build_uncertainty_inventory(self, gaps: GapAnalysis) -> UncertaintyInventory:
        """Build explicit uncertainty inventory from gaps and conflicts."""
        items: List[UncertaintyItem] = []
        
        # Convert gaps to uncertainty items
        for gap in gaps.blind_spots:
            items.append(UncertaintyItem(
                uncertainty_id=f"uncertainty_{uuid.uuid4().hex[:8]}",
                category="unknown_asset",
                description=gap.description,
                impact=f"Asset '{gap.asset_id}' may not exist or be accessible",
                severity=gap.severity,
                sources=gap.sources_involved,
                discovered_at=datetime.utcnow()
            ))
        
        for gap in gaps.shadow_ot:
            items.append(UncertaintyItem(
                uncertainty_id=f"uncertainty_{uuid.uuid4().hex[:8]}",
                category="unverified_behavior",
                description=gap.description,
                impact=f"Unknown asset '{gap.asset_id}' may have undocumented dependencies or behaviors",
                severity=gap.severity,
                sources=gap.sources_involved,
                discovered_at=datetime.utcnow()
            ))
        
        for gap in gaps.orphaned_assets:
            items.append(UncertaintyItem(
                uncertainty_id=f"uncertainty_{uuid.uuid4().hex[:8]}",
                category="missing_dependency",
                description=gap.description,
                impact=f"Asset '{gap.asset_id}' exists in compliance but not verified in operations",
                severity=gap.severity,
                sources=gap.sources_involved,
                discovered_at=datetime.utcnow()
            ))
        
        # Count by severity
        critical_count = len([i for i in items if i.severity == "critical"])
        high_count = len([i for i in items if i.severity == "high"])
        medium_count = len([i for i in items if i.severity == "medium"])
        low_count = len([i for i in items if i.severity == "low"])
        
        return UncertaintyInventory(
            items=items,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            last_updated=datetime.utcnow()
        )
    
    def _build_evidence_chain(self, judgment_type: str, evidence_items: List[str], 
                             conclusion: str) -> EvidenceChain:
        """Build explicit evidence chain for a judgment."""
        links = [
            EvidenceLink(
                evidence_id=f"evidence_{uuid.uuid4().hex[:8]}",
                description=item,
                source="canonization_engine",
                timestamp=datetime.utcnow(),
                confidence=0.8,
                metadata={}
            )
            for item in evidence_items
        ]
        
        return EvidenceChain(
            chain_id=f"chain_{uuid.uuid4().hex[:8]}",
            judgment_type=judgment_type,
            links=links,
            conclusion=conclusion,
            created_at=datetime.utcnow()
        )
    
    def assess_assurance(self) -> Assurance:
        """
        Assess assurance: Ready/Not Ready, Safe/Unsafe, Scalable/Non-scalable, Known/Unknown Risk.
        
        Genesis principle: No irreversible decision without explicit, evidence-backed assurance
        or documented acknowledgment of uncertainty.
        """
        gaps = self.analyze_gaps()
        uncertainty = self._build_uncertainty_inventory(gaps)
        
        # Readiness assessment
        critical_gaps = len([g for g in gaps.blind_spots + gaps.shadow_ot if g.severity == "critical"])
        high_gaps = len([g for g in gaps.blind_spots + gaps.shadow_ot if g.severity == "high"])
        readiness_status = AssuranceStatus.READY if critical_gaps == 0 and high_gaps == 0 else AssuranceStatus.NOT_READY
        readiness_confidence = max(0.0, 1.0 - (critical_gaps * 0.3) - (high_gaps * 0.15))
        
        # Build evidence chain for readiness
        readiness_evidence = [
            f"Total assets canonized: {len(self.canonized_assets)}",
            f"Blind spots identified: {len(gaps.blind_spots)}",
            f"Shadow OT discovered: {len(gaps.shadow_ot)}",
            f"Critical gaps: {critical_gaps}",
            f"High severity gaps: {high_gaps}"
        ]
        
        readiness_conclusion = (
            "System is ready for AI-driven action" if readiness_status == AssuranceStatus.READY
            else f"System is NOT ready: {critical_gaps} critical and {high_gaps} high-severity gaps must be resolved"
        )
        
        readiness_chain = self._build_evidence_chain("readiness", readiness_evidence, readiness_conclusion)
        
        # Check for dissent conditions
        readiness_dissent = []
        if critical_gaps > 0:
            readiness_dissent.append(Dissent(
                dissent_id=f"dissent_{uuid.uuid4().hex[:8]}",
                judgment_type="readiness",
                reason=f"{critical_gaps} critical gaps prevent readiness assessment",
                evidence=[g.description for g in gaps.blind_spots + gaps.shadow_ot if g.severity == "critical"],
                severity="critical",
                raised_by="canonization_engine",
                raised_at=datetime.utcnow()
            ))
        
        readiness = ReadinessJudgment(
            status=readiness_status,
            confidence=readiness_confidence,
            evidence=readiness_evidence,  # Legacy
            evidence_chain=readiness_chain,
            gaps=[g.description for g in gaps.blind_spots + gaps.shadow_ot if g.severity in ["critical", "high"]],
            dissent=readiness_dissent,
            uncertainty_acknowledged=len(uncertainty.items) > 0,
            not_yet_knowable=[item.description for item in uncertainty.items if not item.acknowledged][:5]
        )
        
        # Safety assessment
        safety_status = AssuranceStatus.SAFE if critical_gaps == 0 else AssuranceStatus.UNSAFE
        safety_evidence = readiness_evidence + [
            f"Unknown assets (shadow OT): {len(gaps.shadow_ot)}",
            f"Unverified behaviors: {len([g for g in gaps.shadow_ot if g.severity in ['critical', 'high']])}"
        ]
        safety_conclusion = (
            "System is safe to proceed" if safety_status == AssuranceStatus.SAFE
            else "System is UNSAFE: Unknown assets and unverified behaviors present"
        )
        safety_chain = self._build_evidence_chain("safety", safety_evidence, safety_conclusion)
        
        safety_dissent = []
        if len(gaps.shadow_ot) > 0:
            safety_dissent.append(Dissent(
                dissent_id=f"dissent_{uuid.uuid4().hex[:8]}",
                judgment_type="safety",
                reason=f"{len(gaps.shadow_ot)} shadow OT assets have unknown behaviors",
                evidence=[g.description for g in gaps.shadow_ot[:5]],
                severity="high" if len(gaps.shadow_ot) > 5 else "medium",
                raised_by="canonization_engine",
                raised_at=datetime.utcnow()
            ))
        
        safety = SafetyJudgment(
            status=safety_status,
            confidence=readiness_confidence * 0.9,  # Safety is more conservative
            evidence=safety_evidence,
            evidence_chain=safety_chain,
            gaps=readiness.gaps,
            dissent=safety_dissent,
            uncertainty_acknowledged=len([g for g in gaps.shadow_ot]) > 0,
            not_yet_knowable=[g.description for g in gaps.shadow_ot[:5]],
            risks=[{"type": "unknown_asset", "description": g.description, "severity": g.severity} 
                   for g in gaps.shadow_ot[:5]]
        )
        
        # Scalability assessment
        scalability_status = AssuranceStatus.SCALABLE if critical_gaps == 0 else AssuranceStatus.NON_SCALABLE
        scalability_evidence = readiness_evidence + [
            f"Blind spots (missing from network): {len(gaps.blind_spots)}",
            f"Data conflicts: {len(gaps.conflicts)}"
        ]
        scalability_conclusion = (
            "System is scalable" if scalability_status == AssuranceStatus.SCALABLE
            else "System is NON-SCALABLE: Critical constraints and blind spots prevent scaling"
        )
        scalability_chain = self._build_evidence_chain("scalability", scalability_evidence, scalability_conclusion)
        
        scalability = ScalabilityJudgment(
            status=scalability_status,
            confidence=readiness_confidence,
            evidence=scalability_evidence,
            evidence_chain=scalability_chain,
            gaps=readiness.gaps,
            dissent=[],
            uncertainty_acknowledged=len(gaps.blind_spots) > 0,
            not_yet_knowable=[g.description for g in gaps.blind_spots[:5]],
            constraints=[g.description for g in gaps.blind_spots[:5]]
        )
        
        # Risk assessment with explicit uncertainty inventory
        risk = RiskAssessment(
            known_risks=[{"type": "blind_spot", "description": g.description, "severity": g.severity} 
                         for g in gaps.blind_spots[:5]],
            unknown_risks=[{"type": "shadow_ot", "description": g.description, "severity": g.severity} 
                          for g in gaps.shadow_ot[:5]],
            uncertainty_inventory=[g.description for g in gaps.orphaned_assets[:5]],  # Legacy
            uncertainty=uncertainty  # Explicit uncertainty tracking
        )
        
        return Assurance(
            readiness=readiness,
            safety=safety,
            scalability=scalability,
            risk=risk
        )
    
    def map_dependencies(self) -> DependencyMap:
        """
        Map system dependencies: network topology, process dependencies, critical paths.
        Simplified version - would need more data for full implementation.
        """
        # Build dependency graph from IP addresses and network connections
        nodes: Dict[str, DependencyNode] = {}
        
        for asset in self.canonized_assets.values():
            if asset.ip_address:
                nodes[asset.canonical_id] = DependencyNode(
                    asset_id=asset.canonical_id,
                    name=asset.name,
                    dependencies=[],
                    dependents=[]
                )
        
        # Simple network topology (would need actual network scan data)
        network_topology = [
            {
                "from": asset.canonical_id,
                "to": "network",
                "type": "connected"
            }
            for asset in self.canonized_assets.values()
            if asset.ip_address
        ]
        
        return DependencyMap(
            network_topology=network_topology,
            process_dependencies=list(nodes.values()),
            critical_paths=[],
            failure_impacts={}
        )
    
    def create_discovery_snapshot(self) -> DiscoverySnapshot:
        """
        Create a snapshot of current discovery state for continuous tracking.
        Genesis principle: Continuous discovery of what actually exists.
        """
        gaps = self.analyze_gaps()
        
        # Count assets by source
        assets_by_source: Dict[str, int] = defaultdict(int)
        for asset in self.canonized_assets.values():
            for source in asset.sources:
                assets_by_source[source] += 1
        
        # Confidence distribution
        confidence_ranges = {
            "high": 0,  # >= 0.8
            "medium": 0,  # 0.5-0.8
            "low": 0  # < 0.5
        }
        for asset in self.canonized_assets.values():
            if asset.confidence >= 0.8:
                confidence_ranges["high"] += 1
            elif asset.confidence >= 0.5:
                confidence_ranges["medium"] += 1
            else:
                confidence_ranges["low"] += 1
        
        snapshot = DiscoverySnapshot(
            snapshot_id=f"snapshot_{uuid.uuid4().hex[:8]}",
            timestamp=datetime.utcnow(),
            total_assets=len(self.canonized_assets),
            assets_by_source=dict(assets_by_source),
            gaps=gaps,
            confidence_distribution=confidence_ranges,
            metadata={
                "canonization_run": True,
                "sources_processed": len(self.source_assets)
            }
        )
        
        # Add to history
        self.discovery_history.snapshots.append(snapshot)
        self.discovery_history.last_discovery_run = datetime.utcnow()
        
        # Detect drift if we have a previous snapshot
        if self.previous_snapshot:
            drift = self._detect_reality_drift(self.previous_snapshot, snapshot)
            if drift:
                self.discovery_history.drift_detected.extend(drift)
        
        self.previous_snapshot = snapshot
        return snapshot
    
    def _detect_reality_drift(self, previous: DiscoverySnapshot, current: DiscoverySnapshot) -> List[RealityDrift]:
        """
        Detect drift between plan and reality.
        Genesis principle: Detection of drift between plan and reality.
        """
        drift_detected: List[RealityDrift] = []
        
        # Detect asset count changes
        if previous.total_assets != current.total_assets:
            drift_detected.append(RealityDrift(
                drift_id=f"drift_{uuid.uuid4().hex[:8]}",
                drift_type="plan_reality_divergence",
                description=f"Asset count changed from {previous.total_assets} to {current.total_assets}",
                plan_state={"total_assets": previous.total_assets},
                reality_state={"total_assets": current.total_assets},
                severity="high" if abs(previous.total_assets - current.total_assets) > 10 else "medium",
                detected_at=datetime.utcnow()
            ))
        
        # Detect gap changes
        prev_blind_spots = len(previous.gaps.blind_spots)
        curr_blind_spots = len(current.gaps.blind_spots)
        if prev_blind_spots != curr_blind_spots:
            drift_detected.append(RealityDrift(
                drift_id=f"drift_{uuid.uuid4().hex[:8]}",
                drift_type="documentation_drift",
                description=f"Blind spots changed from {prev_blind_spots} to {curr_blind_spots}",
                plan_state={"blind_spots": prev_blind_spots},
                reality_state={"blind_spots": curr_blind_spots},
                severity="high" if curr_blind_spots > prev_blind_spots else "medium",
                detected_at=datetime.utcnow()
            ))
        
        prev_shadow_ot = len(previous.gaps.shadow_ot)
        curr_shadow_ot = len(current.gaps.shadow_ot)
        if prev_shadow_ot != curr_shadow_ot:
            drift_detected.append(RealityDrift(
                drift_id=f"drift_{uuid.uuid4().hex[:8]}",
                drift_type="behavior_change",
                description=f"Shadow OT changed from {prev_shadow_ot} to {curr_shadow_ot}",
                plan_state={"shadow_ot": prev_shadow_ot},
                reality_state={"shadow_ot": curr_shadow_ot},
                severity="high" if curr_shadow_ot > prev_shadow_ot else "medium",
                detected_at=datetime.utcnow()
            ))
        
        return drift_detected
    
    def get_continuous_discovery(self) -> ContinuousDiscovery:
        """Get continuous discovery tracking."""
        return self.discovery_history



