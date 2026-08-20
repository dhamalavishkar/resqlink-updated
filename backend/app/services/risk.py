"""
Risk calculation service for determining zone risk scores.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.core.config import settings
import logging
import math

logger = logging.getLogger(__name__)

class RiskCalculationService:
    """Service for calculating risk scores for disaster zones."""

    def __init__(self):
        """Initialize the risk calculation service with configurable weights."""
        # Load weights from settings with fallback to defaults
        self.weights = getattr(settings, 'RISK_CALCULATION_WEIGHTS', {
            'survivor': 0.25,      # Weight for survivor factor
            'fire': 0.20,          # Weight for fire factor
            'damage': 0.15,        # Weight for structural damage factor
            'report': 0.15,        # Weight for report factor
            'population': 0.10,    # Weight for population density factor
            'accessibility': 0.05, # Weight for accessibility factor
            'recency': 0.10        # Weight for recency factor
        })

        # Temporal decay settings
        self.temporal_decay_hours = getattr(settings, 'RISK_TEMPORAL_DECAY_HOURS', 24.0)

        # Environmental factor weights
        self.environmental_weights = getattr(settings, 'ENVIRONMENTAL_FACTOR_WEIGHTS', {
            'precipitation': 0.15,    # Rainfall increases flood/landslide risk
            'wind_speed': 0.10,       # High winds increase fire spread and structural risk
            'temperature': 0.05,      # Extreme temperatures affect survival and equipment
            'humidity': 0.05,         # Affects fire risk and comfort
            'infrastructure_vulnerability': 0.2  # Building age, materials, etc.
        })

        # Risk thresholds for severity classification
        self.thresholds = {
            'safe': 20,
            'low': 40,
            'medium': 60,
            'high': 80,
            'critical': 100
        }

    def calculate_risk_score(self, zone_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate risk score for a zone based on various factors with temporal decay and environmental factors.

        Args:
            zone_data: Dictionary containing zone information including:
                - survivors: number of survivors detected
                - fires: number of active fires
                - damage: structural damage indicators
                - reports: number of field reports (with optional timestamps)
                - population: estimated population in zone
                - accessibility: accessibility score (0-1, where 1 is best)
                - last_updated: timestamp of last update (ISO string)
                - confidence: confidence in the data (0-1)
                - environmental_data: dict with precipitation, wind_speed, temperature, humidity
                - infrastructure_vulnerability: score (0-1) representing building susceptibility

        Returns:
            Dictionary containing risk score, severity, and contributing factors
        """
        try:
            current_time = datetime.utcnow()

            # Extract base factors
            survivors = zone_data.get('survivors', 0)
            fires = zone_data.get('fires', 0)
            damage = zone_data.get('damage', 0)
            reports = zone_data.get('reports', 0)
            population = zone_data.get('population', 0)
            accessibility = zone_data.get('accessibility', 1.0)
            confidence = zone_data.get('confidence', 0.8)

            # Extract environmental data
            environmental_data = zone_data.get('environmental_data', {})
            infrastructure_vulnerability = zone_data.get('infrastructure_vulnerability', 0.0)

            # Apply temporal decay to reports and detections
            report_weight = self._apply_temporal_decay(
                zone_data.get('reports_with_timestamps', []),
                current_time
            ) if 'reports_with_timestamps' in zone_data else reports

            detection_weight = self._apply_temporal_decay(
                zone_data.get('detections_with_timestamps', []),
                current_time
            ) if 'detections_with_timestamps' in zone_data else (fires + damage)

            # Calculate normalized factors (0-100 scale)
            survivor_factor = min(survivors * 2.0, 30)  # Max 30 points
            fire_factor = min(fires * 15.0, 30)         # Max 30 points
            damage_factor = min(damage * 10.0, 20)      # Max 20 points

            # Report factor with temporal weighting
            report_factor = min(report_weight * 2.0, 20)  # Max 20 points

            # Population factor (normalized by typical zone size)
            population_factor = min((population / 1000) * 5.0, 15) if population > 0 else 0  # Max 15 points

            # Accessibility factor (inverse - worse accessibility = higher risk)
            accessibility_factor = (1.0 - accessibility) * 10.0  # Max 10 points

            # Recency factor based on data freshness
            last_updated_str = zone_data.get('last_updated')
            if last_updated_str:
                try:
                    last_updated = datetime.fromisoformat(last_updated_str.replace('Z', '+00:00'))
                    hours_old = (current_time - last_updated.replace(tzNone)).total_seconds() / 3600
                    # Newer data gets lower recency factor (less risk from staleness)
                    recency_factor = min(max(hours_old / self.temporal_decay_hours, 0), 1.0) * 10.0
                except:
                    recency_factor = (1.0 - confidence) * 10.0  # Fallback to confidence-based
            else:
                recency_factor = (1.0 - confidence) * 10.0  # Max 10 points for low confidence/no timestamp

            # Environmental factors
            precipitation = environmental_data.get('precipitation', 0.0)  # mm/hour
            wind_speed = environmental_data.get('wind_speed', 0.0)       # km/h
            temperature = abs(environmental_data.get('temperature', 20.0) - 20.0)  # Deviation from comfort
            humidity = environmental_data.get('humidity', 50.0)          # percentage

            precip_factor = min(precipitation * 2.0, 15.0)      # Max 15 points for heavy rain
            wind_factor = min(wind_speed / 10.0, 10.0)          # Max 10 points for high winds
            temp_factor = min(temperature / 5.0, 10.0)          # Max 10 points for extreme temps
            humidity_factor = min(abs(humidity - 50) / 5.0, 10.0)  # Max 10 points for abnormal humidity
            infra_factor = infrastructure_vulnerability * 20.0   # Max 20 points for poor infrastructure

            # Apply weights and calculate total score
            weighted_score = (
                survivor_factor * self.weights['survivor'] +
                fire_factor * self.weights['fire'] +
                damage_factor * self.weights['damage'] +
                report_factor * self.weights['report'] +
                population_factor * self.weights['population'] +
                accessibility_factor * self.weights['accessibility'] +
                recency_factor * self.weights['recency'] +
                precip_factor * self.environmental_weights['precipitation'] +
                wind_factor * self.environmental_weights['wind_speed'] +
                temp_factor * self.environmental_weights['temperature'] +
                humidity_factor * self.environmental_weights['humidity'] +
                infra_factor * self.environmental_weights['infrastructure_vulnerability']
            )

            # Normalize to 0-100 scale
            risk_score = min(max(int(weighted_score), 0), 100)

            # Determine severity level
            severity = self._get_severity_level(risk_score)

            # Get top contributing factors
            factors = {
                'survivors': survivor_factor,
                'fires': fire_factor,
                'damage': damage_factor,
                'reports': report_factor,
                'population': population_factor,
                'accessibility': accessibility_factor,
                'recency': recency_factor,
                'precipitation': precip_factor,
                'wind_speed': wind_factor,
                'temperature': temp_factor,
                'humidity': humidity_factor,
                'infrastructure': infra_factor
            }

            # Sort factors by contribution and get top 3
            sorted_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)
            top_factors = [
                {
                    'factor': name,
                    'contribution': round(contribution, 1),
                    'percentage': round((contribution / weighted_score) * 100, 1) if weighted_score > 0 else 0
                }
                for name, contribution in sorted_factors[:3] if contribution > 0
            ]

            # Generate explanation
            explanation = self._generate_explanation(zone_data, risk_score, severity, top_factors, factors)

            return {
                'risk_score': risk_score,
                'severity': severity,
                'explanation': explanation,
                'top_factors': top_factors,
                'all_factors': factors,
                'weighted_score': round(weighted_score, 2)
            }

        except Exception as e:
            logger.error(f"Error calculating risk score: {e}")
            # Return a safe default
            return {
                'risk_score': 0,
                'severity': 'SAFE',
                'explanation': 'Error in risk calculation - defaulting to safe',
                'top_factors': [],
                'all_factors': {},
                'weighted_score': 0
            }

    def _get_severity_level(self, score: int) -> str:
        """Convert numeric score to severity level."""
        if score >= self.thresholds['critical']:
            return 'CRITICAL'
        elif score >= self.thresholds['high']:
            return 'HIGH'
        elif score >= self.thresholds['medium']:
            return 'MEDIUM'
        elif score >= self.thresholds['low']:
            return 'LOW'
        else:
            return 'SAFE'

    def _generate_explanation(self, zone_data: Dict[str, Any], score: int, severity: str, top_factors: List[Dict]) -> str:
        """Generate human-readable explanation of the risk score."""
        zone_name = zone_data.get('name', 'Unknown Zone')

        explanation = f"Risk Assessment for {zone_name}:\n"
        explanation += f"Overall Risk Score: {score}/100 ({severity})\n\n"

        if top_factors:
            explanation += "Primary Contributing Factors:\n"
            for factor in top_factors:
                explanation += f"• {factor['factor'].title()}: {factor['contribution']} points ({factor['percentage']}%)\n"
        else:
            explanation += "No significant risk factors detected.\n"

        explanation += f"\nRecommended Action: {self._get_recommended_action(severity, zone_data)}"

        return explanation

    def _apply_temporal_decay(self, items_with_timestamps: List[Dict[str, Any]], current_time: datetime) -> float:
        """
        Apply temporal decay to a list of items with timestamps.
        More recent items have higher weight.

        Args:
            items_with_timestamps: List of dicts with 'timestamp' ISO string fields
            current_time: Current UTC time for comparison

        Returns:
            Weighted count based on temporal decay
        """
        if not items_with_timestamps:
            return 0.0

        total_weight = 0.0
        for item in items_with_timestamps:
            try:
                timestamp_str = item.get('timestamp', '')
                if timestamp_str:
                    item_time = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                    hours_old = (current_time - item_time.replace(tzinfo=None)).total_seconds() / 3600
                    # Exponential decay: weight = e^(-lambda * t)
                    # where lambda = ln(2) / half_life, and half_life = temporal_decay_hours
                    decay_factor = math.exp(-math.log(2) * hours_old / self.temporal_decay_hours)
                    total_weight += decay_factor
            except Exception as e:
                logger.warning(f"Could not parse timestamp {timestamp_str}: {e}")
                # If we can't parse timestamp, treat as recent (weight = 1.0)
                total_weight += 1.0

        return total_weight

    def _get_severity_level(self, score: int) -> str:
        """Convert numeric score to severity level."""
        if score >= self.thresholds['critical']:
            return 'CRITICAL'
        elif score >= self.thresholds['high']:
            return 'HIGH'
        elif score >= self.thresholds['medium']:
            return 'MEDIUM'
        elif score >= self.thresholds['low']:
            return 'LOW'
        else:
            return 'SAFE'

    def _generate_explanation(self, zone_data: Dict[str, Any], score: int, severity: str, top_factors: List[Dict], all_factors: Dict[str, float]) -> str:
        """Generate human-readable explanation of the risk score."""
        zone_name = zone_data.get('name', 'Unknown Zone')

        explanation = f"Risk Assessment for {zone_name}:\n"
        explanation += f"Overall Risk Score: {score}/100 ({severity})\n\n"

        if top_factors:
            explanation += "Primary Contributing Factors:\n"
            for factor in top_factors:
                explanation += f"• {factor['factor'].title()}: {factor['contribution']} points ({factor['percentage']}%)\n"
        else:
            explanation += "No significant risk factors detected.\n"

        # Add environmental context if available
        env_data = zone_data.get('environmental_data', {})
        if any(env_data.values()):
            explanation += f"\nEnvironmental Conditions:\n"
            if env_data.get('precipitation'):
                explanation += f"• Precipitation: {env_data['precipitation']} mm/h\n"
            if env_data.get('wind_speed'):
                explanation += f"• Wind Speed: {env_data['wind_speed']} km/h\n"
            if env_data.get('temperature'):
                explanation += f"• Temperature: {env_data['temperature']}°C\n"
            if env_data.get('humidity'):
                explanation += f"• Humidity: {env_data['humidity']}%\n"

        # Add infrastructure info
        infra_vuln = zone_data.get('infrastructure_vulnerability')
        if infra_vuln is not None:
            explanation += f"• Infrastructure Vulnerability: {infra_vuln:.1f}/1.0\n"

        explanation += f"\nRecommended Action: {self._get_recommended_action(severity, zone_data)}"
        return explanation

    def _get_recommended_action(self, severity: str, zone_data: Dict[str, Any]) -> str:
        """Get recommended action based on severity level."""
        actions = {
            'CRITICAL': "Deploy immediate search-and-rescue team and fire response unit. Consider evacuation.",
            'HIGH': "Deploy search-and-rescue team. Increase monitoring and prepare resources.",
            'MEDIUM': "Increase monitoring. Prepare resources for potential deployment.",
            'LOW': "Continue routine monitoring.",
            'SAFE': "No immediate action required."
        }
        return actions.get(severity, "Monitor situation closely.")

    def calculate_multiple_zones(self, zones_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate risk scores for multiple zones.

        Args:
            zones_data: List of zone data dictionaries

        Returns:
            List of zones with added risk score information
        """
        results = []
        for zone_data in zones_data:
            risk_result = self.calculate_risk_score(zone_data)
            zone_data.update(risk_result)
            results.append(zone_data)
        return results