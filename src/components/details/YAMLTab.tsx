import { useState, useEffect, Suspense } from 'react';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
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
  router: any;
  refetch: () => Promise<void>;
  addAlert: (title: string, variant?: 'danger' | 'success') => void;
}

const YAMLTab = ({ name, ns, router, refetch, addAlert }: YAMLTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [yamlData, setYamlData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));

  useEffect(() => {
    if (router) {
      setYamlData(yamlDump(router));
    }
  }, [router]);

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

    try {
      const yamlObject = yamlLoad(yamlData);
      const response = await k8sUpdate({
        model: k8sModel,
        data: yamlObject,
        ns,
        name,
      });
      const version = response?.metadata?.resourceVersion;
      addAlert(
        t('yaml_updated_successfully_with_version', {
          name,
          version,
        }),
        'success',
      );
      refetch();
    } catch (error) {
      addAlert(error.message, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="route-yaml-editor">
      {yamlError && (
        <Alert
          variant="danger"
          isInline
          title={yamlError}
          className="pf-u-mb-md"
        />
      )}
      <Suspense fallback={<></>}>
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
      </Suspense>
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
          <Button variant="secondary" onClick={refetch} isDisabled={isLoading}>
            {t('reload')}
          </Button>
        </ActionGroup>
      </div>
    </div>
  );
};

export default YAMLTab;
