import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styles from './OringsProductTable.module.css'; // Use the new CSS file
import { useCart } from '@/hooks/useCart';
import ProductOffer from './ProductOffer';
import StockStatus from './StockStatus';
import { calculateArrivalDate, formatToShortDate } from '@/utils/dateUtils';


const OringsProductTable = ({ products, sortConfig, handleSort }) => {
    const { addItem } = useCart();
    const queryClient = useQueryClient();
    
    const { data: promotionalProducts } = useQuery({
        queryKey: ['promotionalProducts'],
        queryFn: async () => {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/productospromocion`);
            if (!response.ok) {
                console.error('Failed to fetch promotional products');
                return [];
            }
            return response.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    const isProductInPromotion = (product) => {
        if (!promotionalProducts) return false;
        return promotionalProducts.some(promo => promo.clave === product.clave);
    };

    const [quantities, setQuantities] = useState({});
    const [addedMessage, setAddedMessage] = useState({});

    const handleQuantityChange = (clave, value) => {
        const newQuantity = Math.max(1, Number(value));
        setQuantities(prev => ({ ...prev, [clave]: newQuantity }));
    };

    const handleAddToCart = (product) => {
        const quantity = quantities[product.clave] || 1;
        let productToAdd = { ...product };

        if (isProductInPromotion(product)) {
            const allProductsFromCache = queryClient.getQueryData(['products']);
            const promotionalProductsFromCache = queryClient.getQueryData(['promotionalProducts']);
            const promoDetails = promotionalProductsFromCache.find(promo => promo.clave === product.clave);
            const originalProduct = allProductsFromCache.find(p => p.clave === product.clave);

            if (promoDetails && originalProduct) {
                const normalPrice = parseFloat(originalProduct.precio);
                const discount = parseFloat(promoDetails.descuento);
                let offerPrice = normalPrice;
                if (!isNaN(discount) && discount > 0 && discount <= 100) {
                    offerPrice = normalPrice * (1 - discount / 100);
                }
                productToAdd.precio = offerPrice.toFixed(2);
            }
        }

        addItem(productToAdd, quantity);
        setAddedMessage(prev => ({ ...prev, [product.clave]: 'Agregado al carrito' }));
        setTimeout(() => {
            setAddedMessage(prev => ({ ...prev, [product.clave]: null }));
        }, 3000);
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
        }
        return '';
    };

    if (products.length === 0) {
        return null; // Don't render anything if there are no products
    }

    return (
        <table className={styles.productTable}>
            <thead>
                <tr>
                    <th className={styles.thImage}>Perfil</th>
                    <th className={styles.thClave}>SKU</th>
                    <th className={styles.thDescripcion}>Descripción</th>
                    <th onClick={() => handleSort('diam_int')} style={{ cursor: 'pointer' }}>Diámetro Int.{getSortIndicator('diam_int')}</th>
                    <th onClick={() => handleSort('diam_ext')} style={{ cursor: 'pointer' }}>Diámetro Ext.{getSortIndicator('diam_ext')}</th>
                    <th className={styles.thPrecio}>Precio</th>
                    <th className={styles.thCant}>Cant por empaque</th>
                    <th className={styles.thAction}>Agregar</th>
                </tr>
            </thead>
            <tbody>
                {products.map(product => {
                    let imageUrl;
                    if (product.categoria === "Herramientas" || product.categoria === "Accesorios" || product.categoria === "Estuches" || product.categoria === "Accesorios hidráulicos") {
                        imageUrl = `/Sugeridos/${product.clave}.jpg`;
                    } else {
                        imageUrl = `/Perfiles/${product.linea}.jpg`;
                    }
                    const quantity = quantities[product.clave] || 1;
                    const isOutOfStock = product.existencia === 0;
                    const arrivalDate = isOutOfStock ? formatToShortDate(calculateArrivalDate()) : null;

                    return (
                        <tr key={product.clave}>
                            <td className={styles.tdImage}>
                                <Link to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(imageUrl)}`}>
                                    <img src={imageUrl} alt={product.descripcion} className={styles.productImage} />
                                </Link>
                            </td>
                            <td className={styles.tdClave}>
                                <Link style={{textDecoration:"underline", color: "#212c59"}} to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(imageUrl)}`}>
                                    {product.clave}
                                </Link>
                            </td>
                            <td className={styles.tdDescripcion}>{product.descripcion}</td>
                            <td>{product.diam_int}</td>
                            <td>{product.diam_ext}</td>
                            <td className={styles.tdPrecio}>
                                {isOutOfStock ? (
                                    <StockStatus arrivalDate={arrivalDate} />
                                ) : isProductInPromotion(product) ? (
                                    <ProductOffer product={product} />
                                ) : (
                                    parseFloat(product.precio).toFixed(2)
                                )}
                            </td>
                            <td className={styles.tdCant}>{product.cantidad_empaque}</td>
                            <td className={styles.tdAction}>
                                <div className={styles.actionContainer}>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={quantity} 
                                        onChange={(e) => handleQuantityChange(product.clave, e.target.value)}
                                        className={styles.quantityInput}
                                        disabled={isOutOfStock}
                                    />
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="sm-btn sm-btn-primary"
                                        style={{
                                            fontSize:"0.9em", 
                                            padding: "7px 20px",
                                            opacity: isOutOfStock ? 0.5 : 1
                                        }}
                                        disabled={isOutOfStock}
                                    >
                                        Agregar
                                    </button>
                                    {addedMessage[product.clave] && <div className={styles.addedMessage}>{addedMessage[product.clave]}</div>}
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default OringsProductTable;
