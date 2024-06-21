import * as React from 'react';
import { Button } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import MinusCircleIcon from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { useTranslation } from 'react-i18next';

const ArrayFieldTemplate = (props) => {
  const { t } = useTranslation('plugin__contour-console-plugin');

  return (
    <>
      {props.items.map((item) => (
        <>
          {item.hasRemove && (
            <Button
              icon={<MinusCircleIcon />}
              variant="link"
              onClick={item.onDropIndexClick(item.index)}
            >
              {t('Remove alternate Service')}
            </Button>
          )}

          {item.children}
        </>
      ))}
      {props.canAdd && (
        <Button
          icon={<PlusCircleIcon />}
          variant="link"
          onClick={props.onAddClick}
        >
          {t('Add alternate Service')}
        </Button>
      )}
    </>
  );
};
export default ArrayFieldTemplate;
