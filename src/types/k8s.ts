import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export interface HTTPProxy extends K8sResourceCommon {
  spec: {
    virtualhost?: {
      fqdn: string;
      tls?: {
        secretName?: string;
        minimumProtocolVersion?: string;
        passthrough?: boolean;
        enableFallbackCertificate?: boolean;
      };
    };
    routes?: Array<{
      conditions?: Array<{
        prefix: string;
      }>;
      services?: Array<{
        name: string;
        port: number;
        weight?: number;
        validation?: {
          caSecret: string;
          subjectName: string;
        };
        requestTimeout?: string;
        idleTimeout?: string;
        protocol?: string;
      }>;
      enableWebsockets?: boolean;
      permitInsecure?: boolean;
      timeoutPolicy?: {
        response?: string;
        idle?: string;
      };
    }>;
    includes?: Array<{
      name: string;
      namespace: string;
      conditions?: Array<{
        prefix: string;
      }>;
    }>;
    ingressClassName?: string;
  };
  status?: {
    currentStatus: string;
    description: string;
    loadBalancer?: {
      ingress?: Array<{
        hostname?: string;
      }>;
    };
    conditions?: Array<{
      type: string;
      status: string;
      lastTransitionTime: string;
      reason: string;
      message: string;
    }>;
  };
}

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

export interface K8sResources {
  services: K8sService[];
  secrets: K8sSecret[];
  ingressClasses: any[];
  loading: boolean;
  error: string | null;
}
