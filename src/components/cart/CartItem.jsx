import React from 'react';
import { useCart } from '@/hooks/useCart';
import { useDeliveryInfo } from '@/hooks/useDeliveryInfo';
import styles from './CartItem.module.css';
import { FaTrash } from 'react-icons/fa';

const CartItem = ({ item }) => {
  const { removeItem, updateItemQuantity } = useCart();
  const deliveryInfo = useDeliveryInfo(item, item.quantity);

  // Determine the correct image URL based on category
  const perfilesUrl = `/Perfiles/${item.linea}.jpg`;
  const sugeridosUrl = `/Sugeridos/${item.clave}.jpg`;
  const imageUrl = (item.categoria === 'Herramientas' || item.categoria === 'Accesorios')
    ? sugeridosUrl
    : perfilesUrl;

  const handleQuantityChange = (e) => {
    const newQuantity = Math.max(0, Number(e.target.value));
    updateItemQuantity(item.clave, newQuantity);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <img src={imageUrl} alt={item.descripcion} className={styles.image} />
        <div className={styles.productDetails}>
          <span className={styles.description}>{item.descripcion}</span>
          <span>Clave: {item.clave}</span>
          <span className={styles.price}>Precio: ${parseFloat(item.precio).toFixed(2)}</span>
          <div className={styles.deliveryInfoContainer}>
            <p className={styles.deliveryMessage}>
                {deliveryInfo.message} <strong>{deliveryInfo.date}</strong>
            </p>
            {deliveryInfo.warning && <p className={styles.deliveryWarning}>{deliveryInfo.warning}</p>}
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
    </div>
  );
};

export default CartItem;