import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import AddressFormPage from './AddressFormPage';
import styles from './UserAddressesPage.module.css';
import { useAuth } from '@/context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import AnuncioPuntual from '../components/common/AnuncioPuntual';
import ModalDomicilio from '../components/common/ModalDomicilio';

const fetchAddresses = async (userEmail) => {
  if (!userEmail) {
    return [];
  }
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const deleteAddress = async (addressId) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/${addressId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

const UserAddressesPage = () => {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email;
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(['userAddresses', userEmail]);
    },
  });

  const handleDelete = (addressId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      deleteMutation.mutate(addressId);
    }
  };

  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ['userAddresses', userEmail],
    queryFn: () => fetchAddresses(userEmail),
    enabled: !!userEmail,
  });

  const handleOpenModal = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setSelectedAddress(null);
    setIsModalOpen(false);
  }

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleAddressSave = () => {
    console.log(selectedAddress);
    handleCloseModal();
    queryClient.invalidateQueries(['userAddresses', userEmail]);
  };

  if (isLoading) return <div>Cargando direcciones...</div>;
  if (error) return <div>Error al cargar direcciones: {error.message}</div>;

  return (
    <div className={styles.productContainer}>
      <Breadcrumb parent="Mi cuenta" child="Mis direcciones" />
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <main className={styles.mainContent}>
            <div className={styles.addressPageContent}>
              <h3>Mis Direcciones</h3>
              {addresses && addresses.length > 0 ? (
                <>
                  <div className={styles.addressList}>
                    {addresses.map((address) => (
                      <div key={address.id} className={styles.addressCard}>
                        <p className={styles.nombreCompleto}>{address.nombre_completo}</p>
                        <p>Calle {address.calle} {address.numero_ext} {address.numero_int ? `Int. ${address.numero_int}` : ''}</p>
                        <p>{address.colonia}</p>
                        <p>{address.ciudad}, {address.estado} {address.postalCode}</p>
                        <p>{address.pais}</p>
                        <p>Número de teléfono: {address.numero_telefono}</p>
                        <div className={styles.botones}><button className={styles.actionButton} onClick={() => handleEdit(address)}>Editar</button> <h6>|</h6> <button className={styles.actionButton} onClick={() => handleDelete(address.id)}>Descartar</button></div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleOpenModal} className={`${styles.addButton} ${styles.yellowButton}`}>
                    Agregar otra dirección
                  </button>
                </>
              ) : (
                <div className={styles.noAddresses}>
                  <p>No tienes direcciones registradas</p>
                  <button onClick={handleOpenModal} className={`${styles.yellowButton}`}>
                    Agregar dirección
                  </button>
                </div>
              )}
            </div>
          </main>
          <aside className={styles.sidebar}>
            <AnuncioPuntual linea="ANSME" slogan="¡Oferta especial!" precio="99.99" />
            <AnuncioPuntual linea="BAKSN" slogan="¡Solo por hoy!" precio="149.50" />
            <AnuncioPuntual linea="BAMVE" slogan="¡Últimas unidades!" precio="75.00" />
          </aside>
        </div>
      </div>
      <ModalDomicilio isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleAddressSave} address={selectedAddress} />
    </div>
  );
};

export default UserAddressesPage;
