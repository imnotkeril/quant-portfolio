"""
Portfolio Selector Component - Select portfolios with preview.
"""
import streamlit as st
from typing import Optional, Dict, Any, List


def create_portfolio_selector(key: str = "portfolio_selector",
                              show_details: bool = True,
                              allow_multiple: bool = False) -> Optional[Dict[str, Any]]:
    """
    Create a portfolio selector with preview.

    Args:
        key: Unique key for the selector
        show_details: Whether to show portfolio details
        allow_multiple: Whether to allow multiple selection

    Returns:
        Selected portfolio(s) data or None
    """
    try:
        from services.service_manager import ServiceManager
        portfolio_manager = ServiceManager.get_portfolio_manager()

        if portfolio_manager is None:
            st.error("❌ Portfolio Manager not available")
            return None

        # Load portfolios
        portfolios = portfolio_manager.list_portfolios()

        if not portfolios:
            st.warning("📝 No portfolios found. Create your first portfolio!")

            col1, col2, col3 = st.columns([1, 1, 1])
            with col2:
                if st.button("➕ Create Portfolio", type="primary", use_container_width=True):
                    st.switch_page("pages/Portfolio_Creation.py")
            return None

        # Create portfolio options
        portfolio_options = {}
        for portfolio in portfolios:
            name = portfolio.get('name', 'Unnamed Portfolio')
            assets_count = len(portfolio.get('assets', {}))
            created_date = portfolio.get('created_at', 'Unknown')[:10]  # Get date part

            display_name = f"{name} ({assets_count} assets, {created_date})"
            portfolio_options[display_name] = portfolio

        if allow_multiple:
            # Multi-select
            selected_names = st.multiselect(
                "Select Portfolios:",
                options=list(portfolio_options.keys()),
                key=f"{key}_multi",
                help="Select one or more portfolios for analysis"
            )

            if not selected_names:
                return None

            selected_portfolios = [portfolio_options[name] for name in selected_names]

            if show_details:
                for i, portfolio in enumerate(selected_portfolios):
                    show_portfolio_preview(portfolio, f"preview_{key}_{i}")

            return selected_portfolios

        else:
            # Single select
            selected_name = st.selectbox(
                "Select Portfolio:",
                options=[""] + list(portfolio_options.keys()),
                key=f"{key}_single",
                help="Select a portfolio for analysis"
            )

            if not selected_name:
                return None

            selected_portfolio = portfolio_options[selected_name]

            if show_details:
                show_portfolio_preview(selected_portfolio, f"preview_{key}")

            return selected_portfolio

    except Exception as e:
        st.error(f"❌ Failed to load portfolios: {str(e)}")
        return None


def show_portfolio_preview(portfolio: Dict[str, Any], key: str):
    """Show portfolio preview card."""
    name = portfolio.get('name', 'Unnamed Portfolio')
    description = portfolio.get('description', 'No description')
    assets = portfolio.get('assets', {})
    created_at = portfolio.get('created_at', 'Unknown')[:10]
    tags = portfolio.get('tags', [])

    with st.expander(f"📊 {name} - Preview", expanded=False):
        col1, col2 = st.columns([2, 1])

        with col1:
            st.markdown(f"**Created:** {created_at}")
            st.markdown(f"**Description:** {description}")

            if tags:
                tag_str = ", ".join([f"`{tag}`" for tag in tags])
                st.markdown(f"**Tags:** {tag_str}")

        with col2:
            st.metric("Assets", len(assets))

            # Show top assets
            if assets:
                st.markdown("**Top Assets:**")
                # Sort assets by weight
                sorted_assets = sorted(
                    [(ticker, data.get('weight', 0)) for ticker, data in assets.items()],
                    key=lambda x: x[1],
                    reverse=True
                )[:3]

                for ticker, weight in sorted_assets:
                    st.markdown(f"• {ticker}: {weight * 100:.1f}%")


