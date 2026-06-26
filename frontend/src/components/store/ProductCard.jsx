import Link from "next/link";
import { appRoutes } from "@/lib/routes";

export default function ProductCard({ product }) {
  return (
    <article style={styles.card}>
      <img src={product.mainImage} alt={product.name} style={styles.image} />
      <div style={styles.body}>
        <p style={styles.category}>{product.mainCategory || product.category}</p>
        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.description}>{product.shortDescription}</p>
        <Link href={appRoutes.product(product.slug)} style={styles.button}>
          View Product
        </Link>
      </div>
    </article>
  );
}

const styles = {
  card: {
    display: "grid",
    gap: "1rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    background: "#ffffff",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "16rem",
    objectFit: "cover",
    background: "#f8fafc",
  },
  body: {
    display: "grid",
    gap: "0.75rem",
    padding: "1rem",
  },
  category: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.9rem",
  },
  title: {
    margin: 0,
    color: "#0f172a",
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  button: {
    width: "fit-content",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    background: "#0f172a",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 600,
  },
};
