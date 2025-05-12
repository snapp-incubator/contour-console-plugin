import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardBody } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import type { MetricCardProps } from './metricCard.type';
import { getMonitoringURL } from '../../utils/promql/metrix';
import { LoadingState, ErrorState, EmptyDataState } from './MetricStates';
import MetricChart from './MetricChart';
import { Link } from 'react-router-dom';

const MetricCard = ({
  title,
  data,
  unit,
  query,
  loading,
  error,
}: MetricCardProps): JSX.Element => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    if (!data || data.length === 0) {
      return <EmptyDataState />;
    }

    return <MetricChart data={data} unit={unit} />;
  };

  return (
    <Card isFlat={true}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {query && !loading && !error ? (
          <Link
            className="pf-u-ml-auto"
            to={getMonitoringURL(query)}
            rel="noopener noreferrer"
          >
            <ExternalLinkAltIcon className="pf-u-mr-xs" />
            {t('view_query')}
          </Link>
        ) : null}
      </CardHeader>
      <CardBody>
        <div style={{ height: '200px', width: '100%' }}>{renderContent()}</div>
      </CardBody>
    </Card>
  );
};

export default MetricCard;
