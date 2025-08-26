# backend/app/core/services/historical_service.py
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from scipy import stats
from scipy.spatial.distance import cosine, euclidean
import logging

logger = logging.getLogger(__name__)


class HistoricalService:
    """Historical context and analogies service."""

    def __init__(self):
        """Initialize with predefined historical contexts."""
        self.historical_contexts = self._load_historical_contexts()

    def _load_historical_contexts(self) -> Dict[str, Dict[str, Any]]:
        """Load predefined historical market contexts and crises."""
        contexts = {
            "great_depression_1929": {
                "name": "Great Depression (1929-1939)",
                "period": "1929-1939",
                "trigger_events": [
                    "Stock market crash of October 1929",
                    "Bank failures across the US",
                    "Dust Bowl agricultural crisis",
                    "International trade collapse"
                ],
                "key_indicators": [
                    {"indicator": "unemployment_rate", "peak_value": 25.0, "unit": "%"},
                    {"indicator": "gdp_decline", "value": -26.7, "unit": "%"},
                    {"indicator": "stock_market_decline", "value": -89.0, "unit": "%"},
                    {"indicator": "deflation_rate", "value": -10.3, "unit": "%"}
                ],
                "market_impact": {
                    "equities": "Catastrophic decline, 89% peak-to-trough",
                    "bonds": "Government bonds performed well as deflation set in",
                    "commodities": "Severe decline, especially agricultural products",
                    "real_estate": "Major decline in property values"
                },
                "policy_response": [
                    "New Deal programs introduced",
                    "Banking system reforms",
                    "Federal Deposit Insurance Corporation (FDIC) created",
                    "Gold standard abandoned"
                ],
                "duration_months": 120,  # 10 years
                "recovery_characteristics": {
                    "full_recovery_years": 25,
                    "policy_effectiveness": "moderate",
                    "structural_changes": "major"
                }
            },

            "stagflation_1970s": {
                "name": "Stagflation Crisis (1973-1982)",
                "period": "1973-1982",
                "trigger_events": [
                    "Oil embargo of 1973",
                    "Iranian Revolution (1979)",
                    "Wage-price spiral",
                    "Monetary policy mistakes"
                ],
                "key_indicators": [
                    {"indicator": "inflation_rate", "peak_value": 14.8, "unit": "%"},
                    {"indicator": "unemployment_rate", "peak_value": 10.8, "unit": "%"},
                    {"indicator": "fed_funds_rate", "peak_value": 20.0, "unit": "%"},
                    {"indicator": "oil_price_increase", "value": 400.0, "unit": "%"}
                ],
                "market_impact": {
                    "equities": "Poor performance, high volatility",
                    "bonds": "Negative real returns due to high inflation",
                    "commodities": "Strong performance, especially energy and gold",
                    "real_estate": "Mixed performance, high mortgage rates"
                },
                "policy_response": [
                    "Volcker shock - aggressive rate hikes",
                    "Supply-side economic policies",
                    "Energy conservation programs",
                    "Deregulation initiatives"
                ],
                "duration_months": 108,  # 9 years
                "recovery_characteristics": {
                    "full_recovery_years": 5,
                    "policy_effectiveness": "high",
                    "structural_changes": "moderate"
                }
            },

            "black_monday_1987": {
                "name": "Black Monday Crash (1987)",
                "period": "1987",
                "trigger_events": [
                    "Program trading acceleration",
                    "Interest rate concerns",
                    "Trade deficit worries",
                    "Portfolio insurance selling"
                ],
                "key_indicators": [
                    {"indicator": "single_day_decline", "peak_value": -22.6, "unit": "%"},
                    {"indicator": "volatility_spike", "value": 150.0, "unit": "%"},
                    {"indicator": "volume_increase", "value": 300.0, "unit": "%"}
                ],
                "market_impact": {
                    "equities": "Sharp single-day crash, quick partial recovery",
                    "bonds": "Flight to quality, strong performance",
                    "commodities": "Mixed impact, gold benefited initially",
                    "real_estate": "Minimal direct impact"
                },
                "policy_response": [
                    "Fed liquidity provision",
                    "Market circuit breakers implemented",
                    "Coordinated central bank response",
                    "Trading system reforms"
                ],
                "duration_months": 6,
                "recovery_characteristics": {
                    "full_recovery_years": 2,
                    "policy_effectiveness": "high",
                    "structural_changes": "minor"
                }
            },

            "dot_com_crash_2000": {
                "name": "Dot-com Crash (2000-2002)",
                "period": "2000-2002",
                "trigger_events": [
                    "Technology stock overvaluation",
                    "Venture capital funding reduction",
                    "Y2K spending cliff",
                    "Rising interest rates"
                ],
                "key_indicators": [
                    {"indicator": "nasdaq_decline", "peak_value": -78.0, "unit": "%"},
                    {"indicator": "tech_companies_failed", "value": 500, "unit": "count"},
                    {"indicator": "vc_funding_decline", "value": -70.0, "unit": "%"}
                ],
                "market_impact": {
                    "equities": "Tech sector devastated, value stocks outperformed",
                    "bonds": "Strong performance as rates fell",
                    "commodities": "Mixed performance, energy weak",
                    "real_estate": "Beginning of housing boom"
                },
                "policy_response": [
                    "Aggressive rate cuts by Fed",
                    "Fiscal stimulus measures",
                    "Accounting reforms (Sarbanes-Oxley)",
                    "Corporate governance improvements"
                ],
                "duration_months": 30,
                "recovery_characteristics": {
                    "full_recovery_years": 7,
                    "policy_effectiveness": "moderate",
                    "structural_changes": "moderate"
                }
            },

            "financial_crisis_2008": {
                "name": "Global Financial Crisis (2007-2009)",
                "period": "2007-2009",
                "trigger_events": [
                    "Subprime mortgage crisis",
                    "Lehman Brothers collapse",
                    "Credit market freeze",
                    "Global banking crisis"
                ],
                "key_indicators": [
                    {"indicator": "sp500_decline", "peak_value": -57.0, "unit": "%"},
                    {"indicator": "unemployment_rate", "peak_value": 10.0, "unit": "%"},
                    {"indicator": "gdp_decline", "value": -4.3, "unit": "%"},
                    {"indicator": "housing_decline", "value": -33.0, "unit": "%"}
                ],
                "market_impact": {
                    "equities": "Major decline across all sectors",
                    "bonds": "Government bonds rallied, corporates struggled",
                    "commodities": "Initial decline, then recovery",
                    "real_estate": "Catastrophic decline in housing"
                },
                "policy_response": [
                    "Quantitative easing programs",
                    "TARP bailout program",
                    "Zero interest rate policy",
                    "Dodd-Frank financial reforms"
                ],
                "duration_months": 24,
                "recovery_characteristics": {
                    "full_recovery_years": 6,
                    "policy_effectiveness": "high",
                    "structural_changes": "major"
                }
            },

            "covid_crash_2020": {
                "name": "COVID-19 Pandemic Crash (2020)",
                "period": "2020",
                "trigger_events": [
                    "Global pandemic declaration",
                    "Economic lockdowns worldwide",
                    "Supply chain disruptions",
                    "Oil price war"
                ],
                "key_indicators": [
                    {"indicator": "fastest_bear_market", "value": 22, "unit": "days"},
                    {"indicator": "sp500_decline", "peak_value": -34.0, "unit": "%"},
                    {"indicator": "unemployment_spike", "peak_value": 14.7, "unit": "%"},
                    {"indicator": "vix_peak", "value": 82.69, "unit": "index"}
                ],
                "market_impact": {
                    "equities": "Sharp decline followed by rapid recovery",
                    "bonds": "Government bonds rallied initially",
                    "commodities": "Oil collapsed, gold performed well",
                    "real_estate": "Commercial real estate struggled, residential boomed"
                },
                "policy_response": [
                    "Unprecedented fiscal stimulus",
                    "Federal Reserve emergency programs",
                    "Corporate bond purchase programs",
                    "Enhanced unemployment benefits"
                ],
                "duration_months": 3,  # Very short crisis
                "recovery_characteristics": {
                    "full_recovery_years": 1,
                    "policy_effectiveness": "very_high",
                    "structural_changes": "moderate"
                }
            }
        }
        return contexts

    def get_historical_scenarios(self) -> List[str]:
        """Get available historical scenario keys."""
        return list(self.historical_contexts.keys())

    def display_historical_context(self, scenario_key: str) -> Dict[str, Any]:
        """
        Get detailed historical context for a scenario.

        Args:
            scenario_key: Key of the historical scenario

        Returns:
            Dictionary with historical context details
        """
        if scenario_key not in self.historical_contexts:
            raise ValueError(f"Unknown historical scenario: {scenario_key}")

        return self.historical_contexts[scenario_key]

    def find_historical_analogies(
            self,
            current_market_data: Dict[str, float],
            metrics: Optional[List[str]] = None,
            top_n: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Find historical periods most similar to current market conditions.

        Args:
            current_market_data: Current market metrics (e.g., {'volatility': 0.2, 'returns': -0.1})
            metrics: List of metrics to consider for similarity
            top_n: Number of top analogies to return

        Returns:
            List of historical analogies with similarity scores
        """
        if metrics is None:
            metrics = ['volatility', 'returns', 'valuation', 'sentiment']

        # Normalize current market data
        current_vector = self._create_market_vector(current_market_data, metrics)

        analogies = []

        for scenario_key, context in self.historical_contexts.items():
            # Create historical market vector (estimated based on known conditions)
            historical_vector = self._estimate_historical_vector(context, metrics)

            # Calculate similarity score
            similarity_score = self._calculate_similarity_score(current_vector, historical_vector)

            analogy = {
                "scenario_key": scenario_key,
                "name": context["name"],
                "period": context["period"],
                "similarity_score": similarity_score,
                "distance_metrics": self._calculate_distance_metrics(current_vector, historical_vector),
                "key_similarities": self._identify_key_similarities(
                    current_market_data, context, similarity_score
                ),
                "potential_outcomes": self._extract_potential_outcomes(context),
                "policy_implications": context.get("policy_response", [])
            }

            analogies.append(analogy)

        # Sort by similarity score (higher is more similar)
        analogies.sort(key=lambda x: x["similarity_score"], reverse=True)

        return analogies[:top_n]

    def calculate_similarity_score(
            self,
            current_data: Dict[str, float],
            historical_scenario: str,
            weights: Optional[Dict[str, float]] = None
    ) -> float:
        """
        Calculate similarity score between current conditions and historical scenario.

        Args:
            current_data: Current market conditions
            historical_scenario: Historical scenario key
            weights: Weights for different metrics

        Returns:
            Similarity score (0-1, higher is more similar)
        """
        if historical_scenario not in self.historical_contexts:
            raise ValueError(f"Unknown historical scenario: {historical_scenario}")

        if weights is None:
            weights = {'volatility': 0.3, 'returns': 0.3, 'sentiment': 0.2, 'valuation': 0.2}

        context = self.historical_contexts[historical_scenario]

        # Create vectors
        current_vector = self._create_market_vector(current_data, list(weights.keys()))
        historical_vector = self._estimate_historical_vector(context, list(weights.keys()))

        # Calculate weighted similarity
        similarity = self._calculate_similarity_score(current_vector, historical_vector, weights)

        return similarity

    def analyze_historical_patterns(
            self,
            metric_name: str,
            time_series_data: pd.Series
    ) -> Dict[str, Any]:
        """
        Analyze patterns in time series data against historical contexts.

        Args:
            metric_name: Name of the metric being analyzed
            time_series_data: Time series of the metric

        Returns:
            Dictionary with pattern analysis
        """
        analysis = {
            "metric": metric_name,
            "current_level": time_series_data.iloc[-1],
            "percentile_historical": self._calculate_historical_percentile(metric_name, time_series_data.iloc[-1]),
            "trend_analysis": self._analyze_trend(time_series_data),
            "volatility_regime": self._identify_volatility_regime(time_series_data),
            "historical_analogs": []
        }

        # Find similar historical patterns
        for scenario_key, context in self.historical_contexts.items():
            pattern_similarity = self._compare_pattern_to_historical(
                time_series_data, context, metric_name
            )

            if pattern_similarity > 0.6:  # Threshold for meaningful similarity
                analysis["historical_analogs"].append({
                    "scenario": context["name"],
                    "similarity": pattern_similarity,
                    "key_characteristics": self._extract_pattern_characteristics(context, metric_name)
                })

        # Sort analogs by similarity
        analysis["historical_analogs"].sort(key=lambda x: x["similarity"], reverse=True)

        return analysis

    def add_historical_scenario(
            self,
            key: str,
            name: str,
            period: str,
            trigger_events: List[str],
            key_indicators: List[Dict[str, Any]],
            market_impact: Dict[str, str],
            policy_response: List[str]
    ) -> None:
        """
        Add a new historical scenario to the collection.

        Args:
            key: Unique key for the scenario
            name: Display name
            period: Time period (e.g., "2020-2021")
            trigger_events: List of events that triggered the crisis
            key_indicators: List of key economic/market indicators
            market_impact: Impact on different asset classes
            policy_response: Policy responses taken
        """
        scenario = {
            "name": name,
            "period": period,
            "trigger_events": trigger_events,
            "key_indicators": key_indicators,
            "market_impact": market_impact,
            "policy_response": policy_response,
            "added_at": datetime.now().isoformat(),
            "user_added": True
        }

        self.historical_contexts[key] = scenario
        logger.info(f"Added historical scenario: {name}")

    def get_scenario_timeline(self, scenario_key: str) -> Dict[str, Any]:
        """
        Get a timeline view of a historical scenario.

        Args:
            scenario_key: Historical scenario key

        Returns:
            Timeline data for the scenario
        """
        if scenario_key not in self.historical_contexts:
            raise ValueError(f"Unknown historical scenario: {scenario_key}")

        context = self.historical_contexts[scenario_key]

        # Create a timeline structure
        timeline = {
            "scenario": context["name"],
            "period": context["period"],
            "duration_months": context.get("duration_months", 12),
            "phases": self._create_scenario_phases(context),
            "key_events": self._extract_timeline_events(context),
            "market_performance": self._create_market_timeline(context),
            "policy_timeline": self._create_policy_timeline(context)
        }

        return timeline

    def _create_market_vector(
            self,
            market_data: Dict[str, float],
            metrics: List[str]
    ) -> np.ndarray:
        """Create a normalized vector from market data."""
        vector = []
        for metric in metrics:
            value = market_data.get(metric, 0.0)
            # Normalize values to 0-1 range based on typical ranges
            normalized_value = self._normalize_metric(metric, value)
            vector.append(normalized_value)
        return np.array(vector)

    def _estimate_historical_vector(
            self,
            context: Dict[str, Any],
            metrics: List[str]
    ) -> np.ndarray:
        """Estimate historical market conditions as a vector."""
        # This is a simplified estimation based on the crisis characteristics
        vector = []
        for metric in metrics:
            if metric == 'volatility':
                # Estimate volatility based on crisis severity
                severity = self._estimate_crisis_severity(context)
                volatility = 0.1 + (severity * 0.4)  # 10% to 50% volatility
                vector.append(self._normalize_metric('volatility', volatility))

            elif metric == 'returns':
                # Use market decline if available
                decline = self._extract_market_decline(context)
                vector.append(self._normalize_metric('returns', decline))

            elif metric == 'sentiment':
                # Estimate sentiment based on crisis duration and policy response
                sentiment = self._estimate_market_sentiment(context)
                vector.append(self._normalize_metric('sentiment', sentiment))

            elif metric == 'valuation':
                # Estimate valuation impact
                valuation = self._estimate_valuation_impact(context)
                vector.append(self._normalize_metric('valuation', valuation))

            else:
                vector.append(0.5)  # Default neutral value

        return np.array(vector)

    def _calculate_similarity_score(
            self,
            vector1: np.ndarray,
            vector2: np.ndarray,
            weights: Optional[Dict[str, float]] = None
    ) -> float:
        """Calculate similarity score between two vectors."""
        # Use cosine similarity (1 - cosine distance)
        if len(vector1) == 0 or len(vector2) == 0:
            return 0.0

        # Apply weights if provided
        if weights is not None:
            weight_vector = np.array(list(weights.values()))
            vector1 = vector1 * weight_vector
            vector2 = vector2 * weight_vector

        try:
            similarity = 1 - cosine(vector1, vector2)
            # Ensure similarity is between 0 and 1
            return max(0.0, min(1.0, similarity))
        except:
            return 0.0

    def _calculate_distance_metrics(
            self,
            vector1: np.ndarray,
            vector2: np.ndarray
    ) -> Dict[str, float]:
        """Calculate various distance metrics between vectors."""
        try:
            cosine_dist = cosine(vector1, vector2) if len(vector1) > 0 else 1.0
            euclidean_dist = euclidean(vector1, vector2) if len(vector1) > 0 else 1.0

            return {
                "cosine_distance": cosine_dist,
                "cosine_similarity": 1 - cosine_dist,
                "euclidean_distance": euclidean_dist,
                "manhattan_distance": np.sum(np.abs(vector1 - vector2))
            }
        except:
            return {
                "cosine_distance": 1.0,
                "cosine_similarity": 0.0,
                "euclidean_distance": 1.0,
                "manhattan_distance": 1.0
            }

    def _normalize_metric(self, metric: str, value: float) -> float:
        """Normalize a metric value to 0-1 range."""
        # Define typical ranges for different metrics
        ranges = {
            'volatility': (0.05, 0.60),  # 5% to 60% volatility
            'returns': (-0.60, 0.40),  # -60% to +40% returns
            'sentiment': (-1.0, 1.0),  # -1 to +1 sentiment
            'valuation': (0.5, 3.0)  # 0.5x to 3x normal valuation
        }

        if metric not in ranges:
            return 0.5  # Default neutral value

        min_val, max_val = ranges[metric]
        normalized = (value - min_val) / (max_val - min_val)
        return max(0.0, min(1.0, normalized))

    def _estimate_crisis_severity(self, context: Dict[str, Any]) -> float:
        """Estimate crisis severity (0-1) based on context."""
        duration = context.get("duration_months", 12)
        recovery_years = context.get("recovery_characteristics", {}).get("full_recovery_years", 3)

        # Longer crises and recovery times indicate higher severity
        severity = min(1.0, (duration / 60.0) + (recovery_years / 10.0))
        return severity

    def _extract_market_decline(self, context: Dict[str, Any]) -> float:
        """Extract market decline percentage from context."""
        for indicator in context.get("key_indicators", []):
            if "decline" in indicator["indicator"] or "crash" in indicator["indicator"]:
                return indicator["value"] / 100.0  # Convert percentage to decimal
        return -0.20  # Default 20% decline

    def _estimate_market_sentiment(self, context: Dict[str, Any]) -> float:
        """Estimate market sentiment based on context."""
        # More trigger events and longer duration suggest worse sentiment
        trigger_count = len(context.get("trigger_events", []))
        duration = context.get("duration_months", 12)

        sentiment = -min(1.0, (trigger_count / 5.0) + (duration / 60.0))
        return sentiment

    def _estimate_valuation_impact(self, context: Dict[str, Any]) -> float:
        """Estimate valuation impact based on context."""
        decline = self._extract_market_decline(context)
        # Larger declines suggest greater valuation compression
        return 1.0 + decline  # If decline is -30%, valuation impact is 0.7

    def _identify_key_similarities(
            self,
            current_data: Dict[str, float],
            context: Dict[str, Any],
            similarity_score: float
    ) -> List[str]:
        """Identify key similarities between current and historical conditions."""
        similarities = []

        if similarity_score > 0.8:
            similarities.append("Very high overall similarity")
        elif similarity_score > 0.6:
            similarities.append("High overall similarity")

        # Add specific similarities based on data
        if current_data.get('volatility', 0) > 0.3:
            similarities.append("High volatility environment")
        if current_data.get('returns', 0) < -0.15:
            similarities.append("Significant market decline")

        return similarities

    def _extract_potential_outcomes(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract potential outcomes based on historical context."""
        recovery = context.get("recovery_characteristics", {})
        return {
            "recovery_time_estimate": f"{recovery.get('full_recovery_years', 3)} years",
            "policy_effectiveness": recovery.get("policy_effectiveness", "moderate"),
            "structural_changes": recovery.get("structural_changes", "minor"),
            "market_impact_duration": f"{context.get('duration_months', 12)} months"
        }

    def _calculate_historical_percentile(self, metric_name: str, current_value: float) -> float:
        """Calculate what percentile the current value represents historically."""
        # This is a simplified implementation
        # In practice, you'd use historical data for the metric
        if metric_name == 'volatility':
            # Assume normal volatility is 15%, crisis volatility is 40%
            if current_value > 0.40:
                return 95.0
            elif current_value > 0.30:
                return 85.0
            elif current_value > 0.20:
                return 70.0
            else:
                return 50.0
        return 50.0  # Default median

    def _analyze_trend(self, time_series: pd.Series) -> Dict[str, Any]:
        """Analyze trend in time series data."""
        if len(time_series) < 2:
            return {"trend": "insufficient_data"}

        recent_slope = np.polyfit(range(len(time_series[-20:])), time_series[-20:], 1)[0]

        trend = "flat"
        if recent_slope > 0.001:
            trend = "rising"
        elif recent_slope < -0.001:
            trend = "falling"

        return {
            "trend": trend,
            "slope": recent_slope,
            "recent_change": time_series.iloc[-1] - time_series.iloc[-20] if len(time_series) >= 20 else 0
        }

    def _identify_volatility_regime(self, time_series: pd.Series) -> str:
        """Identify current volatility regime."""
        if len(time_series) < 20:
            return "insufficient_data"

        recent_vol = time_series.rolling(20).std().iloc[-1]
        long_term_vol = time_series.std()

        vol_ratio = recent_vol / long_term_vol if long_term_vol > 0 else 1

        if vol_ratio > 1.5:
            return "high_volatility"
        elif vol_ratio < 0.7:
            return "low_volatility"
        else:
            return "normal_volatility"

    def _compare_pattern_to_historical(
            self,
            time_series: pd.Series,
            context: Dict[str, Any],
            metric_name: str
    ) -> float:
        """Compare time series pattern to historical scenario."""
        # This is a simplified pattern matching
        # In practice, you'd use more sophisticated time series analysis

        # For now, return a similarity based on trend and volatility
        trend_analysis = self._analyze_trend(time_series)
        vol_regime = self._identify_volatility_regime(time_series)

        # Estimate historical pattern characteristics
        historical_severity = self._estimate_crisis_severity(context)

        # Simple similarity calculation
        similarity = 0.5  # Base similarity

        if vol_regime == "high_volatility" and historical_severity > 0.7:
            similarity += 0.3
        if trend_analysis["trend"] == "falling" and historical_severity > 0.5:
            similarity += 0.2

        return min(1.0, similarity)

    def _extract_pattern_characteristics(
            self,
            context: Dict[str, Any],
            metric_name: str
    ) -> List[str]:
        """Extract key pattern characteristics from historical context."""
        characteristics = []

        duration = context.get("duration_months", 12)
        if duration > 24:
            characteristics.append("Extended duration")
        elif duration < 6:
            characteristics.append("Sharp, short-lived")

        if len(context.get("trigger_events", [])) > 3:
            characteristics.append("Multiple trigger events")

        return characteristics

    def _create_scenario_phases(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create phases for a scenario timeline."""
        duration = context.get("duration_months", 12)

        if duration <= 6:
            return [
                {"phase": "Crisis", "duration_months": duration, "description": "Acute phase"}
            ]
        elif duration <= 24:
            return [
                {"phase": "Onset", "duration_months": duration // 3, "description": "Crisis begins"},
                {"phase": "Acute", "duration_months": duration // 2, "description": "Peak crisis"},
                {"phase": "Recovery", "duration_months": duration - (duration // 3) - (duration // 2),
                 "description": "Initial recovery"}
            ]
        else:
            return [
                {"phase": "Onset", "duration_months": 6, "description": "Crisis begins"},
                {"phase": "Acute", "duration_months": 12, "description": "Peak crisis"},
                {"phase": "Prolonged", "duration_months": duration - 24, "description": "Extended crisis"},
                {"phase": "Recovery", "duration_months": 6, "description": "Recovery phase"}
            ]

    def _extract_timeline_events(self, context: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract timeline events from context."""
        events = []
        for i, event in enumerate(context.get("trigger_events", [])):
            events.append({
                "order": i + 1,
                "event": event,
                "phase": "Onset" if i < 2 else "Acute"
            })
        return events

    def _create_market_timeline(self, context: Dict[str, Any]) -> Dict[str, List[str]]:
        """Create market performance timeline."""
        return {
            "Onset": ["Initial market reaction", "Volatility increases"],
            "Acute": ["Major market declines", "Correlations spike"],
            "Recovery": ["Gradual stabilization", "Policy support takes effect"]
        }

    def _create_policy_timeline(self, context: Dict[str, Any]) -> Dict[str, List[str]]:
        """Create policy response timeline."""
        responses = context.get("policy_response", [])
        if len(responses) == 0:
            return {}

        # Distribute policy responses across phases
        per_phase = max(1, len(responses) // 3)

        return {
            "Acute": responses[:per_phase],
            "Recovery": responses[per_phase:per_phase * 2],
            "Stabilization": responses[per_phase * 2:]
        }