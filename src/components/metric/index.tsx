import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
} from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import type { MetricCardProps } from './metricCard.type';

import { DEFAULT_PADDING_CHART } from '../../constants';

const MetricCard = ({
  title,
  data,
  unit,
  query,
}: MetricCardProps): JSX.Element => {
  const getMonitoringURL = (query: string) => {
    const baseURL = '/monitoring/query-browser';
    const encodedQuery = encodeURIComponent(query);
    return `${baseURL}?query0=${encodedQuery}`;
  };

  return (
    <Card isFlat={true}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {query && (
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
            {title}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        <div style={{ height: '200px' }}>
          <Chart
            containerComponent={<ChartVoronoiContainer />}
            scale={{ x: 'time', y: 'linear' }}
            padding={DEFAULT_PADDING_CHART}
            height={200}
          >
            <ChartAxis />
            <ChartAxis
              dependentAxis
              tickFormat={(tick) => `${tick}${unit || ''}`}
            />
            <ChartGroup>
              <ChartLine
                data={data}
                style={{
                  data: { stroke: '#0066CC' },
                }}
              />
            </ChartGroup>
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

export default MetricCard;
