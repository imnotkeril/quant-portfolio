"""
Portfolio Creation page - Create and configure investment portfolios.
ДОБАВЛЕНО: Автоматическое распределение средств с расчетом количества акций.
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

def calculate_shares_allocation(portfolio_amount, assets):
    """
    Calculate actual shares and cash remainder for portfolio.

    Args:
        portfolio_amount: Total amount to invest
        assets: List of assets with weights and current prices

    Returns:
        Dictionary with allocation details
    """
    try:
        allocations = {}
        total_invested = 0

        for asset in assets:
            ticker = asset['ticker']
            target_weight = asset['weight'] / 100.0  # Convert % to decimal
            current_price = asset.get('info', {}).get('current_price', 0)

            if current_price <= 0:
                # If no price data, skip this asset
                allocations[ticker] = {
                    'shares': 0,
                    'amount': 0,
                    'weight_actual': 0,
                    'target_amount': portfolio_amount * target_weight,
                    'price_missing': True
                }
                continue

            # Calculate target allocation amount
            target_amount = portfolio_amount * target_weight

            # Calculate number of shares (round down to whole shares)
            shares = int(target_amount / current_price)

            # Calculate actual amount invested
            actual_amount = shares * current_price

            # Calculate actual weight
            actual_weight = (actual_amount / portfolio_amount) if portfolio_amount > 0 else 0

            allocations[ticker] = {
                'shares': shares,
                'amount': actual_amount,
                'weight_actual': actual_weight * 100,  # Convert back to %
                'target_amount': target_amount,
                'current_price': current_price,
                'price_missing': False
            }

            total_invested += actual_amount

        cash_remainder = portfolio_amount - total_invested

        return {
            'allocations': allocations,
            'cash_remainder': cash_remainder,
            'total_invested': total_invested,
            'total_amount': portfolio_amount,
            'investment_ratio': (total_invested / portfolio_amount) if portfolio_amount > 0 else 0
        }

    except Exception as e:
        st.error(f"Error calculating shares allocation: {str(e)}")
        return None

def show_portfolio_form():
    """Show portfolio creation form with amount field."""
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

        # ДОБАВЛЕНО: Portfolio Amount field
        col_amount, col_currency = st.columns([3, 1])
        with col_amount:
            portfolio_amount = st.number_input(
                "Portfolio Amount *",
                min_value=100.0,
                max_value=10000000.0,
                value=10000.0,
                step=100.0,
                help="Total amount to invest in this portfolio"
            )
        with col_currency:
            st.write("")  # Spacing
            st.write("**USD**")  # Currency display

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
            <h4>💰 Amount Guidelines</h4>
            <ul>
                <li><strong>$1,000-$5,000:</strong> 3-5 positions</li>
                <li><strong>$5,000-$25,000:</strong> 5-10 positions</li>
                <li><strong>$25,000+:</strong> 10-20 positions</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    return {
        'name': portfolio_name,
        'description': portfolio_description,
        'amount': portfolio_amount,
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

def show_shares_allocation():
    """НОВАЯ ФУНКЦИЯ: Show calculated shares allocation."""
    if not st.session_state.portfolio_assets or not st.session_state.get('portfolio_form', {}).get('amount'):
        return

    create_section_header("💰 Shares Allocation", "", "Calculated number of shares and cash remainder")

    portfolio_amount = st.session_state.portfolio_form['amount']

    # Calculate shares allocation
    allocation_result = calculate_shares_allocation(portfolio_amount, st.session_state.portfolio_assets)

    if not allocation_result:
        st.error("Unable to calculate shares allocation")
        return

    # Summary metrics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(get_metric_card_html(
            "Total Amount",
            f"${allocation_result['total_amount']:,.0f}",
            "Portfolio value",
            "neutral"
        ), unsafe_allow_html=True)

    with col2:
        st.markdown(get_metric_card_html(
            "Invested",
            f"${allocation_result['total_invested']:,.0f}",
            f"{allocation_result['investment_ratio']*100:.1f}% of total",
            "positive"
        ), unsafe_allow_html=True)

    with col3:
        cash_color = "warning" if allocation_result['cash_remainder'] > allocation_result['total_amount'] * 0.1 else "neutral"
        st.markdown(get_metric_card_html(
            "Cash Remainder",
            f"${allocation_result['cash_remainder']:,.0f}",
            f"{(allocation_result['cash_remainder']/allocation_result['total_amount'])*100:.1f}% cash",
            cash_color
        ), unsafe_allow_html=True)

    with col4:
        assets_count = len([a for a in allocation_result['allocations'].values() if a['shares'] > 0])
        st.markdown(get_metric_card_html(
            "Assets Bought",
            str(assets_count),
            f"Out of {len(st.session_state.portfolio_assets)}",
            "positive" if assets_count == len(st.session_state.portfolio_assets) else "warning"
        ), unsafe_allow_html=True)

    st.markdown("---")

    # Detailed allocation table
    st.markdown("### 📊 Detailed Allocation")

    # Create DataFrame for better display
    allocation_data = []
    for ticker, alloc in allocation_result['allocations'].items():
        allocation_data.append({
            'Ticker': ticker,
            'Current Price': f"${alloc['current_price']:.2f}" if not alloc['price_missing'] else "N/A",
            'Target %': f"{[a['weight'] for a in st.session_state.portfolio_assets if a['ticker'] == ticker][0]:.1f}%",
            'Target Amount': f"${alloc['target_amount']:,.0f}",
            'Shares': alloc['shares'],
            'Actual Amount': f"${alloc['amount']:,.0f}",
            'Actual %': f"{alloc['weight_actual']:.1f}%",
            'Difference': f"${alloc['target_amount'] - alloc['amount']:+,.0f}"
        })

    if allocation_data:
        df = pd.DataFrame(allocation_data)
        st.dataframe(df, use_container_width=True)

    # Show warnings for assets that couldn't be bought
    missed_assets = [ticker for ticker, alloc in allocation_result['allocations'].items()
                    if alloc['shares'] == 0 and not alloc['price_missing']]

    if missed_assets:
        st.warning(f"⚠️ Cannot buy shares for: {', '.join(missed_assets)} (insufficient allocation or high price)")

    price_missing_assets = [ticker for ticker, alloc in allocation_result['allocations'].items()
                           if alloc['price_missing']]

    if price_missing_assets:
        st.error(f"❌ Price data missing for: {', '.join(price_missing_assets)}")

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

        # ОБНОВЛЕНО: Добавляем portfolio_amount в данные портфеля
        portfolio_data = {
            'id': portfolio_id,
            'name': st.session_state.portfolio_form['name'],
            'description': st.session_state.portfolio_form['description'],
            'portfolio_amount': st.session_state.portfolio_form['amount'],  # НОВОЕ поле
            'tags': st.session_state.portfolio_form['tags'],
            'assets': {},
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'total_weight': 0
        }

        # Add assets with proper structure
        total_weight = 0
        for asset in st.session_state.portfolio_assets:
            weight_decimal = asset['weight'] / 100.0  # Convert to decimal
            portfolio_data['assets'][asset['ticker']] = {
                'ticker': asset['ticker'],
                'weight': weight_decimal,
                'added_at': datetime.now().isoformat(),
                # ДОБАВЛЕНО: Сохраняем информацию о ценах и расчетах
                'current_price': asset.get('info', {}).get('current_price') if asset.get('info') else None,
                'price_date': datetime.now().isoformat()
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
            form_data = st.session_state.get('portfolio_form', {})
            if not form_data.get('name'):
                st.error("❌ Portfolio name is required")
                return

            if not form_data.get('amount') or form_data.get('amount') <= 0:
                st.error("❌ Portfolio amount is required and must be positive")
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
                    portfolio_amount = st.session_state.portfolio_form['amount']

                    st.success(f"💰 Portfolio: ${portfolio_amount:,.0f} across {total_assets} assets ({total_weight:.1f}% allocated)")

                    # Clear session state after successful creation
                    if st.button("🔄 Create Another Portfolio", use_container_width=True):
                        st.session_state.portfolio_assets = []
                        if 'portfolio_form' in st.session_state:
                            del st.session_state.portfolio_form
                        st.rerun()
                else:
                    st.error("❌ Failed to create portfolio. Please check the error messages above.")

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

        # НОВАЯ СЕКЦИЯ: Показываем расчет количества акций
        st.markdown("---")
        show_shares_allocation()

        st.markdown("---")
        show_creation_actions()

if __name__ == "__main__":
    main()