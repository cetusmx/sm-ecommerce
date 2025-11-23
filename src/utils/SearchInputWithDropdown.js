import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useDebounce from '@/hooks/useDebounce';
import { normalizeProductForSearch, getCanonicalStems } from '@/config/searchDictionary';
import { fetchSearchResultsByQuery } from '@/api/productsApi'; // Remove fetchProducts import
// import { useProductsLoaded } from '@/context/ProductsLoadedContext'; // Remove context import

const SearchInputWithDropdown = ({ onFullSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();
    // const { allProductsLoaded } = useProductsLoaded(); // Remove context consumption

    // Remove: Fetch all products when allProductsLoaded is true
    // const { data: allProducts = [] } = useQuery({
    //     queryKey: ['products'],
    //     queryFn: fetchProducts,
    //     enabled: allProductsLoaded,
    // });

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Fetch search results from API (permanent setup)
    const { data: searchResultsFromApi = [] } = useQuery({
        queryKey: ['searchResultsApi', debouncedSearchQuery],
        queryFn: () => fetchSearchResultsByQuery(debouncedSearchQuery),
        enabled: debouncedSearchQuery.trim() !== '', // Only fetch from API if query exists
    });

    // Determine the data source for the search index (always searchResultsFromApi)
    const currentDataSource = searchResultsFromApi || []; // Ensure it's always an array

    // Paso 1: Crear un índice de búsqueda normalizado y memorizado
    const searchIndex = useMemo(() => {
        return currentDataSource
            .filter(product => product.precio !== 0 && product.precio !== null) // Filter out products with precio === 0 or precio === null
            .map(product => normalizeProductForSearch(product));
    }, [currentDataSource]);

    useEffect(() => {
        // Only proceed if there are products to search through
        if (currentDataSource.length === 0) { // Use currentDataSource here
            // Only set if not already empty to prevent infinite loop
            if (searchResults.length !== 0) {
                setSearchResults([]);
            }
            return;
        }

        if (debouncedSearchQuery.trim() === '') {
            // Only set if not already empty to prevent infinite loop
            if (searchResults.length !== 0) {
                setSearchResults([]);
            }
            return;
        }
        updateAutocompleteResults(debouncedSearchQuery);
    }, [debouncedSearchQuery, searchIndex, currentDataSource, searchResults]); // Use currentDataSource here

    // Paso 2: Nueva función de búsqueda que utiliza el índice
    const updateAutocompleteResults = (query) => {
        if (!searchIndex.length) {
            setSearchResults([]);
            return;
        }

        const lowerCaseQuery = query.toLowerCase();

        // Filtrar el índice
        const filteredIndexResults = searchIndex.filter(indexedProduct => {
            // Realizar una búsqueda simple de subcadena en searchableText
            return indexedProduct.searchableText.includes(lowerCaseQuery);
        });

        // Extraer los productos originales de los resultados del índice
        let filteredProducts = filteredIndexResults.map(res => res.originalProduct);

        // Paso 3: Aplicar el mismo ordenamiento de relevancia que antes
        filteredProducts.sort((a, b) => {
            const aClave = a.clave?.toLowerCase() || '';
            const bClave = b.clave?.toLowerCase() || '';
            const aDesc = a.descripcion?.toLowerCase() || '';
            const bDesc = b.descripcion?.toLowerCase() || '';

            const aClaveExact = aClave === lowerCaseQuery;
            const bClaveExact = bClave === lowerCaseQuery;
            if (aClaveExact && !bClaveExact) return -1;
            if (!aClaveExact && bClaveExact) return 1;

            const aClaveStartsWith = aClave.startsWith(lowerCaseQuery);
            const bClaveStartsWith = bClave.startsWith(lowerCaseQuery);
            if (aClaveStartsWith && !bClaveStartsWith) return -1;
            if (!aClaveStartsWith && bClaveStartsWith) return 1;

            const aClaveIncludes = aClave.includes(lowerCaseQuery);
            const bClaveIncludes = bClave.includes(lowerCaseQuery);
            if (aClaveIncludes && !bClaveIncludes) return -1;
            if (!aClaveIncludes && bClaveIncludes) return 1;

            const aDescStartsWith = aDesc.startsWith(lowerCaseQuery);
            const bDescStartsWith = bDesc.startsWith(lowerCaseQuery);
            if (aDescStartsWith && !bDescStartsWith) return -1;
            if (!aDescStartsWith && bDescStartsWith) return 1;

            const aDescIncludes = aDesc.includes(lowerCaseQuery);
            const bDescIncludes = bDesc.includes(lowerCaseQuery);
            if (aDescIncludes && !bDescIncludes) return -1;
            if (!aDescIncludes && bDescIncludes) return 1;

            return 0;
        });

        // Only update searchResults if the content has actually changed
        // This prevents infinite re-renders if the filtered results are the same
        if (filteredProducts.length !== searchResults.length ||
            !filteredProducts.every((product, index) => product.clave === searchResults[index]?.clave)) { // Assuming 'clave' is a unique identifier
            setSearchResults(filteredProducts);
        }
    };

    const handleResultClick = (productClave) => {
        navigate(`/producto/${productClave}`); // Re-add navigate
        setSearchResults([]); // Clear results after selection
        setSearchQuery(''); // Clear search query
        // Call a prop to notify parent about selection if needed
    };

    const handleFullSearchClick = () => {
        if (searchQuery.trim() === '') return;
        onFullSearch(searchQuery); // Call the prop function to trigger full search in parent
        setSearchResults([]); // Clear autocomplete results
        setSearchQuery(''); // Clear search input
        navigate('/'); // Navigate to home page to display results
    };

    return (
        <div className="input-group" style={{ position: 'relative' }}>
            <input
                type="text"
                className="form-control"
                placeholder="Buscar sello hidráulico"
                aria-label="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFullSearchClick();
                }}
            />
            <div className="input-group-append">
                <button
                    className="btn"
                    type="button"
                    style={{ backgroundColor: "#0458c7", color: "#fff", borderRadius: "0 5px 5px 0" }}
                    onClick={handleFullSearchClick}
                >
                    Buscar
                </button>
            </div>
            {searchResults.length > 0 && searchQuery.length > 0 && (
                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, top: '100%', maxHeight: '300px', overflowY: 'auto' }}>
                    {searchResults.map(product => (
                        <li
                            key={product.clave}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() => handleResultClick(product.clave)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div>
                                <strong>{product.clave}</strong><br />
                                <span style={{ fontSize: '0.8em' }}>{product.descripcion}</span>
                            </div>
                            {product.imagen ? (
                                <img src={product.imagen} alt={product.descripcion} style={{ width: '40px', height: '40px', objectFit: 'contain', marginLeft: '10px' }} />
                            ) : product.linea ? (
                                <img src={`/Perfiles/${product.linea}.jpg`} alt={product.descripcion} style={{ width: '40px', height: '40px', objectFit: 'contain', marginLeft: '10px' }} />
                            ) : (
                                null
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchInputWithDropdown;
