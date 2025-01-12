export const CONTOUR_MODEL = {
  apiVersion: 'projectcontour.io/v1',
  kind: 'HTTPProxy',
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
  weight: 100,
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
  ingressClassName: '',
  fqdn: '',
  routes: [DEFAULT_ROUTE],
  conditional: {
    secureRoute: false,
    permitInsecure: false,
  },
};
