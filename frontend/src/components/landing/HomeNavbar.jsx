"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appRoutes } from "@/lib/routes";
import { getNavbarPreviewData, omsonsNavbarPreset } from "@/lib/navbarPreset";
import styles from "./LandingPage.module.css";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const categoryVisuals = {
  filtration: {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592014/filtration_k6seas.png",
    eyebrow: "Membrane Filtration",
    title: "Explore Filtration",
    description: "High-clarity membrane filters and filtration essentials built for precise laboratory workflows.",
  },
  "laboratory-instruments": {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592014/lab_instrument_bn7hj2.png",
    eyebrow: "Lab Instruments",
    title: "Explore Instruments",
    description: "Reliable analytical instruments, accessories, and porcelain solutions for daily lab operations.",
  },
  plasticware: {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592013/plasticware_bmw8k0.png",
    eyebrow: "Lab Plasticware",
    title: "Explore Plasticware",
    description: "Durable bottles, tubes, and molded plasticware designed for clean, repeatable handling.",
  },
  glassware: {
    image: "/assets/export%20catalogue%20images/1044.100.jpg",
    eyebrow: "Laboratory Glassware",
    title: "Explore Glassware",
    description: "Beakers, flasks, burettes, and precision borosilicate glassware for professional laboratories.",
  },
  hydrometers: {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592013/hydrometer_qdqm6r.png",
    eyebrow: "Density Testing",
    title: "Explore Hydrometers",
    description: "Specialized hydrometers for accurate density and concentration measurement in lab environments.",
  },
  thermometers: {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592013/thermometer_ealqnx.png",
    eyebrow: "Temperature Control",
    title: "Explore Thermometers",
    description: "Precision laboratory thermometers for controlled testing, validation, and process monitoring.",
  },
  rubberware: {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592014/ruberrware_bz1fhl.png",
    eyebrow: "Sealing & Flow",
    title: "Explore Rubberware",
    description: "Rubber stoppers, tubing, and support components selected for dependable lab use.",
  },
  metalware: {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592014/metalware_qhmfj7.png",
    eyebrow: "Metal Lab Tools",
    title: "Explore Metalware",
    description: "Metal lab tools and utility accessories engineered for strength, handling, and longevity.",
  },
  "sintered-ware": {
    image: "https://res.cloudinary.com/zieluz7x/image/upload/v1783592013/sintered_glassware_kvnm1u.png",
    eyebrow: "Sintered Glass",
    title: "Explore Sintered Ware",
    description: "Sintered glassware for filtration, gas dispersion, and controlled laboratory applications.",
  },
  quartzware: {
    image: "/assets/export%20catalogue%20images/1058.100.jpg",
    eyebrow: "Quartz Labware",
    title: "Explore Quartzware",
    description: "Quartz labware suited for high-temperature and high-purity scientific processes.",
  },
};

export default function HomeNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const [items, setItems] = useState(() => getNavbarPreviewData(omsonsNavbarPreset));
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
        const response = await fetch(`${API_BASE_URL}/navbar`, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok || !data?.success || !Array.isArray(data.navbars) || !data.navbars.length) {
          return;
        }

        if (active) {
          const nextItems = getNavbarPreviewData(data.navbars);
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
    router.push(buildProductsCategoryHref(submenuSlug));
  }

  return (
    <nav className={`${styles.siteNav} ${isStaticOnThisPage ? styles.siteNavStatic : ""}`}>
      <div className={styles.navInner}>
        <div className={styles.navDesktop}>
          <ul className={styles.navList}>
            {items.map((item) => {
              const hasDropdown = Array.isArray(item.submenus) && item.submenus.length > 0;
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
                  <Link href={appRoutes.products}>
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
                                <p
                                  className={`${styles.megaColTitle} ${
                                    submenu.items?.length ? "" : styles.megaColTitleCompact
                                  }`}
                                >
                                  {submenu.title}
                                </p>
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
                                    <Link key={link.slug} href={appRoutes.category(link.slug)}>
                                      {link.name}
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
            <span>Browse Categories</span>
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
                            <Link href={buildProductsCategoryHref(submenu.slug)}>
                              <strong>{submenu.title}</strong>
                            </Link>
                            {submenu.items?.length ? (
                              <div className={styles.mobileSubmenuLinks}>
                                {submenu.items.map((link) => (
                                  <Link key={link.slug} href={appRoutes.category(link.slug)}>
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

function buildFallbackVisual(item) {
  return {
    image: "/omsons-logo.jpg",
    eyebrow: "Omsons Catalogue",
    title: `Explore ${item.title}`,
    description: `Browse professional ${item.title.toLowerCase()} solutions for laboratory and production environments.`,
  };
}

function buildProductsCategoryHref(categorySlug) {
  const params = new URLSearchParams({ category: categorySlug });
  return `${appRoutes.products}?${params.toString()}`;
}
