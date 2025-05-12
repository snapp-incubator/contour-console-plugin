import { useState, useEffect } from 'react';
import {
  k8sGet,
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sResources } from '../types';
import { SERVICE_MODEL, SECRET_MODEL, INGRESS_CLASSES } from '../constants';
import { defaultSecret, TLSType } from '../constants';
import {
  INGRESS_CLASSE_SERVER,
  INGRESS_CLASSE_URL,
} from '../config/environment';

export const useK8sResources = (namespace: string): K8sResources => {
  const [resources, setResources] = useState<K8sResources>({
    services: [],
    secrets: [],
    ingressClasses: [],
    loading: true,
    error: null,
  });

  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(SERVICE_MODEL));
  const [k8sModelSecret] = useK8sModel(
    getGroupVersionKindForResource(SECRET_MODEL),
  );

  const getIngressClasses = async () => {
    if (INGRESS_CLASSE_SERVER) {
      try {
        const response = await fetch(INGRESS_CLASSE_URL);
        const data = await response.json();
        const values = Object.values(data)[0] as string[];
        return values?.map((name: string) => ({
          value: name,
          label: name,
        }));
      } catch (fetchError) {
        console.error('Error fetching from INGRESS_CLASSE_URL:', fetchError);
      }
    }
    return INGRESS_CLASSES;
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [servicesRes, secretsRes]: any = await Promise.all([
          k8sGet({ model: k8sModel, ns: namespace }),
          k8sGet({ model: k8sModelSecret, ns: namespace }),
        ]);

        setResources({
          services: servicesRes?.items || [],
          secrets: [
            defaultSecret,
            ...(secretsRes?.items?.filter((s: any) => s.type === TLSType) ||
              []),
          ],
          ingressClasses: await getIngressClasses(),
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setResources((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    };

    fetchResources();
  }, [namespace]);

  return resources;
};
