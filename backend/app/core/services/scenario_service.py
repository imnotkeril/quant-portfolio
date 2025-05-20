# backend/app/core/services/scenario_service.py
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from typing import Dict, List, Tuple, Optional, Union, Any
import logging
import random

# Setup logging
logger = logging.getLogger(__name__)


class ScenarioService:
    """Scenario modeling service."""

    def __init__(self):
        """Initialize with predefined scenario chains."""
        # Defining the structure of scenario chains
        self.scenario_chains = {
            "inflation_shock": {
                "name": "Inflation shock",
                "initial_impact": {"inflation": 5.0, "market": -0.05},
                "leads_to": [
                    {
                        "scenario": "rate_hike",
                        "probability": 0.8,
                        "delay": 30,  # days
                        "magnitude_modifier": 1.2  # enhance effect
                    }
                ]
            },
            "rate_hike": {
                "name": "Raising the stakes",
                "initial_impact": {"interest_rates": 1.5, "bonds": -0.10, "tech_stocks": -0.15},
                "leads_to": [
                    {
                        "scenario": "credit_crunch",
                        "probability": 0.6,
                        "delay": 60,
                        "magnitude_modifier": 1.0
                    },
                    {
                        "scenario": "housing_decline",
                        "probability": 0.7,
                        "delay": 90,
                        "magnitude_modifier": 0.9
                    }
                ]
            },
            "credit_crunch": {
                "name": "Credit Crisis",
                "initial_impact": {"financials": -0.20, "consumer_discretionary": -0.15, "market": -0.10},
                "leads_to": [
                    {
                        "scenario": "recession",
                        "probability": 0.7,
                        "delay": 120,
                        "magnitude_modifier": 1.1
                    }
                ]
            },
            "housing_decline": {
                "name": "The real estate market is falling",
                "initial_impact": {"real_estate": -0.25, "financials": -0.10, "construction": -0.20},
                "leads_to": [
                    {
                        "scenario": "consumer_weakness",
                        "probability": 0.65,
                        "delay": 60,
                        "magnitude_modifier": 0.9
                    }
                ]
            },
            "consumer_weakness": {
                "name": "Weakening consumer demand",
                "initial_impact": {"consumer_discretionary": -0.15, "retail": -0.20, "market": -0.05},
                "leads_to": [
                    {
                        "scenario": "recession",
                        "probability": 0.6,
                        "delay": 90,
                        "magnitude_modifier": 1.0
                    }
                ]
            },
            "recession": {
                "name": "Economic recession",
                "initial_impact": {"market": -0.25, "unemployment": 3.0, "gdp": -2.0},
                "leads_to": []  # Final state
            }
        }

    def get_all_scenarios(self) -> Dict[str, Dict]:
        """
        Get all available scenario chains.

        Returns:
            Dictionary with scenario chains
        """
        return self.scenario_chains

    def get_scenario(self, scenario_key: str) -> Dict:
        """
        Get a specific scenario by key.

        Args:
            scenario_key: Scenario key

        Returns:
            Scenario data
        """
        if scenario_key not in self.scenario_chains:
            return {'error': f'Unknown scenario: {scenario_key}'}

        return self.scenario_chains[scenario_key]

    def add_scenario(
            self,
            scenario_key: str,
            name: str,
            initial_impact: Dict[str, float],
            leads_to: List[Dict] = None
    ) -> Dict:
        """
        Add a new scenario chain.

        Args:
            scenario_key: Scenario key
            name: Scenario name
            initial_impact: Dictionary with initial impacts {factor: value}
            leads_to: List of scenarios that this can lead to

        Returns:
            Added scenario data
        """
        if scenario_key in self.scenario_chains:
            return {'error': f'Scenario already exists: {scenario_key}'}

        if leads_to is None:
            leads_to = []

        # Validate leads_to structure
        for link in leads_to:
            if 'scenario' not in link or 'probability' not in link:
                return {'error': 'Invalid leads_to structure'}

            if link.get('scenario') not in self.scenario_chains:
                return {'error': f'Unknown scenario in leads_to: {link.get("scenario")}'}

        # Add the new scenario
        self.scenario_chains[scenario_key] = {
            "name": name,
            "initial_impact": initial_impact,
            "leads_to": leads_to
        }

        return self.scenario_chains[scenario_key]

    def modify_scenario(
            self,
            scenario_key: str,
            name: Optional[str] = None,
            initial_impact: Optional[Dict[str, float]] = None,
            leads_to: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Modify an existing scenario chain.

        Args:
            scenario_key: Scenario key
            name: New scenario name (optional)
            initial_impact: New initial impacts (optional)
            leads_to: New leads_to list (optional)

        Returns:
            Modified scenario data
        """
        if scenario_key not in self.scenario_chains:
            return {'error': f'Unknown scenario: {scenario_key}'}

        # Update the scenario
        if name is not None:
            self.scenario_chains[scenario_key]["name"] = name

        if initial_impact is not None:
            self.scenario_chains[scenario_key]["initial_impact"] = initial_impact

        if leads_to is not None:
            # Validate leads_to structure
            for link in leads_to:
                if 'scenario' not in link or 'probability' not in link:
                    return {'error': 'Invalid leads_to structure'}

                if link.get('scenario') not in self.scenario_chains:
                    return {'error': f'Unknown scenario in leads_to: {link.get("scenario")}'}

            self.scenario_chains[scenario_key]["leads_to"] = leads_to

        return self.scenario_chains[scenario_key]

    def delete_scenario(self, scenario_key: str) -> Dict:
        """
        Delete a scenario chain.

        Args:
            scenario_key: Scenario key

        Returns:
            Status message
        """
        if scenario_key not in self.scenario_chains:
            return {'error': f'Unknown scenario: {scenario_key}'}

        # Check if this scenario is referenced by others
        for key, scenario in self.scenario_chains.items():
            for link in scenario.get('leads_to', []):
                if link.get('scenario') == scenario_key:
                    return {'error': f'Cannot delete scenario that is referenced by {key}'}

        # Delete the scenario
        del self.scenario_chains[scenario_key]

        return {'message': f'Scenario deleted: {scenario_key}'}

    def simulate_scenario_chain(
            self,
            starting_scenario: str,
            num_simulations: int = 1000
    ) -> Dict:
        """
        Simulates possible chains of events starting from a given scenario.

        Args:
            starting_scenario: Key of the starting scenario
            num_simulations: Number of simulations to run

        Returns:
            Dictionary with simulation results
        """
        if starting_scenario not in self.scenario_chains:
            return {'error': f'Unknown starting scenario: {starting_scenario}'}

        all_results = []

        for _ in range(num_simulations):
            # Start with the original scenario
            current_scenario = starting_scenario
            chain = [current_scenario]
            total_impact = self.scenario_chains[current_scenario]["initial_impact"].copy()
            timeline = [0]  # days since the start of the first event

            # Continue the chain as long as there are subsequent events
            while current_scenario in self.scenario_chains and "leads_to" in self.scenario_chains[current_scenario]:
                next_events = self.scenario_chains[current_scenario]["leads_to"]

                # If there are no subsequent events, end the chain
                if not next_events:
                    break

                # For each possible subsequent event
                triggered_next = False
                for next_event in next_events:
                    # Determine whether an event will occur (based on probability)
                    if random.random() < next_event["probability"]:
                        current_scenario = next_event["scenario"]
                        chain.append(current_scenario)
                        timeline.append(timeline[-1] + next_event["delay"])

                        # Sum up the influence, taking into account the strength modifier
                        for factor, impact in self.scenario_chains[current_scenario]["initial_impact"].items():
                            if factor in total_impact:
                                total_impact[factor] += impact * next_event["magnitude_modifier"]
                            else:
                                total_impact[factor] = impact * next_event["magnitude_modifier"]

                        triggered_next = True
                        break

                # If none of the subsequent events triggered, terminate the chain
                if not triggered_next:
                    break

            all_results.append({
                "chain": chain,
                "timeline": timeline,
                "total_impact": total_impact
            })

        # Analyze simulation results
        chain_counts = {}
        for result in all_results:
            chain_str = " -> ".join([self.scenario_chains[s]["name"] for s in result["chain"]])
            chain_counts[chain_str] = chain_counts.get(chain_str, 0) + 1

        impacts = {}
        for result in all_results:
            for factor, value in result["total_impact"].items():
                if factor not in impacts:
                    impacts[factor] = []
                impacts[factor].append(value)

        # Calculate impact statistics
        impact_stats = {}
        for factor, values in impacts.items():
            impact_stats[factor] = {
                "mean": np.mean(values),
                "median": np.median(values),
                "p5": np.percentile(values, 5),
                "p95": np.percentile(values, 95)
            }

        # Sort chains by frequency
        sorted_chains = sorted(chain_counts.items(), key=lambda x: x[1], reverse=True)
        most_common_chains = [{"chain": chain, "frequency": count, "percentage": count / num_simulations * 100}
                              for chain, count in sorted_chains[:10]]

        return {
            "starting_scenario": starting_scenario,
            "num_simulations": num_simulations,
            "all_results": all_results,
            "most_common_chains": most_common_chains,
            "impact_statistics": impact_stats
        }

    def visualize_scenario_chains(self, chain_results: List[Dict]) -> Dict:
        """
        Creates data for visualizing scenario chains.

        Args:
            chain_results: Results from simulate_scenario_chain

        Returns:
            Dictionary with visualization data
        """
        if not chain_results:
            return {'error': 'No chain results provided'}

        # Counting transitions between scenarios
        transitions = {}
        for result in chain_results:
            chain = result["chain"]
            for i in range(len(chain) - 1):
                from_scenario = chain[i]
                to_scenario = chain[i + 1]
                key = (from_scenario, to_scenario)
                transitions[key] = transitions.get(key, 0) + 1

        # Creating data for a sankey chart
        source = []
        target = []
        value = []

        # We collect unique scenarios
        all_scenarios = set()
        for from_s, to_s in transitions.keys():
            all_scenarios.add(from_s)
            all_scenarios.add(to_s)

        # Create a mapping of scenarios to indices
        scenario_indices = {scenario: i for i, scenario in enumerate(all_scenarios)}

        # Collecting data for the chart
        for (from_s, to_s), count in transitions.items():
            source.append(scenario_indices[from_s])
            target.append(scenario_indices[to_s])
            value.append(count)

        labels = [self.scenario_chains[s]["name"] for s in all_scenarios]

        return {
            "sankey_data": {
                "source": source,
                "target": target,
                "value": value,
                "labels": labels
            }
        }

    def evaluate_portfolio_impact(
            self,
            portfolio_data: Dict,
            scenario_key: str,
            sector_mappings: Dict[str, str] = None
    ) -> Dict:
        """
        Evaluate the impact of a scenario on a portfolio.

        Args:
            portfolio_data: Dictionary with portfolio data
            scenario_key: Scenario key
            sector_mappings: Dictionary mapping sectors to impact factors

        Returns:
            Dictionary with impact analysis
        """
        if scenario_key not in self.scenario_chains:
            return {'error': f'Unknown scenario: {scenario_key}'}

        if 'assets' not in portfolio_data or not portfolio_data['assets']:
            return {'error': 'Invalid portfolio data'}

        # Get scenario data
        scenario = self.scenario_chains[scenario_key]
        initial_impact = scenario['initial_impact']

        # Default sector mappings if not provided
        if sector_mappings is None:
            sector_mappings = {
                'Technology': 'tech_stocks',
                'Financials': 'financials',
                'Real Estate': 'real_estate',
                'Consumer Discretionary': 'consumer_discretionary',
                'Consumer Staples': 'consumer_staples',
                'Energy': 'energy',
                'Materials': 'materials',
                'Industrials': 'industrials',
                'Utilities': 'utilities',
                'Health Care': 'health_care',
                'Communication Services': 'communication_services'
            }

        # Calculate impact on each asset
        asset_impacts = {}
        total_portfolio_impact = 0

        for asset in portfolio_data['assets']:
            ticker = asset['ticker']
            weight = asset.get('weight', 0)
            sector = asset.get('sector', 'Unknown')

            asset_impact = 0
            impact_factors = []

            # Add market impact if available
            if 'market' in initial_impact:
                asset_impact += initial_impact['market']
                impact_factors.append(('market', initial_impact['market']))

            # Add sector-specific impact if available
            if sector in sector_mappings and sector_mappings[sector] in initial_impact:
                impact_factor = sector_mappings[sector]
                sector_impact = initial_impact[impact_factor]
                asset_impact += sector_impact
                impact_factors.append((sector, sector_impact))

            # Add asset-specific impact if available
            if ticker.lower() in initial_impact:
                ticker_impact = initial_impact[ticker.lower()]
                asset_impact += ticker_impact
                impact_factors.append((ticker, ticker_impact))

            # Calculate weighted impact
            weighted_impact = asset_impact * weight
            total_portfolio_impact += weighted_impact

            asset_impacts[ticker] = {
                'weight': weight,
                'sector': sector,
                'impact': asset_impact,
                'weighted_impact': weighted_impact,
                'impact_factors': impact_factors
            }

        return {
            'scenario': scenario_key,
            'scenario_name': scenario['name'],
            'total_portfolio_impact': total_portfolio_impact,
            'asset_impacts': asset_impacts
        }