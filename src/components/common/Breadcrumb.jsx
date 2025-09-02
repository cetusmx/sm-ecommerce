import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = ({ parent, child }) => {
  if (!parent && !child) {
    return null;
  }

  return (
    <div className={styles.breadcrumb}>
      {parent && (
        <>
          <Link to={`/categoria/${parent.toLowerCase().replace(/ /g, '-')}`} className={styles.parentCategory}>
            {parent}
          </Link>
          <span className={styles.separator}>&gt;</span>
        </>
      )}
      {child && <span className={styles.childCategory}>{child}</span>}
    </div>
  );
};

export default Breadcrumb;
