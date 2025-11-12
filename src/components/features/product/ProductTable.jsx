import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import styles from "./ProductTable.module.css";
import { useCart } from "@/hooks/useCart";
import ProductOffer from "./ProductOffer";

const ProductTable = ({ products }) => {
  const { addItem } = useCart();
  const queryClient = useQueryClient();

  const { data: promotionalProducts } = useQuery({
    queryKey: ["promotionalProducts"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/productospromocion`
      );
      if (!response.ok) {
        console.error("Failed to fetch promotional products");
        return []; // Return empty array on error to prevent crash
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isProductInPromotion = (product) => {
    if (!promotionalProducts) return false;
    return promotionalProducts.some((promo) => promo.clave === product.clave);
  };

  const [quantities, setQuantities] = useState({});
  const [addedMessage, setAddedMessage] = useState({});

  const handleQuantityChange = (clave, value) => {
    const newQuantity = Math.max(1, Number(value)); // Ensure quantity is at least 1
    setQuantities((prev) => ({ ...prev, [clave]: newQuantity }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.clave] || 1;

    let productToAdd = { ...product }; // Start with a copy of the original product

    if (isProductInPromotion(product)) {
      const allProductsFromCache = queryClient.getQueryData(["products"]); // Get all products from cache

      const promotionalProductsFromCache = queryClient.getQueryData([
        "promotionalProducts",
      ]); // Get promotional products from cache

      const promoDetails = promotionalProductsFromCache.find(
        (promo) => promo.clave === product.clave
      );

      const originalProduct = allProductsFromCache.find(
        (p) => p.clave === product.clave
      );

      if (promoDetails && originalProduct) {
        const normalPrice = parseFloat(originalProduct.precio);

        const discount = parseFloat(promoDetails.descuento);

        let offerPrice = normalPrice;

        if (!isNaN(discount) && discount > 0 && discount <= 100) {
          offerPrice = normalPrice * (1 - discount / 100);
        }

        productToAdd.precio = offerPrice.toFixed(2); // Update the price to the offer price
      }
    }

    addItem(productToAdd, quantity);

    setAddedMessage((prev) => ({ ...prev, [product.clave]: "Agregado al carrito" }));

    setTimeout(() => {
      setAddedMessage((prev) => ({ ...prev, [product.clave]: null }));
    }, 3000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  if (products.length === 0) {
    return null; // Don't render anything if there are no products
  }

  return (
    <table className={styles.productTable}>
      <thead>
        <tr>
          <th className={styles.thImage}>Perfil</th>

          <th className={styles.thClave}>Clave</th>

          <th className={styles.thDescripcion}>Descripción</th>

          <th className={styles.thPrecio}>Precio</th>

          <th className={styles.thCant}>Cant por empaque</th>

          <th className={styles.thAction}>Agregar</th>
        </tr>
      </thead>

      <tbody>
        {products.map((product) => {
          let imageUrl;

          if (
            product.categoria === "Herramientas" ||
            product.categoria === "Accesorios" ||
            product.categoria === "Estuches" ||
            product.categoria === "Accesorios hidráulicos"
          ) {
            imageUrl = `/Sugeridos/${product.clave}.jpg`;
          } else {
            imageUrl = `/Perfiles/${product.linea}.jpg`;
          }

          const quantity = quantities[product.clave] || 1;
          const isPromotion = isProductInPromotion(product);
          let offerPrice = null;

          if (isPromotion) {
            const allProductsFromCache = queryClient.getQueryData(["products"]);
            const promotionalProductsFromCache = queryClient.getQueryData([
              "promotionalProducts",
            ]);

            const promoDetails = promotionalProductsFromCache?.find(
              (promo) => promo.clave === product.clave
            );
            const originalProduct = allProductsFromCache?.find(
              (p) => p.clave === product.clave
            );

            if (promoDetails && originalProduct) {
              const normalPrice = parseFloat(originalProduct.precio);
              const discount = parseFloat(promoDetails.descuento);
              if (!isNaN(discount) && discount > 0 && discount <= 100) {
                offerPrice = (normalPrice * (1 - discount / 100)).toFixed(2);
              }
            }
          }

          return (
            <tr key={product.clave}>
              <td className={styles.tdImage}>
                <Link
                  to={`/producto/${product.clave}?imageUrl=${encodeURIComponent(
                    imageUrl
                  )}`}
                  state={{ isPromotion, offerPrice }} // Pass promotion info via state
                >
                  <img
                    src={imageUrl}
                    alt={product.descripcion}
                    className={styles.productImage}
                  />
                </Link>
              </td>

              <td className={styles.tdClave}>{product.clave}</td>

              <td className={styles.tdDescripcion}>{product.descripcion}</td>

              <td className={styles.tdPrecio}>
                {isProductInPromotion(product) ? (
                  <ProductOffer product={product} />
                ) : (
                  formatCurrency(parseFloat(product.precio).toFixed(2))
                )}
              </td>

              {/* <td className={styles.tdUnidad}> {product.unidad_medida}</td> */}

              <td className={styles.tdCant}>
                {product.cantidad_empaque !== "" ? "1" : ""}
              </td>

              <td className={styles.tdAction}>
                <div className={styles.actionContainer}>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(product.clave, e.target.value)
                    }
                    className={styles.quantityInput}
                  />

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="sm-btn sm-btn-primary"
                    style={{ fontSize: "0.9em", padding: "7px 20px" }}
                  >
                    Agregar
                  </button>

                  {addedMessage[product.clave] && (
                    <div className={styles.addedMessage}>
                      {addedMessage[product.clave]}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ProductTable;
