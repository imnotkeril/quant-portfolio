#!/usr/bin/env python3
"""
Setup script for Streamlit application structure.
Creates all necessary directories and empty files for the Streamlit app.
"""
import os
from pathlib import Path


def create_streamlit_structure():
    """Create the complete Streamlit application structure."""

    print("🚀 Creating Streamlit application structure...")

    # Base directory
    base_dir = Path("streamlit_app")
    base_dir.mkdir(exist_ok=True)

    # Directory structure
    directories = [
        "pages",
        "services",
        "components",
        "utils",
        "assets/styles",
        "assets/images"
    ]

    # Create directories
    for directory in directories:
        dir_path = base_dir / directory
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {dir_path}")

    # Files to create with their content templates
    files_content = {
        # Root files
        "app.py": '''"""
Main Streamlit application entry point.
Multi-page portfolio management dashboard.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import configuration and styling
from utils.styling import apply_custom_css
from utils.constants import APP_CONFIG
from components.sidebar_nav import create_sidebar_navigation

# Page configuration
st.set_page_config(
    page_title=APP_CONFIG["title"],
    page_icon=APP_CONFIG["icon"],
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items=APP_CONFIG["menu_items"]
)

def main():
    """Main application function."""
    # Apply custom styling
    apply_custom_css()

    # Create sidebar navigation
    create_sidebar_navigation()

    # Main dashboard content
    st.title("🎯 Wild Market Capital")
    st.markdown("### Investment Portfolio Management Dashboard")

    # Welcome section
    col1, col2, col3 = st.columns([2, 1, 2])

    with col2:
        st.info("""
        **Welcome to Wild Market Capital Portfolio Management System**

        Navigate using the sidebar to access:
        - Portfolio Creation & Analysis
        - Risk Management & Optimization
        - Scenario Analysis & Historical Analogies
        """)

    # Quick stats or recent portfolios could go here
    st.markdown("---")
    st.markdown("**Quick Actions:**")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        if st.button("📊 Create Portfolio", use_container_width=True):
            st.switch_page("pages/Portfolio_Creation.py")

    with col2:
        if st.button("📈 Analyze Portfolio", use_container_width=True):
            st.switch_page("pages/Portfolio_Analysis.py")

    with col3:
        if st.button("⚖️ Optimize Portfolio", use_container_width=True):
            st.switch_page("pages/Portfolio_Optimization.py")

    with col4:
        if st.button("🛡️ Risk Management", use_container_width=True):
            st.switch_page("pages/Risk_Management.py")

if __name__ == "__main__":
    main()
''',

        "streamlit_config.py": '''"""
Streamlit application configuration.
"""
import streamlit as st
from pathlib import Path

# Page configuration
PAGE_CONFIG = {
    "page_title": "Wild Market Capital",
    "page_icon": "🎯",
    "layout": "wide",
    "initial_sidebar_state": "expanded",
    "menu_items": {
        "Get Help": "https://github.com/your-repo",
        "Report a bug": "https://github.com/your-repo/issues",
        "About": "Wild Market Capital Portfolio Management System"
    }
}

# Theme configuration
THEME_CONFIG = {
    "primaryColor": "#FF6B6B",
    "backgroundColor": "#0E1117",
    "secondaryBackgroundColor": "#262730",
    "textColor": "#FAFAFA",
    "font": "sans serif"
}

def configure_streamlit():
    """Configure Streamlit settings."""
    st.set_page_config(**PAGE_CONFIG)
''',

        # Pages
        "pages/Portfolio_Creation.py": '''"""
Portfolio Creation page.
Create and configure new investment portfolios.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from components.forms import create_portfolio_form
from utils.styling import apply_custom_css

st.set_page_config(page_title="Portfolio Creation", page_icon="📊", layout="wide")

def main():
    """Main Portfolio Creation page function."""
    apply_custom_css()

    st.title("📊 Portfolio Creation")
    st.markdown("Create and configure new investment portfolios")

    # Portfolio creation form
    create_portfolio_form()

if __name__ == "__main__":
    main()
''',

        "pages/Portfolio_Analysis.py": '''"""
Portfolio Analysis page.
Comprehensive portfolio performance analysis with 50+ metrics.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path  
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from components.portfolio_selector import create_portfolio_selector
from utils.styling import apply_custom_css

st.set_page_config(page_title="Portfolio Analysis", page_icon="📈", layout="wide")

def main():
    """Main Portfolio Analysis page function."""
    apply_custom_css()

    st.title("📈 Portfolio Analysis")
    st.markdown("Comprehensive portfolio performance analysis with 50+ metrics")

    # Portfolio selector
    selected_portfolio = create_portfolio_selector()

    if selected_portfolio:
        # Analysis will be implemented here
        st.info("Analysis functionality will be implemented here")

if __name__ == "__main__":
    main()
''',

        "pages/Risk_Management.py": '''"""
Risk Management page.
VaR calculations, stress testing, and risk analysis.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from utils.styling import apply_custom_css

st.set_page_config(page_title="Risk Management", page_icon="🛡️", layout="wide")

def main():
    """Main Risk Management page function."""
    apply_custom_css()

    st.title("🛡️ Risk Management")
    st.markdown("VaR calculations, stress testing, and comprehensive risk analysis")

    st.info("Risk management functionality will be implemented here")

if __name__ == "__main__":
    main()
''',

        "pages/Portfolio_Optimization.py": '''"""
Portfolio Optimization page.
Modern Portfolio Theory and advanced optimization algorithms.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from utils.styling import apply_custom_css

st.set_page_config(page_title="Portfolio Optimization", page_icon="⚖️", layout="wide")

def main():
    """Main Portfolio Optimization page function."""
    apply_custom_css()

    st.title("⚖️ Portfolio Optimization")
    st.markdown("Modern Portfolio Theory and advanced optimization algorithms")

    st.info("Optimization functionality will be implemented here")

if __name__ == "__main__":
    main()
''',

        "pages/Portfolio_Comparison.py": '''"""
Portfolio Comparison page.
Side-by-side portfolio comparison and benchmarking.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from utils.styling import apply_custom_css

st.set_page_config(page_title="Portfolio Comparison", page_icon="📊", layout="wide")

def main():
    """Main Portfolio Comparison page function."""
    apply_custom_css()

    st.title("📊 Portfolio Comparison")
    st.markdown("Side-by-side portfolio comparison and benchmarking")

    st.info("Comparison functionality will be implemented here")

if __name__ == "__main__":
    main()
''',

        "pages/Scenario_Analysis.py": '''"""
Scenario Analysis page.
Monte Carlo simulations and scenario modeling.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from utils.styling import apply_custom_css

st.set_page_config(page_title="Scenario Analysis", page_icon="🎲", layout="wide")

def main():
    """Main Scenario Analysis page function."""
    apply_custom_css()

    st.title("🎲 Scenario Analysis") 
    st.markdown("Monte Carlo simulations and advanced scenario modeling")

    st.info("Scenario analysis functionality will be implemented here")

if __name__ == "__main__":
    main()
''',

        "pages/Historical_Analogies.py": '''"""
Historical Analogies page.
Historical context and pattern recognition.
"""
import streamlit as st
from pathlib import Path
import sys

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from services.service_manager import ServiceManager
from utils.styling import apply_custom_css

st.set_page_config(page_title="Historical Analogies", page_icon="📚", layout="wide")

def main():
    """Main Historical Analogies page function."""
    apply_custom_css()

    st.title("📚 Historical Analogies")
    st.markdown("Historical context analysis and pattern recognition")

    st.info("Historical analogies functionality will be implemented here")

if __name__ == "__main__":
    main()
''',

        # Services
        "services/__init__.py": '''"""
Backend services integration.
Direct imports from existing backend without API calls.
"""
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import all backend services
try:
    from app.core.services.analytics import AnalyticsService
    from app.core.services.enhanced_analytics import EnhancedAnalyticsService
    from app.core.services.optimization import OptimizationService
    from app.core.services.advanced_optimization import AdvancedOptimizationService
    from app.core.services.risk_management import RiskManagementService
    from app.core.services.monte_carlo import MonteCarloService
    from app.core.services.time_series import TimeSeriesService
    from app.core.services.diversification import DiversificationService
    from app.core.services.scenario_service import ScenarioService
    from app.core.services.historical_service import HistoricalService
    from app.core.services.portfolio_comparison import PortfolioComparisonService
    from app.core.services.report_service import ReportService
    from app.infrastructure.data.data_fetcher import DataFetcher
    from app.infrastructure.data.portfolio_manager import PortfolioManager

    print("✅ Successfully imported all backend services")

except ImportError as e:
    print(f"❌ Failed to import backend services: {e}")
    print("Make sure backend is properly set up and services exist")

__all__ = [
    'AnalyticsService',
    'EnhancedAnalyticsService', 
    'OptimizationService',
    'AdvancedOptimizationService',
    'RiskManagementService',
    'MonteCarloService',
    'TimeSeriesService',
    'DiversificationService',
    'ScenarioService',
    'HistoricalService',
    'PortfolioComparisonService',
    'ReportService',
    'DataFetcher',
    'PortfolioManager'
]
''',

        "services/service_manager.py": '''"""
Service Manager with Streamlit caching.
Centralized access to all backend services with @st.cache_resource.
"""
import streamlit as st
from typing import Any

# Import all services from backend
from services import (
    AnalyticsService,
    EnhancedAnalyticsService,
    OptimizationService, 
    AdvancedOptimizationService,
    RiskManagementService,
    MonteCarloService,
    TimeSeriesService,
    DiversificationService,
    ScenarioService,
    HistoricalService,
    PortfolioComparisonService,
    ReportService,
    DataFetcher,
    PortfolioManager
)

class ServiceManager:
    """Centralized service manager with Streamlit caching."""

    @staticmethod
    @st.cache_resource
    def get_analytics_service() -> AnalyticsService:
        """Get Analytics Service instance."""
        return AnalyticsService()

    @staticmethod
    @st.cache_resource
    def get_enhanced_analytics_service() -> EnhancedAnalyticsService:
        """Get Enhanced Analytics Service instance."""
        return EnhancedAnalyticsService()

    @staticmethod
    @st.cache_resource
    def get_optimization_service() -> OptimizationService:
        """Get Optimization Service instance."""
        return OptimizationService()

    @staticmethod
    @st.cache_resource
    def get_advanced_optimization_service() -> AdvancedOptimizationService:
        """Get Advanced Optimization Service instance.""" 
        return AdvancedOptimizationService()

    @staticmethod
    @st.cache_resource
    def get_risk_management_service() -> RiskManagementService:
        """Get Risk Management Service instance."""
        return RiskManagementService()

    @staticmethod
    @st.cache_resource
    def get_monte_carlo_service() -> MonteCarloService:
        """Get Monte Carlo Service instance."""
        return MonteCarloService()

    @staticmethod
    @st.cache_resource
    def get_time_series_service() -> TimeSeriesService:
        """Get Time Series Service instance."""
        return TimeSeriesService()

    @staticmethod
    @st.cache_resource
    def get_diversification_service() -> DiversificationService:
        """Get Diversification Service instance."""
        return DiversificationService()

    @staticmethod
    @st.cache_resource
    def get_scenario_service() -> ScenarioService:
        """Get Scenario Service instance."""
        return ScenarioService()

    @staticmethod
    @st.cache_resource
    def get_historical_service() -> HistoricalService:
        """Get Historical Service instance."""
        return HistoricalService()

    @staticmethod
    @st.cache_resource
    def get_portfolio_comparison_service() -> PortfolioComparisonService:
        """Get Portfolio Comparison Service instance."""
        return PortfolioComparisonService()

    @staticmethod
    @st.cache_resource
    def get_report_service() -> ReportService:
        """Get Report Service instance."""
        return ReportService()

    @staticmethod
    @st.cache_resource
    def get_data_fetcher() -> DataFetcher:
        """Get Data Fetcher instance."""
        return DataFetcher()

    @staticmethod
    @st.cache_resource
    def get_portfolio_manager() -> PortfolioManager:
        """Get Portfolio Manager instance."""
        data_fetcher = ServiceManager.get_data_fetcher()
        return PortfolioManager(data_fetcher, None)  # Storage service TBD
''',

        # Components
        "components/__init__.py": '''"""
UI Components for Streamlit application.
"""
''',

        "components/sidebar_nav.py": '''"""
Sidebar navigation component.
"""
import streamlit as st

def create_sidebar_navigation():
    """Create sidebar navigation menu."""
    with st.sidebar:
        st.title("🎯 Wild Market Capital")
        st.markdown("---")

        st.markdown("### 📊 Portfolio Management")
        if st.button("Create Portfolio", use_container_width=True):
            st.switch_page("pages/Portfolio_Creation.py")

        if st.button("Analyze Portfolio", use_container_width=True):
            st.switch_page("pages/Portfolio_Analysis.py")

        st.markdown("### ⚖️ Optimization & Risk")
        if st.button("Portfolio Optimization", use_container_width=True):
            st.switch_page("pages/Portfolio_Optimization.py")

        if st.button("Risk Management", use_container_width=True):
            st.switch_page("pages/Risk_Management.py")

        st.markdown("### 📈 Advanced Analysis")
        if st.button("Portfolio Comparison", use_container_width=True):
            st.switch_page("pages/Portfolio_Comparison.py")

        if st.button("Scenario Analysis", use_container_width=True):
            st.switch_page("pages/Scenario_Analysis.py")

        if st.button("Historical Analogies", use_container_width=True):
            st.switch_page("pages/Historical_Analogies.py")

        st.markdown("---")
        st.markdown("**Wild Market Capital** v1.0")
''',

        # Utils
        "utils/__init__.py": "# Utils package",

        "utils/constants.py": '''"""
Application constants and configuration.
"""

APP_CONFIG = {
    "title": "Wild Market Capital",
    "icon": "🎯", 
    "menu_items": {
        "Get Help": "https://github.com/your-repo",
        "Report a bug": "https://github.com/your-repo/issues",
        "About": "Wild Market Capital Portfolio Management System"
    }
}

# Color scheme for Wild Market Capital dark theme
COLORS = {
    "primary": "#FF6B6B",
    "secondary": "#4ECDC4", 
    "success": "#45B7D1",
    "warning": "#FFA07A",
    "danger": "#FF6B6B",
    "dark": "#2C3E50",
    "light": "#ECF0F1",
    "background": "#0E1117",
    "surface": "#262730"
}

# Chart colors
CHART_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
]
''',

        "utils/styling.py": '''"""
Custom CSS styling for Wild Market Capital theme.
"""
import streamlit as st

def apply_custom_css():
    """Apply Wild Market Capital custom CSS styling."""

    css = """
    <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* Root variables */
    :root {
        --primary-color: #FF6B6B;
        --secondary-color: #4ECDC4;
        --success-color: #45B7D1;
        --warning-color: #FFA07A;
        --danger-color: #FF6B6B;
        --dark-color: #2C3E50;
        --light-color: #ECF0F1;
        --background-color: #0E1117;
        --surface-color: #262730;
    }

    /* Main app styling */
    .main {
        padding-top: 2rem;
        font-family: 'Inter', sans-serif;
    }

    /* Headers */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        color: #FAFAFA;
    }

    /* Metrics cards */
    .metric-card {
        background: linear-gradient(135deg, var(--surface-color) 0%, #1e1e1e 100%);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #3a3a3a;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
    }

    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        border-color: var(--primary-color);
    }

    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, var(--primary-color) 0%, #ff5252 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 2rem;
        font-weight: 500;
        transition: all 0.3s ease;
        font-family: 'Inter', sans-serif;
    }

    .stButton > button:hover {
        background: linear-gradient(135deg, #ff5252 0%, #ff3d3d 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    }

    /* Sidebar styling */
    .css-1d391kg {
        background: linear-gradient(180deg, var(--background-color) 0%, #1a1a1a 100%);
    }

    /* Info boxes */
    .stAlert {
        border-radius: 8px;
        border: none;
    }

    /* Custom classes */
    .portfolio-summary {
        background: var(--surface-color);
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1rem 0;
        border: 1px solid #3a3a3a;
    }

    .performance-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
    }

    /* Plotly chart container */
    .plotly-chart {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* Loading animation */
    .stSpinner {
        color: var(--primary-color);
    }

    /* Data tables */
    .stDataFrame {
        border-radius: 8px;
        overflow: hidden;
    }
    </style>
    """

    st.markdown(css, unsafe_allow_html=True)
''',

        # Empty files for components and utils
        "components/charts.py": "# Plotly charts components",
        "components/metrics_cards.py": "# Metrics display cards",
        "components/tables.py": "# Data tables components",
        "components/forms.py": "# Input forms components",
        "components/portfolio_selector.py": "# Portfolio selector component",

        "utils/formatters.py": "# Data formatting utilities",
        "utils/validators.py": "# Input validation utilities",
        "utils/helpers.py": "# Helper functions",

        # Assets
        "assets/styles/main.css": """/* Main CSS file for additional styling */""",
        "assets/styles/components.css": """/* Component-specific CSS */""",
    }

    # Create all files
    for file_path, content in files_content.items():
        full_path = base_dir / file_path

        # Create parent directories if they don't exist
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Write content to file
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"📄 Created file: {full_path}")

    print("\n✅ Streamlit application structure created successfully!")
    print("\nNext steps:")
    print("1. cd streamlit_app")
    print("2. pip install streamlit plotly streamlit-aggrid streamlit-option-menu")
    print("3. streamlit run app.py")
    print("\n🎯 Your Wild Market Capital Streamlit app is ready!")


if __name__ == "__main__":
    create_streamlit_structure()