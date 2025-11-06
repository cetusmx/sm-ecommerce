import React, { useEffect, useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '@/context/AuthContext';
import Producto from '../components/Producto/Producto';
import Breadcrumb from '../components/common/Breadcrumb';
import styles from './ProductDetailPage.module.css';

import ArticulosRelacionados from '../components/features/product/ArticulosRelacionados';
import HerramientasSugeridas from '../components/features/product/HerramientasSugeridas';
import ProductosVistos from '../components/features/product/ProductosVistos';

import AnuncioPuntual from '../components/common/AnuncioPuntual';
import ProductosPromocion from '../components/features/product/ProductosPromocion';

import { fetchProductosVistos } from '@/api/productosVistosApi';
import { fetchProductByClave } from '@/api/productsApi';

const ProductDetailPage = () => {
  const { clave } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser, authLoading } = useContext(AuthContext);
  const queryClient = useQueryClient();

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
    queryKey: ['productDetails', clave],
    queryFn: () => fetchProductByClave(clave),
    staleTime: 0,
    /* staleTime: 1000 * 60 * 60, */ // 1 hour
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

  const { data: viewedProducts } = useQuery({
    queryKey: ['productosVistos', currentUser?.email],
    queryFn: () => fetchProductosVistos(currentUser?.email),
    enabled: !!currentUser?.email,
  });

  // Determine parent category
  const getParentCategory = () => {
    if (!product || !categories) return null;
    const productCategory = categories.find(cat => cat.nombre === product.categoria);
    return productCategory ? productCategory.categoria_padre : null;
  };

  const parentCategory = getParentCategory();

  // Get product from cache
  const cachedProduct = queryClient.getQueryData(['products'])?.find(p => p.clave === clave);

  const finalProduct = product;

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
  return (
    <div className={styles.productContainer}>

      <Breadcrumb parent={parentCategory} child={product.categoria} />
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <main className={styles.mainContent}>
          <Producto producto={finalProduct} imageUrl={finalImageUrl} />
        </main>
        <ProductosPromocion className={styles.sidebar} />
      </div>
          <ArticulosRelacionados productoPrincipal={finalProduct} />
          {viewedProducts && viewedProducts.length > 0 && <ProductosVistos viewedProducts={viewedProducts} />}
          <HerramientasSugeridas />
    </div>
    </div>
  );
};

export default ProductDetailPage;