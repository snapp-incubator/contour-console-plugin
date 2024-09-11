import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Helmet from 'react-helmet';
import { JSONSchema7 } from 'json-schema';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';

import { uiSchema } from '../utils/uiSchema';
import schemaRaw from '../utils/schema.json';
import Form from '@rjsf/core';

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
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Text,
  Grid,
  Hint,
  HintTitle,
  HintBody,
  HintFooter,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import yamlParser from 'js-yaml';

import {
  k8sCreate,
  k8sUpdate,
  k8sGet,
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  mockHttpProxyFormData,
  mockServicesData,
  mockSecrets,
  mockNetworking,
} from '../utils/modelK8s';
import { convertRouteToForm } from '../utils/yaml';
import { convertRouteToYML } from '../utils/yaml';
import CustomDropdownWidget from './CustomDropdownWidget';
import CustomTextWidget from './CustomTextWidget';
import ArrayFieldTemplate from './ArrayFieldTemplate';
import { CreateRouteProps } from '../utils/types';
import { updateSchema } from '../utils/updateSchema';
import './style.css';

const NamespacePageContent = ({ namespace }: { namespace?: string }) => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  const history = useHistory();
  const isYamlView = location.pathname.endsWith('/yaml') || false;
  const updatedUiSchema = {
    ...uiSchema,
    name: {
      ...(uiSchema.name || {}),
      'ui:disabled': isYamlView,
    },
  };
  const [yamlView, setYamlView] = useState(isYamlView);
  const [yamlData, setYamlData] = useState();
  const [schema, setSchema] = useState(schemaRaw);
  const [k8Service, setK8Service] = useState<any>();
  const [k8Secrets, setK8Secrets] = useState<any>();
  const [k8IngressClass, setK8IngressClass] = useState<any>();
  const [errData, setErrData] = useState<string>();
  const { name } = useParams<{ name: string }>();

  const widgets = {
    customTextWidget: CustomTextWidget,
    customDropdownWidget: CustomDropdownWidget,
  };

  const intialFormData = {
    namespace: namespace,
    services: [],
  };
  const [formData, setFormData] = useState(intialFormData);

  const handleUpdateSchema = () => {
    const updatedSchema = updateSchema(
      schema,
      k8Service,
      k8Secrets,
      k8IngressClass,
      formData,
    );
    setSchema(updatedSchema);
  };

  const [k8sModel] = useK8sModel(
    getGroupVersionKindForResource(mockHttpProxyFormData),
  );
  const [k8sModelService] = useK8sModel(
    getGroupVersionKindForResource(mockServicesData),
  );
  const [k8sModelSecret] = useK8sModel(
    getGroupVersionKindForResource(mockSecrets),
  );

  const [k8sModelNetworking] = useK8sModel(
    getGroupVersionKindForResource(mockNetworking),
  );

  const handleYamlChange = (newValue: string) => {
    const mocData = yamlParser.load(newValue);
    setYamlData(yamlParser.dump(mocData));
  };

  const updateFormData = () => {
    const yamlDataParser = yamlParser.load(yamlData);
    const newFormData = convertRouteToForm(yamlDataParser);
    setFormData((prevData) => ({
      ...prevData,
      ...newFormData,
    }));
  };

  const onChangeRadio = (checked: boolean, event) => {
    const view = event.target.value;
    if (view == 'yaml') {
      setYamlView(true);
      setYamlData(yamlParser.dump(convertRouteToYML(formData, yamlData)));
    } else {
      setYamlView(false);
      updateFormData();
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    handleUpdateSchema();
  }, [formData]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      services: [
        {
          name: k8Service?.items[0]?.metadata.name,
          port: k8Service?.items[0]?.spec?.ports[0]?.port,
        },
      ],
    }));
    handleUpdateSchema();
  }, [k8Service]);

  useEffect(() => {
    if (name != undefined) {
      k8sGetRoute();
    } else {
      setYamlData(yamlParser.dump(convertRouteToYML(formData, yamlData)));
    }
    k8sGetServices();
    k8sGetSecrets();
    k8sGetNetwoking();
  }, []);

  useEffect(() => {
    handleUpdateSchema();
  }, [k8Secrets]);

  const k8sCreateRoute = () => {
    k8sCreate({ model: k8sModel, data: yamlParser.load(yamlData) })
      .then(() => {
        history.goBack();
      })
      .catch((e) => {
        setErrData(e.message);
      });
  };
  const k8sUpdateRoute = () => {
    const updatedYamlData = yamlParser.dump(
      convertRouteToYML(formData, yamlData),
    );
    k8sUpdate({
      model: k8sModel,
      data: yamlParser.load(updatedYamlData),
      ns: namespace,
    })
      .then((response) => {
        history.goBack();
      })
      .catch((e) => {
        setErrData(e.message);
      });
  };

  const k8sGetRoute = () => {
    k8sGet({
      model: k8sModel,
      ns: namespace,
      name: name,
    })
      .then((response) => {
        setYamlData(yamlParser.dump(response));
      })
      .catch((e) => {
        setErrData(e.message);
      });
  };

  const k8sGetSecrets = () => {
    k8sGet({
      model: k8sModelSecret,
      ns: namespace,
    })
      .then((response) => {
        const tlsSecrets = response['items'].filter(
          (secret) => secret.type === 'kubernetes.io/tls',
        );
        setK8Secrets(tlsSecrets);
      })
      .catch((e) => {
        setErrData(e.message);
        console.error(e);
      });
  };

  const k8sGetNetwoking = () => {
    k8sGet({
      model: k8sModelNetworking,
    })
      .then((response) => {
        const ingressClasses = response['items'].filter((ic) =>
          ic.spec.controller.includes('projectcontour.io'),
        );
        setK8IngressClass(ingressClasses);
      })
      .catch((e) => {
        setErrData(e.message);
        console.error(e);
      });
  };

  const k8sGetServices = () => {
    k8sGet({
      model: k8sModelService,
      ns: namespace,
    })
      .then((response) => {
        setK8Service(response);
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
          <Grid>
            <GridItem span={8}>
              {!yamlView ? (
                <>
                  <div className="form-route co-m-pane__form">
                    <Form
                      ArrayFieldTemplate={ArrayFieldTemplate}
                      schema={schema as JSONSchema7}
                      uiSchema={updatedUiSchema}
                      widgets={widgets}
                      onChange={(e) => setFormData(e.formData)}
                      formData={formData}
                      children={true}
                    />
                  </div>
                </>
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
            </GridItem>
            <GridItem span={4}>
              <br />
              <Card isFullHeight={true} isFlat={true}>
                <CardTitle> HTTPProxies</CardTitle>
                <CardBody>
                  <Text>
                    The goal of the HTTPProxy Custom Resource Definition (CRD)
                    is to expand upon the functionality of the Ingress API to
                    allow for a richer user experience as well addressing the
                    limitations of the latter’s use in multi tenant
                    environments.
                  </Text>
                  <br />
                  <Hint>
                    <HintTitle>Advance Configuration</HintTitle>
                    <HintBody>
                      HTTPProxies allows for the use of advanced configuration
                      options in the YAML tab, offering greater flexibility and
                      control over routing and load balancing behaviors.
                    </HintBody>
                    <HintFooter>
                      <a href={t('Cloud Doc')} target="_blank">
                        Read More (Cloud Doc)
                      </a>
                    </HintFooter>
                  </Hint>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
      <div
        className={classNames('ocs-form-footer contour-footer', {
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
          {isYamlView ? (
            <Button onClick={k8sUpdateRoute} variant="primary">
              {t('public~Update')}
            </Button>
          ) : (
            <Button onClick={k8sCreateRoute} variant="primary">
              {t('public~Create')}
            </Button>
          )}

          <Button onClick={handleGoBack} variant="secondary">
            {t('public~Cancel')}
          </Button>
        </ActionGroup>
      </div>
    </React.Fragment>
  );
};
const CreateRoute = ({ match }: CreateRouteProps) => {
  const { ns } = match?.params;
  const activeNamespace = ns || 'all-namespaces';

  return <NamespacePageContent namespace={activeNamespace} />;
};

export default CreateRoute;
