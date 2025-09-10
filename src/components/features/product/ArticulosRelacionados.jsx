import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ArticuloRelacionado from './ArticuloRelacionado';
import styles from './ArticulosRelacionados.module.css';
import { FaPlus } from 'react-icons/fa';
import { useCart } from '@/hooks/useCart';

// Fetch all products
const fetchProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/productos`);
  if (!response.ok) {
    throw new Error('Network response was not ok for products');
  }
  return response.json();
};

// Fetch related categories
const fetchRelatedCategories = async (category) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/relacionesproducto/${category}`);
  if (!response.ok) {
    throw new Error('Network response was not ok for related categories');
  }
  return response.json();
};

const ArticulosRelacionados = ({ productoPrincipal }) => {
  const { addItem } = useCart();
  const [selectedItems, setSelectedItems] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [addedMessage, setAddedMessage] = useState('');

  // Query for all products
  const { data: allProducts, isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Query for related categories, enabled only when productoPrincipal.categoria is available
  const { data: relatedCategories, isLoading: isLoadingRelated, error: relatedError } = useQuery({
    queryKey: ['relatedCategories', productoPrincipal?.categoria],
    queryFn: () => fetchRelatedCategories(productoPrincipal.categoria),
    enabled: !!productoPrincipal?.categoria,
  });

  const relatedProducts = useMemo(() => {
    if (!productoPrincipal || !allProducts || !relatedCategories) {
      return [];
    }

    // ... (toda la lógica de filtrado compleja se mantiene igual)
    // 1. First filter: by `colocado_en` (flexibly) and `sistema_medicion`
    const firstFilter = allProducts.filter(p => {
      if (p.clave === productoPrincipal.clave) return false;
      if (p.sistema_medicion !== productoPrincipal.sistema_medicion) return false;

      const mainPlacement = productoPrincipal.colocado_en;
      const relatedPlacement = p.colocado_en;

      if (mainPlacement === relatedPlacement) return true;
      if (relatedPlacement === 'ambos') return true;
      if (mainPlacement === 'ambos') return true;

      return false; // Not a match
    });

    // 2. Second filter: for comparable products ONLY
    const secondFilter = firstFilter.filter(p => {
      const p_di = parseFloat(p.diam_int);
      const main_di = parseFloat(productoPrincipal.diam_int);
      const p_de = parseFloat(p.diam_ext);
      const main_de = parseFloat(productoPrincipal.diam_ext);

      if (isNaN(p_di) || isNaN(main_di) || isNaN(p_de) || isNaN(main_de)) {
        return false;
      }

      const colocadoEn = productoPrincipal.colocado_en;

      if (p.categoria === 'Guías desgaste') {
        if (colocadoEn === 'estopero' || colocadoEn === 'ambos') return p_di === main_di;
        if (colocadoEn === 'piston') return p_de === main_de;
      } else {
        if (colocadoEn === 'estopero' || colocadoEn === 'ambos') return p_di === main_di;
        if (colocadoEn === 'piston') return p_de === main_de;
      }

      return true;
    });

    // 3. Find-relation function
    const findProductForRelation = (relatedCategory) => {
      if (!relatedCategory) return null;

      // --- SPECIAL RULES ---
      if (relatedCategory === 'Accesorios') {
        const towel = allProducts.find(p => p.clave === 'TOWEL-1');
        if (towel && towel.existencia > 0) return towel;
        return null;
      }

      // Rule for non-dimensional categories
      if (['Herramientas', 'Estuches', 'Adhesivos', 'Seguros externos', 'Seguros internos', 'Graseras', 'Pernos', 'Gatos'].includes(relatedCategory)) {
        const candidates = allProducts.filter(p => p.categoria === relatedCategory && p.existencia > 0);
        if (candidates.length > 0) {
          const randomIndex = Math.floor(Math.random() * candidates.length);
          return candidates[randomIndex];
        }
        return null;
      }

      // --- STANDARD LOGIC for comparable products ---
      const candidates = secondFilter.filter(p => p.categoria === relatedCategory);
      if (candidates.length === 0) return null;

      const inStock = candidates.filter(p => p.existencia > 0);
      if (inStock.length > 0) {
        const randomIndex = Math.floor(Math.random() * inStock.length);
        return inStock[randomIndex];
      }
      
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex];
    };

    // --- FINAL SELECTION LOGIC ---
    let finalProducts = [];
    const mainCategory = productoPrincipal?.categoria;

    if (mainCategory === 'Guías desgaste') {
      // Lógica especial para Guías de Desgaste
      const findPistonSealByDE = () => {
        const main_de = parseFloat(productoPrincipal.diam_ext);
        if (isNaN(main_de)) return null;

        const excludedLineas = ['CPS1', 'CPS2', 'PMD1', 'PMD12', 'PMD2', 'PMD3', 'PMD4', 'PMS2', 'PSD1', 'PSS12', 'PSD3'];

        const candidates = allProducts.filter(p => 
          p.categoria === 'Sellos de pistón' && 
          p.sistema_medicion === productoPrincipal.sistema_medicion &&
          parseFloat(p.diam_ext) === main_de &&
          !excludedLineas.includes(p.linea)
        );

        if (candidates.length === 0) return null;

        const inStock = candidates.filter(p => p.existencia > 0);
        if (inStock.length > 0) {
          return inStock[Math.floor(Math.random() * inStock.length)];
        }
        return candidates[Math.floor(Math.random() * candidates.length)]; // Fallback to out of stock
      };

      const relacionado1 = findPistonSealByDE();
      const relacionado2 = findProductForRelation(relatedCategories.relacionado2);
      const relacionado3 = findProductForRelation(relatedCategories.relacionado3);
      finalProducts = [relacionado1, relacionado2, relacionado3].filter(Boolean);

    } else if (mainCategory === 'Sellos de pistón') {
      const relacionado1 = findProductForRelation(relatedCategories.relacionado1);

      const setKeys = ['SET-6', 'SET-4', 'SET-5'];
      const setCandidates = allProducts.filter(p => setKeys.includes(p.clave) && p.existencia > 0);
      let relacionado2 = null;
      if (setCandidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * setCandidates.length);
        relacionado2 = setCandidates[randomIndex];
      }

      const relacionado3 = findProductForRelation(relatedCategories.relacionado3);
      finalProducts = [relacionado1, relacionado2, relacionado3].filter(Boolean);

    } else if (mainCategory === 'Orings') {
      const relCategories = [relatedCategories.relacionado1, relatedCategories.relacionado2, relatedCategories.relacionado3];
      const herramientaIndex = relCategories.indexOf('Herramientas');
      
      const finalProductsTemp = relCategories.map((category, index) => {
        if (index === herramientaIndex) {
          const setKeys = ['SET-4', 'SET-5', 'SET-01'];
          const setCandidates = allProducts.filter(p => setKeys.includes(p.clave) && p.existencia > 0);
          if (setCandidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * setCandidates.length);
            return setCandidates[randomIndex];
          }
          return null;
        } else {
          return findProductForRelation(category);
        }
      });
      finalProducts = finalProductsTemp.filter(Boolean);

    } else {
      // Standard logic for all other product categories
      finalProducts = [
        findProductForRelation(relatedCategories.relacionado1),
        findProductForRelation(relatedCategories.relacionado2),
        findProductForRelation(relatedCategories.relacionado3),
      ].filter(Boolean);
    }

    return finalProducts;

  }, [productoPrincipal, allProducts, relatedCategories]);

  useEffect(() => {
    if (relatedProducts && relatedProducts.length > 0) {
      const initialSelection = relatedProducts.reduce((acc, product) => {
        acc[product.clave] = true;
        return acc;
      }, {});
      setSelectedItems(initialSelection);
    }
  }, [relatedProducts]);

  useEffect(() => {
    const newTotal = relatedProducts.reduce((sum, product) => {
      if (selectedItems[product.clave]) {
        return sum + parseFloat(product.precio);
      }
      return sum;
    }, 0);
    setTotalPrice(newTotal);
  }, [selectedItems, relatedProducts]);

  const handleSelectionChange = (clave, isSelected) => {
    setSelectedItems(prev => ({
      ...prev,
      [clave]: isSelected,
    }));
  };

  const handleAddSelectedToCart = () => {
    const itemsToAdd = relatedProducts.filter(p => selectedItems[p.clave]);
    if (itemsToAdd.length === 0) {
        setAddedMessage('Por favor, selecciona al menos un artículo.');
        setTimeout(() => setAddedMessage(''), 3000);
        return;
    }
    itemsToAdd.forEach(item => {
      addItem(item, 1); // Assuming quantity of 1 for each related item
    });
    setAddedMessage(`${itemsToAdd.length} artículo(s) agregado(s) al carrito.`);
    setTimeout(() => setAddedMessage(''), 3000);
    setSelectedItems({}); // Reset selection after adding
  };

  const isLoading = isLoadingProducts || isLoadingRelated;
  const error = productsError || relatedError;

  if (isLoading) return <div>Cargando artículos relacionados...</div>;
  if (error) return <div>Error al cargar artículos relacionados: {error.message}</div>;
  if (relatedProducts.length === 0) return null; // Don't render if no related products found

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Quizá también necesites</h3>
      <div className={styles.listContainer}>
        {relatedProducts.map((product, index) => (
          <React.Fragment key={product.clave}>
            <ArticuloRelacionado
              producto={product}
              isSelected={!!selectedItems[product.clave]} // Pass selection state to child
              onSelectionChange={handleSelectionChange} // Pass handler to child
            />
            {index < relatedProducts.length - 1 && (
              <div className={styles.plusIcon}>
                <FaPlus />
              </div>
            )}
          </React.Fragment>
        ))}
        <div className={styles.totalContainer}>
          <p className={styles.totalPrice}>Total seleccionados: ${totalPrice.toFixed(2)}</p>
          <button className={styles.addButton} onClick={handleAddSelectedToCart}>
            Agregar seleccionados al carrito
          </button>
          {addedMessage && <p className={styles.addedMessage}>{addedMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default ArticulosRelacionados;
