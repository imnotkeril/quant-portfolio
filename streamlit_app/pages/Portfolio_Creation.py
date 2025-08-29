"""
Portfolio Creation page - Create and configure investment portfolios.
Advanced portfolio builder with validation and real-time data.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import re
from pathlib import Path

# Import utilities and components
from utils.styling import apply_custom_css, create_section_header, get_metric_card_html
from utils.constants import APP_CONFIG, COLORS, CHART_COLORS, DEFAULT_SETTINGS
from components.sidebar_nav import create_sidebar_navigation, create_page_header

# Page configuration
st.set_page_config(
    page_title=f"Portfolio Creation - {APP_CONFIG['title']}",
    page_icon="💼",
    layout="wide"
)

def validate_ticker(ticker):
    """Validate ticker symbol format."""
    if not ticker:
        return False, "Ticker cannot be empty"

    # Basic ticker format validation
    ticker = ticker.upper().strip()
    if not re.match(r'^[A-Z]{1,5}$', ticker):
        return False, "Ticker must be 1-5 letters (e.g., AAPL, SPY)"

    return True, ticker

@st.cache_data(ttl=600)  # Cache for 10 minutes
def search_ticker(query):
    """Search for ticker symbols."""
    try:
        from services.service_manager import ServiceManager
        data_fetcher = ServiceManager.get_data_fetcher()

        if data_fetcher is None:
            return []

        # For now, return some common tickers that match the query
        # In real implementation, would use data_fetcher.search_tickers()
        common_tickers = [
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology'},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'sector': 'Technology'},
            {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'sector': 'Technology'},
            {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'sector': 'Consumer Cyclical'},
            {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'sector': 'Consumer Cyclical'},
            {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'sector': 'ETF'},
            {'symbol': 'QQQ', 'name': 'Invesco QQQ Trust', 'sector': 'ETF'},
            {'symbol': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'sector': 'ETF'},
        ]

        if query:
            query_upper = query.upper()
            return [t for t in common_tickers
                   if query_upper in t['symbol'] or query_upper in t['name'].upper()]

        return common_tickers[:5]

    except Exception as e:
        st.error(f"Failed to search tickers: {str(e)}")
        return []

@st.cache_data(ttl=300)
def get_ticker_info(ticker):
    """Get detailed ticker information."""
    try:
        from services.service_manager import ServiceManager
        data_fetcher = ServiceManager.get_data_fetcher()

        if data_fetcher is None:
            return None

        # Get basic price data
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        data = data_fetcher.get_historical_prices(ticker, start_date, end_date)

        if data.empty:
            return None

        current_price = data['Close'].iloc[-1]
        prev_price = data['Close'].iloc[0]
        change_pct = ((current_price - prev_price) / prev_price) * 100

        return {
            'current_price': current_price,
            'change_30d': change_pct,
            'volatility': data['Close'].pct_change().std() * 100,
            'volume': data['Volume'].iloc[-1] if 'Volume' in data else 0,
            'data': data
        }

    except Exception as e:
        st.warning(f"Could not fetch data for {ticker}: {str(e)}")
        return None

def show_portfolio_form():
    """Show portfolio creation form."""
    create_section_header("📝 Portfolio Details", "", "Enter basic portfolio information")

    col1, col2 = st.columns([2, 1])

    with col1:
        # Portfolio basic info
        portfolio_name = st.text_input(
            "Portfolio Name *",
            placeholder="e.g., Growth Portfolio, Retirement Fund",
            help="Enter a descriptive name for your portfolio"
        )

        portfolio_description = st.text_area(
            "Description",
            placeholder="Describe your investment strategy, goals, or allocation approach",
            help="Optional description of your portfolio strategy",
            height=100
        )

        # Portfolio tags
        portfolio_tags = st.text_input(
            "Tags (comma-separated)",
            placeholder="e.g., growth, tech, dividend, ESG",
            help="Add tags to categorize your portfolio"
        )

    with col2:
        st.markdown(f"""
        <div class="analytics-section">
            <h4>💡 Portfolio Tips</h4>
            <ul>
                <li>Use descriptive names for easy identification</li>
                <li>Add tags for better organization</li>
                <li>Consider your investment timeline</li>
                <li>Diversify across sectors and asset classes</li>
                <li>Start with 5-15 positions for good diversification</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    return {
        'name': portfolio_name,
        'description': portfolio_description,
        'tags': [tag.strip() for tag in portfolio_tags.split(',') if tag.strip()] if portfolio_tags else []
    }

