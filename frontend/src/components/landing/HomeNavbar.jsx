"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appRoutes } from "@/lib/routes";
import { getNavbarPreviewData, omsonsNavbarPreset } from "@/lib/navbarPreset";
import styles from "./LandingPage.module.css";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const heroImages = {
  glassware: "/header%20images/Lab%20Glassware.png",
  instruments: "/header%20images/Lab%20Instrument.png",
  filters: "/header%20images/Filter%20and%20Mambrane.png",
  hydrometers: "/header%20images/Hydrometer.png",
  plasticware: "/header%20images/Plasticware.png",
  thermometers: "/header%20images/Thermometer.png",
  rubberware: "/header%20images/rubberware.png",
  metalware: "/header%20images/metalware.png",
};

const categoryVisuals = {
  filtration: {
    image: heroImages.filters,
    eyebrow: "Membrane Filtration",
    title: "Explore Filtration",
    description: "High-clarity membrane filters and filtration essentials built for precise laboratory workflows.",
  },
  "filters-membrane": {
    image: heroImages.filters,
    eyebrow: "Filters & Membrane",
    title: "Explore Filters & Membrane",
    description: "Professional filtration solutions for laboratory and process applications.",
  },
  "laboratory-instruments": {
    image: heroImages.instruments,
    eyebrow: "Lab Instruments",
    title: "Explore Instruments",
    description: "Reliable analytical instruments, accessories, and porcelain solutions for daily lab operations.",
  },
  "lab-instruments": {
    image: heroImages.instruments,
    eyebrow: "Lab Instruments",
    title: "Explore Lab Instruments",
    description: "Reliable analytical instruments and accessories for daily laboratory operations.",
  },
  plasticware: {
    image: heroImages.plasticware,
    eyebrow: "Lab Plasticware",
    title: "Explore Plasticware",
    description: "Durable bottles, tubes, and molded plasticware designed for clean, repeatable handling.",
  },
  glassware: {
    image: heroImages.glassware,
    eyebrow: "Laboratory Glassware",
    title: "Explore Glassware",
    description: "Beakers, flasks, burettes, and precision borosilicate glassware for professional laboratories.",
  },
  "lab-glassware": {
    image: heroImages.glassware,
    eyebrow: "Omsons Catalogue",
    title: "Explore Lab Glassware",
    description: "Browse professional lab glassware solutions for laboratory and production environments.",
  },
  hydrometers: {
    image: heroImages.hydrometers,
    eyebrow: "Density Testing",
    title: "Explore Hydrometers",
    description: "Specialized hydrometers for accurate density and concentration measurement in lab environments.",
  },
  thermometers: {
    image: heroImages.thermometers,
    eyebrow: "Temperature Control",
    title: "Explore Thermometers",
    description: "Precision laboratory thermometers for controlled testing, validation, and process monitoring.",
  },
  rubberware: {
    image: heroImages.rubberware,
    eyebrow: "Sealing & Flow",
    title: "Explore Rubberware",
    description: "Rubber stoppers, tubing, and support components selected for dependable lab use.",
  },
  metalware: {
    image: heroImages.metalware,
    eyebrow: "Metal Lab Tools",
    title: "Explore Metalware",
    description: "Metal lab tools and utility accessories engineered for strength, handling, and longevity.",
  },
  "sintered-ware": {
    image: heroImages.filters,
    eyebrow: "Sintered Glass",
    title: "Explore Sintered Ware",
    description: "Sintered glassware for filtration, gas dispersion, and controlled laboratory applications.",
  },
  quartzware: {
    image: heroImages.glassware,
    eyebrow: "Quartz Labware",
    title: "Explore Quartzware",
    description: "Quartz labware suited for high-temperature and high-purity scientific processes.",
  },
};

