import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ArticuloSugerido.module.css';

const ArticuloSugerido = ({ producto }) => {
  const calcularFechaEntrega = () => {
    const ahora = new Date();
    ahora.setHours(ahora.getHours() + 48);

    if (ahora.getHours() >= 12) {
      ahora.setDate(ahora.getDate() + 1);
    }

    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    return ahora.toLocaleDateString('es-ES', opciones);
  };

  return (
    <div className={styles.container}>
      <img src={producto.imagen} alt={producto.descripcion} className={styles.imagen} />
      <Link to={`/producto/${producto.clave}?imageUrl=${encodeURIComponent(producto.imagen)}`} className={styles.descripcion}>{producto.descripcion}</Link>
      <div className={styles.promocion}>Promoción</div>
      <div className={styles.precio}>${producto.precio}</div>
      <div className={styles.entrega}>Entrega para el <strong>{calcularFechaEntrega()}</strong></div>
      <button className={styles.boton}>Agregar al carrito</button>
    </div>
  );
};

export default ArticuloSugerido;
