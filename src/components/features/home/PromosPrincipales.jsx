import React from 'react';
import styles from './PromosPrincipales.module.css';
import cnc from '@/assets/cnc1.jpg';
import materiales from '@/assets/materiales.jpg'; // Added this line to force re-compilation
import cncu from '@/assets/cncu.png'; // Added this line to force re-compilation

const PromosPrincipales = () => {
  return (
    <div className={styles['promo-container']}>
      <div className={styles['promo-box']}>
        <h5>Sellos a la Medida</h5>
        <div className={styles['promo-content-wrapper']}>
          <img className={styles['promo1-image']} src={cnc} alt="Fabricación de sellos" />
          <p>Alta precisión en el proceso de maquinado con materiales de la más alta calidad.</p>
        </div>
        <div className={styles['promo-images-row']}> {/* New row for images */}
          <div className={styles['promo-image-item']}>
            <img src={materiales} alt="Materiales 100% calidad" />
            <div className={styles['image-title-box']}>
              <span>100% calidad</span>
            </div>
          </div>
          <div className={styles['promo-image-item']}>
            <img src={cncu} alt="Alta precisión" />
            <div className={styles['image-title-box']}>
              <span>Alta precisión</span>
            </div>
          </div>
        </div>
        <div className={styles['promo-link-wrapper']}> {/* New wrapper for "Ver más" link */}
          <a href="/sellos-a-la-medida" className={styles['promo-link']}>Ver más</a>
        </div>
      </div>
      <div className={styles['promo-box']}>Promo 2</div>
      <div className={styles['promo-box']}>Promo 3</div>
      <div className={styles['promo-box']}>Promo 4</div>
    </div>
  );
};

export default PromosPrincipales;