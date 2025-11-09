import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '@/api/productsApi';
import ProductTable from '@/components/features/product/ProductTable';
import OringsProductTable from '@/components/features/product/OringsProductTable';
import FichaTecnica from '@/components/features/product/FichaTecnica';
import MaterialIllustrator from '@/components/features/product/MaterialIllustrator';
import AnuncioPuntual from '@/components/common/AnuncioPuntual';
import ProductosPromocion from '@/components/features/product/ProductosPromocion';
import styles from './ProductGroupPage.module.css';
import MaterialFilterBar from '@/components/features/product/MaterialFilterBar';

import ScrollToTopButton from '@/components/common/ScrollToTopButton';

// Helper function to fetch promotional products
const fetchProductosPromocion = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/productospromocion`);
    if (!response.ok) {
        throw new Error('Network response was not ok for promotional products');
    }
    return response.json();
};

// --- PromotionalProduct Component (Optimized) ---
const PromotionalProduct = ({ allProducts }) => {
    const { data: promotionalProducts, isLoading: isLoadingPromotions, error: errorPromotions } = useQuery({
        queryKey: ['promotionalProducts'],
        queryFn: fetchProductosPromocion,
    });

    if (isLoadingPromotions) {
        return <div className={styles.promoLoading}>Cargando promoción...</div>;
    }

    if (errorPromotions || !promotionalProducts || promotionalProducts.length === 0 || !allProducts) {
        return null;
    }

    let originalProduct = null;
    const promoProduct = promotionalProducts.find(promo => {
        originalProduct = allProducts.find(p => p.clave === promo.clave);
        return !!originalProduct;
    });

    if (!promoProduct || !originalProduct) {
        return null;
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
        linea: 'HER'
    },
    'estuches-orings': {
        title: 'Estuches de Orings',
        category: 'Estuches'
    },
    'orings-respaldos': {
        title: 'Orings y Respaldos',
        baseFilter: { perfil: ['ORING', 'RESPALDO'] },
        hierarchy: [
            {
                name: 'sistema_medicion',
                options: [
                    {
                        value: 'std',
                        label: 'Estándar',
                        children: [
                            {
                                name: 'perfil',
                                options: [
                                    {
                                        value: 'ORING',
                                        label: 'Orings',
                                        children: [
                                            {
                                                name: 'seccion_oring',
                                                label: 'Secciones',
                                                options: [
                                                    { value: '0.062', label: '1/16' },
                                                    { value: '0.093', label: '3/32' },
                                                    { value: '0.125', label: '1/8' },
                                                    { value: '0.187', label: '3/16' },
                                                    { value: '0.25', label: '1/4' }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        value: 'RESPALDO',
                                        label: 'Respaldos',
                                        children: [
                                            {
                                                name: 'seccion_respaldo',
                                                label: 'Secciones',
                                                options: [
                                                    { value: '0.062', label: '1/16' },
                                                    { value: '0.093', label: '3/32' },
                                                    { value: '0.125', label: '1/8' },
                                                    { value: '0.187', label: '3/16' },
                                                    { value: '0.25', label: '1/4' }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        value: 'mm',
                        label: 'Milimétricos',
                        children: [
                            {
                                name: 'perfil',
                                options: [
                                    {
                                        value: 'ORING',
                                        label: 'Orings',
                                        children: [
                                            {
                                                name: 'seccion_oring',
                                                label: 'Secciones (mm)',
                                                options: [
                                                    { value: '1', label: '1' },
                                                    { value: '1.2', label: '1.2' },
                                                    { value: '1.3', label: '1.3' },
                                                    { value: '1.5', label: '1.5' },
                                                    { value: '1.9', label: '1.9' },
                                                    { value: '2', label: '2' },
                                                    { value: '2.4', label: '2.4' },
                                                    { value: '2.5', label: '2.5' },
                                                    { value: '3', label: '3' },
                                                    { value: '3.1', label: '3.1' },
                                                    { value: '3.5', label: '3.5' },
                                                    { value: '4', label: '4' },
                                                    { value: '4.5', label: '4.5' },
                                                    { value: '5', label: '5' },
                                                    { value: '5.5', label: '5.5' },
                                                    { value: '5.7', label: '5.7' },
                                                    { value: '6', label: '6' },
                                                    { value: '7', label: '7' }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

const findNode = (name, levels) => {
    for (const level of levels) {
        if (level.name === name) return level;
        if (level.options) {
            for (const option of level.options) {
                if (option.children) {
                    const found = findNode(name, option.children);
                    if (found) return found;
                }
            }
        }
    }
    return null;
};

const materialLabelMap = {
    'FKM': 'Vitón dureza 75 (FKM)',
    'NBR': 'Nitrilo dureza 70',
    'NBRH': 'Nitrilo Hidrogenado (NBRH)'
};

// --- Main ProductGroupPage Component (Dynamic) ---
const ProductGroupPage = () => {
    const { groupName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentGroup = filterConfig[groupName] || {};
    const [isMounted, setIsMounted] = useState(false);

    const [expandedFilters, setExpandedFilters] = useState([]);

    // State for hierarchical filters
    const [hierarchicalFilters, setHierarchicalFilters] = useState(() => {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            if (key !== 'filtros' && key !== 'materials') {
                params[key] = value;
            }
        }
        return params;
    });

    // State for legacy checkbox filters
    const [legacyFilters, setLegacyFilters] = useState(() => {
        const filtrosFromUrl = searchParams.get('filtros');
        return filtrosFromUrl ? filtrosFromUrl.split(',') : [];
    });

        // State for material filters
        const [materialFilters, setMaterialFilters] = useState(() => {
            const materialsFromUrl = searchParams.get('materials');
            return materialsFromUrl ? materialsFromUrl.split(',') : [];
        });
    
        const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    
        useEffect(() => {
            const timer = setTimeout(() => {
                setIsMounted(true);
            }, 50);
            return () => clearTimeout(timer);
        }, []);
    
        const { data: products, isLoading, error } = useQuery({
            queryKey: ['products'],
            queryFn: fetchProducts
        });
    
        // Sync all filter states with URL search params
        useEffect(() => {
            const newSearchParams = {};
            Object.entries(hierarchicalFilters).forEach(([key, value]) => {
                if (value) newSearchParams[key] = value;
            });
            if (legacyFilters.length > 0) {
                newSearchParams.filtros = legacyFilters.join(',');
            }
            if (materialFilters.length > 0) {
                newSearchParams.materials = materialFilters.join(',');
            }
            setSearchParams(newSearchParams, { replace: true });
        }, [hierarchicalFilters, legacyFilters, materialFilters, setSearchParams]);
    
        // Effect to set default material filter when a section is selected for orings-respaldos
        useEffect(() => {
            if (groupName === 'orings-respaldos') {
                const isSectionSelected = hierarchicalFilters.seccion_oring || hierarchicalFilters.seccion_respaldo;
                if (isSectionSelected && materialFilters.length === 0) {
                    setMaterialFilters(['NBR']);
                } else if (!isSectionSelected && materialFilters.length > 0) {
                    // If no section is selected, clear material filters
                    setMaterialFilters([]);
                }
            } else {
                // For other groups, ensure material filters are cleared if they were set by orings logic
                if (materialFilters.length > 0) {
                    setMaterialFilters([]);
                }
            }
        }, [hierarchicalFilters, groupName, materialFilters]); // Added materialFilters to dependencies
    
        const handleSort = (key) => {
            let direction = 'ascending';
            if (sortConfig.key === key && sortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        };    
        const handleToggleExpand = (filterName, filterValue) => {
            setExpandedFilters(prev => {
                let newExpanded = [...prev];
    
                const filterLevel = findNode(filterName, currentGroup.hierarchy);
                if (filterLevel && filterLevel.options) {
                    const siblings = filterLevel.options.filter(o => o.value !== filterValue);
                    siblings.forEach(sibling => {
                        const index = newExpanded.indexOf(sibling.value);
                        if (index > -1) {
                            newExpanded.splice(index, 1);
                        }
                    });
                }
    
                if (newExpanded.includes(filterValue)) {
                    newExpanded = newExpanded.filter(f => f !== filterValue);
                } else {
                    newExpanded.push(filterValue);
                }
    
                return newExpanded;
            });
        };
    
        const handleHierarchicalFilterChange = (filterName, value) => {
            setHierarchicalFilters(prev => {
                const newFilters = { ...prev };
    
                if (newFilters[filterName] === value) {
                    delete newFilters[filterName];
                }
                else {
                    newFilters[filterName] = value;
                }
        
                const getChildFilterNames = (node) => {
                    let names = [];
                    if (node && node.options) {
                        for (const option of node.options) {
                            if (option.children) {
                                for (const child of option.children) {
                                    if (!names.includes(child.name)) {
                                        names.push(child.name);
                                    }
                                    names = names.concat(getChildFilterNames(child));
                                }
                            }
                        }
                    }
                    return names;
                };
        
                const currentNode = findNode(filterName, currentGroup.hierarchy);
                if (currentNode) {
                    const childNames = getChildFilterNames(currentNode);
                    for (const name of childNames) {
                        delete newFilters[name];
                    }
                }
        
                return newFilters;
            });
        };
    
        const handleFilterAndExpand = (name, value) => {
            handleToggleExpand(name, value);
            handleHierarchicalFilterChange(name, value);
        };
    
        const handleLegacyFilterChange = (filter) => {
            setLegacyFilters(prev => 
                prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
            );
        };
    
        const handleMaterialFilterChange = (material) => {
            setMaterialFilters(prev => {
                // If the clicked material is already the selected one, deselect it.
                if (prev.length === 1 && prev[0] === material) {
                    return [];
                }
                // Otherwise, select the clicked material.
                return [material];
            });
        };
    
        const handleClearFilters = () => {
            setHierarchicalFilters({});
            setLegacyFilters([]);
            setMaterialFilters([]);
            setExpandedFilters([]);
        };
    
                const dimensionallyFilteredProducts = useMemo(() => {
                    if (!products || !currentGroup) return [];
        
                    // Para orings-respaldos, si no se ha seleccionado ninguna sección, no mostrar productos.
                    if (groupName === 'orings-respaldos' && !hierarchicalFilters.seccion_oring && !hierarchicalFilters.seccion_respaldo) {
                        return [];
                    }
        
                    let filtered = [...products];    
            // Apply base filter if it exists
            if (currentGroup.baseFilter) {
                Object.entries(currentGroup.baseFilter).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        filtered = filtered.filter(p => p[key] && value.includes(p[key]));
                    } else {
                        filtered = filtered.filter(p => p[key] === value);
                    }
                });
            }
    
            // Apply hierarchical filters
            if (currentGroup.hierarchy) {
                const { sistema_medicion, perfil, seccion_oring, seccion_respaldo } = hierarchicalFilters;
    
                if (sistema_medicion) {
                    filtered = filtered.filter(p => p.sistema_medicion && p.sistema_medicion.trim() === sistema_medicion);
                }
    
                if (perfil) {
                    filtered = filtered.filter(p => p.perfil && p.perfil.trim() === perfil);
                }
    
                if (seccion_oring) {
                    filtered = filtered.filter(p => p.seccion && p.seccion.trim() === seccion_oring);
                } else if (seccion_respaldo) {
                    filtered = filtered.filter(p => p.seccion && p.seccion.trim() === seccion_respaldo);
                }
            }
    
            // Apply legacy filters (for other groups)
            if (currentGroup.filters && currentGroup.filters.length > 0) {
                if (legacyFilters.length === 0) return [];
                const activeFilterCriteria = currentGroup.filters.filter(f => legacyFilters.includes(f.name));
                filtered = filtered.filter(product => {
                    return activeFilterCriteria.some(criteria => {
                        const lineaMatch = product.linea && product.linea.trim() === criteria.linea;
                        const claveMatch = product.clave && String(product.clave).trim().startsWith(criteria.prefix);
                        return lineaMatch && claveMatch;
                    });
                });
            }
            // Apply direct linea/category filters (for other groups)
            if (currentGroup.linea) {
                filtered = filtered.filter(product => product.linea && product.linea.trim() === currentGroup.linea);
            }
            if (currentGroup.category) {
                filtered = filtered.filter(product => product.categoria && product.categoria.trim() === currentGroup.category);
            }
    
            return filtered;
        }, [products, hierarchicalFilters, legacyFilters, currentGroup]);
    
        const sortedProducts = useMemo(() => {
            let sortableProducts = [...dimensionallyFilteredProducts];
            if (sortConfig.key) {
                sortableProducts.sort((a, b) => {
                    let aValue = a[sortConfig.key];
                    let bValue = b[sortConfig.key];
    
                    // Handle numerical columns for Orings and Respaldos
                    if (groupName === 'orings-respaldos' && (sortConfig.key === 'diam_int' || sortConfig.key === 'diam_ext')) {
                        aValue = parseFloat(aValue);
                        bValue = parseFloat(bValue);
                        // Treat NaN as smallest value to push them to the end if ascending, or beginning if descending
                        if (isNaN(aValue)) aValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
                        if (isNaN(bValue)) bValue = sortConfig.direction === 'ascending' ? Infinity : -Infinity;
                    }
    
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });
            }
            return sortableProducts;
        }, [dimensionallyFilteredProducts, sortConfig, groupName]);
    
        const availableMaterials = useMemo(() => {
            if (!sortedProducts || !currentGroup.hierarchy) return [];
            const allMaterials = sortedProducts
                .map(p => p.material && p.material.trim())
                .filter(Boolean);
            return [...new Set(allMaterials)].sort();
        }, [sortedProducts, currentGroup]);
    
            // Effect to clean up material filters if they become invalid
            useEffect(() => {
                if (availableMaterials.length > 0) {
                    setMaterialFilters(prev => prev.filter(m => availableMaterials.includes(m)));
                }
            }, [availableMaterials]);
        
            // Effect to set default sort order for orings
            useEffect(() => {
                if (groupName === 'orings-respaldos') {
                    setSortConfig({ key: 'diam_int', direction: 'ascending' });
                } else {
                    setSortConfig({ key: null, direction: 'ascending' }); // Reset for other groups
                }
            }, [groupName]);
        
            const materialFilteredProducts = useMemo(() => {
                if (!sortedProducts) return [];
                if (materialFilters.length > 0) {
                    return sortedProducts.filter(p => p.material && materialFilters.includes(p.material.trim()));            }
            return sortedProducts;
        }, [sortedProducts, materialFilters]);
    
        const renderHierarchicalFilters = (hierarchy, currentFilters, level = 0) => {
            if (!hierarchy) return null;
        
            return hierarchy.map(levelData => {
                const { name, label, options } = levelData;
                const selectedValue = currentFilters[name];
    
                if (name.startsWith('seccion')) {
                    const groupedSections = options.reduce((acc, option) => {
                        const integerPart = Math.floor(parseFloat(option.value));
                        if (!acc[integerPart]) {
                            acc[integerPart] = [];
                        }
                        acc[integerPart].push(option);
                        return acc;
                    }, {});
    
                    return (
                        <div key={name} className={styles.filterGroup}>
                            {label && <h4 className={styles.filterSubtitle} style={{fontSize: '0.9em', paddingLeft: `${level * 20}px`, fontStyle: 'italic'}}>{label}</h4>}
                            {Object.entries(groupedSections).map(([groupKey, groupOptions]) => (
                                <div key={groupKey} className={styles.sectionGroup}>
                                    <ul className={styles.horizontalFilterList}>
                                        {groupOptions.map(option => {
                                            const isSelected = selectedValue === option.value;
                                            return (
                                                <li key={option.value} className={styles.horizontalFilterItem}>
                                                    <label className={`${styles.filterItemLabel} ${isSelected ? styles.selectedLabel : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            name={name}
                                                            value={option.value}
                                                            checked={isSelected}
                                                            onChange={() => handleHierarchicalFilterChange(name, option.value)}
                                                        />
                                                        {option.label}
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    );
                }
        
                return (
                    <div key={name} className={styles.filterGroup}>
                        {label && <h4 className={styles.filterSubtitle} style={{fontSize: label === 'Sistema de Medición' ? '1.2em' : '1em'}}>{label}</h4>}
                        <ul className={styles.filterList}>
                            {options.map(option => {
                                const isSelected = selectedValue === option.value;
                                if (level < 2) { // First two levels with expandable buttons
                                    const isExpanded = expandedFilters.includes(option.value);
                                    return (
                                        <li key={option.value} className={styles.filterItem} style={{ paddingLeft: `${level * 20}px` }}>
                                            <div 
                                                onClick={() => handleFilterAndExpand(name, option.value)} 
                                                className={`${styles.expandableFilter} ${isSelected ? styles.selectedFilter : ''}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span className={styles.expandIcon}>{isExpanded ? '-' : '+'}</span>
                                                <span>{option.label}</span>
                                            </div>
                                            {isExpanded && option.children && renderHierarchicalFilters(option.children, currentFilters, level + 1)}
                                        </li>
                                    );
                                } else { // Nested levels with radio buttons
                                    return (
                                        <li key={option.value} className={styles.filterItem} style={{ paddingLeft: `${level * 20}px` }}>
                                            <label className={isSelected ? styles.selectedLabel : ''}>
                                                <input
                                                    type="radio"
                                                    name={name}
                                                    value={option.value}
                                                    checked={isSelected}
                                                    onChange={() => handleHierarchicalFilterChange(name, option.value)}
                                                />
                                                {option.label}
                                            </label>
                                            {isSelected && option.children && renderHierarchicalFilters(option.children, currentFilters, level + 1)}
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                );
            });
        };
    
        if (isLoading) return <div>Cargando productos...</div>;
        if (error) return <div>Ocurrió un error: {error.message}</div>;
    
        const hasSubFilters = (currentGroup.filters && currentGroup.filters.length > 0) || currentGroup.hierarchy;
        const areFiltersActive = Object.keys(hierarchicalFilters).length > 0 || legacyFilters.length > 0 || materialFilters.length > 0;
    
        return (
            <div className={`${styles.pageContainer} ${isMounted ? styles.mounted : ''}`}>
                <div className={styles.sidebarContainer}>
                    <aside className={styles.sidebar}>
                        {hasSubFilters ? (
                            <>
                                <h2 className={styles.title}>{currentGroup.title || 'Grupo de Productos'}</h2>
                                
                                <h3 className={styles.filterTitle}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={styles.filterIcon} viewBox="0 0 16 16">
                                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.74.439L7 12.439V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                                    </svg>
                                    <span>Sistema de Medición</span>
                                </h3>
    
                                {currentGroup.hierarchy ? (
                                    renderHierarchicalFilters(currentGroup.hierarchy, hierarchicalFilters)
                                ) : (
                                    <ul className={styles.filterList}>
                                        {currentGroup.filters.map(filter => {
                                            const isSelected = legacyFilters.includes(filter.name);
                                            return (
                                                <li key={filter.name} className={styles.filterItem}>
                                                    <label className={isSelected ? styles.selectedLabel : ''}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleLegacyFilterChange(filter.name)}
                                                        />
                                                        {filter.name}
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
    
                                {areFiltersActive && (
                                    <div className={styles.clearButtonContainer}>
                                        <button onClick={handleClearFilters} className={styles.clearButton}>
                                            Limpiar filtros
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <ProductosPromocion />
                        )}
                    </aside>
                    {hasSubFilters && <PromotionalProduct allProducts={products} />}
                </div>
                <main className={styles.mainContent}>
                    {!hasSubFilters && <h2 className={styles.mainContentTitle}>{currentGroup.title}</h2>}
                    {groupName === 'orings-respaldos' && !hierarchicalFilters.seccion_oring && !hierarchicalFilters.seccion_respaldo && (
                        <>
                            <p className={styles.noProductsInitialMessage}>Comienza a seleccionar filtros para ver los productos.</p>
                            <MaterialIllustrator />
                        </>
                    )}

                    <FichaTecnica materialFilters={materialFilters} filteredProducts={materialFilteredProducts} groupName={groupName} />
                    <MaterialFilterBar
                        availableMaterials={availableMaterials}
                        materialFilters={materialFilters}
                        onMaterialChange={handleMaterialFilterChange}
                    />
                    {groupName === 'orings-respaldos' ? (
                        <OringsProductTable
                            products={materialFilteredProducts}
                            sortConfig={sortConfig}
                            handleSort={handleSort}
                        />
                    ) : (
                        <ProductTable products={materialFilteredProducts} />
                    )}
                </main>
                <ScrollToTopButton />
            </div>
        );
    };
    
    export default ProductGroupPage;