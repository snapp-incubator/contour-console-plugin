interface K8Service {
  items?: Array<{
    metadata: {
      name: string;
    };
    spec: {
      ports: Array<{
        targetPort: string | number;
      }>;
    };
  }>;
}

interface K8Secret {
  metadata?: {
    name: string;
  };
}

interface FormData {
  services?: Array<{
    name?: string;
  }>;
}

interface SchemaProperty {
  type: string;
  title: string;
  enum?: Array<{
    label: string;
    value: string | number;
  }>;
}

export function updateSchema(
  originalSchema: any,
  k8Service: K8Service,
  k8Secrets: K8Secret[],
  formData: FormData,
): any {
  let newSchema: any = JSON.parse(JSON.stringify(originalSchema));

  const getServiceNamesEnum = (): Array<{ label: string; value: string }> => {
    return (
      k8Service?.items?.map((service) => ({
        value: service.metadata.name,
        label: service.metadata.name,
      })) || []
    );
  };

  const getTargetPortsEnum = (
    serviceName: string,
  ): Array<{ label: string; value: string | number }> => {
    const service = k8Service?.items?.find(
      (service) => service.metadata.name === serviceName,
    );

    return (
      service?.spec.ports.map((port) => ({
        label: port.targetPort.toString(),
        value: port.targetPort,
      })) || []
    );
  };

  const serviceName = formData.services?.[0]?.name || '';

  const updatedServicesProperties: { [key: string]: SchemaProperty } = {
    ...newSchema.properties.services.items.properties,
    name: {
      type: 'string',
      title: 'Service Name',
      enum: getServiceNamesEnum(),
    },
    port: {
      type: 'string',
      title: 'Target Port',
      enum: getTargetPortsEnum(serviceName),
    },
    protocol: {
      type: 'string',
      title: 'Protocol',
      enum: [
        { label: 'HTTP', value: 'http' },
        { label: 'HTTPS', value: 'https' },
      ],
    },
  };

  newSchema.properties.services.items.properties = updatedServicesProperties;
  if (!newSchema.properties.services.items.required.includes('protocol')) {
    newSchema.properties.services.items.required.push('protocol');
  }

  newSchema.definitions.SecureRoute.dependencies.secureRoute.oneOf[0].properties.secrets.enum =
    k8Secrets?.map((item) => ({
      label: item.metadata?.name || '',
      value: item.metadata?.name || '',
    })) || [];

  newSchema.properties.services.items.properties.caSecret.enum =
    k8Secrets?.map((item) => ({
      label: item.metadata?.name || '',
      value: item.metadata?.name || '',
    })) || [];

  return newSchema;
}
