import React from 'react';
import styles from './MaterialIllustrator.module.css';

const materialData = [
    {
        name: 'Nitrilo',
        code: 'NBR',
        colorClass: styles.nitrilo,
        maxTemp: '100°C',
        chemicals: 'Aceites, grasas, hidrocarburos alifáticos'
    },
    {
        name: 'Vitón',
        code: 'FKM',
        colorClass: styles.viton,
        maxTemp: '200°C',
        chemicals: 'Ácidos, hidrocarburos aromáticos, aceites de motor'
    },
    {
        name: 'EPDM',
        code: 'EPDM',
        colorClass: styles.epdm,
        maxTemp: '150°C',
        chemicals: 'Agua caliente, vapor, líquidos de frenos, ozono, intemperie'
    },
    {
        name: 'Nitrilo Hidrogenado',
        code: 'NBRH',
        colorClass: styles.hnbr,
        maxTemp: '150°C',
        chemicals: 'Combustibles, aceites, ozono, abrasión, refrigerante'
    },
    {
        name: 'Silicón',
        code: 'SIL',
        colorClass: styles.silicon,
        maxTemp: '220°C',
        chemicals: 'Agua, ozono, alimentos, aplicaciones médicas'
    },
    {
        name: 'Teflón',
        code: 'PTFE',
        colorClass: styles.teflon,
        maxTemp: '250°C',
        chemicals: 'Químicos agresivos, solventes, ácidos fuertes'
    }
];

const MaterialIllustrator = () => {
    return (
        <div className={styles.materialIllustratorContainer}>
            {materialData.map((material, index) => (
                <div key={index} className={styles.materialBlock}>
                    <div className={`${styles.materialLeft} ${material.colorClass}`}>
                        {material.name}
                    </div>
                    <div className={styles.materialRight}>
                        <p>{material.chemicals}</p>
                    </div>
                    <div className={styles.temperatureCircle}>
                        {material.maxTemp}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MaterialIllustrator;
