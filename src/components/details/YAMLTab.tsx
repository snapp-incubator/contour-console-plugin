import React, { useState, useEffect, useCallback } from 'react';
import { YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  k8sGet,
  getGroupVersionKindForResource,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { dump as yamlDump } from 'js-yaml';
import { useTranslation } from 'react-i18next';
import { CONTOUR_MODEL } from '../../constants';

interface YAMLTabProps {
  name: string;
  ns: string;
}

const YAMLTab = ({ name, ns }: YAMLTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [yamlData, setYamlData] = useState('');
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));

  const handleYamlChange = useCallback(
    (newYaml: string) => {
      setYamlData(newYaml);
    },
    [t],
  );

  useEffect(() => {
    const fetchRouter = async () => {
      try {
        const response = await k8sGet({
          model: k8sModel,
          ns,
          name,
        });
        setYamlData(yamlDump(response));
      } catch (error) {
        console.log('Error fetching routes:', error);
      }
    };

    fetchRouter();
  }, []);

  return (
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
  );
};

export default YAMLTab;
