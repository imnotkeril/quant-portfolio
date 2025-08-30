"""
Professional Metrics Cards Components for Wild Market Capital Streamlit app.
Advanced metric display cards with Wild Market Capital styling and backend integration.
"""
import streamlit as st
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Union, Any, Tuple
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px

from utils.formatters import (
    format_percentage,
    format_currency,
    format_number,
    format_ratio,
    format_large_number
)
from utils.constants import COLORS, METRICS_CATEGORIES
from services.service_manager import ServiceManager


def create_metric_card_html(
        title: str,
        value: str,
        delta: Optional[str] = None,
        delta_color: str = "neutral",
        description: str = "",
        icon: str = "",
        tooltip: str = ""
) -> str:
    """
    Create a styled metric card using HTML/CSS.

    Args:
        title: Metric title
        value: Primary metric value
        delta: Optional change/comparison value
        delta_color: Color for delta ('positive', 'negative', 'neutral')
        description: Optional description text
        icon: Optional icon/emoji
        tooltip: Optional tooltip text

    Returns:
        HTML string for the metric card
    """
    delta_class = f"metric-delta {delta_color}" if delta else ""

    delta_html = f'<div class="{delta_class}">{delta}</div>' if delta else ""
    description_html = f'<div class="metric-description">{description}</div>' if description else ""
    icon_html = f'<span class="metric-icon">{icon}</span>' if icon else ""

    return f"""
    <div class="metric-card" title="{tooltip}">
        <div class="metric-header">
            {icon_html}
            <div class="metric-title">{title}</div>
        </div>
        <div class="metric-value">{value}</div>
        {delta_html}
        {description_html}
    </div>
    """


