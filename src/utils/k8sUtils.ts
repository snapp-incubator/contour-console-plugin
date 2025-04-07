import {
  k8sCreate,
  k8sUpdate,
  k8sGet,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { FormData } from '../types';
import { convertFormToYAML } from './yamlUtils';
import { load } from 'js-yaml';

export const createContourProxy = async (
  formData: FormData,
  namespace: string,
  k8sModel: K8sModel,
  originalResponse?: any,
) => {
  const yamlString = convertFormToYAML(formData, originalResponse);
  const yamlData = load(yamlString);

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
  k8sModel: K8sModel,
  originalResponse?: any,
) => {
  const yamlString = convertFormToYAML(formData, originalResponse);

  const yamlData = load(yamlString);
  try {
    const response = await k8sUpdate({
      model: k8sModel,
      data: yamlData,
      name,
      ns: namespace,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to update HTTP Proxy: ${error.message}`);
  }
};

export const getContourProxy = async (
  k8sModel: K8sModel,
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
