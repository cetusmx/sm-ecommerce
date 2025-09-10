import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './ShippingInfo.module.css';

const fetchAddresses = async (userEmail) => {
  if (!userEmail) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404) return []; // No addresses found is not an error
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const ShippingInfo = ({ cartTotal }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const FREE_SHIPPING_THRESHOLD = 1500;

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['userAddresses', currentUser?.email],
    queryFn: () => fetchAddresses(currentUser?.email),
    enabled: !!currentUser, // Only run if user is logged in
  });

  // Find the most recent address (assuming the last one in the array is the most recent)
  const recentAddress = addresses && addresses.length > 0 ? addresses[addresses.length - 1] : null;

  const renderShippingAddress = () => {
    if (!currentUser) {
      return (
        <div className={styles.addressBox}>
          <p>Para ver tu dirección de envío, <span className={styles.link} onClick={() => navigate('/login')}>inicia sesión</span>.</p>
        </div>
      );
    }

    if (isLoading) {
      return <div className={styles.addressBox}>Cargando dirección...</div>;
    }

    if (!recentAddress) {
      return (
        <div className={styles.addressBox}>
          <p>No tienes direcciones guardadas.</p>
          <button className={styles.actionButton} onClick={() => navigate('/user-addresses')}>Agregar Dirección</button>
        </div>
      );
    }

    return (
      <div className={styles.addressBox}>
        <p className={styles.addressTitle}>Enviar a:</p>
        <p className={styles.addressName}>{recentAddress.nombre_completo}</p>
        <p>{recentAddress.calle} {recentAddress.numero_ext}, {recentAddress.colonia}</p>
        <p>{recentAddress.ciudad}, {recentAddress.estado}, {recentAddress.postalCode}</p>
        <span className={styles.link} onClick={() => navigate('/user-addresses')}>Cambiar dirección</span>
      </div>
    );
  };

  const renderFreeShippingMessage = () => {
    if (cartTotal >= FREE_SHIPPING_THRESHOLD) {
      return (
        <div className={`${styles.shippingMessage} ${styles.success}`}>
          ¡Felicidades! Tu pedido califica para envío gratis.
        </div>
      );
    }

    const remaining = FREE_SHIPPING_THRESHOLD - cartTotal;
    return (
      <div className={styles.shippingMessage}>
        Te faltan <span className={styles.bold}>${remaining.toFixed(2)}</span> para conseguir el envío gratis.
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {renderFreeShippingMessage()}
      {renderShippingAddress()}
    </div>
  );
};

export default ShippingInfo;
