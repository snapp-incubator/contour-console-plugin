const mockHttpProxyData = (formData) => ({
  kind: 'HTTPProxy',
  apiVersion: 'projectcontour.io/v1',
  metadata: {
    name: formData.metadataName,
    namespace: formData.metadataNamespace,
  },
  labels: {
    role: formData.labelsRole,
    router: formData.labelsRouter,
  },
  spec: {
    to: {
      Kind: 'Service',
      name: formData.service,
    },
    tls: formData.specTls,
    host: formData.specHost,
    path: formData.specPath,
    port: {
      targetPort: formData.targetPort,
    },
  },
});

export const mockServicesData = {
  apiVersion: 'api/v1',
  kind: 'Service',
  items: [],
};

export const labelRouterMapping = [
  {
    key: 'private',
    name: 'Private',
  },
  {
    key: 'public',
    name: 'Public',
  },
];

export default mockHttpProxyData;
