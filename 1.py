import os
from pathlib import Path


def create_structure():
    # Define project root
    project_root = Path("")

    # Create root directory if it doesn't exist
    project_root.mkdir(exist_ok=True)

    # Create backend directory structure
    backend_dir = project_root / "backend"
    backend_dir.mkdir(exist_ok=True)

    # Create app directory and its subdirectories
    app_dir = backend_dir / "app"
    app_dir.mkdir(exist_ok=True)

    # Create empty main.py and config.py
    (app_dir / "main.py").touch()
    (app_dir / "config.py").touch()

    # Core directory and its subdirectories
    core_dir = app_dir / "core"
    core_dir.mkdir(exist_ok=True)

    # Create domain directory and files
    domain_dir = core_dir / "domain"
    domain_dir.mkdir(exist_ok=True)
    domain_files = [
        "portfolio.py", "asset.py", "metrics.py", "risk.py",
        "optimization.py", "scenario.py", "historical.py", "report.py"
    ]

    # Create __init__.py in each directory to make it a proper package
    (domain_dir / "__init__.py").touch()
    for file in domain_files:
        (domain_dir / file).touch()

    # Create services directory and files
    services_dir = core_dir / "services"
    services_dir.mkdir(exist_ok=True)
    (services_dir / "__init__.py").touch()
    service_files = [
        "analytics.py", "enhanced_analytics.py", "optimization.py",
        "advanced_optimization.py", "risk_management.py", "monte_carlo.py",
        "time_series.py", "diversification.py", "scenario_service.py",
        "historical_service.py", "portfolio_comparison.py", "report_service.py"
    ]
    for file in service_files:
        (services_dir / file).touch()

    # Create interfaces directory and files
    interfaces_dir = core_dir / "interfaces"
    interfaces_dir.mkdir(exist_ok=True)
    (interfaces_dir / "__init__.py").touch()
    interface_files = [
        "data_provider.py", "storage_provider.py", "cache_provider.py",
        "report_generator.py", "notification_provider.py"
    ]
    for file in interface_files:
        (interfaces_dir / file).touch()

    # Create infrastructure directory and its subdirectories
    infrastructure_dir = app_dir / "infrastructure"
    infrastructure_dir.mkdir(exist_ok=True)
    (infrastructure_dir / "__init__.py").touch()

    # Data directory
    data_dir = infrastructure_dir / "data"
    data_dir.mkdir(exist_ok=True)
    (data_dir / "__init__.py").touch()
    data_files = [
        "data_fetcher.py", "portfolio_manager.py", "market_data_provider.py",
        "yahoo_finance_provider.py", "alpha_vantage_provider.py"
    ]
    for file in data_files:
        (data_dir / file).touch()

    # Storage directory
    storage_dir = infrastructure_dir / "storage"
    storage_dir.mkdir(exist_ok=True)
    (storage_dir / "__init__.py").touch()
    storage_files = ["file_storage.py", "json_storage.py", "pickle_storage.py"]
    for file in storage_files:
        (storage_dir / file).touch()

    # Cache directory
    cache_dir = infrastructure_dir / "cache"
    cache_dir.mkdir(exist_ok=True)
    (cache_dir / "__init__.py").touch()
    cache_files = ["memory_cache.py", "file_cache.py"]
    for file in cache_files:
        (cache_dir / file).touch()

    # Reports directory
    reports_dir = infrastructure_dir / "reports"
    reports_dir.mkdir(exist_ok=True)
    (reports_dir / "__init__.py").touch()
    report_files = [
        "template_engine.py", "pdf_generator.py",
        "html_generator.py", "excel_generator.py"
    ]
    for file in report_files:
        (reports_dir / file).touch()

    # API directory
    api_dir = app_dir / "api"
    api_dir.mkdir(exist_ok=True)
    (api_dir / "__init__.py").touch()
    (api_dir / "dependencies.py").touch()
    (api_dir / "middleware.py").touch()

    # Endpoints directory
    endpoints_dir = api_dir / "endpoints"
    endpoints_dir.mkdir(exist_ok=True)
    (endpoints_dir / "__init__.py").touch()
    endpoint_files = [
        "portfolios.py", "assets.py", "analytics.py", "enhanced_analytics.py",
        "optimization.py", "advanced_optimization.py", "risk.py", "scenarios.py",
        "historical.py", "comparison.py", "reports.py", "system.py"
    ]
    for file in endpoint_files:
        (endpoints_dir / file).touch()

    # Schemas directory
    schemas_dir = app_dir / "schemas"
    schemas_dir.mkdir(exist_ok=True)
    (schemas_dir / "__init__.py").touch()
    schema_files = [
        "portfolio.py", "asset.py", "analytics.py", "optimization.py",
        "risk.py", "scenario.py", "historical.py", "comparison.py",
        "report.py", "common.py"
    ]
    for file in schema_files:
        (schemas_dir / file).touch()

    # Utils directory
    utils_dir = app_dir / "utils"
    utils_dir.mkdir(exist_ok=True)
    (utils_dir / "__init__.py").touch()
    utils_files = [
        "formatters.py", "validators.py", "calculations.py", "date_utils.py",
        "financial_utils.py", "statistical_utils.py", "file_utils.py", "logging_utils.py"
    ]
    for file in utils_files:
        (utils_dir / file).touch()

    # Tests directory
    tests_dir = backend_dir / "tests"
    tests_dir.mkdir(exist_ok=True)
    (tests_dir / "conftest.py").touch()

    # Unit tests
    unit_dir = tests_dir / "unit"
    unit_dir.mkdir(exist_ok=True)
    (unit_dir / "__init__.py").touch()
    unit_subdirs = ["domain", "services", "infrastructure", "utils"]
    for subdir in unit_subdirs:
        subdir_path = unit_dir / subdir
        subdir_path.mkdir(exist_ok=True)
        (subdir_path / "__init__.py").touch()

    # Integration tests
    integration_dir = tests_dir / "integration"
    integration_dir.mkdir(exist_ok=True)
    (integration_dir / "__init__.py").touch()
    integration_subdirs = ["api", "services", "infrastructure"]
    for subdir in integration_subdirs:
        subdir_path = integration_dir / subdir
        subdir_path.mkdir(exist_ok=True)
        (subdir_path / "__init__.py").touch()

    # Test data directory
    test_data_dir = tests_dir / "test_data"
    test_data_dir.mkdir(exist_ok=True)

    # Templates directory
    templates_dir = backend_dir / "templates"
    templates_dir.mkdir(exist_ok=True)
    template_subdirs = ["pdf", "html"]
    for subdir in template_subdirs:
        (templates_dir / subdir).mkdir(exist_ok=True)

    # Data directory for backend
    backend_data_dir = backend_dir / "data"
    backend_data_dir.mkdir(exist_ok=True)
    backend_data_subdirs = ["cache", "portfolios", "reports"]
    for subdir in backend_data_subdirs:
        (backend_data_dir / subdir).mkdir(exist_ok=True)

    # Docker directory
    docker_dir = backend_dir / "docker"
    docker_dir.mkdir(exist_ok=True)
    (docker_dir / "Dockerfile").touch()
    (docker_dir / "docker-compose.yml").touch()

    # Backend project files
    (backend_dir / "pyproject.toml").touch()
    (backend_dir / "requirements.txt").touch()
    (backend_dir / "README.md").touch()

    # Create frontend directory structure
    frontend_dir = project_root / "frontend"
    frontend_dir.mkdir(exist_ok=True)

    # Public directory
    public_dir = frontend_dir / "public"
    public_dir.mkdir(exist_ok=True)
    public_files = ["favicon.ico", "index.html", "manifest.json", "robots.txt"]
    for file in public_files:
        (public_dir / file).touch()

    # Source directory
    src_dir = frontend_dir / "src"
    src_dir.mkdir(exist_ok=True)

    # Assets directory
    assets_dir = src_dir / "assets"
    assets_dir.mkdir(exist_ok=True)

    # Fonts directory
    fonts_dir = assets_dir / "fonts"
    fonts_dir.mkdir(exist_ok=True)
    font_files = [
        "Inter-Bold.woff2", "Inter-SemiBold.woff2", "Inter-Medium.woff2",
        "Inter-Regular.woff2", "Inter-Light.woff2"
    ]
    for file in font_files:
        (fonts_dir / file).touch()

    # Images directory
    images_dir = assets_dir / "images"
    images_dir.mkdir(exist_ok=True)
    (images_dir / "logo.svg").touch()

    # Icons directory
    icons_dir = images_dir / "icons"
    icons_dir.mkdir(exist_ok=True)
    icon_files = [
        "arrow-up.svg", "arrow-down.svg", "chart-line.svg",
        "chart-bar.svg", "portfolio.svg", "settings.svg"
    ]
    for file in icon_files:
        (icons_dir / file).touch()

    # Styles directory
    styles_dir = assets_dir / "styles"
    styles_dir.mkdir(exist_ok=True)
    style_files = ["global.css", "reset.css", "variables.css"]
    for file in style_files:
        (styles_dir / file).touch()

    # Components directory
    components_dir = src_dir / "components"
    components_dir.mkdir(exist_ok=True)

    # Common components
    common_dir = components_dir / "common"
    common_dir.mkdir(exist_ok=True)
    common_components = [
        "Button", "Input", "Select", "Modal", "Table", "Card", "Dropdown",
        "Tabs", "Tooltip", "Badge", "Loader", "Alert", "Pagination"
    ]

    for component in common_components:
        component_dir = common_dir / component
        component_dir.mkdir(exist_ok=True)
        (component_dir / f"{component}.tsx").touch()
        (component_dir / f"{component}.module.css").touch()
        (component_dir / "index.ts").touch()

    # Other component categories
    component_categories = [
        "layout", "charts", "portfolio", "analytics", "optimization",
        "risk", "scenarios", "historical", "comparison", "reports"
    ]

    for category in component_categories:
        category_dir = components_dir / category
        category_dir.mkdir(exist_ok=True)

    # Pages directory
    pages_dir = src_dir / "pages"
    pages_dir.mkdir(exist_ok=True)
    page_types = [
        "Dashboard", "PortfolioCreation", "PortfolioAnalysis", "PortfolioOptimization",
        "RiskManagement", "ScenarioAnalysis", "HistoricalAnalogies",
        "PortfolioComparison", "ReportGeneration"
    ]

    for page in page_types:
        page_dir = pages_dir / page
        page_dir.mkdir(exist_ok=True)
        (page_dir / "index.tsx").touch()

        # Additional files for Dashboard page as an example of page structure
        if page == "Dashboard":
            (page_dir / "DashboardWidget.tsx").touch()
            (page_dir / "DashboardLayout.tsx").touch()
            (page_dir / "styles.module.css").touch()

    # Services directory
    services_dir = src_dir / "services"
    services_dir.mkdir(exist_ok=True)

    # API client directory
    api_client_dir = services_dir / "api"
    api_client_dir.mkdir(exist_ok=True)
    (api_client_dir / "index.ts").touch()

    # Service categories
    service_categories = [
        "portfolio", "analytics", "optimization", "risk", "scenarios",
        "historical", "comparison", "reports"
    ]

    for category in service_categories:
        category_dir = services_dir / category
        category_dir.mkdir(exist_ok=True)
        (category_dir / f"{category}Service.ts").touch()

    # Store directory
    store_dir = src_dir / "store"
    store_dir.mkdir(exist_ok=True)
    (store_dir / "index.ts").touch()
    (store_dir / "rootReducer.ts").touch()

    # Store slices
    store_slices = [
        "portfolio", "analytics", "optimization", "risk", "scenarios",
        "historical", "comparison", "reports"
    ]

    for slice_name in store_slices:
        slice_dir = store_dir / slice_name
        slice_dir.mkdir(exist_ok=True)
        (slice_dir / "types.ts").touch()
        (slice_dir / "actions.ts").touch()
        (slice_dir / "reducer.ts").touch()
        (slice_dir / "selectors.ts").touch()
        (slice_dir / "sagas.ts").touch()

    # Hooks directory
    hooks_dir = src_dir / "hooks"
    hooks_dir.mkdir(exist_ok=True)
    hook_files = [
        "usePortfolios.ts", "useAnalytics.ts", "useOptimization.ts", "useRisk.ts",
        "useWindowSize.ts", "useLocalStorage.ts", "useDebounce.ts", "useClickOutside.ts"
    ]
    for file in hook_files:
        (hooks_dir / file).touch()

    # Contexts directory
    contexts_dir = src_dir / "contexts"
    contexts_dir.mkdir(exist_ok=True)
    context_files = ["ThemeContext.tsx", "LayoutContext.tsx", "NotificationContext.tsx"]
    for file in context_files:
        (contexts_dir / file).touch()

    # Utils directory for frontend
    utils_dir = src_dir / "utils"
    utils_dir.mkdir(exist_ok=True)
    util_files = [
        "formatters.ts", "validators.ts", "calculations.ts", "date.ts",
        "color.ts", "array.ts", "object.ts", "string.ts", "math.ts"
    ]
    for file in util_files:
        (utils_dir / file).touch()

    # Types directory
    types_dir = src_dir / "types"
    types_dir.mkdir(exist_ok=True)
    type_files = [
        "portfolio.ts", "analytics.ts", "optimization.ts", "risk.ts",
        "scenarios.ts", "historical.ts", "comparison.ts", "reports.ts", "common.ts"
    ]
    for file in type_files:
        (types_dir / file).touch()

    # Constants directory
    constants_dir = src_dir / "constants"
    constants_dir.mkdir(exist_ok=True)
    constant_files = [
        "routes.ts", "colors.ts", "typography.ts", "theme.ts",
        "api.ts", "defaults.ts"
    ]
    for file in constant_files:
        (constants_dir / file).touch()

    # Frontend main files
    (src_dir / "App.tsx").touch()
    (src_dir / "AppRoutes.tsx").touch()
    (src_dir / "index.tsx").touch()

    # Frontend project files
    (frontend_dir / "package.json").touch()
    (frontend_dir / "tsconfig.json").touch()
    (frontend_dir / "tailwind.config.js").touch()
    (frontend_dir / "postcss.config.js").touch()
    (frontend_dir / ".eslintrc.js").touch()
    (frontend_dir / ".prettierrc").touch()
    (frontend_dir / "README.md").touch()

    print("Project structure created successfully!")


if __name__ == "__main__":
    create_structure()