import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api/productsApi';
import { FiChevronLeft, FiXCircle, FiFilter } from 'react-icons/fi';
import styles from './OringsPage.module.css';
import PromoProductDisplay from '@/components/common/PromoProductDisplay';
import MaterialIllustrator from '@/components/features/product/MaterialIllustrator';
import CordonesSearchResults from '@/components/features/product/CordonesSearchResults';
import cordon1 from "@/assets/cordon1.jpg";
import cordon2 from "@/assets/cordon2.jpg";

const CordonesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // State is now derived from URL search params
    const selectedMeasurementSystem = searchParams.get('system');

    const [searchResults, setSearchResults] = useState(null);
    const [showMaterialIllustrator, setShowMaterialIllustrator] = useState(true);

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    });

    const estandarProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p =>
            p.linea === 'CRSNR' &&
            (p.existencia > 0 || p.ultima_compra !== null)
        );
    }, [products]);

    const milimetricoProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p =>
            p.linea === 'CRMNR' &&
            (p.existencia > 0 || p.ultima_compra !== null)
        );
    }, [products]);

    // This useEffect handles the filtering logic whenever the URL or products data changes.
    useEffect(() => {
        if (products) {
            setShowMaterialIllustrator(false);
            let results = [];
            if (selectedMeasurementSystem === 'Estándar') {
                results = estandarProducts;
            } else if (selectedMeasurementSystem === 'Milimétrico') {
                results = milimetricoProducts;
            }
            setSearchResults(results.sort((a, b) => a.seccion.localeCompare(b.seccion, undefined, { numeric: true })));
        } else {
            setShowMaterialIllustrator(true);
            setSearchResults(null);
        }
    }, [selectedMeasurementSystem, products, estandarProducts, milimetricoProducts]); // Dependencies drive the search

    // Click handlers now update the URL search params
    const handleSystemClick = (system) => {
        const newParams = new URLSearchParams();
        if (selectedMeasurementSystem !== system) {
            newParams.set('system', system);
        }
        setSearchParams(newParams);
    };

    return (
      <div className={styles.pageContainer}>
        <div className={styles.leftColumn}>
          <aside className={styles.sidebar}>
            <h2 className={styles.mainFilterTitle}>Cordones</h2>
            <h3 className={styles.filterTitle}>
              <FiFilter className={styles.filterIcon} /> Sistema de medición
            </h3>
            <div className={styles.filterButtonContainer}>
              <a href="#" className={`${styles.filterButton} ${selectedMeasurementSystem === "Estándar" ? styles.selectedButton : ''}`} onClick={(e) => { e.preventDefault(); handleSystemClick("Estándar"); }}>
                <span className={styles.iconContainer}>
                  {selectedMeasurementSystem === "Estándar" && (<FiChevronLeft className={styles.chevron} />)}
                </span>
                <span className={styles.filterText}>Estándar</span>
              </a>
              <a href="#" className={`${styles.filterButton} ${selectedMeasurementSystem === "Milimétrico" ? styles.selectedButton : ''}`} onClick={(e) => { e.preventDefault(); handleSystemClick("Milimétrico"); }}>
                <span className={styles.iconContainer}>
                  {selectedMeasurementSystem === "Milimétrico" && (<FiChevronLeft className={styles.chevron} />)}
                </span>
                <span className={styles.filterText}>Milimétrico</span>
              </a>

              {selectedMeasurementSystem !== null && (
                <button className={styles.clearFiltersButton} onClick={() => setSearchParams({})}>
                  <FiXCircle className={styles.clearIcon} />
                  <span className={styles.clearText}>Limpiar Filtros</span>
                </button>
              )}
            </div>
          </aside>
          <div className={styles.promoSection}>
            <PromoProductDisplay />
          </div>
        </div>
        <main className={styles.mainContent}>
          {searchResults && searchResults.length > 0 && (
            <CordonesSearchResults
              results={searchResults}
            />
          )}
          {searchResults && searchResults.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
          {!searchResults && showMaterialIllustrator && (
            <div>
              <MaterialIllustrator />
            </div>
          )}
        </main>
      </div>
    );
};

export default CordonesPage;
