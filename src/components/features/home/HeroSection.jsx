import React, { useState } from "react";
import styles from "./HeroSection.module.css";
/* import banner1 from "@/assets/banner1.jpg"; */
import banner2 from "@/assets/banner2.jpg";
/* import banner3 from "@/assets/banner3.jpg"; */
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  //const images = [banner1, banner2, banner3];
  const images = [banner2];

  const goToPreviousSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className={styles['hero-section']}>
      <div className={styles['carousel-wrapper']}>
        <button className={`${styles['carousel-control']} ${styles.prev}`} onClick={goToPreviousSlide}>
          <FaChevronLeft />
        </button>
        <div
          className={styles.carousel}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={styles['hero-slide-item']} // Use the new, non-conflicting class name
              style={{ backgroundImage: `url(${image})` }}
            >
              {/* <div className="banner-content">
                <h2>Título del Banner {index + 1}</h2>
                <p>Descripción del Banner {index + 1}.</p>
                <button className="btn btn-primary">Ver más</button>
              </div> */}
            </div>
          ))}
        </div>
        <button className={`${styles['carousel-control']} ${styles.next}`} onClick={goToNextSlide}>
          <FaChevronRight />
        </button>
      </div>
      <div className={styles['carousel-indicators']}>
        {images.map((_, index) => (
          <button
            key={index}
            className={index === currentIndex ? "active" : ""}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;