def create_portfolio_comparison_selector(key: str = "comparison_selector") -> Optional[List[Dict[str, Any]]]:
    """
    Create a selector for portfolio comparison (2+ portfolios).

    Args:
        key: Unique key for the selector

    Returns:
        List of selected portfolios or None
    """
    st.markdown("### 📊 Select Portfolios to Compare")
    st.markdown("Choose 2 or more portfolios for side-by-side comparison")

    selected_portfolios = create_portfolio_selector(
        key=key,
        show_details=False,
        allow_multiple=True
    )

    if selected_portfolios and len(selected_portfolios) < 2:
        st.warning("⚠️ Please select at least 2 portfolios for comparison")
        return None

    if selected_portfolios and len(selected_portfolios) > 5:
        st.warning("⚠️ Maximum 5 portfolios can be compared at once")
        return selected_portfolios[:5]

    return selected_portfolios


def create_benchmark_selector(key: str = "benchmark_selector") -> Optional[str]:
    """
    Create a benchmark selector.

    Args:
        key: Unique key for the selector

    Returns:
        Selected benchmark ticker or None
    """
    benchmarks = {
        "S&P 500 (SPY)": "SPY",
        "NASDAQ 100 (QQQ)": "QQQ",
        "Russell 2000 (IWM)": "IWM",
        "Total Stock Market (VTI)": "VTI",
        "Developed Markets (VEA)": "VEA",
        "Emerging Markets (VWO)": "VWO",
        "Bonds (BND)": "BND",
        "REITs (VNQ)": "VNQ"
    }

    selected_benchmark = st.selectbox(
        "Select Benchmark:",
        options=[""] + list(benchmarks.keys()),
        key=key,
        help="Choose a benchmark for comparison"
    )

    if not selected_benchmark:
        return None

    return benchmarks[selected_benchmark]


def create_time_period_selector(key: str = "time_period") -> Dict[str, str]:
    """
    Create a time period selector.

    Args:
        key: Unique key for the selector

    Returns:
        Dictionary with start_date and end_date
    """
    col1, col2, col3 = st.columns([1, 1, 1])

    with col1:
        preset_periods = {
            "1 Month": 30,
            "3 Months": 90,
            "6 Months": 180,
            "1 Year": 365,
            "2 Years": 730,
            "5 Years": 1825,
            "Custom": None
        }

        selected_period = st.selectbox(
            "Time Period:",
            options=list(preset_periods.keys()),
            index=3,  # Default to 1 Year
            key=f"{key}_preset"
        )

    if selected_period == "Custom":
        with col2:
            start_date = st.date_input("Start Date", key=f"{key}_start")
        with col3:
            end_date = st.date_input("End Date", key=f"{key}_end")
    else:
        from datetime import datetime, timedelta
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=preset_periods[selected_period])

        with col2:
            st.metric("Start Date", start_date.strftime("%Y-%m-%d"))
        with col3:
            st.metric("End Date", end_date.strftime("%Y-%m-%d"))

    return {
        'start_date': start_date.strftime("%Y-%m-%d"),
        'end_date': end_date.strftime("%Y-%m-%d"),
        'period_name': selected_period
    }


def create_analysis_options(key: str = "analysis_options") -> Dict[str, Any]:
    """
    Create analysis options selector.

    Args:
        key: Unique key for the selector

    Returns:
        Dictionary with analysis options
    """
    st.markdown("### ⚙️ Analysis Options")

    col1, col2 = st.columns(2)

    with col1:
        risk_free_rate = st.number_input(
            "Risk-Free Rate (%)",
            min_value=0.0,
            max_value=10.0,
            value=2.0,
            step=0.1,
            key=f"{key}_risk_free",
            help="Risk-free rate for Sharpe ratio calculation"
        ) / 100.0

        confidence_level = st.selectbox(
            "VaR Confidence Level",
            options=[0.90, 0.95, 0.99],
            index=1,  # Default to 95%
            format_func=lambda x: f"{x * 100:.0f}%",
            key=f"{key}_confidence",
            help="Confidence level for Value at Risk calculation"
        )

    with col2:
        rebalancing_frequency = st.selectbox(
            "Rebalancing Frequency",
            options=["Daily", "Weekly", "Monthly", "Quarterly", "Annually"],
            index=2,  # Default to Monthly
            key=f"{key}_rebalancing",
            help="Frequency for portfolio rebalancing"
        )

        include_dividends = st.checkbox(
            "Include Dividends",
            value=True,
            key=f"{key}_dividends",
            help="Include dividend payments in returns calculation"
        )

    return {
        'risk_free_rate': risk_free_rate,
        'confidence_level': confidence_level,
        'rebalancing_frequency': rebalancing_frequency,
        'include_dividends': include_dividends
    }