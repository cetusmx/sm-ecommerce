import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { getShippingRates } from '@/api/shippingService';
import { convertStateToCode } from '@/utils/stateConverter';
import styles from './CheckoutPage.module.css';
import AddressSelectionModal from '@/components/cart/AddressSelectionModal';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Helper function to fetch addresses
const fetchAddresses = async (userEmail) => {
  if (!userEmail) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/domicilios/email/${userEmail}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const CheckoutPage = () => {
  const { cart, cartTotal, shippingAddress, setShippingAddress } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Get navigate function

  const [step, setStep] = useState('loading');
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['userAddresses', currentUser?.email],
    queryFn: () => fetchAddresses(currentUser?.email),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (shippingAddress) {
      setStep('shipping');
      fetchRates(shippingAddress);
    } else {
      setStep('address');
    }
  }, [shippingAddress]);

  const fetchRates = async (address) => {
    setIsLoadingRates(true);
    setError(null);

    const destinationForEnvia = {
      name: address.nombre_completo,
      street: address.calle,
      number: address.numero_ext,
      district: address.colonia,
      city: address.ciudad,
      state: convertStateToCode(address.estado),
      country: "MX",
      postalCode: address.codigo_postal,
    };

    const originAddress = { name: "Alberto Rodríguez Salas", company: "Seal Market", street: "Prol. Pino Suárez", number: "3012", district: "J. Guadalupe Rodríguez", city: "Durango", state: "DG", country: "MX", postalCode: "34280", phone: "6182303777", email: "contacto@sealmarket.mx" };
    
    const parcel = {
      content: "Sellos y Orings",
      amount: 1,
      name: "Paquete Estándar",
      type: "box",
      declaredValue: 0,
      weight: 2,
      lengthUnit: "CM",
      weightUnit: "KG",
      dimensions: {
        length: 20,
        width: 20,
        height: 30,
      },
    };

    try {
      const ratesData = await getShippingRates(originAddress, destinationForEnvia, parcel);
      setShippingRates(ratesData.data || []);
    } catch (err) {
      setError(err.message || 'No se pudieron obtener las tarifas de envío.');
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleSelectAddress = (address) => {
    setShippingAddress(address);
  };

  const handleSelectShippingOption = (rate) => {
    setSelectedShippingOption(rate);
  };

  const handleContinueToPayment = () => {
    setStep('payment');
  };

  const handleCancelCheckout = () => {
    if (shippingAddress) { // If an address was already selected (came from shipping step)
      setStep('shipping');
    } else { // If no address was selected (came from cart, no address)
      navigate('/cart'); // Go back to cart
    }
  };

  const calculateTotal = useMemo(() => {
    const shippingCost = selectedShippingOption ? selectedShippingOption.totalPrice : 0;
    return cartTotal + shippingCost;
  }, [cartTotal, selectedShippingOption]);

  const renderAddressSelection = () => {
    if (isLoadingAddresses) return <p>Cargando direcciones...</p>;
    return (
      <div className={styles.form}>
        <h2>Paso 1: Selecciona tu Dirección de Envío</h2>
        {addresses && addresses.length > 0 ? (
          <div className={styles.addressList}>
            {addresses.map((addr) => (
              <div key={addr.id} className={styles.addressCard} onClick={() => handleSelectAddress(addr)}>
                <p><strong>{addr.nombre_completo}</strong></p>
                <p>{addr.calle} {addr.numero_ext}, {addr.colonia}</p>
                <p>{addr.ciudad}, {addr.estado}, {addr.codigo_postal}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes direcciones guardadas.</p>
        )}
        <div className={styles.actionButtonsContainer}> {/* New container for buttons */}
          <button onClick={() => setIsModalOpen(true)} className={styles.submitButton}>
            Agregar Nueva Dirección
          </button>
          <button onClick={handleCancelCheckout} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  const renderShippingOptions = () => (
    <div className={styles.shippingRates}>
      <h2>Paso 2: Opciones de Envío</h2>
      <div className={styles.addressSummary}>
        {console.log("Contenido de shippingAddress en addressSummary:", shippingAddress)}
        <div> {/* Wrapper for address details */}
          <strong style={{fontSize:"1.2em", fontWeight: 500}}>Enviar a</strong> <strong style={{fontSize:"1.2em", fontWeight: 500}}>{shippingAddress?.nombre_completo}</strong>
          <p>{shippingAddress?.calle} {shippingAddress?.numero_ext}, {shippingAddress?.colonia}, {shippingAddress?.ciudad}</p>
          <p>{shippingAddress?.estado}, {shippingAddress?.codigo_postal}, {shippingAddress?.pais}</p>
        </div>
        <span onClick={() => setStep('address')} className={styles.link}>Cambiar</span>
      </div>
      {isLoadingRates ? (
        <p>Calculando tarifas...</p>
      ) : shippingRates.length > 0 ? (
        <ul>
          {shippingRates.map((rate, index) => (
            <li 
              key={index} 
              className={`${styles.shippingOptionCard} ${selectedShippingOption === rate ? styles.selectedShippingOptionCard : ''}`}
              onClick={() => handleSelectShippingOption(rate)}
            >
              <input 
                type="radio" 
                name="shippingOption" 
                value={`${rate.carrier}-${rate.service}`}
                checked={selectedShippingOption === rate}
                onChange={() => handleSelectShippingOption(rate)} // Redundant but good practice
              />
              <span>{rate.carrier.toUpperCase()} ({rate.serviceDescription})</span>
              <strong>${rate.totalPrice} {rate.currency}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p>No se encontraron opciones de envío para la dirección proporcionada.</p>
      )}
      <button 
        onClick={handleContinueToPayment} 
        className={styles.submitButton} 
        disabled={!selectedShippingOption}
      >
        Continuar
      </button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className={styles.paymentStep}>
      <h2>Paso 3: Pago</h2>
      <h3>Resumen del Pedido</h3>
      <div className={styles.orderSummary}>
        {cart.map(item => (
          <div key={item.clave} className={styles.summaryItem}>
            <div className={styles.itemDetails}>
              <span>{item.clave} x {item.quantity}</span>
              {item.descripcion && <p className={styles.productDescription}>{item.descripcion}</p>}
            </div>
            <span className={styles.itemPrice}>${(item.precio * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className={styles.summaryLine}>
          <span>Subtotal:</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryLine}>
          <span>Envío ({selectedShippingOption?.carrier.toUpperCase()}):</span>
          <span>${selectedShippingOption?.totalPrice.toFixed(2) || '0.00'}</span>
        </div>
        <div className={`${styles.summaryLine} ${styles.totalLine}`}>
          <span>Total:</span>
          <span>${calculateTotal.toFixed(2)}</span>
        </div>
      </div>
      
      <div className={styles.paymentMethods}>
        <h4>Selecciona Método de Pago</h4>
        {/* Placeholder para botones de PayPal */}
        <p>Aquí irían los botones de PayPal.</p>
        <button className={styles.submitButton} onClick={() => alert('Procesar pago con PayPal')}>Pagar con PayPal</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'address':
        return renderAddressSelection();
      case 'shipping':
        return renderShippingOptions();
      case 'payment':
        return renderPaymentStep();
      case 'loading':
      default:
        return <p>Cargando...</p>;
    }
  };

  return (
    <div className={styles.container}>
      <h1>Checkout</h1>
      {error && <p className={styles.error}>{error}</p>}
      {renderContent()}
      {isModalOpen && <AddressSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />} 
    </div>
  );
};

export default CheckoutPage;