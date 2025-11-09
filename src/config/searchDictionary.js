// La importación de wordlist.txt ha sido eliminada y reemplazada por un array incrustado.


export const getCanonicalStems = (text) => {
    if (!text) return [];
    return String(text).toLowerCase().split(/\s+/).filter(word => word.length > 0);
};


/**
 * Crea el objeto de búsqueda para un solo producto.
 * @param {object} product El producto original.
 * @returns {object} Un objeto con clave, texto de búsqueda normalizado y el producto original.
 */
export const normalizeProductForSearch = (product) => {
    const searchableText = [
      product.clave,
      product.descripcion,
    ].filter(Boolean).join(' ').toLowerCase(); // Combine clave and descripcion, filter out null/undefined, and convert to lowercase
  
    return {
      clave: product.clave,
      searchableText: searchableText,
      originalProduct: product, 
    };
  };
