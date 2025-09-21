import React from 'react';
import styles from './OrderConfirmationModal.module.css';

const OrderConfirmationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.title}>¡Pedido Realizado con Éxito!</h2>
        <p className={styles.message}>Tu pedido ha sido procesado y está en camino.</p>
        <button onClick={onClose} className={styles.button}>Aceptar</button>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
