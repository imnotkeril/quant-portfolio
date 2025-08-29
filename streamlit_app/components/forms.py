"""
Forms Components - Reusable form components for portfolio management.
"""
import streamlit as st
import re
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime


def create_portfolio_form(initial_data: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Create a portfolio information form.

    Args:
        initial_data: Initial form data for editing

    Returns:
        Dictionary with form data
    """
    st.markdown("### 📝 Portfolio Information")

    # Initialize with existing data or defaults
    if initial_data is None:
        initial_data = {}

    col1, col2 = st.columns([2, 1])

    with col1:
        # Portfolio name
        portfolio_name = st.text_input(
            "Portfolio Name *",
            value=initial_data.get('name', ''),
            placeholder="e.g., Growth Portfolio, Retirement Fund",
            help="Enter a descriptive name for your portfolio",
            max_chars=50
        )

        # Portfolio description
        portfolio_description = st.text_area(
            "Description",
            value=initial_data.get('description', ''),
            placeholder="Describe your investment strategy, goals, or allocation approach",
            help="Optional description of your portfolio strategy",
            height=100,
            max_chars=500
        )

        # Portfolio tags
        tags_str = ', '.join(initial_data.get('tags', []))
        portfolio_tags = st.text_input(
            "Tags (comma-separated)",
            value=tags_str,
            placeholder="e.g., growth, tech, dividend, ESG",
            help="Add tags to categorize your portfolio",
            max_chars=100
        )

        # Investment objective
        investment_objective = st.selectbox(
            "Investment Objective",
            options=[
                "Capital Growth",
                "Income Generation",
                "Balanced Growth & Income",
                "Capital Preservation",
                "Aggressive Growth",
                "Conservative Income"
            ],
            index=0 if not initial_data.get('objective') else [
                "Capital Growth", "Income Generation", "Balanced Growth & Income",
                "Capital Preservation", "Aggressive Growth", "Conservative Income"
            ].index(initial_data['objective']),
            help="Primary investment objective"
        )

        # Time horizon
        time_horizon = st.selectbox(
            "Investment Time Horizon",
            options=[
                "Short-term (< 1 year)",
                "Medium-term (1-5 years)",
                "Long-term (5-10 years)",
                "Very Long-term (> 10 years)"
            ],
            index=2,  # Default to long-term
            help="Expected investment duration"
        )

    with col2:
        st.markdown("""
        <div class="analytics-section">
            <h4>💡 Portfolio Guidelines</h4>
            <ul>
                <li><strong>Name:</strong> Use descriptive names</li>
                <li><strong>Description:</strong> Explain your strategy</li>
                <li><strong>Tags:</strong> Help organize portfolios</li>
                <li><strong>Objective:</strong> Align with your goals</li>
                <li><strong>Horizon:</strong> Match your timeline</li>
            </ul>

            <h4>📊 Recommended Allocations</h4>
            <ul>
                <li><strong>Conservative:</strong> 60% Bonds, 40% Stocks</li>
                <li><strong>Moderate:</strong> 40% Bonds, 60% Stocks</li>
                <li><strong>Aggressive:</strong> 20% Bonds, 80% Stocks</li>
                <li><strong>Growth:</strong> 10% Bonds, 90% Stocks</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    # Validation
    errors = []
    if not portfolio_name.strip():
        errors.append("Portfolio name is required")

    if len(portfolio_name) > 50:
        errors.append("Portfolio name must be 50 characters or less")

    # Parse tags
    tags = []
    if portfolio_tags.strip():
        tags = [tag.strip().lower() for tag in portfolio_tags.split(',') if tag.strip()]
        if len(tags) > 10:
            errors.append("Maximum 10 tags allowed")

    # Show validation errors
    if errors:
        for error in errors:
            st.error(f"❌ {error}")

    return {
        'name': portfolio_name.strip(),
        'description': portfolio_description.strip(),
        'tags': tags,
        'objective': investment_objective,
        'time_horizon': time_horizon,
        'valid': len(errors) == 0
    }


def create_asset_search_form(key: str = "asset_search") -> Optional[Dict[str, Any]]:
    """
    Create an asset search and selection form.

    Args:
        key: Unique key for the form

    Returns:
        Selected asset data or None
    """
    st.markdown("### 🔍 Add Assets")

    col1, col2, col3 = st.columns([2, 1, 1])

    with col1:
        # Asset search
        search_query = st.text_input(
            "Search Assets",
            placeholder="Enter ticker symbol or company name",
            key=f"{key}_search",
            help="Search for stocks, ETFs, or other assets"
        )

        # Search suggestions (mock implementation)
        if search_query:
            suggestions = get_asset_suggestions(search_query)
            if suggestions:
                st.write("💡 **Suggestions:**")
                for suggestion in suggestions[:5]:
                    col_a, col_b, col_c = st.columns([2, 2, 1])
                    with col_a:
                        st.write(f"**{suggestion['symbol']}**")
                    with col_b:
                        st.write(suggestion['name'])
                    with col_c:
                        if st.button("Add", key=f"{key}_add_{suggestion['symbol']}"):
                            return {
                                'symbol': suggestion['symbol'],
                                'name': suggestion['name'],
                                'sector': suggestion.get('sector', 'Unknown')
                            }

    with col2:
        # Direct ticker input
        ticker_input = st.text_input(
            "Or Enter Ticker",
            placeholder="e.g., AAPL",
            key=f"{key}_ticker",
            help="Enter ticker symbol directly"
        ).upper()

    with col3:
        st.write("")  # Spacing
        if st.button("🔍 Add Ticker", key=f"{key}_add_direct"):
            if ticker_input:
                is_valid, result = validate_ticker_format(ticker_input)
                if is_valid:
                    return {
                        'symbol': ticker_input,
                        'name': f"{ticker_input} (Manual Entry)",
                        'sector': 'Unknown'
                    }
                else:
                    st.error(f"❌ {result}")

    return None


def create_asset_allocation_form(assets: List[Dict], key: str = "allocation") -> List[Dict[str, Any]]:
    """
    Create asset allocation weight form.

    Args:
        assets: List of assets in portfolio
        key: Unique key for the form

    Returns:
        Updated assets list with weights
    """
    if not assets:
        return []

    st.markdown("### ⚖️ Set Asset Allocation")

    total_weight = 0
    updated_assets = []

    for i, asset in enumerate(assets):
        col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1, 1])

        with col1:
            st.write(f"**{asset['ticker']}**")
            if asset.get('name') and asset['name'] != f"{asset['ticker']} (Manual Entry)":
                st.caption(asset['name'])

        with col2:
            # Weight input
            current_weight = asset.get('weight', 0)
            new_weight = st.number_input(
                "Weight (%)",
                min_value=0.0,
                max_value=100.0,
                value=float(current_weight),
                step=0.1,
                key=f"{key}_weight_{i}",
                format="%.1f"
            )

        with col3:
            # Asset info display
            if asset.get('info'):
                price = asset['info'].get('current_price', 0)
                st.metric("Price", f"${price:.2f}" if price else "N/A")

        with col4:
            # Performance info
            if asset.get('info'):
                change = asset['info'].get('change_30d', 0)
                st.metric("30D %", f"{change:+.1f}%" if change else "N/A")

        with col5:
            # Remove button
            if st.button("🗑️", key=f"{key}_remove_{i}", help="Remove asset"):
                continue  # Skip this asset (effectively removing it)

        # Update asset with new weight
        updated_asset = asset.copy()
        updated_asset['weight'] = new_weight
        updated_assets.append(updated_asset)
        total_weight += new_weight

    # Show total allocation
    col1, col2, col3 = st.columns([2, 1, 1])

    with col1:
        # Allocation status
        if abs(total_weight - 100) < 0.1:
            st.success(f"✅ Total Allocation: {total_weight:.1f}% (Perfect)")
        elif total_weight < 100:
            st.warning(f"⚠️ Total Allocation: {total_weight:.1f}% (Under-allocated)")
        else:
            st.error(f"❌ Total Allocation: {total_weight:.1f}% (Over-allocated)")

    with col2:
        # Normalize button
        if abs(total_weight - 100) > 0.1 and total_weight > 0:
            if st.button("⚡ Normalize to 100%", key=f"{key}_normalize"):
                # Normalize weights
                for asset in updated_assets:
                    asset['weight'] = (asset['weight'] / total_weight) * 100
                st.success("✅ Weights normalized to 100%")
                st.rerun()

    with col3:
        # Equal weights button
        if len(updated_assets) > 1:
            if st.button("⚖️ Equal Weights", key=f"{key}_equal"):
                equal_weight = 100 / len(updated_assets)
                for asset in updated_assets:
                    asset['weight'] = equal_weight
                st.success(f"✅ Equal weights applied ({equal_weight:.1f}% each)")
                st.rerun()

    return updated_assets


