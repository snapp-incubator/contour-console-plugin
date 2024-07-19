import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Helmet from 'react-helmet';
import { JSONSchema7 } from 'json-schema';
import classNames from 'classnames';

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
import {
  mockHttpProxyFormData,
  mockServicesData,
  mockSecrets,
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
  const [yamlView, setYamlView] = React.useState(false);
  const [yamlData, setYamlData] = React.useState();
  const [selectedTLS] = React.useState<string>('');
  const [schema, setSchema] = React.useState(schemaRaw);
  const [k8Service, setK8Service] = React.useState<any>();
  const [k8Secrets, setK8Secrets] = React.useState<any>();
  const [errData, setErrData] = React.useState<string>();
  const widgets = {
    customTextWidget: CustomTextWidget,
    customDropdownWidget: CustomDropdownWidget,
  };

  const intialFormData = {
    namespace: namespace,
    services: [],
  };
  const [formData, setFormData] = React.useState(intialFormData);

  const handleUpdateSchema = () => {
    const updatedSchema = updateSchema(schema, k8Service, k8Secrets, formData);
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
    if (view === 'yaml') {
      setYamlView(true);
    } else {
      setYamlView(false);
      updateFormData();
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  React.useEffect(() => {
    setYamlData(yamlParser.dump(convertRouteToYML(formData)));
    handleUpdateSchema();
  }, [formData]);

  React.useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      services: [
        {
          name: k8Service?.items[0]?.metadata.name,
          port: k8Service?.items[0]?.spec?.ports[0]?.targetPort,
        },
      ],
    }));
    handleUpdateSchema();
  }, [k8Service]);

  React.useEffect(() => {}, [selectedTLS]);

  React.useEffect(() => {
    setYamlData(yamlParser.dump(convertRouteToYML(formData)));
    k8sGetServices();
    k8sGetSecrets();
  }, []);

  React.useEffect(() => {
    handleUpdateSchema();
  }, [k8Secrets]);

  const k8sCreateRoute = () => {
    k8sCreate({ model: k8sModel, data: yamlParser.load(yamlData) })
      .then((response) => {
        history.goBack();
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
        setK8Secrets(response['items']);
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
                      uiSchema={uiSchema}
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
                <CardTitle> HTTPProxy </CardTitle>
                <CardBody>
                  <Text>
                    The goal of the HTTPProxy Custom Resource Definition (CRD)
                    is to expand upon the functionality of the Ingress API to
                    allow for a richer user experience as well addressing the
                    limitations of the latter’s use in multi tenant
                    environments.
                  </Text>
                  <br />
                  <a target="_blank" href={t('Cloud Doc')}>
                    Read More (Cloud Doc)
                  </a>
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
