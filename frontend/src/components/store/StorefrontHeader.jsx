"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchAutocomplete from "./SearchAutocomplete";
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

  const actions = [
    { href: "#", icon: "/wishlist.png", label: "Wishlist" },
    { href: appRoutes.adminLogin, icon: "/account.png", label: "Account" },
    { href: "#", icon: "/cart.png", label: "Cart" },
  ];

  return (
    <header className={`${styles.siteHeader} ${isCompact ? styles.compactHeader : ""}`}>
        <div className={styles.headerInner}>
        <Link href={appRoutes.home} className={styles.logo}>
          <img src="/omsons-logo.jpg" alt="OMSONS" />
        </Link>
        <SearchAutocomplete
          shellClassName={styles.searchShell}
          selectClassName={styles.searchSelect}
          inputClassName={styles.searchInput}
          buttonClassName={styles.searchButton}
        />
        <div className={styles.headerActions}>
          {actions.map(({ href, icon, label }) => {
            const content = <><span className={styles.headerActionIconWrap}><img src={icon} alt="" className={styles.headerActionIcon} /></span><strong>{label}</strong></>;
            return href.startsWith("/") ? <Link key={label} href={href} className={styles.headerAction}>{content}</Link> : <a key={label} href={href} className={styles.headerAction}>{content}</a>;
          })}
        </div>
      </div>
    </header>
  );
}
