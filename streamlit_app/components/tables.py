"""
Professional Data Tables Components for Wild Market Capital Streamlit app.
Advanced data table components with sorting, filtering, and styling.
"""
import streamlit as st
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Union, Any, Callable
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go

from utils.formatters import (
    format_percentage,
    format_currency,
    format_number,
    format_date,
    format_ratio,
    format_large_number
)
from utils.constants import COLORS


def create_portfolio_assets_table(
        portfolio_data: Dict[str, Any],
        show_details: bool = True,
        height: int = 400
) -> None:
    """
    Create a detailed table of portfolio assets.

    Args:
        portfolio_data: Portfolio data dictionary
        show_details: Whether to show additional details
        height: Table height in pixels
    """
    assets = portfolio_data.get("assets", {})

    if not assets:
        st.warning("No assets found in portfolio")
        return

    # Convert assets to DataFrame
    assets_data = []
    for ticker, asset_data in assets.items():
        asset_info = {
            "Ticker": ticker,
            "Weight": asset_data.get("weight", 0) * 100,  # Convert to percentage
            "Shares": asset_data.get("shares", 0),
            "Price": asset_data.get("current_price", 0),
            "Value": asset_data.get("market_value", 0),
            "Day Change": asset_data.get("day_change", 0),
            "Day Change %": asset_data.get("day_change_pct", 0) * 100,
            "Sector": asset_data.get("sector", "Unknown"),
            "Industry": asset_data.get("industry", "Unknown")
        }

        if show_details:
            asset_info.update({
                "52W High": asset_data.get("high_52w", 0),
                "52W Low": asset_data.get("low_52w", 0),
                "P/E Ratio": asset_data.get("pe_ratio", 0),
                "Dividend Yield": asset_data.get("dividend_yield", 0) * 100
            })

        assets_data.append(asset_info)

    df = pd.DataFrame(assets_data)

    if df.empty:
        st.warning("No asset data available")
        return

    # Configure columns with proper formatting
    column_config = {
        "Ticker": st.column_config.TextColumn(
            "Ticker",
            width="small",
            help="Stock symbol"
        ),
        "Weight": st.column_config.ProgressColumn(
            "Weight (%)",
            min_value=0,
            max_value=df["Weight"].max() * 1.1 if df["Weight"].max() > 0 else 100,
            format="%.2f%%",
            width="medium"
        ),
        "Shares": st.column_config.NumberColumn(
            "Shares",
            format="%.2f",
            width="small"
        ),
        "Price": st.column_config.NumberColumn(
            "Price",
            format="$%.2f",
            width="small"
        ),
        "Value": st.column_config.NumberColumn(
            "Value",
            format="$%.0f",
            width="medium"
        ),
        "Day Change": st.column_config.NumberColumn(
            "Day Change",
            format="$%.2f",
            width="small"
        ),
        "Day Change %": st.column_config.NumberColumn(
            "Day Change %",
            format="%.2f%%",
            width="small"
        ),
        "Sector": st.column_config.TextColumn(
            "Sector",
            width="medium"
        ),
        "Industry": st.column_config.TextColumn(
            "Industry",
            width="medium"
        )
    }

    if show_details:
        column_config.update({
            "52W High": st.column_config.NumberColumn(
                "52W High",
                format="$%.2f",
                width="small"
            ),
            "52W Low": st.column_config.NumberColumn(
                "52W Low",
                format="$%.2f",
                width="small"
            ),
            "P/E Ratio": st.column_config.NumberColumn(
                "P/E Ratio",
                format="%.1f",
                width="small"
            ),
            "Dividend Yield": st.column_config.NumberColumn(
                "Dividend Yield",
                format="%.2f%%",
                width="small"
            )
        })

    st.markdown("### 📊 Portfolio Assets")

    # Display table with styling
    st.dataframe(
        df,
        column_config=column_config,
        hide_index=True,
        use_container_width=True,
        height=height
    )

    # Summary statistics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        total_assets = len(df)
        st.metric("Total Assets", total_assets)

    with col2:
        total_value = df["Value"].sum()
        st.metric("Total Value", format_currency(total_value))

    with col3:
        avg_weight = df["Weight"].mean()
        st.metric("Avg Weight", f"{avg_weight:.2f}%")

    with col4:
        total_day_change = df["Day Change"].sum()
        change_color = "normal" if total_day_change >= 0 else "inverse"
        st.metric(
            "Daily P&L",
            format_currency(total_day_change),
            delta=format_currency(total_day_change),
            delta_color=change_color
        )


