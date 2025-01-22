import React, { useState, useEffect } from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  useResourceMetricsQueries,
  ResourceUtilizationQuery,
} from '../../utils/promql/metrix';
import MetricCard from '@/metric';
import { getBaseURL } from '../../utils/fqdnHandler';
import { PROMETHEUS_API, CONTOUR_MODEL } from '../../constants';

interface MetricsTabProps {
  name: string;
  ns: string;
}

const MetricsTab = ({ name, ns }: MetricsTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<Record<string, any>>({});
  const baseURL = getBaseURL();

  const metricsQueries = useResourceMetricsQueries(
    {
      ...CONTOUR_MODEL,
      metadata: {
        name,
        namespace: ns,
      },
    },
    baseURL,
  );

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
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - PROMETHEUS_API.TIME_RANGE;

        const promises = Object.entries(metricsQueries).map(
          async ([queryType, queries]) => {
            const params = new URLSearchParams({
              query: queries[0],
              start: startTime.toString(),
              end: endTime.toString(),
              step: PROMETHEUS_API.DEFAULT_STEP,
              timeout: PROMETHEUS_API.DEFAULT_TIMEOUT,
            });

            const response = await fetch(
              `${PROMETHEUS_API.QUERY_RANGE}?${params.toString()}`,
            );
            const data = await response.json();
            return [queryType, data.data.result[0]?.values || []];
          },
        );

        const resolvedResults = await Promise.all(promises);
        resolvedResults.forEach(([queryType, values]) => {
          results[queryType] = values;
        });

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
          query={metricsQueries?.[ResourceUtilizationQuery.NETWORK_IN]?.[0]}
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('traffic_out')}
          data={metricsData[ResourceUtilizationQuery.NETWORK_OUT] || []}
          loading={loading}
          unit=" bytes/s"
          query={metricsQueries?.[ResourceUtilizationQuery.NETWORK_OUT]?.[0]}
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('connection_rate')}
          data={metricsData[ResourceUtilizationQuery.CONNECTION_RATE] || []}
          loading={loading}
          unit=" conn/s"
          query={
            metricsQueries?.[ResourceUtilizationQuery.CONNECTION_RATE]?.[0]
          }
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('requests_per_second')}
          data={metricsData[ResourceUtilizationQuery.PRS] || []}
          loading={loading}
          unit=" req/s"
          query={metricsQueries?.[ResourceUtilizationQuery.PRS]?.[0]}
        />
      </GridItem>
    </Grid>
  );
};

export default MetricsTab;
