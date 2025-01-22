import * as _ from 'lodash';
import {
  useK8sModel,
  getGroupVersionKindForResource,
} from '@openshift-console/dynamic-plugin-sdk';

export enum ResourceUtilizationQuery {
  NETWORK_IN = 'NETWORK_IN',
  NETWORK_OUT = 'NETWORK_OUT',
  CONNECTION_RATE = 'CONNECTION_RATE',
  PRS = 'PRS',
}

const MetricsQueries = {
  [ResourceUtilizationQuery.NETWORK_IN]: _.template(
    "sum without (instance,exported_pod,exported_service,pod,server)(irate(cloud:routes_received:bytes{namespace='<%= namespace %>',authority='<%= authority %>'}[5m]))",
  ),
  [ResourceUtilizationQuery.NETWORK_OUT]: _.template(
    "sum without (instance,exported_pod,exported_service,pod,server) (irate(cloud:routes_sent:bytes{namespace='<%= namespace %>',authority='<%= authority %>'}[5m]))",
  ),
  [ResourceUtilizationQuery.CONNECTION_RATE]: _.template(
    "sum without (instance,exported_pod,exported_service,pod,server) (irate(haproxy_backend_connections_total{exported_namespace='<%= namespace %>',route='<%= name %>'}[5m]))",
  ),
  [ResourceUtilizationQuery.PRS]: _.template(
    "sum (cloud:routes:rps{namespace='<%= namespace %>',route_name='<%= name %>'}) OR on() vector(0)",
  ),
};

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
