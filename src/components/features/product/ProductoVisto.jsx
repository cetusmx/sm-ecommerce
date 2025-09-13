import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import styles from './ProductoVisto.module.css';

const fetchProductDetails = async (clave) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const products = await response.json();
  const singleProduct = products.find(p => p.clave === clave);
  if (!singleProduct) {
    throw new Error('Product not found');
  }
  return singleProduct;
};

const ProductoVisto = ({ viewedProduct }) => {
  const { addItem } = useCart();
  const [addedMessage, setAddedMessage] = useState('');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['productDetails', viewedProduct.clave],
    queryFn: () => fetchProductDetails(viewedProduct.clave),
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, 1);
      setAddedMessage('Agregado al carrito');
      setTimeout(() => setAddedMessage(''), 3000);
    }
  };

  if (isLoading) return <div className={styles.container}>Cargando...</div>;
  if (error) return <div className={styles.container}>Error: {error.message}</div>;
  if (!product) return null; // Should not happen if error handling is correct

  const imageUrl = `/Perfiles/${product.linea}.jpg`; // Assuming image based on linea

  return (
    <div className={styles.container}>
      <img src={imageUrl} alt={product.descripcion} className={styles.imagen} />
      <Link to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(imageUrl)}`} className={styles.descripcion}>{product.descripcion}</Link>
      <div className={styles.precio}>${product.precio} {addedMessage && <span className={styles.inCartMessage}>{addedMessage}</span>}</div>
      <button className="sm-btn sm-btn-primary" onClick={handleAddToCart}>Agregar al carrito</button>
    </div>
  );
};

export default ProductoVisto;
