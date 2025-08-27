#!/usr/bin/env python3
"""
Setup script for Streamlit application structure.
Creates all necessary directories and empty files for the portfolio management app.
"""

import os
from pathlib import Path


def create_directory_structure():
    """Create the complete directory structure for Streamlit app."""

    # Base directory
    base_dir = Path("streamlit_app")

    # Directory structure
    dirs = [
        "",  # root
        "components",
        "components/ui",
        "components/charts",
        "components/metrics",
        "services",
        "pages",
        "utils",
        "assets",
        "assets/css",
        "assets/images",
    ]

    # Create directories
    for dir_path in dirs:
        full_path = base_dir / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {full_path}")


def create_files():
    """Create all necessary files with basic structure."""

    base_dir = Path("streamlit_app")

    files = {
        # Main app file
        "app.py": """# Wild Market Capital - Portfolio Management System
import streamlit as st
from pathlib import Path
import sys

# Add backend to path for direct imports
backend_path = Path(__file__).parent.parent / "backend" / "app"
sys.path.append(str(backend_path))

from services.service_manager import ServiceManager
from utils.styling import apply_custom_styling

# Page configuration
st.set_page_config(
    page_title="Wild Market Capital",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

def main():
    \"\"\"Main application entry point.\"\"\"

    # Apply custom styling
    apply_custom_styling()

    # Initialize services
    ServiceManager.initialize()

    # Main app content
    st.title("🎯 Wild Market Capital")
    st.subheader("Professional Portfolio Management System")

    # Welcome content
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.info(
            "Welcome to Wild Market Capital's portfolio management system. "
            "Navigate using the sidebar to access different modules."
        )

if __name__ == "__main__":
    main()
""",

        # Service Manager - Integration layer
        "services/__init__.py": "",
        "services/service_manager.py": """# Service Manager for Backend Integration
import streamlit as st
from pathlib import Path
import sys
from typing import Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add backend to Python path
backend_path = Path(__file__).parent.parent.parent / "backend" / "app"
sys.path.append(str(backend_path))

class ServiceManager:
    \"\"\"
    Centralized service manager for backend integration.
    Uses Streamlit caching for performance.
    \"\"\"

    _analytics_service = None
    _enhanced_analytics_service = None
    _optimization_service = None
    _advanced_optimization_service = None
    _risk_management_service = None
    _monte_carlo_service = None
    _time_series_service = None
    _diversification_service = None
    _scenario_service = None
    _historical_service = None

    @classmethod
    @st.cache_resource
    def initialize(cls):
        \"\"\"Initialize all backend services.\"\"\"
        try:
            logger.info("Initializing backend services...")
            # Services will be imported and initialized here
            logger.info("✅ All services initialized successfully")
        except Exception as e:
            logger.error(f"❌ Error initializing services: {e}")
            st.error(f"Failed to initialize backend services: {e}")

    @classmethod
    @st.cache_resource  
    def get_analytics_service(cls):
        \"\"\"Get analytics service instance.\"\"\"
        if cls._analytics_service is None:
            from core.services.analytics import AnalyticsService
            cls._analytics_service = AnalyticsService()
        return cls._analytics_service

    @classmethod
    @st.cache_resource
    def get_enhanced_analytics_service(cls):
        \"\"\"Get enhanced analytics service instance.\"\"\"
        if cls._enhanced_analytics_service is None:
            from core.services.enhanced_analytics import EnhancedAnalyticsService  
            cls._enhanced_analytics_service = EnhancedAnalyticsService()
        return cls._enhanced_analytics_service

    @classmethod
    @st.cache_resource
    def get_optimization_service(cls):
        \"\"\"Get optimization service instance.\"\"\"
        if cls._optimization_service is None:
            from core.services.optimization import OptimizationService
            cls._optimization_service = OptimizationService()
        return cls._optimization_service

    @classmethod  
    @st.cache_resource
    def get_advanced_optimization_service(cls):
        \"\"\"Get advanced optimization service instance.\"\"\"
        if cls._advanced_optimization_service is None:
            from core.services.advanced_optimization import AdvancedOptimizationService
            cls._advanced_optimization_service = AdvancedOptimizationService()
        return cls._advanced_optimization_service

    @classmethod
    @st.cache_resource
    def get_risk_management_service(cls):
        \"\"\"Get risk management service instance.\"\"\"
        if cls._risk_management_service is None:
            from core.services.risk_management import RiskManagementService
            cls._risk_management_service = RiskManagementService()
        return cls._risk_management_service

    @classmethod
    @st.cache_resource
    def get_monte_carlo_service(cls):
        \"\"\"Get Monte Carlo service instance.\"\"\"
        if cls._monte_carlo_service is None:
            from core.services.monte_carlo import MonteCarloService
            cls._monte_carlo_service = MonteCarloService()
        return cls._monte_carlo_service

    @classmethod
    @st.cache_resource
    def get_time_series_service(cls):
        \"\"\"Get time series service instance.\"\"\"
        if cls._time_series_service is None:
            from core.services.time_series import TimeSeriesService
            cls._time_series_service = TimeSeriesService()
        return cls._time_series_service

    @classmethod
    @st.cache_resource
    def get_diversification_service(cls):
        \"\"\"Get diversification service instance.\"\"\"
        if cls._diversification_service is None:
            from core.services.diversification import DiversificationService
            cls._diversification_service = DiversificationService()
        return cls._diversification_service

    @classmethod
    @st.cache_resource
    def get_scenario_service(cls):
        \"\"\"Get scenario service instance.\"\"\"
        if cls._scenario_service is None:
            from core.services.scenario_service import ScenarioService
            cls._scenario_service = ScenarioService()
        return cls._scenario_service

    @classmethod
    @st.cache_resource
    def get_historical_service(cls):
        \"\"\"Get historical service instance.\"\"\"
        if cls._historical_service is None:
            from core.services.historical_service import HistoricalService
            cls._historical_service = HistoricalService()
        return cls._historical_service
""",

        # Pages directory structure
        "pages/__init__.py": "",
        "pages/1_📊_Portfolio_Analysis.py": "# Portfolio Analysis Page - To be implemented",
        "pages/2_⚡_Portfolio_Creation.py": "# Portfolio Creation Page - To be implemented",
        "pages/3_🎯_Portfolio_Optimization.py": "# Portfolio Optimization Page - To be implemented",
        "pages/4_🛡️_Risk_Management.py": "# Risk Management Page - To be implemented",
        "pages/5_🔮_Scenario_Analysis.py": "# Scenario Analysis Page - To be implemented",
        "pages/6_📈_Historical_Analogies.py": "# Historical Analogies Page - To be implemented",
        "pages/7_📋_Portfolio_Comparison.py": "# Portfolio Comparison Page - To be implemented",

        # Components directory
        "components/__init__.py": "",
        "components/ui/__init__.py": "",
        "components/ui/sidebar.py": "# Sidebar components - To be implemented",
        "components/ui/headers.py": "# Header components - To be implemented",
        "components/ui/forms.py": "# Form components - To be implemented",
        "components/ui/modals.py": "# Modal components - To be implemented",

        "components/charts/__init__.py": "",
        "components/charts/plotly_charts.py": "# Plotly chart components - To be implemented",
        "components/charts/performance_charts.py": "# Performance chart components - To be implemented",
        "components/charts/risk_charts.py": "# Risk chart components - To be implemented",
        "components/charts/optimization_charts.py": "# Optimization chart components - To be implemented",

        "components/metrics/__init__.py": "",
        "components/metrics/cards.py": "# Metric card components - To be implemented",
        "components/metrics/grids.py": "# Metric grid components - To be implemented",
        "components/metrics/tables.py": "# Metric table components - To be implemented",

        # Utils directory
        "utils/__init__.py": "",
        "utils/styling.py": """# Custom styling for Wild Market Capital theme
import streamlit as st

def apply_custom_styling():
    \"\"\"Apply Wild Market Capital custom styling.\"\"\"

    # Custom CSS for dark theme and professional styling
    st.markdown(\"\"\"
    <style>
    /* Wild Market Capital Theme */
    .main-header {
        background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }

    /* Metric cards styling */
    .metric-card {
        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
        padding: 1.5rem;
        border-radius: 10px;
        border: 1px solid #4b5563;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 0.5rem 0;
    }

    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #10b981;
        margin: 0.5rem 0;
    }

    .metric-label {
        font-size: 0.9rem;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Custom buttons */
    .stButton > button {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .stButton > button:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    /* Sidebar styling */
    .sidebar .sidebar-content {
        background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
    }

    /* Success/Error styling */
    .success-message {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }

    .error-message {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 1rem;
        border-radius: 8px; 
        margin: 1rem 0;
    }

    /* Plotly chart styling */
    .js-plotly-plot {
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    </style>
    \"\"\", unsafe_allow_html=True)

def create_metric_card(title: str, value: str, delta: str = None, help_text: str = None):
    \"\"\"Create a styled metric card.\"\"\"
    delta_html = ""
    if delta:
        delta_color = "#10b981" if not delta.startswith("-") else "#ef4444"
        delta_html = f'<div style="color: {delta_color}; font-size: 0.8rem; margin-top: 0.5rem;">{delta}</div>'

    help_html = ""
    if help_text:
        help_html = f'<div style="color: #6b7280; font-size: 0.7rem; margin-top: 0.5rem;">{help_text}</div>'

    st.markdown(f\"\"\"
    <div class="metric-card">
        <div class="metric-label">{title}</div>
        <div class="metric-value">{value}</div>
        {delta_html}
        {help_html}
    </div>
    \"\"\", unsafe_allow_html=True)

def create_section_header(title: str, description: str = None):
    \"\"\"Create a styled section header.\"\"\"
    desc_html = ""
    if description:
        desc_html = f'<p style="color: #9ca3af; margin-top: 0.5rem;">{description}</p>'

    st.markdown(f\"\"\"
    <div class="main-header">
        <h2 style="margin: 0; color: white;">{title}</h2>
        {desc_html}
    </div>
    \"\"\", unsafe_allow_html=True)
""",

        "utils/helpers.py": """# Helper functions for data processing and formatting
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import streamlit as st

def format_percentage(value: float, decimals: int = 2) -> str:
    \"\"\"Format value as percentage.\"\"\"
    return f"{value:.{decimals}%}"

def format_currency(value: float, currency: str = "$", decimals: int = 2) -> str:
    \"\"\"Format value as currency.\"\"\"
    return f"{currency}{value:,.{decimals}f}"

def format_number(value: float, decimals: int = 2) -> str:
    \"\"\"Format number with thousands separators.\"\"\"
    return f"{value:,.{decimals}f}"

def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    \"\"\"Safely divide two numbers, return default if denominator is zero.\"\"\"
    if denominator == 0:
        return default
    return numerator / denominator

def create_portfolio_from_weights(weights: Dict[str, float]) -> Dict[str, Any]:
    \"\"\"Create portfolio dictionary from weights.\"\"\"
    return {
        "assets": list(weights.keys()),
        "weights": list(weights.values()),
        "weight_dict": weights
    }

@st.cache_data
def validate_portfolio_data(data: pd.DataFrame) -> bool:
    \"\"\"Validate portfolio data structure.\"\"\"
    if data is None or data.empty:
        return False

    required_columns = ["Date"]  # Minimum required columns

    for col in required_columns:
        if col not in data.columns:
            return False

    return True

def handle_errors(func):
    \"\"\"Decorator for error handling in Streamlit components.\"\"\"
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            st.error(f"Error in {func.__name__}: {str(e)}")
            return None
    return wrapper

def create_download_button(data: Any, filename: str, mime_type: str = "text/csv"):
    \"\"\"Create download button for data.\"\"\"
    if isinstance(data, pd.DataFrame):
        data = data.to_csv(index=False)

    st.download_button(
        label=f"📥 Download {filename}",
        data=data,
        file_name=filename,
        mime=mime_type
    )
""",

        "utils/data_loader.py": "# Data loading utilities - To be implemented",

        # Assets directory
        "assets/css/custom.css": """/* Wild Market Capital Custom CSS */

:root {
    --primary-color: #3b82f6;
    --secondary-color: #1e40af;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --dark-bg: #1f2937;
    --darker-bg: #111827;
}

/* Custom metric cards */
.metric-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1rem 0;
}

.metric-card {
    flex: 1;
    min-width: 200px;
    background: var(--dark-bg);
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.2s ease;
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Professional chart styling */
.chart-container {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
""",

        # Requirements file
        "requirements.txt": """streamlit>=1.28.0
plotly>=5.17.0
pandas>=1.5.0
numpy>=1.24.0
yfinance>=0.2.0
scipy>=1.10.0
scikit-learn>=1.3.0
""",

        # Config file
        ".streamlit/config.toml": """[theme]
primaryColor = "#3b82f6"
backgroundColor = "#ffffff"
secondaryBackgroundColor = "#f1f5f9"
textColor = "#1f2937"
font = "sans serif"

[server]
enableCORS = false
enableXsrfProtection = false
maxUploadSize = 200

[browser]
gatherUsageStats = false
""",
    }

    # Create files
    for file_path, content in files.items():
        full_path = base_dir / file_path

        # Create parent directories if they don't exist
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Write file content
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Created file: {full_path}")