def create_performance_comparison_table(
        portfolios_data: List[Dict[str, Any]],
        metrics: List[str] = None,
        height: int = 400
) -> None:
    """
    Create a performance comparison table for multiple portfolios.

    Args:
        portfolios_data: List of portfolio dictionaries with metrics
        metrics: List of metrics to display
        height: Table height in pixels
    """
    if not portfolios_data:
        st.warning("No portfolio data available")
        return

    if metrics is None:
        metrics = [
            "total_return", "annualized_return", "volatility",
            "sharpe_ratio", "max_drawdown", "sortino_ratio"
        ]

    # Convert to comparison DataFrame
    comparison_data = []
    for portfolio in portfolios_data:
        row = {"Portfolio": portfolio.get("name", "Unknown")}

        for metric in metrics:
            value = portfolio.get("metrics", {}).get(metric, 0)
            row[metric] = value

        comparison_data.append(row)

    df = pd.DataFrame(comparison_data)

    if df.empty:
        st.warning("No comparison data available")
        return

    # Format columns
    formatted_df = df.copy()

    # Apply formatting based on metric type
    percentage_metrics = ["total_return", "annualized_return", "volatility", "max_drawdown"]
    ratio_metrics = ["sharpe_ratio", "sortino_ratio", "calmar_ratio", "information_ratio"]

    for col in df.columns:
        if col == "Portfolio":
            continue
        elif col in percentage_metrics:
            formatted_df[col] = df[col].apply(lambda x: format_percentage(x))
        elif col in ratio_metrics:
            formatted_df[col] = df[col].apply(lambda x: format_ratio(x))
        else:
            formatted_df[col] = df[col].apply(lambda x: format_number(x))

    # Create column configuration
    column_config = {
        "Portfolio": st.column_config.TextColumn(
            "Portfolio",
            width="medium"
        )
    }

    # Add metric columns with proper names
    metric_names = {
        "total_return": "Total Return",
        "annualized_return": "Annual Return",
        "volatility": "Volatility",
        "sharpe_ratio": "Sharpe Ratio",
        "max_drawdown": "Max Drawdown",
        "sortino_ratio": "Sortino Ratio",
        "calmar_ratio": "Calmar Ratio",
        "information_ratio": "Info Ratio"
    }

    for metric in metrics:
        display_name = metric_names.get(metric, metric.replace("_", " ").title())
        column_config[metric] = st.column_config.TextColumn(
            display_name,
            width="small"
        )

    st.markdown("### 📈 Performance Comparison")

    # Display formatted table
    st.dataframe(
        formatted_df,
        column_config=column_config,
        hide_index=True,
        use_container_width=True,
        height=height
    )


def create_correlation_table(
        correlation_data: pd.DataFrame,
        title: str = "Asset Correlation Matrix"
) -> None:
    """
    Create a correlation matrix table with color coding.

    Args:
        correlation_data: DataFrame with correlation data
        title: Table title
    """
    if correlation_data.empty:
        st.warning("No correlation data available")
        return

    st.markdown(f"### {title}")

    # Format correlation values
    formatted_corr = correlation_data.round(3)

    # Create a styled dataframe
    def highlight_correlations(val):
        """Color cells based on correlation strength."""
        try:
            val_float = float(val)
            if val_float >= 0.7:
                return f'background-color: rgba(76, 175, 80, 0.3)'  # Green for strong positive
            elif val_float <= -0.7:
                return f'background-color: rgba(244, 67, 54, 0.3)'  # Red for strong negative
            elif abs(val_float) >= 0.3:
                return f'background-color: rgba(255, 193, 7, 0.3)'  # Yellow for moderate
            else:
                return ''
        except:
            return ''

    # Display with styling (simplified for Streamlit)
    st.dataframe(
        formatted_corr,
        use_container_width=True
    )

    # Add legend
    col1, col2 = st.columns([3, 1])
    with col2:
        st.markdown("""
        **Legend:**
        - 🟢 Strong Positive (≥0.7)
        - 🔴 Strong Negative (≤-0.7)
        - 🟡 Moderate (0.3-0.7)
        - ⚪ Weak (<0.3)
        """)


