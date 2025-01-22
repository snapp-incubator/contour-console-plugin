export interface MetricCardProps {
  title: string;
  data: Array<{ x: Date; y: number }>;
  loading?: boolean;
  unit?: string;
  query?: string;
}