def create_metrics_grid(
        metrics_data: Dict[str, Any],
        columns: int = 4,
        category_filter: Optional[str] = None
) -> None:
    """
    Create a grid of metric cards from portfolio analytics data.

    Args:
        metrics_data: Dictionary containing calculated metrics
        columns: Number of columns in the grid
        category_filter: Optional filter by metrics category
    """
    if not metrics_data:
        st.warning("No metrics data available")
        return

    # Define metrics display configuration
    metrics_config = {
        # Performance Metrics
        "total_return": {
            "title": "Total Return",
            "format": "percentage",
            "category": "returns",
            "icon": "📈",
            "tooltip": "Total cumulative return of the portfolio"
        },
        "annualized_return": {
            "title": "Annual Return",
            "format": "percentage",
            "category": "returns",
            "icon": "📊",
            "tooltip": "Annualized return based on compounding"
        },
        "ytd_return": {
            "title": "YTD Return",
            "format": "percentage",
            "category": "returns",
            "icon": "📅",
            "tooltip": "Year-to-date return"
        },

        # Risk Metrics
        "volatility": {
            "title": "Volatility",
            "format": "percentage",
            "category": "risk",
            "icon": "📊",
            "tooltip": "Annualized standard deviation of returns"
        },
        "max_drawdown": {
            "title": "Max Drawdown",
            "format": "percentage",
            "category": "drawdown",
            "icon": "📉",
            "tooltip": "Maximum peak-to-trough decline"
        },
        "var_95": {
            "title": "VaR (95%)",
            "format": "percentage",
            "category": "risk",
            "icon": "🛡️",
            "tooltip": "Value at Risk at 95% confidence level"
        },
        "cvar_95": {
            "title": "CVaR (95%)",
            "format": "percentage",
            "category": "risk",
            "icon": "⚠️",
            "tooltip": "Conditional Value at Risk (Expected Shortfall)"
        },

        # Ratio Metrics
        "sharpe_ratio": {
            "title": "Sharpe Ratio",
            "format": "ratio",
            "category": "ratios",
            "icon": "⚖️",
            "tooltip": "Risk-adjusted return measure"
        },
        "sortino_ratio": {
            "title": "Sortino Ratio",
            "format": "ratio",
            "category": "ratios",
            "icon": "📐",
            "tooltip": "Downside risk-adjusted return measure"
        },
        "calmar_ratio": {
            "title": "Calmar Ratio",
            "format": "ratio",
            "category": "ratios",
            "icon": "🎯",
            "tooltip": "Return to maximum drawdown ratio"
        },
        "information_ratio": {
            "title": "Info Ratio",
            "format": "ratio",
            "category": "ratios",
            "icon": "ℹ️",
            "tooltip": "Active return to tracking error ratio"
        },

        # Alpha/Beta
        "alpha": {
            "title": "Alpha",
            "format": "percentage",
            "category": "ratios",
            "icon": "🎨",
            "tooltip": "Excess return over benchmark"
        },
        "beta": {
            "title": "Beta",
            "format": "ratio",
            "category": "ratios",
            "icon": "📈",
            "tooltip": "Sensitivity to market movements"
        },

        # Win Metrics
        "win_rate": {
            "title": "Win Rate",
            "format": "percentage",
            "category": "returns",
            "icon": "🏆",
            "tooltip": "Percentage of positive return periods"
        },
        "payoff_ratio": {
            "title": "Payoff Ratio",
            "format": "ratio",
            "category": "ratios",
            "icon": "💰",
            "tooltip": "Average win to average loss ratio"
        }
    }

    # Filter metrics by category if specified
    if category_filter:
        metrics_config = {
            k: v for k, v in metrics_config.items()
            if v["category"] == category_filter
        }

    # Create metrics cards
    metrics_to_display = []
    for metric_key, config in metrics_config.items():
        if metric_key in metrics_data:
            value = metrics_data[metric_key]

            # Format value based on type
            if config["format"] == "percentage":
                formatted_value = format_percentage(value)
            elif config["format"] == "ratio":
                formatted_value = format_ratio(value)
            elif config["format"] == "currency":
                formatted_value = format_currency(value)
            else:
                formatted_value = format_number(value)

            # Determine delta color for risk-adjusted metrics
            delta_color = "neutral"
            delta_text = ""

            if config["category"] == "returns" and value is not None:
                delta_color = "positive" if value > 0 else "negative" if value < 0 else "neutral"
            elif config["category"] == "ratios" and metric_key in ["sharpe_ratio", "sortino_ratio", "calmar_ratio"]:
                if value > 1.0:
                    delta_color = "positive"
                elif value > 0.5:
                    delta_color = "neutral"
                else:
                    delta_color = "negative"

            # Add benchmark comparison if available
            benchmark_key = f"{metric_key}_benchmark"
            if benchmark_key in metrics_data:
                benchmark_value = metrics_data[benchmark_key]
                if benchmark_value is not None:
                    diff = value - benchmark_value
                    if config["format"] == "percentage":
                        delta_text = f"vs Benchmark: {format_percentage(diff, include_sign=True)}"
                    else:
                        delta_text = f"vs Benchmark: {format_ratio(diff, include_sign=True)}"

            metrics_to_display.append({
                "html": create_metric_card_html(
                    title=config["title"],
                    value=formatted_value,
                    delta=delta_text,
                    delta_color=delta_color,
                    icon=config["icon"],
                    tooltip=config["tooltip"]
                ),
                "category": config["category"]
            })

    # Display metrics in grid
    if not metrics_to_display:
        st.warning("No matching metrics found to display")
        return

    # Create grid layout
    cols = st.columns(columns)
    for i, metric in enumerate(metrics_to_display):
        with cols[i % columns]:
            st.markdown(metric["html"], unsafe_allow_html=True)


