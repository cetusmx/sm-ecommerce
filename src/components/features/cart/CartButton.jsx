import React, { useState } from 'react';
import styles from './CartButton.module.css';

const CartButton = () => {
  const [itemCount, setItemCount] = useState(3); // Example item count

  const handleClick = () => {
    console.log('Cart button clicked!');
    // In a real app, this would navigate to the cart page or open a modal
  };

  return (
    <button className={styles['cart-button']} onClick={handleClick}>
      
      <div className={styles['cart-icon-wrapper']}>
       {/*  <FaShoppingCart className={styles['cart-icon']} /> */}
       <svg width="45" height="32" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1 L10 1 M10 1 L17 17 M17 17 L35 17 M35 17 L39 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="19" cy="23" r="0.5" stroke="#fff" fill="transparent" stroke-width="5"/>
            <circle cx="33" cy="23" r="0.5" stroke="#fff" fill="transparent" stroke-width="5"/>
        </svg>
       {itemCount > 0 && (
          <span className={styles['cart-item-count']}>{itemCount}</span>
        )}
      </div>
      <span className={styles['cart-text']}>Carrito</span>
    </button>
  );
};

export default CartButton;
