import styles from "./ProductGallery.module.css";

export default function ProductGallery({ product }) {
  const galleryImages = Array.isArray(product.galleryImages)
    ? product.galleryImages.filter((image) => String(image || "").trim())
    : [];
  const primaryImage = product.imageUrl || galleryImages[0] || "/omsons-logo.jpg";

  return (
    <section className={styles.wrap}>
      <div className={styles.imageFrame}>
        <img src={primaryImage} alt={product.name} className={styles.mainImage} />
      </div>
    </section>
  );
}