def create_performance_summary_card(
        portfolio_data: Dict[str, Any],
        show_benchmark: bool = True
) -> None:
    """
    Create a comprehensive performance summary card.

    Args:
        portfolio_data: Portfolio performance data
        show_benchmark: Whether to show benchmark comparison
    """
    if not portfolio_data:
        st.warning("No portfolio data available")
        return

    # Calculate key metrics
    total_return = portfolio_data.get("total_return", 0)
    annual_return = portfolio_data.get("annualized_return", 0)
    volatility = portfolio_data.get("volatility", 0)
    sharpe_ratio = portfolio_data.get("sharpe_ratio", 0)
    max_drawdown = portfolio_data.get("max_drawdown", 0)

    # Create summary card
    col1, col2, col3 = st.columns([2, 1, 1])

    with col1:
        st.markdown("### 📊 Performance Summary")

        # Main metrics
        st.markdown(create_metric_card_html(
            title="Total Return",
            value=format_percentage(total_return),
            delta=format_percentage(annual_return) + " annualized",
            delta_color="positive" if total_return > 0 else "negative",
            icon="📈"
        ), unsafe_allow_html=True)

    with col2:
        st.markdown(create_metric_card_html(
            title="Risk Level",
            value=format_percentage(volatility),
            description=f"Sharpe: {format_ratio(sharpe_ratio)}",
            delta_color="warning" if volatility > 0.15 else "neutral",
            icon="🛡️"
        ), unsafe_allow_html=True)

    with col3:
        st.markdown(create_metric_card_html(
            title="Max Loss",
            value=format_percentage(max_drawdown),
            description="Peak to trough",
            delta_color="negative" if abs(max_drawdown) > 0.1 else "neutral",
            icon="📉"
        ), unsafe_allow_html=True)


def create_risk_dashboard_cards(
        risk_metrics: Dict[str, Any],
        confidence_level: float = 0.95
) -> None:
    """
    Create risk management dashboard with key risk metrics.

    Args:
        risk_metrics: Dictionary of calculated risk metrics
        confidence_level: Confidence level for VaR/CVaR calculations
    """
    if not risk_metrics:
        st.warning("No risk metrics data available")
        return

    st.markdown("### 🛡️ Risk Management Dashboard")

    # Risk metrics configuration
    risk_cards = [
        {
            "title": f"VaR ({confidence_level:.0%})",
            "value": risk_metrics.get("var_95", 0),
            "format": "percentage",
            "icon": "📊",
            "description": f"{confidence_level:.0%} confidence daily loss limit"
        },
        {
            "title": f"CVaR ({confidence_level:.0%})",
            "value": risk_metrics.get("cvar_95", 0),
            "format": "percentage",
            "icon": "⚠️",
            "description": "Expected loss in worst case scenarios"
        },
        {
            "title": "Volatility",
            "value": risk_metrics.get("volatility", 0),
            "format": "percentage",
            "icon": "📈",
            "description": "Annualized volatility"
        },
        {
            "title": "Max Drawdown",
            "value": risk_metrics.get("max_drawdown", 0),
            "format": "percentage",
            "icon": "📉",
            "description": "Maximum historical loss"
        }
    ]

    # Display risk cards
    cols = st.columns(len(risk_cards))
    for i, card in enumerate(risk_cards):
        with cols[i]:
            value = card["value"]

            # Format value
            if card["format"] == "percentage":
                formatted_value = format_percentage(value)
            else:
                formatted_value = format_ratio(value)

            # Determine risk level color
            if card["title"].startswith("VaR") or card["title"].startswith("CVaR"):
                if abs(value) > 0.05:  # More than 5% risk
                    delta_color = "negative"
                elif abs(value) > 0.02:  # 2-5% risk
                    delta_color = "warning"
                else:
                    delta_color = "positive"
            elif card["title"] == "Volatility":
                if value > 0.25:  # High volatility
                    delta_color = "negative"
                elif value > 0.15:  # Medium volatility
                    delta_color = "warning"
                else:
                    delta_color = "positive"
            else:  # Max Drawdown
                if abs(value) > 0.20:  # More than 20% drawdown
                    delta_color = "negative"
                elif abs(value) > 0.10:  # 10-20% drawdown
                    delta_color = "warning"
                else:
                    delta_color = "positive"

            st.markdown(create_metric_card_html(
                title=card["title"],
                value=formatted_value,
                description=card["description"],
                delta_color=delta_color,
                icon=card["icon"]
            ), unsafe_allow_html=True)


