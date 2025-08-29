"""
Wild Market Capital - Main Streamlit Application Entry Point.
Welcome screen and navigation hub for portfolio management system.
"""
import streamlit as st
from pathlib import Path

# Import utilities and components
from utils.styling import apply_custom_css, create_section_header
from utils.constants import APP_CONFIG, PAGES_CONFIG, COLORS
from components.sidebar_nav import create_sidebar_navigation, create_page_header

# Page configuration
st.set_page_config(
    page_title=APP_CONFIG["title"],
    page_icon=APP_CONFIG["icon"],
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items=APP_CONFIG["menu_items"]
)

def test_backend_connection():
    """Test connection to backend services."""
    try:
        from services.service_manager import ServiceManager
        return ServiceManager.test_backend_connection()
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to import ServiceManager: {str(e)}"
        }

def show_welcome_screen():
    """Display the main welcome screen."""
    # Hero section
    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        st.markdown(f"""
        <div class="hero-section">
            <h1 style="text-align: center; font-size: 3rem; margin-bottom: 1rem;">
                🎯 {APP_CONFIG["title"]}
            </h1>
            <h2 style="text-align: center; color: {COLORS["primary"]}; margin-bottom: 2rem; font-weight: 400;">
                {APP_CONFIG["tagline"]}
            </h2>
            <p style="text-align: center; font-size: 1.2rem; margin-bottom: 2rem; color: {COLORS["text_secondary"]};">
                Professional-grade portfolio management with advanced analytics,<br>
                risk management, and optimization algorithms.
            </p>
        </div>
        """, unsafe_allow_html=True)

def show_quick_actions():
    """Display quick action buttons."""
    create_section_header("🚀 Quick Actions", "", "Jump directly to key features")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        if st.button(
            f"{PAGES_CONFIG['Dashboard']['icon']} Dashboard",
            use_container_width=True,
            type="primary"
        ):
            st.switch_page("pages/Dashboard.py")

    with col2:
        if st.button(
            f"{PAGES_CONFIG['Portfolio_Creation']['icon']} Create Portfolio",
            use_container_width=True
        ):
            st.switch_page("pages/Portfolio_Creation.py")

    with col3:
        if st.button(
            f"{PAGES_CONFIG['Portfolio_Analysis']['icon']} Analysis",
            use_container_width=True
        ):
            st.switch_page("pages/Portfolio_Analysis.py")

    with col4:
        if st.button(
            f"{PAGES_CONFIG['Risk_Management']['icon']} Risk Management",
            use_container_width=True
        ):
            st.switch_page("pages/Risk_Management.py")

def show_features_overview():
    """Display platform features overview."""
    create_section_header("✨ Platform Features", "", "Comprehensive investment management capabilities")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown(f"""
        <div class="analytics-section">
            <h3 style="color: {COLORS["success"]};">📊 Portfolio Management</h3>
            <ul style="color: {COLORS["text_secondary"]};">
                <li>Create and manage multiple portfolios</li>
                <li>50+ performance and risk metrics</li>
                <li>Real-time market data integration</li>
                <li>Portfolio comparison and benchmarking</li>
                <li>Custom reporting and exports</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="analytics-section">
            <h3 style="color: {COLORS["warning"]};">⚖️ Optimization & Risk</h3>
            <ul style="color: {COLORS["text_secondary"]};">
                <li>10+ optimization algorithms</li>
                <li>Modern Portfolio Theory implementation</li>
                <li>Value-at-Risk (VaR) calculations</li>
                <li>Comprehensive stress testing</li>
                <li>Risk attribution analysis</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="analytics-section">
            <h3 style="color: {COLORS["primary"]};">🎯 Advanced Analytics</h3>
            <ul style="color: {COLORS["text_secondary"]};">
                <li>Monte Carlo simulations</li>
                <li>Scenario analysis and modeling</li>
                <li>Historical pattern recognition</li>
                <li>Performance attribution</li>
                <li>Custom research workflows</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

def show_system_status():
    """Display system status and backend connection."""
    create_section_header("🔧 System Status", "", "Backend connectivity and system health")

    # Test backend connection
    connection_status = test_backend_connection()

    col1, col2 = st.columns([2, 1])

    with col1:
        if connection_status["status"] == "success":
            st.success(f"✅ {connection_status['message']}")

            # Show service details
            st.info(f"""
            **Connected Services:**
            - Analytics Service: {connection_status.get('analytics', 'N/A')}
            - Data Fetcher: {connection_status.get('data_fetcher', 'N/A')}
            - Storage Directory: {connection_status.get('storage_dir', 'N/A')}
            """)
        else:
            st.error(f"❌ {connection_status['message']}")

            st.warning("""
            **Troubleshooting:**
            1. Ensure backend directory exists at project root
            2. Check that all backend services are implemented
            3. Verify Python path configuration
            """)

    with col2:
        st.markdown(f"""
        <div class="analytics-section">
            <h4>📊 App Info</h4>
            <p><strong>Version:</strong> {APP_CONFIG["version"]}</p>
            <p><strong>Theme:</strong> Wild Market Capital Dark</p>
            <p><strong>Pages:</strong> {len(PAGES_CONFIG)} available</p>
        </div>
        """, unsafe_allow_html=True)

def main():
    """Main application function."""
    # Apply custom styling
    apply_custom_css()

    # Create sidebar navigation
    create_sidebar_navigation()

    # Main content
    show_welcome_screen()

    st.markdown("---")
    show_quick_actions()

    st.markdown("---")
    show_features_overview()

    st.markdown("---")
    show_system_status()

if __name__ == "__main__":
    main()