export const convertRouteToYML = (formData) => {
  if (!formData) {
    return null;
  }
  const {
    name,
    namespace,
    conditional,
    ingressClassName,
    prefix,
    fqdn,
    tls,
    services,
  } = formData;

  const protocol =
    (conditional?.secureRoute && conditional?.termination) === 're-encrypt'
      ? 'tls'
      : undefined;

  const routeServices = services.map((service) => ({
    name: service.name,
    port: service.port,
    weight: service.weight,
    ...(protocol && { protocol }),
  }));

  const sectionServices =
    conditional?.secureRoute && conditional?.termination === 'passthrough'
      ? { tcpproxy: { services: routeServices } }
      : { services: routeServices };

  const modelData = {
    apiVersion: 'projectcontour.io/v1',
    kind: 'HTTPProxy',
    metadata: {
      name,
      namespace,
    },
    spec: {
      virtualhost: {
        fqdn,
        tls,
      },
      routes: [
        {
          conditions: [{ prefix }],
          ...sectionServices,
          loadBalancerPolicy: {
            strategy: 'Cookie',
          },
          timeoutPolicy: {
            response: '5s',
          },
        },
      ],
      ingressClassName,
      httpVersions: ['http/1.1'],
    },
  };

  return modelData;
};

export const convertRouteToForm = (data) => {
  if (!data) {
    return null;
  }

  const { metadata, spec } = data;
  const { routes, virtualhost } = spec || {};
  const firstRoute = routes?.[0] || {};
  const { conditions, services, tcpproxy } = firstRoute;

  const routeServices = tcpproxy?.services || services;
  const protocol = routeServices?.[0]?.protocol;

  return {
    name: metadata?.name,
    namespace: metadata?.namespace,
    ingressClassName: spec?.ingressClassName,
    prefix: conditions?.[0]?.prefix,
    fqdn: virtualhost?.fqdn,
    tls: virtualhost?.tls,
    services:
      routeServices?.map((service) => ({
        name: service?.name,
        weight: service?.weight,
        port: service?.port,
      })) || [],
    conditional: {
      secureRoute: !!tcpproxy || !!protocol,
      termination: tcpproxy
        ? 'passthrough'
        : protocol === 'tls'
        ? 're-encrypt'
        : undefined,
    },
  };
};
