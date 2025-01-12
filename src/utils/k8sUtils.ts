import {
  k8sCreate,
  k8sUpdate,
  k8sGet,
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { FormData } from '../types';
import { convertFormToYAML } from './yamlUtils';
import { CONTOUR_MODEL } from '../constants';
import { load } from 'js-yaml';

export const createContourProxy = async (
  formData: FormData,
  namespace: string,
) => {
  const yamlString = convertFormToYAML(formData);
  const yamlData = load(yamlString);

  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));
  try {
    const response = await k8sCreate({
      model: k8sModel,
      data: {
        ...yamlData,
        metadata: {
          ...yamlData.metadata,
          namespace,
        },
      },
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to create HTTP Proxy: ${error.message}`);
  }
};

export const updateContourProxy = async (
  formData: FormData,
  name: string,
  namespace: string,
) => {
  const yamlString = convertFormToYAML(formData);
  const yamlData = load(yamlString);
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));
  try {
    const response = await k8sUpdate({
      model: k8sModel,
      data: {
        ...yamlData,
        metadata: {
          ...yamlData.metadata,
          name,
          namespace,
        },
      },
      name,
      ns: namespace,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to update HTTP Proxy: ${error.message}`);
  }
};

export const getContourProxy = async (
  k8sModel: any,
  name: string,
  namespace: string,
) => {
  try {
    const response = await k8sGet({
      model: k8sModel,
      name,
      ns: namespace,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to get HTTP Proxy: ${error.message}`);
  }
};
