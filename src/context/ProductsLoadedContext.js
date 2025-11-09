import React, { createContext, useContext } from 'react';

const ProductsLoadedContext = createContext(null);

export const useProductsLoaded = () => {
  const context = useContext(ProductsLoadedContext);
  if (!context) {
    throw new Error('useProductsLoaded must be used within a ProductsLoadedProvider');
  }
  return context;
};

export const ProductsLoadedProvider = ({ children, value }) => {
  return (
    <ProductsLoadedContext.Provider value={value}>
      {children}
    </ProductsLoadedContext.Provider>
  );
};
