export default function ProductGallery({ product }) {
  const images = [product.mainImage, ...(product.galleryImages || [])].filter(Boolean);

  return (
    <section style={styles.wrap}>
      <img src={images[0]} alt={product.name} style={styles.mainImage} />
      <div style={styles.thumbGrid}>
        {images.map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt={`${product.name} ${index + 1}`} style={styles.thumb} />
        ))}
      </div>
    </section>
  );
}

const styles = {
  wrap: {
    display: "grid",
    gap: "1rem",
  },
  mainImage: {
    width: "100%",
    height: "28rem",
    objectFit: "cover",
    borderRadius: "0.5rem",
    background: "#f8fafc",
  },
  thumbGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(6rem, 1fr))",
    gap: "0.75rem",
  },
  thumb: {
    width: "100%",
    height: "6rem",
    objectFit: "cover",
    borderRadius: "0.5rem",
    background: "#f8fafc",
  },
};
