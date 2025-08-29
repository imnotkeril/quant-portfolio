"""
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
