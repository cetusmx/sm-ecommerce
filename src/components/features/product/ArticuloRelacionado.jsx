import React from 'react';
import styles from './ArticuloRelacionado.module.css';
import logo from '@/assets/logo.png';

const ArticuloRelacionado = ({ producto }) => {
  if (!producto) {
    return null;
  }

  const imageUrl = `/Perfiles/${producto.linea}.jpg`;

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={producto.descripcion} className={styles.image} />
      </div>
      <div className={styles.infoContainer}>
        <p className={styles.descripcion}>
          {producto.descripcion} | DI - {producto.diam_int} | DE - {producto.diam_ext} | Altura - {producto.altura}
        </p>
        <div className={styles.priceRow}>
          <p className={styles.precio}>${producto.precio}</p>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
      </div>
    </div>
  );
};

export default ArticuloRelacionado;
