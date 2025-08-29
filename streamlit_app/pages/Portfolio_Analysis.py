"""
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
