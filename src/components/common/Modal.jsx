import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClass = styles[size] || styles.md;

    return (
        <div className={styles['modal-backdrop']} onClick={onClose}>
            <div className={`${styles['modal-content']} ${sizeClass}`} onClick={e => e.stopPropagation()}>
                <button className={styles['close-button']} onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;