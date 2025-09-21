import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AnuncioPuntual from '../../common/AnuncioPuntual';
import { fetchProducts } from '@/api/productsApi';

const fetchProductosPromocion = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productospromocion`);
  if (!response.ok) {
    throw new Error('Network response was not ok for promotional products');
  }
  return response.json();
};

const ProductosPromocion = ({ className }) => {
  const { data: promotionalProducts, isLoading: isLoadingPromotions, error: errorPromotions } = useQuery({
    queryKey: ['promotionalProducts'],
    queryFn: fetchProductosPromocion,
  });

  // New useQuery for all products
  const { data: allProducts, isLoading: isLoadingAllProducts, error: errorAllProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });


  if (isLoadingPromotions || isLoadingAllProducts) {
    return <aside className={className}>Cargando promociones...</aside>;
  }

  if (errorPromotions || errorAllProducts) {
    return <aside className={className}>Error al cargar promociones: {errorPromotions?.message || errorAllProducts?.message}</aside>;
  }

  if (!promotionalProducts || promotionalProducts.length === 0 || !allProducts || allProducts.length === 0) {
    return null;
  }

  // Calculate discounted prices
  const productsWithDiscountedPrice = promotionalProducts.map((promoProduct) => {
    const originalProduct = allProducts.find(p => p.clave === promoProduct.clave);

    if (!originalProduct) {
      console.warn(`Producto original con clave ${promoProduct.clave} no encontrado para la promoción.`);
      return null; // Skip this promotional product if original not found
    }

    let discountedPrice = parseFloat(originalProduct.precio);
    const discount = parseFloat(promoProduct.descuento);

    if (!isNaN(discount) && discount > 0 && discount <= 100) {
      discountedPrice = discountedPrice * (1 - discount / 100);
    } else {
      console.warn(`Descuento inválido (${promoProduct.descuento}) para el producto ${promoProduct.clave}. No se aplicará descuento.`);
    }

    return {
      ...promoProduct,
      precio: discountedPrice.toFixed(2),
      originalProductCategory: originalProduct.categoria,
      originalProductLinea: originalProduct.linea,
      originalPrice: originalProduct.precio,
      productData: {
        ...originalProduct,
        precio: discountedPrice.toFixed(2),
      },
    };
  }).filter(Boolean); // Remove any null entries


  if (productsWithDiscountedPrice.length === 0) {
    return null;
  }

  return (
    <aside className={className}>
      {productsWithDiscountedPrice.map((product) => {
        let imageUrl;
        if (product.originalProductCategory === "Herramientas" || product.originalProductCategory === "Accesorios" || product.originalProductCategory === "Estuches" ) {
          imageUrl = `/Sugeridos/${product.clave}.jpg`;
        } else {
          imageUrl = `/Productos/${product.originalProductLinea}.jpg`;
        }

        // Update productData with the constructed imageUrl
        const productDataForCart = {
          ...product.productData,
          imageUrl: imageUrl,
        };

        return (
          <AnuncioPuntual
            key={product.id}
            imageUrl={imageUrl}
            slogan={product.slogan || `¡${product.descuento}% de descuento!`}
            precio={product.precio}
            originalPrice={product.originalPrice}
            productData={productDataForCart}
          />
        );
      })}
    </aside>
  );
};

export default ProductosPromocion;
