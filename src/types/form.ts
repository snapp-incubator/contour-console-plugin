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
  fqdn: string;
  routes: Route[];
  conditional?: ConditionalFields;
}

export interface RouteFormProps {
  route: Route;
  onChange: (route: Route) => void;
  onDelete?: () => void;
  onCreate?: () => void;
  availableServices: string[];
  availablePorts: string[];
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
