import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ArticuloSugerido from './ArticuloSugerido';
import styles from './HerramientasSugeridas.module.css';

const fetchProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok for products');
  }
  return response.json();
};

const HerramientasSugeridas = () => {
  const { data: sugeridos, isLoading: isLoadingSugeridos, error: errorSugeridos } = useQuery({
    queryKey: ['sugeridos'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sugeridos`);
      if (!response.ok) {
        throw new Error('Network response was not ok for sugeridos');
      }
      return response.json();
    },
  });

  const { data: allProducts, isLoading: isLoadingProducts, error: errorProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  if (isLoadingSugeridos || isLoadingProducts) return <div>Cargando...</div>;
  if (errorSugeridos || errorProducts) return <div>Error: {errorSugeridos?.message || errorProducts?.message}</div>;
  if (!Array.isArray(sugeridos) || sugeridos.length === 0) return <div>No hay productos sugeridos</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.titulo}>Utiliza herramientas para instalar tus sellos y orings de manera precisa y sin dañarlos</h2>
      <div className={styles.listaArticulos}>
        {sugeridos.map((sugerido) => {
          const sugeridoClaveLimpia = sugerido.clave.trim().toUpperCase();
          const productData = allProducts?.find(p => p.clave.trim().toUpperCase() === sugeridoClaveLimpia);

          // If we find the full product data, use it. It's the best-case scenario.
          if (productData) {
            return (
              <ArticuloSugerido
                key={sugerido.id}
                producto={{
                  ...productData, // Use the full, clean data from allProducts
                  clave: sugeridoClaveLimpia, // Ensure the clean clave is used
                  imagen: `/Sugeridos/${sugeridoClaveLimpia}.jpg`,
                }}
              />
            );
          }

          // If not found, fallback to the original 'sugerido' data, but with a clean clave for the Link.
          // This preserves the display of the item and fixes the link.
          return (
            <ArticuloSugerido
              key={sugerido.id}
              producto={{
                ...sugerido,
                clave: sugeridoClaveLimpia, // Use the cleaned clave for the Link
                precio: 'N/A', // We couldn't find the price
                imagen: `/Sugeridos/${sugeridoClaveLimpia}.jpg`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HerramientasSugeridas;
