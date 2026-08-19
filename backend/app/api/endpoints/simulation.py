"""
Simulation endpoints for demo mode.
"""
from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.database.supabase_client import SupabaseService, get_supabase
import logging
from datetime import datetime
import uuid
import asyncio

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple global state for demo simulation progress
simulation_state = {
    "active": False,
    "step": 0,
    "status": "STOPPED"
}

@router.post("/start")
async def start_simulation(supabase: SupabaseService = Depends(get_supabase)):
    """Start the emergency simulation."""
    simulation_state["active"] = True
    simulation_state["step"] = 0
    simulation_state["status"] = "RUNNING"
    logger.info("Emergency simulation started.")
    
    # In a real app we'd dispatch a background task or celery worker here
    # For the hackathon MVP, we can just return success and the frontend can call /step
    return {"status": "success", "message": "Simulation started. Call /step to progress."}

@router.post("/step")
async def step_simulation(supabase: SupabaseService = Depends(get_supabase)):
    """Progress the simulation to the next step."""
    if not simulation_state["active"]:
        return {"status": "error", "message": "Simulation not active."}
    
    step = simulation_state["step"]
    events = []
    
    if step == 0:
        # T+0: Incident begins
        incident = {
            "id": f"sim-inc-{uuid.uuid4().hex[:8]}",
            "title": "Major Industrial Fire",
            "description": "Explosion reported at chemical plant.",
            "severity": "CRITICAL",
            "location": {"lat": 19.0800, "lng": 72.8800},
            "reported_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        await supabase.create_incident(incident)
        events.append("Incident created.")
        
    elif step == 1:
        # T+10: Citizen reports arrive
        report = {
            "id": f"sim-rep-{uuid.uuid4().hex[:8]}",
            "title": "Building collapsed",
            "description": "Saw the roof cave in, people might be trapped.",
            "reporter_type": "Citizen",
            "severity": "CRITICAL",
            "location": "North wing",
            "confidence": 0.8,
            "status": "NEW",
            "created_at": datetime.now().isoformat()
        }
        await supabase.create_report(report)
        events.append("Citizen reports arrived.")
        
    elif step == 2:
        # T+20: AI vision detects survivors
        detection = {
            "id": f"sim-det-{uuid.uuid4().hex[:8]}",
            "class": "person",
            "confidence": 0.94,
            "bbox": [150.0, 200.0, 250.0, 350.0],
            "source": "cctv_camera_4",
            "location": {"lat": 19.0810, "lng": 72.8810},
            "detected_at": datetime.now().isoformat()
        }
        await supabase.save_detection(detection)
        events.append("AI Vision detected survivors.")
        
    elif step == 3:
        # T+30: Risk score increases
        zones = await supabase.get_zones()
        if zones:
            zone = zones[0]
            zone["risk_score"] = min(100, zone.get("risk_score", 50) + 20)
            zone["severity"] = "CRITICAL"
            zone["updated_at"] = datetime.now().isoformat()
            await supabase.update_zone(zone["id"], zone)
        events.append("Risk score increased.")
        
    elif step == 4:
        # T+40: Internet fails
        # This will be handled by the frontend, but we log the state change
        simulation_state["internet_offline"] = True
        events.append("Simulating internet failure (frontend will disconnect).")

    elif step == 5:
        # T+50: RescueMesh active
        simulation_state["mesh_active"] = True
        events.append("RescueMesh activated.")
        
    elif step == 6:
        # T+80: AI Briefing generated
        briefing = {
            "id": f"sim-brief-{uuid.uuid4().hex[:8]}",
            "content": "CRITICAL UPDATE: Explosion at chemical plant. 1 survivor detected via CCTV. Risk score critical. Recommendation: Dispatch HAZMAT and SAR immediately.",
            "created_at": datetime.now().isoformat()
        }
        await supabase.save_briefing(briefing)
        events.append("AI incident briefing generated.")
        
    else:
        simulation_state["active"] = False
        simulation_state["status"] = "FINISHED"
        return {"status": "finished", "message": "Simulation complete."}
        
    simulation_state["step"] += 1
    
    return {
        "status": "success", 
        "step": step, 
        "events": events,
        "next_step": simulation_state["step"]
    }

@router.post("/stop")
async def stop_simulation():
    """Stop the simulation."""
    simulation_state["active"] = False
    simulation_state["status"] = "STOPPED"
    return {"status": "success", "message": "Simulation stopped."}

@router.get("/status")
async def get_status():
    """Get simulation status."""
    return simulation_state
