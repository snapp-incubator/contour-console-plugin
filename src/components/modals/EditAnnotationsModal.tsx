import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  FormGroup,
  TextInput,
  Split,
  SplitItem,
  ActionGroup,
  ButtonVariant,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

interface KeyValuePair {
  key: string;
  value: string;
}

interface EditAnnotationsModalProps {
  route: any;
  onSave: (route: any, metadata: any) => void;
  onClose: () => void;
  t: (key: string) => string;
  isOpen?: boolean;
}

export const EditAnnotationsModal = ({
  route,
  onSave,
  onClose,
  t,
  isOpen,
}: EditAnnotationsModalProps) => {
  const [annotations, setAnnotations] = useState<KeyValuePair[]>([
    { key: '', value: '' },
  ]);

  useEffect(() => {
    if (isOpen && route.metadata?.annotations) {
      const initialAnnotations = Object.entries(route.metadata.annotations).map(
        ([key, value]) => ({ key, value: value as string }),
      );
      setAnnotations(
        initialAnnotations.length
          ? initialAnnotations
          : [{ key: '', value: '' }],
      );
    }
  }, [isOpen, route.metadata?.annotations]);

  const handleKeyChange = (index: number, value: string) => {
    const newAnnotations = [...annotations];
    newAnnotations[index].key = value;
    setAnnotations(newAnnotations);
  };

  const handleValueChange = (index: number, value: string) => {
    const newAnnotations = [...annotations];
    newAnnotations[index].value = value;
    setAnnotations(newAnnotations);
  };

  const addNewPair = () => {
    setAnnotations([...annotations, { key: '', value: '' }]);
  };

  const removePair = (index: number) => {
    const newAnnotations = annotations.filter((_, i) => i !== index);
    setAnnotations(
      newAnnotations.length ? newAnnotations : [{ key: '', value: '' }],
    );
  };

  const handleSave = () => {
    const annotationsObject = annotations.reduce((acc, { key, value }) => {
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    onSave(route, annotationsObject);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title={t('edit_annotations')}
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        <Button key="save" variant="primary" onClick={handleSave}>
          {t('save')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <p>{t('annotations_help_text')}</p>

      {annotations.map((pair, index) => (
        <Split key={index} hasGutter className="pf-u-my-md">
          <SplitItem isFilled>
            <FormGroup
              label={t('key')}
              isRequired
              fieldId={`annotation-key-${index}`}
            >
              <TextInput
                id={`annotation-key-${index}`}
                value={pair.key}
                type="text"
                onChange={(
                  value: string,
                  event: React.FormEvent<HTMLInputElement>,
                ) => handleKeyChange(index, value)}
                placeholder={t('enter_key')}
              />
            </FormGroup>
          </SplitItem>
          <SplitItem isFilled>
            <FormGroup
              label={t('value')}
              isRequired
              fieldId={`annotation-value-${index}`}
            >
              <TextInput
                id={`annotation-value-${index}`}
                value={pair.value}
                type="text"
                onChange={(
                  value: string,
                  event: React.FormEvent<HTMLInputElement>,
                ) => handleValueChange(index, value)}
                placeholder={t('enter_value')}
              />
            </FormGroup>
          </SplitItem>
          <SplitItem className="pf-u-mt-xl">
            <Button
              variant={ButtonVariant.plain}
              onClick={() => removePair(index)}
              aria-label={t('remove_annotation')}
              isDisabled={annotations.length === 1}
            >
              <MinusCircleIcon />
            </Button>
          </SplitItem>
        </Split>
      ))}

      <ActionGroup>
        <Button
          variant={ButtonVariant.link}
          icon={<PlusCircleIcon />}
          onClick={addNewPair}
          isInline
        >
          {t('add_more')}
        </Button>
      </ActionGroup>
    </Modal>
  );
};
