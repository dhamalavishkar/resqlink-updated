"""
Detection endpoints.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def read_detections():
    return [{"id": 1, "class": "person", "confidence": 0.9, "bbox": [10, 10, 50, 50]}]

@router.post("")
async def create_detection():
    return {"id": 2, "class": "fire", "confidence": 0.8, "bbox": [20, 20, 60, 60]}

@router.get("/{detection_id}")
async def read_detection(detection_id: int):
    return {"id": detection_id, "class": "person", "confidence": 0.9, "bbox": [10, 10, 50, 50]}

@router.put("/{detection_id}")
async def update_detection(detection_id: int):
    return {"id": detection_id, "class": "person", "confidence": 0.95, "bbox": [10, 10, 50, 50]}

@router.delete("/{detection_id}")
async def delete_detection(detection_id: int):
    return {"message": "Detection deleted"}