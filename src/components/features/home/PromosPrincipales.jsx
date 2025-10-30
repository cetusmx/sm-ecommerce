import React from 'react';
import styles from './PromosPrincipales.module.css';
import PromoPrincipal from './PromoPrincipal';

// Import images
import grasera from '@/assets/grasera.jpg';
import perno from '@/assets/perno.jpg';
import seguroInterno from '@/assets/seguro-interno.jpg';
import kitquad from '@/assets/kitquad.jpg';

import her1 from '@/assets/SET-01.png';
import her2 from '@/assets/SET-18.jpg';
import her3 from '@/assets/SET-4.jpg';
import her4 from '@/assets/SET-5.jpg';

import estu1 from '@/assets/EMON70382.jpg';
import estu2 from '@/assets/ESON70382.jpg';

import reten1 from '@/assets/reten1.jpg';
import reten2 from '@/assets/reten2.jpg';
import reten3 from '@/assets/reten3.jpg';
import reten4 from '@/assets/reten4.jpg';

import orings from '@/assets/orings.jpg';
import oring1 from '@/assets/oring1.png';
import oring2 from '@/assets/oring2.jpg';
import backup1 from '@/assets/backup1.jpg';


const promosData = [
  {
    title: 'Orings y Respaldos',
    mainImage: orings,
    mainImageAlt: 'Orings estándar AS568',
    mainImage2: oring1,
    mainImage2Alt: 'Orings de nitrilo y vitón',
    description: 'Orings estándar AS568',
    subImage1: oring2,
    subImage1Alt: 'Orings milimétricos',
    subImage1Title: 'Orings milimétricos',
    subImage2: backup1,
    subImage2Alt: 'Respaldos de todas medidas',
    subImage2Title: 'Respaldos de todas medidas',
    link: '/grupo/orings-respaldos'
  },
  /* {
    title: 'Orings y Respaldos',
    mainImage: grasera,
    mainImageAlt: 'Fabricación de sellos',
    mainImage2: perno,
    mainImage2Alt: 'Fabricación de sellos',
    description: 'Alta precisión en el proceso de maquinado con materiales de la más alta calidad.',
    subImage1: seguroInterno,
    subImage1Alt: 'Materiales 100% calidad',
    subImage1Title: '100% calidad',
    subImage2: taponGato,
    subImage2Alt: 'Alta precisión',
    subImage2Title: 'Alta precisión',
    link: '/grupo/seguros-pernos-graseras'
  }, */
  {
    title: 'Herramientas',
    mainImage: her1,
    mainImageAlt: 'Promo 2',
    mainImage2: her4,
    mainImage2Alt: 'Promo 2',
    description: 'Descripción de la promo 2.',
    subImage1: her2,
    subImage1Alt: 'Sub imagen 1',
    subImage1Title: 'Título sub imagen 1',
    subImage2: her3,
    subImage2Alt: 'Sub imagen 2',
    subImage2Title: 'Título sub imagen 2',
    link: '/grupo/herramientas'
  },
  {
    title: 'Retenes',
    mainImage: reten1,
    mainImageAlt: 'Promo 3',
    mainImage2: reten2,
    mainImage2Alt: 'Promo 3',
    description: 'Descripción de la promo 3.',
    subImage1: reten3,
    subImage1Alt: 'Sub imagen 1',
    subImage1Title: 'Título sub imagen 1',
    subImage2: reten4,
    subImage2Alt: 'Sub imagen 2',
    subImage2Title: 'Título sub imagen 2',
    link: '/?sello=Retenes'
  },
  {
    title: 'Estuches de Orings',
    mainImage: estu1,
    mainImageAlt: 'Promo 4',
    mainImage2: estu2,
    mainImage2Alt: 'Promo 4',
    description: 'Descripción de la promo 4.',
    subImage1: kitquad,
    subImage1Alt: 'Sub imagen 1',
    subImage1Title: 'Título sub imagen 1',
    subImage2: estu2,
    subImage2Alt: 'Sub imagen 2',
    subImage2Title: 'Título sub imagen 2',
    link: '/grupo/estuches-orings'
  }
];

const PromosPrincipales = () => {
  return (
    <div className={styles['promo-container']}>
      {promosData.map((promo, index) => (
        <PromoPrincipal
          key={index}
          {...promo}
        />
      ))}
    </div>
  );
};

export default PromosPrincipales;