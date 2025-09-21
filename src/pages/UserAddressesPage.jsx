import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchProductosVistos } from '@/api/productosVistosApi';
import AddressFormPage from './AddressFormPage';
import styles from './UserAddressesPage.module.css';
import { useAuth } from '@/context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductosPromocion from '../components/features/product/ProductosPromocion';
import ProductosVistos from '../components/features/product/ProductosVistos';
import ModalDomicilio from '../components/common/ModalDomicilio';

import { updateAddressOrder } from '@/api/addresses';

const fetchAddresses = async (userEmail) => {
  if (!userEmail) {
    return [];
  }
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    console.log(response.status);
    if (response.status === 404 || response.status === 500) {
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
  const [deletedIds, setDeletedIds] = useState([]);

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    // We will handle onSuccess specifically in the handleDelete function
  });

  const updateOrderMutation = useMutation({
    mutationFn: updateAddressOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['userAddresses', userEmail]);
    },
  });

  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ['userAddresses', userEmail],
    queryFn: () => fetchAddresses(userEmail),
    enabled: !!userEmail,
  });

  const { data: viewedProducts } = useQuery({
    queryKey: ['productosVistos', currentUser?.email],
    queryFn: () => fetchProductosVistos(currentUser?.email),
    enabled: !!currentUser?.email,
  });

  const handleDelete = (addressId) => {
    const addressToDelete = addresses.find((addr) => addr.id === addressId);
    const wasDefault = addressToDelete?.orden_domicilio === 'Predeterminado';

    let newDefaultId = null;
    if (wasDefault && addresses.length > 1) {
      const newDefaultCandidate = addresses.find((addr) => addr.id !== addressId);
      if (newDefaultCandidate) {
        newDefaultId = newDefaultCandidate.id;
      }
    }

    setDeletedIds((prev) => [...prev, addressId]);

    deleteMutation.mutate(addressId, {
      onSuccess: () => {
        setTimeout(async () => {
          if (newDefaultId) {
            await handlePredeterminado(newDefaultId);
          } else {
            queryClient.invalidateQueries(['userAddresses', userEmail]);
          }
          // Clean up the deleted ID from state after refresh
          setDeletedIds((prev) => prev.filter((id) => id !== addressId));
        }, 2000); // Wait 2 seconds before refreshing
      },
      onError: () => {
        // If deletion fails, remove from deletedIds to show the card again
        setDeletedIds((prev) => prev.filter((id) => id !== addressId));
        alert('Error al borrar la dirección.');
      },
    });
  };

  const handlePredeterminado = async (addressId) => {
    const currentDefault = addresses.find(
      (address) => address.orden_domicilio === 'Predeterminado'
    );

    if (currentDefault) {
      await updateOrderMutation.mutateAsync({
        id: currentDefault.id,
        orden_domicilio: '',
      });
    }

    await updateOrderMutation.mutateAsync({
      id: addressId,
      orden_domicilio: 'Predeterminado',
    });
  };

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

  const handleAddressSave = async (savedAddress) => {
    // Check if the new/edited address is set as default
    if (savedAddress && savedAddress.orden_domicilio === 'Predeterminado') {
      // Find the current default address, if it exists and is not the one we just saved
      const currentDefault = addresses.find(
        (address) => address.orden_domicilio === 'Predeterminado' && address.id !== savedAddress.id
      );

      // If there was a different default address, remove its default status
      if (currentDefault) {
        await updateOrderMutation.mutateAsync({
          id: currentDefault.id,
          orden_domicilio: '',
        });
      }
    }
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
                    {addresses.map((address) => {
                      if (deletedIds.includes(address.id)) {
                        return (
                          <div key={address.id} className={`${styles.addressCard} ${styles.deletedCard}`}>
                            Borrado
                          </div>
                        );
                      }
                      return (
                        <div key={address.id} className={styles.addressCard}>
                          <div>
                            <div className={styles.defaultAddressLabel}>{address.orden_domicilio === 'Predeterminado' ? 'Predeterminado' : ''}</div>
                            <p className={styles.nombreCompleto}>{address.nombre_completo}</p>
                            <p>Calle {address.calle} {address.numero_ext} {address.numero_int ? `Int. ${address.numero_int}` : ''}</p>
                            <p>{address.colonia}</p>
                            <p>{address.ciudad}, {address.estado} {address.postalCode}</p>
                            <p>{address.pais}</p>
                            <p>Número de teléfono: {address.numero_telefono}</p>
                          </div>
                          <div className={styles.botones}><button className={styles.actionButton} onClick={() => handleEdit(address)}>Editar</button> <h6>|</h6> 
                          <button className={styles.actionButton} onClick={() => handleDelete(address.id)}>Descartar</button>
                          </div>
                          <div>
                            {address.orden_domicilio !== 'Predeterminado' && (
                              <button className={styles.actionButton} style={{fontSize:"0.7em"}} onClick={() => handlePredeterminado(address.id)}>Establecer como predeterminado</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
          <ProductosPromocion className={styles.sidebar} />
        </div>
        <ProductosVistos viewedProducts={viewedProducts} />
      </div>
      <ModalDomicilio isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleAddressSave} address={selectedAddress} />
    </div>
  );
};

export default UserAddressesPage;
