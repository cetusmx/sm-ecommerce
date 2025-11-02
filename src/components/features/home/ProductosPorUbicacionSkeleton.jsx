import React from 'react';
import styles from './ProductosPorUbicacionSkeleton.module.css';

// This component will mimic the real ProductCard structure
const SkeletonCard = () => (
  <div className={styles.productCard}>
    <div className={`${styles.placeholder} ${styles.productImage}`}></div>
    <div className={styles.productInfo}>
      <div className={`${styles.placeholder} ${styles.productName}`}></div>
    </div>
  </div>
);

// This component will mimic the real ProductGroup structure
const SkeletonProductGroup = ({ title }) => (
  <section className={styles.section}>
    <h2 className={`${styles.title} ${styles.placeholder}`} style={{ width: '200px', height: '22px' }}></h2>
    <div className={styles.productList}>
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  </section>
);

// The main skeleton component
const ProductosPorUbicacionSkeleton = () => {
  return (
    <div className={styles.container}>
      <SkeletonProductGroup />
      <SkeletonProductGroup />
    </div>
  );
};

export default ProductosPorUbicacionSkeleton;