def show_asset_builder():
    """Show asset selection and weighting interface."""
    create_section_header("🎯 Build Your Portfolio", "", "Add assets and set allocation weights")

    # Initialize session state for assets
    if 'portfolio_assets' not in st.session_state:
        st.session_state.portfolio_assets = []

    # Asset addition interface
    col1, col2, col3 = st.columns([2, 1, 1])

    with col1:
        # Ticker search/input
        ticker_input = st.text_input(
            "Add Asset (Ticker Symbol)",
            placeholder="e.g., AAPL, SPY, MSFT",
            help="Enter a stock ticker symbol"
        )

        # Search suggestions
        if ticker_input:
            suggestions = search_ticker(ticker_input)
            if suggestions:
                st.write("💡 Suggestions:")
                for suggestion in suggestions[:3]:
                    if st.button(f"🔍 {suggestion['symbol']} - {suggestion['name']}",
                               key=f"suggest_{suggestion['symbol']}"):
                        st.session_state.temp_ticker = suggestion['symbol']
                        st.rerun()

        # Use suggested ticker if clicked
        if hasattr(st.session_state, 'temp_ticker'):
            ticker_input = st.session_state.temp_ticker
            del st.session_state.temp_ticker

    with col2:
        weight_input = st.number_input(
            "Weight (%)",
            min_value=0.1,
            max_value=100.0,
            value=10.0,
            step=0.1,
            help="Allocation percentage for this asset"
        )

    with col3:
        st.write("")  # Spacing
        if st.button("➕ Add Asset", type="primary", use_container_width=True):
            if ticker_input:
                is_valid, result = validate_ticker(ticker_input)
                if is_valid:
                    # Check if ticker already exists
                    existing_tickers = [asset['ticker'] for asset in st.session_state.portfolio_assets]
                    if result not in existing_tickers:
                        # Get ticker info
                        ticker_info = get_ticker_info(result)

                        asset = {
                            'ticker': result,
                            'weight': weight_input,
                            'info': ticker_info
                        }

                        st.session_state.portfolio_assets.append(asset)
                        st.success(f"✅ Added {result} with {weight_input}% allocation")
                        st.rerun()
                    else:
                        st.error(f"❌ {result} is already in the portfolio")
                else:
                    st.error(f"❌ {result}")

    # Current portfolio display
    if st.session_state.portfolio_assets:
        st.markdown("---")

        # Portfolio summary
        total_weight = sum(asset['weight'] for asset in st.session_state.portfolio_assets)

        col1, col2, col3 = st.columns([2, 1, 1])
        with col1:
            st.subheader("🎯 Current Portfolio")
        with col2:
            st.metric("Total Allocation", f"{total_weight:.1f}%")
        with col3:
            if total_weight != 100.0:
                if st.button("⚡ Normalize to 100%", use_container_width=True):
                    # Normalize weights to sum to 100%
                    for asset in st.session_state.portfolio_assets:
                        asset['weight'] = (asset['weight'] / total_weight) * 100
                    st.success("✅ Portfolio weights normalized to 100%")
                    st.rerun()

        # Assets table
        for i, asset in enumerate(st.session_state.portfolio_assets):
            with st.container():
                col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1, 1])

                with col1:
                    st.markdown(f"**{asset['ticker']}**")
                    if asset['info']:
                        st.caption(f"Current: ${asset['info']['current_price']:.2f}")

                with col2:
                    # Editable weight
                    new_weight = st.number_input(
                        "Weight",
                        min_value=0.1,
                        max_value=100.0,
                        value=asset['weight'],
                        step=0.1,
                        key=f"weight_{i}"
                    )
                    if new_weight != asset['weight']:
                        st.session_state.portfolio_assets[i]['weight'] = new_weight
                        st.rerun()

                with col3:
                    if asset['info']:
                        change_color = "positive" if asset['info']['change_30d'] >= 0 else "negative"
                        st.metric("30D Change", f"{asset['info']['change_30d']:+.1f}%")

                with col4:
                    if asset['info']:
                        st.metric("Volatility", f"{asset['info']['volatility']:.1f}%")

                with col5:
                    if st.button("🗑️", key=f"remove_{i}", help="Remove asset"):
                        st.session_state.portfolio_assets.pop(i)
                        st.rerun()

                st.divider()

    return st.session_state.portfolio_assets

