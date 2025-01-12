import React from 'react';
import {
  FormGroup,
  TextInput,
  Switch,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Service } from '../../types';
import CustomDropdown from '../shared/CustomDropdown';

interface ServiceFormProps {
  service: Service;
  onChange: (service: Service) => void;
  availableServices: string[];
  availablePorts: string[];
  availableSecrets: string[];
  onDelete?: () => void;
}

const ServiceForm = ({
  service,
  onChange,
  availableServices,
  availablePorts,
  availableSecrets,
  onDelete,
}: ServiceFormProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  return (
    <div className="service-form pf-c-form">
      <FormGroup fieldId="service-2" label="Service Name" isRequired>
        <CustomDropdown
          options={availableServices.map((name) => ({
            label: name,
            value: name,
          }))}
          value={service.name}
          onChange={(value) => onChange({ ...service, name: value })}
          placeholder="Select a service"
        />
      </FormGroup>

      <FormGroup fieldId="port" label="Port" isRequired>
        <CustomDropdown
          options={availablePorts.map((port) => ({ label: port, value: port }))}
          value={service.port}
          onChange={(value) => onChange({ ...service, port: value })}
          placeholder="Select a port"
        />
        <div className="help-block">{t('target_port_traffic')}</div>
      </FormGroup>

      <FormGroup fieldId="weight" label="Weight">
        <TextInput
          type="number"
          value={service.weight}
          min={0}
          max={100}
          onChange={(value) =>
            onChange({ ...service, weight: parseInt(value) })
          }
        />
        <div className="help-block">{t('weight_service_route')}</div>
      </FormGroup>

      <FormGroup fieldId="validation" label="Enable Validation">
        <Switch
          id="validation-switch"
          label="Enable Validation"
          isChecked={service.validation}
          onChange={(checked) => onChange({ ...service, validation: checked })}
        />
      </FormGroup>

      {service.validation ? (
        <>
          <FormGroup fieldId="Secret" label="CA Secret" isRequired>
            <CustomDropdown
              options={availableSecrets.map((name) => ({
                label: name,
                value: name,
              }))}
              value={service.caSecret}
              onChange={(value) => onChange({ ...service, caSecret: value })}
              placeholder="Select a secret"
            />
          </FormGroup>

          <FormGroup fieldId="subject" label="Subject Name" isRequired>
            <TextInput
              value={service.subjectName}
              onChange={(value) => onChange({ ...service, subjectName: value })}
            />
          </FormGroup>
        </>
      ) : null}

      <FormGroup fieldId="websocket" label="Enable WebSocket">
        <Switch
          id="websocket-switch"
          label="Enable WebSocket"
          isChecked={service.websocket}
          onChange={(checked) => onChange({ ...service, websocket: checked })}
        />
      </FormGroup>
      {service.websocket ? (
        <Flex>
          <FlexItem>
            <FormGroup fieldId="idle" label="Idle Connection Timeout (seconds)">
              <TextInput
                type="number"
                value={service.idleConnection}
                onChange={(value) =>
                  onChange({ ...service, idleConnection: value })
                }
              />
            </FormGroup>
          </FlexItem>
          <FlexItem>
            <FormGroup fieldId="response" label="Response Timeout (minutes)">
              <TextInput
                type="number"
                value={service.responseTimeout}
                onChange={(value) =>
                  onChange({ ...service, responseTimeout: value })
                }
              />
            </FormGroup>
          </FlexItem>
        </Flex>
      ) : null}
    </div>
  );
};

export default ServiceForm;
