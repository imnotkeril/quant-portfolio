# backend/app/core/services/scenario_service.py
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import logging
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class ScenarioService:
    """Scenario modeling and chaining service."""

    def __init__(self):
        """Initialize the scenario service with predefined scenarios."""
        self.predefined_scenarios = self._load_predefined_scenarios()
        self.scenario_chains = {}  # Store user-created scenario chains

    def _load_predefined_scenarios(self) -> Dict[str, Dict[str, Any]]:
        """Load predefined market scenarios."""
        scenarios = {
            "market_crash": {
                "name": "Market Crash",
                "description": "Sudden market decline similar to 2008 or 2020",
                "impact": {
                    "equity": -0.30,  # 30% decline
                    "bonds": -0.10,  # 10% decline
                    "commodities": -0.20,  # 20% decline
                    "real_estate": -0.25,  # 25% decline
                    "crypto": -0.50  # 50% decline
                },
                "duration_days": 60,
                "probability": 0.02,  # 2% annual probability
                "correlation_increase": 0.3  # Correlations increase by 30%
            },

            "inflation_spike": {
                "name": "Inflation Spike",
                "description": "Rapid inflation increase affecting different assets",
                "impact": {
                    "equity": -0.15,  # Growth stocks suffer
                    "bonds": -0.20,  # Bonds decline significantly
                    "commodities": 0.25,  # Commodities benefit
                    "real_estate": 0.05,  # Real estate slight benefit
                    "crypto": -0.10  # Crypto mixed impact
                },
                "duration_days": 180,  # Longer duration
                "probability": 0.05,
                "correlation_increase": 0.2
            },

            "geopolitical_crisis": {
                "name": "Geopolitical Crisis",
                "description": "Major geopolitical event causing market uncertainty",
                "impact": {
                    "equity": -0.20,
                    "bonds": 0.05,  # Flight to safety
                    "commodities": 0.15,  # Oil/gold spike
                    "real_estate": -0.10,
                    "crypto": -0.25  # High volatility
                },
                "duration_days": 90,
                "probability": 0.03,
                "correlation_increase": 0.25
            },

            "interest_rate_shock": {
                "name": "Interest Rate Shock",
                "description": "Unexpected central bank rate changes",
                "impact": {
                    "equity": -0.10,
                    "bonds": -0.15,  # Duration risk
                    "commodities": -0.05,
                    "real_estate": -0.20,  # Highly sensitive
                    "crypto": -0.15
                },
                "duration_days": 30,  # Quick impact
                "probability": 0.08,
                "correlation_increase": 0.15
            },

            "liquidity_crisis": {
                "name": "Liquidity Crisis",
                "description": "Market liquidity dries up across asset classes",
                "impact": {
                    "equity": -0.25,
                    "bonds": -0.05,  # Government bonds safe haven
                    "commodities": -0.15,
                    "real_estate": -0.30,  # Very illiquid
                    "crypto": -0.40  # Extreme volatility
                },
                "duration_days": 120,
                "probability": 0.01,
                "correlation_increase": 0.4  # Extreme correlation spike
            }
        }
        return scenarios

    def get_available_scenarios(self) -> List[Dict[str, str]]:
        """Get list of available predefined scenarios."""
        return [
            {
                "key": key,
                "name": scenario["name"],
                "description": scenario["description"],
                "probability": scenario["probability"]
            }
            for key, scenario in self.predefined_scenarios.items()
        ]

    def simulate_scenario_impact(
            self,
            portfolio_weights: Dict[str, float],
            scenario_key: str,
            portfolio_value: float = 100000,
            asset_mapping: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Simulate the impact of a scenario on a portfolio.

        Args:
            portfolio_weights: Dictionary of asset weights
            scenario_key: Key of the scenario to simulate
            portfolio_value: Initial portfolio value
            asset_mapping: Mapping of tickers to asset classes

        Returns:
            Dictionary with simulation results
        """
        if scenario_key not in self.predefined_scenarios:
            raise ValueError(f"Unknown scenario: {scenario_key}")

        scenario = self.predefined_scenarios[scenario_key]

        # Default asset class mapping if not provided
        if asset_mapping is None:
            asset_mapping = self._get_default_asset_mapping()

        # Calculate portfolio impact
        total_impact = 0.0
        asset_impacts = {}

        for ticker, weight in portfolio_weights.items():
            # Determine asset class
            asset_class = asset_mapping.get(ticker, "equity")  # Default to equity

            # Get scenario impact for this asset class
            class_impact = scenario["impact"].get(asset_class, scenario["impact"]["equity"])

            # Calculate weighted impact
            weighted_impact = weight * class_impact
            total_impact += weighted_impact

            asset_impacts[ticker] = {
                "asset_class": asset_class,
                "class_impact": class_impact,
                "weight": weight,
                "weighted_impact": weighted_impact,
                "estimated_loss": portfolio_value * weight * class_impact
            }

        # Calculate portfolio values
        portfolio_loss = portfolio_value * total_impact
        portfolio_value_after = portfolio_value + portfolio_loss

        return {
            "scenario": scenario,
            "portfolio_impact": {
                "initial_value": portfolio_value,
                "total_impact_pct": total_impact,
                "total_loss": portfolio_loss,
                "value_after_scenario": portfolio_value_after,
                "recovery_estimate_days": self._estimate_recovery_time(total_impact, scenario)
            },
            "asset_impacts": asset_impacts,
            "scenario_duration_days": scenario["duration_days"],
            "scenario_probability": scenario["probability"]
        }

    def create_scenario_chain(
            self,
            name: str,
            initial_scenario: str,
            chain_scenarios: List[Dict[str, Any]],
            description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a chain of scenarios (one leading to another).

        Args:
            name: Name for the scenario chain
            initial_scenario: Starting scenario key
            chain_scenarios: List of follow-up scenarios with probabilities
            description: Optional description

        Returns:
            Dictionary with the created scenario chain
        """
        scenario_chain = {
            "name": name,
            "description": description or f"Scenario chain starting with {initial_scenario}",
            "initial_scenario": initial_scenario,
            "chain": chain_scenarios,
            "created_at": datetime.now().isoformat(),
            "total_probability": self._calculate_chain_probability(initial_scenario, chain_scenarios)
        }

        # Store the chain
        self.scenario_chains[name] = scenario_chain

        logger.info(f"Created scenario chain: {name}")
        return scenario_chain

    def simulate_scenario_chain(
            self,
            chain_name: str,
            portfolio_weights: Dict[str, float],
            portfolio_value: float = 100000,
            asset_mapping: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Simulate the impact of a complete scenario chain.

        Args:
            chain_name: Name of the scenario chain
            portfolio_weights: Dictionary of asset weights
            portfolio_value: Initial portfolio value
            asset_mapping: Mapping of tickers to asset classes

        Returns:
            Dictionary with chain simulation results
        """
        if chain_name not in self.scenario_chains:
            raise ValueError(f"Unknown scenario chain: {chain_name}")

        chain = self.scenario_chains[chain_name]

        # Simulate initial scenario
        current_value = portfolio_value
        current_weights = portfolio_weights.copy()
        simulation_steps = []

        # Step 1: Initial scenario
        initial_result = self.simulate_scenario_impact(
            current_weights,
            chain["initial_scenario"],
            current_value,
            asset_mapping
        )

        simulation_steps.append({
            "step": 1,
            "scenario_key": chain["initial_scenario"],
            "scenario_name": initial_result["scenario"]["name"],
            "result": initial_result
        })

        current_value = initial_result["portfolio_impact"]["value_after_scenario"]

        # Simulate follow-up scenarios
        for i, follow_up in enumerate(chain["chain"], start=2):
            scenario_key = follow_up["scenario"]
            occurs = follow_up.get("probability", 1.0) > np.random.random()

            if occurs:
                step_result = self.simulate_scenario_impact(
                    current_weights,
                    scenario_key,
                    current_value,
                    asset_mapping
                )

                simulation_steps.append({
                    "step": i,
                    "scenario_key": scenario_key,
                    "scenario_name": step_result["scenario"]["name"],
                    "occurred": True,
                    "result": step_result
                })

                current_value = step_result["portfolio_impact"]["value_after_scenario"]
            else:
                simulation_steps.append({
                    "step": i,
                    "scenario_key": scenario_key,
                    "occurred": False,
                    "skipped_probability": follow_up.get("probability", 1.0)
                })

        # Calculate total impact
        total_impact_pct = (current_value - portfolio_value) / portfolio_value

        return {
            "chain_name": chain_name,
            "chain_info": chain,
            "simulation_steps": simulation_steps,
            "final_result": {
                "initial_value": portfolio_value,
                "final_value": current_value,
                "total_impact_pct": total_impact_pct,
                "total_loss": current_value - portfolio_value,
                "steps_occurred": sum(1 for step in simulation_steps if step.get("occurred", True))
            }
        }

    def analyze_scenario_correlations(
            self,
            scenario_keys: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze correlations between different scenarios.

        Args:
            scenario_keys: List of scenario keys to analyze

        Returns:
            Dictionary with correlation analysis
        """
        if not all(key in self.predefined_scenarios for key in scenario_keys):
            unknown = [key for key in scenario_keys if key not in self.predefined_scenarios]
            raise ValueError(f"Unknown scenarios: {unknown}")

        # Create impact matrix
        asset_classes = ["equity", "bonds", "commodities", "real_estate", "crypto"]
        impact_matrix = []

        for scenario_key in scenario_keys:
            scenario = self.predefined_scenarios[scenario_key]
            impacts = [scenario["impact"].get(asset_class, 0) for asset_class in asset_classes]
            impact_matrix.append(impacts)

        # Calculate correlation matrix
        impact_df = pd.DataFrame(impact_matrix, index=scenario_keys, columns=asset_classes)
        correlation_matrix = impact_df.T.corr()  # Correlate scenarios

        return {
            "scenarios": scenario_keys,
            "asset_classes": asset_classes,
            "impact_matrix": impact_df.to_dict(),
            "correlation_matrix": correlation_matrix.to_dict(),
            "highly_correlated_pairs": self._find_correlated_pairs(correlation_matrix, threshold=0.7)
        }

    def get_scenario_chain(self, name: str) -> Optional[Dict[str, Any]]:
        """Get a specific scenario chain by name."""
        return self.scenario_chains.get(name)

    def list_scenario_chains(self) -> List[Dict[str, str]]:
        """List all created scenario chains."""
        return [
            {
                "name": name,
                "description": chain["description"],
                "initial_scenario": chain["initial_scenario"],
                "created_at": chain["created_at"]
            }
            for name, chain in self.scenario_chains.items()
        ]

    def delete_scenario_chain(self, name: str) -> bool:
        """Delete a scenario chain."""
        if name in self.scenario_chains:
            del self.scenario_chains[name]
            logger.info(f"Deleted scenario chain: {name}")
            return True
        return False

    def _get_default_asset_mapping(self) -> Dict[str, str]:
        """Get default mapping of common tickers to asset classes."""
        return {
            # Equity ETFs/Indices
            "SPY": "equity", "QQQ": "equity", "VTI": "equity", "IWM": "equity",
            "VEA": "equity", "VWO": "equity", "EFA": "equity", "EEM": "equity",

            # Bond ETFs
            "BND": "bonds", "AGG": "bonds", "TLT": "bonds", "IEF": "bonds",
            "LQD": "bonds", "HYG": "bonds", "EMB": "bonds",

            # Commodities
            "GLD": "commodities", "SLV": "commodities", "USO": "commodities",
            "UNG": "commodities", "DBA": "commodities", "DBC": "commodities",

            # Real Estate
            "VNQ": "real_estate", "IYR": "real_estate", "REIT": "real_estate",

            # Crypto
            "BTC": "crypto", "ETH": "crypto", "GBTC": "crypto"
        }

    def _estimate_recovery_time(self, impact: float, scenario: Dict[str, Any]) -> int:
        """Estimate recovery time based on impact severity and scenario type."""
        base_duration = scenario["duration_days"]
        impact_severity = abs(impact)

        # Recovery is typically 2-5x the crisis duration
        if impact_severity > 0.3:  # Severe crisis
            recovery_multiplier = 5
        elif impact_severity > 0.2:  # Major crisis
            recovery_multiplier = 3
        elif impact_severity > 0.1:  # Moderate crisis
            recovery_multiplier = 2
        else:  # Minor crisis
            recovery_multiplier = 1

        return int(base_duration * recovery_multiplier)

    def _calculate_chain_probability(
            self,
            initial_scenario: str,
            chain_scenarios: List[Dict[str, Any]]
    ) -> float:
        """Calculate the total probability of a scenario chain occurring."""
        initial_prob = self.predefined_scenarios[initial_scenario]["probability"]

        chain_prob = initial_prob
        for scenario in chain_scenarios:
            scenario_prob = scenario.get("probability", 1.0)
            chain_prob *= scenario_prob

        return chain_prob

    def _find_correlated_pairs(
            self,
            correlation_matrix: pd.DataFrame,
            threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Find highly correlated scenario pairs."""
        correlated_pairs = []

        for i in range(len(correlation_matrix.columns)):
            for j in range(i + 1, len(correlation_matrix.columns)):
                corr_value = correlation_matrix.iloc[i, j]
                if abs(corr_value) > threshold:
                    correlated_pairs.append({
                        "scenario_1": correlation_matrix.columns[i],
                        "scenario_2": correlation_matrix.columns[j],
                        "correlation": corr_value,
                        "relationship": "positive" if corr_value > 0 else "negative"
                    })

        return sorted(correlated_pairs, key=lambda x: abs(x["correlation"]), reverse=True)