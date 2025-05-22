/**
 * Export all icons
 */

import { ReactComponent as PortfolioIcon } from './portfolio.svg';
import { ReactComponent as ChartLineIcon } from './chart-line.svg';
import { ReactComponent as ChartBarIcon } from './chart-bar.svg';
import { ReactComponent as SettingsIcon } from './settings.svg';
import { ReactComponent as ArrowUpIcon } from './arrow-up.svg';
import { ReactComponent as ArrowDownIcon } from './arrow-down.svg';
import { ReactComponent as RiskIcon } from './risk.svg';
import { ReactComponent as OptimizationIcon } from './optimization.svg';
import { ReactComponent as ScenarioIcon } from './scenario.svg';
import { ReactComponent as HistoryIcon } from './history.svg';
import { ReactComponent as CompareIcon } from './compare.svg';
import { ReactComponent as ReportIcon } from './report.svg';
import { ReactComponent as AddIcon } from './add.svg';
import { ReactComponent as CloseIcon } from './close.svg';
import { ReactComponent as SearchIcon } from './search.svg';
import { ReactComponent as InfoIcon } from './info.svg';

// Export all icons
export {
  PortfolioIcon,
  ChartLineIcon,
  ChartBarIcon,
  SettingsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  RiskIcon,
  OptimizationIcon,
  ScenarioIcon,
  HistoryIcon,
  CompareIcon,
  ReportIcon,
  AddIcon,
  CloseIcon,
  SearchIcon,
  InfoIcon
};

// Map of all icons for dynamic usage
const iconMap = {
  portfolio: PortfolioIcon,
  'chart-line': ChartLineIcon,
  'chart-bar': ChartBarIcon,
  settings: SettingsIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  risk: RiskIcon,
  optimization: OptimizationIcon,
  scenario: ScenarioIcon,
  history: HistoryIcon,
  compare: CompareIcon,
  report: ReportIcon,
  add: AddIcon,
  close: CloseIcon,
  search: SearchIcon,
  info: InfoIcon
};

export default iconMap;