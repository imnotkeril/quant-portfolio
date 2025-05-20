# backend/app/core/services/historical_service.py
import logging
from typing import Dict, List, Optional, Any

# Setup logging
logger = logging.getLogger(__name__)


class HistoricalService:
    """Historical context and analogies service."""

    def __init__(self):
        """Initialize with predefined historical contexts."""
        self.historical_crisis_context = {
            "financial_crisis_2008": {
                "name": "Financial crisis 2008-2009",
                "period": "September 2008 - March 2009",
                "trigger_events": [
                    "Lehman Brothers Collapse September 15, 2008",
                    "Subprime Mortgage Crisis",
                    "Liquidity Problems in the Banking System"
                ],
                "key_indicators": [
                    {"name": "TED Spread (the difference between LIBOR and Treasury Bills)", "value": "4.58%",
                     "normal": "0.1-0.5%"},
                    {"name": "VIX (volatility index)", "value": "80.86", "normal": "15-20"},
                    {"name": "High Yield Bond Spread", "value": "21.82%", "normal": "3-5%"}
                ],
                "market_impact": {
                    "S&P 500": "-56.8%",
                    "MSCI World": "-54.0%",
                    "US Real Estate": "-78.0%",
                    "Oil": "-75.9%",
                    "Gold": "+25.0%"
                },
                "policy_response": [
                    "Fed Rate Cut to 0-0.25%",
                    "Asset Purchase Program (QE1)",
                    "Troubled Asset Relief Program (TARP)"
                ],
                "lessons_learned": [
                    "The Importance of Controlling Financial Institutions' Leverage",
                    "The Need for Transparency in Derivatives Markets",
                    "Systemic Risks in the Financial System Require Systemic Oversight"
                ],
                "early_warning_signs": [
                    "House price bubble",
                    "Expansion of subprime lending",
                    "Excessive securitization of mortgages",
                    "High leverage in the financial system"
                ],
                "most_resilient_assets": [
                    "US Treasuries",
                    "Japanese Yen",
                    "Gold",
                    "Low Debt Companies with Stable Cash Flows"
                ],
                "most_affected_assets": [
                    "Financials (especially banks and insurance companies)",
                    "Real estate and real estate related companies",
                    "Cyclic consumer goods",
                    "Small companies with high debt levels"
                ]
            },
            "covid_2020": {
                "name": "COVID-19 Pandemic",
                "period": "February 2020 - March 2020",
                "trigger_events": [
                    "Spread of coronavirus beyond China",
                    "WHO declares pandemic on March 11, 2020",
                    "Mass lockdowns and economic shutdowns"
                ],
                "key_indicators": [
                    {"name": "VIX (volatility index)", "value": "82.69", "normal": "15-20"},
                    {"name": "Economic Uncertainty Index", "value": "950", "normal": "100-150"},
                    {"name": "Corporate Bond Spread", "value": "10.87%", "normal": "1-3%"}
                ],
                "market_impact": {
                    "S&P 500": "-33.9%",
                    "MSCI World": "-34.0%",
                    "Oil": "-65.0%",
                    "Gold": "-12.0% (temporarily, then growth)"
                },
                "policy_response": [
                    "Fed Rate Cut to 0-0.25%",
                    "Large-Scale Quantitative Easing Programs",
                    "Financial Aid Packages (CARES Act in the US)",
                    "Global Monetary and Fiscal Support"
                ],
                "lessons_learned": [
                    "The Importance of Supply Chain Diversification",
                    "The Need for Resilient Business Models and Strong Balance Sheets",
                    "The Critical Role of Government Support in Systemic Crises",
                    "Accelerating Digital Transformation"
                ],
                "early_warning_signs": [
                    "Spread of the virus in China",
                    "Disruption of supply chains",
                    "Warnings from epidemiologists"
                ],
                "most_resilient_assets": [
                    "Technology companies (especially those related to remote work)",
                    "Pharmaceuticals and healthcare",
                    "E-commerce companies",
                    "US Treasuries"
                ],
                "most_affected_assets": [
                    "Airlines and Travel Sector",
                    "Traditional Retail",
                    "Energy Sector",
                    "Banks and Financial Institutions"
                ]
            },
            "tech_bubble_2000": {
                "name": "The Dot-com Crash",
                "period": "March 2000 - October 2002",
                "trigger_events": [
                    "NASDAQ Peak March 10, 2000",
                    "Microsoft Antitrust Case Ruling",
                    "Revaluation of Internet Companies Without Revenue"
                ],
                "key_indicators": [
                    {"name": "P/E NASDAQ", "value": ">200", "normal": "15-25"},
                    {"name": "Number of IPOs of technology companies", "value": "record high", "normal": "moderate"},
                    {"name": "Technology Share in the S&P 500", "value": "33%", "normal": "15-20%"}
                ],
                "market_impact": {
                    "NASDAQ": "-78.0%",
                    "S&P 500": "-49.1%",
                    "Technology sector": "-83.0%"
                },
                "policy_response": [
                    "Fed rate cut from 6.5% to 1.75%",
                    "Fiscal stimulus (tax cuts))"
                ],
                "lessons_learned": [
                    "The Dangers of Investing Based on Speculative Valuations",
                    "The Importance of Sustainable Business Models and Real Returns",
                    "The Risks of Sector Concentration"
                ],
                "early_warning_signs": [
                    "Rapid growth in valuations without corresponding growth in earnings",
                    "A sharp increase in the number of IPOs of loss-making companies",
                    "Rapid growth in margin lending"
                ],
                "most_resilient_assets": [
                    "Fixed Income",
                    "Defensive Sectors (Healthcare, Utilities)",
                    "Value Stocks",
                    "Real Estate"
                ],
                "most_affected_assets": [
                    "Internet and Dotcom Companies",
                    "Telecommunications Sector",
                    "Computer Equipment Manufacturers",
                    "B2B Solution Providers"
                ]
            },
            "inflation_shock": {
                "name": "Inflation shock 2021-2022",
                "period": "End of 2021 - 2022",
                "trigger_events": [
                    "Demand Recovery from the Pandemic",
                    "Supply Chain Disruptions",
                    "Energy Crisis",
                    "Large Fiscal and Monetary Stimuli"
                ],
                "key_indicators": [
                    {"name": "US Inflation (CPI)", "value": "9.1%", "normal": "2-3%"},
                    {"name": "Energy prices", "value": "+76%", "normal": "±5-10%"},
                    {"name": "Producer Price Index", "value": "11.3%", "normal": "1-3%"}
                ],
                "market_impact": {
                    "S&P 500": "-20.0%",
                    "Bonds (AGG)": "-17.0%",
                    "NASDAQ": "-33.0%",
                    "Gold": "-10.0%"
                },
                "policy_response": [
                    "Higher Fed rates (2.25%-4.5% per year)",
                    "Reduce Fed balance sheet (quantitative tightening)",
                    "Similar actions by other central banks"
                ],
                "lessons_learned": [
                    "Vulnerability of Global Supply Chains",
                    "Risks of Simultaneous Fiscal and Monetary Stimuli",
                    "The Importance of Preparing for Inflationary Periods",
                    "Double Whammy for 60/40 Portfolios (Simultaneous Fall in Stocks and Bonds)"
                ],
                "early_warning_signs": [
                    "Rising Commodity Prices",
                    "Supply Chain Delays",
                    "Record Money Supply (M2) Growth",
                    "Record Low Interest Rates as Economy Recovers"
                ],
                "most_resilient_assets": [
                    "Energy",
                    "Commodities",
                    "TIPS",
                    "Value Stocks with Price Power"
                ],
                "most_affected_assets": [
                    "Tech and growth stocks",
                    "Long-term bonds",
                    "Companies with low profitability or high energy costs",
                    "Growth stocks with high multiples"
                ]
            }
        }

    def get_historical_scenarios(self) -> List[str]:
        """
        Get available historical scenarios.

        Returns:
            List of historical scenario keys
        """
        return list(self.historical_crisis_context.keys())

    def get_historical_context(self, scenario_key: str) -> Dict:
        """
        Get historical context for a scenario.

        Args:
            scenario_key: Scenario key

        Returns:
            Historical context data
        """
        if scenario_key not in self.historical_crisis_context:
            return {'error': f'Unknown historical scenario: {scenario_key}'}

        return self.historical_crisis_context[scenario_key]

    def add_historical_scenario(
            self,
            key: str,
            name: str,
            period: str,
            trigger_events: List[str],
            key_indicators: List[Dict],
            market_impact: Dict[str, str],
            policy_response: List[str],
            lessons_learned: List[str] = None,
            early_warning_signs: List[str] = None,
            most_resilient_assets: List[str] = None,
            most_affected_assets: List[str] = None
    ) -> Dict:
        """
        Add a new historical scenario.

        Args:
            key: Scenario key
            name: Scenario name
            period: Time period
            trigger_events: List of trigger events
            key_indicators: List of key indicators
            market_impact: Dictionary with market impacts
            policy_response: List of policy responses
            lessons_learned: List of lessons learned
            early_warning_signs: List of early warning signs
            most_resilient_assets: List of most resilient assets
            most_affected_assets: List of most affected assets

        Returns:
            Added historical scenario data
        """
        if key in self.historical_crisis_context:
            return {'error': f'Historical scenario already exists: {key}'}

        # Create new scenario
        self.historical_crisis_context[key] = {
            "name": name,
            "period": period,
            "trigger_events": trigger_events,
            "key_indicators": key_indicators,
            "market_impact": market_impact,
            "policy_response": policy_response,
            "lessons_learned": lessons_learned or [],
            "early_warning_signs": early_warning_signs or [],
            "most_resilient_assets": most_resilient_assets or [],
            "most_affected_assets": most_affected_assets or []
        }

        return self.historical_crisis_context[key]

    def find_historical_analogies(
            self,
            current_market_data: Dict,
            metrics: List[str] = None
    ) -> List[Dict]:
        """
        Find historical analogies for current conditions.

        Args:
            current_market_data: Dictionary with current market data
            metrics: List of metrics to consider for comparison

        Returns:
            List of historical analogies with similarity scores
        """
        if not current_market_data:
            return [{'error': 'No current market data provided'}]

        # Default metrics if not provided
        if metrics is None:
            metrics = [
                'p_e_ratio', 'volatility', 'interest_rates', 'inflation',
                'yield_curve', 'credit_spreads', 'market_sentiment'
            ]

        # Calculate similarity for each historical scenario
        analogies = []

        for key, context in self.historical_crisis_context.items():
            similarity_score = self.calculate_similarity_score(current_market_data, context, metrics)

            analogies.append({
                'scenario_key': key,
                'scenario_name': context['name'],
                'period': context['period'],
                'similarity_score': similarity_score,
                'key_similarities': self._get_key_similarities(current_market_data, context, metrics)
            })

        # Sort by similarity score (descending)
        analogies.sort(key=lambda x: x['similarity_score'], reverse=True)

        return analogies

    def calculate_similarity_score(
            self,
            current_data: Dict,
            historical_data: Dict,
            metrics: List[str] = None,
            weights: Dict[str, float] = None
    ) -> float:
        """
        Calculate similarity score between current and historical data.

        Args:
            current_data: Dictionary with current market data
            historical_data: Dictionary with historical market data
            metrics: List of metrics to consider for comparison
            weights: Dictionary with weights for each metric

        Returns:
            Similarity score as a float (0-1)
        """
        # This is a simplified implementation
        # In a real implementation, this would involve more complex analysis

        # Default metrics if not provided
        if metrics is None:
            metrics = [
                'p_e_ratio', 'volatility', 'interest_rates', 'inflation',
                'yield_curve', 'credit_spreads', 'market_sentiment'
            ]

        # Default weights (equal weights)
        if weights is None:
            weights = {metric: 1.0 / len(metrics) for metric in metrics}

        # Extract key indicators from historical data for comparison
        historical_indicators = {}
        for indicator in historical_data.get('key_indicators', []):
            name = indicator.get('name', '').lower()
            value = indicator.get('value', '')

            # Extract numeric value if possible
            try:
                # Remove non-numeric characters and convert to float
                numeric_value = float(''.join(c for c in value if c.isdigit() or c in '.-'))
                historical_indicators[name] = numeric_value
            except ValueError:
                # Use string value if numeric conversion fails
                historical_indicators[name] = value

        # Calculate similarity score (simplified)
        # In a real implementation, this would involve more complex similarity metrics
        similarity_score = 0.5  # Default score

        # Add additional similarity based on available metrics
        for metric in metrics:
            if metric in current_data and any(metric in key.lower() for key in historical_indicators):
                # Increase similarity for matching metrics
                similarity_score += 0.05

        # Adjust score to 0-1 range
        similarity_score = min(max(similarity_score, 0.0), 1.0)

        return similarity_score

    def _get_key_similarities(
            self,
            current_data: Dict,
            historical_data: Dict,
            metrics: List[str]
    ) -> List[str]:
        """
        Extract key similarities between current and historical data.

        Args:
            current_data: Dictionary with current market data
            historical_data: Dictionary with historical market data
            metrics: List of metrics to consider

        Returns:
            List of key similarity descriptions
        """
        similarities = []

        # Extract some similarities based on metrics
        for metric in metrics:
            if metric in current_data:
                for indicator in historical_data.get('key_indicators', []):
                    if metric.lower() in indicator.get('name', '').lower():
                        similarities.append(f"Similar {metric}: Current vs. {indicator.get('value')}")

        # Add similarities based on trigger events
        for event in historical_data.get('trigger_events', []):
            if any(keyword in current_data.get('events', []) for keyword in event.lower().split()):
                similarities.append(f"Similar triggering event: {event}")

        # If not enough similarities found, add generic ones
        if len(similarities) < 3:
            similarities.append(f"Market conditions similar to {historical_data.get('name')}")
            similarities.append(f"Comparable market sentiment")

        return similarities[:5]  # Return top 5 similarities