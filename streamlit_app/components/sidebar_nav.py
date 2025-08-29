"""
Sidebar navigation component for Wild Market Capital.
"""
import streamlit as st
from utils.constants import PAGES_CONFIG, APP_CONFIG

def create_sidebar_navigation():
    """Create Wild Market Capital sidebar navigation menu."""
    with st.sidebar:
        # Header with logo and title
        st.markdown(f"""
        <div style="text-align: center; padding: 1rem 0 2rem 0;">
            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #FF6B6B;">
                🎯 {APP_CONFIG["title"]}
            </h1>
            <p style="font-size: 0.875rem; color: #B0B0B0; margin: 0;">
                {APP_CONFIG["tagline"]}
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")

        # Main navigation sections
        st.markdown("### 📊 **Portfolio Management**")

        # Dashboard
        if st.button(
            f"{PAGES_CONFIG['Dashboard']['icon']} {PAGES_CONFIG['Dashboard']['title']}",
            use_container_width=True,
            help=PAGES_CONFIG['Dashboard']['description']
        ):
            st.switch_page("pages/Dashboard.py")

        # Portfolio Creation
        if st.button(
            f"{PAGES_CONFIG['Portfolio_Creation']['icon']} Create Portfolio",
            use_container_width=True,
            help=PAGES_CONFIG['Portfolio_Creation']['description']
        ):
            st.switch_page("pages/Portfolio_Creation.py")

        # Portfolio Analysis
        if st.button(
            f"{PAGES_CONFIG['Portfolio_Analysis']['icon']} Analyze Portfolio",
            use_container_width=True,
            help=PAGES_CONFIG['Portfolio_Analysis']['description']
        ):
            st.switch_page("pages/Portfolio_Analysis.py")

        st.markdown("### ⚖️ **Optimization & Risk**")

        # Portfolio Optimization
        if st.button(
            f"{PAGES_CONFIG['Portfolio_Optimization']['icon']} Optimization",
            use_container_width=True,
            help=PAGES_CONFIG['Portfolio_Optimization']['description']
        ):
            st.switch_page("pages/Portfolio_Optimization.py")

        # Risk Management
        if st.button(
            f"{PAGES_CONFIG['Risk_Management']['icon']} Risk Management",
            use_container_width=True,
            help=PAGES_CONFIG['Risk_Management']['description']
        ):
            st.switch_page("pages/Risk_Management.py")

        st.markdown("### 📈 **Advanced Analysis**")

        # Portfolio Comparison
        if st.button(
            f"{PAGES_CONFIG['Portfolio_Comparison']['icon']} Comparison",
            use_container_width=True,
            help=PAGES_CONFIG['Portfolio_Comparison']['description']
        ):
            st.switch_page("pages/Portfolio_Comparison.py")

        # Scenario Analysis
        if st.button(
            f"{PAGES_CONFIG['Scenario_Analysis']['icon']} Scenarios",
            use_container_width=True,
            help=PAGES_CONFIG['Scenario_Analysis']['description']
        ):
            st.switch_page("pages/Scenario_Analysis.py")

        # Historical Analogies
        if st.button(
            f"{PAGES_CONFIG['Historical_Analogies']['icon']} History",
            use_container_width=True,
            help=PAGES_CONFIG['Historical_Analogies']['description']
        ):
            st.switch_page("pages/Historical_Analogies.py")

        # Footer
        st.markdown("---")

        # Quick stats or system status
        with st.expander("📊 System Status"):
            try:
                from services.service_manager import ServiceManager
                settings = ServiceManager.get_settings()

                st.success("✅ Backend Connected")
                st.info(f"🔧 Version: {APP_CONFIG['version']}")
                st.info(f"💾 Storage: {settings.STORAGE_DIR}")

            except Exception as e:
                st.error("❌ Backend Connection Error")
                st.error(f"Error: {str(e)}")

        # Footer with version
        st.markdown(f"""
        <div style="text-align: center; padding-top: 2rem; color: #666;">
            <small>{APP_CONFIG["title"]} v{APP_CONFIG["version"]}</small>
        </div>
        """, unsafe_allow_html=True)

def create_page_header(page_key: str):
    """
    Create a standardized page header.

    Args:
        page_key: Key from PAGES_CONFIG
    """
    if page_key in PAGES_CONFIG:
        config = PAGES_CONFIG[page_key]
        st.markdown(f"""
        <div style="margin-bottom: 2rem;">
            <h1>{config['icon']} {config['title']}</h1>
            <p style="font-size: 1.1rem; color: #B0B0B0; margin-bottom: 1rem;">
                {config['description']}
            </p>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.title("Wild Market Capital")

def show_navigation_help():
    """Show navigation help in sidebar."""
    with st.sidebar:
        with st.expander("ℹ️ Navigation Help"):
            st.markdown("""
            **Quick Tips:**
            - Use sidebar buttons to navigate
            - Dashboard shows portfolio overview
            - Analysis provides 50+ metrics
            - Optimization runs 10+ algorithms
            - Risk Management includes VaR & stress tests
            """)

def create_breadcrumb(current_page: str, parent_pages: list = None):
    """
    Create breadcrumb navigation.

    Args:
        current_page: Current page name
        parent_pages: List of parent pages [(name, url), ...]
    """
    breadcrumb_html = '<div style="margin-bottom: 1rem; font-size: 0.9rem; color: #B0B0B0;">'

    if parent_pages:
        for name, url in parent_pages:
            breadcrumb_html += f'<a href="{url}" style="color: #FF6B6B; text-decoration: none;">{name}</a> > '

    breadcrumb_html += f'<span style="color: #FAFAFA;">{current_page}</span></div>'

    st.markdown(breadcrumb_html, unsafe_allow_html=True)