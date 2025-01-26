export * from './form';
export * from './k8s';

export interface Service {
  name: string;
  port: string;
  weight: number;
  validation: boolean;
  caSecret?: string;
  subjectName?: string;
  idleConnection: string;
  responseTimeout: string;
}

export interface Route {
  prefix: string;
  services: Service[];
  websocket?: boolean;
}

export interface RouteFormProps {
  route: Route;
  onChange: (route: Route) => void;
  onDelete?: () => void;
  availableServices: K8sService[];
  availableSecrets: string[];
}

export interface K8sService {
  metadata: {
    name: string;
  };
  spec: {
    ports?: Array<{
      port: number;
      name?: string;
    }>;
  };
}
