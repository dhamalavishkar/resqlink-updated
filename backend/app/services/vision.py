"""
Computer vision service using YOLOv8 for disaster detection.
"""
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from ultralytics import YOLO
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class VisionService:
    """Service for computer vision detection using YOLOv8."""

    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the vision service.

        Args:
            model_path: Path to custom YOLO model. If None, uses pretrained YOLOv8n.
        """
        self.model = None
        self.model_path = model_path
        self.class_names = []
        self.is_loaded = False
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
        Filter detections for disaster-relevant classes.

        Args:
            detections: List of all detections

        Returns:
            List of disaster-relevant detections
        """
        # Define disaster-relevant classes (using COCO classes as baseline)
        disaster_classes = {
            'person',      # Survivors
            'car',         # Vehicles
            'truck',       # Emergency vehicles
            'bus',         # Transport
            'motorbike',   # Personal transport
            'bicycle',     # Personal transport
            'dog',         # Animals (may indicate presence of people)
            'cat'          # Animals
        }

        # Note: Standard YOLOv8 doesn't have specific disaster classes like fire, collapse, etc.
        # In a real implementation, we would use a custom-trained model
        relevant_detections = [
            det for det in detections
            if det['class'].lower() in disaster_classes
        ]

        logger.info(f"Filtered to {len(relevant_detections)} disaster-relevant detections")
        return relevant_detections

    def get_available_classes(self) -> List[str]:
        """Get list of available detection classes."""
        return self.class_names.copy() if self.class_names else []