export default function ProductGallery({ product }) {
  const images = [product.imageUrl].filter(Boolean);
  const normalizedImages = images.length ? images : ["/omsons-logo.jpg"];

  return (
    <section style={styles.wrap}>
      <img src={normalizedImages[0]} alt={product.name} style={styles.mainImage} />
      <div style={styles.thumbGrid}>
        {normalizedImages.map((image, index) => (
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
    height: "20rem",
    objectFit: "contain",
    borderRadius: "0.9rem",
    background: "linear-gradient(180deg, #fcfdff 0%, #f3f7fd 100%)",
  },
  thumbGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(4.5rem, 1fr))",
    gap: "0.6rem",
  },
  thumb: {
    width: "100%",
    height: "4.25rem",
    objectFit: "contain",
    borderRadius: "0.7rem",
    background: "linear-gradient(180deg, #fcfdff 0%, #f3f7fd 100%)",
  },
};
