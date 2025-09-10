import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ArticuloRelacionado.module.css';
import logo from '@/assets/logo.png';

const ArticuloRelacionado = ({ producto, isSelected, onSelectionChange }) => {
  if (!producto) {
    return null;
  }

  const imageUrl = `/Perfiles/${producto.linea}.jpg`;
  const imageurl2 = `/Sugeridos/${producto.clave}.jpg`;

  const handleCheckboxChange = (e) => {
    onSelectionChange(producto.clave, e.target.checked);
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectionContainer}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className={styles.checkbox}
        />
      </div>
      <div className={styles.imageContainer}>
        {producto.categoria === 'Herramientas' || producto.categoria === 'Accesorios' ? (
          <img src={imageurl2} alt={producto.descripcion} className={styles.image} />
        ) : (
          <img src={imageUrl} alt={producto.descripcion} className={styles.image} />
        )}
      </div>
      <div className={styles.infoContainer}>
        <Link to={`/producto/${producto.clave}`} className={styles.link}>
          <p className={styles.descripcion}>
            {producto.descripcion} | DI - {producto.diam_int} | DE - {producto.diam_ext} | Altura - {producto.altura}
          </p>
        </Link>
        <div className={styles.priceRow}>
          <p className={styles.precio}>${parseFloat(producto.precio).toFixed(2)}</p>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
      </div>
    </div>
  );
};

export default ArticuloRelacionado;