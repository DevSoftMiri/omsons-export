"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./LandingPage.module.css";

const columns = [
  ["PRODUCTS", ["Lab glassware", "Lab instruments", "Filters and membranes", "Hydrometers", "Thermometers", "Plasticware", "Metalware", "Rubberware"]],
  ["PARTNERS", ["Become a distributor", "OEM and private label", "Request a quote", "Download catalogue", "Partner login"]],
  ["QUALITY", ["Download certificate", "QR verification", "Technical data sheets", "Standards and compliance", "Quality policy"]],
  ["COMPANY", ["About OMSONS", "Manufacturing", "Exhibitions and events", "News", "Careers", "Contact us"]],
];

export default function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return <footer ref={footerRef} className={`${styles.footer} ${isVisible ? styles.footerVisible : ""}`}>
    <div className={styles.footerCta}><div><h2>Grow your business with OMSONS</h2><p>Distribution, OEM and private-label partnerships worldwide.</p></div><div className={styles.footerCtaActions}><Link href="/under-development">Become a distributor</Link><Link href="/under-development">Request a quote</Link></div></div>
    <div className={styles.footerMain}>
      <div className={styles.footerCompany}><img className={styles.footerLogo} src="/omsons-germany-logo.png" alt="OMSONS Germany" /><p>Laboratory glassware, filtration, measurement and instruments for partners worldwide.</p><div className={styles.footerSocials}><a href="/under-development" aria-label="LinkedIn"><b>in</b></a><a href="/under-development" aria-label="Facebook"><b>f</b></a><a href="/under-development" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.3" cy="6.8" r=".8" fill="currentColor" stroke="none"/></svg></a><a href="/under-development" aria-label="Pinterest"><b>p</b></a><a href="/under-development" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M21 8.2a2.6 2.6 0 0 0-1.8-1.8C17.6 6 12 6 12 6s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.2 27 27 0 0 0 2.7 12 27 27 0 0 0 3 15.8a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.2.4 7.2.4s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .3-3.8 27 27 0 0 0-.3-3.8ZM10.5 15V9l5 3-5 3Z"/></svg></a></div></div>
      {columns.map(([title, links]) => <div key={title} className={styles.footerColumn}><h4>{title}</h4>{links.map((link) => <Link key={link} href="/under-development">{link}</Link>)}</div>)}
    </div>
    <div className={styles.footerContactStrip}><div className={styles.footerLocation}><span className={styles.contactIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-12A7 7 0 1 0 5 9c0 5.8 7 12 7 12Zm0-9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" /></svg></span><strong>Germany</strong><span>Motorstraße 62, 80809 München, Germany</span></div><a href="mailto:info@omsonslabs.com"><span className={styles.contactIcon}>✉</span>info@omsonslabs.com</a><a href="tel:+919992525018"><span className={styles.contactIcon}>☎</span>Exports: +91 999 2525 018</a><a href="https://wa.me/919034252518"><span className={`${styles.contactIcon} ${styles.whatsappIcon}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3.2a8.7 8.7 0 0 0-7.5 13.1L3.3 20.7l4.5-1.2A8.8 8.8 0 1 0 12 3.2Zm0 15.9a7.1 7.1 0 0 1-3.6-1l-.3-.2-2.7.7.7-2.6-.2-.3A7.1 7.1 0 1 1 12 19.1Zm3.9-5.3c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.7.9c-.1.1-.2.1-.4 0a5.8 5.8 0 0 1-1.7-1.1 6.4 6.4 0 0 1-1.1-1.4c-.1-.2 0-.3.1-.4l.3-.4.2-.3c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3a2.2 2.2 0 0 0-.7 1.7 3.8 3.8 0 0 0 .8 2.1 8.6 8.6 0 0 0 3.3 3c.5.2.9.4 1.2.5.5.2 1 .2 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1Z" /></svg></span>WhatsApp: +91 9034 252518</a></div>
    <div className={styles.footerBottomBar}><div className={styles.footerBottom}><span>© 2026 Omsons Glassware Pvt. Ltd. All rights reserved.</span><nav className={styles.footerPolicyLinks}><Link href="/under-development">Privacy policy</Link><Link href="/under-development">Terms of sale</Link><Link href="/under-development">Cookie settings</Link></nav></div></div>
  </footer>;
}
