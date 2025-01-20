import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import type { MetricCardProps } from './metricCard.type';

import { DEFAULT_PADDING_CHART } from '../../constants';

const MetricCard = ({ title, data, unit }: MetricCardProps): JSX.Element => {
  return (
    <Card isFlat={true}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
