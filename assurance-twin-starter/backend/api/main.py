from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from canonization.engine import CanonizationEngine
from canonization.models import Asset, DataSource, CanonizedAsset
from database.db import get_db_session

app = FastAPI(title="Assurance Twin API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize canonization engine
canonization_engine = CanonizationEngine()

@app.get("/")
async def root():
    return {
        "name": "Assurance Twin",
        "version": "1.0.0",
        "description": "Genesis Assurance Layer - The truth layer that prevents AI from acting on fiction"
    }

@app.post("/api/canonize")
async def canonize_assets(sources: List[DataSource]):
    """
    Canonize assets from multiple data sources.
    Merges engineering, network, compliance, and operational data into single source of truth.
    """
    try:
        result = canonization_engine.canonize(sources)
        return {
            "status": "success",
            "canonized_assets": result.canonized_assets,
            "gaps": result.gaps,
            "conflicts": result.conflicts,
            "metadata": {
                "total_sources": len(sources),
                "total_assets": len(result.canonized_assets),
                "gaps_found": len(result.gaps),
                "conflicts_found": len(result.conflicts),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assets")
async def get_assets(
    source: Optional[str] = None,
    asset_type: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Get canonical asset list with optional filters.
    """
    try:
        assets = canonization_engine.get_assets(
            source=source,
            asset_type=asset_type,
            status=status
        )
        return {
            "status": "success",
            "assets": assets,
            "count": len(assets)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/gaps")
async def get_gaps():
    """
    Get gap analysis: blind spots, shadow OT, orphaned assets, conflicts.
    """
    try:
        gaps = canonization_engine.analyze_gaps()
        return {
            "status": "success",
            "gaps": {
                "blind_spots": gaps.blind_spots,
                "shadow_ot": gaps.shadow_ot,
                "orphaned_assets": gaps.orphaned_assets,
                "conflicts": gaps.conflicts
            },
            "summary": {
                "total_blind_spots": len(gaps.blind_spots),
                "total_shadow_ot": len(gaps.shadow_ot),
                "total_orphaned": len(gaps.orphaned_assets),
                "total_conflicts": len(gaps.conflicts)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assurance")
async def get_assurance():
    """
    Get assurance judgment: Ready/Not Ready, Safe/Unsafe, Scalable/Non-scalable, Known/Unknown Risk.
    
    Genesis principle: No irreversible decision without explicit, evidence-backed assurance
    or documented acknowledgment of uncertainty.
    """
    try:
        assurance = canonization_engine.assess_assurance()
        return {
            "status": "success",
            "assurance": {
                "readiness": {
                    "status": assurance.readiness.status,
                    "confidence": assurance.readiness.confidence,
                    "evidence": assurance.readiness.evidence,
                    "evidence_chain": assurance.readiness.evidence_chain.dict() if assurance.readiness.evidence_chain else None,
                    "gaps": assurance.readiness.gaps,
                    "dissent": [d.dict() for d in assurance.readiness.dissent],
                    "uncertainty_acknowledged": assurance.readiness.uncertainty_acknowledged,
                    "not_yet_knowable": assurance.readiness.not_yet_knowable
                },
                "safety": {
                    "status": assurance.safety.status,
                    "confidence": assurance.safety.confidence,
                    "evidence": assurance.safety.evidence,
                    "evidence_chain": assurance.safety.evidence_chain.dict() if assurance.safety.evidence_chain else None,
                    "risks": assurance.safety.risks,
                    "dissent": [d.dict() for d in assurance.safety.dissent],
                    "uncertainty_acknowledged": assurance.safety.uncertainty_acknowledged,
                    "not_yet_knowable": assurance.safety.not_yet_knowable
                },
                "scalability": {
                    "status": assurance.scalability.status,
                    "confidence": assurance.scalability.confidence,
                    "evidence": assurance.scalability.evidence,
                    "evidence_chain": assurance.scalability.evidence_chain.dict() if assurance.scalability.evidence_chain else None,
                    "constraints": assurance.scalability.constraints,
                    "dissent": [d.dict() for d in assurance.scalability.dissent],
                    "uncertainty_acknowledged": assurance.scalability.uncertainty_acknowledged,
                    "not_yet_knowable": assurance.scalability.not_yet_knowable
                },
                "risk": {
                    "known_risks": assurance.risk.known_risks,
                    "unknown_risks": assurance.risk.unknown_risks,
                    "uncertainty_inventory": assurance.risk.uncertainty_inventory,  # Legacy
                    "uncertainty": {
                        "items": [item.dict() for item in assurance.risk.uncertainty.items],
                        "critical_count": assurance.risk.uncertainty.critical_count,
                        "high_count": assurance.risk.uncertainty.high_count,
                        "medium_count": assurance.risk.uncertainty.medium_count,
                        "low_count": assurance.risk.uncertainty.low_count,
                        "last_updated": assurance.risk.uncertainty.last_updated.isoformat()
                    }
                },
                "assessed_at": assurance.assessed_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dependencies")
async def get_dependencies():
    """
    Get system dependency map: network topology, process dependencies, critical paths.
    """
    try:
        dependencies = canonization_engine.map_dependencies()
        return {
            "status": "success",
            "dependencies": {
                "network_topology": dependencies.network_topology,
                "process_dependencies": dependencies.process_dependencies,
                "critical_paths": dependencies.critical_paths,
                "failure_impacts": dependencies.failure_impacts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/discovery")
async def get_continuous_discovery():
    """
    Get continuous discovery tracking and reality drift detection.
    
    Genesis principle: Continuous discovery of what actually exists and detection
    of drift between plan and reality.
    """
    try:
        discovery = canonization_engine.get_continuous_discovery()
        return {
            "status": "success",
            "discovery": {
                "snapshots": [s.dict() for s in discovery.snapshots[-10:]],  # Last 10 snapshots
                "drift_detected": [d.dict() for d in discovery.drift_detected[-20:]],  # Last 20 drift events
                "last_discovery_run": discovery.last_discovery_run.isoformat() if discovery.last_discovery_run else None,
                "discovery_frequency": discovery.discovery_frequency,
                "summary": {
                    "total_snapshots": len(discovery.snapshots),
                    "total_drift_events": len(discovery.drift_detected),
                    "unacknowledged_drift": len([d for d in discovery.drift_detected if not d.acknowledged])
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/uncertainty")
async def get_uncertainty_inventory():
    """
    Get explicit uncertainty inventory.
    
    Genesis principle: Ignorance is a first-class risk, not a rounding error.
    """
    try:
        assurance = canonization_engine.assess_assurance()
        uncertainty = assurance.risk.uncertainty
        return {
            "status": "success",
            "uncertainty": {
                "items": [item.dict() for item in uncertainty.items],
                "summary": {
                    "total": len(uncertainty.items),
                    "critical": uncertainty.critical_count,
                    "high": uncertainty.high_count,
                    "medium": uncertainty.medium_count,
                    "low": uncertainty.low_count,
                    "acknowledged": len([i for i in uncertainty.items if i.acknowledged]),
                    "unacknowledged": len([i for i in uncertainty.items if not i.acknowledged])
                },
                "last_updated": uncertainty.last_updated.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