def create_readme():
    """Create README file with instructions."""

    readme_content = """# Wild Market Capital - Streamlit Portfolio Management App

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   streamlit run app.py
   ```

3. **Access the app:**
   - Open your browser to `http://localhost:8501`

## 📁 Project Structure

```
streamlit_app/
├── app.py                     # Main application entry point
├── services/
│   └── service_manager.py     # Backend integration layer
├── pages/                     # Multi-page application
│   ├── 1_📊_Portfolio_Analysis.py
│   ├── 2_⚡_Portfolio_Creation.py  
│   ├── 3_🎯_Portfolio_Optimization.py
│   ├── 4_🛡️_Risk_Management.py
│   ├── 5_🔮_Scenario_Analysis.py
│   ├── 6_📈_Historical_Analogies.py
│   └── 7_📋_Portfolio_Comparison.py
├── components/                # Reusable UI components
│   ├── ui/                   # UI components
│   ├── charts/               # Chart components  
│   └── metrics/              # Metric components
├── utils/                     # Utility functions
│   ├── styling.py            # Custom styling
│   ├── helpers.py            # Helper functions
│   └── data_loader.py        # Data loading
└── assets/                    # Static assets
    ├── css/
    └── images/
```

## 🔧 Features

- **Portfolio Analysis:** Comprehensive performance and risk metrics
- **Portfolio Creation:** Interactive portfolio builder
- **Portfolio Optimization:** 10+ optimization algorithms
- **Risk Management:** VaR, stress testing, Monte Carlo
- **Scenario Analysis:** Custom scenario modeling
- **Historical Analogies:** Historical context analysis
- **Portfolio Comparison:** Side-by-side comparison

## 🎨 Theme

The app uses Wild Market Capital's custom dark theme with:
- Professional blue color scheme
- Gradient backgrounds
- Interactive hover effects
- Responsive design

## 🔗 Backend Integration

Direct integration with backend services:
- No API calls required
- Cached service instances
- Error handling
- Performance optimized
"""

    with open("streamlit_app/README.md", 'w', encoding='utf-8') as f:
        f.write(readme_content)

    print("✅ Created README.md")


def main():
    """Main setup function."""
    print("🚀 Setting up Streamlit application structure...")
    print("=" * 50)

    # Create directory structure
    create_directory_structure()
    print()

    # Create files
    print("📝 Creating files...")
    create_files()
    print()

    # Create README
    create_readme()
    print()

    print("=" * 50)
    print("✅ Streamlit application structure created successfully!")
    print()
    print("Next steps:")
    print("1. cd streamlit_app")
    print("2. pip install -r requirements.txt")
    print("3. streamlit run app.py")
    print()
    print("🎯 Ready to start building the components!")


if __name__ == "__main__":
    main()