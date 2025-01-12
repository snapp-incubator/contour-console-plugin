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

export type ConditionalType = {
  secureRoute?: boolean;
  permitInsecure?: boolean;
  termination?: string;
  secrets?: string;
  insecureTraffic?: string;
};

export type InputServiceType = {
  name: string;
  port: number;
  weight: number;
  caSecret?: boolean;
  enableUpstreamTLS: boolean;
  subjectName?: string;
};

export type FormDataType = {
  name?: string;
  namespace: string;
  conditional?: ConditionalType;
  ingressClassName?: string;
  prefix?: string;
  fqdn?: string;
  services: InputServiceType[];
};

export type VirtualHostType = {
  valueDomain?: string;
  tls?: {
    secretName: string;
    enableFallbackCertificate: boolean;
    passthrough?: boolean;
  };
};

export type ModelDataType = {
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
};

export type K8Service = {
  items?: Array<{
    metadata: {
      name: string;
    };
    spec: {
      ports: Array<{
        port: string | number;
      }>;
    };
  }>;
};

export type K8Secret = {
  metadata?: {
    name: string;
  };
};
