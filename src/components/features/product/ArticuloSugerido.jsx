import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ArticuloSugerido.module.css';
import { useCart } from '@/hooks/useCart'; // Import useCart

const ArticuloSugerido = ({ producto }) => {
  const { addItem } = useCart(); // Get addItem from cart context
  const [addedMessage, setAddedMessage] = useState(''); // State for confirmation message

  const calcularFechaEntrega = () => {
    const ahora = new Date();
    ahora.setHours(ahora.getHours() + 48);

    if (ahora.getHours() >= 12) {
      ahora.setDate(ahora.getDate() + 1);
    }

    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    return ahora.toLocaleDateString('es-ES', opciones);
  };

  const handleAddToCart = () => {
    addItem(producto, 1); // Add 1 unit of the suggested product
    setAddedMessage('En carrito');
    setTimeout(() => setAddedMessage(''), 3000); // Clear message after 3 seconds
  };

  return (
    <div className={styles.container}>
      <img src={producto.imagen} alt={producto.descripcion} className={styles.imagen} />
      <Link to={`/producto/${producto.clave}?imageUrl=${encodeURIComponent(producto.imagen)}`} className={styles.descripcion}>{producto.descripcion}</Link>
      <div className={styles.promocion}>Promoción</div>
      <div className={styles.precio}>${producto.precio} {addedMessage && <span className={styles.inCartMessage}>{addedMessage}</span>}</div>
      <div className={styles.entrega}>Entrega para el <strong>{calcularFechaEntrega()}</strong></div>
      <button className={styles.boton} onClick={handleAddToCart}>Agregar al carrito</button>
    </div>
  );
};

export default ArticuloSugerido;
