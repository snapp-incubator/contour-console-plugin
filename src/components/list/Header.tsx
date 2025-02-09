import { Button, Flex, FlexItem, Title } from '@patternfly/react-core';

interface HTTPProxyHeaderProps {
  onCreateRoute: () => void;
  t: (key: string) => string;
}

export const HTTPProxyHeader = ({
  onCreateRoute,
  t,
}: HTTPProxyHeaderProps): JSX.Element => (
  <Flex>
    <FlexItem>
      <Title headingLevel="h1">{t('http_proxies')}</Title>
    </FlexItem>
    <FlexItem align={{ default: 'alignRight' }}>
      <Button variant="primary" onClick={onCreateRoute}>
        {t('create_http_proxy')}
      </Button>
    </FlexItem>
  </Flex>
);
