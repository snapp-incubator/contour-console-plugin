export interface K8sResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
}

export interface K8sService extends K8sResource {
  spec: {
    ports: Array<{
      name?: string;
      protocol: string;
      port: number;
      targetPort: number | string;
    }>;
    selector?: Record<string, string>;
  };
}

export interface K8sSecret extends K8sResource {
  type: string;
  data?: Record<string, string>;
}

export interface K8sIngressClass extends K8sResource {
  spec: {
    controller: string;
  };
}

export interface K8sResources {
  services: K8sService[];
  secrets: K8sSecret[];
  ingressClasses: K8sIngressClass[];
  loading: boolean;
  error: string | null;
}
