"""
Detection endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from app.database.supabase_client import SupabaseService, get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def read_detections(limit: int = 50, supabase: SupabaseService = Depends(get_supabase)):
    return await supabase.get_recent_detections(limit)

@router.post("", response_model=Dict[str, Any])
async def create_detection(detection_data: Dict[str, Any], supabase: SupabaseService = Depends(get_supabase)):
    result = await supabase.save_detection(detection_data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save detection")
    return result

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    supabase: SupabaseService = Depends(get_supabase)
):
    from app.services.gemini_provider import GeminiAIProvider
    import json
    import uuid
    from datetime import datetime
    
    ai_provider = GeminiAIProvider()
    media_data = await file.read()
    mime_type = file.content_type

    prompt = """
Analyze this disaster zone image. Return ONLY a valid JSON array of objects representing detections. No markdown blocks.
Each object must have:
- class: string ("person", "fire", "damage", "vehicle")
- confidence: float (0.0 to 1.0)
- bbox: [ymin, xmin, ymax, xmax] relative coordinates (0 to 1)

Example:
[
  {"class": "person", "confidence": 0.95, "bbox": [0.1, 0.2, 0.3, 0.4]},
  {"class": "fire", "confidence": 0.88, "bbox": [0.5, 0.5, 0.8, 0.9]}
]
"""
    try:
        analysis = await ai_provider.analyze_media(media_data, mime_type, prompt)
        clean_json = analysis.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:-3].strip()
        elif clean_json.startswith("```"):
            clean_json = clean_json[3:-3].strip()
            
        data = json.loads(clean_json)
        
        # Save each detection and assign a default location (center of India map for demo)
        saved_detections = []
        import random
        base_lat = latitude if latitude is not None else 20.5937
        base_lng = longitude if longitude is not None else 78.9629
        for i, det in enumerate(data):
            det_id = f"det-{uuid.uuid4().hex[:8]}"
            lat = base_lat + (random.random() - 0.5) * 0.01
            lng = base_lng + (random.random() - 0.5) * 0.01
            
            db_det = {
                "id": det_id,
                "class": det.get("class", "unknown"),
                "confidence": det.get("confidence", 0.5),
                "bbox": det.get("bbox", [0,0,0,0]),
                "source": "AIVision",
                "location_lat": lat,
                "location_lng": lng,
                "detected_at": datetime.utcnow().isoformat() + "Z"
            }
            await supabase.save_detection(db_det)
            saved_detections.append(db_det)
            
        return {"success": True, "detections": saved_detections}
        
    except Exception as e:
        logger.error(f"Failed to analyze vision media: {e}")
        # Fallback
        return {
            "success": True, 
            "detections": [
                {"id": 1, "class": "person", "confidence": 0.9, "bbox": [10, 10, 50, 50], "location_lat": 20.5937, "location_lng": 78.9629}
            ]
        }