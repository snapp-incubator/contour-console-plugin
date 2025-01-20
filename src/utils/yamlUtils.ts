import { dump } from 'js-yaml';
import { FormData } from '../types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { load } from 'js-yaml';
import { convertToDomain } from '../utils/fqdnHandler';

export const convertFormToYAML = (formData: FormData): string => {
  const k8sObject = {
    apiVersion: 'projectcontour.io/v1',
    kind: 'HTTPProxy',
    metadata: {
      name: formData.name,
      namespace: formData.namespace,
      resourceVersion: formData.resourceVersion,
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
          timeoutPolicy: {
            idle: `${service.idleConnection}s`,
            response: `${service.responseTimeout}s`,
          },
        })),
        ...(formData.conditional?.permitInsecure && {
          permitInsecure: true,
        }),
      })),
      ingressClassName: formData.ingressClassName,
    },
  };

  return dump(k8sObject, { noRefs: true, lineWidth: -1 });
};

export const convertK8sToForm = (k8sResource: K8sResourceCommon): FormData => {
  const spec = (k8sResource as any).spec;
  return {
    name: k8sResource.metadata.name,
    namespace: k8sResource.metadata.namespace,
    resourceVersion: k8sResource.metadata.resourceVersion,
    ingressClassName: spec.ingressClassName,
    fqdn: spec.virtualhost.fqdn,
    routes: spec.routes.map((route) => ({
      prefix: route.conditions?.[0]?.prefix || '/',
      services: route.services.map((service) => ({
        name: service.name,
        port: service.port.toString(),
        weight: service.weight || 100,
        validation: !!service.validation,
        caSecret: service.validation?.caSecret,
        subjectName: service.validation?.subjectName,
        websocket: false,
        idleConnection: service.timeoutPolicy?.idle?.replace('s', '') || '15',
        responseTimeout:
          service.timeoutPolicy?.response?.replace('s', '') || '5',
      })),
    })),
    conditional: spec.virtualhost.tls
      ? {
          secureRoute: true,
          termination: spec.virtualhost.tls.passthrough
            ? 'passthrough'
            : 'edge',
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
  try {
    const yamlData = load(yamlString) as K8sResourceCommon;

    return convertK8sToForm(yamlData);
  } catch (error) {
    console.error('Error parsing YAML:', error);
    return null;
  }
};
