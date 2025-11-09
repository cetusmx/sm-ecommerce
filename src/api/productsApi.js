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
  const startTime = new Date(); // Record start time
  console.log("fetchProducts: START fetching products. Time:", startTime.toISOString()); // Log start time

  // Step 1: Fetch from API
  const fetchStart = new Date();
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  const fetchEnd = new Date();
  console.log("fetchProducts: API Fetch Duration:", fetchEnd.getTime() - fetchStart.getTime(), "ms");

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // Step 2: Parse JSON
  const jsonParseStart = new Date();
  const products = await response.json();
  const jsonParseEnd = new Date();
  console.log("fetchProducts: JSON Parse Duration:", jsonParseEnd.getTime() - jsonParseStart.getTime(), "ms");

  // Step 3: Filter and Map
  const processStart = new Date();
  const processedProducts = products
    .filter(product => product.ultima_compra != null &&
                       !product.observaciones?.toLowerCase().includes('revisar') &&
                       product.precio > product.ultimo_costo)
    .map(applyProductRules);
  const processEnd = new Date();
  console.log("fetchProducts: Filter and Map Duration:", processEnd.getTime() - processStart.getTime(), "ms");

  const endTime = new Date(); // Record end time
  console.log("fetchProducts: END fetching products. Time:", endTime.toISOString(), "Number of products:", processedProducts.length); // Log end time and count
  console.log("fetchProducts: Total Duration:", endTime.getTime() - startTime.getTime(), "ms"); // Log total duration
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
  export const fetchSearchResultsByQuery = async (query) => {
    if (!query) return [];
    const response = await fetch(`${process.env.REACT_APP_API_URL}/productos/search?query=${query}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // If the API returns an object with a message, assume no results and return an empty array
    if (data && typeof data === 'object' && !Array.isArray(data) && data.message) {
      return [];
    }
    return data;
};

export const fetchRetenesGroup = async (filters) => {
  const params = new URLSearchParams();
  // Always include 'Retenes' as the sello
  params.append('sello', 'Retenes');

  for (const key in filters) {
    if (filters[key] && filters[key] !== 'Todos' && filters[key] !== 'Pulgadas' && key !== 'sello') { // Exclude 'sello' from dynamic appending as it's already set
      params.append(key, filters[key]);
    }
  }
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos/filtrar?${params.toString()}`); // Reuse the /productos/filtrar endpoint
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  // Ensure it always returns an array, similar to fetchSearchResultsByQuery
  if (data && typeof data === 'object' && !Array.isArray(data) && data.message) {
    return [];
  }
  return data;
};
