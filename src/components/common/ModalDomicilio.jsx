import React from 'react';
import Modal from './Modal';
import AddressFormPage from '@/pages/AddressFormPage';
import styles from './ModalDomicilio.module.css';

const ModalDomicilio = ({ isOpen, onClose, onSave, address }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className={styles.container}>
        <h2 className={styles.title}>{address ? 'Editar Domicilio' : 'Agregar Domicilio'}</h2>
        <AddressFormPage 
          key={address ? address.id : 'new'} // Force re-mount on address change
          onSave={onSave} 
          address={address} 
        />
      </div>
    </Modal>
  );
};

export default ModalDomicilio;
