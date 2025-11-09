const applyProductRules = (product) => {
  let newPrecio = product.precio;
  let newCantPorEmpaque = product.cant_por_empaque;
  let newCantidadMinima = product.cantidad_minima;

  if (newPrecio < 0.50) {
    newPrecio = 1;
    newCantPorEmpaque = 10;
    newCantidadMinima = 10;
  } else if (newPrecio >= 0.50 && newPrecio < 1) {
    newPrecio = 2;
    newCantPorEmpaque = 5;
    newCantidadMinima = 5;
  } else if (newPrecio >= 1 && newPrecio < 2) {
    newPrecio = 2.5;
    newCantPorEmpaque = 4;
    newCantidadMinima = 4;
  } else if (newPrecio >= 2 && newPrecio < 3) {
    newPrecio = 3.5;
    newCantPorEmpaque = 4;
    newCantidadMinima = 4;
  } else if (newPrecio >= 3 && newPrecio < 4) {
    // Mantener el mismo precio
    newCantPorEmpaque = 4;
    newCantidadMinima = 4;
  } else if (newPrecio >= 4 && newPrecio < 5) {
    // Mantener el mismo precio
    newCantPorEmpaque = 3;
    newCantidadMinima = 3;
  } else if (newPrecio >= 5 && newPrecio < 10) {
    // Mantener el mismo precio
    newCantPorEmpaque = 2;
    newCantidadMinima = 2;
  } else if (newPrecio >= 10) {
    // Mantener el mismo precio
    newCantPorEmpaque = 1;
    newCantidadMinima = 1;
  }

  return {
    ...product,
    precio: newPrecio,
    cant_por_empaque: newCantPorEmpaque,
    cantidad_minima: newCantidadMinima,
  };
};

export const fetchProducts = async () => {
  console.log("fetchProducts: START fetching products."); // Log start
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const products = await response.json();

  const processedProducts = products
    .filter(product => product.ultima_compra != null &&
                       !product.observaciones?.toLowerCase().includes('revisar') &&
                       product.precio > product.ultimo_costo)
    .map(applyProductRules);

  console.log("fetchProducts: END fetching products. Number of products:", processedProducts.length); // Log end and count
  return processedProducts;
};

export const fetchProductByClave = async (clave) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos/${clave}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error('Network response was not ok');
  }
  const product = await response.json();
  return applyProductRules(product);
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
