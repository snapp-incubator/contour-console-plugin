import React, { useState, useEffect } from 'react';
import {
  GridItem,
  Grid,
  Divider,
  Skeleton,
  Text,
  Badge,
} from '@patternfly/react-core';
import { Table, Tbody, Th, Thead, Tr, Td } from '@patternfly/react-table';
import {
  k8sGet,
  getGroupVersionKindForResource,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { CONTOUR_MODEL } from '../../constants';
import { StatusIndicator } from '../shared/StatusIndicator';

interface DetailsTabProps {
  name: string;
  ns: string;
}

const DetailsTab = ({ name, ns }: DetailsTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [loading, setLoading] = useState(true);
  const [router, setRouter] = useState<any>();
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));

  const location = router?.spec?.virtualhost?.tls
    ? `https://${router?.spec?.virtualhost?.fqdn}`
    : `http://${router?.spec?.virtualhost?.fqdn}`;

  const fetchRouter = async () => {
    try {
      const response = await k8sGet({
        model: k8sModel,
        ns,
        name,
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

  if (loading) {
    return <Skeleton width="100%" height="25%" />;
  }

  return (
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
          {router?.metadata?.labels ? (
            <>
              <Text className="pf-u-mt-xl">
                <strong>{t('labels')}</strong>
              </Text>
              {Object.entries(router?.metadata?.labels).map(([key, value]) => (
                <Badge
                  isRead={true}
                  className="pf-u-mr-xs pf-u-mt-xs pf-c-badge-BorderWidth pf-c-badge-BorderColor"
                  key={key}
                >
                  {key}: {value}
                </Badge>
              ))}
            </>
          ) : null}
          {router?.metadata?.annotations ? (
            <>
              <Text className="pf-u-mt-xl">
                <strong>{t('annotations')}</strong>
              </Text>
              {Object.entries(router?.metadata?.annotations).map(
                ([key, value]) => (
                  <Badge
                    isRead={true}
                    className="pf-u-mr-xs pf-u-mt-xs pf-c-badge-BorderWidth pf-c-badge-BorderColor"
                    key={key}
                  >
                    {key}: {value}
                  </Badge>
                ),
              )}
            </>
          ) : null}
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
          <StatusIndicator status={router?.status?.currentStatus} t={t} />
          <Text className="pf-u-mt-xl">
            <strong>{t('details_fqdn')}</strong>
          </Text>
          <Text>{router?.spec?.virtualhost?.fqdn}</Text>
          <Text className="pf-u-mt-xl">
            <strong>{t('router_canonical')}</strong>
          </Text>
          <Text>{router?.status?.loadBalancer?.ingress[0]?.ip || '-'}</Text>
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
          {router?.spec?.routes?.map((route, index) => (
            <Tr key={index}>
              <Td>{route?.conditions?.[index]?.prefix || '/'}</Td>
              <Td>{route?.services?.[index]?.name || '-'}</Td>
              <Td>{route?.services?.[index]?.port || '-'}</Td>
              <Td>{route?.services?.[index]?.subjectName || '-'}</Td>
              <Td>{route?.services?.[index]?.secret || '-'}</Td>
            </Tr>
          ))}
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
              ? router?.spec?.virtualhost?.tls?.enableFallbackCertificate
                ? t('edge_fallback')
                : t('edge')
              : '-'}
          </Text>
          <Text className="pf-u-mt-xl">
            <strong>{t('details_tls_secret_name')}</strong>
          </Text>
          <Text>{router?.spec?.virtualhost?.tls?.secretName}</Text>
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
        {router?.spec?.virtualhost?.tls?.enableFallbackCertificate
          ? t('allow')
          : '-'}
      </Text>
      <Text className="pf-u-mt-xl">
        <strong>{t('router_canonical')}</strong>
      </Text>
      <Text>{router?.status?.loadBalancer?.ingress[0]?.ip || '-'}</Text>

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
          {router?.status?.conditions?.map((condition, index) => (
            <Tr key={index}>
              <Td>{condition?.type}</Td>
              <Td>{condition?.status}</Td>
              <Td>{condition?.lastTransitionTime}</Td>
              <Td>{condition?.reason}</Td>
              <Td>{condition?.message}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default DetailsTab;
