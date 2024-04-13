export const mockHttpProxyFormData = (formData) => ({
  apiVersion: 'projectcontour.io/v1',
  kind: 'HTTPProxy',
  metadata: {
    name: formData.metadataName,
    namespace: formData.metadataNamespace,
  },
  spec: {
    httpVersions: ['http/1.1'],
    ingressClassName: formData.labelsRouter,
    routes: [
      {
        conditions: [
          {
            prefix: formData.specPath,
          },
        ],
        enableWebsockets: true,
        loadBalancerPolicy: {
          strategy: 'Cookie',
        },
        services: formData.services,
        timeoutPolicy: {
          response: '5s',
        },
      },
    ],
    virtualhost: {
      fqdn: formData.specHost,
      tls: {
        enableFallbackCertificate: formData.enableFallbackCertificate,
        secretName: formData.secretName,
      },
    },
  },
});

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
];
