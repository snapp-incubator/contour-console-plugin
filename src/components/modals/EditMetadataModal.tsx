import React, { useState } from 'react';
import { Modal, ModalVariant, Button, FormGroup } from '@patternfly/react-core';
import { TagsInput } from 'react-tag-input-component';
import { objectToLabel } from '../../utils/labelToObject';
import '../../style.css';

interface EditMetadataModalProps {
  route: any;
  type: 'labels' | 'annotations';
  onSave: (route: any, metadata: any) => void;
  onClose: () => void;
  t: (key: string) => string;
  isOpen?: boolean;
}

export const EditMetadataModal = ({
  route,
  type,
  onSave,
  onClose,
  t,
  isOpen,
}: EditMetadataModalProps) => {
  const isLabels = type === 'labels';

  const initialData = isLabels
    ? route.metadata?.labels || {}
    : route.metadata?.annotations || {};

  const [metadata, setMetadata] = useState(objectToLabel(initialData));

  const handleChange = (newValues: string[]) => {
    setMetadata(newValues);
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={t(isLabels ? 'edit_labels' : 'edit_annotations')}
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        <Button
          className="pf-u-mr-lg"
          variant="primary"
          onClick={() => {
            onSave(route, metadata);
            onClose();
          }}
        >
          {t('save')}
        </Button>,
        <Button variant="link" onClick={onClose}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <p>{t(isLabels ? 'labels_help_text' : 'annotations_help_text')}</p>
      <FormGroup
        label={`${isLabels ? 'Labels' : 'Annotations'} for: ${
          route.metadata?.name
        }`}
        isRequired
        fieldId={isLabels ? 'tags-label' : 'annotations-input'}
        className="pf-u-mt-lg"
      >
        <TagsInput
          classNames={{ tag: 'tags', input: 'input-tag' }}
          value={metadata}
          onChange={handleChange}
          name={isLabels ? 'tags' : 'annotations'}
          placeHolder={isLabels ? 'app=frontend' : 'key=value'}
          aria-label={t(isLabels ? 'labels' : 'annotations')}
        />
      </FormGroup>
    </Modal>
  );
};
