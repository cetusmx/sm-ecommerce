import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import styles from './ShippingInfo.module.css';
import AddressSelectionModal from './AddressSelectionModal';

const fetchAddresses = async (userEmail) => {
  if (!userEmail) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const ShippingInfo = ({ cartTotal }) => {
  const { currentUser } = useAuth();
  const { shippingAddress, setShippingAddress } = useCart();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 1500;

  // Fetch addresses to set an initial default, but only if no address is already set in the context.
  useQuery({
    queryKey: ['userAddresses', currentUser?.email],
    queryFn: () => fetchAddresses(currentUser?.email),
    enabled: !!currentUser && !shippingAddress, // Only run if user is logged in AND no address is set
    onSuccess: (addresses) => {
      if (addresses && addresses.length > 0) {
        // Set the most recent address as the default when the component loads
        setShippingAddress(addresses[addresses.length - 1]);
      }
    },
  });

  const renderShippingAddress = () => {
    if (!currentUser) {
      return (
        <div className={styles.addressBox}>
          <p>Para ver tu dirección de envío, <span className={styles.link} onClick={() => navigate('/login')}>inicia sesión</span>.</p>
        </div>
      );
    }

    if (!shippingAddress) {
      return (
        <div className={styles.addressBox}>
          <p>No tienes una dirección de envío seleccionada.</p>
          <button className={styles.actionButton} onClick={() => setIsModalOpen(true)}>Elegir Dirección</button>
        </div>
      );
    }

    return (
      <div className={styles.addressBox}>
        <p className={styles.addressTitle}>Enviar a:</p>
        <p className={styles.addressName}>{shippingAddress.nombre_completo}</p>
        <p>{shippingAddress.calle} {shippingAddress.numero_ext}, {shippingAddress.colonia}</p>
        <p>{shippingAddress.ciudad}, {shippingAddress.estado}, {shippingAddress.postalCode}</p>
        <span className={styles.link} onClick={() => setIsModalOpen(true)}>Cambiar dirección</span>
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
      {isModalOpen && <AddressSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ShippingInfo;