def create_risk_metrics_table(
        risk_data: Dict[str, float],
        benchmark_data: Optional[Dict[str, float]] = None,
        height: int = 300
) -> None:
    """
    Create a detailed risk metrics table.

    Args:
        risk_data: Risk metrics dictionary
        benchmark_data: Optional benchmark metrics
        height: Table height
    """
    # Define risk metrics with descriptions
    risk_metrics = {
        "var_95": ("Value at Risk (95%)", "percentage", "Maximum expected loss (95% confidence)"),
        "cvar_95": ("Conditional VaR", "percentage", "Expected loss beyond VaR threshold"),
        "volatility": ("Volatility", "percentage", "Annualized standard deviation"),
        "downside_deviation": ("Downside Deviation", "percentage", "Volatility of negative returns"),
        "max_drawdown": ("Maximum Drawdown", "percentage", "Largest peak-to-trough decline"),
        "beta": ("Beta", "ratio", "Sensitivity to market movements"),
        "alpha": ("Alpha", "percentage", "Excess return vs benchmark"),
        "r_squared": ("R-Squared", "ratio", "Correlation with benchmark"),
        "tracking_error": ("Tracking Error", "percentage", "Standard deviation of excess returns"),
        "information_ratio": ("Information Ratio", "ratio", "Active return per unit of tracking error")
    }

    # Create table data
    table_data = []
    for key, (name, format_type, description) in risk_metrics.items():
        portfolio_value = risk_data.get(key, 0)

        row = {
            "Metric": name,
            "Value": portfolio_value,
            "Description": description
        }

        # Add benchmark comparison if available
        if benchmark_data and key in benchmark_data:
            benchmark_value = benchmark_data[key]
            difference = portfolio_value - benchmark_value
            row["Benchmark"] = benchmark_value
            row["Difference"] = difference

        table_data.append(row)

    df = pd.DataFrame(table_data)

    if df.empty:
        st.warning("No risk metrics available")
        return

    # Format values
    formatted_df = df.copy()

    for col in ["Value", "Benchmark", "Difference"]:
        if col in formatted_df.columns:
            formatted_df[col] = formatted_df[col].apply(
                lambda x: format_percentage(x) if not pd.isna(x) else "N/A"
            )

    # Configure columns
    column_config = {
        "Metric": st.column_config.TextColumn("Risk Metric", width="medium"),
        "Value": st.column_config.TextColumn("Portfolio", width="small"),
        "Description": st.column_config.TextColumn("Description", width="large")
    }

    if "Benchmark" in formatted_df.columns:
        column_config["Benchmark"] = st.column_config.TextColumn("Benchmark", width="small")
        column_config["Difference"] = st.column_config.TextColumn("Difference", width="small")

    st.markdown("### 🛡️ Risk Analysis")

    st.dataframe(
        formatted_df,
        column_config=column_config,
        hide_index=True,
        use_container_width=True,
        height=height
    )


