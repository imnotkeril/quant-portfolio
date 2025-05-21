const fs = require('fs');
const path = require('path');

// Корневая директория проекта
const rootDir = path.join(__dirname, 'frontend'); // оставить как есть

// Структура директорий фронтенда согласно ТЗ
const directories = [
  // Публичные статические файлы
  'public',
  'public/images',
  // Исходный код
  'src',
  // Статические ресурсы
  'src/assets',
  'src/assets/fonts',
  'src/assets/fonts/Inter',
  'src/assets/images',
  'src/assets/images/icons',
  'src/assets/styles',
  // Компоненты
  'src/components',
  'src/components/common',
  'src/components/common/Button',
  'src/components/common/Input',
  'src/components/common/Select',
  'src/components/common/Modal',
  'src/components/common/Table',
  'src/components/common/Card',
  'src/components/common/Dropdown',
  'src/components/common/Tabs',
  'src/components/common/Tooltip',
  'src/components/common/Badge',
  'src/components/common/Loader',
  'src/components/common/Alert',
  'src/components/common/Pagination',
  // Компоненты макета
  'src/components/layout',
  'src/components/layout/Sidebar',
  'src/components/layout/Header',
  'src/components/layout/Footer',
  'src/components/layout/PageContainer',
  'src/components/layout/SplitPane',
  // Компоненты графиков
  'src/components/charts',
  'src/components/charts/LineChart',
  'src/components/charts/CandlestickChart',
  'src/components/charts/BarChart',
  'src/components/charts/PieChart',
  'src/components/charts/HeatmapChart',
  'src/components/charts/ScatterChart',
  'src/components/charts/AreaChart',
  'src/components/charts/BoxplotChart',
  'src/components/charts/TreemapChart',
  'src/components/charts/ChartContainer',
  // Компоненты портфелей
  'src/components/portfolio',
  'src/components/portfolio/PortfolioList',
  'src/components/portfolio/PortfolioCard',
  'src/components/portfolio/PortfolioForm',
  'src/components/portfolio/AssetTable',
  'src/components/portfolio/AssetForm',
  'src/components/portfolio/PortfolioSummary',
  'src/components/portfolio/PortfolioHeader',
  'src/components/portfolio/PortfolioFilters',
  // Компоненты аналитики
  'src/components/analytics',
  'src/components/analytics/MetricsTable',
  'src/components/analytics/MetricsCard',
  'src/components/analytics/ReturnsChart',
  'src/components/analytics/PerformancePanel',
  'src/components/analytics/BenchmarkSelector',
  'src/components/analytics/TimeframeSelector',
  'src/components/analytics/StatisticsPanel',
  'src/components/analytics/RollingMetrics',
  // Компоненты оптимизации
  'src/components/optimization',
  'src/components/optimization/OptimizationForm',
  'src/components/optimization/EfficientFrontier',
  'src/components/optimization/WeightsTable',
  'src/components/optimization/OptimizationResults',
  'src/components/optimization/ConstraintsEditor',
  'src/components/optimization/OptimizationComparison',
  // Компоненты управления рисками
  'src/components/risk',
  'src/components/risk/RiskMetricsPanel',
  'src/components/risk/DrawdownChart',
  'src/components/risk/VaRAnalysis',
  'src/components/risk/StressTestPanel',
  'src/components/risk/CorrelationMatrix',
  'src/components/risk/RiskContribution',
  'src/components/risk/MonteCarloChart',
  // Компоненты сценариев
  'src/components/scenarios',
  'src/components/scenarios/ScenarioSelector',
  'src/components/scenarios/ScenarioImpact',
  'src/components/scenarios/ScenarioChain',
  'src/components/scenarios/ScenarioComparison',
  // Компоненты исторического анализа
  'src/components/historical',
  'src/components/historical/HistoricalContext',
  'src/components/historical/HistoricalAnalogies',
  'src/components/historical/TimelineView',
  // Компоненты сравнения портфелей
  'src/components/comparison',
  'src/components/comparison/ComparisonDashboard',
  'src/components/comparison/PortfolioSelector',
  'src/components/comparison/ComparisonTable',
  'src/components/comparison/ComparisonChart',
  'src/components/comparison/DifferentialAnalysis',
  // Компоненты отчетов
  'src/components/reports',
  'src/components/reports/ReportGenerator',
  'src/components/reports/ReportTemplateSelector',
  'src/components/reports/ReportPreview',
  'src/components/reports/ReportHistory',
  'src/components/reports/ScheduledReports',
  // Страницы
  'src/pages',
  'src/pages/Dashboard',
  'src/pages/PortfolioCreation',
  'src/pages/PortfolioCreation/steps',
  'src/pages/PortfolioAnalysis',
  'src/pages/PortfolioAnalysis/panels',
  'src/pages/PortfolioOptimization',
  'src/pages/RiskManagement',
  'src/pages/ScenarioAnalysis',
  'src/pages/HistoricalAnalogies',
  'src/pages/PortfolioComparison',
  'src/pages/ReportGeneration',
  // API сервисы
  'src/services',
  'src/services/api',
  'src/services/portfolio',
  'src/services/analytics',
  'src/services/optimization',
  'src/services/risk',
  'src/services/scenarios',
  'src/services/historical',
  'src/services/comparison',
  'src/services/reports',
  // Управление состоянием
  'src/store',
  'src/store/portfolio',
  'src/store/analytics',
  'src/store/optimization',
  'src/store/risk',
  'src/store/scenarios',
  'src/store/historical',
  'src/store/comparison',
  'src/store/reports',
  // Кастомные хуки
  'src/hooks',
  // Контексты
  'src/contexts',
  // Утилиты
  'src/utils',
  // Типы
  'src/types',
  // Константы
  'src/constants',
];

