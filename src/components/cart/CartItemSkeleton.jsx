import React from 'react';
import styles from './CartItemSkeleton.module.css';

const CartItemSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={`${styles.placeholder} ${styles.image}`}></div>
        <div className={styles.productDetails}>
          <div className={`${styles.placeholder} ${styles.line} ${styles.lineLg}`}></div>
          <div className={`${styles.placeholder} ${styles.line} ${styles.lineMd}`}></div>
          <div className={`${styles.placeholder} ${styles.line} ${styles.lineSm}`}></div>
        </div>
        <div className={styles.actions}>
          <div className={`${styles.placeholder} ${styles.quantityInput}`}></div>
          <div className={`${styles.placeholder} ${styles.removeButton}`}></div>
        </div>
      </div>
    </div>
  );
};

export default CartItemSkeleton;
