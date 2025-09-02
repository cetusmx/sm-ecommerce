import React from "react";
import styles from "./Header.module.css";
/* import logo from "../assets/logo.png"; */
import logo from "@/assets/LogoNegro.png";
import SearchInputWithDropdown from "@/utils/SearchInputWithDropdown.js";
import CartButton from "@/components/features/cart/CartButton";
import UserSession from "@/components/features/user/UserSession";
import OrdersButton from "@/components/features/user/OrdersButton"; // Import the new component

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles['header-top']}>
        <a href="/" className={styles.logo}>
          <img src={logo} alt="Logotipo de la marca" />
        </a>
        <nav className={styles['main-nav']}>
          <ul>
            <li>
              <a href="/categories">Categorías</a>
            </li>
            <li>
              <a href="/faq">Ayuda</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className={styles['search-bar-container']}>
        <SearchInputWithDropdown />
      </div>
      <div className={styles['session-state']}>
        <UserSession />
        <OrdersButton />
        <CartButton />
      </div>
    </header>
  );
};

export default Header;
