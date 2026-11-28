"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  categories,
  featuredBanners,
  featuredProducts,
  footerColumns,
  stats,
  testimonials,
  whyPillars,
} from "./landingData";
import StorefrontHeader from "@/components/store/StorefrontHeader";
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
  const [activeHero, setActiveHero] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const productsViewportRef = useRef(null);
  const [productCarouselPaused, setProductCarouselPaused] = useState(false);
  const heroSlides = [
    {
      image: "/header%20images/labglassware2.png",
      eyebrow: "Precision, Quality & Reliability In Every Piece.",
      title: "Premium Laboratory Glassware",
      description: "We provide reliable solutions for pharmaceutical, chemical, research and testing laboratories.",
      category: "glassware",
    },
    {
      image: "/header%20images/labinstrument2.png",
      eyebrow: "Precision, Quality & Reliability In Every Piece.",
      title: "Premium Laboratory Instruments",
      description: "Our instruments are developed to meet the requirements of modern laboratories across pharmaceutical, chemical, research and testing industries.",
      category: "lab-instruments",
    },
    {
      image: "/header%20images/filter%20and%20membrane2.png",
      eyebrow: "Precision, Purity & Performance in Every Filter Product",
      title: "Premium Filtration Products",
      description: "Syringe filters and membrane filters to Capsule, Cartridge Filters and SS Filter Housings. We provide dependable filtration solutions for diverse laboratory and industrial applications.",
      category: "filters-membrane",
    },
    {
      image: "/heroimages/hero%20banner%204.png",
      eyebrow: "Precision, Quality & Reliability in Every Piece.",
      title: "Premium Cartridge Filter",
      description: "We provide reliable solutions for pharmaceutical, chemical, research and testing laboratories.",
      category: "laboratory-solutions",
    },
  ];

  useEffect(() => {
    if (heroPaused) return undefined;
    const timer = window.setInterval(() => {
      setActiveHero((value) => (value + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroPaused, heroSlides.length]);

  const moveProductCarousel = (direction) => {
    const viewport = productsViewportRef.current;
    const card = viewport?.querySelector(`.${styles.productCard}`);
    if (!viewport || !card) return;
    const grid = viewport.querySelector(`.${styles.productsGrid}`);
    const gap = Number.parseFloat(window.getComputedStyle(grid).gap) || 20;
    viewport.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  useEffect(() => {
    const viewport = productsViewportRef.current;
    if (!viewport) return undefined;
    const normalizeLoop = () => {
      const loopWidth = viewport.scrollWidth / 2;
      if (loopWidth > 0 && viewport.scrollLeft >= loopWidth) viewport.scrollLeft -= loopWidth;
    };
    viewport.addEventListener("scroll", normalizeLoop, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", normalizeLoop);
    };
  }, []);

  useEffect(() => {
    if (productCarouselPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let frame;
    const tick = () => {
      const viewport = productsViewportRef.current;
      if (viewport) {
        viewport.scrollLeft += 0.45;
        const loopWidth = viewport.scrollWidth / 2;
        if (loopWidth > 0 && viewport.scrollLeft >= loopWidth) viewport.scrollLeft -= loopWidth;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [productCarouselPaused]);

  const slide = heroSlides[activeHero];

  useLandingEffects();
  return (
    <main className={styles.pageShell}>
      <StorefrontHeader />

      <section className={`${styles.hero} ${slide.category === "laboratory-solutions" ? styles.heroBannerFour : ""}`} onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)}>
        <Link href="#" className={styles.heroImageLink} aria-label={slide.title}>
          <img
            key={slide.category}
            src={slide.image}
            alt=""
            className={`${styles.heroImage} ${slide.category === "laboratory-solutions" ? styles.heroImageBannerFour : ""}`}
          />
        </Link>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent} key={slide.category}>
          <span className={styles.heroEyebrow}>{slide.eyebrow}</span>
          <h1>
            <span className={styles.heroTitleAccent}>{slide.title.split(" ")[0]}</span>{" "}
            {slide.title.split(" ").slice(1).join(" ")}
          </h1>
          <p>{slide.description}</p>
          <div className={styles.heroActions}>
            <Link href="#" className={styles.primaryButton}>
              Explore Products
            </Link>
          </div>
        </div>
        <div className={styles.heroControls} aria-label="Hero slides">
          <button type="button" onClick={() => setActiveHero((activeHero + heroSlides.length - 1) % heroSlides.length)} aria-label="Previous slide">‹</button>
          {heroSlides.map((item, index) => (
            <button key={item.category} type="button" className={index === activeHero ? styles.heroDotActive : ""} onClick={() => setActiveHero(index)} aria-label={`Go to ${item.title}`} />
          ))}
          <button type="button" onClick={() => setActiveHero((activeHero + 1) % heroSlides.length)} aria-label="Next slide">›</button>
        </div>
      </section>

      <section className={`${styles.sectionBlock} ${styles.featuredDealsSection}`}>
        <div className={styles.sectionInner}>
          <Reveal as="h2" className={styles.sectionTitle}>
            <small className={styles.sectionEyebrow}>Featured Deals</small>
            Top picks for your <span>laboratory</span>
          </Reveal>
          <div className={styles.bannerGrid}>
            {featuredBanners.map((banner) => (
              <div
                key={banner.title}
                className={`${styles.bannerCard} ${styles[`tone${banner.tone}`]}`}
              >
                <div>
                  <p className={styles.bannerCategory}>{banner.category}</p>
                  <h3>{banner.title}</h3>
                  <p className={styles.bannerTagline}>{banner.description}</p>
                  <Link href="#" className={styles.bannerButton}>
                    View Products
                  </Link>
                </div>
                <img src={banner.image} alt={banner.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.sectionBlock} ${styles.featuredProductsSection}`}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel}>
            Featured Products
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1}>
            Our product <span>recommendations</span> for you
          </Reveal>
          <div className={styles.recommendationLayout} onMouseEnter={() => setProductCarouselPaused(true)} onMouseLeave={() => setProductCarouselPaused(false)} onFocus={() => setProductCarouselPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setProductCarouselPaused(false); }}>
            <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`} onClick={() => moveProductCarousel(-1)} aria-label="Previous featured products"><span aria-hidden="true">‹</span></button>
            <div className={styles.productsViewport} ref={productsViewportRef}>
              <div className={styles.productsGrid}>
              {[...featuredProducts, ...featuredProducts].map((product, index) => (
                <Reveal key={`${product.name}-${index}`} className={styles.productCard} delay={(index % featuredProducts.length) + 1}>
                  {product.promo ? <span className={styles.promoBadge}>Promo</span> : null}
                  <div className={styles.productImageWrap}>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <p className={styles.productCategory}>{product.category}</p>
                  <p className={styles.productName}>{product.name}</p>
                  <Link href="#" className={styles.cardButton}>
                    View Product
                  </Link>
                </Reveal>
              ))}
              </div>
            </div>
            <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowNext}`} onClick={() => moveProductCarousel(1)} aria-label="Next featured products"><span aria-hidden="true">›</span></button>
          </div>
        </div>
      </section>

      <section className={`${styles.sectionBlock} ${styles.browseProductsSection}`}>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.sectionLabel}>
            Browse
          </Reveal>
          <Reveal as="h2" className={styles.sectionTitle} delay={1}>
            Precision products for every <span>Laboratory</span> and <span>Process</span>
          </Reveal>
          <Reveal as="p" className={styles.sectionSubtitle} delay={2}>
            From volumetric glassware and hydrometers to sterile filtration and lab instruments. Manufactured by OMSONS for accuracy, consistency and long-term reliability.
          </Reveal>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Reveal key={category.title} className={styles.categoryCard} delay={index + 1}>
                <Link href="#" className={styles.categoryCardLink}>
                  <div className={styles.categoryImageWrap}>
                    <img src={category.image} alt={category.title} />
                  </div>
                  <div className={styles.categoryBody}>
                    <span className={`${styles.categoryIcon} ${!category.icon ? styles.categoryIconPlaceholder : ""}`}>
                      {category.icon ? <img src={category.icon} alt="" /> : null}
                    </span>
                    <span className={styles.categoryEyebrow}>{category.eyebrow}</span>
                    <h3>{category.title}</h3>
                    <p className={styles.categoryDescription}>{category.description}</p>
                    <span className={styles.categoryAction}>View Products <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
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

      <section className={styles.whySection} data-counter-section>
        <div className={styles.sectionInner}>
          <Reveal as="p" className={styles.whyLabel}>
            PARTNER WITH OMSONS
          </Reveal>
          <Reveal as="h2" className={styles.whyTitle} delay={1}>
            Why <em>distributors</em> grow with <em>OMSONS</em>
          </Reveal>
          <Reveal as="p" className={styles.whyLead} delay={2}>
            One manufacturer for glassware, filtration, measurement and instruments: built to ISO, ASTM and USP standards, export-ready and backed by dedicated partner support.
          </Reveal>
          <Reveal className={styles.whyImageWrap} delay={2}>
            <img src="/Why%20omsons.png" alt="OMSONS laboratory products and solutions" className={styles.whyImage} />
          </Reveal>
          <Reveal className={styles.whyMetrics} delay={2}>
            <div><strong>{stats[0].value}{stats[0].suffix}</strong><span>Years of manufacturing</span></div>
            <div><strong>{stats[1].value}{stats[1].suffix}</strong><span>Countries with partners</span></div>
            <div><strong>{stats[2].value.toLocaleString()}{stats[2].suffix}</strong><span>Products to sell</span></div>
            <div><strong>{stats[3].value}{stats[3].suffix}</strong><span>Channel partners</span></div>
          </Reveal>
          <div className={styles.whyGrid}>
            {whyPillars.map((pillar, index) => (
              <Reveal key={pillar.title} className={styles.whyCard} delay={(index % 3) + 1}>
                <span className={styles.whyIcon}><img src={pillar.icon} alt="" /></span>
                {pillar.badge && <span className={styles.whyBadge}>{pillar.badge}</span>}
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
                {pillar.badges && <div className={styles.whyStandards}>{pillar.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>}
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.whyCta} delay={2}>
            <span>Looking for a reliable manufacturing partner in your market?</span>
            <Link href="/contact" className={styles.whyCtaButton}>Become a Distributor <span aria-hidden="true">→</span></Link>
          </Reveal>
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
          <Reveal className={styles.mapWrap} delay={2} data-video-wrap>
            <video
              className={styles.video}
              data-video
              data-video-restart
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="OMSONS global presence animation"
            >
              <source src="/sales%20network%20video.mp4" type="video/mp4" />
            </video>
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
              loop
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