// Список файлов для создания
const files = [
  // Корневые конфигурационные файлы
  'package.json',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  '.eslintrc.js',
  '.prettierrc',
  'README.md',

  // Публичные файлы
  'public/index.html',
  'public/manifest.json',
  'public/robots.txt',
  'public/favicon.ico',

  // Основные файлы приложения
  'src/index.tsx',
  'src/App.tsx',
  'src/AppRoutes.tsx',
  'src/reportWebVitals.ts',

  // Стили
  'src/assets/styles/global.css',
  'src/assets/styles/reset.css',
  'src/assets/styles/variables.css',

  // Константы
  'src/constants/routes.ts',
  'src/constants/colors.ts',
  'src/constants/typography.ts',
  'src/constants/theme.ts',
  'src/constants/api.ts',
  'src/constants/defaults.ts',

  // Типы
  'src/types/portfolio.ts',
  'src/types/analytics.ts',
  'src/types/optimization.ts',
  'src/types/risk.ts',
  'src/types/scenarios.ts',
  'src/types/historical.ts',
  'src/types/comparison.ts',
  'src/types/reports.ts',
  'src/types/common.ts',

  // Контексты
  'src/contexts/ThemeContext.tsx',
  'src/contexts/LayoutContext.tsx',
  'src/contexts/NotificationContext.tsx',

  // Хуки
  'src/hooks/usePortfolios.ts',
  'src/hooks/useAnalytics.ts',
  'src/hooks/useOptimization.ts',
  'src/hooks/useRisk.ts',
  'src/hooks/useWindowSize.ts',
  'src/hooks/useLocalStorage.ts',
  'src/hooks/useDebounce.ts',
  'src/hooks/useClickOutside.ts',

  // Утилиты
  'src/utils/formatters.ts',
  'src/utils/validators.ts',
  'src/utils/calculations.ts',
  'src/utils/date.ts',
  'src/utils/color.ts',
  'src/utils/array.ts',
  'src/utils/object.ts',
  'src/utils/string.ts',
  'src/utils/math.ts',

  // Сервисы API
  'src/services/api/client.ts',
  'src/services/api/endpoints.ts',
  'src/services/api/interceptors.ts',

  // Сервисы по модулям
  'src/services/portfolio/portfolioService.ts',
  'src/services/analytics/analyticsService.ts',
  'src/services/optimization/optimizationService.ts',
  'src/services/risk/riskService.ts',
  'src/services/scenarios/scenarioService.ts',
  'src/services/historical/historicalService.ts',
  'src/services/comparison/comparisonService.ts',
  'src/services/reports/reportService.ts',

  // Store
  'src/store/index.ts',
  'src/store/rootReducer.ts',

  // Store модули
  'src/store/portfolio/types.ts',
  'src/store/portfolio/actions.ts',
  'src/store/portfolio/reducer.ts',
  'src/store/portfolio/selectors.ts',
  'src/store/portfolio/sagas.ts',

  'src/store/analytics/types.ts',
  'src/store/analytics/actions.ts',
  'src/store/analytics/reducer.ts',
  'src/store/analytics/selectors.ts',
  'src/store/analytics/sagas.ts',

  'src/store/optimization/types.ts',
  'src/store/optimization/actions.ts',
  'src/store/optimization/reducer.ts',
  'src/store/optimization/selectors.ts',
  'src/store/optimization/sagas.ts',

  'src/store/risk/types.ts',
  'src/store/risk/actions.ts',
  'src/store/risk/reducer.ts',
  'src/store/risk/selectors.ts',
  'src/store/risk/sagas.ts',

  'src/store/scenarios/types.ts',
  'src/store/scenarios/actions.ts',
  'src/store/scenarios/reducer.ts',
  'src/store/scenarios/selectors.ts',
  'src/store/scenarios/sagas.ts',

  'src/store/historical/types.ts',
  'src/store/historical/actions.ts',
  'src/store/historical/reducer.ts',
  'src/store/historical/selectors.ts',
  'src/store/historical/sagas.ts',

  'src/store/comparison/types.ts',
  'src/store/comparison/actions.ts',
  'src/store/comparison/reducer.ts',
  'src/store/comparison/selectors.ts',
  'src/store/comparison/sagas.ts',

  'src/store/reports/types.ts',
  'src/store/reports/actions.ts',
  'src/store/reports/reducer.ts',
  'src/store/reports/selectors.ts',
  'src/store/reports/sagas.ts',

  // Компоненты: layout
  'src/components/layout/PageContainer/index.tsx',
  'src/components/layout/PageContainer/styles.module.css',
  'src/components/layout/Sidebar/index.tsx',
  'src/components/layout/Sidebar/styles.module.css',
  'src/components/layout/Header/index.tsx',
  'src/components/layout/Header/styles.module.css',
  'src/components/layout/Footer/index.tsx',
  'src/components/layout/Footer/styles.module.css',

  // Компоненты: common
  'src/components/common/Button/Button.tsx',
  'src/components/common/Button/Button.module.css',
  'src/components/common/Button/index.ts',
  'src/components/common/Input/Input.tsx',
  'src/components/common/Input/Input.module.css',
  'src/components/common/Input/index.ts',
  'src/components/common/Select/Select.tsx',
  'src/components/common/Select/Select.module.css',
  'src/components/common/Select/index.ts',
  'src/components/common/Table/Table.tsx',
  'src/components/common/Table/Table.module.css',
  'src/components/common/Table/index.ts',
  'src/components/common/Card/Card.tsx',
  'src/components/common/Card/Card.module.css',
  'src/components/common/Card/index.ts',

  // Компоненты: charts
  'src/components/charts/LineChart/LineChart.tsx',
  'src/components/charts/LineChart/LineChart.module.css',
  'src/components/charts/LineChart/index.ts',
  'src/components/charts/CandlestickChart/CandlestickChart.tsx',
  'src/components/charts/CandlestickChart/CandlestickChart.module.css',
  'src/components/charts/CandlestickChart/index.ts',
  'src/components/charts/BarChart/BarChart.tsx',
  'src/components/charts/BarChart/BarChart.module.css',
  'src/components/charts/BarChart/index.ts',
  'src/components/charts/PieChart/PieChart.tsx',
  'src/components/charts/PieChart/PieChart.module.css',
  'src/components/charts/PieChart/index.ts',

  // Компоненты: portfolio
  'src/components/portfolio/PortfolioList/PortfolioList.tsx',
  'src/components/portfolio/PortfolioList/PortfolioList.module.css',
  'src/components/portfolio/PortfolioList/index.ts',
  'src/components/portfolio/PortfolioCard/PortfolioCard.tsx',
  'src/components/portfolio/PortfolioCard/PortfolioCard.module.css',
  'src/components/portfolio/PortfolioCard/index.ts',
  'src/components/portfolio/PortfolioForm/PortfolioForm.tsx',
  'src/components/portfolio/PortfolioForm/PortfolioForm.module.css',
  'src/components/portfolio/PortfolioForm/index.ts',
  'src/components/portfolio/AssetTable/AssetTable.tsx',
  'src/components/portfolio/AssetTable/AssetTable.module.css',
  'src/components/portfolio/AssetTable/index.ts',

  // Страницы
  'src/pages/Dashboard/index.tsx',
  'src/pages/Dashboard/styles.module.css',
  'src/pages/PortfolioCreation/index.tsx',
  'src/pages/PortfolioCreation/styles.module.css',
  'src/pages/PortfolioAnalysis/index.tsx',
  'src/pages/PortfolioAnalysis/styles.module.css',
  'src/pages/PortfolioOptimization/index.tsx',
  'src/pages/PortfolioOptimization/styles.module.css',
  'src/pages/RiskManagement/index.tsx',
  'src/pages/RiskManagement/styles.module.css',
  'src/pages/ScenarioAnalysis/index.tsx',
  'src/pages/ScenarioAnalysis/styles.module.css',
  'src/pages/HistoricalAnalogies/index.tsx',
  'src/pages/HistoricalAnalogies/styles.module.css',
  'src/pages/PortfolioComparison/index.tsx',
  'src/pages/PortfolioComparison/styles.module.css',
  'src/pages/ReportGeneration/index.tsx',
  'src/pages/ReportGeneration/styles.module.css',
];

// Создание директорий
function createDirectories() {
  console.log('Creating directories...');

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }

  directories.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

// Создание пустых файлов
function createEmptyFiles() {
  console.log('Creating empty files...');

  files.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      // Создаем директорию для файла, если она еще не существует
      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Создаем пустой файл
      fs.writeFileSync(filePath, '');
      console.log(`Created file: ${file}`);
    }
  });
}

// Запуск создания структуры
function init() {
  console.log('Initializing frontend project structure...');
  createDirectories();
  createEmptyFiles();
  console.log('Frontend project structure created successfully!');
}

init();