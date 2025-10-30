import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductFilter from "@/components/features/product/ProductFilter.js";
import SearchResults from "@/components/features/product/SearchResults";
import useDebounce from "@/hooks/useDebounce";
import { fetchProducts } from "@/api/productsApi";
import styles from './RetenesPage.module.css';


const RetenesPage = () => {
  const initialFilters = useMemo(() => ({
    diamInt: '',
    diamExt: '',
    altura: '',
    medida: 'Pulgadas',
    sello: 'Retenes',
  }), []);

  const [filters, setFilters] = useState(initialFilters);
  const [searchResults, setSearchResults] = useState([]);
  const [searchUpdateId, setSearchUpdateId] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const debouncedFilters = useDebounce(filters, 400);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    const hasActiveFilters = debouncedFilters.diamInt || debouncedFilters.diamExt || debouncedFilters.altura || (debouncedFilters.sello && debouncedFilters.sello !== 'Todos');

    if (hasActiveFilters && products) {
      const results = products.filter(p => !(p.existencia == 0 && !p.ultima_compra)).filter(p => {
        const medidaValue = debouncedFilters.medida === 'Pulgadas' ? 'std' : 'mm';
        if (p.sistema_medicion !== medidaValue) return false;
        if (debouncedFilters.sello && debouncedFilters.sello !== 'Todos' && p.categoria !== debouncedFilters.sello) return false;

        if (debouncedFilters.diamInt) {
          const filterValue = parseFloat(debouncedFilters.diamInt);
          const productValue = parseFloat(p.diam_int);
          if (isNaN(filterValue) || isNaN(productValue)) return false;
          if (p.categoria === 'Orings') {
            if (productValue !== filterValue) return false;
          } else {
            const tolerance = debouncedFilters.medida === 'Pulgadas' ? 0.035 : 1;
            if (productValue < filterValue - tolerance || productValue > filterValue + (debouncedFilters.medida === 'Pulgadas' ? 0.035 : 0)) return false;
          }
        }

        if (debouncedFilters.diamExt) {
          const filterValue = parseFloat(debouncedFilters.diamExt);
          const productValue = parseFloat(p.diam_ext);
          if (isNaN(filterValue) || isNaN(productValue)) return false;
          if (p.categoria === 'Orings') {
            if (productValue !== filterValue) return false;
          }
           else {
            const tolerance = debouncedFilters.medida === 'Pulgadas' ? 0.035 : 0.5;
            if (productValue < filterValue - tolerance || productValue > filterValue + tolerance) return false;
          }
        }

        if (debouncedFilters.altura) {
          const filterValue = parseFloat(debouncedFilters.altura);
          const productValue = parseFloat(p.altura);
          if (isNaN(filterValue) || isNaN(productValue)) return false;
          if (p.categoria === 'Orings') {
            if (productValue !== filterValue) return false;
          }
           else {
            const tolerance = debouncedFilters.medida === 'Pulgadas' ? 0.012 : 0.5;
            if (productValue < filterValue - tolerance || productValue > filterValue + tolerance) return false;
          }
        }

        return true;
      });
      setSearchResults(results);
      setSearchUpdateId(id => id + 1);
    } else {
      setSearchResults([]);
    }
  }, [debouncedFilters, products]);

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  if (isLoading) return <div>Cargando productos...</div>;
  if (error) return <div>Ocurrió un error: {error.message}</div>;

  return (
    <div className={`${styles.fadeContainer} ${isMounted ? styles.mounted : ''}`}>
      <ProductFilter
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      {searchResults.length > 0 ? (
        <div className="fade-in">
          <SearchResults
            results={searchResults}
            searchUpdateId={searchUpdateId}
            selectedCategory={filters.sello}
          />
        </div>
      ) : (
        <div>No se encontraron retenes con los filtros seleccionados.</div>
      )}
    </div>
  );
};

export default RetenesPage;
