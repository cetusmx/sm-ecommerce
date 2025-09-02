import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/features/home/HeroSection";
import SpecSearchBlock from "@/components/features/search/SpecSearchBlock";
import FeaturedProducts from "@/components/features/product/FeaturedProducts";
import ProductFilter from "@/components/features/product/ProductFilter";
import PromosPrincipales from "@/components/features/home/PromosPrincipales";
import CarouselCategorias from "@/components/features/home/CarouselCategorias";
import SearchResults from "@/components/features/product/SearchResults"; // Importar el nuevo componente

import "@/styles/global.css"; // Estilos globales

const fetchProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const HomePage = () => {
  const [filters, setFilters] = useState({
    diamInt: '',
    diamExt: '',
    altura: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: products, isLoading, error } = useQuery({ 
    queryKey: ['products'], 
    queryFn: fetchProducts 
  });

  useEffect(() => {
    const hasFilters = filters.diamInt || filters.diamExt || filters.altura;
    setIsSearching(hasFilters);

    if (hasFilters && products) {
      const results = products.filter(p => {
        let match = true;

        if (filters.diamInt) {
          const filterValue = parseFloat(filters.diamInt);
          const productValue = parseFloat(p.diam_int);
          if (isNaN(filterValue) || isNaN(productValue) || productValue !== filterValue) {
            match = false;
          }
        }

        if (match && filters.diamExt) {
          const filterValue = parseFloat(filters.diamExt);
          const productValue = parseFloat(p.diam_ext);
          if (isNaN(filterValue) || isNaN(productValue) || productValue !== filterValue) {
            match = false;
          }
        }

        if (match && filters.altura) {
          const filterValue = parseFloat(filters.altura);
          const productValue = parseFloat(p.altura);
          if (isNaN(filterValue) || isNaN(productValue) || productValue !== filterValue) {
            match = false;
          }
        }

        return match;
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [filters, products]);

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
        <SearchResults results={searchResults} />
      ) : (
        <>
          <HeroSection />
          <main className="main-content">
            <PromosPrincipales />
          </main>
          <CarouselCategorias />
          {/* <SpecSearchBlock /> */}
          <FeaturedProducts />
        </>
      )}
    </div>
  );
};

export default HomePage;
