"use client";

import Link from "next/link";
import {
  categories,
  featuredBanners,
  featuredProducts,
  footerColumns,
  helpItems,
  services,
  stats,
  testimonials,
  whyPillars,
  whyStats,
} from "./landingData";
import { appRoutes } from "@/lib/routes";
import HomeNavbar from "./HomeNavbar";
import styles from "./LandingPage.module.css";
import useLandingEffects from "./useLandingEffects";

function Reveal({ as: Tag = "div", className = "", delay, children, ...props }) {
  const classes = [styles.reveal, delay ? styles[`delay${delay}`] : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag data-reveal className={classes} {...props}>
      {children}
    </Tag>
  );
}

export default function LandingPage() {
  useLandingEffects();
  const headerActions = [
    { icon: "/wishlist.png", label: "Wishlist" },
    { icon: "/account.png", label: "Account" },
    { icon: "/cart.png", label: "Cart" },
  ];

  return (
    <main className={styles.pageShell}>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <a className={styles.logo} href="#">
            <img
              src="/omsons-logo.jpg"
              alt="OMSONS"
            />
          </a>
          <div className={styles.searchWrap}>
            <input type="text" placeholder="Search products, categories..." />
            <button type="button">Search</button>
          </div>
          <div className={styles.headerActions}>
            {headerActions.map(({ icon, label }) => (
              <a key={label} className={styles.headerAction} href="#">
                <span className={styles.headerActionIconWrap}>
                  <img src={icon} alt="" className={styles.headerActionIcon} />
                </span>
                {label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <HomeNavbar />

      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Reveal as="span" className={styles.heroEyebrow}>
            Precision Instruments Since 1984
          </Reveal>
          <Reveal as="h1" delay={1}>
            Life Science &<br />
            <em>Liquid Handling</em>
          </Reveal>
          <Reveal as="p" delay={2}>
            ISO-certified instruments engineered for the modern laboratory, traceable
            to SI units and built to last.
          </Reveal>
          <Reveal className={styles.heroActions} delay={3}>
            <Link href={appRoutes.products} className={styles.primaryButton}>
              Explore Products
            </Link>
            <a href="#" className={styles.outlineButton}>
              View Promotions
            </a>
          </Reveal>
        </div>
        <div className={styles.heroBadge}>SALE</div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel}>
            Featured Deals
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1}>
            Top picks for your <span>laboratory</span>
          </Reveal>
          <div className={styles.bannerGrid}>
            {featuredBanners.map((banner, index) => (
              <Reveal
                key={banner.title}
                className={`${styles.bannerCard} ${styles[`tone${banner.tone}`]}`}
                delay={index + 1}
              >
                <div>
                  <p className={styles.bannerCategory}>{banner.category}</p>
                  <h3>{banner.title}</h3>
                  <p className={styles.bannerTagline}>{banner.tagline}</p>
                  <Link href={appRoutes.products} className={styles.bannerButton}>
                    View Products
                  </Link>
                </div>
                <img src={banner.image} alt={banner.title} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel}>
            Featured Products
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1}>
            Our product <span>recommendations</span> for you
          </Reveal>
          <div className={styles.recommendationLayout}>
            <div className={styles.productsGrid}>
              {featuredProducts.map((product, index) => (
                <Reveal key={product.name} className={styles.productCard} delay={index + 1}>
                  {product.promo ? <span className={styles.promoBadge}>Promo</span> : null}
                  <div className={styles.productImageWrap}>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <p className={styles.productCategory}>{product.category}</p>
                  <p className={styles.productName}>{product.name}</p>
                  <Link href={appRoutes.products} className={styles.cardButton}>
                    View Product
                  </Link>
                </Reveal>
              ))}
            </div>
            <Reveal className={styles.helpBox} delay={2}>
              <h3>Help with your purchase</h3>
              {helpItems.map((item) => (
                <div key={item.title} className={styles.helpItem}>
                  <span className={styles.helpIcon}>{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <a href="#">More information</a>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel}>
            Browse
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1}>
            All products for <span>Life Science</span> and Liquid Handling
          </Reveal>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Reveal key={category.title} className={styles.categoryCard} delay={index + 1}>
                <img src={category.image} alt={category.title} />
                <div className={styles.categoryBody}>
                  <h3>{category.title}</h3>
                  <Link href={appRoutes.products}>View Products</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection} data-counter-section>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel} style={{ textAlign: "center" }}>
            By The Numbers
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1} style={{ textAlign: "center" }}>
            Statistics & <span>Achievements</span>
          </Reveal>
          <Reveal as="p" className={styles.sectionSubtitle} delay={2} style={{ textAlign: "center" }}>
            Four decades of precision, quality, and global impact
          </Reveal>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Reveal key={stat.label} className={styles.statCard} delay={index + 1}>
                <span className={styles.statIcon}>{stat.icon}</span>
                <div
                  className={styles.statValue}
                  data-counter
                  data-target={stat.value}
                  data-suffix={stat.suffix}
                >
                  0
                </div>
                <h3>{stat.label}</h3>
                <p>{stat.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel} style={{ textAlign: "center" }}>
            Services
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1} style={{ textAlign: "center" }}>
            Our services make your <span>work more efficient</span>
          </Reveal>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <Reveal key={service.title} className={styles.serviceCard} delay={index + 1}>
                <span className={styles.serviceIcon}>{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#">More information</a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.whySection}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.whyLabel}>
            The OMSONS Difference
          </Reveal>
          <Reveal as="h2" className={styles.whyTitle} delay={1}>
            Why <em>OMSONS?</em>
          </Reveal>
          <Reveal as="p" className={styles.whyLead} delay={2}>
            For over four decades, OMSONS has engineered precision tools that help
            researchers, clinicians, and industry professionals achieve reliable
            results.
          </Reveal>
          <div className={styles.whyGrid}>
            {whyPillars.map((pillar, index) => (
              <Reveal key={pillar.title} className={styles.whyCard} delay={(index % 3) + 1}>
                <span className={styles.whyIcon}>{pillar.icon}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </Reveal>
            ))}
          </div>
          <div className={styles.whyStats}>
            {whyStats.map((item, index) => (
              <Reveal key={item.label} className={styles.whyStat} delay={index + 1}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testimonialsSection}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel} style={{ textAlign: "center" }}>
            What Our Customers Say
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1} style={{ textAlign: "center" }}>
            Customer <span>Testimonials</span>
          </Reveal>
          <Reveal as="p" className={styles.sectionSubtitle} delay={2} style={{ textAlign: "center" }}>
            Real stories from laboratories and professionals who trust OMSONS every day
          </Reveal>
        </div>
        <div className={styles.testimonialTrack}>
          {[...testimonials, ...testimonials].map((item, index) => (
            <article
              key={`${item.author}-${index}`}
              className={`${styles.testimonialCard} ${item.highlight ? styles.testimonialHighlight : ""}`}
            >
              <span className={styles.quoteMark}>Q</span>
              <p>{item.quote}</p>
              <strong className={styles.stars}>★★★★★</strong>
              <div className={styles.authorRow}>
                <span className={styles.avatar}>{item.initials}</span>
                <div>
                  <h3>{item.author}</h3>
                  <span>{item.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.networkSection}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel}>
            Global Presence
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1}>
            Sales Network, Corporate Stores & Contacts
          </Reveal>
          <Reveal as="p" className={styles.sectionSubtitle} delay={2}>
            We have a wide sales network and a number of partners around the world.
          </Reveal>
          <Reveal className={styles.mapWrap} delay={2}>
            <img
              src="https://res.cloudinary.com/dzrg0utcm/image/upload/v1779267796/Screenshot_2026-05-20_143154_gunx3r.png"
              alt="World sales network map"
            />
            <div className={styles.distCard}>
              <img
                src="/omsons-logo.jpg"
                alt="OMSONS"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.videoSection}>
        <div className={styles.sectionInner}>
          <Reveal as="h2" className={styles.sectionTitle} delay={1} style={{ textAlign: "center" }}>
            See <span>OMSONS</span> in Action
          </Reveal>
          <Reveal as="p" className={styles.sectionSubtitle} delay={2} style={{ textAlign: "center" }}>
            Precision engineering, purpose-built for the modern laboratory
          </Reveal>
          <div className={styles.videoWrap} data-video-wrap data-reveal>
            <video
              className={styles.video}
              data-video
              controls
              muted
              playsInline
              preload="metadata"
            >
              <source
                src="https://res.cloudinary.com/dzrg0utcm/video/upload/v1779269772/omsons1_nakmxk.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          {[
            {
              title: "The Brand for Your Laboratory",
              text: "As an independent family business based in India, OMSONS has been a trusted laboratory partner for more than four decades.",
            },
            {
              title: "Consultation & Application Support",
              text: "From liquid handling to life science consumables, OMSONS supports laboratories with product guidance and application insight.",
            },
            {
              title: "Work Easily and Efficiently",
              text: "Our goal is to make laboratory work faster, easier, and more dependable across scientific disciplines.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} className={styles.footerInfoCard} delay={index + 1}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
        <div className={styles.footerLinks}>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map((link) => (
                <a key={link} href="#">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.footerBottomBar}>
          <div className={styles.footerBottom}>
            <div className={styles.footerPayments}>
              <div className={styles.payBadges}>
                {["PayPal", "VISA", "MC", "Mastercard"].map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
              <span>Note: Our offer is directed exclusively to traders.</span>
            </div>
            <div className={styles.footerMetaLinks}>
              {[
                "Transferpette",
                "Complaint",
                "Terms & Conditions",
                "Privacy Statement",
                "Imprint",
                "Disclaimer",
                "Cookie Settings",
              ].map((link) => (
                <a key={link} href="#">
                  {link}
                </a>
              ))}
            </div>
            <p>© 2025 OMSONS</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
