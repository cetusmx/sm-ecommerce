import React, { useEffect, useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '@/context/AuthContext';
import Producto from '../components/Producto/Producto';
import Breadcrumb from '../components/common/Breadcrumb';
import styles from './ProductDetailPage.module.css';

import ArticulosRelacionados from '../components/features/product/ArticulosRelacionados';
import HerramientasSugeridas from '../components/features/product/HerramientasSugeridas';

import AnuncioPuntual from '../components/common/AnuncioPuntual';

const ProductDetailPage = () => {
  const { clave } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser, authLoading } = useContext(AuthContext);

  useEffect(() => {
    // Do nothing until auth state is stable and we have a product key
    if (authLoading || !clave) {
      return;
    }

    const loggingKey = `logging_view_${clave}`;

    // Guard against double-logging using sessionStorage, which persists across re-mounts
    if (sessionStorage.getItem(loggingKey)) {
      return;
    }

    const logProductView = async () => {
      try {
        // Set the flag immediately to prevent other instances from running
        sessionStorage.setItem(loggingKey, 'true');

        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = uuidv4();
          localStorage.setItem('sessionId', sessionId);
        }

        const payload = {
          clave: clave,
          sessionId: sessionId,
          email: currentUser ? currentUser.email : null,
          fecha: new Date().toISOString(),
        };

        await fetch(`${process.env.REACT_APP_API_URL}/productosvistos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Error logging product view:", error);
        // If logging fails, remove the key to allow a retry on the next render
        sessionStorage.removeItem(loggingKey);
      }
    };

    logProductView();

  }, [clave, currentUser, authLoading]);

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
  console.log("--- ProductDetailPage RENDER END ---");
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