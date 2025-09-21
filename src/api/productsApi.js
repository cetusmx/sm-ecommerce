export const fetchProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const products = await response.json();
  return products.filter(product => !product.observaciones?.toLowerCase().includes('revisar'));
};
