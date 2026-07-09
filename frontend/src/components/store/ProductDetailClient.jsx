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
  const visibleColumns = tableColumns.filter((column) =>
    visibleRows.some((row) => hasDisplayValue(row.values?.[column]))
  );

  const hasVariants = visibleRows.length > 0;
  const isInStock = product.variants?.some((variant) => variant.inStock) ?? true;
  const itemsSupplied = product.itemsSupplied?.length
    ? product.itemsSupplied
    : product.bulletPoints || [];
  const accessoriesSpareParts = product.accessoriesSpareParts || [];
  const selectionCharts = product.selectionCharts || [];
  const videos = product.videos || [];
  const downloads = product.downloads || [];
  const categoryLabel = formatCategoryLabel(product.category?.name);
  const heroHighlights = [
    `${visibleRows.length || 0} Variant${visibleRows.length === 1 ? "" : "s"}`,
    isInStock ? "Ready to Dispatch" : "Built on Request",
    "Installation Support",
    "ISO Manufactured",
  ];
  const supportItems = [
    { label: "Delivery", value: "Worldwide dispatch support" },
    { label: "Warranty", value: "Coverage on eligible units" },
    { label: "Technical Support", value: "Expert assistance on setup" },
  ];
  const quoteBenefits = [
    "Response within 2 Hours",
    "Technical Assistance",
    "Bulk Order Support",
  ];
  const primaryDownload = downloads[0] || null;

  const sections = useMemo(() => SECTION_DEFINITIONS, []);
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

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

  function openQuoteModal() {
    setIsQuoteModalOpen(true);
  }

  function closeQuoteModal() {
    setIsQuoteModalOpen(false);
  }

  return (
    <>
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
          <div className={styles.panelLabel}>Large Product Gallery</div>
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
          <div className={styles.panelLabel}>Product Details</div>

          <div className={styles.taxonomy}>
            {categoryLabel ? <span>{categoryLabel}</span> : null}
            {(product.technicalTags || []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <p className={styles.heroBadge}>Industrial Grade Equipment</p>

          <div className={styles.copyBlock}>
            <p className={styles.sectionLabel}>Short Description</p>
            <p className={styles.copy}>
              {product.description || "Detailed product information available for this item."}
            </p>
          </div>

          <ul className={styles.premiumChecklist}>
            {heroHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.heroActions}>
            <button type="button" className={styles.cta}>
              Request Quote
            </button>
            {primaryDownload ? (
              <a
                href={primaryDownload}
                target="_blank"
                rel="noreferrer"
                className={`${styles.cta} ${styles.ctaSecondary} ${styles.ctaLink}`}
              >
                Download Catalogue
              </a>
            ) : (
              <button
                type="button"
                className={`${styles.cta} ${styles.ctaSecondary}`}
                onClick={() => openAndScroll("downloads")}
              >
                Download Catalogue
              </button>
            )}
          </div>

          <div className={styles.supportStrip}>
            {supportItems.map((item) => (
              <div key={item.label} className={styles.supportCard}>
                <p className={styles.supportLabel}>{item.label}</p>
                <p className={styles.supportValue}>{item.value}</p>
              </div>
            ))}
          </div>

          <p className={styles.copy}>
            Contact us for pricing, custom configuration, and bulk order timelines.
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
        </div>

        <aside className={styles.stickyQuoteCard}>
          <p className={styles.quoteEyebrow}>Need Pricing?</p>
          <h2 className={styles.quoteTitle}>{product.name}</h2>

          <ul className={styles.quoteBenefits}>
            {quoteBenefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.quoteActions}>
            <button type="button" className={styles.quoteBtn} onClick={openQuoteModal}>
              Get Quote
            </button>
            {primaryDownload ? (
              <a
                href={primaryDownload}
                target="_blank"
                rel="noreferrer"
                className={`${styles.quoteBtn} ${styles.quoteBtnSecondary}`}
              >
                Download Catalogue
              </a>
            ) : (
              <button
                type="button"
                className={`${styles.quoteBtn} ${styles.quoteBtnSecondary}`}
                onClick={() => openAndScroll("downloads")}
              >
                Download Catalogue
              </button>
            )}
          </div>
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
                  hasVariants && visibleColumns.length ? (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            {visibleColumns.map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                            <th>Enquiry</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((row) => (
                            <tr key={row._id}>
                              {visibleColumns.map((header) => (
                                <td key={header}>{formatTableCellValue(row.values?.[header])}</td>
                              ))}
                              <td>
                                <button
                                  type="button"
                                  className={styles.tableEnquiryButton}
                                  onClick={openQuoteModal}
                                >
                                  Enquiry
                                </button>
                              </td>
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
    <div
      id="quoteModal"
      className={`${styles.quoteModal} ${isQuoteModalOpen ? styles.quoteModalActive : ""}`}
      onClick={closeQuoteModal}
    >
      <div className={styles.quoteBox} onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className={styles.quoteClose}
          onClick={closeQuoteModal}
          aria-label="Close quote form"
        >
          ×
        </button>

        <h2>Request a Quote</h2>
        <p>{product.name}</p>

        <form className={styles.quoteForm}>
          <input type="text" placeholder="Your Name" />
          <input type="tel" placeholder="Phone Number" />
          <input type="email" placeholder="Email Address" />
          <input type="text" placeholder="Company Name" />

          <button type="submit" className={styles.quoteSubmit}>
            Submit Enquiry
          </button>
        </form>
      </div>
    </div>
    </>
  );
}

function formatCategoryLabel(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "Laboratory Instrument";
  }

  if (normalized.endsWith("s")) {
    return normalized.slice(0, -1);
  }

  return normalized;
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

function hasDisplayValue(value) {
  const normalized = String(value ?? "").trim();
  return normalized !== "" && normalized !== "-";
}

function formatTableCellValue(value) {
  const normalized = String(value ?? "").trim();
  return normalized || "-";
}
