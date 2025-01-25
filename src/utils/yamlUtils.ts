import { dump, load } from 'js-yaml';
import { FormData } from '../types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { convertToDomain } from '../utils/fqdnHandler';
import { HTTP_PROXY_TEMPLATE, TLS_TERMINATION } from '../constants';

export const createYAMLFromTemplate = (template: any, data: any): string => {
  try {
    const mergedData = deepMerge(template, data);
    return dump(mergedData, { noRefs: true, lineWidth: -1 });
  } catch (error) {
    console.error('Error creating YAML:', error);
    return '';
  }
};

export const convertFormToYAML = (formData: FormData): string => {
  const k8sObject = {
    metadata: {
      name: formData.name,
      namespace: formData.namespace,
      resourceVersion: formData.resourceVersion,
      labels: formData.labels,
      annotations: formData.annotations,
    },
    spec: {
      virtualhost: {
        fqdn: convertToDomain(formData.fqdn),
        ...(formData.conditional?.secureRoute && {
          tls: {
            secretName: formData.conditional.secrets,
            ...(formData.conditional.termination === 'passthrough' && {
              passthrough: true,
            }),
            enableFallbackCertificate:
              formData.conditional.termination !== 'passthrough',
          },
        }),
      },
      routes: formData.routes.map((route) => ({
        conditions: [{ prefix: route.prefix || '/' }],
        services: route.services.map((service) => ({
          name: service.name,
          port: service.port ? parseInt(service.port) : '',
          weight: service.weight,
          ...(service.validation && {
            validation: {
              caSecret: service.caSecret,
              subjectName: service.subjectName,
            },
          }),
          ...(service.websocket && {
            timeoutPolicy: {
              idle: `${service.idleConnection}s`,
              response: `${service.responseTimeout}s`,
            },
          }),
        })),
        ...(formData.conditional?.permitInsecure && {
          permitInsecure: true,
        }),
      })),
      ingressClassName: formData.ingressClassName,
    },
  };

  return createYAMLFromTemplate(HTTP_PROXY_TEMPLATE, k8sObject);
};

export const parseYAML = (yamlString: string): any => {
  try {
    return load(yamlString);
  } catch (error) {
    console.error('Error parsing YAML:', error);
    return null;
  }
};

export const convertK8sToForm = (k8sResource: K8sResourceCommon): FormData => {
  const spec = (k8sResource as any).spec;
  return {
    name: k8sResource.metadata.name,
    namespace: k8sResource.metadata.namespace,
    resourceVersion: k8sResource.metadata.resourceVersion,
    ingressClassName: spec.ingressClassName,
    fqdn: spec.virtualhost.fqdn,
    labels: k8sResource.metadata.labels,
    annotations: k8sResource.metadata.annotations,
    routes: spec.routes.map((route) => ({
      prefix: route.conditions?.[0]?.prefix || '/',
      services: route.services.map((service) => ({
        name: service.name,
        port: service.port.toString(),
        weight: service.weight || 100,
        validation: !!service.validation,
        caSecret: service.validation?.caSecret,
        subjectName: service.validation?.subjectName,
        websocket: service.timeoutPolicy || false,
        idleConnection: service.timeoutPolicy?.idle?.replace('s', '') || '15',
        responseTimeout:
          service.timeoutPolicy?.response?.replace('s', '') || '5',
      })),
    })),
    conditional: spec.virtualhost.tls
      ? {
          secureRoute: true,
          termination: spec.virtualhost.tls.passthrough
            ? TLS_TERMINATION.PASSTHROUGH
            : TLS_TERMINATION.EDGE,
          permitInsecure: spec.routes?.[0]?.permitInsecure || false,
          secrets: spec.virtualhost.tls.secretName,
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

// Helper function to deep merge objects
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
