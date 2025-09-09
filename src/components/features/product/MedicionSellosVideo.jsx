import React, { useState } from 'react';
import styles from './MedicionSellosVideo.module.css';
import Modal from '@/components/common/Modal';

const MedicionSellosVideo = () => {
  const videoId = 'YBvVkUPmLZE';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`; // Autoplay when in modal
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={styles.container}>
      <p className={styles.text}>¿Tienes duda de las medidas de tu sello?</p>
      <div className={styles.videoWrapper} onClick={openModal}>
        <img src={thumbnailUrl} alt="Video Thumbnail" className={styles.thumbnail} />
        <div className={styles.playButton}>▶</div>
      </div>
      <a href={watchUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
        Mide tu sello de esta forma
      </a>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="video">
        <div className={styles.modalVideoWrapper}>
          <iframe
            className={styles.modalVideoFrame}
            src={embedUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Cómo medir un sello"
          ></iframe>
        </div>
      </Modal>
    </div>
  );
};

export default MedicionSellosVideo;
