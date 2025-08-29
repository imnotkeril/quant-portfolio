"""
Wild Market Capital custom CSS styling for Streamlit.
Professional dark theme with modern design elements.
"""
import streamlit as st
from utils.constants import COLORS

def apply_custom_css():
    """Apply Wild Market Capital custom CSS styling."""

    css = f"""
    <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Root CSS Variables - Wild Market Capital Official */
    :root {{
        /* Brand Colors */
        --primary-color: {COLORS["primary"]};
        --secondary-color: {COLORS["secondary"]};
        --accent-color: {COLORS["accent"]};
        
        /* Background Colors */
        --background-color: {COLORS["background"]};
        --surface-color: {COLORS["surface"]};
        --surface-secondary-color: {COLORS["surface_secondary"]};
        --surface-light-color: {COLORS["surface_light"]};
        
        /* Text Colors */
        --text-primary: {COLORS["text_primary"]};
        --text-secondary: {COLORS["text_secondary"]};
        --text-muted: {COLORS["text_muted"]};
        --text-disabled: {COLORS["text_disabled"]};
        
        /* Status Colors */
        --positive-color: {COLORS["positive"]};
        --negative-color: {COLORS["negative"]};
        --warning-color: {COLORS["warning"]};
        --info-color: {COLORS["info"]};
        
        /* UI Elements */
        --border-color: {COLORS["borders"]};
        --divider-color: {COLORS["divider"]};
        --hover-color: {COLORS["hover"]};
        
        /* Design System */
        --border-radius: 8px;
        --border-radius-lg: 12px;
        --border-radius-sm: 6px;
        --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
        --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
        --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
        --transition: all 0.2s ease;
        --spacing-xs: 0.25rem;
        --spacing-sm: 0.5rem;
        --spacing-md: 1rem;
        --spacing-lg: 1.5rem;
        --spacing-xl: 2rem;
    }}
    
    /* Global App Styling */
    .main {{
        padding: var(--spacing-lg) var(--spacing-md);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: linear-gradient(135deg, var(--background-color) 0%, #0f1419 100%);
        min-height: 100vh;
        color: var(--text-primary);
    }}
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {{
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }}
    
    h1 {{
        font-size: 2.25rem;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
    }}
    
    h2 {{
        font-size: 1.875rem;
        color: var(--text-primary);
    }}
    
    h3 {{
        font-size: 1.5rem;
        color: var(--primary-color);
        font-weight: 600;
    }}
    
    p, .stMarkdown {{
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        color: var(--text-secondary);
    }}
    
    /* Buttons - Wild Market Capital Style */
    .stButton > button {{
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
        color: var(--text-dark);
        border: none;
        border-radius: var(--border-radius);
        padding: var(--spacing-sm) var(--spacing-lg);
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        transition: var(--transition);
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        font-size: 0.875rem;
    }}
    
    .stButton > button:hover {{
        background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }}
    
    .stButton > button:active {{
        transform: translateY(0);
        box-shadow: var(--shadow-sm);
    }}
    
    /* Primary buttons */
    .stButton > button[kind="primary"] {{
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
        box-shadow: 0 0 0 1px var(--primary-color), var(--shadow-sm);
    }}
    
    /* Sidebar Styling */
    .css-1d391kg {{
        background: linear-gradient(180deg, var(--background-color) 0%, #0a0d11 100%);
        border-right: 1px solid var(--border-color);
    }}
    
    .sidebar .sidebar-content {{
        padding: var(--spacing-md);
    }}
    
    /* Metrics Cards - Enhanced Wild Market Capital Style */
    .metric-card {{
        background: linear-gradient(135deg, var(--surface-color) 0%, var(--surface-secondary-color) 100%);
        padding: var(--spacing-lg);
        border-radius: var(--border-radius-lg);
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-md);
        transition: var(--transition);
        margin-bottom: var(--spacing-md);
        position: relative;
        overflow: hidden;
    }}
    
    .metric-card::before {{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    }}
    
    .metric-card:hover {{
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-color);
    }}
    
    .metric-title {{
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: var(--spacing-sm);
    }}
    
    .metric-value {{
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: var(--spacing-xs);
        font-family: 'Inter', monospace;
    }}
    
    .metric-delta {{
        font-size: 0.875rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }}
    
    .metric-delta.positive {{
        color: var(--positive-color);
    }}
    
    .metric-delta.negative {{
        color: var(--negative-color);
    }}
    
    .metric-delta.neutral {{
        color: var(--text-muted);
    }}
    
    /* Info Boxes and Alerts */
    .stAlert {{
        border-radius: var(--border-radius);
        border: none;
        box-shadow: var(--shadow-sm);
    }}
    
    .stInfo {{
        background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(88, 166, 255, 0.05));
        border-left: 4px solid var(--info-color);
    }}
    
    .stSuccess {{
        background: linear-gradient(135deg, rgba(63, 185, 80, 0.1), rgba(63, 185, 80, 0.05));
        border-left: 4px solid var(--positive-color);
    }}
    
    .stWarning {{
        background: linear-gradient(135deg, rgba(210, 153, 34, 0.1), rgba(210, 153, 34, 0.05));
        border-left: 4px solid var(--warning-color);
    }}
    
    .stError {{
        background: linear-gradient(135deg, rgba(248, 81, 73, 0.1), rgba(248, 81, 73, 0.05));
        border-left: 4px solid var(--negative-color);
    }}
    
    /* Custom Components */
    .portfolio-summary {{
        background: var(--surface-color);
        padding: var(--spacing-xl);
        border-radius: var(--border-radius-lg);
        margin: var(--spacing-lg) 0;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-md);
    }}
    
    .performance-grid {{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-lg);
        margin: var(--spacing-xl) 0;
    }}
    
    .analytics-section {{
        background: linear-gradient(135deg, var(--surface-color) 0%, var(--surface-secondary-color) 100%);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-xl);
        margin: var(--spacing-md) 0;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
    }}
    
    .analytics-section h3 {{
        margin-bottom: var(--spacing-md);
    }}
    
    .analytics-section h4 {{
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
    }}
    
    .analytics-section ul {{
        color: var(--text-secondary);
        line-height: 1.6;
    }}
    
    .analytics-section li {{
        margin-bottom: var(--spacing-xs);
    }}
    
    /* Charts and Plotly */
    .plotly-chart {{
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        background: var(--surface-color);
        padding: var(--spacing-md);
        margin: var(--spacing-md) 0;
        border: 1px solid var(--border-color);
    }}
    
    /* Data Tables */
    .stDataFrame {{
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border-color);
    }}
    
    .stDataFrame table {{
        background: var(--surface-color);
        color: var(--text-primary);
    }}
    
    .stDataFrame th {{
        background: var(--surface-secondary-color) !important;
        color: var(--text-primary) !important;
        font-weight: 600;
    }}
    
    .stDataFrame td {{
        background: var(--surface-color) !important;
        color: var(--text-secondary) !important;
    }}
    
    /* Loading Spinner */
    .stSpinner {{
        color: var(--primary-color);
    }}
    
    /* Input Fields */
    .stSelectbox > div > div {{
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        color: var(--text-primary);
    }}
    
    .stTextInput > div > div > input {{
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        color: var(--text-primary);
    }}
    
    .stNumberInput > div > div > input {{
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        color: var(--text-primary);
    }}
    
    /* Hero section */
    .hero-section {{
        text-align: center;
        padding: var(--spacing-xl) var(--spacing-lg);
        background: linear-gradient(135deg, var(--surface-color) 0%, var(--surface-secondary-color) 100%);
        border-radius: var(--border-radius-lg);
        margin: var(--spacing-xl) 0;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;
    }}
    
    .hero-section::before {{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 50%, rgba(191, 159, 251, 0.05) 0%, transparent 70%);
        pointer-events: none;
    }}
    
    /* Navigation buttons in sidebar */
    .stSidebar .stButton > button {{
        background: var(--surface-color);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        width: 100%;
        text-align: left;
        margin-bottom: var(--spacing-xs);
    }}
    
    .stSidebar .stButton > button:hover {{
        background: var(--surface-light-color);
        border-color: var(--primary-color);
        color: var(--primary-color);
    }}
    
    /* Responsive design */
    @media (max-width: 768px) {{
        .main {{
            padding: var(--spacing-md) var(--spacing-sm);
        }}
        
        .performance-grid {{
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
        }}
        
        h1 {{
            font-size: 2rem;
        }}
        
        .metric-card {{
            padding: var(--spacing-md);
        }}
        
        .metric-value {{
            font-size: 1.5rem;
        }}
    }}
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {{
        width: 6px;
    }}
    
    ::-webkit-scrollbar-track {{
        background: var(--background-color);
    }}
    
    ::-webkit-scrollbar-thumb {{
        background: var(--border-color);
        border-radius: 3px;
    }}
    
    ::-webkit-scrollbar-thumb:hover {{
        background: var(--primary-color);
    }}
    </style>
    """

    st.markdown(css, unsafe_allow_html=True)

def get_metric_card_html(title: str, value: str, delta: str = None, delta_color: str = "neutral") -> str:
    """
    Generate HTML for a custom metric card.

    Args:
        title: Metric title
        value: Metric value
        delta: Optional delta value
        delta_color: Color for delta (positive, negative, neutral)

    Returns:
        HTML string for metric card
    """
    delta_html = ""
    if delta:
        delta_class = f"metric-delta {delta_color}"
        delta_html = f'<div class="{delta_class}">{delta}</div>'

    return f"""
    <div class="metric-card">
        <div class="metric-title">{title}</div>
        <div class="metric-value">{value}</div>
        {delta_html}
    </div>
    """

def create_section_header(title: str, icon: str = "", description: str = "") -> None:
    """Create a styled section header."""
    header_html = f"""
    <div style="margin: 2rem 0 1rem 0;">
        <h2 style="color: var(--primary-color); margin-bottom: 0.5rem;">
            {icon} {title}
        </h2>
        {f'<p style="color: var(--text-secondary); margin-bottom: 1rem;">{description}</p>' if description else ''}
    </div>
    """
    st.markdown(header_html, unsafe_allow_html=True)