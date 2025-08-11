"""
Portfolio manager implementation for storage and management of portfolio data.
"""
import logging
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Union, Any
import re
from app.core.interfaces.storage_provider import StorageProvider
from app.core.interfaces.data_provider import DataProvider
from app.core.domain.portfolio import Portfolio
from app.core.domain.asset import Asset


class PortfolioManagerService:
    """
    Service for portfolio data management.
    Manages storage and retrieval of portfolio data.
    """

    def __init__(
            self,
            data_provider: DataProvider,
            storage_provider: StorageProvider
    ):
        """
        Initialize the portfolio manager service

        Args:
            data_provider: Service for retrieving market data
            storage_provider: Service for storing portfolio data
        """
        self.data_provider = data_provider
        self.storage_provider = storage_provider
        logging.info("Initialized PortfolioManagerService")

    def save_portfolio(self, portfolio: Portfolio) -> str:
        """
        Save portfolio to storage

        Args:
            portfolio: Portfolio to save

        Returns:
            ID of the saved portfolio
        """
        portfolio_dict = portfolio.to_dict()

        # Add last update timestamp
        portfolio_dict['last_updated'] = datetime.now().isoformat()

        # Generate filename from portfolio ID
        filename = f"{portfolio.id}.json"

        try:
            # Save to storage
            self.storage_provider.save_json(portfolio_dict, filename)
            logging.info(f"Portfolio '{portfolio.name}' saved with ID {portfolio.id}")
            return portfolio.id
        except Exception as e:
            logging.error(f"Error saving portfolio {portfolio.id}: {e}")
            raise

    def load_portfolio(self, portfolio_id: str) -> Optional[Dict[str, Any]]:
        """
        Load portfolio from storage as dictionary (for analytics compatibility)

        Args:
            portfolio_id: ID of the portfolio to load

        Returns:
            Loaded portfolio as dictionary or None if not found
        """
        filename = f"{portfolio_id}.json"

        try:
            # Load from storage as dictionary
            portfolio_dict = self.storage_provider.load_json(filename)

            if not portfolio_dict:
                logging.error(f"Portfolio data is empty for ID: {portfolio_id}")
                return None

            logging.info(f"Portfolio '{portfolio_dict.get('name', portfolio_id)}' loaded with ID {portfolio_id}")
            return portfolio_dict

        except FileNotFoundError:
            logging.error(f"Portfolio not found: {portfolio_id}")
            return None
        except Exception as e:
            logging.error(f"Error loading portfolio {portfolio_id}: {e}")
            raise

    def load_portfolio_as_object(self, portfolio_id: str) -> Optional[Portfolio]:
        """
        Load portfolio from storage as Portfolio object

        Args:
            portfolio_id: ID of the portfolio to load

        Returns:
            Loaded portfolio as Portfolio object or None if not found
        """
        portfolio_dict = self.load_portfolio(portfolio_id)

        if not portfolio_dict:
            return None

        try:
            portfolio = Portfolio.from_dict(portfolio_dict)
            return portfolio
        except Exception as e:
            logging.error(f"Error converting portfolio dict to object {portfolio_id}: {e}")
            return None

    def list_portfolios(self) -> List[Dict]:
        """
        List all available portfolios

        Returns:
            List of dictionaries with portfolio metadata
        """
        try:
            # Get all portfolio files
            portfolio_files = self.storage_provider.list_files('.json')

            portfolios = []
            for file_path in portfolio_files:
                try:
                    # Load basic portfolio data
                    portfolio_dict = self.storage_provider.load_json(file_path.name)

                    # Extract metadata
                    portfolio_info = {
                        'id': portfolio_dict.get('id', file_path.stem),
                        'name': portfolio_dict.get('name', file_path.stem),
                        'last_updated': portfolio_dict.get('last_updated', 'Unknown'),
                        'asset_count': len(portfolio_dict.get('assets', [])),
                        'description': portfolio_dict.get('description', ''),
                        'tags': portfolio_dict.get('tags', [])
                    }

                    portfolios.append(portfolio_info)
                except Exception as e:
                    logging.warning(f"Failed to read portfolio data from {file_path}: {e}")

            # Sort by name
            return sorted(portfolios, key=lambda x: x['name'])
        except Exception as e:
            logging.error(f"Error listing portfolios: {e}")
            return []

    def delete_portfolio(self, portfolio_id: str) -> bool:
        """
        Delete a portfolio

        Args:
            portfolio_id: ID of the portfolio to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        filename = f"{portfolio_id}.json"

        try:
            # Delete from storage
            success = self.storage_provider.delete_file(filename)
            if success:
                logging.info(f"Portfolio with ID {portfolio_id} deleted")
            else:
                logging.warning(f"Failed to delete portfolio with ID {portfolio_id}")
            return success
        except Exception as e:
            logging.error(f"Error deleting portfolio {portfolio_id}: {e}")
            return False

    def import_from_csv(self, file_path: str, portfolio_name: Optional[str] = None) -> Portfolio:
        """
        Import portfolio from CSV file

        Args:
            file_path: Path to CSV file
            portfolio_name: Name for the imported portfolio (if None, file name is used)

        Returns:
            Imported portfolio
        """
        try:
            df = pd.read_csv(file_path)

            # Check required columns
            required_columns = ['ticker']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"CSV file is missing required columns: {missing_columns}")

            # Prepare portfolio name
            if portfolio_name is None:
                file_name = Path(file_path).stem
                portfolio_name = file_name

            # Create portfolio
            portfolio = Portfolio(
                id=None,  # ID will be generated
                name=portfolio_name,
                description=f"Imported from {Path(file_path).name}",
                created_at=datetime.now(),
            )

            # Add assets
            for _, row in df.iterrows():
                asset = Asset(ticker=row['ticker'])

                # Add optional fields
                optional_fields = {
                    'name': str,
                    'weight': float,
                    'quantity': float,
                    'purchase_price': float,
                    'purchase_date': str,
                    'sector': str,
                    'industry': str,
                    'asset_class': str,
                    'region': str,
                    'currency': str
                }

                for field, field_type in optional_fields.items():
                    if field in df.columns and not pd.isna(row[field]):
                        setattr(asset, field, field_type(row[field]))

                # Add asset to portfolio
                weight = getattr(asset, 'weight', None)
                portfolio.add_asset(asset, weight)

            # If all assets have quantity but not weight, calculate weights
            if all(hasattr(asset, 'quantity') for asset in portfolio.assets) and \
                    not all(hasattr(asset, 'weight') for asset in portfolio.assets):
                self._calculate_weights_from_quantities(portfolio)

            # Normalize weights
            portfolio.normalize_weights()

            # Enrich with additional data
            self._enrich_portfolio_data(portfolio)

            logging.info(f"Portfolio '{portfolio_name}' imported from {file_path}")
            return portfolio
        except Exception as e:
            logging.error(f"Error importing portfolio from CSV {file_path}: {e}")
            raise

    def export_to_csv(self, portfolio: Portfolio, file_path: Optional[str] = None) -> str:
        """
        Export portfolio to CSV

        Args:
            portfolio: Portfolio to export
            file_path: Path to save to (if None, created based on portfolio name)

        Returns:
            Path to the saved file
        """
        if file_path is None:
            # Generate filename from portfolio name
            safe_name = self._sanitize_filename(portfolio.name)
            file_path = Path(self.storage_provider.get_base_dir()) / f"{safe_name}.csv"

        try:
            # Create DataFrame from assets
            assets_data = []

            for asset in portfolio.assets:
                asset_dict = asset.to_dict()
                assets_data.append(asset_dict)

            # Create DataFrame and save
            df = pd.DataFrame(assets_data)
            df.to_csv(file_path, index=False)

            logging.info(f"Portfolio '{portfolio.name}' exported to {file_path}")
            return str(file_path)
        except Exception as e:
            logging.error(f"Error exporting portfolio to CSV: {e}")
            raise

    def parse_ticker_weights_text(self, text: str) -> List[Dict]:
        """
        Parse a text list of tickers and weights

        Args:
            text: Text in format "TICKER:weight, TICKER:weight" or "TICKER weight, TICKER weight"

        Returns:
            List of dictionaries with asset data
        """
        assets = []

        text = text.strip()

        # Split by commas or newlines
        lines = [line.strip() for line in text.replace(',', '\n').split('\n')]

        for line in lines:
            if not line:
                continue

            # Pattern 1: TICKER:weight
            colon_match = re.match(r'^([A-Za-z0-9.-]+):([0-9.]+)$', line)

            # Pattern 2: TICKER weight
            space_match = re.match(r'^([A-Za-z0-9.-]+)\s+([0-9.]+)$', line)

            # Pattern 3: TICKER only
            ticker_only_match = re.match(r'^([A-Za-z0-9.-]+)$', line)

            if colon_match:
                ticker, weight = colon_match.groups()
                assets.append({
                    'ticker': ticker.strip().upper(),
                    'weight': float(weight.strip())
                })
            elif space_match:
                ticker, weight = space_match.groups()
                assets.append({
                    'ticker': ticker.strip().upper(),
                    'weight': float(weight.strip())
                })
            elif ticker_only_match:
                ticker = ticker_only_match.group(1)
                assets.append({
                    'ticker': ticker.strip().upper(),
                    'weight': 0.0  # Will be normalized later
                })

        # If all weights are 0, distribute equally
        if assets and all(asset['weight'] == 0.0 for asset in assets):
            equal_weight = 1.0 / len(assets)
            for asset in assets:
                asset['weight'] = equal_weight

        return assets

    def create_portfolio_from_text(
            self,
            text: str,
            portfolio_name: str,
            description: str = ""
    ) -> Portfolio:
        """
        Create a portfolio from a text list of tickers

        Args:
            text: Text with tickers and weights
            portfolio_name: Portfolio name
            description: Portfolio description

        Returns:
            Created portfolio
        """
        # Parse text to get asset data
        assets_data = self.parse_ticker_weights_text(text)

        if not assets_data:
            raise ValueError("Could not recognize any ticker in the text")

        # Create portfolio
        portfolio = Portfolio(
            id=None,  # ID will be generated
            name=portfolio_name,
            description=description,
            created_at=datetime.now(),
        )

        # Validate tickers
        tickers = [asset['ticker'] for asset in assets_data]
        valid_tickers, invalid_tickers = self.data_provider.validate_tickers(tickers)

        if invalid_tickers:
            logging.warning(f"Invalid tickers found: {invalid_tickers}")

        # Add assets
        for asset_data in assets_data:
            if asset_data['ticker'] in valid_tickers:
                asset = Asset(ticker=asset_data['ticker'])
                portfolio.add_asset(asset, asset_data['weight'])

        # Normalize weights
        portfolio.normalize_weights()

        # Enrich with additional data
        self._enrich_portfolio_data(portfolio)

        logging.info(f"Portfolio '{portfolio_name}' created with {len(portfolio.assets)} assets")
        return portfolio

    def update_portfolio_prices(self, portfolio: Portfolio) -> Portfolio:
        """
        Update current prices of assets in the portfolio

        Args:
            portfolio: Portfolio to update

        Returns:
            Updated portfolio
        """
        if not portfolio.assets:
            return portfolio

        # Get tickers
        tickers = [asset.ticker for asset in portfolio.assets]

        # Get latest prices
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - pd.Timedelta(days=5)).strftime('%Y-%m-%d')

        price_data = self.data_provider.get_batch_data(tickers, start_date, end_date)

        # Update asset prices
        for asset in portfolio.assets:
            ticker = asset.ticker

            if ticker in price_data and not price_data[ticker].empty:
                latest_data = price_data[ticker].iloc[-1]

                if 'Adj Close' in latest_data:
                    current_price = latest_data['Adj Close']
                elif 'Close' in latest_data:
                    current_price = latest_data['Close']
                else:
                    continue

                # Update asset attributes
                asset.current_price = current_price
                asset.price_date = price_data[ticker].index[-1].strftime('%Y-%m-%d')

                if hasattr(asset, 'purchase_price') and asset.purchase_price:
                    asset.price_change_pct = ((current_price / float(asset.purchase_price)) - 1) * 100

        logging.info(f"Asset prices for portfolio '{portfolio.name}' have been updated")
        return portfolio

    def _calculate_weights_from_quantities(self, portfolio: Portfolio) -> None:
        """
        Calculate weights based on quantities and current prices

        Args:
            portfolio: Portfolio to calculate weights for
        """
        # Get tickers
        tickers = [asset.ticker for asset in portfolio.assets
                   if hasattr(asset, 'quantity') and asset.quantity]

        # Get latest prices
        price_data = self.data_provider.get_batch_data(tickers)

        # Calculate total value
        total_value = 0.0
        position_values = {}

        for asset in portfolio.assets:
            if hasattr(asset, 'quantity') and asset.quantity and asset.ticker in price_data:
                df = price_data[asset.ticker]

                if not df.empty:
                    if 'Adj Close' in df.columns:
                        price = df['Adj Close'].iloc[-1]
                    elif 'Close' in df.columns:
                        price = df['Close'].iloc[-1]
                    else:
                        continue

                    position_value = float(asset.quantity) * price
                    position_values[asset.ticker] = position_value
                    total_value += position_value

        # Set weights
        if total_value > 0:
            for asset in portfolio.assets:
                if asset.ticker in position_values:
                    asset.weight = position_values[asset.ticker] / total_value

    def _enrich_portfolio_data(self, portfolio: Portfolio) -> None:
        """
        Enrich portfolio data with additional information

        Args:
            portfolio: Portfolio to enrich
        """
        for asset in portfolio.assets:
            try:
                # Get company info
                info = self.data_provider.get_company_info(asset.ticker)

                if info:
                    # Set asset attributes
                    for field in ['name', 'sector', 'industry', 'asset_class', 'currency']:
                        if field in info and not hasattr(asset, field):
                            setattr(asset, field, info[field])

                    # Special case for asset_class
                    if not hasattr(asset, 'asset_class') and 'type' in info:
                        asset.asset_class = info['type']
            except Exception as e:
                logging.warning(f"Unable to retrieve information for {asset.ticker}: {e}")

        # Update prices
        self.update_portfolio_prices(portfolio)

    def _sanitize_filename(self, filename: str) -> str:
        """
        Clean a filename from invalid characters

        Args:
            filename: Original filename

        Returns:
            Sanitized filename
        """
        import re

        # Replace invalid characters
        filename = re.sub(r'[\\/*?:"<>|%\\\\\s]', '_', filename)

        # Replace & with 'and'
        filename = filename.replace('&', 'and')

        # Replace other invalid characters
        filename = filename.replace('\\', '_').replace('/', '_').replace(':', '_')

        # Limit length
        if len(filename) > 200:
            filename = filename[:197] + '...'

        return filename