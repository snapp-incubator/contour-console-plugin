export interface MetricCardProps {
  title: string;
  data: { x: Date; y: number }[];
  loading?: boolean;
  unit?: string;
}
