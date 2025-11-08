import React from 'react';
import styles from './MaterialFilterBar.module.css';

const materialLabelMap = {
    'FKM': 'Vitón',
    'NBR': 'Nitrilo',
    'NBRH': 'Nitrilo Hidrogenado',
    'VMQ': 'Silicón',
    'EPDM': 'EPDM',
    'POL': 'Poliuretano',
    // Add other mappings as needed
};

const MaterialFilterBar = ({ availableMaterials, materialFilters, onMaterialChange }) => {
    if (!availableMaterials || availableMaterials.length === 0) {
        return null;
    }

    return (
        <div className={styles.filterBarContainer}>
            <h3 className={styles.title}>Filtrar por Material:</h3>
            <div className={styles.buttonsContainer}>
                {availableMaterials.map(material => {
                    const isSelected = materialFilters.includes(material);
                    const label = materialLabelMap[material] || material;
                    return (
                        <button
                            key={material}
                            className={`${styles.filterButton} ${isSelected ? styles.selected : ''}`}
                            onClick={() => onMaterialChange(material)}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MaterialFilterBar;
