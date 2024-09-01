import { load } from 'js-yaml';
import { ServiceType, FormDataType } from './types';
import { convertToDomain, convertToString } from './fqdnHandler';

export const convertRouteToYML = (
  formData: FormDataType | null,
  existingYAML: string,
): string | null => {
  if (!formData) return null;

  // Parse existing YAML
  const existingData = existingYAML ? load(existingYAML) : {};

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

  const createTLS = (): { tls?: any; protocol?: string } => {
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
  const permitInsecure = conditional?.permitInsecure ? true : undefined;

  const updateVirtualHost = (existing: any = {}): any => ({
    ...existing,
    ...(fqdn && { fqdn: convertToDomain(fqdn) }),
    ...(tls && { tls }),
  });

  const updateSpec = (existing: any = {}): any => {
    const updatedSpec: any = {
      ...existing,
      ...(fqdn && { virtualhost: updateVirtualHost(existing.virtualhost) }),
      ...(ingressClassName && { ingressClassName }),
      httpVersions: existing.httpVersions || ['http/1.1'],
    };

    if (!isPassthrough) {
      const existingRoute = existing.routes?.[0] || {};
      updatedSpec.routes = [
        {
          ...existingRoute,
          conditions: [
            { prefix: prefix || existingRoute.conditions?.[0]?.prefix || '/' },
          ],
          permitInsecure: permitInsecure ?? existingRoute.permitInsecure,
          services: routeServices,
          loadBalancerPolicy: existingRoute.loadBalancerPolicy || {
            strategy: 'Cookie',
          },
          timeoutPolicy: existingRoute.timeoutPolicy || { response: '5s' },
        },
      ];
    } else if (isSecureRoute) {
      updatedSpec.tcpproxy = { services: routeServices };
    }

    return updatedSpec;
  };

  const updatedData: any = {
    ...existingData,
    apiVersion: 'projectcontour.io/v1',
    kind: 'HTTPProxy',
    metadata: {
      ...existingData?.metadata,
      ...(name && { name }),
      ...(namespace && { namespace }),
    },
    spec: updateSpec(existingData?.spec),
  };

  return updatedData;
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
    if (virtualhost?.tls?.passthrough) return 'passthrough';
    if (firstService.protocol === 'tls') return 're-encrypt';
    return 'edge';
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
      secureRoute: !!virtualhost?.tls,
      permitInsecure: !!permitInsecure,
      termination: determineTermination(),
      secrets: virtualhost?.tls?.secretName,
    },
  };
};
