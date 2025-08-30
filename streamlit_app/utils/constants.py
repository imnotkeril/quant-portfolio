"""
Application constants and configuration for Wild Market Capital.
"""

# Application configuration
APP_CONFIG = {
    "title": "Wild Market Capital",
    "icon": "🎯",
    "tagline": "Professional Investment Portfolio Management",
    "version": "1.0.0",
    "menu_items": {
        "Get Help": "https://github.com/your-repo",
        "Report a bug": "https://github.com/your-repo/issues",
        "About": "Wild Market Capital - Professional Portfolio Management System"
    }
}

# Page configurations
PAGES_CONFIG = {
    "Dashboard": {
        "icon": "📊",
        "title": "Dashboard",
        "description": "Portfolio overview and quick insights"
    },
    "Portfolio_Creation": {
        "icon": "💼",
        "title": "Create Portfolio",
        "description": "Build new investment portfolios"
    },
    "Portfolio_Analysis": {
        "icon": "📈",
        "title": "Portfolio Analysis",
        "description": "Comprehensive analysis with 50+ metrics"
    },
    "Risk_Management": {
        "icon": "🛡️",
        "title": "Risk Management",
        "description": "VaR, stress testing, and risk analysis"
    },
    "Portfolio_Optimization": {
        "icon": "⚖️",
        "title": "Portfolio Optimization",
        "description": "Modern Portfolio Theory and advanced algorithms"
    },
    "Portfolio_Comparison": {
        "icon": "📊",
        "title": "Portfolio Comparison",
        "description": "Side-by-side portfolio benchmarking"
    },
    "Scenario_Analysis": {
        "icon": "🎲",
        "title": "Scenario Analysis",
        "description": "Monte Carlo simulations and scenario modeling"
    },
    "Historical_Analogies": {
        "icon": "📚",
        "title": "Historical Analogies",
        "description": "Historical context and pattern recognition"
    }
}

# Wild Market Capital color scheme (official design system)
COLORS = {
    # Core Brand Colors
    "primary": "#BF9FFB",        # Primary purple accent
    "secondary": "#D3BFFC",      # Light purple (hover state)
    "accent": "#A880FA",         # Active purple state

    # Background Colors
    "background": "#0D1015",     # Main dark background
    "surface": "#1A1D24",        # Card/panel background
    "surface_secondary": "#2A2E39", # Secondary surface
    "surface_light": "#363A47",  # Lighter surface variant

    # Text Colors
    "text_primary": "#FFFFFF",   # Primary white text
    "text_secondary": "#E1E4E8", # Secondary light gray text
    "text_muted": "#8B949E",     # Muted gray text
    "text_disabled": "#6E7681",  # Disabled text
    "text_dark": "#0D1015",      # Dark text for light backgrounds

    # Status Colors
    "positive": "#3FB950",       # Green for positive values
    "negative": "#F85149",       # Red for negative values
    "warning": "#D29922",        # Yellow for warnings
    "info": "#58A6FF",           # Blue for info
    "success": "#3FB950",        # Same as positive
    "danger": "#F85149",         # Same as negative
    "error": "#F85149",          # Same as negative

    # UI Elements
    "borders": "#2A2E39",        # Border color
    "divider": "#363A47",        # Divider lines
    "hover": "#2D3748",          # Hover states
    "disabled": "#4A5568",       # Disabled elements

    # Chart Colors (Wild Market Capital palette)
    "chart_primary": "#BF9FFB",      # Main chart color
    "chart_secondary": "#58A6FF",    # Secondary chart color
    "chart_tertiary": "#3FB950",     # Tertiary chart color
    "chart_background": "#1A1D24",   # Chart background
    "grid_lines": "#2A2E39"          # Chart grid lines
}

# Chart color palette (Wild Market Capital)
CHART_COLORS = [
    "#BF9FFB", "#58A6FF", "#3FB950", "#F85149", "#D29922",
    "#D3BFFC", "#74C0FC", "#52C41A", "#FF7875", "#FFA940",
    "#A880FA", "#91D5FF", "#95DE64", "#FFB6B9", "#FFD666"
]

# Performance chart specific colors
PERFORMANCE_COLORS = {
    "returns": "#58A6FF",        # Blue for returns
    "benchmark": "#3FB950",      # Green for benchmark
    "drawdown": "#F85149",       # Red for drawdown
    "volatility": "#BF9FFB",     # Purple for volatility
    "sharpe": "#D29922"          # Yellow for Sharpe ratio
}

# Risk color mapping
RISK_COLORS = {
    "low": "#3FB950",            # Green for low risk
    "medium": "#D29922",         # Yellow for medium risk
    "high": "#F85149",           # Red for high risk
    "var": "#F85149",            # Red for VaR
    "cvar": "#FF4D4F"            # Darker red for CVaR
}

# Metrics categories for display organization
METRICS_CATEGORIES = {
    "returns": {
        "title": "Returns & Performance",
        "color": COLORS["success"],
        "icon": "📈"
    },
    "risk": {
        "title": "Risk Metrics",
        "color": COLORS["warning"],
        "icon": "🛡️"
    },
    "ratios": {
        "title": "Risk-Adjusted Returns",
        "color": COLORS["primary"],
        "icon": "⚖️"
    },
    "drawdown": {
        "title": "Drawdown Analysis",
        "color": COLORS["danger"],
        "icon": "📉"
    },
    "diversification": {
        "title": "Diversification",
        "color": COLORS["secondary"],
        "icon": "🎯"
    }
}

# Default settings
DEFAULT_SETTINGS = {
    "risk_free_rate": 0.02,  # 2% risk-free rate
    "confidence_level": 0.95,  # 95% confidence for VaR
    "time_horizon": 252,  # 1 year in trading days
    "monte_carlo_simulations": 10000,
    "optimization_method": "max_sharpe",
    "rebalance_frequency": "monthly"
}

# API endpoints (if needed for external data)
API_CONFIG = {
    "timeout": 30,
    "retries": 3,
    "cache_duration": 3600  # 1 hour cache
}

# File formats supported
SUPPORTED_FORMATS = {
    "portfolios": [".json", ".csv"],
    "exports": [".pdf", ".xlsx", ".csv"],
    "images": [".png", ".jpg", ".svg"]
}

# Chart configuration
CHART_CONFIG = {
    "theme": "plotly_dark",
    "default_height": 400,
    "default_width": None,
    "show_legend": True,
    "grid_color": COLORS["grid_lines"],
    "paper_bgcolor": COLORS["chart_background"],
    "plot_bgcolor": COLORS["chart_background"],
    "font_color": COLORS["text_primary"],
    "font_family": "Inter",
    "margin": {
        "l": 50,
        "r": 50,
        "t": 50,
        "b": 50
    }
}