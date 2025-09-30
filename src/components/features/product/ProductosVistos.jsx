import React, { useState } from 'react';
import ProductoVisto from './ProductoVisto';
import styles from './ProductosVistos.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';



const ProductosVistos = ({ viewedProducts = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!viewedProducts || viewedProducts.length === 0) {
    return null; // No renderizar nada si no hay productos vistos
  }

  const productsPerPage = 5; // Adjust as needed
  const totalPages = Math.ceil(viewedProducts.length / productsPerPage);

  const goToPreviousSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  const startIndex = currentIndex * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = viewedProducts.slice(startIndex, endIndex);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Productos Vistos Recientemente</h3>
      <div className={styles.carouselWrapper}>
        <button onClick={goToPreviousSlide} className={`${styles.carouselControl} ${styles.prev}`}>
          <FaChevronLeft />
        </button>
        <div className={styles.carouselContent}>
          {productsToShow.map((product) => (
            <ProductoVisto key={product.id} viewedProduct={product} />
          ))}
        </div>
        <button onClick={goToNextSlide} className={`${styles.carouselControl} ${styles.next}`}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ProductosVistos;
