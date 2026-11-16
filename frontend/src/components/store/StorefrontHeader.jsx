"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchAutocomplete from "./SearchAutocomplete";
import HomeNavbar from "@/components/landing/HomeNavbar";
import { appRoutes } from "@/lib/routes";
import styles from "./StorefrontChrome.module.css";

export default function StorefrontHeader() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const updateHeader = () => setIsCompact(window.scrollY > 40);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <>
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
      </div>
      </header>
      <HomeNavbar compact={isCompact} hideGlassUtility />
    </>
  );
}
