import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles['modal-backdrop']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                <p className={styles['modal-message']}>{message}</p>
                <button className={styles['modal-button']} onClick={onClose}>
                    Aceptar
                </button>
            </div>
        </div>
    );
};

export default Modal;
