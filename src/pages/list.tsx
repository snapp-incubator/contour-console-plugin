import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { TagsInput } from 'react-tag-input-component';
import '../style.css';

import {
  useK8sModel,
  k8sDelete,
  k8sPatch,
  getGroupVersionKindForResource,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';
import { mockHttpProxyFormData } from '../utils/modelK8s';
import Modal from '../components/modal';
import CloudDocument from '../components/shared/Info';
import { labelToObject, objectToLabel } from '../utils/labelToObject';

// Define types for Route data
interface Route {
  name: string;
  namespace: string;
  status: string;
  location: string;
  service: string;
}

const List = ({ namespace }: { namespace?: string }) => {
  const navigate = useHistory();
  const launchModal = useModal();

  const { t } = useTranslation('plugin__contour-console-plugin');

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(t('name'));
  const [labelsValue, setLabelsValue] = useState<[]>();
  const [annotationsValue, setAnnotationsValue] = useState<[]>();

  const labelsValueRef = useRef(labelsValue);
  const annotationsValueRef = useRef(annotationsValue);

  const [searchValue, setSearchValue] = useState<string>('');

  const onFilterToggle = (isOpen: boolean) => {
    setIsFilterOpen(isOpen);
  };

  const onFilterSelect = (event: React.SyntheticEvent<HTMLDivElement>) => {
    console.log('event', event.currentTarget.textContent);
    const selected = event.currentTarget.textContent || t('name');
    setSelectedFilter(selected);
    setIsFilterOpen(false);
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleDeleteModal = (route: any) => {
    k8sDelete({
      model: k8sModel,
      resource: route,
      ns: namespace,
    })
      .then(() => {
        setRefresh(true);
      })
      .catch((e) => {
        console.log('error', e);
      });
  };

  useEffect(() => {
    labelsValueRef.current = labelsValue;
  }, [labelsValue]);

  useEffect(() => {
    annotationsValueRef.current = annotationsValue;
  }, [annotationsValue]);

  const handleChangeTags = (tags: any) => {
    setLabelsValue(tags);
  };

  const handleChangeAnnotations = (tags: any) => {
    setAnnotationsValue(tags);
  };

  const handleUpdateLabel = (route: any) => {
    k8sPatch({
      model: k8sModel,
      resource: route,
      data: [
        {
          op: 'replace',
          path: '/metadata/labels',
          value: labelToObject(labelsValueRef.current),
        },
      ],
    })
      .then(() => {
        setRefresh(true);
      })
      .catch((e) => {
        console.log('error', e);
      });
  };

  const handleUpdateAnnotations = (route: any) => {
    k8sPatch({
      model: k8sModel,
      resource: route,
      data: [
        {
          op: 'replace',
          path: '/metadata/annotations',
          value: labelToObject(annotationsValueRef.current),
        },
      ],
    })
      .then(() => {
        setRefresh(true);
      })
      .catch((e) => {
        console.log('error', e);
      });
  };

  const handleDelete = React.useCallback(
    (route, namespace) =>
      launchModal(
        ({ closeModal }) => (
          <Modal
            isModalOpen={true}
            title={t('title_delete_modal')}
            textSuccess={t('delete')}
            successVariant={'danger'}
            textCancel={t('cancel')}
            closeModal={closeModal}
            handleSuccess={() => {
              handleDeleteModal(route);
              closeModal();
              setLoading(true);
            }}
          >
            {t('confirm_delete_route')
              .replace('{{name}}', route.metadata.name)
              .replace('{{namespace}}', namespace)}
          </Modal>
        ),
        {},
      ),
    [launchModal],
  );

  const handleLabels = React.useCallback(
    (route) =>
      launchModal(
        ({ closeModal }) => (
          <Modal
            isModalOpen={true}
            title={t('edit_labels')}
            textSuccess={t('save')}
            textCancel={t('cancel')}
            closeModal={closeModal}
            handleSuccess={() => {
              handleUpdateLabel(route);
              closeModal();
              setLoading(true);
            }}
          >
            <>
              {t('labels_help_text')}
              <FormGroup
                className="pf-u-mt-lg"
                label={`Labels for: ${route.metadata['name']}`}
                fieldId="tags-label"
              >
                <TagsInput
                  classNames={{ tag: 'tags', input: 'input-tag' }}
                  value={objectToLabel(route?.metadata?.labels)}
                  onChange={handleChangeTags}
                  name="tags"
                  placeHolder="app=frontend"
                />
              </FormGroup>
            </>
          </Modal>
        ),
        {},
      ),
    [launchModal, labelsValueRef],
  );

  const handleAnnotations = React.useCallback(
    (route) =>
      launchModal(
        ({ closeModal }) => (
          <Modal
            isModalOpen={true}
            title={t('edit_annotations')}
            textSuccess={t('save')}
            textCancel={t('cancel')}
            closeModal={closeModal}
            handleSuccess={() => {
              handleUpdateAnnotations(route);
              closeModal();
              setLoading(true);
            }}
          >
            <>
              {t('annotations_help_text')}
              <FormGroup
                className="pf-u-mt-lg"
                label={`Annotations for: ${route.metadata?.name}`}
                fieldId="tags-label"
              >
                <TagsInput
                  classNames={{ tag: 'tags', input: 'input-tag' }}
                  value={objectToLabel(route?.metadata?.annotations)}
                  onChange={handleChangeAnnotations}
                  name="annotations"
                  placeHolder="key=value"
                />
              </FormGroup>
            </>
          </Modal>
        ),
        {},
      ),
    [launchModal, annotationsValueRef],
  );

  const filterItems = [
    <DropdownItem key="name">{t('name')}</DropdownItem>,
    <DropdownItem key="label">{t('label')}</DropdownItem>,
  ];

  const handleCreateRoute = (ns) => {
    navigate.push(`/k8s/ns/${ns}/projectcontour.io~v1~HTTPProxy/~new`);
  };

  const handleEditRoute = (ns, route) => {
    navigate.push(
      `/k8s/ns/${ns}/projectcontour.io~v1~HTTPProxy/${route?.metadata?.name}/edit`,
    );
  };

  const [k8sModel] = useK8sModel(
    getGroupVersionKindForResource(mockHttpProxyFormData),
  );

  const fetchRoutes = async () => {
    try {
      const response = await k8sGet({
        model: k8sModel,
        ns: namespace,
      });
      setRoutes(response['items']);
      setFilteredRoutes(response['items']);
    } catch (error) {
      console.log('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [namespace, refresh]);

  useEffect(() => {
    const lowerSearchValue = searchValue.toLowerCase();
    const regex = new RegExp(lowerSearchValue, 'i');

    const filtered = lowerSearchValue
      ? routes.filter((route: any) => {
          if (selectedFilter === t('label')) {
            if (!route.metadata?.labels) {
              return false;
            }
            const labelStrings = Object.entries(route.metadata.labels).map(
              ([key, value]) => `${key}=${value}`,
            );

            return labelStrings.some((label) =>
              regex.test(label.toLowerCase()),
            );
          }
          return regex.test(route.metadata?.name?.toLowerCase());
        })
      : routes;

    setFilteredRoutes(filtered);
  }, [searchValue, selectedFilter, routes]);

  const renderStatus = (status: string) => {
    return status === 'valid' ? (
      <Flex>
        <CheckCircleIcon className="pf-u-mr-xs" color="green" />
        {t('accepted')}
      </Flex>
    ) : (
      <Flex>
        <ExclamationCircleIcon className="pf-u-mr-xs" color="red" />
        {t('error')}
      </Flex>
    );
  };

  const lastRowActions = (route: any) => [
    {
      title: t('edit_route'),
      onClick: () => {
        handleEditRoute(namespace, route);
      },
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
      onClick: () => handleDelete(route, namespace),
    },
  ];

  return (
    <React.Fragment>
      <Helmet>
        <title>{t('http_proxies')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Flex>
            <FlexItem>
              <Title headingLevel="h1">{t('http_proxies')}</Title>
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              <Button
                variant="primary"
                onClick={() => {
                  handleCreateRoute(namespace);
                }}
              >
                {t('create_http_proxy')}
              </Button>
            </FlexItem>
          </Flex>
          {routes && routes?.length > 0 ? (
            <>
              <Flex className="pf-u-mt-xl">
                <FlexItem>
                  <InputGroup>
                    <Dropdown
                      toggle={
                        <DropdownToggle
                          onToggle={onFilterToggle}
                          icon={<FilterIcon />}
                        >
                          {selectedFilter}
                        </DropdownToggle>
                      }
                      isOpen={isFilterOpen}
                      dropdownItems={filterItems}
                      onSelect={onFilterSelect}
                    />
                    <TextInput
                      value={searchValue}
                      type="text"
                      onChange={onSearchChange}
                      aria-label={t('searchBy', { filter: selectedFilter })}
                      placeholder={t('search_by_placeholder').replace(
                        '{{filter}}',
                        selectedFilter.toLowerCase(),
                      )}
                    />
                  </InputGroup>
                </FlexItem>
              </Flex>
              <div className="pf-u-mt-xl">
                <Table
                  aria-label={t('routes_table')}
                  variant={TableVariant.compact}
                >
                  <Thead>
                    <Tr>
                      <Th>{t('name')}</Th>
                      <Th>{t('namespace')}</Th>
                      <Th>{t('status')}</Th>
                      <Th>{t('location')}</Th>
                      <Th>{t('target_port')}</Th>
                      <Th colSpan={2}>{t('service')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading ? (
                      <>
                        <Tr>
                          <Td colSpan={6} className="pf-u-text-align-center">
                            <Skeleton width="100%" height="25%" />
                          </Td>
                        </Tr>
                        <Tr>
                          <Td colSpan={6} className="pf-u-text-align-center">
                            <Skeleton width="100%" height="25%" />
                          </Td>
                        </Tr>
                        <Tr>
                          <Td colSpan={6} className="pf-u-text-align-center">
                            <Skeleton width="100%" height="25%" />
                          </Td>
                        </Tr>
                      </>
                    ) : filteredRoutes && filteredRoutes.length > 0 ? (
                      filteredRoutes.map((route: any) => (
                        <Tr key={route?.metadata?.uid}>
                          <Td dataLabel={t('name')}>
                            <TableText>
                              <Link
                                to={`/k8s/ns/${route?.metadata?.namespace}/projectcontour.io~v1~HTTPProxy/${route?.metadata?.name}`}
                              >
                                <Badge className="pf-u-mr-xs">{t('hp')}</Badge>
                                {route?.metadata?.name}
                              </Link>
                            </TableText>
                          </Td>
                          <Td dataLabel={t('namespace')}>
                            <TableText>
                              <Link
                                to={`/k8s/cluster/namespaces/${route?.metadata?.namespace}`}
                              >
                                <Badge className="pf-u-mr-xs">{t('ns')}</Badge>
                                {route?.metadata?.namespace}
                              </Link>
                            </TableText>
                          </Td>
                          <Td width={10} dataLabel={t('status')}>
                            {renderStatus(route.status.currentStatus)}
                          </Td>
                          <Td width={20} dataLabel={t('location')}>
                            <a
                              href={
                                route?.spec?.virtualhost
                                  ? route?.spec?.virtualhost?.tls
                                    ? `https://${route?.spec?.virtualhost?.fqdn}`
                                    : `http://${route?.spec?.virtualhost?.fqdn}`
                                  : ''
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {route?.spec?.virtualhost
                                ? route?.spec?.virtualhost?.tls
                                  ? `https://${route?.spec?.virtualhost?.fqdn}`
                                  : `http://${route?.spec?.virtualhost?.fqdn}`
                                : ''}
                              <ExternalLinkAltIcon className="pf-u-ml-xs" />
                            </a>
                          </Td>
                          <Td dataLabel={t('target_port')}>
                            <Badge isRead>
                              <TableText>
                                {t('tcp')}-
                                {route?.spec?.routes[0]?.services
                                  ? route?.spec?.routes[0]?.services[0]?.port
                                  : 'Error'}
                              </TableText>
                            </Badge>
                          </Td>
                          <Td dataLabel={t('service')}>
                            <TableText>
                              <Badge
                                className={
                                  'co-m-resource-icon co-m-resource-service'
                                }
                              >
                                {t('s')}
                              </Badge>
                              {route?.spec?.routes[0]?.services
                                ? route?.spec?.routes[0]?.services[0]?.name
                                : 'Error'}
                            </TableText>
                          </Td>
                          <Td>
                            <ActionsColumn items={lastRowActions(route)} />
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={6} className="pf-u-text-align-center">
                          {t('not_found')}
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
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
              <CloudDocument isTitle={false} />
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
