import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const image = product.imageUrl || "/omsons-logo.jpg";
  const rowCount = product.rows?.length || 0;
  const categoryLabel = product.category?.name || "Catalogue product";
  const catNo = product.rows?.[0]?.values?.["Cat. No."] || product.slug;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={image} alt={product.name} className={styles.image} />
      </div>
      <div className={styles.body}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{categoryLabel}</span>
          {rowCount ? <span className={`${styles.badge} ${styles.status}`}>{rowCount} rows</span> : null}
        </div>
        <h3 className={styles.title}>{product.name}</h3>
        <div className={styles.meta}>
          <span>{`Cat. No. ${catNo}`}</span>
          <span>{rowCount} variant{rowCount !== 1 ? "s" : ""}</span>
        </div>
        <Link href={appRoutes.product(product.slug)} className={styles.button}>
          View Details
        </Link>
      </div>
    </article>
  );
}
