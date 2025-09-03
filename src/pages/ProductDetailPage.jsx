import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Producto from '../components/Producto/Producto';
import Breadcrumb from '../components/common/Breadcrumb';
import styles from './ProductDetailPage.module.css';

import ArticulosRelacionados from '../components/features/product/ArticulosRelacionados';

import AnuncioPuntual from '../components/common/AnuncioPuntual';

const ProductDetailPage = () => {
  const { clave } = useParams();

  // Fetch the single product
  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['product', clave],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
      if (!response.ok) {
        throw new Error('Network response was not ok for products');
      }
      const products = await response.json();
      const singleProduct = products.find(p => p.clave === clave);
      if (!singleProduct) {
        throw new Error('Product not found');
      }
      return singleProduct;
    },
  });

  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/categorias`);
        if (!response.ok) {
            throw new Error('Network response was not ok while fetching categories');
        }
        return response.json();
    },
  });

  // Determine parent category
  const getParentCategory = () => {
    if (!product || !categories) return null;
    const productCategory = categories.find(cat => cat.nombre === product.categoria);
    return productCategory ? productCategory.categoria_padre : null;
  };

  const parentCategory = getParentCategory();

  if (isLoadingProduct || isLoadingCategories) {
    return <div>Cargando producto...</div>;
  }

  if (productError || categoriesError) {
    return <div>Error: {productError?.message || categoriesError?.message}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <Breadcrumb parent={parentCategory} child={product.categoria} />
      <div className={styles.contentWrapper}>
        <main className={styles.mainContent}>
          <Producto producto={product} />
          <ArticulosRelacionados />
        </main>
        <aside className={styles.sidebar}>
          <AnuncioPuntual linea="ANSME" slogan="¡Oferta especial!" precio="99.99" />
          <AnuncioPuntual linea="BAKSN" slogan="¡Solo por hoy!" precio="149.50" />
          <AnuncioPuntual linea="BAMVE" slogan="¡Últimas unidades!" precio="75.00" />
        </aside>
      </div>
    </div>
  );
};

export default ProductDetailPage;
