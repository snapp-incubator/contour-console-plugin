import * as React from 'react';
import { Flex, Modal, ModalVariant, Button } from '@patternfly/react-core';
import './modal.css';

const ModalWrapper = ({
  closeModal,
  title,
  children,
  textSuccess,
  successVariant,
  textCancel,
  handleSuccess,
  data,
}: any) => {
  return (
    <Modal
      variant={ModalVariant.small}
      isOpen
      onClose={closeModal}
      title={title}
    >
      {children}
      <Flex
        className="pf-u-mt-xl"
        justifyContent={{ default: 'justifyContentFlexEnd' }}
        alignContent={{ default: 'alignContentFlexStart' }}
      >
        <React.Fragment>
          <Button onClick={closeModal} variant="link">
            {textCancel}
          </Button>
          <Button onClick={handleSuccess} variant={successVariant || 'primary'}>
            {textSuccess}
          </Button>
        </React.Fragment>
      </Flex>
    </Modal>
  );
};

export default ModalWrapper;