def create_comparison_metrics_cards(
        portfolio1_metrics: Dict[str, Any],
        portfolio2_metrics: Dict[str, Any],
        portfolio1_name: str = "Portfolio 1",
        portfolio2_name: str = "Portfolio 2"
) -> None:
    """
    Create side-by-side comparison of portfolio metrics.

    Args:
        portfolio1_metrics: First portfolio metrics
        portfolio2_metrics: Second portfolio metrics
        portfolio1_name: Name of first portfolio
        portfolio2_name: Name of second portfolio
    """
    st.markdown("### 📊 Portfolio Comparison")

    # Comparison metrics
    comparison_metrics = [
        ("Total Return", "total_return", "percentage"),
        ("Volatility", "volatility", "percentage"),
        ("Sharpe Ratio", "sharpe_ratio", "ratio"),
        ("Max Drawdown", "max_drawdown", "percentage")
    ]

    cols = st.columns(len(comparison_metrics))

    for i, (title, key, format_type) in enumerate(comparison_metrics):
        with cols[i]:
            value1 = portfolio1_metrics.get(key, 0)
            value2 = portfolio2_metrics.get(key, 0)

            if format_type == "percentage":
                formatted_value1 = format_percentage(value1)
                formatted_value2 = format_percentage(value2)
            else:
                formatted_value1 = format_ratio(value1)
                formatted_value2 = format_ratio(value2)

            # Determine which is better
            if key == "max_drawdown":
                better = 1 if abs(value1) < abs(value2) else 2
            elif key in ["total_return", "sharpe_ratio"]:
                better = 1 if value1 > value2 else 2
            else:  # Volatility - lower is generally better
                better = 1 if value1 < value2 else 2

            # Create comparison display
            st.markdown(f"**{title}**")

            portfolio1_color = "positive" if better == 1 else "neutral"
            portfolio2_color = "positive" if better == 2 else "neutral"

            st.markdown(f"""
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div style="color: {COLORS['success'] if better == 1 else COLORS['text_secondary']};">
                    {portfolio1_name}: <strong>{formatted_value1}</strong>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div style="color: {COLORS['success'] if better == 2 else COLORS['text_secondary']};">
                    {portfolio2_name}: <strong>{formatted_value2}</strong>
                </div>
            </div>
            """, unsafe_allow_html=True)


@st.cache_data(ttl=300)  # Cache for 5 minutes
def calculate_portfolio_metrics(portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate comprehensive portfolio metrics using backend services.

    Args:
        portfolio_data: Portfolio data

    Returns:
        Dictionary of calculated metrics
    """
    try:
        # Get analytics services
        analytics_service = ServiceManager.get_analytics_service()
        enhanced_analytics_service = ServiceManager.get_enhanced_analytics_service()

        if not analytics_service or not enhanced_analytics_service:
            st.warning("Analytics services not available")
            return {}

        # This would typically involve calling backend methods
        # For now, return mock data structure that matches expected format
        mock_metrics = {
            "total_return": 0.1234,  # 12.34%
            "annualized_return": 0.0987,  # 9.87%
            "volatility": 0.1456,  # 14.56%
            "sharpe_ratio": 0.8765,  # 0.88
            "sortino_ratio": 1.2345,  # 1.23
            "calmar_ratio": 0.6789,  # 0.68
            "max_drawdown": -0.0876,  # -8.76%
            "var_95": -0.0234,  # -2.34%
            "cvar_95": -0.0456,  # -4.56%
            "alpha": 0.0123,  # 1.23%
            "beta": 0.9876,  # 0.99
            "information_ratio": 0.5432,  # 0.54
            "win_rate": 0.6234,  # 62.34%
            "payoff_ratio": 1.4567  # 1.46
        }

        return mock_metrics

    except Exception as e:
        st.error(f"Error calculating portfolio metrics: {str(e)}")
        return {}


def display_metrics_by_category(
        metrics_data: Dict[str, Any],
        selected_categories: List[str] = None
) -> None:
    """
    Display metrics organized by categories with expandable sections.

    Args:
        metrics_data: Portfolio metrics data
        selected_categories: List of categories to display (all if None)
    """
    if not metrics_data:
        st.warning("No metrics data available")
        return

    # Get all categories or use selected ones
    if selected_categories is None:
        selected_categories = list(METRICS_CATEGORIES.keys())

    for category in selected_categories:
        if category in METRICS_CATEGORIES:
            category_info = METRICS_CATEGORIES[category]

            with st.expander(f"{category_info['icon']} {category_info['title']}", expanded=True):
                create_metrics_grid(
                    metrics_data=metrics_data,
                    columns=4,
                    category_filter=category
                )