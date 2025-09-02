import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Producto from '../components/Producto/Producto';
import Breadcrumb from '../components/common/Breadcrumb';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage = () => {
  const { clave } = useParams();

  // Fetch the single product
  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['product', clave],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3004/api/productos`);
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
      <Producto producto={product} />
    </div>
  );
};

export default ProductDetailPage;
