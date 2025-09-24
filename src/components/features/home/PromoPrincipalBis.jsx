import React from 'react';
import styles from './PromoPrincipal.module.css';

const PromoPrincipal = ({
  title,
  mainImage,
  mainImageAlt,
  description,
  subImage1,
  subImage1Alt,
  subImage1Title,
  subImage2,
  subImage2Alt,
  subImage2Title,
  link
}) => {
  return (
    <div className={styles.container}>
      <h5 className={styles['titulo-promo-box']}>{title}</h5>
      <div className={styles['promo-content-wrapper']}>
        <img className={styles['promo-image']} src={mainImage} alt={mainImageAlt} />
        <p>{description}</p>
      </div>
      
      <div className={styles['promo-images-row']}>
        <div className={styles['promo-image-item']}>
          <img src={subImage1} alt={subImage1Alt} />
          <div className={styles['image-title-box']}>
            <span>{subImage1Title}</span>
          </div>
        </div>
        <div className={styles['promo-image-item']}>
          <img src={subImage2} alt={subImage2Alt} />
          <div className={styles['image-title-box']}>
            <span>{subImage2Title}</span>
          </div>
        </div>
      </div>
      <div className={styles['promo-link-wrapper']}>
        <a href={link} className={styles['promo-link']}>Ver más</a>
      </div>
    </div>
  );
};

export default PromoPrincipal;
