export const mockHttpProxyFormData = {
  apiVersion: 'projectcontour.io/v1',
  kind: 'HTTPProxy',
};

export const mockServicesData = {
  apiVersion: 'api/v1',
  kind: 'Service',
  items: [],
};

export const mockSecrets = {
  apiVersion: 'api/v1',
  kind: 'Secret',
};

export const labelRouterMapping = [
  {
    name: 'Private',
    key: 'private',
  },
  {
    name: 'Public',
    key: 'public',
  },
  {
    name: 'Inter-dc',
    key: 'inter-dc',
  },
  {
    name: 'Inter-venture',
    key: 'inter-venture',
  },
];

export const tlsRouterMapping = [
  {
    name: 'Edge',
    key: 'edge',
  },
  {
    name: 'Passthrough',
    key: 'passthrough',
  },
];
