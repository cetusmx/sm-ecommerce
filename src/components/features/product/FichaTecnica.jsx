import React from 'react';
import styles from './FichaTecnica.module.css';
import oringSchema from '@/assets/oring_schema.jpg';

// Map for technical properties, using raw material codes as keys
const materialProperties = {
    'FKM': {
        dureza: '75 Shore A',
        temperatura: '-20°C a 200°C',
        material: 'Fluorocarbono (FKM)',
        presion: 'Hasta 200 bar'
    },
    'NBR': {
        dureza: '70 Shore A',
        temperatura: '-30°C a 100°C',
        material: 'Nitrilo (NBR)',
        presion: 'Hasta 150 bar'
    },
    'NBRH': {
        dureza: '80 Shore A',
        temperatura: '-40°C a 150°C',
        material: 'Nitrilo Hidrogenado (HNBR)',
        presion: 'Hasta 250 bar'
    }
    // Add more materials as needed
};

// Map for displaying descriptive names, using raw material codes as keys
const materialDisplayNames = {
    'FKM': 'Vitón dureza 75 (FKM)',
    'NBR': 'Nitrilo dureza 70',
    'NBRH': 'Nitrilo Hidrogenado (HNBR)'
};

const FichaTecnica = ({ materialFilters, filteredProducts, groupName }) => {
    // Determine which material's properties to display (using raw code)
    const selectedMaterialCode = materialFilters && materialFilters.length > 0
        ? materialFilters[0] // Use the first selected raw material code
        : null;

    const propertiesToDisplay = selectedMaterialCode
        ? materialProperties[selectedMaterialCode]
        : null;

    // Get the descriptive name for display
    const displayMaterialName = selectedMaterialCode
        ? materialDisplayNames[selectedMaterialCode] || selectedMaterialCode
        : null;

    if (!propertiesToDisplay) {
        if (groupName === 'orings-respaldos') {
            return (
                <div className={styles.fichaTecnicaContainer}>
                    <p>Selecciona un material para ver su ficha técnica detallada.</p>
                </div>
            );
        } else {
            return null; // Render nothing for other groups if no material is selected
        }
    }

    return (
        <div className={styles.fichaTecnicaContainer}>
            <div className={styles.fichaTecnicaLeft}>
                <img src={oringSchema} alt="Esquema del Producto" className={styles.productSchemeImage} />
            </div>
            <div className={styles.fichaTecnicaRight}>
                <h3>Propiedades Técnicas ({displayMaterialName})</h3>
                <table className={styles.fichaTecnicaTable}>
                    <tbody>
                        <tr>
                            <td>Dureza</td>
                            <td>{propertiesToDisplay.dureza}</td>
                        </tr>
                        <tr>
                            <td>Temperatura</td>
                            <td>{propertiesToDisplay.temperatura}</td>
                        </tr>
                        <tr>
                            <td>Material</td>
                            <td>{propertiesToDisplay.material}</td>
                        </tr>
                        <tr>
                            <td>Presión</td>
                            <td>{propertiesToDisplay.presion}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FichaTecnica;
