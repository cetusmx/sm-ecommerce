import React from 'react';
import styles from './BranchInfo.module.css';
import { FaBuilding } from 'react-icons/fa';
import durangoImg from '@/assets/durango.png';
import zacatecasImg from '@/assets/zacatecas.png';
import mazatlanImg from '@/assets/mazatlan.png';
import queretaroImg from '@/assets/queretaro.png';

const BranchInfo = () => {
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.iconWrapper}>
          <FaBuilding className={styles.icon} />
        </div>
        <h3>Sucursales</h3>
      </div>
      <div className={styles.branchesGrid}>
        <div className={styles.branch}>
          <a href="https://maps.app.goo.gl/CupghVrZnCfY169H6" target="_blank" rel="noopener noreferrer">
            <img src={durangoImg} alt="Sucursal Durango" className={styles.branchImage} />
          </a>
          <div className={styles.branchAddress}>
            <p className={styles.branchTitle}><strong>Sucursal Durango</strong></p>
            <a href="https://maps.app.goo.gl/CupghVrZnCfY169H6" target="_blank" rel="noopener noreferrer">
              <p>Prol. Pino Suárez 3012, Col. J. Guadalupe Rodríguez, CP 34280, Durango, Dgo.</p>
            </a>
          </div>
        </div>
        <div className={styles.branch}>
          <a href="https://maps.app.goo.gl/BuSK4ovNMy7ffARv6" target="_blank" rel="noopener noreferrer">
            <img src={zacatecasImg} alt="Sucursal Zacatecas" className={styles.branchImage} />
          </a>
          <div className={styles.branchAddress}>
            <p className={styles.branchTitle}><strong>Sucursal Zacatecas</strong></p>
            <a href="https://maps.app.goo.gl/BuSK4ovNMy7ffARv6" target="_blank" rel="noopener noreferrer">
              <p>Av. Conventos 1, Fracc. Los Conventos, CP 98612, Guadalupe, Zac.</p>
            </a>
          </div>
        </div>
        <div className={styles.branch}>
          <a href="https://maps.app.goo.gl/TU5akHgufG9hVSgf9" target="_blank" rel="noopener noreferrer">
            <img src={mazatlanImg} alt="Sucursal Mazatlán" className={styles.branchImage} />
          </a>
          <div className={styles.branchAddress}>
            <p className={styles.branchTitle}><strong>Sucursal Mazatlán</strong></p>
            <a href="https://maps.app.goo.gl/TU5akHgufG9hVSgf9" target="_blank" rel="noopener noreferrer">
              <p>Gabriel Leyva 4020 Local 3, Col. Jesús García, CP 82180, Mazatlán, Sin.</p>
            </a>
          </div>
        </div>
        <div className={styles.branch}>
          <a href="https://maps.app.goo.gl/ntZrbVHJqKiH7PzS9" target="_blank" rel="noopener noreferrer">
            <img src={queretaroImg} alt="Sucursal Querétaro" className={styles.branchImage} />
          </a>
          <div className={styles.branchAddress}>
            <p className={styles.branchTitle}><strong>Sucursal Querétaro</strong></p>
            <a href="https://maps.app.goo.gl/ntZrbVHJqKiH7PzS9" target="_blank" rel="noopener noreferrer">
              <p>Av. Constituyentes 25 local 1, Col. Magisterial, CP 76116, Santiago de Querétaro, Qro.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchInfo;
