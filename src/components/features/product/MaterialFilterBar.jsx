import React from 'react';
import styles from './MaterialFilterBar.module.css';

const materialLabelMap = {
    'FKM': 'Vitón',
    'NBR': 'Nitrilo',
    'NBRH': 'Nitrilo Hidrogenado',
    'PTFE': 'Teflón',
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
                    
                    // Logic to handle combined material + hardness
                    const parts = material.split(' ');
                    const materialCode = parts[0];
                    const hardness = parts.length > 1 ? ` ${parts.slice(1).join(' ')}` : '';
                    const friendlyName = materialLabelMap[materialCode] || materialCode;
                    const label = `${friendlyName}${hardness}`;

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
