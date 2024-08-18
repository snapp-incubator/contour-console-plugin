interface ConditionalType {
  secureRoute?: boolean;
  termination?: string;
  secrets?: string;
  insecureTraffic?: string;
}

interface InputServiceType {
  name: string;
  port: number;
  weight: number;
  caSecret?: boolean;
  subjectName?: string;
}

interface ServiceType {
  name: string;
  port: number;
  weight: number;
  validation?: {
    caSecret: boolean;
    subjectName?: string;
  };
  protocol?: string;
}

interface FormDataType {
  name?: string;
  namespace: string;
  conditional?: ConditionalType;
  ingressClassName?: string;
  prefix?: string;
  fqdn?: string;
  services: InputServiceType[];
}

interface VirtualHostType {
  fqdn?: string;
  tls?: {
    secretName: string;
    enableFallbackCertificate: boolean;
    passthrough?: boolean;
  };
}

interface ModelDataType {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    virtualhost?: VirtualHostType;
    routes: Array<any>;
    ingressClassName?: string;
    httpVersions: string[];
  };
}

export const convertRouteToYML = (
  formData: FormDataType | null,
): ModelDataType | null => {
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
    services,
  } = formData;

  const protocol =
    conditional?.secureRoute && conditional?.termination === 're-encrypt'
      ? 'tls'
      : undefined;

  const enableFallbackCertificate =
    conditional?.termination != 'passthrough' ? true : undefined;
  const passthrough =
    conditional?.termination === 'passthrough' ? true : undefined;

  const secretName =
    conditional?.secureRoute && !passthrough ? conditional?.secrets : undefined;

  const tls = conditional?.termination
    ? {
        secretName,
        passthrough,
        enableFallbackCertificate,
      }
    : undefined;

  const routeServices: ServiceType[] = services.map((service) => {
    const serviceObject: ServiceType = {
      name: service.name,
      port: service.port,
      weight: service.weight,
      ...(protocol && { protocol }),
    };

    if (service?.caSecret) {
      serviceObject.validation = {
        caSecret: service.caSecret,
        subjectName: service.subjectName,
      };
    }

    return serviceObject;
  });

  const sectionServices =
    conditional?.secureRoute && conditional?.termination === 'passthrough'
      ? { tcpproxy: { services: routeServices } }
      : undefined;

  const virtualhost: VirtualHostType = {};
  if (fqdn) {
    virtualhost.fqdn = fqdn;
  }
  if (tls) {
    virtualhost.tls = tls;
  }

  const modelData: ModelDataType = {
    apiVersion: 'projectcontour.io/v1',
    kind: 'HTTPProxy',
    metadata: {
      name,
      namespace,
    },
    spec: {
      ...(Object.keys(virtualhost).length > 0 && { virtualhost }),
      routes:
        conditional?.termination != 'passthrough'
          ? [
              {
                conditions: [{ prefix }],
                services: routeServices,
                loadBalancerPolicy: {
                  strategy: 'Cookie',
                },
                timeoutPolicy: {
                  response: '5s',
                },
              },
            ]
          : undefined,
      ...sectionServices,
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
  const { routes, virtualhost, tcpproxy } = spec || {};
  const firstRoute = routes?.[0] || {};
  const { conditions, services } = firstRoute;

  const routeServices = tcpproxy?.services || services;
  const protocol = routeServices?.[0]?.protocol;
  const tlsTermination = spec.virtualhost.tls.passthrough;
  return {
    name: metadata?.name,
    namespace: metadata?.namespace,
    ingressClassName: spec?.ingressClassName,
    prefix: conditions?.[0]?.prefix || '/',
    fqdn: virtualhost?.fqdn,
    tls: virtualhost?.tls,
    services:
      routeServices?.map((service) => ({
        name: service?.name,
        weight: service?.weight,
        port: service?.port,
        caSecret: service?.validation?.caSecret,
        subjectName: service?.validation?.subjectName,
      })) || [],
    conditional: {
      secureRoute: true,
      termination: tlsTermination
        ? 'Passthrough'
        : protocol === 'tls'
        ? 'Re-encrypt'
        : 'Edge',
      secrets: virtualhost?.tls?.secretName,
    },
  };
};
