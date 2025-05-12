import { useState, useEffect } from 'react';
import {
  k8sGet,
  k8sPatch,
  k8sDelete,
  useK8sModel,
  getGroupVersionKindForResource,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  CONTOUR_MODEL,
  HTTP_PROXY_QUERY_PARAMS,
  ALL_NAMESPACES,
} from '../constants';
import { labelToObject } from '../utils/labelToObject';

export const useHTTPProxyData = (
  namespace: string,
  searchValue?: string,
  selectedFilter?: string,
) => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));
  const isAllNamespaces = namespace === ALL_NAMESPACES;

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = (await k8sGet({
          model: k8sModel,
          ns: isAllNamespaces ? undefined : namespace,
          queryParams: isAllNamespaces
            ? HTTP_PROXY_QUERY_PARAMS.ALL_NAMESPACES
            : null,
        })) as { items: K8sResourceCommon[] };
        setRoutes(response.items || []);
        setFilteredRoutes(response.items || []);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [namespace, refresh]);

  useEffect(() => {
    const filtered = searchValue
      ? routes.filter((route) => {
          if (selectedFilter === 'label') {
            return Object.entries(route.metadata?.labels || {}).some(
              ([key, value]) =>
                `${key}=${value}`
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()),
            );
          }
          return route.metadata?.name
            ?.toLowerCase()
            .includes(searchValue.toLowerCase());
        })
      : routes;

    setFilteredRoutes(filtered);
  }, [searchValue, selectedFilter, routes]);

  const handleLabelsUpdate = async (route: any, labels: any) => {
    try {
      setLoading(true);
      await k8sPatch({
        model: k8sModel,
        resource: route,
        data: [
          {
            op: 'replace',
            path: '/metadata/labels',
            value: labelToObject(labels),
          },
        ],
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Error updating labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnotationsUpdate = async (route: any, annotations: any) => {
    try {
      setLoading(true);
      await k8sPatch({
        model: k8sModel,
        resource: route,
        data: [
          {
            op: 'replace',
            path: '/metadata/annotations',
            value: annotations,
          },
        ],
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Error updating annotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (route: any, namespace: string) => {
    try {
      await k8sDelete({
        model: k8sModel,
        resource: route,
        ns: namespace,
      });
      setRefresh(true);
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  return {
    routes,
    filteredRoutes,
    loading,
    refresh,
    setRefresh,
    setLoading,
    handleLabelsUpdate,
    handleAnnotationsUpdate,
    handleDelete,
  };
};
