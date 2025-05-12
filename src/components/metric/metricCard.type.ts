export interface MetricData {
  x: Date;
  y: number;
}

export interface MetricChartProps {
  data: MetricData[];
  unit?: string;
}

export interface MetricCardProps {
  title: string;
  data: MetricData[];
  unit?: string;
  query?: string;
  loading: boolean;
  error?: string;
}
