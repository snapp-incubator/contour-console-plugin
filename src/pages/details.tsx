import React, { useState } from 'react';
import Helmet from 'react-helmet';
import { useParams } from 'react-router-dom';
import {
  Page,
  PageSection,
  GridItem,
  Grid,
  Tabs,
  Tab,
  TabTitleText,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import DetailsTab from '@/details/DetailsTab';
import MetricsTab from '@/details/MetricsTab';
import YAMLTab from '@/details/YAMLTab';

const RouteDetails = () => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [isBox] = useState<boolean>(true);
  const { name, ns } = useParams<{ name?: string; ns?: string }>();

  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex);
  };

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
                  <DetailsTab
                    name={name}
                    ns={ns}
                    isActive={activeTabKey === 0}
                  />
                </Tab>

                <Tab
                  eventKey={1}
                  title={<TabTitleText>{t('details_tab_metric')}</TabTitleText>}
                >
                  <MetricsTab name={name} ns={ns} />
                </Tab>

                <Tab
                  eventKey={2}
                  title={<TabTitleText>{t('details_tab_yaml')}</TabTitleText>}
                >
                  <YAMLTab name={name} ns={ns} isActive={activeTabKey === 2} />
                </Tab>
              </Tabs>
            </GridItem>
          </Grid>
        </PageSection>
      </Page>
    </>
  );
};

export default RouteDetails;
