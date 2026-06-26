import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import { navItems } from "./landingData";
import styles from "./LandingPage.module.css";

export default function HomeNavbar() {
  return (
    <nav className={styles.siteNav}>
      <div className={styles.navInner}>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.label} className={styles.navItem}>
              <Link href={appRoutes.products}>
                {item.label}
                {item.groups ? <span className={styles.navCaret}>▼</span> : null}
              </Link>
              {item.groups ? (
                <div className={styles.megaMenu}>
                  <div className={styles.megaInner}>
                    <div className={styles.megaColumns}>
                      {item.groups.map((group) => (
                        <div key={group.title} className={styles.megaCol}>
                          <p className={styles.megaColTitle}>{group.title}</p>
                          {group.links.map((link) => (
                            <Link key={link} href={appRoutes.products}>
                              {link}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className={styles.megaPromo}>
                      <p className={styles.megaPromoLabel}>{item.promo.label}</p>
                      <h3>{item.promo.title}</h3>
                      <p className={styles.megaPromoPrice}>
                        {item.promo.price} <s>{item.promo.strike}</s>
                      </p>
                      <img src={item.promo.image} alt={item.promo.title} />
                      <span className={styles.megaPromoBadge}>{item.promo.badge}</span>
                      <Link href={appRoutes.products} className={styles.megaPromoButton}>
                        Shop now
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
