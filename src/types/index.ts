export * from './form';
export * from './k8s';

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
