import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import styles from './CartItem.module.css';
import { FaTrash } from 'react-icons/fa';
import AvisoEscasez from '../common/AvisoEscasez'; // Import the new modal

const CartItem = ({ item, deliveryInfo }) => {
  const { removeItem, updateItemQuantity } = useCart();
  const [isScarcityModalOpen, setIsScarcityModalOpen] = useState(false);

  if (!deliveryInfo) {
    return null; // Or a loading skeleton
  }

  console.log("Item dentro CartItem: ", item)
  // Determine the correct image URL based on category
  const perfilesUrl = `/Perfiles/${item.linea}.jpg`;
  const sugeridosUrl = `/Sugeridos/${item.clave}.jpg`;
  const imageUrl = (item.categoria === 'Herramientas' || item.categoria === 'Accesorios' || item.categoria === 'Estuches' || item.categoria === 'Accesorios hidráulicos')
    ? sugeridosUrl
    : perfilesUrl;

  const handleQuantityChange = (e) => {
    const newQuantity = Math.max(0, Number(e.target.value));
    updateItemQuantity(item.clave, newQuantity);

    if (newQuantity > item.existencia) {
      setIsScarcityModalOpen(true);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <img src={imageUrl} alt={item.descripcion} className={styles.image} />
        <div className={styles.productDetails}>
          <span className={styles.description}>{item.descripcion}</span>
          <span className={styles.price}>Precio: ${parseFloat(item.precio).toFixed(2)}</span>
          <span style={{fontSize:"0.70em"}}>SKU: {item.clave}</span>
          <div className={styles.deliveryInfoContainer}>
            <p className={`${styles.deliveryMessage} notification-info-color`}>
                {deliveryInfo.message} <strong>{deliveryInfo.date}</strong>
            </p>
            {deliveryInfo.warning && <p className={`${styles.deliveryWarning} notification-warning-color`}>{deliveryInfo.warning}</p>}
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.quantityControl}>
            <label htmlFor={`quantity-${item.clave}`}>Cant:</label>
            <input
              id={`quantity-${item.clave}`}
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className={styles.quantityInput}
              min="0"
            />
          </div>
          <button onClick={() => removeItem(item.clave)} className={styles.removeButton}>
            <FaTrash />
          </button>
        </div>
      </div>
      <AvisoEscasez
        isOpen={isScarcityModalOpen}
        onClose={() => setIsScarcityModalOpen(false)}
        message={deliveryInfo.warning}
      />
    </div>
  );
};

export default CartItem;