def get_asset_suggestions(query: str) -> List[Dict[str, str]]:
    """Get asset suggestions based on search query."""
    # Mock implementation - in real app would use data fetcher
    common_assets = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'sector': 'Technology'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'sector': 'Technology'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'sector': 'Consumer Cyclical'},
        {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'sector': 'Consumer Cyclical'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'sector': 'Technology'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'sector': 'Technology'},
        {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'sector': 'ETF'},
        {'symbol': 'QQQ', 'name': 'Invesco QQQ Trust', 'sector': 'ETF'},
        {'symbol': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'sector': 'ETF'},
        {'symbol': 'IWM', 'name': 'iShares Russell 2000 ETF', 'sector': 'ETF'},
        {'symbol': 'VEA', 'name': 'Vanguard FTSE Developed Markets ETF', 'sector': 'ETF'},
        {'symbol': 'BND', 'name': 'Vanguard Total Bond Market ETF', 'sector': 'ETF'},
    ]

    query_upper = query.upper()
    return [
        asset for asset in common_assets
        if query_upper in asset['symbol'] or query_upper in asset['name'].upper()
    ]


def validate_ticker_format(ticker: str) -> Tuple[bool, str]:
    """Validate ticker symbol format."""
    if not ticker:
        return False, "Ticker cannot be empty"

    ticker = ticker.upper().strip()
    if not re.match(r'^[A-Z]{1,5}$', ticker):
        return False, "Ticker must be 1-5 letters (e.g., AAPL, SPY)"

    return True, ticker


