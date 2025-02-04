import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  FormGroup,
  Alert,
} from '@patternfly/react-core';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const initialData = isLabels
    ? route.metadata?.labels || {}
    : route.metadata?.annotations || {};

  const [metadata, setMetadata] = useState(objectToLabel(initialData));

  // Get the current input value from the tags input
  const getPendingInputValue = () => {
    const input = inputRef.current?.querySelector('input') as HTMLInputElement;
    return input?.value || '';
  };

  const isValidKeyValuePair = (value: string) => {
    if (!value || !value.includes('=')) return false;
    const [, val] = value.split('=');
    return !!val;
  };

  const addNewMetadata = (value: string) => {
    if (!metadata.includes(value)) {
      return [...metadata, value];
    }
    return metadata;
  };

  const handleSave = () => {
    const pendingValue = getPendingInputValue();

    if (isValidKeyValuePair(pendingValue)) {
      const updatedMetadata = addNewMetadata(pendingValue);
      onSave(route, updatedMetadata);
    } else {
      onSave(route, metadata);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = inputRef.current?.querySelector('input');
        input?.focus();
      }, 0);
    }
  }, [isOpen]);

  const handleChange = (newValues: string[]) => {
    setMetadata(newValues);
    setShowHelp(false);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.tagName === 'INPUT') {
      setShowHelp(target.value.includes('='));
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      className="modal-edit-metadata"
      title={t(isLabels ? 'edit_labels' : 'edit_annotations')}
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        <Button className="pf-u-mr-lg" variant="primary" onClick={handleSave}>
          {t('save')}
        </Button>,
        <Button variant="link" onClick={onClose}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <p>{t(isLabels ? 'labels_help_text' : 'annotations_help_text')}</p>

      <FormGroup
        label={`${t(isLabels ? 'metadata_labels' : 'metadata_annotations')} ${t(
          'metadata_for',
        )} ${route.metadata?.name}`}
        isRequired
        fieldId={isLabels ? 'tags-label' : 'annotations-input'}
        className="pf-u-mt-lg pf-u-mb-xs"
      >
        <div ref={inputRef} onInput={handleInput}>
          <TagsInput
            classNames={{ tag: 'tags ', input: 'input-tag' }}
            value={metadata}
            onChange={handleChange}
            name={isLabels ? 'tags' : 'annotations'}
            placeHolder={isLabels ? 'app=frontend' : 'key=value'}
            aria-label={t(isLabels ? 'labels' : 'annotations')}
          />
        </div>
      </FormGroup>
      {showHelp && (
        <Alert
          variant="info"
          title={t('metadata_format_help')}
          className="pf-u-mb-md"
          isInline
        >
          {t('metadata_format_description')}
        </Alert>
      )}
    </Modal>
  );
};
