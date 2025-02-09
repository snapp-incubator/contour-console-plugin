import { useState, useEffect } from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  useResourceMetricsQueries,
  ResourceUtilizationQuery,
} from '../../utils/promql/metrix';
import MetricCard from '@/metric';
import { getBaseURL } from '../../utils/fqdnHandler';
import { PROMETHEUS_API, CONTOUR_MODEL } from '../../constants';
import { MetricsTabProps, MetricDataPoint } from './metricsTab.type';
const MetricsTab = ({ name, ns }: MetricsTabProps) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<
    Record<string, MetricDataPoint[]>
  >({});
  const [error, setError] = useState<string | null>(null);
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

  const formatValue = (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
  };

  const processMetricsData = (data: Record<string, any>) => {
    const processed: Record<string, MetricDataPoint[]> = {};

    Object.entries(data).forEach(([queryType, metrics]: [string, any]) => {
      try {
        if (!metrics?.data?.result?.[0]?.values) {
          processed[queryType] = [];
          return;
        }

        const values = metrics.data.result[0].values;
        const processedPoints = values
          .map((point: [number, string]) => {
            const timestamp = point[0];
            const value = formatValue(point[1]);

            return {
              x: new Date(timestamp * 1000),
              y: value,
            };
          })
          .filter((point: MetricDataPoint) => !isNaN(point.y));

        processed[queryType] = processedPoints;
      } catch (err) {
        console.error(`Error processing ${queryType} metrics:`, err);
        processed[queryType] = [];
      }
    });

    return processed;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const results: Record<string, any> = {};
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - PROMETHEUS_API.TIME_RANGE;

        const promises = Object.entries(metricsQueries).map(
          async ([queryType, queries]) => {
            try {
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

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              return [queryType, data];
            } catch (err) {
              console.error(`Error fetching ${queryType}:`, err);
              return [queryType, { data: { result: [] } }];
            }
          },
        );

        const resolvedResults = await Promise.all(promises);
        resolvedResults.forEach(([queryType, values]) => {
          results[queryType] = values;
        });

        const processedData = processMetricsData(results);
        setMetricsData(processedData);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Failed to fetch metrics data');
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
          error={error}
          unit=" bytes/s"
          query={metricsQueries?.[ResourceUtilizationQuery.NETWORK_IN]?.[0]}
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('traffic_out')}
          data={metricsData[ResourceUtilizationQuery.NETWORK_OUT] || []}
          loading={loading}
          error={error}
          unit=" bytes/s"
          query={metricsQueries?.[ResourceUtilizationQuery.NETWORK_OUT]?.[0]}
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('latency')}
          data={metricsData[ResourceUtilizationQuery.LATENCY] || []}
          loading={loading}
          error={error}
          unit=" conn/s"
          query={metricsQueries?.[ResourceUtilizationQuery.LATENCY]?.[0]}
        />
      </GridItem>
      <GridItem span={6}>
        <MetricCard
          title={t('requests_per_second')}
          data={metricsData[ResourceUtilizationQuery.PRS] || []}
          loading={loading}
          error={error}
          unit=" req/s"
          query={metricsQueries?.[ResourceUtilizationQuery.PRS]?.[0]}
        />
      </GridItem>
    </Grid>
  );
};

export default MetricsTab;
