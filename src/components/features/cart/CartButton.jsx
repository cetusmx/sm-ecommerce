import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
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
        <FaShoppingCart className={styles['cart-icon']} />
        {itemCount > 0 && (
          <span className={styles['cart-item-count']}>{itemCount}</span>
        )}
      </div>
      <span className={styles['cart-text']}>Carrito</span>
    </button>
  );
};

export default CartButton;
