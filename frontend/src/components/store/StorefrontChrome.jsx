"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { footerColumns } from "@/components/landing/landingData";
import HomeNavbar from "@/components/landing/HomeNavbar";
import SearchAutocomplete from "./SearchAutocomplete";
import { appRoutes } from "@/lib/routes";
import styles from "./StorefrontChrome.module.css";

export default function StorefrontChrome({ children }) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const updateHeader = () => setIsCompact(window.scrollY > 40);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <div className={styles.shell}>
      <div className={`${styles.topBar} ${isCompact ? styles.topBarHidden : ""}`}>
        <svg className={styles.topWave} viewBox="0 0 250 36" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 H250 C160 0 160 36 35 36 H0 Z" fill="#49A9F5" />
          <path d="M0 0 H195 C125 0 120 36 0 36 Z" fill="#0088E8" />
        </svg>
        <nav className={styles.topLinks} aria-label="Utility navigation">
          <Link href="#"><img className={styles.topLinkIcon} src="/omsons_header_icons/knowledge-hub-white.svg" alt="" />Knowledge Hub</Link>
          <Link href="#"><img className={styles.topLinkIcon} src="/omsons_header_icons/about-us-white.svg" alt="" />About Us</Link>
          <Link href="#"><img className={styles.topLinkIcon} src="/omsons_header_icons/news-events-white.svg" alt="" />News &amp; Events</Link>
          <Link href="#"><img className={styles.topLinkIcon} src="/omsons_header_icons/careers-white.svg" alt="" />Careers</Link>
          <Link href="#"><img className={styles.topLinkIcon} src="/omsons_header_icons/contact-us-white.svg" alt="" />Contact Us</Link>
        </nav>
      </div>
      <header className={`${styles.siteHeader} ${isCompact ? styles.compactHeader : ""}`}>
        <div className={styles.headerInner}>
          <Link href={appRoutes.home} className={styles.logo}>
            <img src="/omsons-germany-logo.png" alt="OMSONS" />
          </Link>

          <SearchAutocomplete
            shellClassName={styles.searchShell}
            selectClassName={styles.searchSelect}
            inputClassName={styles.searchInput}
            buttonClassName={styles.searchButton}
          />
          <div className={styles.headerActionsNew}>
            <Link href="#" className={styles.distributorButton}><img src="/omsons_header_icons/become-distributor-white.svg" alt="" />Become a Distributor</Link>
            <Link href="#" className={styles.certificateButton}><img src="/omsons_header_icons/download-certificate-blue.svg" alt="" />Download Certificate</Link>
          </div>
          <div className={styles.inlineGlassNav}>
            <div className={styles.inlineGlassPrimary}>
              <Link href="#">Knowledge Hub</Link>
              <Link href="#">About Us</Link>
              <Link href="#">News &amp; Events</Link>
              <Link href="#">Careers</Link>
              <Link href="#">Contact Us</Link>
            </div>
            <div className={styles.inlineGlassActions}>
              <Link href="#" className={styles.inlineDistributor}>Become a Distributor</Link>
              <Link href="#">⇩ Download Certificate</Link>
              <Link href="#">♧ Distributors</Link>
              <Link href="#" className={styles.inlineDealer}>♢ Join as Dealer ›</Link>
            </div>
          </div>
          {/*
            <select className={styles.searchSelect} name="searchType" defaultValue="all" aria-label="Search in">
              <option value="all">All</option>
              <option value="products">Products</option>
              <option value="categories">Categories</option>
            </select>
            <input
              className={styles.searchInput}
              name="search"
              placeholder="Search by name, SKU, category, or specs..."
              aria-label="Search products and categories"
            />
            <button type="submit" className={styles.searchButton} aria-label="Search">
              🔎
            </button>
          </form>*/}

        </div>
      </header>

      <HomeNavbar compact={isCompact} hideGlassUtility />

      <main className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>

      <footer className={styles.footer} id="footer">
        <div className={styles.footerInner}>
          {footerColumns.slice(0, 4).map((column) => (
            <div key={column.title} className={styles.footerColumn}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <a key={link} href="#">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>© 2026 Omson. All rights reserved.</div>
      </footer>
    </div>
  );
}
