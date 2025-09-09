import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Producto from '../components/Producto/Producto';
import Breadcrumb from '../components/common/Breadcrumb';
import styles from './ProductDetailPage.module.css';

import ArticulosRelacionados from '../components/features/product/ArticulosRelacionados';
import HerramientasSugeridas from '../components/features/product/HerramientasSugeridas';

import AnuncioPuntual from '../components/common/AnuncioPuntual';

const ProductDetailPage = () => {
  const { clave } = useParams();
  const [searchParams] = useSearchParams();

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

  // Get imageUrl from query parameters, fallback to default
  const imageUrlFromQuery = searchParams.get('imageUrl');
  console.log(imageUrlFromQuery);
  const finalImageUrl = imageUrlFromQuery || `/Perfiles/${product.linea}.jpg`;
  console.log(finalImageUrl);
  return (
    <div className={styles.productContainer}>

      <Breadcrumb parent={parentCategory} child={product.categoria} />
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <main className={styles.mainContent}>
          <Producto producto={product} imageUrl={finalImageUrl} />
        </main>
        <aside className={styles.sidebar}>
          <AnuncioPuntual linea="ESTUC" slogan="¡Oferta especial!" precio="326" />
          <AnuncioPuntual linea="ESTUC2" slogan="¡Estuches de Orings!" precio="326" />
          <AnuncioPuntual linea="BAMVE" slogan="¡Últimas unidades!" precio="75.00" />
        </aside>
      </div>
          <ArticulosRelacionados productoPrincipal={product} />
          <HerramientasSugeridas />
    </div>
    </div>
  );
};

export default ProductDetailPage;