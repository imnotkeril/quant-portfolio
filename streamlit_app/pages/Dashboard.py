"""
Dashboard page - Complete portfolio overview and analytics.
Main dashboard for Wild Market Capital portfolio management.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
from pathlib import Path

# Import utilities and components
from utils.styling import apply_custom_css, create_section_header, get_metric_card_html
from utils.constants import APP_CONFIG, COLORS, CHART_COLORS, PERFORMANCE_COLORS
from components.sidebar_nav import create_sidebar_navigation, create_page_header

# Page configuration
st.set_page_config(
    page_title=f"Dashboard - {APP_CONFIG['title']}",
    page_icon="📊",
    layout="wide"
)

@st.cache_data(ttl=60)  # Cache for 1 minute to see changes quickly
def load_portfolio_data():
    """Load portfolio data with caching."""
    try:
        from services.service_manager import ServiceManager
        portfolio_manager = ServiceManager.get_portfolio_manager()

        if portfolio_manager is None:
            st.error("❌ Portfolio Manager not available")
            return []

        # Get portfolios list
        portfolios = portfolio_manager.list_portfolios()

        # Debug: show what we got
        if portfolios:
            st.sidebar.success(f"✅ Loaded {len(portfolios)} portfolios from backend")
        else:
            st.sidebar.warning("⚠️ No portfolios found in backend storage")

            # Try direct storage access for debugging
            try:
                storage_service = ServiceManager.get_json_storage_service()
                if storage_service:
                    files = storage_service.list_files('.json')
                    st.sidebar.info(f"🔍 Found {len(files)} JSON files in storage")
                    if files:
                        st.sidebar.write("Files found:", [f.name for f in files[:5]])
            except Exception as debug_e:
                st.sidebar.error(f"Debug error: {str(debug_e)}")

        return portfolios

    except Exception as e:
        st.error(f"Failed to load portfolio data: {str(e)}")

        # Show detailed error for debugging
        with st.expander("🔧 Debug Information"):
            st.code(f"Error: {str(e)}")
            st.code(f"Error type: {type(e).__name__}")

            try:
                import traceback
                st.code(traceback.format_exc())
            except:
                pass

        return []

@st.cache_data(ttl=300)
def get_market_data():
    """Get market data for benchmarks."""
    try:
        from services.service_manager import ServiceManager
        data_fetcher = ServiceManager.get_data_fetcher()

        if data_fetcher is None:
            return None

        # Get major market indices
        benchmarks = ['SPY', 'QQQ', 'IWM', 'VTI']
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        market_data = {}
        for ticker in benchmarks:
            try:
                data = data_fetcher.get_historical_prices(
                    ticker, start_date, end_date, force_refresh=False
                )
                if not data.empty:
                    market_data[ticker] = data
            except Exception as e:
                st.warning(f"Failed to load {ticker}: {str(e)}")

        return market_data
    except Exception as e:
        st.error(f"Failed to load market data: {str(e)}")
        return None

def show_portfolio_overview():
    """Show comprehensive portfolio overview."""
    create_section_header("📈 Portfolio Overview", "", "Your investment portfolios at a glance")

    portfolios = load_portfolio_data()

    if not portfolios:
        col1, col2, col3 = st.columns([1, 2, 1])

        with col2:
            st.markdown("""
            <div class="hero-section">
                <h3>🚀 Get Started with Wild Market Capital</h3>
                <p>Create your first investment portfolio to unlock powerful analytics and optimization tools.</p>
            </div>
            """, unsafe_allow_html=True)

            if st.button("Create First Portfolio", type="primary", use_container_width=True):
                st.switch_page("pages/Portfolio_Creation.py")
        return

    # Portfolio metrics
    total_portfolios = len(portfolios)
    total_assets = sum(len(p.get('assets', [])) for p in portfolios)

    # Calculate portfolio values (mock calculation for now)
    portfolio_values = []
    for portfolio in portfolios:
        # Mock value calculation - in real implementation would use current prices
        assets = portfolio.get('assets', [])
        mock_value = len(assets) * 10000  # Mock $10k per asset
        portfolio_values.append(mock_value)

    total_value = sum(portfolio_values)
    avg_value = total_value / total_portfolios if total_portfolios > 0 else 0

    # Overview cards
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(get_metric_card_html(
            "Total Portfolios",
            str(total_portfolios),
            f"+{total_portfolios} created" if total_portfolios > 0 else "Create your first",
            "positive" if total_portfolios > 0 else "neutral"
        ), unsafe_allow_html=True)

    with col2:
        st.markdown(get_metric_card_html(
            "Total Value",
            f"${total_value:,.0f}" if total_value > 0 else "$0",
            f"{total_assets} assets" if total_assets > 0 else "No assets",
            "positive" if total_value > 0 else "neutral"
        ), unsafe_allow_html=True)

    with col3:
        st.markdown(get_metric_card_html(
            "Average Portfolio",
            f"${avg_value:,.0f}" if avg_value > 0 else "$0",
            f"{total_assets//total_portfolios if total_portfolios > 0 else 0} assets avg",
            "neutral"
        ), unsafe_allow_html=True)

    with col4:
        st.markdown(get_metric_card_html(
            "Today's P&L",
            "+$1,247",  # Mock data
            "+1.23%",
            "positive"
        ), unsafe_allow_html=True)

def show_portfolio_list():
    """Show detailed portfolio list."""
    create_section_header("💼 Your Portfolios", "", "Manage and analyze your investment portfolios")

    portfolios = load_portfolio_data()

    if not portfolios:
        st.info("📝 No portfolios found. Create your first portfolio to get started!")
        return

    # Portfolio list with enhanced details
    for i, portfolio in enumerate(portfolios[:10]):  # Show top 10
        with st.container():
            col1, col2, col3, col4, col5 = st.columns([3, 2, 2, 2, 1])

            with col1:
                st.markdown(f"**{portfolio.get('name', 'Unnamed Portfolio')}**")
                description = portfolio.get('description', 'No description')
                st.caption(description[:100] + "..." if len(description) > 100 else description)

            with col2:
                assets_count = len(portfolio.get('assets', []))
                st.metric("Assets", assets_count)

            with col3:
                # Mock return calculation
                mock_return = f"+{2.5 + i * 0.3:.1f}%"  # Mock positive returns
                st.metric("YTD Return", mock_return)

            with col4:
                # Mock Sharpe ratio
                mock_sharpe = f"{1.2 + i * 0.1:.2f}"
                st.metric("Sharpe Ratio", mock_sharpe)

            with col5:
                if st.button("Analyze", key=f"analyze_{i}", use_container_width=True):
                    # Store selected portfolio in session state
                    st.session_state.selected_portfolio = portfolio
                    st.switch_page("pages/Portfolio_Analysis.py")

            st.divider()

def show_market_overview():
    """Show market overview with major indices."""
    create_section_header("🌍 Market Overview", "", "Major market indices and trends")

    market_data = get_market_data()

    if not market_data:
        st.warning("⚠️ Unable to load market data")
        return

    # Market indices cards
    col1, col2, col3, col4 = st.columns(4)

    indices_info = {
        'SPY': {'name': 'S&P 500', 'col': col1},
        'QQQ': {'name': 'NASDAQ 100', 'col': col2},
        'IWM': {'name': 'Russell 2000', 'col': col3},
        'VTI': {'name': 'Total Stock Market', 'col': col4}
    }

    for ticker, info in indices_info.items():
        with info['col']:
            if ticker in market_data:
                data = market_data[ticker]
                if not data.empty:
                    current_price = data['Close'].iloc[-1]
                    prev_price = data['Close'].iloc[-2] if len(data) > 1 else current_price
                    change_pct = ((current_price - prev_price) / prev_price) * 100

                    st.markdown(get_metric_card_html(
                        info['name'],
                        f"${current_price:.2f}",
                        f"{change_pct:+.2f}%",
                        "positive" if change_pct >= 0 else "negative"
                    ), unsafe_allow_html=True)
                else:
                    st.markdown(get_metric_card_html(
                        info['name'],
                        "N/A",
                        "No data",
                        "neutral"
                    ), unsafe_allow_html=True)
            else:
                st.markdown(get_metric_card_html(
                    info['name'],
                    "N/A",
                    "Loading...",
                    "neutral"
                ), unsafe_allow_html=True)

def show_market_chart():
    """Show market performance chart."""
    market_data = get_market_data()

    if not market_data:
        return

    # Create performance comparison chart
    fig = go.Figure()

    for ticker, data in market_data.items():
        if not data.empty:
            # Normalize to percentage change from first day
            normalized = (data['Close'] / data['Close'].iloc[0] - 1) * 100

            fig.add_trace(go.Scatter(
                x=data.index,
                y=normalized,
                name=ticker,
                line=dict(width=2),
                hovertemplate=f'<b>{ticker}</b><br>%{{x}}<br>%{{y:.2f}}%<extra></extra>'
            ))

    fig.update_layout(
        title="Market Performance (30 Days)",
        xaxis_title="Date",
        yaxis_title="Performance (%)",
        height=400,
        template="plotly_dark",
        plot_bgcolor=COLORS["chart_background"],
        paper_bgcolor=COLORS["surface"],
        font=dict(color=COLORS["text_primary"]),
        showlegend=True
    )

    st.plotly_chart(fig, use_container_width=True)

def show_quick_actions():
    """Show enhanced quick actions."""
    create_section_header("🚀 Quick Actions", "", "Common tasks and workflows")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown(f"""
        <div class="analytics-section">
            <h4>📊 Portfolio Management</h4>
        </div>
        """, unsafe_allow_html=True)

        if st.button("📝 Create New Portfolio", use_container_width=True):
            st.switch_page("pages/Portfolio_Creation.py")

        if st.button("📈 Analyze Portfolio", use_container_width=True):
            st.switch_page("pages/Portfolio_Analysis.py")

        if st.button("📊 Compare Portfolios", use_container_width=True):
            st.switch_page("pages/Portfolio_Comparison.py")

    with col2:
        st.markdown(f"""
        <div class="analytics-section">
            <h4>🔧 Advanced Tools</h4>
        </div>
        """, unsafe_allow_html=True)

        if st.button("⚖️ Portfolio Optimization", use_container_width=True):
            st.switch_page("pages/Portfolio_Optimization.py")

        if st.button("🛡️ Risk Management", use_container_width=True):
            st.switch_page("pages/Portfolio_Risk.py")

        if st.button("🎲 Scenario Analysis", use_container_width=True):
            st.switch_page("pages/Scenario_Analysis.py")

def show_performance_summary():
    """Show portfolio performance summary."""
    portfolios = load_portfolio_data()

    if not portfolios:
        return

    create_section_header("📊 Performance Summary", "", "Portfolio performance over time")

    # Mock performance data for demonstration
    dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='M')

    fig = go.Figure()

    # Add performance line for each portfolio (mock data)
    colors = CHART_COLORS
    for i, portfolio in enumerate(portfolios[:5]):  # Show top 5 portfolios
        # Generate mock cumulative returns
        returns = [0]
        for _ in range(len(dates)-1):
            returns.append(returns[-1] + (0.5 + i * 0.2) + (0.1 * (0.5 - np.random.random())))

        fig.add_trace(go.Scatter(
            x=dates,
            y=returns,
            name=portfolio.get('name', f'Portfolio {i+1}'),
            line=dict(color=colors[i % len(colors)], width=2),
            hovertemplate='<b>%{fullData.name}</b><br>%{x}<br>Return: %{y:.2f}%<extra></extra>'
        ))

    fig.update_layout(
        title="Portfolio Performance Comparison (YTD)",
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

def main():
    """Main Dashboard page function."""
    # Apply custom styling
    apply_custom_css()

    # Create sidebar navigation
    create_sidebar_navigation()

    # Page header
    create_page_header("Dashboard")

    # Dashboard content
    show_portfolio_overview()

    st.markdown("---")
    show_portfolio_list()

    st.markdown("---")
    show_market_overview()

    col1, col2 = st.columns([2, 1])
    with col1:
        show_market_chart()
    with col2:
        show_quick_actions()

    st.markdown("---")
    show_performance_summary()

if __name__ == "__main__":
    main()