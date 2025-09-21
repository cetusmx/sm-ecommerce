import React from 'react';
import Modal from './Modal';

const AvisoEscasez = ({ isOpen, onClose, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h4>Atención</h4>
      <p>{message}</p>
      <button
        className="sm-btn sm-btn-primary"
        onClick={onClose}
        style={{ marginTop: '15px' }}
      >
        Aceptar
      </button>
    </Modal>
  );
};

export default AvisoEscasez;