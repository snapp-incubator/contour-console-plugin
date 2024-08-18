import { match as RMatch } from 'react-router-dom';

export type ServiceType = {
  name: string;
  protocol?: string;
  port: number;
  weight: number;
  validation?: {
    caSecret: boolean;
    subjectName?: string;
  };
};
export type CreateRouteProps = {
  match: RMatch<{
    ns?: string;
  }>;
};

export interface ConditionalType {
  secureRoute?: boolean;
  termination?: string;
  secrets?: string;
  insecureTraffic?: string;
}

export interface InputServiceType {
  name: string;
  port: number;
  weight: number;
  caSecret?: boolean;
  subjectName?: string;
}

export interface FormDataType {
  name?: string;
  namespace: string;
  conditional?: ConditionalType;
  ingressClassName?: string;
  prefix?: string;
  fqdn?: string;
  services: InputServiceType[];
}

export interface VirtualHostType {
  fqdn?: string;
  tls?: {
    secretName: string;
    enableFallbackCertificate: boolean;
    passthrough?: boolean;
  };
}

export interface ModelDataType {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    virtualhost?: VirtualHostType;
    routes: Array<any>;
    ingressClassName?: string;
    httpVersions: string[];
  };
}
