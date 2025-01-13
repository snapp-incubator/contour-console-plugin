import { ChartProps } from '@patternfly/react-charts';
export interface ChartMetricProps {
  title: string;
  name: string;
  chartData: [];
  width?: number;
  height?: number;
  legendPosition?: ChartProps['legendPosition'];
  yAxisTickValues?: number[];
  xAxisTickValues?: (string | number)[];
  themeColor?;
  showGrid?: boolean;
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}
