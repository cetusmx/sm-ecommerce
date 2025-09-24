import React from "react";
import { Link } from 'react-router-dom';
import styles from "./PromoPrincipal.module.css";

const PromoPrincipal = ({
  title,
  mainImage,
  mainImageAlt,
  mainImage2,
  mainImage2Alt,
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
      <Link to={link} className={styles["titulo-promo-box-link"]}>
        <h5 className={styles["titulo-promo-box"]}>{title}</h5>
      </Link>
      <div className={styles["promo-images-row"]}>
        <div className={styles["promo-image-item"]}>
          <img
            /* className={styles["promo-image"]} */
            src={mainImage}
            alt={mainImageAlt}
          />
        </div>
        <div className={styles["promo-image-item"]}>
           <img
            /* className={styles["promo-image"]} */
            src={mainImage2}
            alt={mainImage2Alt}
          />
        </div>
      </div>

      <div className={styles["promo-images-row"]}>
        <div className={styles["promo-image-item"]}>
          <img src={subImage1} alt={subImage1Alt} />
          {/* <div className={styles["image-title-box"]}>
            <span>{subImage1Title}</span>
          </div> */}
        </div>
        <div className={styles["promo-image-item"]}>
          <img src={subImage2} alt={subImage2Alt} />
          {/* <div className={styles["image-title-box"]}>
            <span>{subImage2Title}</span>
          </div> */}
        </div>
      </div>
      <div className={styles["promo-link-wrapper"]}>
        <a href={link} className={styles["promo-link"]}>
          Ver más
        </a>
      </div>
    </div>
  );
};

export default PromoPrincipal;
