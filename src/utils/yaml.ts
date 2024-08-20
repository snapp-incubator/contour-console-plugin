import {
  ServiceType,
  FormDataType,
  ModelDataType,
  VirtualHostType,
} from './types';
import { convertToDomain, convertToString } from './fqdnHandler';

export const convertRouteToYML = (
  formData: FormDataType | null,
): ModelDataType | null => {
  if (!formData) return null;

  const {
    name,
    namespace,
    conditional,
    ingressClassName,
    prefix,
    fqdn,
    services,
  } = formData;
  const isSecureRoute = conditional?.secureRoute;
  const termination = conditional?.termination;
  const isPassthrough = termination === 'passthrough';

  const createTLS = (): { tls?: VirtualHostType['tls']; protocol?: string } => {
    if (!isSecureRoute) return {};

    const protocol = termination === 're-encrypt' ? 'tls' : undefined;
    const hasCaSecret = services.some((service) => service.enableUpstreamTLS);
    const tls = {
      secretName: !isPassthrough ? conditional?.secrets : undefined,
      passthrough: isPassthrough || undefined,
      enableFallbackCertificate: !isPassthrough || undefined,
    };

    if (!hasCaSecret) {
      return { tls, protocol };
    } else {
      return { protocol };
    }
  };

  const createServices = (protocol?: string): ServiceType[] => {
    return services.map((service) => ({
      name: service.name,
      port: service.port,
      weight: service.weight,
      ...(protocol && { protocol }),
      ...(service.enableUpstreamTLS && {
        validation: {
          caSecret: service.caSecret,
          subjectName: service.subjectName,
        },
      }),
    }));
  };

  const { tls, protocol } = createTLS();
  const routeServices = createServices(protocol);

  const permitInsecure = conditional?.permitInsecureStatus || undefined;

  const createVirtualHost = (): VirtualHostType => ({
    ...(fqdn && { fqdn: convertToDomain(fqdn) }),
    ...(tls && { tls }),
  });

  const createSpec = (): ModelDataType['spec'] => ({
    ...(Object.keys(createVirtualHost()).length > 0 && {
      virtualhost: createVirtualHost(),
    }),
    ...(!isPassthrough && {
      routes: [
        {
          conditions: [{ prefix }],
          permitInsecure,
          services: routeServices,
          loadBalancerPolicy: { strategy: 'Cookie' },
          timeoutPolicy: { response: '5s' },
        },
      ],
    }),
    ...(isSecureRoute &&
      isPassthrough && {
        tcpproxy: { services: routeServices },
      }),
    ingressClassName,
    httpVersions: ['http/1.1'],
  });

  return {
    apiVersion: 'projectcontour.io/v1',
    kind: 'HTTPProxy',
    metadata: { name, namespace },
    spec: createSpec(),
  };
};

export const convertRouteToForm = (data) => {
  if (!data) return null;

  const { metadata, spec } = data;
  const { routes, virtualhost, tcpproxy, ingressClassName } = spec || {};
  const firstRoute = routes?.[0] || {};
  const { conditions, services, permitInsecure } = firstRoute;
  const routeServices = tcpproxy?.services || services || [];
  const firstService = routeServices[0] || {};

  const determineTermination = () => {
    if (virtualhost?.tls?.passthrough) return 'Passthrough';
    if (firstService.protocol === 'tls') return 'Re-encrypt';
    return 'Edge';
  };

  const mapServices = (services) =>
    services.map(({ name, weight, port, validation }) => ({
      name,
      weight,
      port,
      enableUpstreamTLS: validation?.caSecret ? true : false,
      caSecret: validation?.caSecret,
      subjectName: validation?.subjectName,
    }));

  return {
    name: metadata?.name,
    namespace: metadata?.namespace,
    ingressClassName,
    prefix: conditions?.[0]?.prefix || '/',
    fqdn: convertToString(virtualhost?.fqdn),
    tls: virtualhost?.tls,
    services: mapServices(routeServices),
    conditional: {
      secureRoute: true,
      permitInsecureStatus: permitInsecure ? 'Allow' : 'None',
      termination: determineTermination(),
      secrets: virtualhost?.tls?.secretName,
    },
  };
};
