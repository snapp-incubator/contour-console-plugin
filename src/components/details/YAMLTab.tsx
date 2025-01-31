import React, { useState, useEffect } from 'react';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  k8sGet,
  k8sUpdate,
  getGroupVersionKindForResource,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import { useTranslation } from 'react-i18next';
import { Button, ActionGroup, Alert } from '@patternfly/react-core';
import { CONTOUR_MODEL } from '../../constants';

interface YAMLTabProps {
  name: string;
  ns: string;
  isActive: boolean;
}

interface AlertMessage {
  type: 'success' | 'danger';
  message: string;
}

const YAMLTab = ({ name, ns, isActive }: YAMLTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [yamlData, setYamlData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));

  const fetchRouter = async () => {
    try {
      const response = await k8sGet({
        model: k8sModel,
        ns,
        name,
      });
      setYamlData(yamlDump(response));
    } catch (error) {
      console.error('Error fetching routes:', error);
      setAlert({
        type: 'danger',
        message: t('error_fetching_proxy', { error: error.message }),
      });
    }
  };

  const handleYamlChange = (newYaml: string) => {
    setYamlData(newYaml);
    try {
      yamlLoad(newYaml);
      setYamlError(null);
    } catch (error) {
      setYamlError(t('invalid_yaml_format'));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setAlert(null);

    try {
      const yamlObject = yamlLoad(yamlData);
      const response = await k8sUpdate({
        model: k8sModel,
        data: yamlObject,
        ns,
        name,
      });
      const version = response?.metadata?.resourceVersion;
      setAlert({
        type: 'success',
        message: t('yaml_updated_successfully_with_version', {
          name,
          version,
        }),
      });
      handleReload();
    } catch (error) {
      setAlert({ type: 'danger', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    setIsLoading(true);
    fetchRouter().finally(() => {
      setIsLoading(false);
      setYamlError(null);
    });
  };

  useEffect(() => {
    fetchRouter().finally(() => {
      setIsLoading(false);
    });
  }, [name, ns, isActive]);

  return (
    <div className="route-yaml-editor">
      {(yamlError || alert) && (
        <Alert
          variant={alert?.type || 'danger'}
          isInline
          title={yamlError || alert?.message}
          className="pf-u-mb-md"
        />
      )}
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
      <div className="ocs-form-footer pf-u-mt-xl contour-footer ocs-form-footer__sticky">
        <ActionGroup>
          <Button
            className="pf-u-mr-md"
            variant="primary"
            onClick={handleSave}
            isDisabled={isLoading || !!yamlError}
            isLoading={isLoading}
          >
            {t('update')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleReload();
            }}
            isDisabled={isLoading}
          >
            {t('reload')}
          </Button>
        </ActionGroup>
      </div>
    </div>
  );
};

export default YAMLTab;
