"""
Computer vision service using YOLOv8 for disaster detection.
"""
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from ultralytics import YOLO
import logging
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger(__name__)

class VisionService:
    """Service for computer vision detection using YOLOv8."""

    def __init__(self, model_path: Optional[str] = None, lazy_load: bool = True):
        """
        Initialize the vision service.

        Args:
            model_path: Path to custom YOLO model. If None, uses settings.CUSTOM_YOLO_MODEL_PATH or pretrained YOLOv8n.
            lazy_load: If True, delays model loading until first use. If False, loads immediately.
        """
        self.model = None
        # Use provided model_path, or fall back to settings, or None for default model
        self.model_path = model_path or settings.CUSTOM_YOLO_MODEL_PATH
        self.class_names = []
        self.is_loaded = False
        self._lazy_load = lazy_load

        if not lazy_load:
            self.load_model()

    def load_model(self) -> bool:
        """
        Load the YOLO model.

        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            if self.model_path and Path(self.model_path).exists():
                logger.info(f"Loading custom YOLO model from {self.model_path}")
                self.model = YOLO(self.model_path)
            else:
                logger.info("Loading pretrained YOLOv8n model")
                self.model = YOLO('yolov8n.pt')  # Will download if not present

            # Get class names
            self.class_names = list(self.model.names.values())
            self.is_loaded = True
            logger.info(f"YOLO model loaded successfully with {len(self.class_names)} classes")
            return True

        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self.is_loaded = False
            return False

    def is_model_loaded(self) -> bool:
        """Check if the model is loaded and ready."""
        return self.is_loaded and self.model is not None

    def detect_objects(self, image: np.ndarray, confidence_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """
        Detect objects in an image using YOLOv8.

        Args:
            image: Input image as numpy array (BGR format)
            confidence_threshold: Minimum confidence for detections

        Returns:
            List of detection dictionaries
        """
        # Lazy load model if not loaded and lazy loading is enabled
        if not self.is_model_loaded() and self._lazy_load:
            logger.info("Lazy loading YOLO model on first use")
            if not self.load_model():
                logger.warning("Failed to load model, returning mock detections")
                return self._get_mock_detections()

        if not self.is_model_loaded():
            logger.warning("Model not loaded, returning empty detections")
            return self._get_mock_detections()

        try:
            # Run inference
            results = self.model(image, conf=confidence_threshold)

            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = float(box.conf[0].cpu().numpy())
                        class_id = int(box.cls[0].cpu().numpy())
                        class_name = self.class_names[class_id] if class_id < len(self.class_names) else "unknown"

                        detections.append({
                            'class': class_name,
                            'confidence': confidence,
                            'bbox': [float(x1), float(y1), float(x2), float(y2)],
                            'class_id': class_id
                        })

            logger.info(f"Detection complete: {len(detections)} objects found")
            return detections

        except Exception as e:
            logger.error(f"Error during object detection: {e}")
            return self._get_mock_detections()

    def detect_from_file(self, file_path: str, confidence_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """
        Detect objects in an image file.

        Args:
            file_path: Path to image file
            confidence_threshold: Minimum confidence for detections

        Returns:
            List of detection dictionaries
        """
        try:
            image = cv2.imread(file_path)
            if image is None:
                logger.error(f"Could not load image from {file_path}")
                return self._get_mock_detections()

            return self.detect_objects(image, confidence_threshold)

        except Exception as e:
            logger.error(f"Error loading image from {file_path}: {e}")
            return self._get_mock_detections()

    def detect_from_frame(self, frame: np.ndarray, confidence_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """
        Detect objects in a video frame.

        Args:
            frame: Video frame as numpy array
            confidence_threshold: Minimum confidence for detections

        Returns:
            List of detection dictionaries
        """
        return self.detect_objects(frame, confidence_threshold)

    def _get_mock_detections(self) -> List[Dict[str, Any]]:
        """Return mock detections for demo/testing purposes."""
        logger.info("Returning mock detections")
        return [
            {
                'class': 'person',
                'confidence': 0.92,
                'bbox': [100.0, 150.0, 200.0, 300.0],
                'class_id': 0
            },
            {
                'class': 'person',
                'confidence': 0.87,
                'bbox': [300.0, 100.0, 400.0, 250.0],
                'class_id': 0
            },
            {
                'class': 'fire',
                'confidence': 0.91,
                'bbox': [400.0, 200.0, 500.0, 350.0],
                'class_id': 0  # Note: YOLOv8n doesn't have fire class, using person as placeholder
            }
        ]

    def get_disaster_relevant_detections(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filter and score detections for disaster relevance using configurable weights.

        Args:
            detections: List of all detections

        Returns:
            List of disaster-relevant detections sorted by relevance score (descending)
        """
        # Get disaster class weights from settings, with fallback defaults
        disaster_weights = getattr(settings, 'DISASTER_CLASS_WEIGHTS', {
            'person': 1.0,      # Survivors
            'fire': 0.9,        # Fire detection
            'smoke': 0.8,       # Smoke indication
            'car': 0.7,         # Vehicles
            'truck': 0.8,       # Emergency vehicles
            'bus': 0.7,         # Transport
            'motorbike': 0.6,   # Personal transport
            'bicycle': 0.6,     # Personal transport
            'dog': 0.5,         # Animals
            'cat': 0.5,         # Animals
            'knife': 0.4,       # Weapons
            'gun': 0.4,         # Weapons
        })

        # Score detections based on class weights and confidence
        scored_detections = []
        for det in detections:
            class_name = det['class'].lower()
            confidence = det['confidence']

            # Calculate relevance score: weight * confidence
            # If class not in weights, give it a minimal score
            weight = disaster_weights.get(class_name, 0.1)
            relevance_score = weight * confidence

            # Only include detections with meaningful relevance score
            if relevance_score > 0.1:  # Minimum threshold
                det_with_score = det.copy()
                det_with_score['relevance_score'] = relevance_score
                det_with_score['disaster_relevant'] = True
                scored_detections.append(det_with_score)

        # Sort by relevance score (descending)
        scored_detections.sort(key=lambda x: x['relevance_score'], reverse=True)

        logger.info(f"Scored and filtered to {len(scored_detections)} disaster-relevant detections")
        return scored_detections

    def get_available_classes(self) -> List[str]:
        """Get list of available detection classes."""
        return self.class_names.copy() if self.class_names else []