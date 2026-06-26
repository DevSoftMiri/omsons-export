"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import ProductCard from "./ProductCard";
import ProductGallery from "./ProductGallery";
import styles from "./ProductDetailClient.module.css";

export default function ProductDetailClient({ product, relatedProducts = [] }) {
  const variantOptions = product.variants || [];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const selectedVariant = variantOptions[selectedVariantIndex] || null;
  const specRows = useMemo(
    () => buildSpecificationRows(product, selectedVariant),
    [product, selectedVariant]
  );
  const tableHeaders = useMemo(() => collectSpecHeaders(variantOptions), [variantOptions]);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href={appRoutes.home}>Home</Link>
        <span>/</span>
        <Link href={appRoutes.products}>Products</Link>
        {product.category ? (
          <>
            <span>/</span>
            <Link href={appRoutes.category(product.category)}>{toTitleCase(product.category)}</Link>
          </>
        ) : null}
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className={styles.hero}>
        <div className={styles.galleryCard}>
          <ProductGallery product={product} />
        </div>

        <div className={styles.summary}>
          <div className={styles.taxonomy}>
            {product.category ? <span>{product.category}</span> : null}
            {product.mainCategory ? <span>{product.mainCategory}</span> : null}
          </div>
          {product.sku ? <p className={styles.sku}>SKU: {product.sku}</p> : null}
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.copy}>
            {product.description || product.shortDescription || "Backend product details available for this item."}
          </p>

          {product.features?.length ? (
            <div>
              <p className={styles.sectionLabel}>About This Item</p>
              <ul className={styles.featureList}>
                {product.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {variantOptions.length ? (
            <div className={styles.variantWrap}>
              <p className={styles.sectionLabel}>
                Select Variant ({selectedVariantIndex + 1}/{variantOptions.length})
              </p>
              <div className={styles.variantGrid}>
                {variantOptions.map((variant, index) => (
                  <button
                    key={variant.externalId || variant.sku || `${variant.name}-${index}`}
                    type="button"
                    className={`${styles.variantButton} ${index === selectedVariantIndex ? styles.variantButtonActive : ""}`}
                    onClick={() => setSelectedVariantIndex(index)}
                  >
                    {variant.name || variant.sku || `Variant ${index + 1}`}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {specRows.length ? (
            <dl className={styles.statsGrid}>
              {specRows.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <aside className={styles.actionCard}>
          <div className={styles.actionStat}>
            <p className={styles.actionTitle}>Availability</p>
            <p className={`${styles.actionValue} ${selectedVariant?.inStock ? styles.stock : styles.stockMuted}`}>
              {selectedVariant?.inStock ? "In Stock" : "Contact For Availability"}
            </p>
          </div>
          <div className={styles.actionStat}>
            <p className={styles.actionTitle}>Ships from</p>
            <p className={styles.actionValue} style={{ fontSize: "16px" }}>
              Delhi · Mumbai · Chennai
            </p>
          </div>
          <button type="button" className={styles.cta}>
            Enquire Now
          </button>
          <button type="button" className={`${styles.cta} ${styles.ctaSecondary}`}>
            Request Catalogue
          </button>
          <p className={styles.copy}>
            Pricing is intentionally hidden on the detail view for now, as requested.
          </p>
        </aside>
      </section>

      {variantOptions.length ? (
        <section className={styles.specsCard}>
          <h2 className={styles.blockTitle}>Variants & Specifications</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>SKU</th>
                  {tableHeaders.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                  <th>Pack</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {variantOptions.map((variant, index) => (
                  <tr key={variant.externalId || variant.sku || `${variant.name}-${index}`}>
                    <td>{variant.name || `Variant ${index + 1}`}</td>
                    <td>{variant.sku || "-"}</td>
                    {tableHeaders.map((header) => (
                      <td key={header}>{variant.specs?.[header] || "-"}</td>
                    ))}
                    <td>{variant.pack ?? "-"}</td>
                    <td>{variant.inStock ? "In stock" : "On request"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className={styles.relatedCard}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.blockTitle}>Related Products</h2>
            {product.category ? (
              <Link href={appRoutes.category(product.category)}>View All →</Link>
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

function buildSpecificationRows(product, selectedVariant) {
  const rows = [];

  if (product.externalId) {
    rows.push({ label: "Catalogue No.", value: product.externalId });
  }

  if (selectedVariant?.sku) {
    rows.push({ label: "Variant SKU", value: selectedVariant.sku });
  }

  for (const [key, value] of Object.entries(selectedVariant?.specs || {})) {
    if (value) {
      rows.push({ label: key, value });
    }
  }

  if (selectedVariant?.pack !== undefined) {
    rows.push({ label: "Pack", value: String(selectedVariant.pack) });
  }

  if (selectedVariant?.inStock !== undefined) {
    rows.push({
      label: "Availability",
      value: selectedVariant.inStock ? "In Stock" : "On Request",
    });
  }

  return rows;
}

function collectSpecHeaders(variants) {
  return Array.from(
    new Set(
      variants.flatMap((variant) =>
        Object.keys(variant.specs && typeof variant.specs === "object" ? variant.specs : {})
      )
    )
  );
}

function toTitleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