def create_optimization_settings_form(key: str = "optimization") -> Dict[str, Any]:
    """
    Create optimization settings form.

    Args:
        key: Unique key for the form

    Returns:
        Dictionary with optimization settings
    """
    st.markdown("### ⚙️ Optimization Settings")

    col1, col2 = st.columns(2)

    with col1:
        objective = st.selectbox(
            "Optimization Objective",
            options=[
                "Maximize Sharpe Ratio",
                "Minimize Volatility",
                "Maximize Return",
                "Risk Parity",
                "Maximum Diversification"
            ],
            key=f"{key}_objective",
            help="Primary optimization objective"
        )

        risk_free_rate = st.number_input(
            "Risk-Free Rate (%)",
            min_value=0.0,
            max_value=10.0,
            value=2.0,
            step=0.1,
            key=f"{key}_risk_free"
        ) / 100.0

        max_weight = st.number_input(
            "Maximum Asset Weight (%)",
            min_value=1.0,
            max_value=100.0,
            value=30.0,
            step=1.0,
            key=f"{key}_max_weight"
        ) / 100.0

    with col2:
        min_weight = st.number_input(
            "Minimum Asset Weight (%)",
            min_value=0.0,
            max_value=50.0,
            value=1.0,
            step=0.1,
            key=f"{key}_min_weight"
        ) / 100.0

        lookback_period = st.selectbox(
            "Lookback Period",
            options=["3 months", "6 months", "1 year", "2 years", "3 years"],
            index=2,  # Default to 1 year
            key=f"{key}_lookback"
        )

        rebalancing = st.selectbox(
            "Rebalancing Frequency",
            options=["Monthly", "Quarterly", "Semi-annually", "Annually"],
            index=1,  # Default to quarterly
            key=f"{key}_rebalancing"
        )

    return {
        'objective': objective,
        'risk_free_rate': risk_free_rate,
        'max_weight': max_weight,
        'min_weight': min_weight,
        'lookback_period': lookback_period,
        'rebalancing_frequency': rebalancing
    }


def create_risk_settings_form(key: str = "risk_settings") -> Dict[str, Any]:
    """
    Create risk analysis settings form.

    Args:
        key: Unique key for the form

    Returns:
        Dictionary with risk settings
    """
    st.markdown("### 🛡️ Risk Analysis Settings")

    col1, col2 = st.columns(2)

    with col1:
        var_confidence = st.selectbox(
            "VaR Confidence Level",
            options=[90, 95, 99],
            index=1,  # Default to 95%
            format_func=lambda x: f"{x}%",
            key=f"{key}_var_confidence"
        ) / 100.0

        var_method = st.selectbox(
            "VaR Calculation Method",
            options=["Historical", "Parametric", "Monte Carlo"],
            index=0,  # Default to Historical
            key=f"{key}_var_method"
        )

        time_horizon = st.selectbox(
            "Risk Time Horizon",
            options=["1 day", "1 week", "1 month", "3 months"],
            index=0,  # Default to 1 day
            key=f"{key}_time_horizon"
        )

    with col2:
        monte_carlo_sims = st.number_input(
            "Monte Carlo Simulations",
            min_value=1000,
            max_value=50000,
            value=10000,
            step=1000,
            key=f"{key}_mc_sims"
        )

        stress_tests = st.multiselect(
            "Stress Test Scenarios",
            options=[
                "2008 Financial Crisis",
                "COVID-19 Pandemic",
                "Dot-com Bubble",
                "Black Monday 1987",
                "Custom Scenario"
            ],
            default=["2008 Financial Crisis", "COVID-19 Pandemic"],
            key=f"{key}_stress_tests"
        )

    return {
        'var_confidence': var_confidence,
        'var_method': var_method,
        'time_horizon': time_horizon,
        'monte_carlo_simulations': monte_carlo_sims,
        'stress_test_scenarios': stress_tests
    }