import React from 'react';
import styles from './FichaTecnica.module.css';
import oringSchema from '@/assets/oring_schema.jpg';
import respaldoSchema from '@/assets/respaldo_schema.jpg'; // Import respaldo_schema.jpg

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
    },
    'PTFE': { // Added PTFE entry
        dureza: '55-60 Shore D', // Placeholder
        temperatura: '-200°C a 260°C', // Placeholder
        material: 'Politetrafluoroetileno (PTFE)', // Placeholder
        presion: 'Hasta 300 bar' // Placeholder
    }
    // Add more materials as needed
};

const FichaTecnica = ({ selectedMaterial, selectedProfile }) => { // Accept selectedProfile prop
    if (!selectedMaterial) {
        return null; // Render nothing if no material is selected
    }

    // Extract base material code (e.g., "NBR" from "NBR 70")
    const materialCode = selectedMaterial.split(' ')[0];

    const propertiesToDisplay = materialProperties[materialCode];

    // If no properties are found for the extracted code, render nothing.
    if (!propertiesToDisplay) {
        return null;
    }

    // Determine which image to display based on selectedProfile
    const imageSrc = selectedProfile === 'Respaldos' ? respaldoSchema : oringSchema;

    // Extract hardness from selectedMaterial string
    const hardnessMatch = selectedMaterial.match(/(\d+)/); // Find numbers in the string
    const displayedHardness = hardnessMatch ? `${hardnessMatch[1]} Shore A` : propertiesToDisplay.dureza;

    return (
        <div className={styles.fichaTecnicaContainer}>
            <div className={styles.fichaTecnicaLeft}>
                <img src={imageSrc} alt="Esquema del Producto" className={styles.productSchemeImage} />
            </div>
            <div className={styles.fichaTecnicaRight}>
                <h3>Propiedades Técnicas ({selectedMaterial})</h3>
                <table className={styles.fichaTecnicaTable}>
                    <tbody>
                        <tr>
                            <td>Dureza</td>
                            <td>{displayedHardness}</td>
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
