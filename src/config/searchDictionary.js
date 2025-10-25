// La importación de wordlist.txt ha sido eliminada y reemplazada por un array incrustado.

// 1. El diccionario de sinónimos que agrupa stems bajo un "canónico".
export const synonyms = {
    'chev': 'chevron',
    'vee': 'chevron',
    'vset': 'chevron',
    'chebr': 'chevron',
    'comm': 'commercial',
    'comer':'commercial',
    'parker': 'commercial',
    'adhes': 'pegamento',
    'pegamen': 'pegamento',
    'cianoacri': 'pegamento',
    'instant': 'pegamento',
    'embol': 'embolo',
    'enbol': 'embolo',
    'pisto': 'embolo',
    'ques': 'embolo',
    'duty': 'heavy_duty',
    'pesad': 'heavy_duty',
    'heav': 'heavy_duty',
    'limp': 'limpiador',
    'rasca': 'limpiador',
    'wipe': 'limpiador',
    'pu': 'poliuretano',
    'poliure': 'poliuretano',
    'uret': 'poliuretano',
    'polyse': 'polyseal',
    'jis': 'polyseal',
    'polypa': 'polyseal',
    'polise': 'polyseal',
    'polipa': 'polyseal',
    'ptb': 'polyseal',
    'vito': 'viton',
    'fkm': 'viton',
    'fluorocarb': 'viton',
    'ganch': 'ganchos',
    'pico': 'ganchos',
    'hiab': 'kit_hiab',
    'hyab': 'kit_hiab',
    'orin': 'orings',
    'o-rin': 'orings',
    'lig': 'orings',
    'pulg': 'pulgadas',
    'inch': 'pulgadas',
    'quadra': 'quadras',
    'cuadra': 'quadras',
    'respal': 'respaldos',
    'backup': 'respaldos',
    'back': 'respaldos',
    'vastag': 'vastago',
    'flech': 'vastago',
    'buffer': 'buffers',
    'bufer': 'buffers',
    'milim': 'milimetros',
    'mm': 'milimetros',
    };

// 2. La lista de stems que creaste, ahora incrustada directamente en el código.
// Está ordenada por longitud descendente para una mejor coincidencia de prefijos.
export const stems = ["telescopic", "herramient", "fluorocarb", "cianoacri", "commercial", "glicerina", "desgaste", "caterpi", "ajusta", "instal", "instant", "loctite", "hydraul", "respal", "termom", "5j4986a", "5j4987a", "5j4988a", "5j4989a", "5j4990a", "5j4991a", "5j4993a", "5j4997a", "5j5020a", "5j5402a", "5j5559a", "5j7004a", "5j7010a", "5j7013a", "5j7019a", "5j7234a", "5j7854a", "5j8011a", "6j0793a", "6j1972a", "6j9385a", "8j6213a", "pegamen", "truper", "vernie", "buffer", "hallit", "hidraul", "intern", "llenad", "manom", "milim", "mirill", "polyse", "polypa", "polise", "polipa", "vastag", "5j3616", "5j3620", "5p4673", "6e0465", "6j6553", "6j6736", "6j6915", "6j6916", "6j6917", "6j7167", "6j8631", "6j9178", "6j9733", "7j8943", "7j9257", "8c3839", "8c3841", "8c9121", "8c9122", "8c9123", "8c9124", "8c9125", "8c9126", "8c9127", "8c9128", "8c9129", "8c9130", "8c9138", "8c9144", "8c9160", "8c9164", "8c9182", "8j4509", "8j4627", "8j6070", "8t0763", "8t1787", "8t1788", "8t1789", "8t1790", "8t1792", "8t1793", "9j2495", "9j3497", "9j7117", "9t0119", "9t9363", "adhes", "aline", "calib", "compas", "cordon", "estuch", "graser", "nbrh7", "nivel", "pisto", "quadra", "reten", "aceit", "acero", "cople", "coral", "embol", "exter", "ganch", "guia", "guía", "hoist", "limp", "perno", "plast", "vset", "acces", "chev", "comm", "copa", "cort", "duty", "filt", "heav", "hiab", "kast", "llav", "mswe", "mswh", "msws", "nbr70", "nbr90", "orin", "pulg", "skf", "tapo", "toall", "vito", "wipe", "fkm", "gat", "jis", "kit", "mkr", "n70", "nbr", "ptb", "tpc", "tpe", "wgt", "pu"];


/**
 * Normaliza una sola palabra al completo: aplica stemming y luego busca sinónimos.
 * @param {string} word La palabra a normalizar.
 * @returns {string} El stem canónico o el stem/palabra normalizada.
 */
const normalizeWord = (word) => {
    const lowerWord = word.toLowerCase();

    // Primero, encontrar el stem que coincida con el prefijo de la palabra
    const matchedStem = stems.find(stem => lowerWord.startsWith(stem));
    
    // Si no hay un stem coincidente, la palabra no está en nuestro diccionario, la devolvemos tal cual.
    if (!matchedStem) {
        return lowerWord;
    }

    // Segundo, buscar si ese stem tiene un sinónimo canónico.
    const canonicalStem = synonyms[matchedStem];

    // Devolver el canónico si existe, si no, el stem que encontramos.
    return canonicalStem || matchedStem;
};

/**
 * Procesa una cadena de texto completa, convirtiéndola en un array de stems canónicos.
 * @param {string | number} text El texto a procesar.
 * @returns {string[]} Un array de stems canónicos.
 */
export const getCanonicalStems = (text) => {
    if (!text) return [];

    // Tratar números y texto de forma diferente
    const isNumeric = !isNaN(parseFloat(text)) && isFinite(text);

    const words = String(text)
        .toLowerCase()
        .split(/[\s,.-]+/)
        .filter(word => word.length > 0);

    if (isNumeric && words.length === 1) {
        // Si el texto es solo un número, lo devolvemos como está para buscar medidas exactas
        return [words[0]];
    }

    return words.map(word => normalizeWord(word));
};


/**
 * Crea el objeto de búsqueda para un solo producto.
 * @param {object} product El producto original.
 * @returns {object} Un objeto con clave, texto de búsqueda normalizado y el producto original.
 */
export const normalizeProductForSearch = (product) => {
    const fieldsToSearch = [
      product.descripcion,
      product.categoria,
      product.material,
      product.observaciones,
      String(product.diam_int || ''),
      String(product.diam_ext || ''),
      String(product.altura || ''),
      String(product.seccion || ''),
    ];
  
    // No incluimos la clave en el texto de búsqueda para no contaminar con números de parte
    const allCanonicalStems = fieldsToSearch.flatMap(field => getCanonicalStems(field));
    
    // Añadimos la clave al final como un término de búsqueda independiente y exacto
    if (product.clave) {
        allCanonicalStems.push(product.clave.toLowerCase());
    }

    // Eliminar duplicados para crear un conjunto único de palabras clave
    const uniqueStems = [...new Set(allCanonicalStems)];
  
    return {
      clave: product.clave,
      searchableText: uniqueStems.join(' '),
      originalProduct: product, 
    };
  };