import React from 'react';
import styles from './AnuncioPuntual.module.css';

const AnuncioPuntual = ({ linea, slogan, precio }) => {
  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div className={styles.sloganContainer}>
          <p className={styles.slogan}>{slogan}</p>
        </div>
        <div className={styles.imageContainer}>
          <img src={`/Perfiles/${linea}.jpg`} alt={slogan} className={styles.image} />
        </div>
      </div>
      <div className={styles.bottomSection}>
        <p className={styles.precio}>${precio}</p>
      </div>
    </div>
  );
};

export default AnuncioPuntual;
