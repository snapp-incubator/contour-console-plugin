import * as _ from 'lodash';
import {
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  ResourceUtilizationQuery,
  MetricsQueries,
  MONITORING_BASE_URL,
} from '../../constants';

export { ResourceUtilizationQuery };

export const getMetricsQueries = (
  name: string,
  namespace: string,
  authority?: string,
  baseURL?: string,
): { [key: string]: string[] } => ({
  [ResourceUtilizationQuery.NETWORK_IN]: [
    MetricsQueries[ResourceUtilizationQuery.NETWORK_IN]({
      namespace,
      authority: authority || `${name}.${baseURL}`,
    }),
  ],
  [ResourceUtilizationQuery.NETWORK_OUT]: [
    MetricsQueries[ResourceUtilizationQuery.NETWORK_OUT]({
      namespace,
      authority: authority || `${name}.${baseURL}`,
    }),
  ],
  [ResourceUtilizationQuery.CONNECTION_RATE]: [
    MetricsQueries[ResourceUtilizationQuery.CONNECTION_RATE]({
      namespace,
      name,
    }),
  ],
  [ResourceUtilizationQuery.PRS]: [
    MetricsQueries[ResourceUtilizationQuery.PRS]({ namespace, name }),
  ],
});

export const useResourceMetricsQueries = (
  obj: any,
  baseURL: string,
): { [key: string]: string[] } => {
  const [model] = useK8sModel(getGroupVersionKindForResource(obj));
  const authority = obj?.spec?.virtualhost?.fqdn;

  if (model) {
    return getMetricsQueries(
      obj.metadata.name,
      obj.metadata.namespace,
      authority,
      baseURL,
    );
  }
  return null;
};

export const getMonitoringURL = (query: string) => {
  const encodedQuery = encodeURIComponent(query);
  return `${MONITORING_BASE_URL}?query0=${encodedQuery}`;
};
