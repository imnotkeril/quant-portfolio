"""
Charts Components - Plotly charts for portfolio visualization.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta

from utils.constants import COLORS, CHART_COLORS, PERFORMANCE_COLORS


def create_portfolio_composition_chart(assets: Dict[str, float],
                                       title: str = "Portfolio Composition",
                                       chart_type: str = "pie") -> go.Figure:
    """
    Create portfolio composition chart (pie or bar).

    Args:
        assets: Dictionary of {ticker: weight}
        title: Chart title
        chart_type: "pie" or "bar"

    Returns:
        Plotly figure
    """
    if not assets:
        return go.Figure()

    tickers = list(assets.keys())
    weights = list(assets.values())

    # Convert weights to percentages if they're decimals
    if all(w <= 1 for w in weights):
        weights = [w * 100 for w in weights]

    if chart_type == "pie":
        fig = px.pie(
            values=weights,
            names=tickers,
            title=title,
            color_discrete_sequence=CHART_COLORS
        )

        fig.update_traces(
            textposition='inside',
            textinfo='percent+label',
            hovertemplate='<b>%{label}</b><br>Weight: %{value:.1f}%<br>Count: %{percent}<extra></extra>'
        )

    else:  # bar chart
        fig = px.bar(
            x=tickers,
            y=weights,
            title=title,
            color=tickers,
            color_discrete_sequence=CHART_COLORS
        )

        fig.update_layout(
            xaxis_title="Assets",
            yaxis_title="Weight (%)",
            showlegend=False
        )

        fig.update_traces(
            hovertemplate='<b>%{x}</b><br>Weight: %{y:.1f}%<extra></extra>'
        )

    # Apply dark theme
    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title_font_color=COLORS["text_primary"],
        height=400
    )

    return fig


def create_performance_chart(data: pd.DataFrame,
                             title: str = "Portfolio Performance",
                             benchmark_data: Optional[pd.DataFrame] = None,
                             show_drawdown: bool = False) -> go.Figure:
    """
    Create performance comparison chart.

    Args:
        data: Performance data with Date index and columns for each series
        title: Chart title
        benchmark_data: Optional benchmark data
        show_drawdown: Whether to show drawdown subplot

    Returns:
        Plotly figure
    """
    if data.empty:
        return go.Figure()

    # Create subplots if showing drawdown
    if show_drawdown:
        fig = make_subplots(
            rows=2, cols=1,
            shared_xaxes=True,
            vertical_spacing=0.1,
            subplot_titles=[title, "Drawdown"],
            row_heights=[0.7, 0.3]
        )
    else:
        fig = go.Figure()

    # Add portfolio performance lines
    colors = CHART_COLORS
    for i, column in enumerate(data.columns):
        fig.add_trace(
            go.Scatter(
                x=data.index,
                y=data[column],
                name=column,
                line=dict(color=colors[i % len(colors)], width=2),
                hovertemplate=f'<b>{column}</b><br>%{{x}}<br>Return: %{{y:.2f}}%<extra></extra>'
            ),
            row=1 if show_drawdown else None,
            col=1 if show_drawdown else None
        )

    # Add benchmark if provided
    if benchmark_data is not None and not benchmark_data.empty:
        for column in benchmark_data.columns:
            fig.add_trace(
                go.Scatter(
                    x=benchmark_data.index,
                    y=benchmark_data[column],
                    name=f"Benchmark: {column}",
                    line=dict(color=PERFORMANCE_COLORS["benchmark"], width=2, dash="dash"),
                    hovertemplate=f'<b>Benchmark: {column}</b><br>%{{x}}<br>Return: %{{y:.2f}}%<extra></extra>'
                ),
                row=1 if show_drawdown else None,
                col=1 if show_drawdown else None
            )

    # Add drawdown subplot
    if show_drawdown:
        for i, column in enumerate(data.columns):
            # Calculate drawdown
            cumulative = (1 + data[column] / 100).cumprod()
            peak = cumulative.expanding().max()
            drawdown = ((cumulative - peak) / peak * 100)

            fig.add_trace(
                go.Scatter(
                    x=data.index,
                    y=drawdown,
                    name=f"{column} Drawdown",
                    fill='tozeroy',
                    fillcolor=f"rgba{tuple(list(int(PERFORMANCE_COLORS['drawdown'][i:i + 2], 16) for i in (1, 3, 5)) + [0.3])}",
                    line=dict(color=PERFORMANCE_COLORS["drawdown"], width=1),
                    hovertemplate=f'<b>{column} Drawdown</b><br>%{{x}}<br>Drawdown: %{{y:.2f}}%<extra></extra>',
                    showlegend=False
                ),
                row=2, col=1
            )

    # Update layout
    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title=title if not show_drawdown else None,
        xaxis_title="Date",
        yaxis_title="Cumulative Return (%)",
        height=500 if show_drawdown else 400,
        hovermode='x unified',
        showlegend=True
    )

    if show_drawdown:
        fig.update_yaxes(title_text="Return (%)", row=1, col=1)
        fig.update_yaxes(title_text="Drawdown (%)", row=2, col=1)

    return fig


def create_risk_return_scatter(portfolio_data: List[Dict[str, Any]],
                               title: str = "Risk vs Return") -> go.Figure:
    """
    Create risk-return scatter plot.

    Args:
        portfolio_data: List of portfolios with risk/return data
        title: Chart title

    Returns:
        Plotly figure
    """
    if not portfolio_data:
        return go.Figure()

    fig = go.Figure()

    # Extract data
    names = []
    returns = []
    risks = []
    sharpe_ratios = []

    for portfolio in portfolio_data:
        names.append(portfolio.get('name', 'Unknown'))
        returns.append(portfolio.get('annual_return', 0))
        risks.append(portfolio.get('volatility', 0))
        sharpe_ratios.append(portfolio.get('sharpe_ratio', 0))

    # Create scatter plot
    fig.add_trace(go.Scatter(
        x=risks,
        y=returns,
        mode='markers+text',
        text=names,
        textposition='top center',
        marker=dict(
            size=15,
            color=sharpe_ratios,
            colorscale='Viridis',
            colorbar=dict(title="Sharpe Ratio"),
            line=dict(color='white', width=2)
        ),
        hovertemplate='<b>%{text}</b><br>Risk: %{x:.2f}%<br>Return: %{y:.2f}%<br>Sharpe: %{marker.color:.2f}<extra></extra>'
    ))

    # Add efficient frontier line (mock)
    if len(risks) > 1:
        x_range = np.linspace(min(risks) * 0.8, max(risks) * 1.2, 100)
        y_frontier = np.sqrt(x_range) * max(returns) * 0.8  # Mock efficient frontier

        fig.add_trace(go.Scatter(
            x=x_range,
            y=y_frontier,
            mode='lines',
            name='Efficient Frontier',
            line=dict(color=COLORS["primary"], dash='dash', width=2),
            hoverinfo='skip'
        ))

    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title=title,
        xaxis_title="Risk (Volatility %)",
        yaxis_title="Return (%)",
        height=500,
        showlegend=True
    )

    return fig


def create_correlation_heatmap(correlation_matrix: pd.DataFrame,
                               title: str = "Asset Correlation Matrix") -> go.Figure:
    """
    Create correlation heatmap.

    Args:
        correlation_matrix: Correlation matrix DataFrame
        title: Chart title

    Returns:
        Plotly figure
    """
    if correlation_matrix.empty:
        return go.Figure()

    fig = go.Figure(data=go.Heatmap(
        z=correlation_matrix.values,
        x=correlation_matrix.columns,
        y=correlation_matrix.index,
        colorscale='RdBu',
        zmid=0,
        text=correlation_matrix.round(2).values,
        texttemplate="%{text}",
        textfont={"size": 10},
        hovertemplate='<b>%{y} vs %{x}</b><br>Correlation: %{z:.3f}<extra></extra>'
    ))

    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title=title,
        height=max(400, len(correlation_matrix) * 30),
        xaxis=dict(side='bottom'),
        yaxis=dict(autorange='reversed')
    )

    return fig


def create_var_chart(var_data: Dict[str, float],
                     title: str = "Value at Risk Analysis") -> go.Figure:
    """
    Create VaR visualization chart.

    Args:
        var_data: Dictionary with VaR data
        title: Chart title

    Returns:
        Plotly figure
    """
    if not var_data:
        return go.Figure()

    methods = list(var_data.keys())
    var_values = list(var_data.values())

    # Create bar chart
    fig = go.Figure(data=[
        go.Bar(
            x=methods,
            y=var_values,
            marker_color=PERFORMANCE_COLORS["drawdown"],
            text=[f"{val:.2f}%" for val in var_values],
            textposition='auto',
            hovertemplate='<b>%{x}</b><br>VaR: %{y:.2f}%<extra></extra>'
        )
    ])

    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title=title,
        xaxis_title="Method",
        yaxis_title="Value at Risk (%)",
        height=400,
        showlegend=False
    )

    return fig


def create_monte_carlo_chart(simulation_data: pd.DataFrame,
                             title: str = "Monte Carlo Simulation") -> go.Figure:
    """
    Create Monte Carlo simulation chart.

    Args:
        simulation_data: DataFrame with simulation paths
        title: Chart title

    Returns:
        Plotly figure
    """
    if simulation_data.empty:
        return go.Figure()

    fig = go.Figure()

    # Add sample paths (show only subset for performance)
    sample_size = min(100, simulation_data.shape[1])
    sample_cols = np.random.choice(simulation_data.columns, sample_size, replace=False)

    for col in sample_cols:
        fig.add_trace(go.Scatter(
            x=simulation_data.index,
            y=simulation_data[col],
            mode='lines',
            line=dict(width=0.5, color='rgba(135, 206, 235, 0.3)'),
            hoverinfo='skip',
            showlegend=False
        ))

    # Add percentiles
    percentiles = [5, 25, 50, 75, 95]
    colors = ['red', 'orange', 'green', 'orange', 'red']

    for i, percentile in enumerate(percentiles):
        p_data = simulation_data.quantile(percentile / 100, axis=1)
        fig.add_trace(go.Scatter(
            x=simulation_data.index,
            y=p_data,
            mode='lines',
            name=f'{percentile}th percentile',
            line=dict(width=2, color=colors[i]),
            hovertemplate=f'<b>{percentile}th percentile</b><br>%{{x}}<br>Value: %{{y:.2f}}<extra></extra>'
        ))

    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title=title,
        xaxis_title="Time Period",
        yaxis_title="Portfolio Value",
        height=500,
        hovermode='x unified'
    )

    return fig


def create_sector_allocation_chart(sector_data: Dict[str, float],
                                   title: str = "Sector Allocation") -> go.Figure:
    """
    Create sector allocation donut chart.

    Args:
        sector_data: Dictionary of {sector: allocation}
        title: Chart title

    Returns:
        Plotly figure
    """
    if not sector_data:
        return go.Figure()

    sectors = list(sector_data.keys())
    allocations = list(sector_data.values())

    # Convert to percentages if needed
    if all(a <= 1 for a in allocations):
        allocations = [a * 100 for a in allocations]

    fig = go.Figure(data=[go.Pie(
        labels=sectors,
        values=allocations,
        hole=0.3,  # Creates donut chart
        textinfo='label+percent',
        textposition='inside',
        marker=dict(colors=CHART_COLORS),
        hovertemplate='<b>%{label}</b><br>Allocation: %{value:.1f}%<br>Percent: %{percent}<extra></extra>'
    )])

    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title=title,
        height=400,
        showlegend=True,
        legend=dict(orientation="v", yanchor="middle", y=0.5)
    )

    return fig


def create_returns_distribution_chart(returns_data: pd.Series,
                                      title: str = "Returns Distribution") -> go.Figure:
    """
    Create returns distribution histogram.

    Args:
        returns_data: Series of returns
        title: Chart title

    Returns:
        Plotly figure
    """
    if returns_data.empty:
        return go.Figure()

    fig = go.Figure()

    # Add histogram
    fig.add_trace(go.Histogram(
        x=returns_data,
        nbinsx=50,
        name='Returns Distribution',
        marker_color=COLORS["primary"],
        opacity=0.7,
        hovertemplate='Range: %{x}<br>Count: %{y}<extra></extra>'
    ))

    # Add normal distribution curve
    mu = returns_data.mean()
    sigma = returns_data.std()
    x = np.linspace(returns_data.min(), returns_data.max(), 100)
    y = ((1 / (sigma * np.sqrt(2 * np.pi))) *
         np.exp(-0.5 * ((x - mu) / sigma) ** 2)) * len(returns_data) * (returns_data.max() - returns_data.min()) / 50

    fig.add_trace(go.Scatter(
        x=x,
        y=y,
        mode='lines',
        name='Normal Distribution',
        line=dict(color='red', width=2, dash='dash'),
        hovertemplate='Normal Distribution<br>Return: %{x:.3f}<br>Density: %{y:.2f}<extra></extra>'
    ))

    # Add mean line
    fig.add_vline(x=mu, line_dash="solid", line_color="yellow",
                  annotation_text=f"Mean: {mu:.3f}")

    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        title=title,
        xaxis_title="Returns",
        yaxis_title="Frequency",
        height=400,
        showlegend=True
    )

    return fig


def display_chart(fig: go.Figure, key: Optional[str] = None):
    """
    Display a Plotly chart with consistent styling.

    Args:
        fig: Plotly figure to display
        key: Optional key for the chart
    """
    if fig.data:  # Only display if figure has data
        st.plotly_chart(fig, use_container_width=True, key=key)
    else:
        st.info("📊 No data available for chart")