import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

const Layout = ({ onFullSearch }) => {
  return (
    <div className={styles.layoutContainer}>
      <Header onFullSearch={onFullSearch} />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
