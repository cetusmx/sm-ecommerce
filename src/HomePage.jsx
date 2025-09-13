import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/features/home/HeroSection";
import SpecSearchBlock from "@/components/features/search/SpecSearchBlock";
import FeaturedProducts from "@/components/features/product/FeaturedProducts";
import ProductFilter from "@/components/features/product/ProductFilter.js";
import PromosPrincipales from "@/components/features/home/PromosPrincipales";
import CarouselCategorias from "@/components/features/home/CarouselCategorias";
import SearchResults from "@/components/features/product/SearchResults";
import useDebounce from "@/hooks/useDebounce";
import "@/styles/global.css";

const fetchProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Ocurrió un error: {error.message}</div>;

  return (
    <div className="home-page-container">
      <ProductFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {isSearching ? (
        <div className="fade-in">
          <SearchResults 
            results={searchResults} 
            searchUpdateId={searchUpdateId} 
            selectedCategory={debouncedFilters.sello}
          />
        </div>
      ) : (
        <div className="fade-in">
          <HeroSection />
          <main className="main-content">
            <PromosPrincipales />
          </main>
          <CarouselCategorias />
          <FeaturedProducts />
        </div>
      )}
    </div>
  );
};

export default HomePage;