"use client";

import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import ProductCard from "./ProductCard";
import ProductGallery from "./ProductGallery";
import styles from "./ProductDetailClient.module.css";

export default function ProductDetailClient({ product, relatedProducts = [] }) {
  const tableColumns = product.tableColumns || product.category?.tableColumns || [];
  const visibleRows = (product.rows || []).filter((row) =>
    tableColumns.some((column) => String(row.values?.[column] || "").trim())
  );
  const firstRow = visibleRows[0]?.values || {};
  const summaryItems = tableColumns
    .filter((column) => column !== "Cat. No.")
    .map((column) => ({ label: column, value: firstRow[column] || "" }))
    .filter((item) => item.value);

  const hasVariants = visibleRows.length > 0;
  const isInStock = product.variants?.some((v) => v.inStock) ?? true;

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link href={appRoutes.home}>Home</Link>
        <span>/</span>
        <Link href={appRoutes.products}>Products</Link>
        {product.category?.slug ? (
          <>
            <span>/</span>
            <Link href={appRoutes.category(product.category.slug)}>
              {product.category.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span>{product.name}</span>
      </div>

      {/* Hero: two-column layout */}
      <section className={styles.hero}>
        {/* Left: gallery then icon strip */}
        <div className={styles.heroLeft}>
          <div className={styles.galleryCard}>
            <ProductGallery product={product} />
          </div>

          {product.icons?.length ? (
            <div className={styles.iconRail}>
              {product.icons.map((icon, index) => (
                <div key={`${icon.label}-${index}`} className={styles.iconItem}>
                  {icon.imageUrl ? (
                    <img src={icon.imageUrl} alt={icon.label} className={styles.iconImage} />
                  ) : (
                    <span className={styles.iconFallback}>{icon.label}</span>
                  )}
                  <span className={styles.iconLabel}>{icon.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.summary}>
          <div className={styles.taxonomy}>
            {product.category?.name ? <span>{product.category.name}</span> : null}
            {(product.technicalTags || []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <p className={styles.copy}>
            {product.description || "Detailed product information available for this item."}
          </p>

          {product.bulletPoints?.length ? (
            <div>
              <p className={styles.sectionLabel}>About this item</p>
              <ul className={styles.featureList}>
                {product.bulletPoints.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {summaryItems.length ? (
            <dl className={styles.statsGrid}>
              {summaryItems.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <aside className={styles.actionCard}>
          <div className={styles.actionStats}>
            <div className={styles.actionStat}>
              <p className={styles.actionTitle}>Availability</p>
              <p className={`${styles.actionValue} ${isInStock ? styles.stock : styles.stockMuted}`}>
                {isInStock ? "In Stock" : "On Request"}
              </p>
            </div>
            <div className={styles.actionStat}>
              <p className={styles.actionTitle}>Variants</p>
              <p className={styles.actionValue}>{visibleRows.length}</p>
            </div>
            <div className={styles.actionStat}>
              <p className={styles.actionTitle}>Category</p>
              <p className={styles.actionValue}>{product.category?.name || "Catalogue"}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <button type="button" className={styles.cta}>
            Enquire Now
          </button>
          <button type="button" className={`${styles.cta} ${styles.ctaSecondary}`}>
            Request Catalogue
          </button>

          <p className={styles.actionNote}>
            Contact us for pricing and bulk order details.
          </p>
        </aside>
      </section>
      {/* Specs table */}
      {hasVariants ? (
        <section className={styles.specsCard}>
          <h2 className={styles.blockTitle}>Variants &amp; Specifications</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {tableColumns.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row._id}>
                    {tableColumns.map((header) => (
                      <td key={header}>{row.values?.[header] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Related products */}
      {relatedProducts.length ? (
        <section className={styles.relatedCard}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.blockTitle}>Related Products</h2>
            {product.category?.slug ? (
              <Link href={appRoutes.category(product.category.slug)}>
                View all in {product.category.name} →
              </Link>
            ) : null}
          </div>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
