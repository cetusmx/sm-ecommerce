import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import HeroSection from "@/components/features/home/HeroSection";
import SpecSearchBlock from "@/components/features/search/SpecSearchBlock";
import FeaturedProducts from "@/components/features/product/FeaturedProducts";
import ProductFilter from "@/components/features/product/ProductFilter.js";
import PromosPrincipales from "@/components/features/home/PromosPrincipales";
import ProductosPorUbicacion from "@/components/features/home/ProductosPorUbicacion";
import SearchResults from "@/components/features/product/SearchResults";
import GlobalSearchResultsComponent from "@/components/features/product/GlobalSearchResultsComponent";
import ProductosVistos from "@/components/features/product/ProductosVistos";
import useDebounce from "@/hooks/useDebounce";
import { useAuth } from "@/context/AuthContext";

import { fetchProducts } from "@/api/productsApi";

const HomePage = ({ globalSearchQuery, setGlobalSearchQuery, onClearProductFilter, productFilterKey }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [globalFilteredProducts, setGlobalFilteredProducts] = useState([]);
  const queryClient = useQueryClient();

  const initialFilters = useMemo(() => ({
    diamInt: searchParams.get('diamInt') || '',
    diamExt: searchParams.get('diamExt') || '',
    altura: searchParams.get('altura') || '',
    medida: searchParams.get('medida') || 'Pulgadas',
    sello: searchParams.get('sello') || 'Todos',
  }), [searchParams]);

  const [filters, setFilters] = useState(initialFilters);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchUpdateId, setSearchUpdateId] = useState(0);

  const debouncedFilters = useDebounce(filters, 400);

  const { data: products, isLoading, error } = useQuery({ 
    queryKey: ['products'], 
    queryFn: fetchProducts 
  });

  const { currentUser } = useAuth();

  const viewedProducts = queryClient.getQueryData(['productosVistos', currentUser?.email]);

  // Effect for global search
  useEffect(() => {
    if (globalSearchQuery && products) {
      // Clear product filter when global search is active
      if (onClearProductFilter) {
        onClearProductFilter();
      }
      const lowerCaseQuery = globalSearchQuery.toLowerCase();
      const filtered = products.filter(p => !(p.existencia == 0 && !p.ultima_compra)).filter(product => {
        const { descripcion, clave, categoria, material, observaciones } = product;
        return (
          (clave && clave.toLowerCase().includes(lowerCaseQuery)) ||
          (descripcion && descripcion.toLowerCase().includes(lowerCaseQuery)) ||
          (categoria && categoria.toLowerCase().includes(lowerCaseQuery)) ||
          (material && material.toLowerCase().includes(lowerCaseQuery)) ||
          (observaciones && observaciones.toLowerCase().includes(lowerCaseQuery))
        );
      });

      filtered.sort((a, b) => {
        const aClave = a.clave?.toLowerCase() || '';
        const bClave = b.clave?.toLowerCase() || '';
        const aDesc = a.descripcion?.toLowerCase() || '';
        const bDesc = b.descripcion?.toLowerCase() || '';

        const aClaveExact = aClave === lowerCaseQuery;
        const bClaveExact = bClave === lowerCaseQuery;
        if (aClaveExact && !bClaveExact) return -1;
        if (!aClaveExact && bClaveExact) return 1;

        const aClaveStartsWith = aClave.startsWith(lowerCaseQuery);
        const bClaveStartsWith = bClave.startsWith(lowerCaseQuery);
        if (aClaveStartsWith && !bClaveStartsWith) return -1;
        if (!aClaveStartsWith && bClaveStartsWith) return 1;

        const aClaveIncludes = aClave.includes(lowerCaseQuery);
        const bClaveIncludes = bClave.includes(lowerCaseQuery);
        if (aClaveIncludes && !bClaveIncludes) return -1;
        if (!aClaveIncludes && bClaveIncludes) return 1;

        const aDescStartsWith = aDesc.startsWith(lowerCaseQuery);
        const bDescStartsWith = bDesc.startsWith(lowerCaseQuery);
        if (aDescStartsWith && !bDescStartsWith) return -1;
        if (!aDescStartsWith && bDescStartsWith) return 1;

        const aDescIncludes = aDesc.includes(lowerCaseQuery);
        const bDescIncludes = bDesc.includes(lowerCaseQuery);
        if (aDescIncludes && !bDescIncludes) return -1;
        if (!aDescIncludes && bDescIncludes) return 1;

        return 0;
      });
      setGlobalFilteredProducts(filtered);
    } else {
      setGlobalFilteredProducts([]);
    }
  }, [globalSearchQuery, products]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value && value !== 'Todos' && value !== 'Pulgadas') {
        newSearchParams.set(key, value);
      }
    });
    setSearchParams(newSearchParams, { replace: true });

    const hasActiveFilters = debouncedFilters.diamInt || debouncedFilters.diamExt || debouncedFilters.altura || (debouncedFilters.sello && debouncedFilters.sello !== 'Todos');
    setIsSearching(hasActiveFilters);

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
          } else {
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
          } else {
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
  }, [debouncedFilters, products, setSearchParams]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    setGlobalSearchQuery(''); // Clear global search results when product filter is used
  };

  const handleClearProductFilter = () => {
    setFilters(initialFilters); // Reset filters to initial state
    setIsSearching(false); // Stop showing search results
    setSearchResults([]); // Clear previous search results
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Ocurrió un error: {error.message}</div>;

  return (
    <div className="home-page-wrapper">
      <ProductFilter 
        key={productFilterKey} // Add key to force remount/reset
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {globalSearchQuery ? (
        <div className="fade-in">
          <GlobalSearchResultsComponent 
            results={globalFilteredProducts} 
            searchQuery={globalSearchQuery} 
          />
        </div>
      ) : isSearching ? (
        <div className="fade-in">
          <SearchResults 
            results={searchResults} 
            searchUpdateId={searchUpdateId} 
            selectedCategory={debouncedFilters.sello}
          />
        </div>
      ) : (
        <div className="fade-in default-home-content">
          <HeroSection />
          <main className="main-content">
            <PromosPrincipales />
          </main>
          {products && <ProductosPorUbicacion products={products} />}
          {/* <FeaturedProducts /> */}
          {viewedProducts && viewedProducts.length > 0 && (
            <div style={{ padding: '0 20px' }}>
              <ProductosVistos viewedProducts={viewedProducts} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;