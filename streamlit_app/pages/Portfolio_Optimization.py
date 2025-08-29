"""
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
