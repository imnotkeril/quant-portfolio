# Investment Portfolio Management System Frontend

This project is a React frontend for the Investment Portfolio Management System. It provides a modern, responsive user interface for managing and analyzing investment portfolios.

## Features

- Portfolio creation and management
- Portfolio analytics and performance metrics
- Portfolio optimization
- Risk management and analysis
- Scenario modeling
- Historical analysis
- Portfolio comparison
- Report generation

## Tech Stack

- **React**: UI library
- **TypeScript**: Type safety and better developer experience
- **Redux**: State management
- **Redux-Saga**: Side effects management
- **React Router**: Navigation and routing
- **Axios**: API requests
- **Recharts**: Data visualization 
- **D3.js**: Advanced data visualization
- **Formik & Yup**: Form handling and validation
- **Tailwind CSS**: Styling

## Getting Started

### Prerequisites

- Node.js (v14.x or newer)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## Project Structure

```
investment-portfolio-frontend/
├── public/                        # Public static files
├── src/                           # Source code
│   ├── assets/                    # Static resources (styles, fonts, images)
│   ├── components/                # React components
│   │   ├── common/                # Common UI components
│   │   ├── layout/                # Layout components
│   │   ├── charts/                # Chart components
│   │   ├── portfolio/             # Portfolio-related components
│   │   ├── analytics/             # Analytics-related components
│   │   ├── optimization/          # Optimization-related components
│   │   ├── risk/                  # Risk-related components
│   │   ├── scenarios/             # Scenario-related components
│   │   ├── historical/            # Historical analysis components
│   │   ├── comparison/            # Comparison-related components
│   │   ├── reports/               # Reports-related components
│   ├── constants/                 # Constants and configuration
│   ├── contexts/                  # React contexts
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Page components
│   ├── services/                  # API services
│   ├── store/                     # Redux store
│   ├── types/                     # TypeScript type definitions
│   ├── utils/                     # Utility functions
│   ├── App.tsx                    # Main application component
│   ├── AppRoutes.tsx              # Application routes
│   ├── index.tsx                  # Entry point
```

## Backend Integration

This frontend is designed to work with the Investment Portfolio Management System backend API. The backend should be running for the frontend to function properly.

## Design System

The application follows the Wild Market Capital design system, featuring a dark theme with purple accents and clear data visualization. The color palette and typography have been carefully selected to provide an optimal user experience for financial data analysis.