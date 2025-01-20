import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Page, PageSection, Alert, Skeleton } from '@patternfly/react-core';
import {
  useK8sModel,
  k8sDelete,
  getGroupVersionKindForResource,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';
import type { HTTPProxy } from '../types/k8s';
import { HTTPProxyHeader } from '@/list/Header';
import { HTTPProxyFilters } from '@/list/Filter';
import { HTTPProxyTable } from '@/list/Table';
import { EditMetadataModal } from '@/modals/EditMetadataModal';
import { DeleteConfirmationModal } from '@/modals/DeleteConfirmationModal';
import { useHTTPProxyData } from '../hooks/useHTTPProxyData';
import HTTPProxyInfo from '@/shared/HTTPProxyInfo';
import { CONTOUR_MODEL } from '../constants';

const List = ({ namespace }: { namespace?: string }) => {
  const navigate = useHistory();
  const launchModal = useModal();
  const { t } = useTranslation('plugin__contour-console-plugin');

  // State management
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(t('name'));
  const [searchValue, setSearchValue] = useState<string>('');

  const {
    routes,
    filteredRoutes,
    loading,
    refresh,
    setRefresh,
    handleLabelsUpdate,
    handleAnnotationsUpdate,
  } = useHTTPProxyData(namespace, searchValue, selectedFilter);

  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));

  const onFilterToggle = (isOpen: boolean) => {
    setIsFilterOpen(isOpen);
  };

  const onFilterSelect = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const selected = event.currentTarget.textContent || t('name');
    setSelectedFilter(selected);
    setIsFilterOpen(false);
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCreateRoute = (ns: string) => {
    navigate.push(`/k8s/ns/${ns}/projectcontour.io~v1~HTTPProxy/~new`);
  };

  const handleEditRoute = (ns: string, route: HTTPProxy) => {
    navigate.push(
      `/k8s/ns/${ns}/projectcontour.io~v1~HTTPProxy/${route?.metadata?.name}/edit`,
    );
  };

  const handleDeleteModal = async (ns: string, route: HTTPProxy) => {
    try {
      await k8sDelete({
        model: k8sModel,
        resource: route,
        ns: ns,
      });
      setRefresh(true);
    } catch (e) {
      console.error('Error deleting route:', e);
    }
  };

  const handleDelete = React.useCallback(
    (route: HTTPProxy) =>
      launchModal(
        ({ closeModal }) => (
          <DeleteConfirmationModal
            isOpen={true}
            route={route}
            namespace={namespace}
            onDelete={handleDeleteModal}
            onClose={closeModal}
            t={t}
          />
        ),
        { title: t('delete_route') },
      ),
    [namespace, refresh],
  );

  const handleLabels = React.useCallback(
    (route: HTTPProxy) =>
      launchModal(
        ({ closeModal }) => (
          <EditMetadataModal
            route={route}
            type="labels"
            onSave={handleLabelsUpdate}
            onClose={closeModal}
            t={t}
            isOpen={true}
          />
        ),
        { title: t('edit_labels') },
      ),
    [namespace, refresh],
  );

  const handleAnnotations = React.useCallback(
    (route: HTTPProxy) =>
      launchModal(
        ({ closeModal }) => (
          <EditMetadataModal
            route={route}
            type="annotations"
            onSave={handleAnnotationsUpdate}
            onClose={closeModal}
            t={t}
            isOpen={true}
          />
        ),
        { title: t('edit_annotations') },
      ),
    [],
  );

  const getRowActions = (route: HTTPProxy) => [
    {
      title: t('edit_route'),
      onClick: () => handleEditRoute(namespace, route),
    },
    {
      title: t('edit_labels'),
      onClick: () => handleLabels(route),
    },
    {
      title: t('edit_annotations'),
      onClick: () => handleAnnotations(route),
    },
    {
      title: t('deleteRoute'),
      onClick: () => handleDelete(route),
    },
  ];

  return (
    <React.Fragment>
      <Helmet>
        <title>{t('http_proxies')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <HTTPProxyHeader
            onCreateRoute={() => handleCreateRoute(namespace)}
            t={t}
          />
          {routes && routes.length > 0 ? (
            <>
              <HTTPProxyFilters
                selectedFilter={selectedFilter}
                searchValue={searchValue}
                isFilterOpen={isFilterOpen}
                onFilterToggle={onFilterToggle}
                onFilterSelect={onFilterSelect}
                onSearchChange={onSearchChange}
                t={t}
              />
              <div className="pf-u-mt-xl">
                <HTTPProxyTable
                  loading={loading}
                  filteredRoutes={filteredRoutes}
                  lastRowActions={getRowActions}
                  t={t}
                />
              </div>
            </>
          ) : loading ? (
            <div className="flex pf-u-mt-xl">
              <Skeleton width="100%" height="25%" />
              <Skeleton width="100%" height="25%" />
            </div>
          ) : (
            <div>
              <Alert
                className="pf-u-mt-xl"
                isInline
                variant="warning"
                title={t('not_found')}
              />
              <HTTPProxyInfo isTitle={false} />
            </div>
          )}
        </PageSection>
      </Page>
    </React.Fragment>
  );
};

const RoutesList = () => {
  const { ns } = useParams<{ ns?: string }>();
  const activeNamespace = ns || 'all-namespaces';

  return <List namespace={activeNamespace} />;
};

export default RoutesList;
