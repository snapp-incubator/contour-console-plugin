import { K8Service, K8Secret, FormDataType } from './types';

export function updateSchema(
  originalSchema: any,
  k8Service: K8Service,
  k8Secrets: K8Secret[],
  k8IngressClass: any,
  formData: FormDataType,
): any {
  const newSchema: any = JSON.parse(JSON.stringify(originalSchema));
  const defaultValue = 'openshift-ingress/letsencrypt';

  // Update services enum
  const serviceNamesEnum =
    k8Service?.items?.map((service) => ({
      label: service.metadata.name,
      value: service.metadata.name,
    })) || [];
  newSchema.properties.services.items.properties.name.enum = serviceNamesEnum;

  // Update target ports enum
  const serviceName = formData.services?.[0]?.name || '';
  const targetPortsEnum =
    k8Service?.items
      ?.find((service) => service.metadata.name === serviceName)
      ?.spec.ports.map((port) => ({
        label: port.port.toString(),
        value: port.port,
      })) || [];
  newSchema.properties.services.items.properties.port.enum = targetPortsEnum;

  // Update secrets enum
  const secretsEnum =
    k8Secrets?.map((item) => ({
      label: item.metadata?.name || '',
      value: item.metadata?.name || '',
    })) || [];
  secretsEnum.push({ label: defaultValue, value: defaultValue });

  newSchema.definitions.SecureRoute.dependencies.secureRoute.oneOf[0].properties.secrets.enum =
    secretsEnum;
  newSchema.properties.services.items.dependencies.enableUpstreamTLS.oneOf[0].properties.caSecret.enum =
    secretsEnum;

  // Update ingress class enum
  const ingressClassEnum =
    k8IngressClass?.map((item) => ({
      label: item.metadata?.name || '',
      value: item.metadata?.name || '',
    })) || [];
  newSchema.definitions.proxy.enum = ingressClassEnum;

  return newSchema;
}
