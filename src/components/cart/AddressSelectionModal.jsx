import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/common/Modal';
import styles from './AddressSelectionModal.module.css';

const fetchAddresses = async (userEmail) => {
  if (!userEmail) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const AddressSelectionModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { shippingAddress, setShippingAddress } = useCart();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(shippingAddress?.id);

  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ['userAddresses', currentUser?.email],
    queryFn: () => fetchAddresses(currentUser?.email),
    enabled: !!currentUser && isOpen, // Fetch only when the modal is open
  });

  useEffect(() => {
    // Keep local selection in sync with context
    setSelectedId(shippingAddress?.id);
  }, [shippingAddress]);

  const handleSelect = () => {
    const newAddress = addresses.find(addr => addr.id === selectedId);
    if (newAddress) {
      setShippingAddress(newAddress);
    }
    onClose();
  };

  const handleAddNew = () => {
    onClose(); // Close modal before navigating
    navigate('/user-addresses');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className={styles.container}>
        <h3 className={styles.title}>Elige una dirección de envío</h3>
        <div className={styles.addressList}>
          {isLoading && <p>Cargando direcciones...</p>}
          {error && <p>Error al cargar direcciones.</p>}
          {addresses && addresses.map(addr => (
            <label key={addr.id} className={`${styles.addressCard} ${selectedId === addr.id ? styles.selected : ''}`}>
              <input
                type="radio"
                name="address"
                checked={selectedId === addr.id}
                onChange={() => setSelectedId(addr.id)}
              />
              <div className={styles.addressInfo}>
                <p className={styles.name}>{addr.nombre_completo}</p>
                <p>{addr.calle} {addr.numero_ext}</p>
                <p>{addr.ciudad}, {addr.estado} {addr.codigo_postal}</p>
              </div>
            </label>
          ))}
        </div>
        <div className={styles.actions}>
          <button className={styles.addButton} onClick={handleAddNew}>+ Agregar nueva dirección</button>
          <button className={styles.confirmButton} onClick={handleSelect} disabled={!selectedId}>
            Usar esta dirección
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddressSelectionModal;
