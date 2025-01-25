import React from 'react';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
  ChartThemeColor,
} from '@patternfly/react-charts';
import { DEFAULT_PADDING_CHART } from '../../constants';
import { MetricChartProps } from './metricCard.type';

const MetricChart: React.FC<MetricChartProps> = ({ data, unit }) => (
  <Chart
    containerComponent={
      <ChartVoronoiContainer
        labels={({ datum }) =>
          `${new Date(datum.x).toLocaleTimeString()}\n${datum.y}${unit || ''}`
        }
        constrainToVisibleArea
      />
    }
    scale={{ x: 'time', y: 'linear' }}
    padding={DEFAULT_PADDING_CHART}
    height={200}
    themeColor={ChartThemeColor.blue}
  >
    <ChartAxis
      tickFormat={(tick) => new Date(tick).toLocaleTimeString()}
      style={{
        tickLabels: { fontSize: 12, padding: 5 },
      }}
    />
    <ChartAxis
      dependentAxis
      tickFormat={(tick) => `${tick}${unit || ''}`}
      style={{
        tickLabels: { fontSize: 12, padding: 5 },
      }}
    />
    <ChartGroup>
      <ChartLine
        data={data}
        style={{
          data: { strokeWidth: 2 },
        }}
      />
    </ChartGroup>
  </Chart>
);

export default MetricChart;
