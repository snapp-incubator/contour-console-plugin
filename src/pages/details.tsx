import { useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import { useParams } from 'react-router-dom';
import {
  Page,
  PageSection,
  GridItem,
  Grid,
  Nav,
  NavItem,
  Skeleton,
  Title,
  Divider,
  Badge,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  k8sGet,
  getGroupVersionKindForResource,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { CONTOUR_MODEL } from '../constants';
import { HTTPProxy } from '../types/k8s';

import DetailsTab from '@/details/DetailsTab';
import MetricsTab from '@/details/MetricsTab';
import YAMLTab from '@/details/YAMLTab';

const RouteDetails = () => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const { name, ns } = useParams<{ name?: string; ns?: string }>();
  const [loading, setLoading] = useState(true);
  const [router, setRouter] = useState<HTTPProxy>();
  const [error, setError] = useState<string | null>(null);
  const [k8sModel] = useK8sModel(getGroupVersionKindForResource(CONTOUR_MODEL));

  const fetchRouter = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await k8sGet({
        model: k8sModel,
        ns,
        name,
      });
      setRouter(response as HTTPProxy);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name && ns) {
      fetchRouter();
    }
  }, [name, ns]);

  const onSelect = (result: { itemId: number | string }) => {
    setActiveTabKey(result.itemId);
  };

  if (!name || !ns) {
    return null;
  }

  if (loading) {
    return (
      <Page>
        <PageSection variant="light">
          <Title size="xl" className="pf-u-mb-md" headingLevel="h1">
            {name}
          </Title>
          <Grid hasGutter={true}>
            <GridItem span={12}>
              <Divider />
              <Nav onSelect={onSelect} variant="horizontal">
                <NavItem
                  className="contour-details-nav-item"
                  itemId={0}
                  isActive={activeTabKey === 0}
                  disabled={true}
                >
                  {t('details_tab_details')}
                </NavItem>
                <NavItem
                  className="contour-details-nav-item"
                  itemId={1}
                  isActive={activeTabKey === 1}
                  disabled={true}
                >
                  {t('details_tab_metric')}
                </NavItem>
                <NavItem
                  className="contour-details-nav-item"
                  itemId={2}
                  isActive={activeTabKey === 2}
                  disabled={true}
                >
                  {t('details_tab_yaml')}
                </NavItem>
              </Nav>
              <Divider />
              <div className="pf-v5-u-mt-md">
                <Skeleton width="100%" height="200px" />
              </div>
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageSection variant="light">
          <div>{t('error_fetching_proxy', { error })}</div>
        </PageSection>
      </Page>
    );
  }

  const renderContent = () => {
    switch (activeTabKey) {
      case 0:
        return <DetailsTab ns={ns} router={router} refetch={fetchRouter} />;
      case 1:
        return <MetricsTab name={name} ns={ns} router={router} />;
      case 2:
        return (
          <YAMLTab name={name} ns={ns} router={router} refetch={fetchRouter} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('details_title')}</title>
      </Helmet>
      <Page className="contour-details-page">
        <PageSection variant="light">
          <Title size="xl" className="pf-u-mb-md" headingLevel="h1">
            <Badge className="pf-u-font-size-md pf-u-mr-xs">{t('hp')}</Badge>
            {name}
          </Title>
          <Grid hasGutter={true}>
            <GridItem span={12}>
              <Divider />
              <Nav onSelect={onSelect} variant="horizontal">
                <NavItem
                  className="contour-details-nav-item"
                  itemId={0}
                  isActive={activeTabKey === 0}
                >
                  {t('details_tab_details')}
                </NavItem>
                <NavItem
                  className="contour-details-nav-item"
                  itemId={1}
                  isActive={activeTabKey === 1}
                >
                  {t('details_tab_metric')}
                </NavItem>
                <NavItem
                  className="contour-details-nav-item"
                  itemId={2}
                  isActive={activeTabKey === 2}
                >
                  {t('details_tab_yaml')}
                </NavItem>
              </Nav>
              <Divider />
              <div className="pf-v5-u-mt-md">{renderContent()}</div>
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    </>
  );
};

export default RouteDetails;