def show_portfolio_preview():
    """Show portfolio preview and analytics."""
    if not st.session_state.portfolio_assets:
        return

    create_section_header("📊 Portfolio Preview", "", "Portfolio composition and risk metrics")

    # Portfolio composition chart
    col1, col2 = st.columns([2, 1])

    with col1:
        # Pie chart of allocations
        tickers = [asset['ticker'] for asset in st.session_state.portfolio_assets]
        weights = [asset['weight'] for asset in st.session_state.portfolio_assets]

        fig = px.pie(
            values=weights,
            names=tickers,
            title="Portfolio Allocation",
            color_discrete_sequence=CHART_COLORS
        )

        fig.update_layout(
            template="plotly_dark",
            plot_bgcolor=COLORS["chart_background"],
            paper_bgcolor=COLORS["surface"],
            font=dict(color=COLORS["text_primary"])
        )

        st.plotly_chart(fig, use_container_width=True)

    with col2:
        # Portfolio statistics
        total_weight = sum(weights)
        avg_weight = total_weight / len(weights) if weights else 0
        max_weight = max(weights) if weights else 0
        min_weight = min(weights) if weights else 0

        st.markdown(get_metric_card_html(
            "Assets Count",
            str(len(st.session_state.portfolio_assets)),
            f"Total: {len(st.session_state.portfolio_assets)} positions",
            "positive"
        ), unsafe_allow_html=True)

        st.markdown(get_metric_card_html(
            "Average Weight",
            f"{avg_weight:.1f}%",
            f"Range: {min_weight:.1f}% - {max_weight:.1f}%",
            "neutral"
        ), unsafe_allow_html=True)

        # Portfolio balance score
        balance_score = 100 - abs(100 - total_weight)
        st.markdown(get_metric_card_html(
            "Balance Score",
            f"{balance_score:.0f}/100",
            "Allocation completeness",
            "positive" if balance_score > 95 else "warning" if balance_score > 80 else "negative"
        ), unsafe_allow_html=True)

def create_portfolio():
    """Create and save the portfolio."""
    try:
        from services.service_manager import ServiceManager
        portfolio_manager = ServiceManager.get_portfolio_manager()

        if portfolio_manager is None:
            st.error("❌ Portfolio Manager not available")
            return False

        # Create portfolio data structure in the format expected by backend
        portfolio_id = f"portfolio_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        portfolio_data = {
            'id': portfolio_id,
            'name': st.session_state.portfolio_form['name'],
            'description': st.session_state.portfolio_form['description'],
            'tags': st.session_state.portfolio_form['tags'],
            'assets': {},
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),  # Add this field that backend expects
            'total_weight': 0
        }

        # Add assets with proper structure
        total_weight = 0
        for asset in st.session_state.portfolio_assets:
            weight_decimal = asset['weight'] / 100.0  # Convert to decimal
            portfolio_data['assets'][asset['ticker']] = {
                'ticker': asset['ticker'],
                'weight': weight_decimal,
                'added_at': datetime.now().isoformat()
            }
            total_weight += weight_decimal

        portfolio_data['total_weight'] = total_weight

        # Use a simpler approach - directly save using storage provider
        try:
            # Try to get the storage provider directly
            storage_service = ServiceManager.get_json_storage_service()

            if storage_service is not None:
                # Save directly using storage service
                filename = f"{portfolio_id}.json"
                storage_service.save_json(portfolio_data, filename)
                return True, filename
            else:
                st.error("❌ Storage service not available")
                return False, None

        except Exception as storage_error:
            st.error(f"❌ Storage error: {str(storage_error)}")

            # Fallback: try portfolio manager with dict (some versions may accept it)
            try:
                # Create a mock portfolio object structure
                class MockPortfolio:
                    def __init__(self, data):
                        self.id = data['id']
                        self.name = data['name']
                        self.description = data['description']
                        self.tags = data['tags']
                        self.assets = data['assets']
                        self.created_at = data['created_at']
                        self.updated_at = data['updated_at']

                    def to_dict(self):
                        return {
                            'id': self.id,
                            'name': self.name,
                            'description': self.description,
                            'tags': self.tags,
                            'assets': self.assets,
                            'created_at': self.created_at,
                            'updated_at': self.updated_at
                        }

                mock_portfolio = MockPortfolio(portfolio_data)
                filename = portfolio_manager.save_portfolio(mock_portfolio)
                return True, filename

            except Exception as fallback_error:
                st.error(f"❌ Fallback save failed: {str(fallback_error)}")
                return False, None

    except Exception as e:
        st.error(f"❌ Failed to create portfolio: {str(e)}")
        return False, None

