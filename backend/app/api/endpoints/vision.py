"""
Computer vision endpoints for YOLOv8 analysis.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any
import numpy as np
import cv2
import logging
from app.services.vision import VisionService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize vision service with lazy loading for faster startup
vision_service = VisionService(lazy_load=True)

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded image for disaster-related objects.

    Returns:
    {
        "detections": [...],
        "count": N,
        "processing_time": "X ms"
    }
    """
    try:
        logger.info(f"Received image analysis request for file: {file.filename}")

        # Read image data
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Run detection
        detections = vision_service.detect_objects(image)

        # Filter and score for disaster-relevant detections
        disaster_detections = vision_service.get_disaster_relevant_detections(detections)

        logger.info(f"Analysis complete: {len(detections)} total detections, {len(disaster_detections)} disaster-relevant")

        return {
            "detections": disaster_detections,
            "all_detections": detections,
            "count": len(disaster_detections),
            "filename": file.filename,
            "processing_info": {
                "model_loaded": vision_service.is_model_loaded(),
                "available_classes": vision_service.get_available_classes()[:10]  # First 10 classes
            }
        }

    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")

@router.post("/analyze/frame")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Analyze a video frame (same as image analysis for MVP).
    """
    return await analyze_image(file)

@router.get("/model/status")
async def vision_model_status():
    """Get status of the vision model."""
    return {
        "model_loaded": vision_service.is_model_loaded(),
        "model_path": vision_service.model_path,
        "available_classes": vision_service.get_available_classes(),
        "classes_count": len(vision_service.get_available_classes())
    }

@router.post("/model/load")
async def load_custom_model(model_path: str):
    """
    Load a custom YOLO model (for future use with disaster-specific weights).
    """
    try:
        logger.info(f"Attempting to load custom model from: {model_path}")
        vision_service.model_path = model_path
        success = vision_service.load_model()
        if success:
            return {"status": "success", "message": f"Model loaded from {model_path}"}
        else:
            raise HTTPException(status_code=400, detail="Failed to load model")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")