import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api/productsApi';
import { FiChevronLeft, FiXCircle } from 'react-icons/fi';
import styles from './OringsPage.module.css';
import AnuncioPuntual from '@/components/common/AnuncioPuntual';
import MaterialIllustrator from '@/components/features/product/MaterialIllustrator';

const sectionOptions = [
    { label: 'Sección 1/16 pulgada', value: '0.062' },
    { label: 'Sección 3/32 pulgada', value: '0.093' },
    { label: 'Sección 1/8 pulgada', value: '0.125' },
    { label: 'Sección 3/16 pulgada', value: '0.187' },
    { label: 'Sección 1/4 pulgada', value: '0.25' }
];

const OringsPage = () => {
    const [selectedMeasurementSystem, setSelectedMeasurementSystem] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedMetricGroup, setSelectedMetricGroup] = useState(null);
    const [showMaterialIllustrator, setShowMaterialIllustrator] = useState(true);

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    });

    const metricOringSections = useMemo(() => {
        if (!products) return [];
        const metricOrings = products.filter(p =>
            p.sistema_medicion && p.sistema_medicion.trim() === 'mm' &&
            p.perfil && p.perfil.trim() === 'ORING' &&
            p.seccion &&
            p.ultima_compra !== null
        );
        const uniqueSections = [...new Set(metricOrings.map(p => p.seccion.trim()))];
        uniqueSections.sort((a, b) => parseFloat(a) - parseFloat(b));
        return uniqueSections.map(section => ({ label: section, value: section }));
    }, [products]);

    const metricIntegerGroups = useMemo(() => {
        if (!metricOringSections.length) return [];
        const groups = [...new Set(metricOringSections.map(s => Math.floor(parseFloat(s.value))))];
        return groups.sort((a, b) => a - b);
    }, [metricOringSections]);

    const placeholderProductData = {
        id: 'placeholder-promo',
        clave: 'PLACEHOLDER',
        descripcion: 'Producto en Promoción',
        precio: '99.99',
        imageUrl: '/Sugeridos/KIT.jpg',
        slogan: '¡Gran Oferta!',
        originalPrice: '120.00',
        productData: { /* minimal data for cart */ }
    };

    const handleSystemClick = (system) => {
        if (selectedMeasurementSystem === system) {
            setSelectedProfile(null);
            setSelectedSection(null);
            setSelectedMetricGroup(null);
        } else {
            setSelectedMeasurementSystem(system);
            setSelectedProfile(null);
            setSelectedSection(null);
            setSelectedMetricGroup(null);
        }
    };

    const handleProfileClick = (profile) => {
        if (selectedProfile === profile) {
            setSelectedSection(null);
            setSelectedMetricGroup(null);
        } else {
            setSelectedProfile(profile);
            setSelectedSection(null);
            setSelectedMetricGroup(null);
        }
    };

    const handleMetricGroupClick = (group) => {
        if (selectedMetricGroup === group) {
            setSelectedSection(null);
        } else {
            setSelectedMetricGroup(group);
            setSelectedSection(null);
        }
    };

    const handleSectionClick = (value) => {
        const newSection = selectedSection === value ? null : value;
        setSelectedSection(newSection);
        if (newSection !== null) {
            setShowMaterialIllustrator(false);
        }
    };

    const renderSectionFilters = (options) => (
        <div className={styles.subFilterContainer} style={{ paddingLeft: '15px' }}>
            {options.map(option => (
                (selectedSection === null || selectedSection === option.value) && (
                    <a
                        key={option.value}
                        href="#"
                        className={`${styles.filterButton} ${selectedSection === option.value ? styles.selectedButton : ''} ${selectedSection === option.value ? styles.noIndentDeep : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            handleSectionClick(option.value);
                        }}
                    >
                        {option.label}
                    </a>
                )
            ))}
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <div className={styles.leftColumn}>
                <aside className={styles.sidebar}>
                    <h2 className={styles.mainFilterTitle}>Orings y Respaldos</h2>
                    <h3 className={styles.filterTitle}>Sistema de medición</h3>
                    <div className={styles.filterButtonContainer}>
                        {selectedMeasurementSystem === null && (
                            <>
                                <a
                                    href="#"
                                    className={`${styles.filterButton} ${selectedMeasurementSystem === 'Estándar' ? styles.selectedButton : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSystemClick('Estándar');
                                    }}
                                >
                                    <span className={styles.iconContainer}>
                                        {selectedMeasurementSystem === 'Estándar' && <FiChevronLeft className={styles.chevron} />}
                                    </span>
                                    <span className={styles.filterText}>Estándar</span>
                                </a>
                                <a
                                    href="#"
                                    className={`${styles.filterButton} ${selectedMeasurementSystem === 'Milimétrico' ? styles.selectedButton : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSystemClick('Milimétrico');
                                    }}
                                >
                                    <span className={styles.iconContainer}>
                                        {selectedMeasurementSystem === 'Milimétrico' && <FiChevronLeft className={styles.chevron} />}
                                    </span>
                                    <span className={styles.filterText}>Milimétrico</span>
                                </a>
                            </>
                        )}

                        {selectedMeasurementSystem === 'Estándar' && (
                            <>
                                <a
                                    href="#"
                                    className={`${styles.filterButton} ${styles.selectedButton}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSystemClick('Estándar');
                                    }}
                                >
                                    <span className={styles.iconContainer}>
                                        <FiChevronLeft className={styles.chevron} />
                                    </span>
                                    <span className={styles.filterText}>Estándar</span>
                                </a>
                                {selectedMeasurementSystem === 'Estándar' && (
                                    <div className={styles.subFilterContainer}>
                                        {selectedProfile === null || selectedProfile === 'Orings' ? (
                                            <a
                                                href="#"
                                                className={`${styles.filterButton} ${selectedProfile === 'Orings' ? styles.selectedButton : ''} ${selectedProfile === 'Orings' ? styles.noIndent : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleProfileClick('Orings');
                                                }}
                                            >
                                                <span className={styles.iconContainer}>
                                                    {selectedProfile === 'Orings' && <FiChevronLeft className={styles.chevron} />}
                                                </span>
                                                <span className={styles.filterText}>Orings</span>
                                            </a>
                                        ) : null}
                                        {selectedProfile === 'Orings' && renderSectionFilters(sectionOptions)}

                                        {selectedProfile === null || selectedProfile === 'Respaldos' ? (
                                            <a
                                                href="#"
                                                className={`${styles.filterButton} ${selectedProfile === 'Respaldos' ? styles.selectedButton : ''} ${selectedProfile === 'Respaldos' ? styles.noIndent : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleProfileClick('Respaldos');
                                                }}
                                            >
                                                <span className={styles.iconContainer}>
                                                    {selectedProfile === 'Respaldos' && <FiChevronLeft className={styles.chevron} />}
                                                </span>
                                                <span className={styles.filterText}>Respaldos</span>
                                            </a>
                                        ) : null}
                                        {selectedProfile === 'Respaldos' && renderSectionFilters(sectionOptions)}
                                    </div>
                                )}
                            </>
                        )}

                        {selectedMeasurementSystem === 'Milimétrico' && (
                            <>
                                <a
                                    href="#"
                                    className={`${styles.filterButton} ${styles.selectedButton}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSystemClick('Milimétrico');
                                    }}
                                >
                                    <span className={styles.iconContainer}>
                                        <FiChevronLeft className={styles.chevron} />
                                    </span>
                                    <span className={styles.filterText}>Milimétrico</span>
                                </a>
                                {selectedMeasurementSystem === 'Milimétrico' && (
                                    <div className={styles.subFilterContainer}>
                                        {isLoading ? <p>Cargando...</p> : error ? <p>Error</p> : (
                                            <>
                                                {selectedProfile === null || selectedProfile === 'Orings-mm' ? (
                                                    <a
                                                        href="#"
                                                        className={`${styles.filterButton} ${selectedProfile === 'Orings-mm' ? styles.selectedButton : ''} ${selectedProfile === 'Orings-mm' ? styles.noIndent : ''}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleProfileClick('Orings-mm');
                                                        }}
                                                    >
                                                        <span className={styles.iconContainer}>
                                                            {selectedProfile === 'Orings-mm' && <FiChevronLeft className={styles.chevron} />}
                                                        </span>
                                                        <span className={styles.filterText}>Orings</span>
                                                    </a>
                                                ) : null}
                                                
                                                {selectedProfile === 'Orings-mm' && (
                                                    <div>
                                                        {metricIntegerGroups.map(group => {
                                                            const sectionsInGroup = metricOringSections.filter(s => Math.floor(parseFloat(s.value)) === group);
                                                            const min = sectionsInGroup[0].value;
                                                            const max = sectionsInGroup[sectionsInGroup.length - 1].value;
                                                            const label = sectionsInGroup.length === 1
                                                                ? `Sección de ${min} mm`
                                                                : `Secciones de ${min} a ${max} mm`;

                                                            return (
                                                                (selectedMetricGroup === null || selectedMetricGroup === group) && (
                                                                    <div key={group}>
                                                                        <a
                                                                            href="#"
                                                                            className={`${styles.filterButton} ${selectedMetricGroup === group ? styles.selectedButton : ''} ${selectedMetricGroup === group ? styles.noIndentDeep : ''}`}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                handleMetricGroupClick(group);
                                                                            }}
                                                                        >
                                                                            <span className={styles.iconContainer}>
                                                                                {selectedMetricGroup === group && <FiChevronLeft className={styles.chevron} />}
                                                                            </span>
                                                                            <span className={styles.filterText}>{label}</span>
                                                                        </a>
                                                                        {selectedMetricGroup === group && (
                                                                            <div className={styles.subFilterContainer} style={{ paddingLeft: '15px' }}>
                                                                                {sectionsInGroup.map(option => (
                                                                                    (selectedSection === null || selectedSection === option.value) && (
                                                                                        <a
                                                                                            key={option.value}
                                                                                            href="#"
                                                                                            className={`${styles.filterButton} ${selectedSection === option.value ? styles.selectedButton : ''} ${selectedSection === option.value ? styles.noIndentDeep : ''}`}
                                                                                            onClick={(e) => {
                                                                                                e.preventDefault();
                                                                                                handleSectionClick(option.value);
                                                                                            }}
                                                                                        >
                                                                                            {option.label} mm
                                                                                        </a>
                                                                                    )
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {selectedMeasurementSystem !== null && (
                            <button
                                className={styles.clearFiltersButton}
                                onClick={() => {
                                    handleSystemClick(null); // Reset all
                                }}
                            >
                                <FiXCircle className={styles.clearIcon} />
                                <span className={styles.clearText}>Limpiar Filtros</span>
                            </button>
                        )}
                    </div>
                </aside>
                <div className={styles.promoSection}>
                    <hr className={styles.divider} />
                    <AnuncioPuntual
                        key={placeholderProductData.id}
                        imageUrl={placeholderProductData.imageUrl}
                        slogan={placeholderProductData.slogan}
                        precio={placeholderProductData.precio}
                        originalPrice={placeholderProductData.originalPrice}
                        productData={placeholderProductData.productData}
                    />
                </div>
            </div>
            <main className={styles.mainContent}>
                {showMaterialIllustrator && (
                    <div style={{paddingTop: "30px", paddingBottom: "30px"}}>
                        <MaterialIllustrator />
                    </div>
                )}
            </main>
        </div>
    );
};

export default OringsPage;
