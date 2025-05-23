import * as _ from 'lodash';

export const DEFAULT_PADDING_CHART = {
  bottom: 50,
  left: 50,
  right: 50,
  top: 20,
};

export const TLSType = 'kubernetes.io/tls';

export const PROMETHEUS_API = {
  BASE_URL: '/api/prometheus/api/v1',
  QUERY_RANGE: '/api/prometheus/api/v1/query_range',
  DEFAULT_STEP: '6',
  DEFAULT_TIMEOUT: '60s',
  TIME_RANGE: 3600,
  DEFAULT_ERROR_VALUE: 0,
  DEFAULT_METRIC_DATA: {
    x: new Date(),
    y: 0,
  },
};

export const METRIC_UNITS = {
  BYTES_PER_SECOND: ' bytes/s',
  CONNECTIONS_PER_SECOND: ' conn/s',
  REQUESTS_PER_SECOND: ' req/s',
};

// Helper function to safely get metric data
export const getMetricData = (
  data: any,
  path: string[],
  defaultValue: any = [],
) => {
  try {
    return (
      path.reduce(
        (obj, key) => (obj && obj[key] !== undefined ? obj[key] : null),
        data,
      ) || defaultValue
    );
  } catch (error) {
    console.error(
      `Error accessing metric data at path ${path.join('.')}:`,
      error,
    );
    return defaultValue;
  }
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
  websocket: false,
};

export const TLS_TERMINATION = {
  PASSTHROUGH: 'passthrough',
  EDGE: 'edge',
  REENCRYPT: 're-encrypt',
} as const;

export const defaultSecret = {
  metadata: {
    name: 'openshift-ingress/letsencrypt',
  },
  type: TLSType,
};

export const DEFAULT_FORM_DATA = {
  name: '',
  ingressClassName: 'private',
  fqdn: '',
  routes: [DEFAULT_ROUTE],
  conditional: {
    secureRoute: true,
    permitInsecure: false,
    termination: TLS_TERMINATION.EDGE,
    secrets: defaultSecret.metadata.name,
  },
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

export const MONITORING_BASE_URL = '/monitoring/query-browser';

export enum ResourceUtilizationQuery {
  NETWORK_IN = 'NETWORK_IN',
  NETWORK_OUT = 'NETWORK_OUT',
  LATENCY = 'LATENCY',
  PRS = 'PRS',
}

export const MetricsQueries = {
  [ResourceUtilizationQuery.NETWORK_IN]: _.template(
    "cloud:routes_received_bits:rate5m{authority='<%= authority %>'}",
  ),
  [ResourceUtilizationQuery.NETWORK_OUT]: _.template(
    "cloud:routes_sent_bits:rate5m{authority='<%= authority %>'}",
  ),
  [ResourceUtilizationQuery.LATENCY]: _.template(
    "cloud:routes_avg:ms{route_name='<%= name %>'}",
  ),
  [ResourceUtilizationQuery.PRS]: _.template(
    "sum (cloud:routes:rps{namespace='<%= namespace %>',route_name='<%= name %>'}) OR on() vector(0)",
  ),
};

export const INGRESS_CLASSES = [
  {
    label: 'inter-venture',
    value: 'inter-venture',
  },
  {
    label: 'inter-dc',
    value: 'inter-dc',
  },
  {
    label: 'public',
    value: 'public',
  },
  {
    label: 'private',
    value: 'private',
  },
];

export const HTTP_PROXY_QUERY_PARAMS = {
  ALL_NAMESPACES: {
    limit: '250',
    cluster: 'local-cluster',
  },
} as const;

export const ALL_NAMESPACES = 'all-namespaces';
