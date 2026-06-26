import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const variantCount = product.variants?.length || 0;
  const isInStock = product.variants?.some((variant) => variant.inStock);
  const image = product.mainImage || product.galleryImages?.[0] || "/omsons-logo.jpg";

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={image} alt={product.name} className={styles.image} />
      </div>
      <div className={styles.body}>
        <div className={styles.badgeRow}>
          {product.category ? <span className={styles.badge}>{product.category}</span> : null}
          {isInStock ? <span className={`${styles.badge} ${styles.status}`}>In Stock</span> : null}
        </div>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.description}>
          {product.shortDescription || product.description || "No description available for this item."}
        </p>
        <div className={styles.meta}>
          {product.sku ? <span>SKU: {product.sku}</span> : null}
          {variantCount ? <span>{variantCount} variant{variantCount !== 1 ? "s" : ""}</span> : null}
        </div>
        <Link href={appRoutes.product(product.slug)} className={styles.button}>
          View Details
        </Link>
      </div>
    </article>
  );
}