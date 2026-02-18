import React, { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchProductosVistos } from '@/api/productosVistosApi';
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { getDeliveryInfo } from "@/utils/deliveryUtils"; // Import the utility function
import styles from "./CartPage.module.css"; // Use its own dedicated styles
import CartItem from "@/components/cart/CartItem";
import ShippingInfo from "@/components/cart/ShippingInfo"; // Import the new ShippingInfo component
import Breadcrumb from "@/components/common/Breadcrumb"; // Import Breadcrumb component
import HerramientasSugeridas from "@/components/features/product/HerramientasSugeridas";
import ProductosVistos from "@/components/features/product/ProductosVistos";

const CartPage = () => {
  const { cart, cartTotal, cartItemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [deliveryInfos, setDeliveryInfos] = useState({});

  const FREE_SHIPPING_THRESHOLD = 900;

  useEffect(() => {
    const newDeliveryInfos = {};
    cart.forEach(item => {
      newDeliveryInfos[item.clave] = getDeliveryInfo(item, item.quantity);
    });
    setDeliveryInfos(newDeliveryInfos);
  }, [cart, new Date().toDateString()]); // Add new Date().toDateString() to dependencies

  // Console log para visualizar el contenido del carrito en CartPage
  useEffect(() => {
    if (cart && cart.length > 0) {
      //console.log('Cart en CartPage después de cargarse:', cart);
      cart.forEach(item => {
        //console.log(`- Producto ${item.clave}: perfil=${item.perfil}, existencia=${item.existencia}`);
      });
    } else if (cart && cart.length === 0) {
      //console.log('Cart en CartPage está vacío.');
    }
  }, [cart]); // Depende del carrito
  const { data: viewedProducts } = useQuery({
    queryKey: ['productosVistos', currentUser?.email],
    queryFn: () => fetchProductosVistos(currentUser?.email),
    enabled: !!currentUser?.email,
  });

  const handleCheckout = () => {
    if (!currentUser) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    const envioGratis = cartTotal >= FREE_SHIPPING_THRESHOLD;

    const fechasDeEntrega = Object.keys(deliveryInfos).map(clave => ({
      clave,
      fecha: deliveryInfos[clave].date,
      fechaCorta: deliveryInfos[clave].shortDate,
    }));
    navigate("/checkout", { state: { fechasDeEntrega, envioGratis } });
  };

  const handleClearCart = () => {
    clearCart();
    window.scrollTo(0, 0);
  };

  return (
    <div className={styles["main-container"]}>
      <div className={styles["top-section"]}>
        <div className={styles["contenedor-izq-top"]} style={{ width: "100%" }}>
          <div className={styles["title-and-search"]}>
            <h1 className={styles["page-title"]}>Mi Carrito</h1>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <div className={styles["contenedor-izq-bot"]}>
          {cart.length === 0 ? (
            <div className={styles["order-card"]}>
              <p>Tu carrito está vacío.</p>
              <button
                className="sm-btn sm-btn-primary"
                onClick={() => navigate("/")}
              >
                Ver productos
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cartItemsList}>
                {cart.map((item) => <CartItem key={item.clave} item={item} deliveryInfo={deliveryInfos[item.clave]} />)}
              </div>
              <div className={styles.clearCartContainer}>
                <button onClick={handleClearCart} className="sm-btn sm-btn-tertiary">
                  Vaciar el carrito
                </button>
              </div>
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div
            className={styles["contenedor-der-top"]}
            style={{ width: "30%", alignSelf: "flex-start" }}
          >
            <h3
              style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px" }}
            >
              Resumen del Pedido
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "20px 0",
              }}
            >
              <span>Subtotal ({cartItemCount} productos): </span>
              <span style={{ fontWeight: "bold", paddingLeft: "5px" }}>
                {" "}
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="sm-btn sm-btn-primary"
              style={{ width: "100%" }}
            >
              Proceder al Pago
            </button>
            {/* <ShippingInfo cartTotal={cartTotal} /> */}
          </div>
        )}
      </div>
      {viewedProducts && viewedProducts.length > 0 && <ProductosVistos viewedProducts={viewedProducts} />}
      <HerramientasSugeridas />
    </div>
  );
};

export default CartPage;