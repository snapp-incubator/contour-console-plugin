import React, { useState, useEffect } from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  useResourceMetricsQueries,
  ResourceUtilizationQuery,
} from '../../utils/promql/metrix';
import MetricCard from '@/metric';
interface MetricsTabProps {
  name: string;
  ns: string;
}

const MetricsTab = ({ name, ns }: MetricsTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<Record<string, any>>({});

  const metricsQueries = useResourceMetricsQueries({
    kind: 'HTTPProxy',
    apiVersion: 'projectcontour.io/v1',
    metadata: {
      name,
      namespace: ns,
    },
  });

  const processMetricsData = (data: Record<string, any>) => {
    const processed: Record<string, any> = {};
    Object.entries(data).forEach(([queryType, metrics]: [string, any]) => {
      processed[queryType] =
        metrics?.map((point: any) => ({
          x: new Date(point.timestamp * 1000),
          y: parseFloat(point.value[1]),
        })) || [];
    });
    return processed;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const results: Record<string, any> = {};

        for (const [queryType, queries] of Object.entries(metricsQueries)) {
          const response = await fetch(
            `/api/prometheus/query_range?query=${encodeURIComponent(
              queries[0],
            )}&start=${Date.now() - 3600000}&end=${Date.now()}&step=60`,
          );
          const data = await response.json();
          results[queryType] = data.data.result[0]?.values || [];
        }
        setMetricsData(processMetricsData(results));
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid className="pf-u-mt-xl" hasGutter>
      <GridItem span={6}>
        <MetricCard
          title={t('traffic_in')}
          data={metricsData[ResourceUtilizationQuery.NETWORK_IN] || []}
          loading={loading}
          unit=" bytes/s"
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('traffic_out')}
          data={metricsData[ResourceUtilizationQuery.NETWORK_OUT] || []}
          loading={loading}
          unit=" bytes/s"
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('connection_rate')}
          data={metricsData[ResourceUtilizationQuery.CONNECTION_RATE] || []}
          loading={loading}
          unit=" conn/s"
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('requests_per_second')}
          data={metricsData[ResourceUtilizationQuery.PRS] || []}
          loading={loading}
          unit=" req/s"
        />
      </GridItem>
    </Grid>
  );
};

export default MetricsTab;
