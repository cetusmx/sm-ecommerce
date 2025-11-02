import React from 'react';
import styles from './ProductosPorUbicacionSkeleton.module.css';

const ProductosPorUbicacionSkeleton = ({ count = 5 }) => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}></div>
      ))}
    </div>
  );
};

export default ProductosPorUbicacionSkeleton;