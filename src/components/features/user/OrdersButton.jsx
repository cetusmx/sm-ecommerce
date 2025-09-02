import React from 'react';
import { Link } from 'react-router-dom';
import { BiPackage } from 'react-icons/bi';
import styles from './OrdersButton.module.css';

// Forcing a re-render to clear potential cached errors
const OrdersButton = () => {
  return (
    <Link to="/orders" className={styles['orders-button']}>
      <div className={styles['orders-icon-wrapper']}>
        <BiPackage className={styles['orders-icon']} />
      </div>
      <span className={styles['orders-text']}>Pedidos</span>
    </Link>
  );
};

export default OrdersButton;
