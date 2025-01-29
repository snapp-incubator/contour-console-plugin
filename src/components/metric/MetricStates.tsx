import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Spinner,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

export const LoadingState = () => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  return (
    <EmptyState>
      <Spinner size="xl" />
      <Title headingLevel="h4" size="md">
        {t('metrics_loading')}
      </Title>
    </EmptyState>
  );
};

export const ErrorState = ({ error }: { error: string }) => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  return (
    <EmptyState>
      <EmptyStateIcon icon={ExclamationCircleIcon} color="#c9190b" />
      <Title headingLevel="h4" size="md">
        {t('metrics_error_loading')}
      </Title>
      <EmptyStateBody>{error}</EmptyStateBody>
    </EmptyState>
  );
};

export const EmptyDataState = () => {
  const { t } = useTranslation('plugin__contour-console-plugin');
  return (
    <EmptyState>
      <Title headingLevel="h4" size="md">
        {t('metrics_no_data')}
      </Title>
      <EmptyStateBody>{t('metrics_no_data_description')}</EmptyStateBody>
    </EmptyState>
  );
};
