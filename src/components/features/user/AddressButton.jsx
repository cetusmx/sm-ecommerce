import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './AddressButton.module.css';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/hooks/useCart'; // Import useCart

const AddressButton = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { shippingAddress } = useCart(); // Get the global shipping address

  const handleClick = () => {
    if (isLoggedIn) {
      navigate('/user-addresses');
    } else {
      navigate('/login', { state: { from: '/user-addresses' } });
    }
  };

  const getButtonContent = () => {
    if (!isLoggedIn) {
      return (
        <span className={styles.addressText}>
          Hola, identifícate
          <span className={styles.subText}>Elige tu dirección</span>
        </span>
      );
    }

    if (!shippingAddress) {
      return (
        <span className={styles.addressText}>
          Hola
          <span className={styles.subText}>Elige tu dirección</span>
        </span>
      );
    }

    return (
      <span className={styles.addressText}>
       <span> Enviar a {shippingAddress.nombre_completo.split(' ')[0]}</span>
        <span className={styles.subText}>{shippingAddress.ciudad}, {shippingAddress.codigo_postal}</span>
      </span>
    );
  };

  return (
    <button className={styles['address-button']} onClick={handleClick}>
      <div className={styles['address-icon-wrapper']}>
        <FaMapMarkerAlt className={styles['address-icon']} />
      </div>
      {getButtonContent()}
    </button>
  );
};

export default AddressButton;