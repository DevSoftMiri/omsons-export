import Link from "next/link";
import { footerColumns } from "@/components/landing/landingData";
import HomeNavbar from "@/components/landing/HomeNavbar";
import { appRoutes } from "@/lib/routes";
import styles from "./StorefrontChrome.module.css";

export default function StorefrontChrome({ children }) {
  const headerActions = [
    { href: "#", icon: "/wishlist.png", label: "Wishlist" },
    { href: appRoutes.adminLogin, icon: "/account.png", label: "Account" },
    { href: "#", icon: "/cart.png", label: "Cart" },
  ];

  return (
    <div className={styles.shell}>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <Link href={appRoutes.home} className={styles.logo}>
            <img src="/omsons-logo.jpg" alt="OMSONS" />
          </Link>

          <div className={styles.searchShell}>
            <select className={styles.searchSelect} defaultValue="all">
              <option value="all">All</option>
              <option value="products">Products</option>
              <option value="categories">Categories</option>
            </select>
            <input
              className={styles.searchInput}
              placeholder="Search by name, SKU, category, or specs..."
            />
            <button type="button" className={styles.searchButton} aria-label="Search">
              🔎
            </button>
          </div>

          <div className={styles.headerActions}>
            {headerActions.map(({ href, icon, label }) => {
              const content = (
                <>
                  <span className={styles.headerActionIconWrap}>
                    <img src={icon} alt="" className={styles.headerActionIcon} />
                  </span>
                  <strong>{label}</strong>
                </>
              );

              if (href.startsWith("/")) {
                return (
                  <Link key={label} href={href} className={styles.headerAction}>
                    {content}
                  </Link>
                );
              }

              return (
                <a key={label} href={href} className={styles.headerAction}>
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      </header>

      <HomeNavbar />

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
