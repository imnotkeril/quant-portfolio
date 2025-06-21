import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../constants/routes';
import styles from './NotFound.module.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className={styles.actions}>
          <Button onClick={handleGoBack} variant="outline">
            Go Back
          </Button>
          <Link to={ROUTES.HOME}>
            <Button variant="primary">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className={styles.suggestions}>
          <h3>Try these instead:</h3>
          <ul>
            <li>
              <Link to={ROUTES.PORTFOLIO.LIST}>View Portfolios</Link>
            </li>
            <li>
              <Link to={ROUTES.PORTFOLIO.CREATE}>Create Portfolio</Link>
            </li>
            <li>
              <Link to={ROUTES.ANALYTICS.ROOT}>Analytics</Link>
            </li>
            <li>
              <Link to={ROUTES.REPORTS.ROOT}>Reports</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;