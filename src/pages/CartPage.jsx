import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import styles from './Pedido.module.css'; // Re-using styles from Pedido.jsx
import CartItem from '@/components/cart/CartItem';
import ShippingInfo from '@/components/cart/ShippingInfo';

const CartPage = () => {
  const { cart, cartTotal, cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    console.log('Proceeding to checkout...');
    // navigate('/checkout');
  };

  return (
    <div className={styles['main-container']}>
      {/* Breadcrumb */}
      <div className={styles['breadcrumb']}>
        <span style={{ color: '#c7562a' }}>Carrito de Compras</span>
      </div>

      <div className={styles['top-section']}>
        <div className={styles['contenedor-izq-top']} style={{ width: '100%' }}>
          <div className={styles['title-and-search']}>
            <h1 className={styles['page-title']}>Mi Carrito</h1>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Cart Items Container (75%) */}
        <div className={styles['contenedor-izq-bot']} style={{ flexGrow: 1 }}>
          {cart.length === 0 ? (
            <div className={styles['order-card']}>
              <p>Tu carrito está vacío.</p>
              <button className={styles['promo-button']} onClick={() => navigate('/')}>Ver productos</button>
            </div>
          ) : (
            cart.map(item => (
              <CartItem key={item.clave} item={item} />
            ))
          )}
        </div>

        {/* Order Summary & Shipping (25%) */}
        {cart.length > 0 && (
          <div className={styles['contenedor-der-top']} style={{ width: '25%', alignSelf: 'flex-start' }}>
            <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Resumen del Pedido</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
              <span>Subtotal ({cartItemCount} productos):</span>
              <span style={{ fontWeight: 'bold' }}>${cartTotal.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className={styles['promo-button']} style={{ width: '100%' }}>
              Proceder al Pago
            </button>
            <ShippingInfo cartTotal={cartTotal} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;