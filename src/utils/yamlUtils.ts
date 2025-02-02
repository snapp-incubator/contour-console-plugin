import { dump, load } from 'js-yaml';
import { FormData, Route } from '../types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { convertToDomain } from './fqdnHandler';
import { HTTP_PROXY_TEMPLATE, TLS_TERMINATION } from '../constants';

const deepMerge = (target: any, source: any): any => {
  if (Array.isArray(source)) {
    return source;
  }

  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

const createRouteObject = (route: Route, originalRoute?: any) => {
  const routeObject = {
    conditions: [{ prefix: route.prefix || '/' }],
    ...(route.websocket !== undefined && { enableWebsockets: route.websocket }),
    ...(route.permitInsecure !== undefined && {
      permitInsecure: route.permitInsecure,
    }),
    timeoutPolicy: {
      idle: `${route.idleConnection || '15'}s`,
      response: `${route.responseTimeout || '5'}s`,
    },
    services: route.services.map((service) => ({
      ...(service.name && { name: service.name }),
      ...(service.port && { port: parseInt(service.port) }),
      ...(service.weight && { weight: service.weight }),
      ...(service.validation && {
        validation: {
          ...(service.caSecret && { caSecret: service.caSecret }),
          ...(service.subjectName && { subjectName: service.subjectName }),
        },
      }),
    })),
  };

  return originalRoute ? deepMerge(originalRoute, routeObject) : routeObject;
};

export const createYAMLFromTemplate = (template: any, data: any): string => {
  try {
    const mergedData = deepMerge(template, data);
    return dump(mergedData, { noRefs: true, lineWidth: -1 });
  } catch (error) {
    console.error('Error creating YAML:', error);
    return '';
  }
};

export const convertFormToYAML = (
  formData: FormData,
  originalResponse?: any,
): string => {
  const baseObject = originalResponse || HTTP_PROXY_TEMPLATE;

  const updatedObject = {
    ...baseObject,
    metadata: {
      ...baseObject.metadata,
      ...(formData.name && { name: formData.name }),
      ...(formData.namespace && { namespace: formData.namespace }),
      ...(formData.resourceVersion && {
        resourceVersion: formData.resourceVersion,
      }),
      ...(formData.labels && { labels: formData.labels }),
      ...(formData.annotations && { annotations: formData.annotations }),
    },
    spec: {
      ...baseObject.spec,
      ...(formData?.ingressClassName && {
        ingressClassName: formData?.ingressClassName,
      }),
      virtualhost: {
        ...baseObject.spec?.virtualhost,
        ...(formData.fqdn && {
          fqdn: convertToDomain(formData.ingressClassName, formData.fqdn),
        }),
        ...(formData?.conditional?.secureRoute !== undefined && {
          tls: formData.conditional.secureRoute
            ? {
                secretName: formData?.conditional?.secrets,
                ...(formData?.conditional?.termination ===
                TLS_TERMINATION.PASSTHROUGH
                  ? { passthrough: true }
                  : { enableFallbackCertificate: true }),
              }
            : undefined,
        }),
      },
      ...(formData?.routes && {
        routes: formData?.routes?.map((route: Route) => {
          const originalRoute = originalResponse?.spec?.routes?.find(
            (r: any) => r.conditions?.[0]?.prefix === route.prefix,
          );
          return createRouteObject(route, originalRoute);
        }),
      }),
    },
  };

  return dump(updatedObject, { noRefs: true, lineWidth: -1 });
};

export const parseYAML = (yamlString: string): any => {
  try {
    return load(yamlString);
  } catch (error) {
    throw new Error(`Error parsing YAML: ${error.message}`);
  }
};

export const convertK8sToForm = (k8sResource: K8sResourceCommon): FormData => {
  const spec = (k8sResource as any).spec;

  return {
    name: k8sResource?.metadata?.name,
    namespace: k8sResource?.metadata?.namespace,
    resourceVersion: k8sResource?.metadata?.resourceVersion,
    ingressClassName: spec?.ingressClassName,
    fqdn: spec?.virtualhost?.fqdn,
    labels: k8sResource?.metadata?.labels,
    annotations: k8sResource?.metadata?.annotations,
    routes: spec?.routes?.map((route) => ({
      prefix: route?.conditions?.[0]?.prefix || '/',
      websocket: route?.enableWebsockets || false,
      idleConnection: route?.timeoutPolicy?.idle?.replace('s', '') || '15',
      responseTimeout: route?.timeoutPolicy?.response?.replace('s', '') || '5',
      permitInsecure: route?.permitInsecure || false,
      services: route?.services?.map((service) => ({
        name: service.name,
        port: service.port.toString(),
        weight: service.weight || 100,
        validation: !!service.validation,
        caSecret: service?.validation?.caSecret,
        subjectName: service?.validation?.subjectName,
      })),
    })),
    conditional: spec?.virtualhost?.tls
      ? {
          secureRoute: true,
          termination: spec?.virtualhost?.tls?.passthrough
            ? TLS_TERMINATION.PASSTHROUGH
            : TLS_TERMINATION.EDGE,
          permitInsecure: spec?.routes?.[0]?.permitInsecure || false,
          secrets: spec?.virtualhost?.tls?.secretName,
        }
      : {
          secureRoute: false,
          permitInsecure: false,
        },
  };
};

export const convertYAMLToForm = (yamlString: string): FormData | null => {
  const yamlData = parseYAML(yamlString);
  return yamlData ? convertK8sToForm(yamlData) : null;
};