export default function HomeNavbar({ compact = false, hideGlassUtility = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const [items, setItems] = useState(() => getNavbarPreviewData(omsonsNavbarPreset));
  const [categorySlugs, setCategorySlugs] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(() => omsonsNavbarPreset[0]?.slug || "");
  const [openDesktopMenu, setOpenDesktopMenu] = useState("");
  const closeTimerRef = useRef(null);
  const isStaticOnThisPage =
    hasMounted &&
    typeof pathname === "string" &&
    (pathname === appRoutes.products || pathname.startsWith("/product/"));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadNavbar() {
      try {
        const [response, categoryResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/navbar`, { cache: "no-store" }),
          fetch(`${API_BASE_URL}/category`, { cache: "no-store" }),
        ]);
        const data = await response.json();
        const categoryData = await categoryResponse.json();

        if (active && Array.isArray(categoryData?.categories)) {
          setCategorySlugs(buildCategorySlugMap(categoryData.categories));
        }

        if (!response.ok || !data?.success || !Array.isArray(data.navbars) || !data.navbars.length) {
          return;
        }

        if (active) {
          // Keep the workbook-driven header visible until the new preset is imported
          // into the navbar collection from Header Management.
          const requiredExcelHeaders = omsonsNavbarPreset.map((item) => item.slug);
          const hasExcelHeaders = requiredExcelHeaders.every((slug) =>
            data.navbars.some((item) => item.slug === slug)
          );
          const sourceNavbars = hasExcelHeaders
            ? data.navbars
            : omsonsNavbarPreset;
          const nextItems = getNavbarPreviewData(sourceNavbars);
          setItems(nextItems);
          setMobileExpanded(nextItems[0]?.slug || "");
        }
      } catch (_error) {
        // Keep the preset fallback when the API is unavailable.
      }
    }

    loadNavbar();

    return () => {
      active = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function toggleMobileItem(slug) {
    setMobileExpanded((current) => (current === slug ? "" : slug));
  }

  function openMenu(slug) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setOpenDesktopMenu(slug);
  }

  function scheduleCloseMenu() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setOpenDesktopMenu("");
      closeTimerRef.current = null;
    }, 180);
  }

  function navigateToSubmenu(submenuSlug) {
    setOpenDesktopMenu("");
    setMobileOpen(false);
    const categorySlug = resolveCategorySlug(submenuSlug, categorySlugs);
    if (categorySlug) {
      router.push(appRoutes.category(categorySlug));
    }
  }

  return (
    <nav className={`${styles.siteNav} ${compact ? styles.compactNav : ""} ${isStaticOnThisPage ? styles.siteNavStatic : ""}`}>
      <div className={styles.navInner}>
        <div className={styles.navDesktop}>
          {!hideGlassUtility ? <div className={styles.glassUtilityNav}>
            <div className={styles.glassPrimaryLinks}>
              <Link href="#">Knowledge Hub</Link>
              <Link href="#">About Us</Link>
              <Link href="#">News &amp; Events</Link>
              <Link href="#">Careers</Link>
              <Link href="#">Contact Us</Link>
            </div>
            <div className={styles.glassUtilityLinks}>
              <Link href="#" className={styles.glassUtilityAction}>
                <span className={styles.glassActionIcon} aria-hidden="true">⇩</span>
                <span>Download<br />Certificate</span>
              </Link>
              <Link href="#" className={styles.glassUtilityAction}>
                <span className={styles.glassActionIcon} aria-hidden="true">♧</span>
                <span>Distributors</span>
              </Link>
              <Link href="#" className={`${styles.glassUtilityAction} ${styles.dealerAction}`}>
                <span className={styles.glassActionIcon} aria-hidden="true">♢</span>
                <span>Join as Dealer</span>
                <span aria-hidden="true">›</span>
              </Link>
            </div>
          </div> : null}
          <ul className={styles.navList}>
            {items.map((item) => {
              const hasDropdown = Array.isArray(item.submenus) && item.submenus.length > 0;
              const topLevelSlug = resolveTopLevelSlug(item, categorySlugs);
              const visual = categoryVisuals[item.slug] || buildFallbackVisual(item);
              const submenuCount = item.submenus.length;
              const hideActionsPanel = item.slug === "glassware";
              const menuDensityClass =
                hideActionsPanel
                  ? styles.megaInnerNoAside
                  : submenuCount <= 2
                    ? styles.megaInnerSmall
                    : submenuCount <= 6
                      ? styles.megaInnerMedium
                      : styles.megaInnerLarge;

              return (
                <li
                  key={item.slug}
                  className={styles.navItem}
                  onMouseEnter={() => openMenu(item.slug)}
                  onMouseLeave={scheduleCloseMenu}
                >
                  <Link href={topLevelSlug ? appRoutes.category(topLevelSlug) : appRoutes.products}>
                    {item.title}
                    {hasDropdown ? <span className={styles.navCaret}>v</span> : null}
                  </Link>
                  {hasDropdown ? (
                    <div
                      className={`${styles.megaMenu} ${
                        openDesktopMenu === item.slug ? styles.megaMenuOpen : ""
                      }`}
                      onMouseEnter={() => openMenu(item.slug)}
                      onMouseLeave={scheduleCloseMenu}
                    >
                      <div
                        className={`${styles.megaInner} ${menuDensityClass}`}
                      >
                        {!hideActionsPanel ? (
                          <aside className={styles.megaActionsPanel}>
                            <span className={styles.megaVisualEyebrow}>{visual.eyebrow}</span>
                            <h3 className={styles.megaActionsTitle}>{visual.title}</h3>
                            <p className={styles.megaActionsText}>{visual.description}</p>
                            <div className={styles.megaVisualActions}>
                              <Link href={appRoutes.products} className={styles.megaVisualPrimary}>
                                {`Explore ${item.title}`}
                              </Link>
                              <Link href={appRoutes.products} className={styles.megaVisualSecondary}>
                                View Products
                              </Link>
                            </div>
                          </aside>
                        ) : null}

                        <div
                          className={`${styles.megaCenter} ${
                            hideActionsPanel ? styles.megaCenterExpanded : ""
                          }`}
                        >
                          <div className={styles.megaColumns}>
                            {item.submenus.map((submenu) => (
                            <div
                              key={`${item.slug}-${submenu.title}`}
                              className={`${styles.megaCard} ${
                                submenu.items?.length ? "" : styles.megaCardCompact
                              }`}
                              role="link"
                              tabIndex={0}
                              onClick={() => navigateToSubmenu(submenu.slug)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  navigateToSubmenu(submenu.slug);
                                }
                              }}
                            >
                              <div className={styles.megaCardHeader}>
                                <div className={styles.megaCardTitleBlock}>
                                <p
                                  className={`${styles.megaColTitle} ${
                                    submenu.items?.length ? "" : styles.megaColTitleCompact
                                  }`}
                                >
                                  {splitExcelCardTitle(submenu.title).title}
                                </p>
                                {splitExcelCardTitle(submenu.title).subtitle ? (
                                  <span className={styles.megaCardSubtitle}>
                                    {splitExcelCardTitle(submenu.title).subtitle}
                                  </span>
                                ) : null}
                                </div>
                                <span className={styles.megaArrow} aria-hidden="true">
                                  →
                                </span>
                              </div>
                              {submenu.items?.length ? (
                                <div
                                  className={styles.megaLinks}
                                  onClick={(event) => event.stopPropagation()}
                                  onKeyDown={(event) => event.stopPropagation()}
                                >
                                    {submenu.items.map((link) => (
                                    <Link
                                      key={link.slug}
                                      href={appRoutes.category(resolveCategorySlug(link.slug, categorySlugs))}
                                      >
                                        {splitExcelCardTitle(link.name).title}
                                    </Link>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            ))}
                          </div>
                        </div>

                        <article className={styles.megaVisual}>
                          <div className={styles.megaVisualStage}>
                            <img className={styles.megaVisualImage} src={visual.image} alt={visual.title} loading="lazy" />
                            <div className={styles.megaVisualOverlay} />
                          </div>
                        </article>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.navMobile}>
          <button
            type="button"
            className={styles.mobileMenuToggle}
            onClick={() => setMobileOpen((current) => !current)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-omsons-menu"
          >
            <span className={styles.mobileMenuToggleLabel}>
              <img src="/omsons_header_icons/all-categories-chevron-white.svg" alt="" />
              <span>Browse Categories</span>
            </span>
            <span className={styles.mobileMenuToggleIcon}>{mobileOpen ? "−" : "+"}</span>
          </button>

          {mobileOpen ? (
            <div id="mobile-omsons-menu" className={styles.mobileMenuPanel}>
              {items.map((item) => {
                const isOpen = mobileExpanded === item.slug;

                return (
                  <div key={item.slug} className={styles.mobileMenuItem}>
                    <button
                      type="button"
                      className={styles.mobileMenuItemButton}
                      onClick={() => toggleMobileItem(item.slug)}
                    >
                      <span>{item.title}</span>
                      <span className={styles.mobileMenuChevron}>{isOpen ? "−" : "+"}</span>
                    </button>

                    {isOpen ? (
                      <div className={styles.mobileMenuContent}>
                        {item.submenus.map((submenu) => (
                          <div key={`${item.slug}-${submenu.title}`} className={styles.mobileSubmenuCard}>
                            <Link href={appRoutes.category(resolveCategorySlug(submenu.slug, categorySlugs))}>
                              <strong>{submenu.title}</strong>
                            </Link>
                            {submenu.items?.length ? (
                              <div className={styles.mobileSubmenuLinks}>
                                {submenu.items.map((link) => (
                                  <Link
                                    key={link.slug}
                                    href={appRoutes.category(resolveCategorySlug(link.slug, categorySlugs))}
                                  >
                                    {link.name}
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

function splitExcelCardTitle(value) {
  const parts = String(value || "").split(/\s*(?:—>|->)\s*/);
  return {
    title: parts[0] || value,
    subtitle: parts.slice(1).join(" → "),
  };
}

function buildFallbackVisual(item) {
  return {
    image: "/omsons-germany-logo.png",
    eyebrow: "Omsons Catalogue",
    title: `Explore ${item.title}`,
    description: `Browse professional ${item.title.toLowerCase()} solutions for laboratory and production environments.`,
  };
}

function normalizeCategoryValue(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildCategorySlugMap(categories) {
  return categories.reduce((map, category) => {
    const slug = String(category?.slug || "").trim();
    if (!slug) return map;

    [category.name, category.slug, category.submenuTitle].forEach((value) => {
      const key = normalizeCategoryValue(value);
      if (key) map[key] = slug;
    });

    return map;
  }, {});
}

function resolveCategorySlug(value, categorySlugs) {
  const key = normalizeCategoryValue(value);
  return categorySlugs[key] || (key ? value : "");
}

function resolveTopLevelSlug(item, categorySlugs) {
  const directSlug =
    categorySlugs[normalizeCategoryValue(item.title)] ||
    categorySlugs[normalizeCategoryValue(item.slug)];

  if (directSlug) return directSlug;

  return (item.submenus || [])
    .map((submenu) => resolveCategorySlug(submenu.slug, categorySlugs))
    .find(Boolean) || "";
}