def show_creation_actions():
    """Show portfolio creation actions."""
    if not st.session_state.portfolio_assets:
        st.info("📝 Add assets to your portfolio to continue")
        return

    create_section_header("🚀 Create Portfolio", "", "Review and create your portfolio")

    col1, col2, col3 = st.columns([1, 1, 1])

    with col1:
        if st.button("💾 Save Portfolio", type="primary", use_container_width=True):
            # Validate portfolio form
            if not st.session_state.get('portfolio_form', {}).get('name'):
                st.error("❌ Portfolio name is required")
                return

            # Check if we have assets
            if not st.session_state.portfolio_assets:
                st.error("❌ Please add at least one asset to the portfolio")
                return

            # Show progress
            with st.spinner("Creating portfolio..."):
                # Create portfolio
                success, filename = create_portfolio()

                if success:
                    st.success(f"✅ Portfolio '{st.session_state.portfolio_form['name']}' created successfully!")
                    st.info(f"📁 Saved as: {filename}")

                    # Show portfolio summary
                    total_assets = len(st.session_state.portfolio_assets)
                    total_weight = sum(asset['weight'] for asset in st.session_state.portfolio_assets)

                    st.success(f"📊 Portfolio Summary: {total_assets} assets, {total_weight:.1f}% allocated")

                    # Clear session state after successful creation
                    if st.button("🔄 Create Another Portfolio", use_container_width=True):
                        st.session_state.portfolio_assets = []
                        if 'portfolio_form' in st.session_state:
                            del st.session_state.portfolio_form
                        st.rerun()
                else:
                    st.error("❌ Failed to create portfolio. Please check the error messages above.")

                    # Show debug info
                    with st.expander("🔧 Debug Information"):
                        st.json({
                            "portfolio_form": st.session_state.get('portfolio_form', {}),
                            "portfolio_assets_count": len(st.session_state.portfolio_assets),
                            "first_asset": st.session_state.portfolio_assets[0] if st.session_state.portfolio_assets else None
                        })

    with col2:
        if st.button("🎲 Quick Diversified Portfolio", use_container_width=True):
            # Create a sample diversified portfolio
            sample_assets = [
                {'ticker': 'SPY', 'weight': 30.0},
                {'ticker': 'QQQ', 'weight': 25.0},
                {'ticker': 'IWM', 'weight': 15.0},
                {'ticker': 'VTI', 'weight': 20.0},
                {'ticker': 'VEA', 'weight': 10.0}
            ]

            st.session_state.portfolio_assets = []
            for asset in sample_assets:
                ticker_info = get_ticker_info(asset['ticker'])
                st.session_state.portfolio_assets.append({
                    'ticker': asset['ticker'],
                    'weight': asset['weight'],
                    'info': ticker_info
                })

            st.success("✅ Sample diversified portfolio loaded!")
            st.rerun()

    with col3:
        if st.button("🔄 Clear Portfolio", use_container_width=True):
            st.session_state.portfolio_assets = []
            st.success("✅ Portfolio cleared")
            st.rerun()

def main():
    """Main Portfolio Creation page function."""
    # Apply custom styling
    apply_custom_css()

    # Create sidebar navigation
    create_sidebar_navigation()

    # Page header
    create_page_header("Portfolio_Creation")

    # Check if we should clear session state (fresh start)
    if 'page_visited' not in st.session_state:
        st.session_state.page_visited = set()

    # If this is a fresh visit to Portfolio Creation, clear old data
    if 'Portfolio_Creation' not in st.session_state.page_visited:
        if 'portfolio_assets' in st.session_state:
            st.session_state.portfolio_assets = []
        if 'portfolio_form' in st.session_state:
            del st.session_state.portfolio_form
        st.session_state.page_visited.add('Portfolio_Creation')

    # Add a clear button at the top for manual reset
    col1, col2, col3, col4 = st.columns([1, 1, 1, 1])
    with col4:
        if st.button("🆕 Fresh Start", help="Clear all data and start over"):
            st.session_state.portfolio_assets = []
            if 'portfolio_form' in st.session_state:
                del st.session_state.portfolio_form
            st.rerun()

    # Portfolio creation workflow
    portfolio_form = show_portfolio_form()
    st.session_state.portfolio_form = portfolio_form

    st.markdown("---")
    portfolio_assets = show_asset_builder()

    if portfolio_assets:
        st.markdown("---")
        show_portfolio_preview()

        st.markdown("---")
        show_creation_actions()

if __name__ == "__main__":
    main()