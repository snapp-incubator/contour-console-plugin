import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import type { MetricCardProps } from './metricCard.type';
import { getMonitoringURL } from '../../utils/promql/metrix';
import { LoadingState, ErrorState, EmptyDataState } from './MetricStates';
import MetricChart from './MetricChart';

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
          <Button
            className="pf-u-ml-auto"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            component="a"
            href={getMonitoringURL(query)}
            target="_blank"
            rel="noopener noreferrer"
            isInline
          >
            {t('view_query')}
          </Button>
        ) : null}
      </CardHeader>
      <CardBody>
        <div style={{ height: '200px', width: '100%' }}>{renderContent()}</div>
      </CardBody>
    </Card>
  );
};

export default MetricCard;
