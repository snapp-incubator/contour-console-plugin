export const DEFAULT_PADDING_CHART = {
  bottom: 50,
  left: 50,
  right: 50,
  top: 20,
};

export const CONTOUR_MODEL = {
  apiVersion: 'projectcontour.io/v1',
  kind: 'HTTPProxy',
  apiGroup: 'projectcontour.io',
};

export const SERVICE_MODEL = {
  apiVersion: 'api/v1',
  kind: 'Service',
};

export const SECRET_MODEL = {
  apiVersion: 'api/v1',
  kind: 'Secret',
  plural: 'secrets',
};

export const INGRESS_CLASS_MODEL = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'IngressClass',
};

export const DEFAULT_SERVICE = {
  name: '',
  weight: 0,
  port: '',
  validation: false,
  websocket: false,
  idleConnection: '15',
  responseTimeout: '5',
};

export const DEFAULT_ROUTE = {
  prefix: '/',
  services: [DEFAULT_SERVICE],
};

export const DEFAULT_FORM_DATA = {
  name: '',
  ingressClassName: 'private',
  fqdn: '',
  routes: [DEFAULT_ROUTE],
  conditional: {
    secureRoute: false,
    permitInsecure: false,
  },
};

export const TLSType = 'kubernetes.io/tls';

export const defaultSecret = {
  metadata: {
    name: 'openshift-ingress/letsencrypt',
  },
  type: TLSType,
};

export const HTTP_PROXY_TEMPLATE = {
  apiVersion: 'projectcontour.io/v1',
  kind: 'HTTPProxy',
  metadata: {},
  spec: {
    virtualhost: {},
    routes: [],
  },
};
