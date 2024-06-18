export const convertRouteToYML = (formData) => {
  if (!formData) {
    return null;
  }
  const { name, namespace, ingressClassName, prefix, fqdn, tls } = formData;
  const modelData = {
    apiVersion: 'projectcontour.io/v1',
    kind: 'HTTPProxy',
    metadata: {
      name,
      namespace: namespace,
    },
    spec: {
      httpVersions: ['http/1.1'],
      ingressClassName,
      routes: [
        {
          conditions: [
            {
              prefix: prefix,
            },
          ],
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
        fqdn,
        tls,
      },
    },
  };

  return modelData;
};

export const convertRouteToForm = (data) => {
  if (!data) {
    return null;
  }

  const { metadata, spec } = data;
  const { routes } = spec || {};
  const firstRoute = routes?.[0] || {};
  const { conditions, services } = firstRoute;

  return {
    name: metadata?.name,
    ingressClassName: spec?.ingressClassName,
    prefix: conditions?.[0]?.prefix,
    services:
      services?.map((service) => ({
        name: service?.name,
        weight: service?.weight,
      })) || [],
  };
};
