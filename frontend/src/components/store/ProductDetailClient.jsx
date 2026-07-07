"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { appRoutes } from "@/lib/routes";
import ProductCard from "./ProductCard";
import ProductGallery from "./ProductGallery";
import styles from "./ProductDetailClient.module.css";

const SECTION_DEFINITIONS = [
  {
    id: "variants",
    chipLabel: "Variants & Specifications",
    title: "Variants & Specifications",
    badge: "VS",
  },
  {
    id: "itemsSupplied",
    chipLabel: "Items Supplied",
    title: "Items Supplied",
    badge: "IS",
  },
  {
    id: "accessories",
    chipLabel: "Accessories",
    title: "Accessories & Spare Parts",
    badge: "AS",
  },
  {
    id: "charts",
    chipLabel: "Selection Charts",
    title: "Selection Charts",
    badge: "SC",
  },
  {
    id: "videos",
    chipLabel: "Videos",
    title: "Videos",
    badge: "VD",
  },
  {
    id: "downloads",
    chipLabel: "Downloads",
    title: "Downloads",
    badge: "DL",
  },
];

const DEFAULT_OPEN_SECTIONS = {
  variants: true,
  itemsSupplied: false,
  accessories: false,
  charts: false,
  videos: false,
  downloads: false,
};

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
  const isInStock = product.variants?.some((variant) => variant.inStock) ?? true;
  const itemsSupplied = product.itemsSupplied?.length
    ? product.itemsSupplied
    : product.bulletPoints || [];
  const accessoriesSpareParts = product.accessoriesSpareParts || [];
  const selectionCharts = product.selectionCharts || [];
  const videos = product.videos || [];
  const downloads = product.downloads || [];

  const sections = useMemo(() => SECTION_DEFINITIONS, []);
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);

  function toggleSection(sectionId) {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }

  function openAndScroll(sectionId) {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: true,
    }));

    if (typeof document !== "undefined") {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <div className={styles.page}>
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

      <section className={styles.hero}>
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

      <section className={styles.detailSections}>
        <div className={styles.sectionPillRow}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => openAndScroll(section.id)}
              className={`${styles.sectionPill} ${
                openSections[section.id] ? styles.sectionPillActive : ""
              }`}
            >
              <span className={styles.sectionPillBadge}>{section.badge}</span>
              <span>{section.chipLabel}</span>
            </button>
          ))}
        </div>

        {sections.map((section) => (
          <section key={section.id} id={section.id} className={styles.accordionCard}>
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className={styles.accordionHeader}
            >
              <span className={styles.accordionTitle}>{section.title}</span>
              <span className={styles.accordionToggle}>
                {openSections[section.id] ? "-" : "+"}
              </span>
            </button>

            {openSections[section.id] ? (
              <div className={styles.accordionBody}>
                {section.id === "variants" ? (
                  hasVariants ? (
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
                                <td key={header}>{row.values?.[header] || "-"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={styles.emptySection}>No variant specifications available yet.</p>
                  )
                ) : null}

                {section.id === "itemsSupplied" ? (
                  itemsSupplied.length ? (
                    <ul className={styles.sectionList}>
                      {itemsSupplied.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptySection}>Items supplied information will be added soon.</p>
                  )
                ) : null}

                {section.id === "accessories" ? (
                  accessoriesSpareParts.length ? (
                    <ul className={styles.sectionList}>
                      {accessoriesSpareParts.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptySection}>No accessories or spare parts listed for this product.</p>
                  )
                ) : null}

                {section.id === "charts" ? (
                  selectionCharts.length ? (
                    <div className={styles.linkGrid}>
                      {selectionCharts.map((item) => (
                        <a
                          key={item}
                          href={item}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.resourceLink}
                        >
                          {getResourceLabel(item)}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptySection}>Selection charts are not available for this product yet.</p>
                  )
                ) : null}

                {section.id === "videos" ? (
                  videos.length ? (
                    <div className={styles.linkGrid}>
                      {videos.map((item) => (
                        <a
                          key={item}
                          href={item}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.resourceLink}
                        >
                          {getResourceLabel(item)}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptySection}>Videos are not available for this product yet.</p>
                  )
                ) : null}

                {section.id === "downloads" ? (
                  downloads.length ? (
                    <div className={styles.linkGrid}>
                      {downloads.map((item) => (
                        <a
                          key={item}
                          href={item}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.resourceLink}
                        >
                          {getResourceLabel(item)}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptySection}>Downloads are not available for this product yet.</p>
                  )
                ) : null}
              </div>
            ) : null}
          </section>
        ))}
      </section>

      {relatedProducts.length ? (
        <section className={styles.relatedCard}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.blockTitle}>Related Products</h2>
            {product.category?.slug ? (
              <Link href={appRoutes.category(product.category.slug)}>
                View all in {product.category.name}
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

function getResourceLabel(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "Open resource";
  }

  try {
    const { pathname } = new URL(normalized);
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    return lastSegment || normalized;
  } catch (_error) {
    return normalized;
  }
}
