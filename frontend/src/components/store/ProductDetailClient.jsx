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
    chipLabel: "Variants",
    title: "Variants",
    badge: "VR",
  },
  {
    id: "specifications",
    chipLabel: "Specifications",
    title: "Specifications",
    badge: "SP",
  },
  {
    id: "accessories",
    chipLabel: "Accessories",
    title: "Accessories & Spare Parts",
    badge: "AS",
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
  specifications: false,
  accessories: false,
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
  const detailSections = useMemo(
    () => normalizeDetailSections(product.detailSections, product.bulletPoints || []),
    [product.detailSections, product.bulletPoints]
  );
  const heroSummarySection = detailSections.find((section) => section.contentType === "paragraph") || null;
  const supportingSections = heroSummarySection
    ? detailSections.filter((section) => section !== heroSummarySection)
    : detailSections;
  const leadPointSections = supportingSections.filter((section) => section.contentType === "points").slice(0, 2);
  const remainingSections = supportingSections.filter((section) => !leadPointSections.includes(section));
  const featureCards = (product.featureCards || []).filter((card) => card && card.name);
  const highlightCards = useMemo(
    () =>
      Array.isArray(product.highlightCards)
        ? [...product.highlightCards]
            .filter((item) => item?.featureCard?.imageUrl && String(item?.title || "").trim())
            .sort((first, second) => (first.sortOrder || 0) - (second.sortOrder || 0))
        : [],
    [product.highlightCards]
  );
  const hasDownloads = Boolean(product.brochureUrl || product.coqUrl || product.downloads?.length);
  const downloadItems = useMemo(
    () => buildDownloadItems(product),
    [product]
  );
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);
  const sections = useMemo(() => SECTION_DEFINITIONS, []);

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
    <>
      <div className={styles.page}>
        <div className={styles.breadcrumbs}>
          <Link href={appRoutes.home}>Home</Link>
          <span>/</span>
          <Link href={appRoutes.products}>Products</Link>
          {product.category?.slug ? (
            <>
              <span>/</span>
              <Link href={appRoutes.category(product.category.slug)}>{product.category.name}</Link>
            </>
          ) : null}
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <section className={styles.hero}>
          <div className={styles.leftColumn}>
            <div className={styles.galleryShell}>
              <ProductGallery product={product} />
            </div>

            {featureCards.length ? (
              <div
                className={styles.featureCardRow}
                style={{
                  gridTemplateColumns: `repeat(${featureCards.length}, minmax(0, 1fr))`,
                }}
              >
                {featureCards.map((card) => (
                  <div key={card._id || card.name} className={styles.featureCard}>
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.name} className={styles.featureCardImage} />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.centerColumn}>
            <div className={styles.taxonomy}>
              {product.category?.name ? <span>{product.category.name}</span> : null}
              {(product.technicalTags || []).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <h1 className={styles.title}>{product.name}</h1>

            {heroSummarySection?.title ? (
              <p className={styles.heroSubheading}>{heroSummarySection.title}</p>
            ) : null}

            {heroSummarySection?.paragraph ? (
              <div className={styles.summaryCopy}>
                {heroSummarySection.paragraph
                  .split(/\n+/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`${paragraph}-${index}`} className={styles.intro}>
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : product.description ? (
              <p className={styles.intro}>{product.description}</p>
            ) : null}

            {product.icons?.length ? (
              <div className={styles.iconRail}>
                {product.icons.map((icon, index) => (
                  <div key={`${icon.label}-${index}`} className={styles.iconItem}>
                    {icon.imageUrl ? (
                      <img src={icon.imageUrl} alt={icon.label} className={styles.iconImage} />
                    ) : (
                      <span className={styles.iconFallback}>{icon.label.slice(0, 2)}</span>
                    )}
                    <span className={styles.iconLabel}>{icon.label}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={styles.detailStack}>
              {leadPointSections.map((section) => (
                <section key={`${section.title}-${section.sortOrder}`} className={styles.detailSection}>
                  <h2 className={styles.sectionHeading}>{section.title}</h2>
                  {section.contentType === "points" ? (
                    <ul className={styles.pointList}>
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.sectionParagraph}>{section.paragraph}</p>
                  )}
                </section>
              ))}
            </div>
          </div>

          <aside className={styles.assistanceBox}>
            <p className={styles.assistanceEyebrow}>Need Assistance?</p>
            <h2 className={styles.assistanceTitle}>Support for {product.name}</h2>
            <p className={styles.assistanceCopy}>
              Our team can help with pricing, bulk orders, and product guidance for this item.
            </p>

            <div className={styles.assistanceActions}>
              <button
                type="button"
                className={styles.sideButton}
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Request a Quote
              </button>
              {product.brochureUrl ? (
                <a
                  href={normalizeResourceUrl(product.brochureUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.sideButton} ${styles.sideButtonSecondary}`}
                >
                  Download Product Brochure
                </a>
              ) : null}
              {product.coqUrl ? (
                <a
                  href={normalizeResourceUrl(product.coqUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.sideButton} ${styles.sideButtonSecondary}`}
                >
                  Download COQ
                </a>
              ) : null}
            </div>

            <div className={styles.supportList}>
              {SUPPORT_ITEMS.map((item) => (
                <div key={item.title} className={styles.supportItem}>
                  <span className={styles.supportIcon}>
                    <img
                      src={getSupportIcon(item.title)}
                      alt=""
                      className={styles.supportIconImage}
                    />
                  </span>
                  <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {remainingSections.length ? (
          <section className={styles.narrativeCard}>
            <div className={styles.narrativeGrid}>
              {remainingSections.map((section) => (
                <section key={`${section.title}-${section.sortOrder}`} className={styles.narrativeSection}>
                  <h2 className={styles.sectionHeading}>{section.title}</h2>
                  {section.contentType === "points" ? (
                    <ul className={styles.pointList}>
                      {section.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.sectionParagraph}>{section.paragraph}</p>
                  )}
                </section>
              ))}
            </div>
          </section>
        ) : null}

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
                    visibleRows.length && visibleColumns.length ? (
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
                                  <td key={`${row._id}-${header}`}>
                                    {formatTableCellValue(row.values?.[header])}
                                  </td>
                                ))}
                                <td>
                                  <button
                                    type="button"
                                    className={styles.tableButton}
                                    onClick={() => setIsQuoteModalOpen(true)}
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

                  {section.id === "specifications" ? (
                    product.specifications?.length ? (
                      <div className={styles.specificationImageGrid}>
                        {product.specifications.map((item, index) => (
                          <a
                            key={`${item}-${index}`}
                            href={item}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.specificationImageCard}
                          >
                            <img
                              src={item}
                              alt={`${product.name} specification ${index + 1}`}
                              className={styles.specificationImage}
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptySection}>Specification images will be added soon.</p>
                    )
                  ) : null}

                  {section.id === "accessories" ? (
                    product.accessoriesSpareParts?.length ? (
                      <ul className={styles.pointList}>
                        {product.accessoriesSpareParts.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.emptySection}>No accessories or spare parts listed for this product.</p>
                    )
                  ) : null}

                  {section.id === "videos" ? (
                    product.videos?.length ? (
                      <div className={styles.videoGrid}>
                        {product.videos.map((item) => {
                          const preview = getYouTubePreview(item);

                          if (!preview) {
                            return (
                              <a
                                key={item}
                                href={item}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.videoFallbackLink}
                              >
                                {getResourceLabel(item)}
                              </a>
                            );
                          }

                          return (
                            <a
                              key={item}
                              href={item}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.videoCard}
                            >
                              <div className={styles.videoThumbWrap}>
                                <img
                                  src={preview.thumbnailUrl}
                                  alt={preview.title}
                                  className={styles.videoThumb}
                                />
                                <span className={styles.videoPlayBadge}>Play</span>
                              </div>
                              <div className={styles.videoMeta}>
                                <span className={styles.videoTitle}>{preview.title}</span>
                                <span className={styles.videoCaption}>Watch on YouTube</span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={styles.emptySection}>Videos are not available for this product yet.</p>
                    )
                  ) : null}

                  {section.id === "downloads" ? (
                    downloadItems.length ? (
                      <div className={styles.downloadList}>
                        {downloadItems.map((item) => (
                          <a
                            key={`${item.name}-${item.url}-${item.kind}`}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.downloadCard}
                          >
                            <span className={styles.downloadThumb}>
                              <img
                                src={item.previewImage}
                                alt=""
                                className={styles.downloadThumbImage}
                              />
                            </span>
                            <span className={styles.downloadMeta}>
                              <span className={styles.downloadName}>{item.name}</span>
                              <span className={styles.downloadType}>{item.typeLabel}</span>
                            </span>
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

        {highlightCards.length ? (
          <section className={styles.highlightStrip}>
            <div className={styles.highlightGrid}>
              {highlightCards.map((item, index) => (
                <article
                  key={`${item.featureCardId || item.featureCard?._id || index}-${item.title}`}
                  className={styles.highlightCard}
                >
                  <div className={styles.highlightMedia}>
                    <img
                      src={item.featureCard.imageUrl}
                      alt={item.featureCard.name || item.title}
                      className={styles.highlightImage}
                    />
                  </div>
                  <div className={styles.highlightContent}>
                    <h3 className={styles.highlightTitle}>{item.title}</h3>
                    {item.description ? (
                      <p className={styles.highlightDescription}>{item.description}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {relatedProducts.length ? (
          <section className={styles.relatedCard}>
            <div className={styles.blockHeader}>
              <div>
                <h2 className={styles.blockTitle}>Related Products</h2>
              </div>
              {product.category?.slug ? (
                <Link href={appRoutes.category(product.category.slug)} className={styles.relatedLink}>
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
        className={`${styles.quoteModal} ${isQuoteModalOpen ? styles.quoteModalActive : ""}`}
        onClick={() => setIsQuoteModalOpen(false)}
      >
        <div className={styles.quoteBox} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className={styles.quoteClose}
            onClick={() => setIsQuoteModalOpen(false)}
            aria-label="Close quote form"
          >
            x
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

const SUPPORT_ITEMS = [
  {
    title: "Quick Technical Support",
    copy: "Get expert help for product selection and specifications.",
    icon: "⌁",
  },
  {
    title: "Bulk Order Support",
    copy: "Assistance for larger quantities and project-based requirements.",
    icon: "□",
  },
  {
    title: "Quality Assured",
    copy: "Detailed documentation and dependable product information.",
    icon: "◈",
  },
  {
    title: "Worldwide Delivery",
    copy: "Secure packaging and dispatch support for domestic and export orders.",
    icon: "◎",
  },
];

function getSupportIcon(title) {
  const supportIconMap = {
    "Quick Technical Support":
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1787391139/ChatGPT_Image_Aug_22_2026_03_01_55_PM_pgifex.png",
    "Bulk Order Support":
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1787391284/ChatGPT_Image_Aug_22_2026_03_04_37_PM_ezamks.png",
    "Quality Assured":
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1784366243/4_lxprkj.png",
    "Worldwide Delivery":
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1787391361/ChatGPT_Image_Aug_22_2026_03_05_44_PM_hnqiye.png",
  };

  return supportIconMap[title] || "";
}

function normalizeDetailSections(detailSections, fallbackBullets) {
  if (Array.isArray(detailSections) && detailSections.length) {
    return detailSections
      .filter((section) => String(section?.title || "").trim())
      .map((section, index) => ({
        title: String(section.title || "").trim(),
        contentType: section.contentType === "points" ? "points" : "paragraph",
        paragraph: String(section.paragraph || "").trim(),
        points: Array.isArray(section.points)
          ? section.points.map((item) => String(item || "").trim()).filter(Boolean)
          : [],
        sortOrder: section.sortOrder || index + 1,
      }));
  }

  const normalizedFallback = Array.isArray(fallbackBullets)
    ? fallbackBullets.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  return normalizedFallback.length
    ? [
        {
          title: "Highlights",
          contentType: "points",
          points: normalizedFallback,
          paragraph: "",
          sortOrder: 1,
        },
      ]
    : [];
}

function getResourceLabel(value) {
  const normalized = normalizeResourceUrl(value);

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

function normalizeResourceUrl(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  if (
    normalized.startsWith("/") ||
    normalized.startsWith("./") ||
    normalized.startsWith("../") ||
    normalized.startsWith("#") ||
    normalized.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(normalized)
  ) {
    return normalized;
  }

  return `https://${normalized}`;
}

function buildDownloadItems(product) {
  const items = [];

  if (product?.brochureUrl) {
    items.push(createDownloadItem("Product Brochure", product.brochureUrl, "brochure"));
  }

  if (product?.coqUrl) {
    items.push(createDownloadItem("COQ", product.coqUrl, "certificate"));
  }

  for (const item of product?.downloads || []) {
    const name = String(item?.name || "").trim() || getResourceLabel(item?.url);
    items.push(createDownloadItem(name, item?.url, "download"));
  }

  return items.filter((item) => item.url);
}

function createDownloadItem(name, url, kind) {
  const normalizedUrl = normalizeResourceUrl(url);
  const extension = getResourceExtension(normalizedUrl);
  const fileType = getFileTypeMeta(extension, kind);

  return {
    kind,
    name: String(name || "").trim() || "Download file",
    url: normalizedUrl,
    typeLabel: fileType.label,
    previewImage: createFilePreviewImage(fileType),
  };
}

function getResourceExtension(value) {
  try {
    const normalized = normalizeResourceUrl(value);
    const { pathname } = new URL(normalized);
    const lastSegment = pathname.split("/").filter(Boolean).pop() || "";
    const parts = lastSegment.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  } catch (_error) {
    return "";
  }
}

function getFileTypeMeta(extension, kind) {
  const normalizedExtension = String(extension || "").toLowerCase();

  if (kind === "certificate") {
    return { label: normalizedExtension ? normalizedExtension.toUpperCase() : "Certificate", accent: "#1d4ed8", icon: "CERT" };
  }

  if (kind === "brochure") {
    return { label: normalizedExtension ? normalizedExtension.toUpperCase() : "Brochure", accent: "#0f766e", icon: "PDF" };
  }

  if (["pdf"].includes(normalizedExtension)) {
    return { label: "PDF", accent: "#b91c1c", icon: "PDF" };
  }

  if (["doc", "docx"].includes(normalizedExtension)) {
    return { label: normalizedExtension.toUpperCase(), accent: "#1d4ed8", icon: "DOC" };
  }

  if (["xls", "xlsx", "csv"].includes(normalizedExtension)) {
    return { label: normalizedExtension.toUpperCase(), accent: "#15803d", icon: "XLS" };
  }

  if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(normalizedExtension)) {
    return { label: normalizedExtension.toUpperCase(), accent: "#7c3aed", icon: "IMG" };
  }

  return {
    label: normalizedExtension ? normalizedExtension.toUpperCase() : "File",
    accent: "#475569",
    icon: normalizedExtension ? normalizedExtension.slice(0, 3).toUpperCase() : "FILE",
  };
}

function createFilePreviewImage(fileType) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88" fill="none">
      <rect x="8" y="8" width="72" height="72" rx="18" fill="#F8FBFF"/>
      <rect x="16" y="14" width="40" height="52" rx="10" fill="white" stroke="#D8E3F2" stroke-width="2"/>
      <path d="M48 14V28C48 31.3137 50.6863 34 54 34H68" fill="white"/>
      <path d="M48 14V28C48 31.3137 50.6863 34 54 34H68" stroke="#D8E3F2" stroke-width="2"/>
      <rect x="22" y="45" width="44" height="20" rx="10" fill="${fileType.accent}"/>
      <text x="44" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="white">${escapeXml(
        fileType.icon
      )}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getYouTubePreview(value) {
  const videoId = getYouTubeVideoId(value);

  if (!videoId) {
    return null;
  }

  return {
    videoId,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    title: "Product Video Preview",
  };
}

function getYouTubeVideoId(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v") || "";
      }

      if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/").filter(Boolean)[1] || "";
      }
    }
  } catch (_error) {
    return "";
  }

  return "";
}

function hasDisplayValue(value) {
  const normalized = String(value ?? "").trim();
  return normalized !== "" && normalized !== "-";
}

function formatTableCellValue(value) {
  const normalized = String(value ?? "").trim();
  return normalized || "-";
}
