import React, { useEffect, useContext, useMemo } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
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
import { fetchProductByClave, fetchProducts } from '@/api/productsApi'; // Import fetchProducts

const ProductDetailPage = () => {
  const { clave } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation(); // Get location object
  const { currentUser, authLoading } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Get promotion info from Link state, if available
  const { isPromotion: initialIsPromotion, offerPrice: initialOfferPrice } = location.state || {};

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
  });

  // Fetch all products for promotion calculation (if not already in cache)
  const { data: allProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch promotional products for real-time promotion check
  const { data: promotionalProducts } = useQuery({
    queryKey: ['promotionalProducts'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/productospromocion`);
      if (!response.ok) {
        console.error('Failed to fetch promotional products');
        return [];
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper to check if a product is in promotion
  const isProductInPromotion = (prod) => {
    if (!promotionalProducts || !prod) return false;
    return promotionalProducts.some(promo => promo.clave === prod.clave);
  };

  // Calculate the final price to display
  const displayProduct = useMemo(() => {
    if (!product) return null;

    let finalPrice = parseFloat(product.precio);
    let isCurrentlyPromotional = false;

    // First, check real-time promotion status
    if (isProductInPromotion(product) && allProducts) {
      const promoDetails = promotionalProducts.find(promo => promo.clave === product.clave);
      const originalProduct = allProducts.find(p => p.clave === product.clave);

      if (promoDetails && originalProduct) {
        const normalPrice = parseFloat(originalProduct.precio);
        const discount = parseFloat(promoDetails.descuento);
        if (!isNaN(discount) && discount > 0 && discount <= 100) {
          finalPrice = normalPrice * (1 - discount / 100);
          isCurrentlyPromotional = true;
        }
      }
    }

    // If not currently promotional, but came from a promotional link, use initialOfferPrice
    // This handles cases where the promotion might have just ended, but the link still carried the info
    // Or if the product details haven't fully loaded yet.
    if (!isCurrentlyPromotional && initialIsPromotion && initialOfferPrice) {
      finalPrice = parseFloat(initialOfferPrice);
    }

    return {
      ...product,
      precio: finalPrice.toFixed(2),
      isPromotional: isCurrentlyPromotional || initialIsPromotion, // Indicate if it's promotional
    };
  }, [product, promotionalProducts, allProducts, initialIsPromotion, initialOfferPrice]);

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

  if (isLoadingProduct || isLoadingCategories || !displayProduct) { // Check displayProduct here
    return <div>Cargando producto...</div>;
  }

  if (productError || categoriesError) {
    return <div>Error: {productError?.message || categoriesError?.message}</div>;
  }

  // Get imageUrl from query parameters, fallback to default
  const imageUrlFromQuery = searchParams.get('imageUrl');
  const finalImageUrl = imageUrlFromQuery || `/Perfiles/${displayProduct.linea}.jpg`; // Use displayProduct here
  return (
    <div className={styles.productContainer}>

      <Breadcrumb parent={parentCategory} child={displayProduct.categoria} />
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <main className={styles.mainContent}>
          <Producto producto={displayProduct} imageUrl={finalImageUrl} />
        </main>
        <ProductosPromocion className={styles.sidebar} />
      </div>
          <ArticulosRelacionados productoPrincipal={displayProduct} />
          {viewedProducts && viewedProducts.length > 0 && <ProductosVistos viewedProducts={viewedProducts} />}
          <HerramientasSugeridas />
    </div>
    </div>
  );
};

export default ProductDetailPage;