import { FormGroup, TextInput, Button, Switch } from '@patternfly/react-core';
import { RouteFormProps, Service } from '../../types/form';
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
      services: [...(route.services || []), { ...DEFAULT_SERVICE }],
    });
  };

  const updateService = (index: number, updatedService: Service) => {
    const newServices = [...route.services];
    newServices[index] = {
      ...updatedService,
      weight:
        typeof updatedService.weight === 'number' ? updatedService.weight : 0,
    };
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
            {onDelete ? (
              <Button
                className="delete-button"
                variant="link"
                onClick={onDelete}
              >
                <span className="fa fa-minus-circle pf-u-mr-xs"></span>
                {t('remove_route')}
              </Button>
            ) : null}
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
          {route?.services?.map((service, index) => (
            <div key={index} className="pf-u-mb-md">
              <div>
                {route.services.length > 1 ? (
                  <Button
                    className="delete-button"
                    variant="link"
                    onClick={() => removeService(index)}
                  >
                    <span className="fa fa-minus-circle pf-u-mr-xs"></span>
                    {t('remove_service')}
                  </Button>
                ) : null}
                <ServiceForm
                  service={service}
                  onChange={(updatedService) => {
                    updateService(index, updatedService);
                  }}
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
        <FormGroup
          fieldId="websocket"
          className="pf-u-mb-md"
          label={t('enable_websocket')}
        >
          <Switch
            label={t('enable_websocket')}
            isChecked={route.websocket}
            onChange={(checked) => onChange({ ...route, websocket: checked })}
          />
        </FormGroup>
        <FormGroup
          fieldId="permit_insecure"
          className="pf-u-mb-md"
          label={t('allow_insecure_traffic')}
        >
          <Switch
            label={t('allow_insecure_traffic')}
            isChecked={route.permitInsecure || false}
            onChange={(checked) =>
              onChange({ ...route, permitInsecure: checked })
            }
          />
        </FormGroup>
        <Flex>
          <FlexItem>
            <FormGroup fieldId="idle" label={t('idle_connection_timeout')}>
              <TextInput
                type="number"
                value={(route.idleConnection as string) || '15'}
                onChange={(value) =>
                  onChange({ ...route, idleConnection: value })
                }
                onWheel={(e) => {
                  e.currentTarget.blur();
                }}
              />
            </FormGroup>
          </FlexItem>
          <FlexItem>
            <FormGroup
              className="pf-u-mb-lg"
              fieldId="response"
              label={t('response_timeout')}
            >
              <TextInput
                type="number"
                value={(route.responseTimeout as string) || '5'}
                onChange={(value) =>
                  onChange({ ...route, responseTimeout: value })
                }
                onWheel={(e) => {
                  e.currentTarget.blur();
                }}
              />
            </FormGroup>
          </FlexItem>
        </Flex>
      </div>
    </div>
  );
};

export default RouteForm;
