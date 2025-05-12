import React, { useState, useEffect, useCallback } from 'react';
import cx from 'classnames';
import {
  Form,
  FormGroup,
  Title,
  Page,
  PageSection,
  Radio,
  GridItem,
  Grid,
  Divider,
  Button,
  Alert,
  ActionGroup,
} from '@patternfly/react-core';
import {
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom';
import RouteForm from '@/form/ContourForm';
import Helmet from 'react-helmet';
import HTTPProxyInfo from '@/shared/HTTPProxyInfo';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  convertFormToYAML,
  convertYAMLToForm,
  convertK8sToForm,
  parseYAML,
} from '../utils/yamlUtils';
import { delayedNavigate } from '../utils/navigationUtils';
import { FormData } from '../types';
import { DEFAULT_FORM_DATA, CONTOUR_MODEL } from '../constants';
import { useFormValidation } from '../hooks/useFormValidation';
import {
  createContourProxy,
  updateContourProxy,
  getContourProxy,
} from '../utils/k8sUtils';
import { useToast, Toast } from '@/toast';

import '../style.css';

const RouteHandlerPage = () => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const history = useHistory();
  const { ns, name } = useParams<{ ns?: string; name?: string }>();
  const { alerts, addAlert, removeAlert } = useToast();

  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));
  const pageList = `/k8s/ns/${ns}/projectcontour.io~v1~HTTPProxy`;

  const {
    errors: validationErrors,
    validate,
    clearErrors,
  } = useFormValidation();

  const isEdit = !!name;
  const namespace = ns || 'default';

  const [yamlView, setYamlView] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    ...DEFAULT_FORM_DATA,
    namespace,
  });
  const [yamlData, setYamlData] = useState('');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [originalResponse, setOriginalResponse] = useState<any>(null);

  const handleFormChange = useCallback(
    (newFormData: FormData) => {
      setFormData(newFormData);
      if (yamlView) {
        const yamlString = convertFormToYAML(newFormData, originalResponse);
        setYamlData(yamlString);
      }
    },
    [yamlView, originalResponse],
  );

  const handleYamlChange = useCallback(
    (newYaml: string) => {
      setYamlData(newYaml);
      setOriginalResponse(parseYAML(newYaml));
      try {
        const newFormData = convertYAMLToForm(newYaml);
        if (newFormData) {
          setFormData(newFormData);
        }
      } catch (error) {
        setYamlError(t('invalid_yaml_format'));
      }
    },
    [t],
  );

  const onChangeRadio = (checked: boolean, event) => {
    const view = event.target.value;
    if (view === 'yaml') {
      setYamlView(true);
      try {
        const yamlString = convertFormToYAML(formData, originalResponse);
        setYamlData(yamlString);
      } catch (error) {
        setYamlError(t('error_converting_form'));
      }
    } else {
      setYamlView(false);
      try {
        const newFormData = convertYAMLToForm(yamlData);
        if (newFormData) {
          setFormData(newFormData);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const { isValid } = validate(formData);
    if (!isValid) {
      addAlert(t('validation_errors'), 'danger');
      return;
    }

    setLoading(true);
    setSaveError(null);

    try {
      if (isEdit) {
        await updateContourProxy(
          formData,
          name,
          namespace,
          k8sModel,
          originalResponse,
        );
        addAlert(t('update_success'), 'success');
      } else {
        await createContourProxy(
          formData,
          namespace,
          k8sModel,
          originalResponse,
        );
        addAlert(t('create_success'), 'success');
      }
      delayedNavigate(history, pageList);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProxyData = async () => {
      if (isEdit) {
        try {
          setLoading(true);
          const response: any = await getContourProxy(
            k8sModel,
            name,
            namespace,
          );
          const formData = convertK8sToForm(response);
          setOriginalResponse(response);
          setFormData(formData);
          setYamlData(response);
        } catch (error) {
          setSaveError(t('error_fetching_proxy', { error: error.message }));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProxyData();
  }, [isEdit, name, namespace]);

  return (
    <>
      <Helmet>
        <title>{t('http_proxies')}</title>
      </Helmet>
      <Toast alerts={alerts} removeAlert={removeAlert} t={t} />
      <Page>
        <PageSection id="create-route-contour" variant="light">
          <Title headingLevel="h1">{t('http_proxies')}</Title>
          <span className="sub-title pf-v5-u-color-200">
            {t('routing_way_description')}
          </span>
          <Divider />
          <div className="type-create-route">
            <FormGroup
              role="radiogroup"
              isInline
              fieldId="basic-form-radio-group"
            >
              <span>{t('configure_via')}</span>
              <Radio
                name="route-configure"
                checked={!yamlView}
                onChange={onChangeRadio}
                value="form"
                label={t('form_view')}
                id="basic-inline-formview"
              />
              <Radio
                name="route-configure"
                checked={yamlView}
                onChange={onChangeRadio}
                value="yaml"
                label={t('yaml_view')}
                id="basic-inline-yamlview"
              />
            </FormGroup>
          </div>
          <Divider />
          <Grid hasGutter={true}>
            <GridItem span={8}>
              {yamlError ? (
                <Alert
                  variant="danger"
                  isInline
                  title={yamlError}
                  className="pf-u-mb-md"
                />
              ) : null}
              <Form onSubmit={handleSubmit}>
                {!yamlView ? (
                  <RouteForm
                    isEdit={isEdit}
                    formData={formData}
                    updateFormData={setFormData}
                    onChange={handleFormChange}
                    validationErrors={validationErrors}
                    saveError={saveError}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <div className="route-yaml-editor">
                    <React.Suspense fallback={<></>}>
                      <YAMLEditor
                        language="yaml"
                        value={yamlData}
                        onChange={handleYamlChange}
                        minHeight={600}
                        options={{
                          readOnly: false,
                          scrollBeyondLastLine: true,
                          minimap: { enabled: true },
                          folding: true,
                          lineNumbers: true,
                          wordWrap: 'on',
                        }}
                      />
                    </React.Suspense>
                  </div>
                )}
                <div
                  className={cx('ocs-form-footer pf-u-mt-xl contour-footer', {
                    'ocs-form-footer__sticky': true,
                  })}
                  data-test="contour-form-footer"
                >
                  {validationErrors.length > 0 || saveError ? (
                    <Alert
                      variant="danger"
                      title={saveError || t('validation_errors')}
                      isInline
                    >
                      {validationErrors.length > 0 ? (
                        <ul>
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      ) : null}
                    </Alert>
                  ) : null}
                  <ActionGroup className="pf-u-mt-sm">
                    <Button
                      variant="primary"
                      type="submit"
                      isDisabled={isLoading}
                      isLoading={isLoading}
                    >
                      {isEdit ? t('update') : t('create')}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => history.goBack()}
                      isDisabled={isLoading}
                    >
                      {t('cancel')}
                    </Button>
                  </ActionGroup>
                </div>
              </Form>
            </GridItem>
            <GridItem span={4}>
              <HTTPProxyInfo isTitle={true} />
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    </>
  );
};

export default RouteHandlerPage;
