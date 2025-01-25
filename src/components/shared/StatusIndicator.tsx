import React from 'react';
import { Flex } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';

interface StatusIndicatorProps {
  status: string;
  t: (key: string) => string;
}

export const StatusIndicator = ({
  status,
  t,
}: StatusIndicatorProps): JSX.Element => (
  <Flex>
    {status === 'valid' ? (
      <>
        <CheckCircleIcon className="pf-u-mr-xs" color="green" />
        {t('accepted')}
      </>
    ) : (
      <>
        <ExclamationCircleIcon className="pf-u-mr-xs" color="red" />
        {t('error')}
      </>
    )}
  </Flex>
);
