export const fetchProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const products = await response.json();
  return products.filter(product => !product.observaciones?.toLowerCase().includes('revisar'));
};

export const fetchProductByClave = async (clave) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos/${clave}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error('Network response was not ok');
  }
  return response.json();
};


export const fetchProductsByClaves = async (claves) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos/claves`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ claves }),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
