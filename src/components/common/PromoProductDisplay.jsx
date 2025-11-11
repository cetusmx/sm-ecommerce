import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AnuncioPuntual from './AnuncioPuntual';
import styles from '../../pages/ProductGroupPage.module.css'; // Adjust path as needed
import { fetchProducts } from '@/api/productsApi'; // Import fetchProducts

// Helper function to fetch promotional products
const fetchProductosPromocion = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/productospromocion`);
    if (!response.ok) {
        throw new Error('Network response was not ok for promotional products');
    }
    return response.json();
};

const PromoProductDisplay = () => { // Removed allProducts prop
    const { data: promotionalProducts, isLoading: isLoadingPromotions, error: errorPromotions } = useQuery({
        queryKey: ['promotionalProducts'],
        queryFn: fetchProductosPromocion,
    });

    // Fetch all products globally
    const { data: allProducts, isLoading: isLoadingAllProducts, error: errorAllProducts } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    if (isLoadingPromotions || isLoadingAllProducts) {
        return <div className={styles.promoLoading}>Cargando promoción...</div>;
    }

    if (errorPromotions) {
        console.error('PromoProductDisplay: Error fetching promotions', errorPromotions);
        return null;
    }
    if (errorAllProducts) {
        console.error('PromoProductDisplay: Error fetching all products', errorAllProducts);
        return null;
    }

    if (!promotionalProducts || promotionalProducts.length === 0) {
        return null;
    }
    
    if (!allProducts || allProducts.length === 0) {
        return null;
    }

    // Filter promotional products to only include those present in allProducts
    const availablePromotionalProducts = promotionalProducts.filter(promo => 
        allProducts.some(p => p.clave === promo.clave)
    );

    if (availablePromotionalProducts.length === 0) {
        return null;
    }

    // Select a random promotional product from the available ones
    const randomIndex = Math.floor(Math.random() * availablePromotionalProducts.length);
    const selectedPromoProduct = availablePromotionalProducts[randomIndex];

    let originalProduct = allProducts.find(p => p.clave === selectedPromoProduct.clave);

    if (!selectedPromoProduct || !originalProduct) {
        return null;
    }

    let discountedPrice = parseFloat(originalProduct.precio);
    const discount = parseFloat(selectedPromoProduct.descuento);

    if (!isNaN(discount) && discount > 0 && discount <= 100) {
        discountedPrice = discountedPrice * (1 - discount / 100);
    } else {
        discountedPrice = originalProduct.precio;
    }

    const productWithDiscount = {
        ...selectedPromoProduct,
        precio: discountedPrice.toFixed(2),
        originalPrice: originalProduct.precio,
        productData: {
            ...originalProduct,
            precio: discountedPrice.toFixed(2),
        },
    };

    let imageUrl;
    if (originalProduct.categoria === "Herramientas" || originalProduct.categoria === "Accesorios" || originalProduct.categoria === "Estuches" || originalProduct.categoria === "Accesorios hidráulicos") {
        imageUrl = `/Sugeridos/${originalProduct.clave}.jpg`;
    } else {
        imageUrl = `/Perfiles/${originalProduct.linea}.jpg`;
    }

    const productDataForCart = {
        ...productWithDiscount.productData,
        imageUrl: imageUrl,
    };

    return (
        <div className={styles.promoContainer}>
             <hr className={styles.divider} />
            <AnuncioPuntual
                key={productWithDiscount.id}
                imageUrl={imageUrl}
                slogan={productWithDiscount.slogan || `¡${selectedPromoProduct.descuento}% de descuento!`}
                precio={productWithDiscount.precio}
                originalPrice={productWithDiscount.originalPrice}
                productData={productDataForCart}
            />
        </div>
    );
};

export default PromoProductDisplay;
