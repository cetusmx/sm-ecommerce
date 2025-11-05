import React, { useState, useEffect } from 'react';
import { FaAngleDoubleUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.pageYOffset > 400) {
                setShowScroll(true);
            } else if (showScroll && window.pageYOffset <= 400) {
                setShowScroll(false);
            }
        };

        window.addEventListener('scroll', checkScrollTop);
        return () => {
            window.removeEventListener('scroll', checkScrollTop);
        };
    }, [showScroll]);

    const scrollTop = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const buttonStyle = {
        position: 'fixed',
        bottom: '80px',
        right: '25px',
        transition: 'all 0.3s ease',
        zIndex: 100,
        border: '1px solid #007bff',
        width: '50px',
        height: '50px',
        padding: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        color: '#007bff',
        fontSize: '18px',
        cursor: 'pointer'
    };

    return (
        <>
            {showScroll && (
                <button onClick={scrollTop} style={buttonStyle}>
                    <FaAngleDoubleUp />
                </button>
            )}
        </>
    );
};

export default ScrollToTopButton;
