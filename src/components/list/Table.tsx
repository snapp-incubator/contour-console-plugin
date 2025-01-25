import React from 'react';
import {
  TableVariant,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
} from '@patternfly/react-table';
import { Skeleton, Alert } from '@patternfly/react-core';
import { TableRow } from './TableRow';
import HTTPProxyInfo from '@/shared/HTTPProxyInfo';

interface HTTPProxyTableProps {
  loading: boolean;
  filteredRoutes: any[];
  isAllNamespaces: boolean;
  lastRowActions: (route: any) => any[];
  t: (key: string) => string;
}

export const HTTPProxyTable = ({
  loading,
  filteredRoutes,
  isAllNamespaces,
  lastRowActions,
  t,
}: HTTPProxyTableProps) => {
  if (loading) {
    return <LoadingRows />;
  }

  if (!filteredRoutes?.length) {
    return (
      <div>
        <Alert
          className="pf-u-mt-xl"
          isInline
          variant="warning"
          title={t('not_found')}
        />
        <HTTPProxyInfo isTitle={false} />
      </div>
    );
  }

  return (
    <Table aria-label={t('routes_table')} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th>{t('name')}</Th>
          <Th>{t('namespace')}</Th>
          <Th>{t('status')}</Th>
          <Th>{t('location')}</Th>
          {!isAllNamespaces && (
            <>
              <Th>{t('target_port')}</Th>
              <Th colSpan={2}>{t('service')}</Th>
            </>
          )}
        </Tr>
      </Thead>
      <Tbody>
        {filteredRoutes.map((route) => (
          <TableRow
            key={route?.metadata?.uid}
            route={route}
            lastRowActions={lastRowActions}
            isAllNamespaces={isAllNamespaces}
            t={t}
          />
        ))}
      </Tbody>
    </Table>
  );
};

const LoadingRows = () => (
  <>
    {[1, 2, 3].map((key) => (
      <Tr key={key}>
        <Td colSpan={6} className="pf-u-text-align-center">
          <Skeleton width="100%" height="25%" />
        </Td>
      </Tr>
    ))}
  </>
);
