"""
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
