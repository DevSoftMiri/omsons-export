"use client";

import { useMemo, useState } from "react";
import styles from "./ProductGallery.module.css";

export default function ProductGallery({ product }) {
  const images = useMemo(() => {
    const galleryImages = Array.isArray(product.galleryImages)
      ? product.galleryImages.filter((image) => String(image || "").trim())
      : [];
    const combined = [product.imageUrl, ...galleryImages].filter((image) => String(image || "").trim());
    return [...new Set(combined)];
  }, [product.galleryImages, product.imageUrl]);

  const [activeImage, setActiveImage] = useState(images[0] || "/omsons-logo.jpg");

  return (
    <section className={styles.wrap}>
      <div className={styles.imageFrame}>
        <img src={activeImage} alt={product.name} className={styles.mainImage} />
      </div>

      {images.length > 1 ? (
        <div className={styles.thumbnailRow}>
          {images.map((imageUrl) => (
            <button
              key={imageUrl}
              type="button"
              onClick={() => setActiveImage(imageUrl)}
              className={`${styles.thumbnailButton} ${
                activeImage === imageUrl ? styles.thumbnailButtonActive : ""
              }`}
            >
              <img src={imageUrl} alt={product.name} className={styles.thumbnailImage} />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
