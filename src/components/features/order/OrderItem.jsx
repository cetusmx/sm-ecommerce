import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatToSpanishDate } from '@/utils/dateUtils';
import styles from './OrderItem.module.css';
import '@/styles/global.css';

const OrderItem = ({ item }) => {
  const navigate = useNavigate();
  const perfilesUrl = `/Perfiles/${item.linea}.jpg`;
  const sugeridosUrl = `/Sugeridos/${item.clave}.jpg`;
  const imageUrl = (item.categoria === 'Herramientas' || item.categoria === 'Accesorios')
    ? sugeridosUrl
    : perfilesUrl;

  const handleBuyAgain = () => {
    const encodedImageUrl = encodeURIComponent(imageUrl);
    navigate(`/producto/${item.clave}?imageUrl=${encodedImageUrl}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <img src={imageUrl} alt={item.descripcion} className={styles.image} />
        <div className={styles.productDetails}>
          <span className={styles.description}>{item.descripcion}</span>
          <span style={{fontSize:"0.70em"}}>SKU: {item.clave}</span>
          {item.fecha_entrega && (
            <p className={`${styles.deliveryDate} ${styles.deliveryDateStyle}`}>Entrega estimada: {formatToSpanishDate(new Date(item.fecha_entrega))}</p>
          )}
        </div>
        <div className={styles.actions}>
          <p>Cantidad: {item.cantidad}</p>
          <button onClick={handleBuyAgain} className="sm-btn sm-btn-tertiary">Comprar nuevamente</button>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;