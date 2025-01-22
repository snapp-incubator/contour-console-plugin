import React from 'react';
import { FormGroup, TextInput, Button } from '@patternfly/react-core';
import { RouteFormProps, Service } from '../../types';
import ServiceForm from './ServiceForm';
import { DEFAULT_SERVICE } from '../../constants';
import { useTranslation } from 'react-i18next';
import { Flex, FlexItem } from '@patternfly/react-core';

const RouteForm = ({
  route,
  onChange,
  onDelete,
  availableServices,
  availableSecrets,
}: RouteFormProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  const servicesWithPorts = availableServices.map((svc) => ({
    name: svc.metadata.name,
    ports:
      svc.spec.ports?.map((port) => ({
        port: port.port,
        name: port.name,
      })) || [],
  }));

  const addService = () => {
    onChange({
      ...route,
      services: [...route.services, { ...DEFAULT_SERVICE }],
    });
  };

  const updateService = (index: number, updatedService: Service) => {
    const newServices = [...route.services];
    newServices[index] = updatedService;
    onChange({ ...route, services: newServices });
  };

  const removeService = (index: number) => {
    const newServices = route.services.filter((_, i) => i !== index);
    onChange({ ...route, services: newServices });
  };

  return (
    <div className="wrapper-route">
      <div className="pf-u-pt-md">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            {onDelete && (
              <Button
                className="delete-button"
                variant="link"
                onClick={onDelete}
              >
                <span className="fa fa-minus-circle pf-u-mr-xs"></span>
                {t('remove_route')}
              </Button>
            )}
          </FlexItem>
        </Flex>
      </div>
      <div>
        <FormGroup
          className="pf-u-pt-md"
          fieldId="path"
          label="Path"
          isRequired
        >
          <TextInput
            value={route.prefix}
            onChange={(value) => onChange({ ...route, prefix: value })}
            placeholder="/"
          />
          <div className="help-block">{t('path_service_route')}</div>
        </FormGroup>
        <div className="pf-u-mt-md">
          {route.services.map((service, index) => (
            <div key={index} className="pf-u-mb-md">
              <div>
                {route.services.length > 1 && (
                  <Button
                    className="delete-button"
                    variant="link"
                    onClick={() => removeService(index)}
                  >
                    <span className="fa fa-minus-circle pf-u-mr-xs"></span>
                    {t('remove_service')}
                  </Button>
                )}
                <ServiceForm
                  service={service}
                  onChange={(updatedService) =>
                    updateService(index, updatedService)
                  }
                  availableServices={servicesWithPorts}
                  availableSecrets={availableSecrets}
                />
              </div>
            </div>
          ))}
        </div>
        <Button variant="link" onClick={addService}>
          <span className="fa fa-plus-circle pf-u-mr-xs"></span>
          {t('add_service')}
        </Button>
      </div>
    </div>
  );
};

export default RouteForm;
