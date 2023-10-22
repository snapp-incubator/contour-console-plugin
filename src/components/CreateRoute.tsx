import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Helmet from 'react-helmet';
import { match as RMatch } from 'react-router-dom';
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
  ActionGroup,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import yamlParser from 'js-yaml';

import {
  k8sCreate,
  k8sGet,
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';
import mockHttpProxyData, {
  mockServicesData,
  labelRouterMapping,
} from '../utils/model-k8s';

import DynamicDropdown from './Dropdown';
import './style.css';

const NamespacePageContent = ({ namespace }: { namespace?: string }) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [formData, setFormData] = React.useState({
    metadataName: null,
    metadataNamespace: namespace,
    specHost: '',
    specPath: '/',
    specToName: '',
    specTls: '',
    labelsRole: '',
    service: '',
    labelsRouter: '',
    targetPort: '',
  });
  const [k8sModel] = useK8sModel(
    getGroupVersionKindForResource(mockHttpProxyData(formData)),
  );

  const [k8sModelService] = useK8sModel(
    getGroupVersionKindForResource(mockServicesData),
  );

  const history = useHistory();
  const [yamlView, setYamlView] = React.useState(false);
  const [yamlData, setYamlData] = React.useState();

  const [errData, setErrData] = React.useState<string>();
  const [k8sService, setK8sService] = React.useState<any>();
  const [selectedService, setSelectedService] = React.useState<string | null>(
    null,
  );
  const [selectedPort, setSelectedPort] = React.useState<string | null>(null);
  const [selectedPortKey, setSelectedPortKey] = React.useState<string | null>(
    null,
  );

  const [selectedRouteType, setSelectedRouteType] = React.useState<
    string | null
  >(null);

  const onChangeRadio = (checked: boolean, event) => {
    setYamlView(event.target.value === 'yaml');
  };

  const handleGoBack = () => {
    history.goBack();
  };

  React.useEffect(() => {
    setYamlData(yamlParser.dump(mockHttpProxyData(formData)));
  }, [formData]);

  React.useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      service: selectedService,
      labelsRouter: selectedRouteType,
      targetPort: selectedPortKey,
    }));
  }, [selectedService, selectedRouteType, selectedPortKey]);

  React.useEffect(() => {
    k8sGetServices();
  }, []);

  const handleInputChange = React.useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const k8sCreateRoute = () => {
    k8sCreate({ model: k8sModel, data: mockHttpProxyData(formData) })
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

  return (
    <>
      <Helmet>
        <title data-test="contour-page-title">{t('HTTPProxies')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
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
                  placeholder="Public"
                />

                <div className="help-block" id="route-type-help">
                  <p>{t('HTTP Proxy type')}</p>
                </div>
              </div>
              <div className="form-group co-create-route__hostname">
                <label htmlFor="name">{t('Hostname')}</label>
                <input
                  className="pf-c-form-control"
                  type="text"
                  placeholder="www.example.com"
                  id="hostname"
                  name="specHost"
                  value={formData.specHost}
                  onChange={handleInputChange}
                  aria-describedby="name-help"
                  required
                />
                <div className="help-block" id="hostname-help">
                  <p>
                    {t(
                      'Public hostname for the Route. If not specified, a hostname is generated.',
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
              <div className="form-group co-create-route__type">
                <label htmlFor="route-type">{t('Service')}</label>
                <DynamicDropdown
                  items={
                    k8sService?.items.map((service) => ({
                      id: service.metadata.uid,
                      name: service.metadata.name,
                    })) || []
                  }
                  selectedItem={selectedService}
                  onSelect={setSelectedService}
                  placeholder="Select a service"
                />
                <div className="help-block" id="route-service-help">
                  <p>{t('Service to route to.')}</p>
                </div>
              </div>
              <div className="form-group co-create-route__type">
                <label htmlFor="route-type">{t('Target port')}</label>
                <DynamicDropdown
                  items={
                    k8sService?.items
                      .find(
                        (service) => service.metadata.name === selectedService,
                      )
                      ?.spec.ports.map((port) => ({
                        id: port.name,
                        name: `${port.port}->${port.targetPort}`,
                      })) || []
                  }
                  selectedItem={selectedPort}
                  onSelect={setSelectedPort}
                  selectedKey={setSelectedPortKey}
                  placeholder={t('Select a service above')}
                />
                <div className="help-block" id="route-service-help">
                  <p>{t('Target port for traffic.')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="route-yaml-editor">
              <React.Suspense fallback={<></>}>
                <YAMLEditor language="json" value={yamlData} minHeight={600} />
              </React.Suspense>
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
    </>
  );
};
const CreateRoute: React.FC<CreateRouteProps> = ({ match }) => {
  const { ns } = match?.params;
  const activeNamespace = ns || 'all-namespaces';

  return (
    <>
      <NamespacePageContent namespace={activeNamespace} />
    </>
  );
};

export default CreateRoute;
type CreateRouteProps = {
  match: RMatch<{
    ns?: string;
  }>;
};