def create_sector_allocation_table(
        allocation_data: Dict[str, float],
        show_chart: bool = True
) -> None:
    """
    Create a sector allocation table with optional chart.

    Args:
        allocation_data: Dictionary with sector allocations
        show_chart: Whether to show accompanying pie chart
    """
    if not allocation_data:
        st.warning("No allocation data available")
        return

    # Convert to DataFrame
    df = pd.DataFrame([
        {"Sector": sector, "Allocation": weight}
        for sector, weight in allocation_data.items()
    ]).sort_values("Allocation", ascending=False)

    # Format allocations as percentages
    df["Allocation %"] = df["Allocation"].apply(lambda x: f"{x * 100:.2f}%")

    # Calculate cumulative allocation
    df["Cumulative %"] = df["Allocation"].cumsum().apply(lambda x: f"{x * 100:.2f}%")

    if show_chart:
        col1, col2 = st.columns([2, 1])

        with col1:
            st.markdown("### 🏢 Sector Allocation")
            st.dataframe(
                df[["Sector", "Allocation %", "Cumulative %"]],
                column_config={
                    "Sector": st.column_config.TextColumn("Sector", width="medium"),
                    "Allocation %": st.column_config.TextColumn("Weight", width="small"),
                    "Cumulative %": st.column_config.TextColumn("Cumulative", width="small")
                },
                hide_index=True,
                use_container_width=True,
                height=400
            )

        with col2:
            # Create pie chart
            fig = px.pie(
                df,
                values="Allocation",
                names="Sector",
                title="Sector Distribution"
            )

            fig.update_traces(
                textposition='inside',
                textinfo='percent+label',
                hovertemplate='<b>%{label}</b><br>Weight: %{percent}<extra></extra>'
            )

            fig.update_layout(
                showlegend=False,
                height=400,
                font=dict(color=COLORS["text_primary"]),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)'
            )

            st.plotly_chart(fig, use_container_width=True)
    else:
        st.markdown("### 🏢 Sector Allocation")
        st.dataframe(
            df[["Sector", "Allocation %", "Cumulative %"]],
            hide_index=True,
            use_container_width=True
        )


def create_custom_data_table(
        data: pd.DataFrame,
        title: str,
        column_formats: Optional[Dict[str, str]] = None,
        height: int = 400,
        sortable: bool = True,
        show_summary: bool = False
) -> None:
    """
    Create a custom data table with flexible formatting.

    Args:
        data: DataFrame to display
        title: Table title
        column_formats: Dictionary mapping column names to format types
        height: Table height
        sortable: Whether columns are sortable (Streamlit default)
        show_summary: Whether to show summary statistics
    """
    if data.empty:
        st.warning(f"No data available for {title}")
        return

    st.markdown(f"### {title}")

    # Apply formatting if specified
    if column_formats:
        formatted_data = data.copy()

        for col, format_type in column_formats.items():
            if col in formatted_data.columns:
                if format_type == "percentage":
                    formatted_data[col] = formatted_data[col].apply(format_percentage)
                elif format_type == "currency":
                    formatted_data[col] = formatted_data[col].apply(format_currency)
                elif format_type == "number":
                    formatted_data[col] = formatted_data[col].apply(
                        lambda x: format_number(x) if pd.notna(x) else "N/A"
                    )
                elif format_type == "date":
                    formatted_data[col] = formatted_data[col].apply(format_date)
    else:
        formatted_data = data

    # Display table
    st.dataframe(
        formatted_data,
        use_container_width=True,
        height=height,
        hide_index=True
    )

    # Add summary statistics if requested
    if show_summary:
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            with st.expander("📊 Summary Statistics"):
                summary_stats = data[numeric_cols].describe()
                st.dataframe(summary_stats, use_container_width=True)


def create_simple_metrics_table(
        metrics: Dict[str, Union[float, str]],
        title: str = "Metrics",
        num_columns: int = 2
) -> None:
    """
    Create a simple metrics table with two columns.

    Args:
        metrics: Dictionary of metric name -> value
        title: Table title
        num_columns: Number of columns for layout
    """
    if not metrics:
        st.warning(f"No {title.lower()} available")
        return

    st.markdown(f"### {title}")

    # Convert to DataFrame
    df = pd.DataFrame([
        {"Metric": metric, "Value": value}
        for metric, value in metrics.items()
    ])

    # Display as table
    st.dataframe(
        df,
        column_config={
            "Metric": st.column_config.TextColumn("Metric", width="medium"),
            "Value": st.column_config.TextColumn("Value", width="medium")
        },
        hide_index=True,
        use_container_width=True
    )