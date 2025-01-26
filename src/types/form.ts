import { K8sService } from './k8s';

export interface Service {
  name: string;
  weight: number;
  port: string;
  validation: boolean;
  caSecret?: string;
  subjectName?: string;
  websocket: boolean;
  idleConnection: string;
  responseTimeout: string;
}

export interface Route {
  prefix: string;
  services: Service[];
  websocket?: boolean;
}

export interface ConditionalFields {
  secureRoute: boolean;
  termination?: 'edge' | 'passthrough' | 're-encrypt';
  permitInsecure?: boolean;
  secrets?: string;
}

export interface FormData {
  name: string;
  namespace?: string;
  ingressClassName: string;
  resourceVersion?: string;
  websocket?: boolean;
  fqdn: string;
  routes: Route[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  conditional?: ConditionalFields;
}

export interface RouteFormProps {
  route: Route;
  onChange: (route: Route) => void;
  onDelete?: () => void;
  onCreate?: () => void;
  availableServices: K8sService[];
  availablePorts?: string[];
  availableSecrets: string[];
}

export interface ContourFormProps {
  formData: FormData;
  updateFormData: any;
  onChange: (formData: FormData) => void;
  isEdit?: boolean;
  validationErrors?: string[];
  saveError?: string | null;
  onSubmit: (e: React.FormEvent) => void;
}
