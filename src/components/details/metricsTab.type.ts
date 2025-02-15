export interface MetricsTabProps {
  name: string;
  ns: string;
  router: any;
}

export interface MetricDataPoint {
  x: Date;
  y: number;
}
