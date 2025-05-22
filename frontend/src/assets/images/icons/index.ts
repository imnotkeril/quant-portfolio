/**
 * Export all icons
 */

// Import SVG files as URLs
import portfolioIcon from './portfolio.svg';
import chartLineIcon from './chart-line.svg';
import chartBarIcon from './chart-bar.svg';
import settingsIcon from './settings.svg';
import arrowUpIcon from './arrow-up.svg';
import arrowDownIcon from './arrow-down.svg';
import riskIcon from './risk.svg';
import optimizationIcon from './optimization.svg';
import scenarioIcon from './scenario.svg';
import historyIcon from './history.svg';
import compareIcon from './compare.svg';
import reportIcon from './report.svg';
import addIcon from './add.svg';
import closeIcon from './close.svg';
import searchIcon from './search.svg';
import infoIcon from './info.svg';

// Export all icons as URLs
export {
  portfolioIcon,
  chartLineIcon,
  chartBarIcon,
  settingsIcon,
  arrowUpIcon,
  arrowDownIcon,
  riskIcon,
  optimizationIcon,
  scenarioIcon,
  historyIcon,
  compareIcon,
  reportIcon,
  addIcon,
  closeIcon,
  searchIcon,
  infoIcon
};

// Map of all icons for dynamic usage
const iconMap = {
  portfolio: portfolioIcon,
  'chart-line': chartLineIcon,
  'chart-bar': chartBarIcon,
  settings: settingsIcon,
  'arrow-up': arrowUpIcon,
  'arrow-down': arrowDownIcon,
  risk: riskIcon,
  optimization: optimizationIcon,
  scenario: scenarioIcon,
  history: historyIcon,
  compare: compareIcon,
  report: reportIcon,
  add: addIcon,
  close: closeIcon,
  search: searchIcon,
  info: infoIcon
};

export default iconMap;

// Icon names type for TypeScript
export type IconName = keyof typeof iconMap;

// Helper function to get icon URL by name
export const getIconUrl = (name: IconName): string => {
  return iconMap[name];
};