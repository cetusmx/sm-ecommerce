import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOringsRespaldos } from '@/api/productsApi';
import { FiChevronLeft, FiXCircle, FiFilter } from 'react-icons/fi';
import styles from './OringsPage.module.css';
import PromoProductDisplay from '@/components/common/PromoProductDisplay';
import MaterialIllustrator from '@/components/features/product/MaterialIllustrator';
import OringsSearchResults from '@/components/features/product/OringsSearchResults';

const sectionOptions = [
    { label: 'Sección 1/16 pulgada', value: '0.062' },
    { label: 'Sección 3/32 pulgada', value: '0.093' },
    { label: 'Sección 1/8 pulgada', value: '0.125' },
    { label: 'Sección 3/16 pulgada', value: '0.187' },
    { label: 'Sección 1/4 pulgada', value: '0.25' }
];

const OringsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // State is now derived from URL search params
    const selectedMeasurementSystem = searchParams.get('system');
    const selectedProfile = searchParams.get('profile');
    const selectedSection = searchParams.get('section');
    const selectedMetricGroup = searchParams.get('group');

    const [searchResults, setSearchResults] = useState(null);
    const [showMaterialIllustrator, setShowMaterialIllustrator] = useState(true);

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['orings-respaldos'],
        queryFn: fetchOringsRespaldos
    });

    // This useEffect handles the filtering logic whenever the URL or products data changes.
    useEffect(() => {
        if (selectedSection && products) {
            setShowMaterialIllustrator(false);
            const systemFilter = selectedMeasurementSystem === 'Estándar' ? 'std' : 'mm';
            const profileFilter = selectedProfile === 'Respaldos' ? 'RESPALDO' : 'ORING';
            
            const results = products.filter(p => {
                if (!p.sistema_medicion || !p.perfil || !p.seccion) {
                    return false;
                }
                const systemMatch = p.sistema_medicion.trim().toLowerCase() === systemFilter;
                const profileMatch = p.perfil.trim().toUpperCase() === profileFilter;
                const sectionMatch = p.seccion.trim() === selectedSection;
                
                return systemMatch && profileMatch && sectionMatch;
            }).sort((a, b) => { // Add sorting by diam_int
                const diamIntA = parseFloat(a.diam_int);
                const diamIntB = parseFloat(b.diam_int);
                if (isNaN(diamIntA) && isNaN(diamIntB)) return 0;
                if (isNaN(diamIntA)) return 1; // Push NaN to end
                if (isNaN(diamIntB)) return -1; // Push NaN to end
                return diamIntA - diamIntB;
            });
            setSearchResults(results);
        } else {
            setShowMaterialIllustrator(true);
            setSearchResults(null);
        }
    }, [selectedMeasurementSystem, selectedProfile, selectedSection, products]); // Dependencies drive the search

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



    // Click handlers now update the URL search params
    const handleSystemClick = (system) => {
        const newParams = new URLSearchParams();
        if (selectedMeasurementSystem !== system) {
            newParams.set('system', system);
        }
        setSearchParams(newParams);
    };

    const handleProfileClick = (profile) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedProfile === profile) {
            newParams.delete('profile');
            newParams.delete('section');
            newParams.delete('group');
        } else {
            newParams.set('profile', profile);
            newParams.delete('section');
            newParams.delete('group');
        }
        setSearchParams(newParams);
    };

    const handleMetricGroupClick = (group) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedMetricGroup === group) {
            newParams.delete('group');
            newParams.delete('section');
        } else {
            newParams.set('group', group);
            newParams.delete('section');
        }
        setSearchParams(newParams);
    };

    const handleSectionClick = (value) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedSection === value) {
            newParams.delete('section');
        } else {
            newParams.set('section', value);
        }
        setSearchParams(newParams);
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
                    <h3 className={styles.filterTitle}><FiFilter className={styles.filterIcon} /> Sistema de medición</h3>
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
                                                                (selectedMetricGroup === null || selectedMetricGroup === group.toString()) && (
                                                                    <div key={group}>
                                                                        <a
                                                                            href="#"
                                                                            className={`${styles.filterButton} ${selectedMetricGroup === group.toString() ? styles.selectedButton : ''} ${selectedMetricGroup === group.toString() ? styles.noIndentDeep : ''}`}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                handleMetricGroupClick(group.toString());
                                                                            }}
                                                                        >
                                                                            <span className={styles.iconContainer}>
                                                                                {selectedMetricGroup === group.toString() && <FiChevronLeft className={styles.chevron} />}
                                                                            </span>
                                                                            <span className={styles.filterText}>{label}</span>
                                                                        </a>
                                                                        {selectedMetricGroup === group.toString() && (
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
                                    setSearchParams({}); // Reset all params
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
                    <PromoProductDisplay />
                </div>
            </div>
            <main className={styles.mainContent}>
                {searchResults && searchResults.length > 0 && (
                    <OringsSearchResults results={searchResults} selectedProfile={selectedProfile} />
                )}
                {searchResults && searchResults.length === 0 && (
                    <div style={{padding: "40px", textAlign: "center"}}>
                        <p>No se encontraron productos con los filtros seleccionados.</p>
                    </div>
                )}
                {!searchResults && showMaterialIllustrator && (
                    <div>
                        <MaterialIllustrator />
                    </div>
                )}
            </main>
        </div>
    );
};

export default OringsPage;
