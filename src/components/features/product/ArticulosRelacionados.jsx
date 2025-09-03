import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ArticuloRelacionado from './ArticuloRelacionado';
import styles from './ArticulosRelacionados.module.css';

const fetchProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const ArticulosRelacionados = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  if (isLoading) return <div>Cargando artículos relacionados...</div>;
  if (error) return <div>Error al cargar artículos relacionados.</div>;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Quizá también necesites</h3>
      <div className={styles.listContainer}>
        {products && products.slice(0, 3).map(product => (
          <ArticuloRelacionado key={product.clave} producto={product} />
        ))}
      </div>
    </div>
  );
};

export default ArticulosRelacionados;
