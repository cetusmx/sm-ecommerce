import React from "react";
import { Link } from "react-router-dom"; // Import Link
import styles from "./Header.module.css";
import logo from "@/assets/logo.png";
import SearchInputWithDropdown from "@/utils/SearchInputWithDropdown.js";
import CartButton from "@/components/features/cart/CartButton";
import UserSession from "@/components/features/user/UserSession";
import OrdersButton from "@/components/features/user/OrdersButton";
import AddressButton from "@/components/features/user/AddressButton";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles['header-top']}>
        <Link to="/" className={styles['logo']}> {/* Changed to Link */}
          <img src={logo} alt="Logotipo de la marca" />
        </Link>
        <Link to="/" className={styles['exo-2-font']}>Seal Market</Link> {/* Changed to Link */}
        <AddressButton />
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