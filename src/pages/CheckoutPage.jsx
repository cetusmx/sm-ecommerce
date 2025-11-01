import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { getShippingRates } from '@/api/shippingService';
import { fetchProductsByClaves } from '@/api/productsApi';
import { convertStateToCode } from '@/utils/stateConverter';
import styles from './CheckoutPage.module.css';
import AddressSelectionModal from '@/components/cart/AddressSelectionModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FaPaypal, FaCreditCard, FaUniversity } from 'react-icons/fa';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/features/checkout/CheckoutForm';
import PaymentConfirmationModal from '@/components/common/PaymentConfirmationModal';
import { gestionPedidoEnAlmacen } from '@/api/ProcesoLogistica';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

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
  const { cart, cartTotal, shippingAddress, setShippingAddress, clearCart } = useCart();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const fechasDeEntrega = location.state?.fechasDeEntrega || [];
  const folio = useMemo(() => uuidv4(), []);

  useEffect(() => {
    if (location.state?.newAddress) {
      setShippingAddress(location.state.newAddress);
    }
  }, [location.state?.newAddress, setShippingAddress]);

  const [modalState, setModalState] = useState({ isOpen: false, message: '', isError: false });

  const handlePaymentComplete = async (result, paymentMethodType) => {
    if (result.success) {
      // Call the existing order creation logic now that payment is confirmed.
      await createOrderInDB(paymentMethodType, 'pagoTDC');
    }
    // Show the modal with the result
    setModalState({ isOpen: true, message: result.message, isError: !!result.error });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, message: '', isError: false });
    if (!modalState.isError) {
      clearCart(); // Clear cart only after successful payment and modal close
      navigate('/pedido');
    }
  };

  // New function to encapsulate order creation and email sending
  const createOrderInDB = async (paymentMethod, tipoLogistica) => {
    if (!products) {
      setError("No se pudieron cargar los datos de los productos. Intente de nuevo.");
      return false;
    }

    const pedidoItems = cart.map(item => {
      const entrega = fechasDeEntrega.find(f => f.clave === item.clave);
      return {
        folio: folio,
        email: currentUser.email,
        nombreTitular: currentUser.displayName || currentUser.email,
        enviar_a: shippingAddress.nombre_completo,
        clave: item.clave,
        descripcion: item.descripcion,
        cantidad: item.quantity,
        cant_por_empaque: item.cant_por_empaque,
        unidad_salida: item.unidad_salida,
        total_partida: (item.precio * item.quantity).toFixed(2),
        estatus: 'Pendiente de envío', 
        fecha_entrega: entrega ? entrega.fechaCorta : null,
        metodo_pago: paymentMethod, 
        costo_envio: selectedShippingOption ? selectedShippingOption.totalPrice : 0,
        total_pedido: calculateTotal,
      };
    });
 
    try {
      const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoItems),
      });

      if (!orderResponse.ok) {
        throw new Error('Error al crear el pedido');
      }
      console.log('Pedido creado exitosamente');

      // Enganche de la nueva lógica de almacén
      await gestionPedidoEnAlmacen({ tipoLogistica, pedidoItems, folio, shippingAddress });

      const confirmacionResponse = await fetch(`${process.env.REACT_APP_API_URL}/pedidos/${folio}/enviar-confirmacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoItems),
      });

      if (!confirmacionResponse.ok) {
        console.error('Error al enviar el correo de confirmación');
      } else {
        console.log('Correo de confirmación enviado exitosamente');
      }
      return true;

    } catch (error) {
      setError(error.message);
      console.error("Error en el proceso de creación de pedido:", error);
      return false;
    }
  };


  const [step, setStep] = useState('loading');
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  const [isCopied, setIsCopied] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const hasFetchedPaymentIntent = useRef(false); // New ref

  const calculateTotal = useMemo(() => {
    const shippingCost = selectedShippingOption ? selectedShippingOption.totalPrice : 0;
    return cartTotal + shippingCost;
  }, [cartTotal, selectedShippingOption]);

  useEffect(() => {
    if (selectedPaymentMethod === 'card' && calculateTotal > 0 && currentUser && !clientSecret && !hasFetchedPaymentIntent.current) {
      const shippingCost = selectedShippingOption ? selectedShippingOption.totalPrice : 0;

      hasFetchedPaymentIntent.current = true; // Set flag to true

      fetch(`${process.env.REACT_APP_API_URL}/pagos/crearintento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPedido: calculateTotal,
          folio: folio,
          emailCliente: currentUser.email,
          currency: 'mxn'
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const secret = data.clientSecret || data.client_secret;
          if (secret) {
            setClientSecret(secret);
          } else {
            setError(data.error || "No se recibió el client_secret del backend.");
          }
        })
        .catch(err => {
          setError("No se pudo iniciar el pago con tarjeta.");
          hasFetchedPaymentIntent.current = false; // Reset flag on error to allow retry
        });
    }
  }, [selectedPaymentMethod, calculateTotal, folio, currentUser, cartTotal, selectedShippingOption, clientSecret]);

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['userAddresses', currentUser?.email],
    queryFn: () => fetchAddresses(currentUser?.email),
    enabled: !!currentUser,
  });

  const cartProductClaves = useMemo(() => cart.map(item => item.clave), [cart]);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', cartProductClaves],
    // The backend should be updated to support this endpoint
    // queryFn: () => fetchProductsByClaves(cartProductClaves),
    queryFn: async () => {
      const productPromises = cartProductClaves.map(clave =>
        fetch(`${process.env.REACT_APP_API_URL}/productos/${clave}`).then(res => res.json())
      );
      return Promise.all(productPromises);
    },
    enabled: cartProductClaves.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
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

  const handleCopy = () => {
    navigator.clipboard.writeText(folio.substring(0, 8));
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000); // Reset after 2 seconds
  };

  const handleNonStripePayment = async (paymentMethod) => {
    const success = await createOrderInDB(paymentMethod, 'pagoTransf');
    if (success) {
      navigate('/pedido', { state: { orderPlaced: true } });
    }
  };

  const handleCancelCheckout = () => {
    if (shippingAddress) {
      setStep('shipping');
    } else {
      navigate('/cart');
    }
  };

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
        <div className={styles.actionButtonsContainer}>
          <button onClick={() => setIsModalOpen(true)} className="sm-btn sm-btn-primary">
            Agregar Nueva Dirección
          </button>
          <button onClick={handleCancelCheckout} className="sm-btn sm-btn-secondary">
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
        <div>
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
                onChange={() => handleSelectShippingOption(rate)}
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
        className="sm-btn sm-btn-primary" 
        disabled={!selectedShippingOption}
      >
        Continuar
      </button>
    </div>
  );

  const renderPaymentStep = () => {
    if (isLoadingProducts) {
        return <p>Cargando datos de productos...</p>;
    }
    return (
        <div className={styles.paymentStep}>
        <h2>Paso 3: Pago</h2>
        <h3>Resumen del Pedido</h3>
        <div className={styles.orderSummary}>
            {cart.map(item => (
            <div key={item.clave} className={styles.summaryItem}>
                <div className={styles.itemDetails}>
                <span>{item.clave} x {item.quantity}</span>
                {item.descripcion && <p style={{marginBottom: "0.4em"}} className={styles.productDescription}>{item.descripcion}</p>}
                {(() => {
                  const entrega = fechasDeEntrega.find(f => f.clave === item.clave);
                  if (entrega && entrega.fecha) {
                    return <p style={{marginBottom: "0.5em"}}  className={styles.deliveryDate}>Entrega estimada: {entrega.fecha}</p>;
                  }
                  return null;
                })()}
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
          <div className={styles.paymentOptionsContainer}>
            <div 
              className={`${styles.paymentOption} ${selectedPaymentMethod === 'paypal' ? styles.selected : ''}`}
              onClick={() => setSelectedPaymentMethod('paypal')}
            >
              <FaPaypal className={styles.paymentOptionIcon} />
              <span>PayPal</span>
            </div>
            <div 
              className={`${styles.paymentOption} ${selectedPaymentMethod === 'card' ? styles.selected : ''}`}
              onClick={() => setSelectedPaymentMethod('card')}
            >
              <FaCreditCard className={styles.paymentOptionIcon} />
              <span>Tarjeta de Crédito/Débito</span>
            </div>
            <div 
              className={`${styles.paymentOption} ${selectedPaymentMethod === 'transfer' ? styles.selected : ''}`}
              onClick={() => setSelectedPaymentMethod('transfer')}
            >
              <FaUniversity className={styles.paymentOptionIcon} />
              <span>Transferencia Bancaria</span>
            </div>
          </div>

          <div className={styles.paymentContentContainer}>
            {selectedPaymentMethod === 'paypal' && (
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                  console.log("PayPal: Llamando a /crear-orden-paypal con:", {
                    totalPedido: calculateTotal,
                    folio: folio,
                    emailCliente: currentUser.email,
                    currency: "MXN",
                  });
                  return fetch(`${process.env.REACT_APP_API_URL}/pagos/crear-orden-paypal`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      totalPedido: calculateTotal,
                      folio: folio,
                      emailCliente: currentUser.email,
                      currency: "MXN",
                    }),
                  })
                    .then((response) => {
                      console.log("PayPal: Respuesta de /crear-orden-paypal:", response);
                      if (!response.ok) {
                        throw new Error(`Error al crear orden PayPal: ${response.statusText}`);
                      }
                      return response.json();
                    })
                    .then((order) => {
                      console.log("PayPal: Orden creada (ID):", order.id);
                      return order.id;
                    })
                    .catch((error) => {
                      console.error("PayPal: Error en createOrder:", error);
                      handlePaymentComplete({ error: true, message: `Error al iniciar pago PayPal: ${error.message}` }, 'paypal');
                      return null; // Prevent further execution if order creation fails
                    });
                }}
                onApprove={(data, actions) => {
                  console.log("PayPal: Pago aprobado en PayPal. Capturando orden:", data.orderID);
                  return fetch(`${process.env.REACT_APP_API_URL}/pagos/capturar-orden-paypal/${data.orderID}`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}), // Empty body as per user's instruction, correctly stringified
                  })
                    .then((response) => {
                      console.log("PayPal: Respuesta de /capturar-orden-paypal:", response);
                      if (!response.ok) {
                        throw new Error(`Error al capturar orden PayPal: ${response.statusText}`);
                      }
                      return response.json();
                    })
                    .then((details) => {
                      console.log("PayPal: Detalles de captura:", details);
                      handlePaymentComplete({ success: true, message: "¡Pago con PayPal exitoso! Tu pedido ha sido creado." }, 'paypal');
                    })
                    .catch((error) => {
                      console.error("PayPal: Error al capturar el pago de PayPal:", error);
                      handlePaymentComplete({ error: true, message: `Error al capturar pago PayPal: ${error.message}` }, 'paypal');
                    });
                }}
                onError={(err) => {
                  console.error("PayPal: Error general en el pago:", err);
                  handlePaymentComplete({ error: true, message: "El pago con PayPal fue cancelado o falló." }, 'paypal');
                }}
                onCancel={(data) => {
                  console.log("PayPal: Pago de PayPal cancelado:", data);
                  handlePaymentComplete({ error: true, message: "El pago con PayPal fue cancelado." }, 'paypal');
                }}
              />
            )}
            {selectedPaymentMethod === 'card' && (
              clientSecret && stripePromise ? (
                <Elements options={{ clientSecret }} stripe={stripePromise}>
                  <CheckoutForm onPaymentComplete={(result) => handlePaymentComplete(result, 'card')} />
                </Elements>
              ) : (
                <p>Cargando formulario de pago...</p>
              )
            )}
            {selectedPaymentMethod === 'transfer' && (
              <div className={styles.bankInfoContainer}>
                <h5>Datos para la Transferencia</h5>
                <p>Realiza tu pago directamente en nuestra cuenta bancaria.</p>
                <div className={styles.bankInfoDetails}>
                  <p style={{marginBottom:"-10px"}}><strong>Banco:</strong> BBVA Bancomer</p>
                  <p style={{marginBottom:"-10px"}}><strong>Titular:</strong> Alberto Rodríguez Salas</p>
                  <p style={{marginBottom:"-10px"}}><strong>Suc:</strong> 0311</p>
                  <p style={{marginBottom:"-10px"}}><strong>CLABE:</strong> 012933004798737322</p>
                  <p style={{marginBottom:"-10px"}}><strong>No. de Cuenta:</strong> 0479873732</p>
                  <p style={{marginTop:"30px"}}>Envíe su comprobate a  <strong style={{fontStyle: "italic", fontWeight:"600"}}>pagos@sealmarket.mx</strong></p>
                </div>
                <div className={styles.referenceBox}>
                  <p><strong>Referencia de Pago:</strong></p>
                  <span>{folio.substring(0, 8)}</span>
                  <button onClick={() => navigator.clipboard.writeText(folio.substring(0, 8))} className={styles.copyButton}>Copiar</button>
                </div>
                <div className={styles.finalizeButtonContainer}>
                  <button className="sm-btn sm-btn-primary" onClick={() => handleNonStripePayment('transfer')}>Finalizar Pedido</button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
    );
  }

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
      <PaymentConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        message={modalState.message}
        isError={modalState.isError}
      />
    </div>
  );
};

export default CheckoutPage;