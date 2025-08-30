"""
Portfolio Analysis page.
Comprehensive portfolio performance analysis with 50+ metrics using REAL backend services.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from pathlib import Path
import sys
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from utils.styling import apply_custom_css, create_page_header, create_section_header
from utils.constants import COLORS, CHART_COLORS
from utils.formatters import format_percentage, format_currency, format_number
from components.metrics_cards import create_metrics_grid, create_metric_card_html
from components.sidebar_nav import create_sidebar_navigation

# Page configuration
st.set_page_config(
    page_title="Portfolio Analysis - Wild Market Capital",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

@st.cache_data(ttl=300)
def load_portfolio_data():
    """Load portfolio data using real backend service."""
    try:
        portfolio_manager = ServiceManager.get_portfolio_manager()
        portfolios = portfolio_manager.list_portfolios()
        return portfolios
    except Exception as e:
        st.error(f"Failed to load portfolio data: {str(e)}")
        return []

@st.cache_data(ttl=300)
def get_portfolio_price_data(portfolio_data: dict, days: int = 252):
    """Get price data for portfolio assets using real backend service."""
    try:
        data_fetcher = ServiceManager.get_data_fetcher()
        if not data_fetcher:
            st.error("❌ Data fetcher service not available")
            return None

        # Get portfolio assets
        assets = portfolio_data.get('assets', {})
        if not assets:
            st.warning("📝 No assets found in portfolio")
            return None

        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        # Get historical data for each asset
        all_prices = {}
        for ticker, weight in assets.items():
            try:
                price_data = data_fetcher.get_historical_data(
                    ticker=ticker,
                    start_date=start_date.strftime("%Y-%m-%d"),
                    end_date=end_date.strftime("%Y-%m-%d")
                )

                if not price_data.empty:
                    # Use Adj Close if available, otherwise Close
                    price_col = "Adj Close" if "Adj Close" in price_data.columns else "Close"
                    all_prices[ticker] = price_data[price_col]

            except Exception as e:
                st.warning(f"⚠️ Could not fetch data for {ticker}: {str(e)}")
                continue

        if not all_prices:
            st.error("❌ No price data available for any assets")
            return None

        # Combine into DataFrame
        price_df = pd.DataFrame(all_prices)
        price_df = price_df.dropna()  # Remove rows with missing data

        return price_df, assets

    except Exception as e:
        st.error(f"❌ Error fetching price data: {str(e)}")
        return None

@st.cache_data(ttl=300)
def calculate_real_portfolio_metrics(portfolio_data: dict):
    """Calculate portfolio metrics using real backend AnalyticsService."""
    try:
        # Get services
        analytics_service = ServiceManager.get_analytics_service()
        if not analytics_service:
            st.error("❌ Analytics service not available")
            return None

        # Get price data
        price_result = get_portfolio_price_data(portfolio_data, days=252)
        if not price_result:
            return None

        price_df, weights = price_result

        if price_df.empty:
            st.error("❌ No price data available")
            return None

        # Calculate returns using backend service
        returns_df = analytics_service.calculate_returns(price_df, period='daily', method='simple')

        if returns_df.empty:
            st.error("❌ Could not calculate returns")
            return None

        # Calculate portfolio returns using backend service
        portfolio_returns = analytics_service.calculate_portfolio_return(returns_df, weights)

        if portfolio_returns.empty:
            st.error("❌ Could not calculate portfolio returns")
            return None

        # Get benchmark data (SPY as default benchmark)
        try:
            data_fetcher = ServiceManager.get_data_fetcher()
            benchmark_prices = data_fetcher.get_historical_data(
                ticker="SPY",
                start_date=(datetime.now() - timedelta(days=252)).strftime("%Y-%m-%d"),
                end_date=datetime.now().strftime("%Y-%m-%d")
            )

            benchmark_returns = None
            if not benchmark_prices.empty:
                price_col = "Adj Close" if "Adj Close" in benchmark_prices.columns else "Close"
                benchmark_returns = analytics_service.calculate_returns(
                    benchmark_prices[[price_col]], period='daily', method='simple'
                )[price_col]

        except Exception as e:
            st.warning(f"⚠️ Could not get benchmark data: {str(e)}")
            benchmark_returns = None

        # Calculate comprehensive metrics using backend service
        risk_free_rate = 0.04  # 4% risk-free rate
        metrics = analytics_service.calculate_portfolio_metrics(
            returns=portfolio_returns,
            benchmark_returns=benchmark_returns,
            risk_free_rate=risk_free_rate,
            periods_per_year=252
        )

        # Add additional data for charts
        cumulative_returns = analytics_service.calculate_cumulative_returns(portfolio_returns)

        # Calculate portfolio value progression (starting with $100,000)
        portfolio_values = (1 + cumulative_returns) * 100000

        # Add time series data
        metrics.update({
            'dates': portfolio_returns.index,
            'daily_returns': portfolio_returns,
            'cumulative_returns': cumulative_returns,
            'portfolio_values': portfolio_values,
            'price_data': price_df,
            'weights': weights
        })

        # Add benchmark cumulative returns if available
        if benchmark_returns is not None:
            benchmark_cumulative = analytics_service.calculate_cumulative_returns(benchmark_returns)
            metrics['benchmark_cumulative'] = benchmark_cumulative

        return metrics

    except Exception as e:
        st.error(f"❌ Error calculating metrics: {str(e)}")
        return None

def display_key_metrics(metrics: dict):
    """Display key portfolio metrics using the existing metrics_cards component."""
    if not metrics:
        st.warning("No metrics available")
        return

    create_section_header("📊 Key Performance Metrics", "", "Essential portfolio performance indicators")

    # Prepare metrics data for the grid
    metrics_data = [
        {
            'title': 'Total Return',
            'value': metrics.get('total_return', 0),
            'delta': metrics.get('excess_return'),
            'delta_label': 'vs Benchmark',
            'color': 'positive' if metrics.get('total_return', 0) > 0 else 'negative',
            'icon': '📈'
        },
        {
            'title': 'Annual Return',
            'value': metrics.get('annualized_return', 0),
            'delta': metrics.get('benchmark_annualized_return'),
            'delta_label': 'Benchmark',
            'color': 'positive' if metrics.get('annualized_return', 0) > 0 else 'negative',
            'icon': '📊'
        },
        {
            'title': 'Sharpe Ratio',
            'value': metrics.get('sharpe_ratio', 0),
            'description': 'Risk-adjusted return',
            'color': 'positive' if metrics.get('sharpe_ratio', 0) > 1 else 'neutral' if metrics.get('sharpe_ratio', 0) > 0.5 else 'negative',
            'icon': '⚖️'
        },
        {
            'title': 'Volatility',
            'value': metrics.get('volatility', 0),
            'description': 'Annualized volatility',
            'color': 'negative' if metrics.get('volatility', 0) > 0.2 else 'warning' if metrics.get('volatility', 0) > 0.15 else 'positive',
            'icon': '📊'
        },
        {
            'title': 'Max Drawdown',
            'value': metrics.get('max_drawdown', 0),
            'description': 'Peak-to-trough decline',
            'color': 'negative' if metrics.get('max_drawdown', 0) < -0.15 else 'warning' if metrics.get('max_drawdown', 0) < -0.1 else 'positive',
            'icon': '📉'
        },
        {
            'title': 'Beta',
            'value': metrics.get('beta', 0),
            'description': 'Market sensitivity',
            'color': 'neutral',
            'icon': '📊'
        },
        {
            'title': 'Alpha',
            'value': metrics.get('alpha', 0),
            'description': 'Excess return vs market',
            'color': 'positive' if metrics.get('alpha', 0) > 0 else 'negative',
            'icon': '🎯'
        },
        {
            'title': 'Win Rate',
            'value': metrics.get('win_rate', 0),
            'description': 'Positive days',
            'color': 'positive' if metrics.get('win_rate', 0) > 0.5 else 'negative',
            'icon': '📈'
        }
    ]

    # Use the existing metrics_cards component
    create_metrics_grid(metrics_data, columns=4)

def show_performance_charts(metrics: dict):
    """Display performance charts using real data."""
    if not metrics or 'dates' not in metrics:
        st.warning("No time series data available for charts")
        return

    create_section_header("📈 Performance Charts", "", "Visual analysis of portfolio performance")

    col1, col2 = st.columns([2, 1])

    with col1:
        # Cumulative returns chart
        fig = go.Figure()

        # Portfolio cumulative returns
        fig.add_trace(go.Scatter(
            x=metrics['dates'],
            y=metrics['cumulative_returns'] * 100,
            name='Portfolio',
            line=dict(color=CHART_COLORS[0], width=2),
            hovertemplate='Date: %{x}<br>Return: %{y:.2f}%<extra></extra>'
        ))

        # Benchmark if available
        if 'benchmark_cumulative' in metrics:
            fig.add_trace(go.Scatter(
                x=metrics['dates'],
                y=metrics['benchmark_cumulative'] * 100,
                name='Benchmark (SPY)',
                line=dict(color=CHART_COLORS[1], width=2, dash='dash'),
                hovertemplate='Date: %{x}<br>Return: %{y:.2f}%<extra></extra>'
            ))

        fig.update_layout(
            title="Cumulative Returns vs Benchmark",
            xaxis_title="Date",
            yaxis_title="Cumulative Return (%)",
            height=400,
            template="plotly_dark",
            plot_bgcolor=COLORS["chart_background"],
            paper_bgcolor=COLORS["surface"],
            font=dict(color=COLORS["text_primary"]),
            showlegend=True
        )

        st.plotly_chart(fig, use_container_width=True)

    with col2:
        # Returns distribution
        fig = go.Figure()

        daily_returns = metrics['daily_returns'] * 100  # Convert to percentage

        fig.add_trace(go.Histogram(
            x=daily_returns,
            nbinsx=30,
            name='Daily Returns',
            marker_color=CHART_COLORS[2],
            opacity=0.7
        ))

        # Add VaR lines if available
        if 'var_95' in metrics:
            var_95_pct = metrics['var_95'] * 100 if abs(metrics['var_95']) < 1 else metrics['var_95']
            fig.add_vline(x=-abs(var_95_pct),
                         line_dash="dash", line_color="red",
                         annotation_text="95% VaR")

        if 'var_99' in metrics:
            var_99_pct = metrics['var_99'] * 100 if abs(metrics['var_99']) < 1 else metrics['var_99']
            fig.add_vline(x=-abs(var_99_pct),
                         line_dash="dash", line_color="darkred",
                         annotation_text="99% VaR")

        fig.update_layout(
            title="Returns Distribution",
            xaxis_title="Daily Return (%)",
            yaxis_title="Frequency",
            height=400,
            template="plotly_dark",
            plot_bgcolor=COLORS["chart_background"],
            paper_bgcolor=COLORS["surface"],
            font=dict(color=COLORS["text_primary"]),
            showlegend=False
        )

        st.plotly_chart(fig, use_container_width=True)

def show_portfolio_composition(portfolio_data: dict, metrics: dict):
    """Show portfolio composition analysis using real data."""
    if not portfolio_data or not portfolio_data.get('assets'):
        st.info("No portfolio composition data available")
        return

    create_section_header("🥧 Portfolio Composition", "", "Asset allocation and diversification analysis")

    assets = portfolio_data.get('assets', {})

    col1, col2 = st.columns([1, 1])

    with col1:
        # Asset allocation pie chart
        tickers = list(assets.keys())
        weights = list(assets.values())

        fig = px.pie(
            values=weights,
            names=tickers,
            title="Asset Allocation",
            color_discrete_sequence=CHART_COLORS
        )

        fig.update_layout(
            template="plotly_dark",
            plot_bgcolor=COLORS["chart_background"],
            paper_bgcolor=COLORS["surface"],
            font=dict(color=COLORS["text_primary"]),
            height=400
        )

        st.plotly_chart(fig, use_container_width=True)

    with col2:
        # Portfolio statistics
        total_weight = sum(weights)
        avg_weight = total_weight / len(weights) if weights else 0
        max_weight = max(weights) if weights else 0
        min_weight = min(weights) if weights else 0

        st.markdown(create_metric_card_html(
            "Assets Count",
            str(len(assets)),
            f"Total: {len(assets)} positions",
            "positive"
        ), unsafe_allow_html=True)

        st.markdown(create_metric_card_html(
            "Average Weight",
            f"{avg_weight:.1f}%",
            f"Range: {min_weight:.1f}% - {max_weight:.1f}%",
            "neutral"
        ), unsafe_allow_html=True)

        # Portfolio balance score
        balance_score = 100 - abs(100 - total_weight)
        st.markdown(create_metric_card_html(
            "Balance Score",
            f"{balance_score:.0f}/100",
            "Allocation completeness",
            "positive" if balance_score > 95 else "warning" if balance_score > 80 else "negative"
        ), unsafe_allow_html=True)

    # Holdings table
    if 'portfolio_values' in metrics and len(metrics['portfolio_values']) > 0:
        current_value = metrics['portfolio_values'].iloc[-1]

        holdings_data = []
        for ticker, weight in assets.items():
            asset_value = current_value * (weight / 100) if weight > 1 else current_value * weight

            holdings_data.append({
                'Ticker': ticker,
                'Weight (%)': f"{weight:.1f}%",
                'Value ($)': f"${asset_value:,.0f}",
                'Type': 'ETF/Stock'  # Could be enhanced with real asset type data
            })

        df = pd.DataFrame(holdings_data)
        st.dataframe(df, use_container_width=True, hide_index=True)

def show_risk_analysis(metrics: dict):
    """Display risk analysis using real calculated metrics."""
    if not metrics:
        return

    create_section_header("🛡️ Risk Analysis", "", "Comprehensive risk metrics and analysis")

    # Risk metrics in tabs
    tab1, tab2, tab3 = st.tabs(["📊 Risk Overview", "📉 Drawdown Analysis", "🎲 Value at Risk"])

    with tab1:
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Volatility", format_percentage(metrics.get('volatility', 0)))

        with col2:
            st.metric("Downside Volatility", format_percentage(metrics.get('downside_volatility', 0)))

        with col3:
            st.metric("Skewness", f"{metrics.get('skewness', 0):.3f}")

        with col4:
            st.metric("Kurtosis", f"{metrics.get('kurtosis', 0):.3f}")

    with tab2:
        # Drawdown analysis
        if 'daily_returns' in metrics:
            cumulative = (1 + metrics['daily_returns']).cumprod()
            rolling_max = cumulative.expanding().max()
            drawdown = (cumulative - rolling_max) / rolling_max

            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=metrics['dates'],
                y=drawdown * 100,
                name='Drawdown',
                fill='tonexty',
                fillcolor='rgba(255, 0, 0, 0.2)',
                line=dict(color='red', width=2),
                hovertemplate='Date: %{x}<br>Drawdown: %{y:.2f}%<extra></extra>'
            ))

            fig.update_layout(
                title="Portfolio Drawdown Analysis",
                xaxis_title="Date",
                yaxis_title="Drawdown (%)",
                height=400,
                template="plotly_dark",
                plot_bgcolor=COLORS["chart_background"],
                paper_bgcolor=COLORS["surface"],
                font=dict(color=COLORS["text_primary"])
            )

            st.plotly_chart(fig, use_container_width=True)

    with tab3:
        col1, col2 = st.columns(2)

        with col1:
            st.metric("VaR (95%)", f"{metrics.get('var_95', 0):.2%}")
            st.metric("VaR (99%)", f"{metrics.get('var_99', 0):.2%}")

        with col2:
            st.metric("CVaR (95%)", f"{metrics.get('cvar_95', 0):.2%}")
            st.metric("CVaR (99%)", f"{metrics.get('cvar_99', 0):.2%}")

def main():
    """Main Portfolio Analysis page function."""
    # Apply custom styling
    apply_custom_css()

    # Create sidebar navigation
    create_sidebar_navigation()

    # Page header
    create_page_header("Portfolio Analysis")

    # Portfolio selector
    portfolios = load_portfolio_data()

    if not portfolios:
        st.warning("📂 No portfolios found. Please create a portfolio first.")
        if st.button("➕ Create New Portfolio", type="primary"):
            st.switch_page("pages/Portfolio_Creation.py")
        return

    # Portfolio selection
    portfolio_options = [f"{p.get('name', 'Unnamed')} ({len(p.get('assets', {}))} assets)" for p in portfolios]
    selected_idx = st.selectbox(
        "Select Portfolio for Analysis:",
        range(len(portfolio_options)),
        format_func=lambda x: portfolio_options[x],
        key="portfolio_selector"
    )

    if selected_idx is not None:
        selected_portfolio = portfolios[selected_idx]

        st.info(f"📊 Analyzing: **{selected_portfolio.get('name', 'Unnamed Portfolio')}** with {len(selected_portfolio.get('assets', {}))} assets")

        # Check if portfolio has assets
        if not selected_portfolio.get('assets'):
            st.error("❌ Selected portfolio has no assets. Please add assets to the portfolio first.")
            if st.button("✏️ Edit Portfolio", type="primary"):
                st.switch_page("pages/Portfolio_Creation.py")
            return

        # Calculate metrics using real backend services
        with st.spinner("🔄 Calculating portfolio metrics using real market data..."):
            metrics = calculate_real_portfolio_metrics(selected_portfolio)

        if metrics:
            # Display analysis sections
            display_key_metrics(metrics)
            st.markdown("---")

            show_performance_charts(metrics)
            st.markdown("---")

            show_portfolio_composition(selected_portfolio, metrics)
            st.markdown("---")

            show_risk_analysis(metrics)

            # Export options
            st.markdown("---")
            create_section_header("📊 Export & Reports", "", "Generate reports and export data")

            col1, col2, col3, col4 = st.columns(4)
            with col1:
                if st.button("📄 Generate PDF Report", use_container_width=True):
                    st.info("PDF generation feature coming soon!")

            with col2:
                if st.button("📊 Export to Excel", use_container_width=True):
                    st.info("Excel export feature coming soon!")

            with col3:
                if st.button("📈 Create Presentation", use_container_width=True):
                    st.info("Presentation generation feature coming soon!")

            with col4:
                if st.button("🔄 Refresh Analysis", use_container_width=True):
                    st.cache_data.clear()
                    st.rerun()

        else:
            st.error("❌ Failed to calculate portfolio metrics. This might be due to:")
            st.markdown("""
            - **No market data available** for the portfolio assets
            - **Backend service connection issues** 
            - **Invalid asset tickers** in the portfolio
            
            💡 **Solutions:**
            1. Check if your portfolio contains valid stock/ETF tickers
            2. Ensure backend services are running properly
            3. Try refreshing the page or selecting a different portfolio
            """)

if __name__ == "__main__":
    main()