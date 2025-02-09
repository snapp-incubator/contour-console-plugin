import { Link } from 'react-router-dom';
import { Tr, Td, TableText, ActionsColumn } from '@patternfly/react-table';
import { Badge } from '@patternfly/react-core';
import { StatusIndicator } from '../shared/StatusIndicator';
import { LocationLink } from './LocationLink';

interface TableRowProps {
  route: any;
  lastRowActions: (route: any) => any[];
  isAllNamespaces: boolean;
  t: (key: string) => string;
}

export const TableRow = ({
  route,
  lastRowActions,
  isAllNamespaces,
  t,
}: TableRowProps): JSX.Element => (
  <Tr key={route?.metadata?.uid}>
    <Td dataLabel={t('name')}>
      <TableText>
        <Link
          to={`/k8s/ns/${route?.metadata?.namespace}/projectcontour.io~v1~HTTPProxy/${route?.metadata?.name}`}
        >
          <Badge className="pf-u-mr-xs">{t('hp')}</Badge>
          {route?.metadata?.name}
        </Link>
      </TableText>
    </Td>
    <Td dataLabel={t('namespace')}>
      <TableText>
        <Link to={`/k8s/cluster/namespaces/${route?.metadata?.namespace}`}>
          <Badge className="pf-u-mr-xs">{t('ns')}</Badge>
          {route?.metadata?.namespace}
        </Link>
      </TableText>
    </Td>
    <Td width={10} dataLabel={t('status')}>
      <StatusIndicator status={route.status.currentStatus} t={t} />
    </Td>
    <Td width={20} dataLabel={t('location')}>
      <LocationLink route={route} />
    </Td>
    {!isAllNamespaces && (
      <>
        <Td dataLabel={t('service')}>
          {route?.spec?.routes?.map((item) =>
            item?.services?.map((service) => (
              <TableText>
                <Link
                  className="pf-u-ml-sm"
                  key={service?.name}
                  to={`/k8s/ns/${route?.metadata?.namespace}/services/${service?.name}`}
                >
                  <Badge className="co-m-resource-icon co-m-resource-service">
                    {t('s')}
                  </Badge>
                  {service?.name}:{service?.port}
                </Link>
              </TableText>
            )),
          )}
        </Td>
      </>
    )}
    <Td>
      <ActionsColumn items={lastRowActions(route)} />
    </Td>
  </Tr>
);
