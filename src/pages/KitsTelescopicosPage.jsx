import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { fetchProducts } from '@/api/productsApi';
import styles from './KitsTelescopicosPage.module.css';
import PromoProductDisplay from '@/components/common/PromoProductDisplay';
import ProductTable from '@/components/features/product/ProductTable';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import { FiXCircle } from 'react-icons/fi'; // Import FiXCircle for clear filters

const KitsTelescopicosPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedLine = searchParams.get('linea'); // Get selected linea from URL

    const { data: allProducts, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });

    const kitsTelescopicos = useMemo(() => {
        if (!allProducts) return [];
        let filtered = allProducts.filter(product =>
            product.categoria && product.categoria.trim() === 'Kits telescópicos'
        );

        if (selectedLine) {
            filtered = filtered.filter(product =>
                product.linea && product.linea.trim() === selectedLine
            );
        }
        return filtered;
    }, [allProducts, selectedLine]);

    const uniqueLines = useMemo(() => {
        if (!allProducts) return [];
        const lines = allProducts
            .filter(product => product.categoria && product.categoria.trim() === 'Kits telescópicos')
            .map(product => product.linea && product.linea.trim())
            .filter(Boolean); // Remove null/undefined/empty strings
        return [...new Set(lines)].sort();
    }, [allProducts]);

    const handleLineClick = (line) => {
        const newSearchParams = new URLSearchParams(searchParams);
        if (selectedLine === line) {
            newSearchParams.delete('linea'); // Deselect if already selected
        } else {
            newSearchParams.set('linea', line); // Select new line
        }
        setSearchParams(newSearchParams);
    };

    const handleClearFilters = () => {
        setSearchParams({}); // Clear all search params
    };

    if (isLoading) {
        return <div className={styles.pageContainer}>Cargando kits telescópicos...</div>;
    }

    if (error) {
        return <div className={styles.pageContainer}>Error al cargar los kits telescópicos: {error.message}</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.leftColumn}>
                <aside className={styles.sidebar}>
                    <h2 className={styles.mainFilterTitle}>Kits Telescópicos</h2>
                    <h3 className={styles.filterTitle}>Filtrar por marca</h3>
                    <div className={styles.filterButtonContainer}>
                        {uniqueLines.map(line => (
                            <a
                                key={line}
                                href="#"
                                className={`${styles.filterButton} ${selectedLine === line ? styles.selectedButton : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLineClick(line);
                                }}
                            >
                                <span className={styles.filterText}>{line}</span>
                            </a>
                        ))}
                        {selectedLine && (
                            <button
                                className={styles.clearFiltersButton}
                                onClick={handleClearFilters}
                            >
                                <FiXCircle className={styles.clearIcon} />
                                <span className={styles.clearText}>Limpiar Filtros</span>
                            </button>
                        )}
                    </div>
                    <div className={styles.promoSection}>
                        <hr className={styles.divider} />
                        <PromoProductDisplay />
                    </div>
                </aside>
            </div>
            <main className={styles.mainContent}>
                {kitsTelescopicos.length > 0 ? (
                    <ProductTable products={kitsTelescopicos} />
                ) : (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <p>No se encontraron kits telescópicos con los filtros seleccionados.</p>
                    </div>
                )}
            </main>
            <ScrollToTopButton />
        </div>
    );
};

export default KitsTelescopicosPage;
