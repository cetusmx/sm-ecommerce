import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchProducts } from '@/api/productsApi';
import ProductTable from '@/components/features/product/ProductTable';
import AnuncioPuntual from '@/components/common/AnuncioPuntual';
import ProductosPromocion from '@/components/features/product/ProductosPromocion';
import styles from './ProductGroupPage.module.css';

// Helper function to fetch promotional products
const fetchProductosPromocion = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/productospromocion`);
    if (!response.ok) {
        throw new Error('Network response was not ok for promotional products');
    }
    return response.json();
};

// --- PromotionalProduct Component (Optimized) ---
// Now receives allProducts as a prop to avoid redundant fetching
const PromotionalProduct = ({ allProducts }) => {
    const { data: promotionalProducts, isLoading: isLoadingPromotions, error: errorPromotions } = useQuery({
        queryKey: ['promotionalProducts'],
        queryFn: fetchProductosPromocion,
    });

    if (isLoadingPromotions) {
        return <div className={styles.promoLoading}>Cargando promoción...</div>;
    }

    if (errorPromotions || !promotionalProducts || promotionalProducts.length === 0 || !allProducts) {
        return null; // Don't render anything if there's an error or no data
    }

    // Find a promotional product that exists in the main product list
    let originalProduct = null;
    const promoProduct = promotionalProducts.find(promo => {
        originalProduct = allProducts.find(p => p.clave === promo.clave);
        return !!originalProduct;
    });

    if (!promoProduct || !originalProduct) {
        return null; // Don't render if no valid promotion is found
    }

    let discountedPrice = parseFloat(originalProduct.precio);
    const discount = parseFloat(promoProduct.descuento);

    if (!isNaN(discount) && discount > 0 && discount <= 100) {
        discountedPrice = discountedPrice * (1 - discount / 100);
    } else {
        discountedPrice = originalProduct.precio;
    }

    const productWithDiscount = {
        ...promoProduct,
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
                slogan={productWithDiscount.slogan || `¡${productWithDiscount.descuento}% de descuento!`}
                precio={productWithDiscount.precio}
                originalPrice={productWithDiscount.originalPrice}
                productData={productDataForCart}
            />
        </div>
    );
};

// --- Dynamic Filter Configuration ---
const filterConfig = {
    'seguros-pernos-graseras': {
        title: 'Seguros, Pernos y Graseras',
        filters: [
            { name: "Graseras", linea: "GRSGF", prefix: "GF-" },
            { name: "Seguros externos", linea: "SGSEX", prefix: "310" },
            { name: "Seguros internos", linea: "SGSIN", prefix: "300-" },
            { name: "Seguros E", linea: "SGSTE", prefix: "VS" },
            { name: "Perno spirol", linea: "PRSPV", prefix: "VP0" },
            { name: "Perno ranurado", linea: "PRSVP", prefix: "VPA" },
            { name: "Perno sólido", linea: "PRSVP", prefix: "VPR" }
        ]
    },
    'accesorios-hidraulicos': {
        title: 'Accesorios Hidráulicos',
        filters: [
            { name: "Accesorios", linea: "SHACC", prefix: "AC-" },
            { name: "Bombas hidráulicas", linea: "SHBOM", prefix: "BH-" },
            { name: "Coples", linea: "SHCOP", prefix: "AC-" },
            { name: "Filtros y bases", linea: "SHFIL", prefix: "AC-" },
            { name: "Manómetros", linea: "SHMAN", prefix: "AC-" }
        ]
    },
    'herramientas': {
        title: 'Herramientas',
        linea: 'HER' // Filter by linea property
    },
    'estuches-orings': {
        title: 'Estuches de Orings',
        category: 'Estuches'
    }
};

// --- Main ProductGroupPage Component (Dynamic) ---
const ProductGroupPage = () => {
    const { groupName } = useParams(); // Read group from URL
    const currentGroup = filterConfig[groupName] || {};

    const { data: products, isLoading, error } = useQuery({ 
        queryKey: ['products'], 
        queryFn: fetchProducts 
    });

    const [selectedFilters, setSelectedFilters] = useState([]);

    const handleFilterChange = (filter) => {
        setSelectedFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter) 
                : [...prev, filter]
        );
    };

        // --- Dynamic Filtering Logic ---
        const filteredProducts = useMemo(() => {
            console.log('--- Filtering Debug ---');
            console.log('All Products:', products);
            console.log('Current Group Config:', currentGroup);
            console.log('Selected Filters:', selectedFilters);
    
            if (!products || !currentGroup) return [];
    
            // Case 1: Group with complex sub-filters (checkboxes)
            if (currentGroup.filters && currentGroup.filters.length > 0) {
                if (selectedFilters.length === 0) {
                    console.log('No filters selected, returning empty array.');
                    return []; // Correct: Nothing selected, show nothing
                }
                const activeFilterCriteria = currentGroup.filters.filter(f => selectedFilters.includes(f.name));
                console.log('Active Filter Criteria:', activeFilterCriteria);
    
                const results = products.filter(product => {
                    if (!product.linea || !product.clave) {
                        // console.log(`Product missing linea or clave: ${JSON.stringify(product)}`);
                        return false;
                    }
                const match = activeFilterCriteria.some(criteria => {
                    const lineaMatch = product.linea.trim() === criteria.linea;
                    const claveMatch = String(product.clave).trim().startsWith(criteria.prefix);
                    // console.log(`Product: ${product.clave}, Linea: ${product.linea} | Criteria: ${criteria.name}, Linea: ${criteria.linea}, Prefix: ${criteria.prefix} | Linea Match: ${lineaMatch}, Clave Match: ${claveMatch}`);
                    return lineaMatch && claveMatch;
                });                    // if (!match) console.log(`Product ${product.clave} did not match any active criteria.`);
                    return match;
                });
                console.log('Filtered Results (Case 1):', results);
                return results;
            }
    
            // Case 2: Group filtered by a single 'linea'
            if (currentGroup.linea) {
                const results = products.filter(product => product.linea && product.linea.trim() === currentGroup.linea);
                console.log('Filtered Results (Case 2 - by linea):', results);
                return results;
            }
    
            // Case 3: Group filtered by 'category'
            if (currentGroup.category) {
                const results = products.filter(product => product.categoria && product.categoria.trim() === currentGroup.category);
                console.log('Filtered Results (Case 3 - by category):', results);
                return results;
            }
    
            console.log('No matching filter case, returning empty array.');
            return []; // Return empty if no filter matches
        }, [products, selectedFilters, currentGroup]);
    // --- Dynamic Available Filters ---
    const availableFilters = useMemo(() => {
        if (!currentGroup.filters) return []; // Only check if filters are defined

        return currentGroup.filters; // Return all defined filters
    }, [currentGroup]); // Dependency only on currentGroup

    if (isLoading) return <div>Cargando productos...</div>;
    if (error) return <div>Ocurrió un error: {error.message}</div>;

    const hasSubFilters = availableFilters.length > 0;

    return (
        <div className={styles.pageContainer}>
            <aside className={styles.sidebar}>
                {hasSubFilters ? (
                    <>
                        <h2 className={styles.title}>{currentGroup.title || 'Grupo de Productos'}</h2>
                        <h3 className={styles.filterTitle}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={styles.filterIcon} viewBox="0 0 16 16">
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.74.439L7 12.439V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                            </svg>
                            <span>Filtar por tipo</span>
                        </h3>
                        <ul className={styles.filterList}>
                            {availableFilters.map(filter => (
                                <li key={filter.name} className={styles.filterItem}>
                                    <label>
                                        <input 
                                            type="checkbox"
                                            checked={selectedFilters.includes(filter.name)}
                                            onChange={() => handleFilterChange(filter.name)}
                                        />
                                        {filter.name}
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <PromotionalProduct allProducts={products} />
                    </>
                ) : (
                    <ProductosPromocion />
                )}
            </aside>
            <main className={styles.mainContent}>
                {!hasSubFilters && <h2 className={styles.mainContentTitle}>{currentGroup.title}</h2>}
                <ProductTable products={filteredProducts} />
            </main>
        </div>
    );
};

export default ProductGroupPage;