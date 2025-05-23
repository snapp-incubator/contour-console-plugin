import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GridItem,
  Grid,
  Divider,
  Text,
  Badge,
  Button,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  TableText,
} from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { StatusIndicator } from '../shared/StatusIndicator';
import { EditMetadataModal } from '../modals/EditMetadataModal';
import { EditAnnotationsModal } from '../modals/EditAnnotationsModal';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useHTTPProxyData } from '../../hooks/useHTTPProxyData';

interface DetailsTabProps {
  ns: string;
  router: any;
  refetch: () => Promise<void>;
  addAlert: (title: string, variant?: 'danger' | 'success') => void;
}

const DetailsTab = ({ ns, router, refetch, addAlert }: DetailsTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [isEditLabelsOpen, setIsEditLabelsOpen] = useState(false);
  const [isEditAnnotationsOpen, setIsEditAnnotationsOpen] = useState(false);
  const { handleLabelsUpdate, handleAnnotationsUpdate } = useHTTPProxyData(ns);

  const location = router?.spec?.virtualhost?.tls
    ? `https://${router?.spec?.virtualhost?.fqdn}`
    : `http://${router?.spec?.virtualhost?.fqdn}`;

  const handleSaveLabels = async (route: any, metadata: any) => {
    try {
      await handleLabelsUpdate(route, metadata);
      await refetch();
      addAlert(t('labels_updated_success'), 'success');
      setIsEditLabelsOpen(false);
    } catch (error) {
      addAlert(t('labels_updated_error'), 'danger');
    }
  };

  const handleSaveAnnotations = async (route: any, metadata: any) => {
    try {
      await handleAnnotationsUpdate(route, metadata);
      await refetch();
      addAlert(t('annotations_updated_success'), 'success');
      setIsEditAnnotationsOpen(false);
    } catch (error) {
      addAlert(t('annotations_updated_error'), 'danger');
    }
  };

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
          <Text className="pf-u-mt-xl">
            <strong>{t('labels')}</strong>
            <Button
              variant="link"
              className="pf-u-ml-sm"
              icon={<PencilAltIcon />}
              onClick={() => setIsEditLabelsOpen(true)}
              isInline
            >
              {t('edit')}
            </Button>
          </Text>
          {router?.metadata?.labels
            ? Object.entries(router?.metadata?.labels).map(([key, value]) => (
                <Badge
                  isRead={true}
                  className="pf-u-mr-xs pf-u-mt-xs pf-c-badge-BorderWidth pf-c-badge-BorderColor"
                  key={key}
                >
                  {key}: {value}
                </Badge>
              ))
            : null}
          <Text className="pf-u-mt-md">
            <strong>{t('annotations')}</strong>
            <Button
              variant="link"
              className="pf-u-ml-sm"
              icon={<PencilAltIcon />}
              onClick={() => setIsEditAnnotationsOpen(true)}
              isInline
            >
              {t('edit')}
            </Button>
          </Text>
          {router?.metadata?.annotations
            ? Object.entries(router?.metadata?.annotations).map(
                ([key, value]) => (
                  <Badge
                    isRead={true}
                    className="contour-annotation-tag pf-u-mr-xs pf-u-mt-xs pf-c-badge-BorderWidth pf-c-badge-BorderColor"
                    key={key}
                  >
                    {key}: {value}
                  </Badge>
                ),
              )
            : null}
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
          <StatusIndicator
            status={router?.status?.currentStatus}
            conditions={router?.status?.conditions}
            t={t}
          />
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
        className="pf-u-mt-sm"
      >
        <Thead>
          <Tr>
            <Th>{t('details_routes_path')}</Th>
            <Th>{t('details_routes_service')}</Th>
            <Th>{t('secret')}</Th>
            <Th>{t('subject_name')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {router?.spec?.routes?.map((route, index) => (
            <Tr key={index}>
              <Td>{route?.conditions?.[index]?.prefix || '/'}</Td>
              <Td>
                <TableText>
                  {route?.services?.map((service) => (
                    <div key={service.name}>
                      <Link
                        className="pf-u-ml-sm"
                        to={`/k8s/ns/${ns}/services/${service?.name}`}
                      >
                        <Badge className="co-m-resource-icon co-m-resource-service">
                          {t('s')}
                        </Badge>
                        {service?.name}:{service?.port}
                      </Link>
                    </div>
                  ))}
                </TableText>
              </Td>
              <Td>
                {route?.services?.map((service, serviceIndex) => (
                  <TableText key={`${service.name}-validation-${serviceIndex}`}>
                    {service?.validation?.caSecret}
                  </TableText>
                ))}
              </Td>
              <Td>
                {route?.services?.map((service, serviceIndex) => (
                  <TableText key={`${service.name}-subject-${serviceIndex}`}>
                    {service?.validation?.subjectName}
                  </TableText>
                ))}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {router?.spec?.includes?.length > 0 ? (
        <>
          <Text className="pf-u-mt-xl">
            <strong>{t('details_includes_title')}</strong>
          </Text>
          <Table
            aria-label={t('details_includes_title')}
            variant="compact"
            className="pf-u-mt-sm"
          >
            <Thead>
              <Tr>
                <Th>{t('details_routes_path')}</Th>
                <Th>{t('http_proxy')}</Th>
                <Th>{t('details_namespace')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {router?.spec?.includes?.map((include, index) => (
                <Tr key={index}>
                  <Td>
                    {include?.conditions?.map((condition, condIndex) => (
                      <Badge isRead className="pf-u-mr-sm" key={condIndex}>
                        {condition?.prefix || '/'}
                      </Badge>
                    ))}
                  </Td>
                  <Td>{include?.name}</Td>
                  <Td>{include?.namespace}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      ) : null}

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
            {router?.spec?.ingressClassName?.toUpperCase() || '-'}
          </Badge>
        </strong>
      </Text>
      <Text className="pf-u-mt-xl">
        <strong>{t('details_fqdn')}</strong>
      </Text>
      <Text>{router?.spec?.virtualhost?.fqdn || '-'}</Text>
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
      <EditMetadataModal
        route={router}
        type="labels"
        onSave={handleSaveLabels}
        onClose={() => setIsEditLabelsOpen(false)}
        t={t}
        isOpen={isEditLabelsOpen}
      />
      <EditAnnotationsModal
        route={router}
        onSave={handleSaveAnnotations}
        onClose={() => setIsEditAnnotationsOpen(false)}
        t={t}
        isOpen={isEditAnnotationsOpen}
      />
    </>
  );
};

export default DetailsTab;
