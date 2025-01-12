import React, { useState, useEffect, useCallback } from 'react';
import cx from 'classnames';
import {
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
import RouteForm from '../components/form/ContourForm';
import Helmet from 'react-helmet';
import CloudDocument from '../components/shared/Info';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  convertFormToYAML,
  convertYAMLToForm,
  convertK8sToForm,
} from '../utils/yamlUtils';
import { FormData } from '../types';
import { DEFAULT_FORM_DATA, CONTOUR_MODEL } from '../constants';
import { useFormValidation } from '../hooks/useFormValidation';
import {
  createContourProxy,
  updateContourProxy,
  getContourProxy,
} from '../utils/k8sUtils';

import '../style.css';

const RouteHandlerPage = () => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const history = useHistory();
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));

  const { ns, name } = useParams<{ ns?: string; name?: string }>();
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

  const {
    errors: validationErrors,
    validate,
    clearErrors,
  } = useFormValidation();

  const handleFormChange = useCallback(
    (newFormData: FormData) => {
      setFormData(newFormData);
      if (yamlView) {
        const yamlString = convertFormToYAML(newFormData);
        setYamlData(yamlString);
      }
    },
    [yamlView],
  );

  const handleYamlChange = useCallback(
    (newYaml: string) => {
      setYamlData(newYaml);
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
        const yamlString = convertFormToYAML(formData);
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
      return;
    }

    setLoading(true);
    setSaveError(null);

    try {
      if (isEdit) {
        await updateContourProxy(formData, name!, namespace);
      } else {
        await createContourProxy(formData, namespace);
      }
      history.push(`/k8s/ns/${namespace}/httpproxies`);
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
          setFormData(formData);
          if (yamlView) {
            const convertedFormData = convertFormToYAML(response);
            setYamlData(convertedFormData);
          }
        } catch (error) {
          setSaveError(t('error_fetching_proxy', { error: error.message }));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProxyData();
  }, [isEdit]);

  return (
    <>
      <Helmet>
        <title>{t('http_proxies')}</title>
      </Helmet>
      <Page>
        <PageSection id="create-route-contour" variant="light">
          <Title headingLevel="h1">{t('http_proxies')}</Title>
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
              {yamlError && (
                <Alert
                  variant="danger"
                  isInline
                  title={yamlError}
                  className="pf-u-mb-md"
                />
              )}
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
                        scrollBeyondLastLine: false,
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
                  'ocs-form-footer__shadow': 'bottom',
                })}
                data-test="contour-form-footer"
              >
                <ActionGroup>
                  <Button
                    variant="primary"
                    type="submit"
                    isDisabled={isLoading}
                    isLoading={isLoading}
                  >
                    {isEdit ? t('update') : t('create')}
                  </Button>
                  <Button
                    className="pf-u-ml-sm"
                    variant="secondary"
                    onClick={() => history.goBack()}
                    isDisabled={isLoading}
                  >
                    {t('cancel')}
                  </Button>
                </ActionGroup>
              </div>
            </GridItem>
            <GridItem span={4}>
              <CloudDocument isTitle={true} />
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    </>
  );
};

export default RouteHandlerPage;
