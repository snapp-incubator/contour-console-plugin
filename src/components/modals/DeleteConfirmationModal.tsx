import React from 'react';
import { Modal, ModalVariant, Button, Text } from '@patternfly/react-core';

interface DeleteConfirmationModalProps {
  route: any;
  namespace: string;
  onSave: (route: any, ns: string) => void;
  onClose: () => void;
  t: (key: string, options?: object) => string;
  isOpen: boolean;
}

export const DeleteConfirmationModal = ({
  route,
  namespace,
  onSave,
  onClose,
  t,
  isOpen,
}: DeleteConfirmationModalProps) => {
  return (
    <Modal
      variant={ModalVariant.small}
      title={t('title_delete_modal')}
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        <Button
          className="pf-u-mr-lg"
          variant="danger"
          onClick={() => {
            onSave(route, namespace);
            onClose();
          }}
        >
          {t('delete')}
        </Button>,
        <Button variant="link" onClick={onClose}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Text>
        {t('confirm_delete_route', {
          name: route?.metadata?.name,
          namespace: namespace,
        })}
      </Text>
    </Modal>
  );
};
