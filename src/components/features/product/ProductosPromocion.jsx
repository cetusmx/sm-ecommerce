import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AnuncioPuntual from '../../common/AnuncioPuntual';

const fetchProductosPromocion = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productospromocion`);
  if (!response.ok) {
    throw new Error('Network response was not ok for promotional products');
  }
  return response.json();
};

// New function to fetch all products
const fetchProductos = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok for all products');
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
    queryKey: ['allProducts'],
    queryFn: fetchProductos,
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
      precio: discountedPrice.toFixed(2), // Format to 2 decimal places
      originalProductCategory: originalProduct.categoria, // Add category for image URL logic
      originalProductLinea: originalProduct.linea, // Add linea for image URL logic
      originalPrice: originalProduct.precio, // Add original price here
      productData: { // Pass the original product data for cart functionality
        ...originalProduct, // Spread all properties from originalProduct
        nombre: originalProduct.clave, // Ensure 'nombre' is set to 'clave' as per previous discussion
        precio: discountedPrice.toFixed(2), // Override with the discounted price
        // imageUrl will be added later in productDataForCart
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
            imageUrl={imageUrl} // Pass the constructed imageUrl
            slogan={product.slogan || `¡${product.descuento}% de descuento!`}
            precio={product.precio}
            originalPrice={product.originalPrice} // Pass the original price
            productData={productDataForCart} // Pass the product data for cart
          />
        );
      })}
    </aside>
  );
};

export default ProductosPromocion;
