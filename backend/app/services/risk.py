"""
Risk calculation service for determining zone risk scores.
"""
from typing import Dict, Any, List
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RiskCalculationService:
    """Service for calculating risk scores for disaster zones."""

    def __init__(self):
        """Initialize the risk calculation service with default weights."""
        # Default weights - these should be configurable
        self.weights = {
            'survivor': 0.25,      # Weight for survivor factor
            'fire': 0.20,          # Weight for fire factor
            'damage': 0.15,        # Weight for structural damage factor
            'report': 0.15,        # Weight for report factor
            'population': 0.10,    # Weight for population density factor
            'accessibility': 0.05, # Weight for accessibility factor
            'recency': 0.10        # Weight for recency factor
        }

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
        Calculate risk score for a zone based on various factors.

        Args:
            zone_data: Dictionary containing zone information including:
                - survivors: number of survivors detected
                - fires: number of active fires
                - damage: structural damage indicators
                - reports: number of field reports
                - population: estimated population in zone
                - accessibility: accessibility score (0-1, where 1 is best)
                - last_updated: timestamp of last update
                - confidence: confidence in the data (0-1)

        Returns:
            Dictionary containing risk score, severity, and contributing factors
        """
        try:
            # Extract and normalize factors
            survivor_factor = min(zone_data.get('survivors', 0) * 2.0, 30)  # Max 30 points
            fire_factor = min(zone_data.get('fires', 0) * 15.0, 30)       # Max 30 points
            damage_factor = min(zone_data.get('damage', 0) * 10.0, 20)    # Max 20 points
            report_factor = min(zone_data.get('reports', 0) * 2.0, 20)    # Max 20 points

            # Population factor (normalized by typical zone size)
            population = zone_data.get('population', 0)
            population_factor = min((population / 1000) * 5.0, 15) if population > 0 else 0  # Max 15 points

            # Accessibility factor (inverse - worse accessibility = higher risk)
            accessibility = zone_data.get('accessibility', 1.0)  # Default to good accessibility
            accessibility_factor = (1.0 - accessibility) * 10.0  # Max 10 points

            # Recency factor (newer data = lower risk)
            # This would typically compare last_updated to current time
            # For now, we'll use a simple factor based on confidence
            confidence = zone_data.get('confidence', 0.8)
            recency_factor = (1.0 - confidence) * 10.0  # Max 10 points for low confidence

            # Apply weights and calculate total score
            weighted_score = (
                survivor_factor * self.weights['survivor'] +
                fire_factor * self.weights['fire'] +
                damage_factor * self.weights['damage'] +
                report_factor * self.weights['report'] +
                population_factor * self.weights['population'] +
                accessibility_factor * self.weights['accessibility'] +
                recency_factor * self.weights['recency']
            )

            # Normalize to 0-100 scale
            risk_score = min(max(int(weighted_score), 0), 100)

            # Determine severity level
            severity = self._get_severity_level(risk_score)

            # Get top contributing factors
            factors = {
                'surviv)d': survivor_factor,
                'fire': fire_factor,
                'damage': damage_factor,
                'report': report_factor,
                'population': population_factor,
                'accessibility': accessibility_factor,
                'recency': recency_factor
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
            explanation = self._generate_explanation(zone_data, risk_score, severity, top_factors)

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