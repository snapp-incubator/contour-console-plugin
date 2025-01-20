import React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  Switch,
  Button,
} from '@patternfly/react-core';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ContourFormProps, Route } from '../../types';
import { useK8sResources } from '../../hooks/useK8sResources';
import RouteForm from './RouteForm';
import CustomDropdown from '../shared/CustomDropdown';
import { DEFAULT_ROUTE } from '../../constants';

const ContourForm = ({
  formData,
  updateFormData,
  onChange,
  isEdit = false,
  onSubmit,
}: ContourFormProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const { ns: namespace } = useParams<{ ns: string; name?: string }>();
  const { services, secrets, ingressClasses } = useK8sResources(namespace);

  const addRoute = () => {
    const newFormData = {
      ...formData,
      routes: [...formData.routes, { ...DEFAULT_ROUTE }],
    };
    updateFormData(newFormData);
    onChange(newFormData);
  };

  const updateRoute = (index: number, updatedRoute: Route) => {
    const newRoutes = [...formData.routes];
    newRoutes[index] = updatedRoute;
    const newFormData = { ...formData, routes: newRoutes };
    updateFormData(newFormData);
    onChange(newFormData);
  };

  const removeRoute = (index: number) => {
    const newRoutes = formData.routes.filter((_, i) => i !== index);
    const newFormData = { ...formData, routes: newRoutes };
    updateFormData(newFormData);
    onChange(newFormData);
  };

  const handleFormChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    updateFormData(newFormData);
    onChange(newFormData);
  };

  const handleConditionalChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      conditional: {
        ...formData.conditional,
        [field]: value,
      },
    };
    updateFormData(newFormData);
    onChange(newFormData);
  };

  return (
    <>
      <Form onSubmit={onSubmit}>
        <FormGroup
          className="pf-u-mt-md"
          fieldId="name"
          label={t('name')}
          isRequired
        >
          <TextInput
            isDisabled={isEdit}
            value={formData?.name}
            onChange={(value) => handleFormChange('name', value)}
          />
          <div className="help-block">{t('unique_name_for_Proxy')}</div>
        </FormGroup>
        <FormGroup fieldId="proxy_type" label={t('http_proxy_type')} isRequired>
          <CustomDropdown
            options={ingressClasses?.map((ic) => ({
              label: ic.label,
              value: ic.value,
            }))}
            value={formData?.ingressClassName}
            onChange={(value) => handleFormChange('ingressClassName', value)}
            placeholder={t('private')}
          />
          <div className="help-block">{t('http_proxy_type')}</div>
        </FormGroup>

        <FormGroup fieldId="hostname" label={t('hostname')} isRequired>
          <TextInput
            value={formData?.fqdn}
            onChange={(value) => handleFormChange('fqdn', value)}
          />
          <div className="help-block">{t('hostname_http_proxies')}</div>
        </FormGroup>
        <div className="pf-c-form__group ">
          {formData?.routes?.map((route, index) => (
            <div key={index} className="pf-u-mb-md">
              <RouteForm
                route={route}
                onChange={(updatedRoute) => updateRoute(index, updatedRoute)}
                onDelete={() => removeRoute(index)}
                availableServices={services?.map((svc) => svc.metadata.name)}
                availablePorts={services?.flatMap((svc) =>
                  svc.spec.ports?.map((port) => port.port.toString()),
                )}
                availableSecrets={secrets?.map(
                  (secret) => secret.metadata.name,
                )}
              />
            </div>
          ))}
          <Button variant="link" onClick={addRoute} className="pf-u-mt-md">
            <span className="fa fa-plus-circle pf-u-mr-xs"></span>
            {t('add_route')}
          </Button>
        </div>
        <div>
          <div>
            <FormGroup fieldId="secure_route" label={t('security')}>
              <Switch
                id="secure-route"
                label={t('secure_route')}
                isChecked={formData?.conditional?.secureRoute}
                onChange={(checked) =>
                  handleConditionalChange('secureRoute', checked)
                }
              />
            </FormGroup>

            {formData?.conditional?.secureRoute && (
              <>
                <FormGroup
                  className="pf-u-mt-md"
                  fieldId="tls_termination"
                  isRequired
                >
                  <CustomDropdown
                    options={[
                      { label: 'Edge', value: 'edge' },
                      { label: 'Passthrough', value: 'passthrough' },
                      { label: 'Re-encrypt', value: 're-encrypt' },
                    ]}
                    value={formData.conditional.termination}
                    onChange={(value) => {
                      updateFormData((prev) => ({
                        ...prev,
                        conditional: {
                          ...prev.conditional,
                          termination: value,
                        },
                      }));
                    }}
                    placeholder={t('select_termination')}
                  />
                  <div className="help-block">
                    {t('route_tls_certificates')}
                  </div>
                </FormGroup>

                <FormGroup className="pf-u-mt-md" fieldId="permit_insecure">
                  <Switch
                    id="permit-insecure"
                    label={t('allow_insecure_traffic')}
                    isChecked={formData?.conditional?.permitInsecure}
                    onChange={(checked) =>
                      updateFormData((prev) => ({
                        ...prev,
                        conditional: {
                          ...prev.conditional,
                          permitInsecure: checked,
                        },
                      }))
                    }
                  />
                </FormGroup>

                {formData?.conditional?.termination !== 'passthrough' && (
                  <FormGroup
                    className="pf-u-mt-md"
                    fieldId="secret"
                    label={t('secret')}
                    isRequired
                  >
                    <CustomDropdown
                      options={secrets.map((secret) => ({
                        label: secret.metadata.name,
                        value: secret.metadata.name,
                      }))}
                      value={formData?.conditional.secrets}
                      onChange={(value) =>
                        updateFormData((prev) => ({
                          ...prev,
                          conditional: {
                            ...prev.conditional,
                            secrets: value,
                          },
                        }))
                      }
                      placeholder={t('select_secret')}
                    />
                    <div className="help-block">{t('secret_info')}</div>
                  </FormGroup>
                )}
              </>
            )}
          </div>
        </div>
      </Form>
    </>
  );
};

export default ContourForm;
