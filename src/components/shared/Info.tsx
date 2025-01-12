import React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Text,
  Hint,
  HintTitle,
  HintBody,
  HintFooter,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface DocsType {
  isTitle?: boolean;
}

const Info = ({ isTitle }: DocsType) => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  return (
    <Card isFullHeight={true} isFlat={true}>
      {isTitle ? <CardTitle>{t('http_proxies')}</CardTitle> : null}
      <CardBody>
        <Text>{t('plugin_used_description')}</Text>
        <br />
        <Hint>
          <HintTitle>{t('advance_configuration')}</HintTitle>
          <HintBody>{t('advance_description')}</HintBody>
          <HintFooter>
            <a href={t('cloud_doc_link')} target="_blank">
              {t('read_more_doc')}
            </a>
          </HintFooter>
        </Hint>
      </CardBody>
    </Card>
  );
};

export default Info;
