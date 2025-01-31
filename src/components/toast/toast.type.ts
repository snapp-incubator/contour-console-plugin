export interface ToastProps {
  t: (key: string) => string;
  alerts: AlertType[];
  removeAlert: (key: number) => void;
}

export interface AlertType {
  title: string;
  variant: 'success' | 'danger';
  key: number;
}
