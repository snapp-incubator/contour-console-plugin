import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Helmet from 'react-helmet';
import * as cx from 'classnames';

import {
  Page,
  PageSection,
  Divider,
  FormGroup,
  Radio,
  AlertGroup,
  Alert,
  Button,
  Checkbox,
  ActionGroup,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import MinusCircleIcon from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import yamlParser from 'js-yaml';

import {
  k8sCreate,
  k8sGet,
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  mockHttpProxyFormData,
  mockServicesData,
  mockSecrets,
  labelRouterMapping,
} from '../utils/modelK8s';
import DynamicDropdown from './Dropdown';
import { ServiceType, CreateRouteProps, yamlParserType } from '../utils/types';
import './style.css';

const NamespacePageContent = ({ namespace }: { namespace?: string }) => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  const history = useHistory();
  const [yamlView, setYamlView] = React.useState(false);
  const [yamlData, setYamlData] = React.useState();
  const [isSecureRouteChecked, setIsSecureRouteChecked] = React.useState(false);
  const [alternateService, setAlternateService] = React.useState(false);
  const [selectedSecret, setSelectedSecret] = React.useState<string>('');
  const [errData, setErrData] = React.useState<string>();
  const [k8sService, setK8sService] = React.useState<any>();
  const [selectedRouteKey, setSelectedRouteKey] = React.useState<string | null>(
    'public',
  );
  const [selectedRouteType, setSelectedRouteType] = React.useState<
    string | null
  >('');
  const [selectedServices, setSelectedServices] = React.useState<ServiceType[]>(
    [
      {
        name: null,
        weight: 100,
        port: null,
      },
    ],
  );
  const [k8sSecrets, setK8sSecrets] = React.useState<any>();
  const [formData, setFormData] = React.useState({
    metadataName: '',
    metadataNamespace: namespace,
    specHost: '',
    specPath: '/',
    specToName: '',
    specTls: '',
    labelsRole: '',
    services: {},
    labelsRouter: '',
    targetPort: '',
    secretName: '',
    enableFallbackCertificate: false,
  });
  const [k8sModel] = useK8sModel(
    getGroupVersionKindForResource(mockHttpProxyFormData(formData)),
  );
  const [k8sModelService] = useK8sModel(
    getGroupVersionKindForResource(mockServicesData),
  );
  const [k8sModelSecret] = useK8sModel(
    getGroupVersionKindForResource(mockSecrets),
  );

  const handleYamlChange = (newValue: string) => {
    const SCHEMA = yamlParser.Schema.create(yamlParserType);
    const mocData = yamlParser.load(newValue, { schema: SCHEMA });
    setYamlData(yamlParser.dump(mocData, { schema: SCHEMA }));
  };

  const onChangeRadio = (checked: boolean, event) => {
    setYamlView(event.target.value === 'yaml');
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleServiceSelect = (service: string, index) => {
    setAlternateService(true);
    const updatedServices = [...selectedServices];
    updatedServices[index].name = service;
    setSelectedServices(updatedServices);
  };

  const handleInputWeightChange = (value: number, index) => {
    const updatedServices = [...selectedServices];
    updatedServices[index].weight = value;
    setSelectedServices(updatedServices);
  };

  const addService = () => {
    setSelectedServices((prev) => [
      ...prev,
      {
        name: null,
        port: null,
        weight: 100,
      },
    ]);
  };

  const handleSecureRouteChecked = () => {
    setIsSecureRouteChecked(!isSecureRouteChecked);
    k8sGetSecrets();
    setFormData((prevData) => ({
      ...prevData,
      enableFallbackCertificate: !formData.enableFallbackCertificate,
    }));
  };

  const handlePortSelect = (selectedPort, serviceIndex) => {
    const updatedServices = [...selectedServices];
    updatedServices[serviceIndex].port = parseInt(selectedPort);
    setSelectedServices(updatedServices);
  };

  const removeService = (index: number) => {
    const updatedServices = [...selectedServices];
    updatedServices.splice(index, 1);
    setSelectedServices(updatedServices);
  };

  React.useEffect(() => {
    setYamlData(yamlParser.dump(mockHttpProxyFormData(formData)));
  }, [formData]);

  React.useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      services: selectedServices,
      labelsRouter: selectedRouteKey,
      secretName: selectedSecret,
    }));
  }, [selectedServices, selectedRouteKey, selectedSecret]);

  React.useEffect(() => {
    setYamlData(yamlParser.dump(mockHttpProxyFormData(formData)));
    k8sGetServices();
  }, []);

  const handleInputChange = React.useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const k8sCreateRoute = () => {
    k8sCreate({ model: k8sModel, data: mockHttpProxyFormData(formData) })
      .then((response) => {
        history.goBack();
      })
      .catch((e) => {
        setErrData(e.message);
      });
  };

  const k8sGetServices = () => {
    k8sGet({
      model: k8sModelService,
      ns: namespace,
    })
      .then((response) => {
        setK8sService(response);
      })
      .catch((e) => {
        setErrData(e.message);
        console.error(e);
      });
  };

  const k8sGetSecrets = () => {
    k8sGet({
      model: k8sModelSecret,
      ns: namespace,
    })
      .then((response) => {
        setK8sSecrets(response);
      })
      .catch((e) => {
        setErrData(e.message);
        console.error(e);
      });
  };

  return (
    <React.Fragment>
      <Helmet>
        <title data-test="contour-page-title">{t('HTTPProxies')}</title>
      </Helmet>
      <Page>
        <PageSection id="create-route-contour" variant="light">
          <Title headingLevel="h1">{t('HTTPProxies')}</Title>
          <span className="sub-title pf-v5-u-color-200">
            {t('Routing is a way to make your application publicly visible.')}
          </span>
          <Divider />
          <div className="type-create-route">
            <FormGroup
              role="radiogroup"
              isInline
              fieldId="basic-form-radio-group"
            >
              <span>{t('Configure via:')}</span>
              <Radio
                name="route-configure"
                checked={!yamlView}
                onChange={onChangeRadio}
                value="form"
                label="Form View"
                id="basic-inline-formview"
              />
              <Radio
                name="route-configure"
                checked={yamlView}
                onChange={onChangeRadio}
                value="yaml"
                label="YAML View"
                id="basic-inline-yamlview"
              />
            </FormGroup>
          </div>
          <Divider />
          {!yamlView ? (
            <div className="form-route co-m-pane__form">
              <div className="form-group co-create-route__name">
                <label className="co-required" htmlFor="name">
                  {t('Name')}
                </label>
                <input
                  className="pf-c-form-control"
                  type="text"
                  placeholder="my-http-proxy"
                  id="name"
                  name="metadataName"
                  aria-describedby="name-help"
                  value={formData.metadataName}
                  onChange={handleInputChange}
                  required
                />
                <div className="help-block" id="name-help">
                  <p>
                    {t('A unique name for the HTTP Proxy within the project.')}
                  </p>
                </div>
              </div>

              <div className="form-group co-create-route__type">
                <label className="co-required" htmlFor="route-type">
                  {t('HTTP Proxy type')}
                </label>
                <DynamicDropdown
                  items={
                    labelRouterMapping.map((type) => ({
                      id: type.key,
                      name: type.name,
                    })) || []
                  }
                  selectedItem={selectedRouteType}
                  onSelect={setSelectedRouteType}
                  selectedKey={setSelectedRouteKey}
                  placeholder="Public"
                />

                <div className="help-block" id="route-type-help">
                  <p>{t('HTTP Proxy type')}</p>
                </div>
              </div>
              <div className="form-group co-create-route__path">
                <label htmlFor="hostname">{t('public~Hostname')}</label>
                <input
                  className="pf-c-form-control"
                  type="text"
                  placeholder="www.example.com"
                  id="hostname"
                  name="specHost"
                  value={formData.specHost}
                  onChange={handleInputChange}
                  aria-describedby="host-help"
                />
                <div className="help-block" id="host-help">
                  <p>
                    {t(
                      'hostname for the HTTPProxy. If not specified, a hostname is generated.',
                    )}
                  </p>
                </div>
              </div>
              <div className="form-group co-create-route__path">
                <label htmlFor="path">{t('public~Path')}</label>
                <input
                  className="pf-c-form-control"
                  type="text"
                  placeholder="/"
                  id="path"
                  name="specPath"
                  value={formData.specPath}
                  onChange={handleInputChange}
                  aria-describedby="path-help"
                />
                <div className="help-block" id="path-help">
                  <p>
                    {t(
                      'Path that the router watches to HTTP Proxy traffic to the service.',
                    )}
                  </p>
                </div>
              </div>
              {selectedServices.map((key: any, index) => (
                <div key={index} className="add-service-contour">
                  {index != 0 && (
                    <div className="co-add-remove-form__link--remove-entry">
                      <Button
                        id="service-remove"
                        className="pf-v5-u-float-right"
                        variant="link"
                        aria-label="link"
                        onClick={() => removeService(index)}
                        icon={<MinusCircleIcon />}
                      >
                        {t('Remove alternate Service.')}
                      </Button>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="route-type">
                      {index == 0
                        ? t('Service')
                        : t('Alternate Service target')}
                    </label>
                    <DynamicDropdown
                      items={
                        k8sService?.items
                          .filter(
                            (service) =>
                              !selectedServices.includes(service.metadata.name),
                          )
                          .map((service) => ({
                            id: service.metadata.uid,
                            name: service.metadata.name,
                          })) || []
                      }
                      selectedItem={selectedServices[index].name}
                      onSelect={(selected) =>
                        handleServiceSelect(selected, index)
                      }
                      placeholder="Select a service"
                    />
                    <div className="help-block" id="route-service-help">
                      <p>
                        {index == 0
                          ? t('Service to http proxy.')
                          : t('Alternate Service to http proxy to.')}
                      </p>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="0-weight">
                      {index == 0
                        ? t('Service weight')
                        : t('Alternate Service weight')}
                    </label>
                    <input
                      className="pf-c-form-control"
                      type="number"
                      placeholder="100"
                      id="0-weight"
                      name="weight"
                      value={selectedServices[index].weight}
                      onChange={(e) =>
                        handleInputWeightChange(parseInt(e.target.value), index)
                      }
                      aria-describedby="path-help"
                    />
                    <div className="help-block" id="route-service-help">
                      <p>
                        {t(
                          'A number between 0 and 255 that depicts relative weight compared with other targets.',
                        )}
                      </p>
                    </div>
                  </div>
                  {k8sService && (
                    <div className="form-group co-create-route__type">
                      <label htmlFor="route-type">{t('Target port')}</label>
                      <DynamicDropdown
                        items={
                          k8sService?.items
                            .find(
                              (service) =>
                                service.metadata.name ===
                                selectedServices[index].name,
                            )
                            ?.spec.ports.map((port) => ({
                              id: port.targetPort,
                              name: `${port.port}`,
                            })) || []
                        }
                        selectedItem={selectedServices[index].port}
                        onSelect={(port) => handlePortSelect(port, index)}
                        placeholder={t('Select a service above')}
                      />
                      <div className="help-block" id="route-service-help">
                        <p>{t('Target port for traffic.')}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {alternateService && (
                <div className="co-add-add-form__link--add-entry">
                  <Button
                    id="service-add"
                    variant="link"
                    aria-label="link"
                    onClick={addService}
                    icon={<PlusCircleIcon />}
                  >
                    {t('Add alternate Service')}
                  </Button>
                </div>
              )}

              <div className="form-group co-create-route__type">
                <label htmlFor="secure-route">{t('Security')}</label>
                <Checkbox
                  label="Secure Route"
                  isChecked={isSecureRouteChecked}
                  onChange={handleSecureRouteChecked}
                  id="secure-route"
                  name="secure-route"
                />
                <div className="help-block" id="route-service-help">
                  <p>
                    {t(
                      'Routes can be secured using several TLS termination types for serving certificates.',
                    )}
                  </p>
                </div>
              </div>
              {isSecureRouteChecked && k8sSecrets && (
                <div id="secure-route-section">
                  <div className="form-group co-create-route__type">
                    <label className="co-required" htmlFor="route-type">
                      {t('Secrets:')}
                    </label>
                    <DynamicDropdown
                      items={
                        k8sSecrets.items.map((secret) => ({
                          id: secret.metadata.uid,
                          name: secret.metadata.name,
                        })) || []
                      }
                      selectedItem={selectedSecret}
                      onSelect={setSelectedSecret}
                      placeholder="Select a secret"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="route-yaml-editor">
              <YAMLEditor
                language="json"
                value={yamlData}
                onChange={handleYamlChange}
                minHeight={600}
              />
            </div>
          )}
        </PageSection>
      </Page>
      <div
        className={cx('ocs-form-footer contour-footer', {
          'ocs-form-footer__sticky': true,
          'ocs-form-footer__shadow': 'bottom',
        })}
        data-test="contour-form-footer"
      >
        {errData && (
          <AlertGroup>
            <Alert variant="danger" isInline title={errData} />
          </AlertGroup>
        )}
        <ActionGroup className="pf-c-form pf-c-form__group--no-top-margin">
          <Button onClick={k8sCreateRoute} variant="primary">
            {t('public~Create')}
          </Button>
          <Button onClick={handleGoBack} variant="secondary">
            {t('public~Cancel')}
          </Button>
        </ActionGroup>
      </div>
    </React.Fragment>
  );
};
const CreateRoute: React.FC<CreateRouteProps> = ({ match }) => {
  const { ns } = match?.params;
  const activeNamespace = ns || 'all-namespaces';

  return (
    <React.Fragment>
      <NamespacePageContent namespace={activeNamespace} />
    </React.Fragment>
  );
};

export default CreateRoute;
