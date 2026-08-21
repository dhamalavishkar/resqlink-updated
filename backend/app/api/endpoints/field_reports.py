"""
Field Reports endpoint for processing video/image uploads from the field.
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Dict, Any, Optional
from app.services.gemini_provider import GeminiAIProvider
from app.database.supabase_client import SupabaseService, get_supabase
import logging
import json
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize AI Provider
ai_provider = GeminiAIProvider()

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_field_media(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    disaster_type: str = Form("general"),
    description: Optional[str] = Form(""),
    supabase: SupabaseService = Depends(get_supabase)
):
    """
    Analyze an uploaded image or video clip from the field to estimate logistics and survival needs.
    """
    try:
        logger.info(f"Received media upload: {file.filename}, type: {file.content_type}, loc: {latitude}, {longitude}")
        
        # Read file into memory
        media_data = await file.read()
        mime_type = file.content_type

        # Construct a dynamic prompt based on disaster type
        prompt = f"""
You are an expert AI emergency logistics planner analyzing an image from a {disaster_type} disaster zone.
IMPORTANT: The user has EXPLICITLY identified this incident as a **{disaster_type}**. You MUST categorize and analyze this strictly as a {disaster_type}, even if the visual evidence is ambiguous.

Please analyze the media and return ONLY a valid JSON object with the following structure (no markdown blocks, just raw JSON):
{{
  "people_count": <integer, estimate how many people are visible/stuck>,
  "food_needed_kg": <float, estimate kg of food needed for 24 hours based on people count>,
  "water_needed_liters": <float, estimate liters of water needed for 24 hours>,
  "emergency_equipment": ["list", "of", "specific", "equipment"],
  "survival_advice": "Brief, actionable advice to broadcast back to the victims to keep them safe until rescue arrives based strictly on the {disaster_type} context.",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "incident_title": "A short, descriptive title for this {disaster_type} incident"
}}

CRITICAL INSTRUCTION: The suggested `emergency_equipment` MUST be highly specific to a `{disaster_type}`. 
- For an EARTHQUAKE: Suggest heavy lifting equipment, concrete cutters, seismic sensors, etc.
- For a FLOOD: Suggest life jackets, rescue boats, hovercrafts, sandbags, water pumps, etc.
- For a FIRE: Suggest fire blankets, oxygen masks, extinguishers, fire retardant, etc.

User's description (if any): {description}
"""
        
        # Analyze using Gemini
        # We assume the analyze_media method works for both image and video if supported by Gemini 1.5 Pro
        # For this hackathon, we'll primarily test with images or very short clips.
        analysis_result_text = await ai_provider.analyze_media(media_data, mime_type, prompt)
        
        # Strip markdown if present
        clean_json = analysis_result_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:-3].strip()
        elif clean_json.startswith("```"):
            clean_json = clean_json[3:-3].strip()

        # Parse JSON
        try:
            analysis_data = json.loads(clean_json)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI response as JSON. Raw response: {analysis_result_text}")
            raise HTTPException(status_code=500, detail="AI failed to generate a valid logistics report.")

        # Save to Supabase as an Incident
        incident_id = f"inc-{uuid.uuid4().hex[:8]}"
        incident_data = {
            "id": incident_id,
            "title": f"Field Report: {disaster_type.title()}",
            "description": f"AI Logistics Report: {json.dumps(analysis_data, indent=2)}",
            "severity": analysis_data.get("severity", "HIGH"),
            "location_lat": latitude,
            "location_lng": longitude,
            "status": "OPEN",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Use existing Supabase Service to create incident
        await supabase.create_incident(incident_data)

        # Return both the parsed data and the newly created incident info
        return {
            "success": True,
            "analysis": analysis_data,
            "incident": incident_data
        }

    except Exception as e:
        logger.error(f"Error processing field report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
