import React from 'react';
import styles from './PaymentConfirmationModal.module.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentConfirmationModal = ({ isOpen, onClose, message, isError, additionalMessage }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          {isError ? (
            <FaTimesCircle className={`${styles.icon} ${styles.errorIcon}`} />
          ) : (
            <FaCheckCircle className={`${styles.icon} ${styles.successIcon}`} />
          )}
        </div>
        <h2 className={styles.title}>{isError ? 'Error en el Pago' : '¡Éxito!'}</h2>
        <p className={styles.message}>{message}</p>
        {additionalMessage && <p className={styles.additionalMessage}>{additionalMessage}</p>}
        <button onClick={onClose} className={styles.closeButton}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
