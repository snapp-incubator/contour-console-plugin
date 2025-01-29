import React from 'react';
import { FormGroup, TextInput, Switch } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Service } from '../../types/form';
import CustomDropdown from '../shared/CustomDropdown';
import { AlertPopover } from '../popover';

interface ServiceFormProps {
  service: Service;
  onChange: (service: Service) => void;
  availableServices: Array<{
    name: string;
    ports: Array<{ port: number; name?: string }>;
  }>;
  availableSecrets: string[];
  onDelete?: () => void;
}

const ServiceForm = ({
  service,
  onChange,
  availableServices,
  availableSecrets,
  onDelete,
}: ServiceFormProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  // Get available ports for the selected service
  const selectedService = availableServices.find(
    (svc) => svc.name === service.name,
  );
  const availablePorts =
    selectedService?.ports.map((port) => ({
      label: port.name ? `${port.port} (${port.name})` : port.port.toString(),
      value: port.port.toString(),
    })) || [];

  const isValidWeight = (weight: number): boolean => {
    return !isNaN(weight) && weight >= 0 && weight <= 100;
  };

  return (
    <div className="service-form pf-c-form">
      <FormGroup fieldId="service-2" label={t('service_name')} isRequired>
        <CustomDropdown
          options={availableServices.map((svc) => ({
            label: svc.name,
            value: svc.name,
          }))}
          value={service.name}
          onChange={(value) => {
            // Reset port when service changes
            onChange({ ...service, name: value, port: '' });
          }}
          placeholder="Select a service"
        />
      </FormGroup>

      <FormGroup fieldId="port" label={t('port')} isRequired>
        <CustomDropdown
          options={availablePorts}
          value={service.port}
          onChange={(value) => onChange({ ...service, port: value })}
          placeholder="Select a port"
          isDisabled={!service.name}
        />
        <div className="help-block">{t('target_port_traffic')}</div>
      </FormGroup>

      <FormGroup
        fieldId="weight"
        label={t('weight')}
        helperTextInvalid={t('weight_range_error')}
        validated={isValidWeight(service.weight) ? 'default' : 'error'}
      >
        <TextInput
          type="number"
          value={service.weight}
          min={0}
          max={100}
          onChange={(value) => {
            const numValue = value === '' ? 0 : parseInt(value);
            onChange({ ...service, weight: numValue });
          }}
          onWheel={(e) => {
            e.currentTarget.blur();
          }}
          validated={isValidWeight(service.weight) ? 'default' : 'error'}
        />
        <div className="help-block">{t('weight_service_route')}</div>
      </FormGroup>

      <FormGroup fieldId="validation" label={t('enable_validation')}>
        <Switch
          label="Enable Validation"
          isChecked={service.validation}
          onChange={(checked) => onChange({ ...service, validation: checked })}
        />
      </FormGroup>

      {service.validation ? (
        <>
          <FormGroup fieldId="Secret" label={t('ca_secret')} isRequired>
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

          <FormGroup
            fieldId="subject"
            label={
              <div>
                <span>{t('subject_name')}</span>
                <span>
                  <AlertPopover
                    content={
                      <div>
                        <div>{t('validation_info')}</div>
                        <div className="pf-u-mt-sm">
                          {t('validation_info_note')}
                        </div>
                      </div>
                    }
                    title={t('info')}
                  />
                </span>
              </div>
            }
            isRequired
          >
            <TextInput
              value={service.subjectName}
              onChange={(value) => onChange({ ...service, subjectName: value })}
            />
          </FormGroup>
        </>
      ) : null}
    </div>
  );
};

export default ServiceForm;
