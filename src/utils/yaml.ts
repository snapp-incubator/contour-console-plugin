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
    routes: Array<{
      conditions: Array<{ prefix: string }>;
      services?: ServiceType[];
      tcpproxy?: {
        services: ServiceType[];
      };
      loadBalancerPolicy: {
        strategy: string;
      };
      timeoutPolicy: {
        response: string;
      };
    }>;
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
    (conditional?.secureRoute && conditional?.termination) === 're-encrypt'
      ? 'tls'
      : undefined;

  const secretName = conditional?.secureRoute
    ? conditional?.secrets
    : undefined;
  const passthrough =
    conditional?.insecureTraffic === 'redirect' ? true : undefined;
  const tls =
    (secretName && conditional?.termination) === 're-encrypt'
      ? {
          secretName,
          passthrough,
          enableFallbackCertificate: true,
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
      : { services: routeServices };

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
        caSecret: service?.validation?.caSecret,
        subjectName: service?.validation?.subjectName,
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
