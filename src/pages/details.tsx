import React, { useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import { useParams } from 'react-router-dom';
import {
  Page,
  PageSection,
  GridItem,
  Grid,
  Divider,
  Tabs,
  Skeleton,
  Tab,
  TabTitleText,
  Text,
  Badge,
} from '@patternfly/react-core';
import {
  k8sGet,
  getGroupVersionKindForResource,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { mockHttpProxyFormData } from '../utils/modelK8s';
import { Table, Tbody, Th, Thead, Tr, Td } from '@patternfly/react-table';

import { useTranslation } from 'react-i18next';

const RouteDetails = () => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isBox] = React.useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [router, setRouter] = useState<any>();
  const { name, ns } = useParams<{ name?: string; ns?: string }>();

  const location = router?.spec?.virtualhost?.tls
    ? `https://${router?.spec?.virtualhost?.fqdn}`
    : `http://${router?.spec?.virtualhost?.fqdn}`;

  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
  };

  const [k8sModel] = useK8sModel(
    getGroupVersionKindForResource(mockHttpProxyFormData),
  );

  const fetchRouter = async () => {
    try {
      const response = await k8sGet({
        model: k8sModel,
        ns: ns,
        name: name,
      });
      setRouter(response);
    } catch (error) {
      console.log('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouter();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('details_title')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Grid hasGutter={true}>
            <GridItem span={12}>
              <Tabs
                activeKey={activeTabKey}
                onSelect={handleTabClick}
                isBox={isBox}
                aria-label={t('details_title')}
              >
                <Tab
                  eventKey={0}
                  title={
                    <TabTitleText>{t('details_tab_details')}</TabTitleText>
                  }
                  aria-label={t('details_tab_details')}
                >
                  {loading ? (
                    <Skeleton width="100%" height="25%" />
                  ) : (
                    <>
                      <Grid hasGutter={true}>
                        <GridItem span={6}>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('details_name')}</strong>
                          </Text>
                          <Text>{router?.metadata?.name}</Text>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('details_namespace')}</strong>
                          </Text>
                          <Text>
                            <Badge className="pf-u-mr-xs">{t('ns')}</Badge>
                            {router?.metadata?.namespace}
                          </Text>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('details_created')}</strong>
                          </Text>
                          <Text>{router?.metadata?.creationTimestamp}</Text>
                        </GridItem>
                        <GridItem span={6}>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('location')}</strong>
                          </Text>
                          <Text>
                            <a target="_blank" href={location}>
                              {location}
                            </a>
                          </Text>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('details_status')}</strong>
                          </Text>
                          <Badge className="pf-u-mr-xs">{t('accepted')}</Badge>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('details_fqdn')}</strong>
                          </Text>
                          <Text>{router?.spec?.virtualhost?.fqdn}</Text>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('router_canonical')}</strong>
                          </Text>
                          <Text>
                            {router?.status?.loadBalancer?.ingress?.[0]?.ip ||
                              '-'}
                          </Text>
                        </GridItem>
                      </Grid>

                      <Divider className="pf-u-mt-xl" />
                      <Text className="pf-u-mt-xl">
                        <strong>{t('details_routes_title')}</strong>
                      </Text>

                      <Table
                        aria-label={t('details_routes_title')}
                        variant="compact"
                        className="pf-u-mt-xl"
                      >
                        <Thead>
                          <Tr>
                            <Th>{t('details_routes_path')}</Th>
                            <Th>{t('details_routes_service')}</Th>
                            <Th>{t('details_routes_port')}</Th>
                            <Th>{t('secret')}</Th>
                            <Th>{t('subject_name')}</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {router?.spec?.routes.map((route, index) => {
                            return (
                              <Tr key={index}>
                                <Td>
                                  {route?.conditions
                                    ? route?.conditions[index]?.prefix
                                    : '/'}
                                </Td>
                                <Td>{route?.services[index]?.name || '-'}</Td>
                                <Td>{route?.services[index]?.port || '-'}</Td>
                                <Td>
                                  {route?.services[index]?.subjectName || '-'}
                                </Td>
                                <Td>{route?.services[index]?.secret || '-'}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>

                      <Divider className="pf-u-mt-xl" />
                      <Text className="pf-u-mt-xl">
                        <strong>{t('details_tls_title')}</strong>
                      </Text>
                      <Grid hasGutter={true}>
                        <GridItem span={6}>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('details_tls_mode')}</strong>
                          </Text>
                          <Text>
                            {router?.spec?.virtualhost?.tls
                              ? router?.spec?.virtualhost?.tls
                                  ?.enableFallbackCertificate
                                ? t('edge_fallback')
                                : t('edge')
                              : '-'}
                          </Text>
                          <Text className="pf-u-mt-xl">
                            <strong>{t('details_tls_secret_name')}</strong>
                          </Text>
                          <Text>
                            {router?.spec?.virtualhost?.tls?.secretName}
                          </Text>
                        </GridItem>
                      </Grid>
                      <Divider className="pf-u-mt-xl" />
                      <Text className="pf-u-mt-xl">
                        <strong>
                          {t('details_router_title')}:
                          <Badge className="pf-u-ml-sm">
                            {router?.spec?.ingressClassName.toUpperCase()}
                          </Badge>
                        </strong>
                      </Text>
                      <Text className="pf-u-mt-xl">
                        <strong>{t('details_fqdn')}</strong>
                      </Text>
                      <Text>{router?.spec?.virtualhost?.fqdn}</Text>
                      <Text className="pf-u-mt-xl">
                        <strong>{t('wildcard_policy')}</strong>
                      </Text>
                      <Text>
                        {router?.spec?.virtualhost?.tls
                          ?.enableFallbackCertificate
                          ? t('allow')
                          : '-'}
                      </Text>
                      <Text className="pf-u-mt-xl">
                        <strong>{t('router_canonical')}</strong>
                      </Text>
                      <Text>
                        {router?.status?.loadBalancer?.ingress?.[0]?.ip || '-'}
                      </Text>
                      <Text className="pf-u-mt-xl">
                        <strong>{t('details_conditions_title')}</strong>
                      </Text>
                      <Table aria-label={t('details_conditions_title')}>
                        <Thead>
                          <Tr>
                            <Th>{t('details_conditions_type')}</Th>
                            <Th>{t('details_conditions_status')}</Th>
                            <Th>{t('details_conditions_updated')}</Th>
                            <Th>{t('details_conditions_reason')}</Th>
                            <Th>{t('details_conditions_message')}</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {router?.status?.conditions.map(
                            (condition, index) => {
                              return (
                                <Tr key={index}>
                                  <Td>{condition?.type}</Td>
                                  <Td>{condition?.status}</Td>
                                  <Td>{condition?.lastTransitionTime}</Td>
                                  <Td>{condition?.reason}</Td>
                                  <Td>{condition?.message}</Td>
                                </Tr>
                              );
                            },
                          )}
                        </Tbody>
                      </Table>
                    </>
                  )}
                </Tab>

                <Tab
                  eventKey={1}
                  title={<TabTitleText>{t('details_tab_metric')}</TabTitleText>}
                ></Tab>

                <Tab
                  eventKey={2}
                  title={<TabTitleText>{t('details_tab_yaml')}</TabTitleText>}
                ></Tab>
              </Tabs>
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    </>
  );
};

export default RouteDetails;
