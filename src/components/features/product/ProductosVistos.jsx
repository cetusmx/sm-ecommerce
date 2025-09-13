import React, { useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '@/context/AuthContext';
import ProductoVisto from './ProductoVisto';
import styles from './ProductosVistos.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const fetchProductosVistos = async (email) => {
  if (!email) return [];
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productosvistos/email/${email}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const ProductosVistos = () => {
  const { currentUser } = useContext(AuthContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: viewedProducts, isLoading, error } = useQuery({
    queryKey: ['productosVistos', currentUser?.email],
    queryFn: () => fetchProductosVistos(currentUser?.email),
    enabled: !!currentUser?.email,
  });

  if (isLoading) return <div className={styles.container}>Cargando productos vistos...</div>;
  if (error) return <div className={styles.container}>Error: {error.message}</div>;
  if (!viewedProducts || viewedProducts.length === 0) return null;

  const productsPerPage = 4; // Adjust as needed
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
