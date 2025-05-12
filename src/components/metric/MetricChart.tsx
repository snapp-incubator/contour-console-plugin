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

const MetricChart = ({ data, unit }: MetricChartProps) => {
  return (
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
      padding={{ ...DEFAULT_PADDING_CHART }}
      height={200}
      themeColor={ChartThemeColor.blue}
    >
      <ChartAxis
        tickFormat={(tick) => {
          const date = new Date(tick);
          return `${date.getHours()}:${String(date.getMinutes()).padStart(
            2,
            '0',
          )}`;
        }}
        style={{
          tickLabels: {
            fontSize: 12,
            padding: 5,
            angle: -45,
            textAnchor: 'end',
          },
        }}
        tickCount={6}
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
            data: { strokeWidth: 1 },
          }}
        />
      </ChartGroup>
    </Chart>
  );
};

export default MetricChart;
