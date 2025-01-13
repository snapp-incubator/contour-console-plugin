import React from 'react';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartThemeColor,
} from '@patternfly/react-charts';
import { Card, CardTitle, CardBody } from '@patternfly/react-core';
import { ChartMetricProps } from './chart.type';
import { DEFAULT_PADDING_CHART } from '../../constants';

const ChartMetric = ({
  title,
  name,
  chartData,
  width = 350,
  height = 280,
  legendPosition = 'bottom',
  yAxisTickValues = [2, 5, 8],
  xAxisTickValues = [2, 3, 4],
  themeColor = ChartThemeColor.multiUnordered,
  showGrid = true,
  padding = DEFAULT_PADDING_CHART,
}: ChartMetricProps) => {
  if (!chartData.length) return { min: 0, max: 10 };

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <Chart
          ariaTitle={title}
          legendPosition={legendPosition}
          height={height}
          name={name}
          padding={padding}
          themeColor={themeColor}
          width={width}
        >
          <ChartAxis tickValues={xAxisTickValues} />
          <ChartAxis
            dependentAxis
            showGrid={showGrid}
            tickValues={yAxisTickValues}
          />
          <ChartGroup>
            {chartData.map((series: any, index) => (
              <ChartLine
                key={series.name}
                data={series.data}
                style={{
                  data: {
                    stroke: series.color,
                  },
                }}
              />
            ))}
          </ChartGroup>
        </Chart>
      </CardBody>
    </Card>
  );
};

export default ChartMetric;
