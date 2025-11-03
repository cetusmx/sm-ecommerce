import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import HeroSection from "@/components/features/home/HeroSection";
import ProductFilter from "@/components/features/product/ProductFilter.js";
import PromosPrincipales from "@/components/features/home/PromosPrincipales";
import ProductosPorUbicacion from "@/components/features/home/ProductosPorUbicacion";
import GlobalSearchResultsComponent from "@/components/features/product/GlobalSearchResultsComponent";
import ProductosPorUbicacionSkeleton from "@/components/features/home/ProductosPorUbicacionSkeleton";
import ProductosVistos from "@/components/features/product/ProductosVistos";
import { useAuth } from "@/context/AuthContext";
import { fetchProducts } from "@/api/productsApi";

const HomePage = ({ globalSearchQuery, setGlobalSearchQuery, onClearProductFilter, productFilterKey }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const { data: products, isLoading, error } = useQuery({ 
    queryKey: ['products'], 
    queryFn: fetchProducts 
  });

  const { currentUser } = useAuth();

  const viewedProducts = queryClient.getQueryData(['productosVistos', currentUser?.email]);

  // Effect for global search
  useEffect(() => {
    if (globalSearchQuery && products) {
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
  }, [globalSearchQuery, products, onClearProductFilter]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setGlobalSearchQuery(''); 

    const searchParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== 'Todos' && value !== 'Pulgadas') {
        searchParams.set(key, value);
      }
    });
    
    const hasActiveFilters = Object.values(updatedFilters).some(v => v && v !== 'Todos' && v !== 'Pulgadas');

    if (hasActiveFilters) {
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  if (error) return <div>Ocurrió un error: {error.message}</div>;

  return (
    <div className="home-page-wrapper">
      <ProductFilter 
        key={productFilterKey}
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
      ) : (
        <div className="fade-in default-home-content">
          <HeroSection />
          <main className="main-content">
            <PromosPrincipales />
          </main>
          {isLoading ? (
            <ProductosPorUbicacionSkeleton />
          ) : (
            products && <ProductosPorUbicacion products={products} />
          )}
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