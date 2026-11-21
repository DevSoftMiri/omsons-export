"use client";

import { useEffect, useState } from "react";
import StorefrontHeader from "@/components/store/StorefrontHeader";
import styles from "./OemPageClient.module.css";

const services = ["Private Label", "Build to Print", "Custom Development", "Custom Calibration", "Printing & Marking", "Packaging & Kitting"];
const products = [
  ["glass", "Glassware", "Volumetric Glassware", "Precision volumetric ware in Class A and Class B, with individual or batch certificates on request.", ["Volumetric flasks", "Measuring & volumetric pipettes", "Burettes", "Measuring cylinders"], "logo printing, graduation colour, certificates, packaging"],
  ["glass", "Glassware", "General Laboratory Glassware", "Everyday borosilicate ware for teaching, research, QC and industrial laboratories.", ["Beakers & conical flasks", "Round & flat-bottom flasks", "Funnels & separating funnels", "Test tubes, petri dishes & desiccators"], "branding, sizes, wall thickness, retail packs"],
  ["glass", "Glassware", "Reagent & Media Bottles", "Screw-cap laboratory bottles and reagent bottles in clear and amber borosilicate glass.", ["GL45 laboratory / media bottles", "Narrow & wide-mouth reagent bottles", "Amber bottles", "Caps, pouring rings & accessories"], "cap colour, printing, labels, shrink packs"],
  ["glass", "Glassware", "Borosilicate 3.3 & Custom Glass", "Special and made-to-drawing apparatus in borosilicate glass 3.3 by skilled scientific glassblowers.", ["Condensers & distillation apparatus", "Interchangeable joint glassware", "Reaction vessels", "Custom apparatus to drawing"], "build to print, prototypes, low-volume runs"],
  ["measure", "Measurement", "Hydrometers", "Glass hydrometers for laboratory, petroleum, dairy, beverage and industrial applications.", ["Density & specific gravity", "Baume, Brix & alcoholometers", "Petroleum hydrometers", "Custom ranges & reference temperatures"], "custom scales, calibration, branded cases"],
  ["measure", "Measurement", "Thermometers", "Liquid-in-glass and digital thermometers for general laboratory and specialised use.", ["General-purpose glass thermometers", "Partial & total immersion types", "Digital thermometers & probes", "Custom ranges & divisions"], "scale design, calibration, printing, packaging"],
  ["filter", "Filtration", "Syringe Filters & Membranes", "Sample preparation filters and membrane discs in a choice of materials and pore sizes.", ["Syringe filters (multiple diameters)", "Membrane filter discs", "Choice of membrane materials", "Sterile & non-sterile options"], "housing colour, printing, pack counts, labels"],
  ["filter", "Filtration", "Process Filtration", "Capsule, cartridge and vent filters for pharmaceutical, biotech and process applications.", ["Capsule filters", "Cartridge filters", "Vent filters", "2D & 3D bags"], "end-fittings, lengths, branding, documentation"],
  ["plastic", "Plasticware", "Laboratory Plasticware", "Durable, chemical-resistant plasticware with clear, long-lasting printed graduations.", ["Beakers & measuring cylinders", "Bottles, wash bottles & carboys", "Funnels, jugs & containers", "Racks & lab accessories"], "material, colour, printing, retail packs"],
  ["instr", "Instruments", "Laboratory Instruments", "Reliable bench-top equipment for routine laboratory work.", ["Water baths", "Digital laboratory instruments", "Heating & temperature equipment", "Accessories & spares"], "front-panel branding, colour, manuals, packaging"],
  ["services", "Services", "Calibration Services", "Calibration of volumetric glassware, hydrometers and thermometers, with documented results.", ["Volumetric glassware calibration", "Hydrometer calibration", "Thermometer calibration", "Calibration certificates"], "certificates in your brand format"],
  ["development", "Development", "Don't See Your Product?", "Send us a drawing, sample or specification. Our R&D and engineering team will assess feasibility and propose a solution.", ["Feasibility & costing", "Prototype & samples", "Validation support", "Scale-up to production"], "custom development and engineering support"],
];
const faqs = ["What is the minimum order quantity for OEM products?", "Can you manufacture to our drawings and standards?", "Will you provide samples before bulk production?", "What are your typical lead times?", "Is our brand, artwork and design kept confidential?"];
const processDescriptions = ["Share product, quantity, target market and branding needs.", "We review drawings, standards and technical requirements.", "Detailed offer with pricing, MOQ and lead time.", "Pre-production samples and artwork proofs for approval.", "Serial manufacturing against the approved sample.", "In-process and final QC with batch records.", "Export packing, documents and shipment to you."];
const serviceIcons = [
  <path key="tag" d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" />, 
  <><rect key="box" x="3" y="3" width="18" height="18" rx="2" /><path key="boxline" d="M3 9h18M9 21V9" /></>,
  <><path key="spark" d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4" /><circle key="circle" cx="12" cy="12" r="4" /></>,
  <path key="chart" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  <><path key="print" d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect key="paper" x="6" y="14" width="12" height="8" /></>,
  <><path key="package" d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path key="packagefold" d="M3 8l9 5 9-5M12 13v8" /></>,
];
const valueIcons = [
  <path key="flask" d="M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19l-6-10V3" />,
  <><path key="pencil" d="m4 20 4-1 11-11a2.1 2.1 0 0 0-3-3L5 16Z" /><path key="line" d="m13 7 4 4" /></>,
  <path key="check" d="m5 12 4 4L19 6" />,
  <><circle key="globe" cx="12" cy="12" r="9" /><path key="horizontal" d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
];

const publicProductImages = {
  "Volumetric Glassware": "/All%20products%20images%20new/volumetric%20glassware_2000x2000.png",
  "General Laboratory Glassware": "/Top%20picks%20section/Glassware_742x1024.png",
  "Reagent & Media Bottles": "/Top%20picks%20section/Glassware_742x1024.png",
  "Borosilicate 3.3 & Custom Glass": "/Top%20picks%20section/Glassware_742x1024.png",
  "Hydrometers": "/All%20products%20images%20new/Hydrometer_2000x2000.png",
  "Syringe Filters & Membranes": "/Featured%20product%20section/Syringe%20filters_2000x2000.png",
  "Process Filtration": "/All%20products%20images%20new/Cartridge%20filter_2000x2000.png",
  "Laboratory Instruments": "/Featured%20product%20section/Hot%20Plate_2000x2000.png",
  "Thermometers": "/Featured%20product%20section/Hydrometer_2000x2000.png",
  "Laboratory Plasticware": "/Featured%20product%20section/Wash%20Bottle_2000x2000.png",
};

function normaliseProductName(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function catalogueImageUrl(imagePath) {
  if (!imagePath) return "";
  const cleanPath = imagePath.replace(/^\.\//, "").replace(/\\/g, "/");
  return `/${cleanPath.split("/").map((part) => encodeURIComponent(part)).join("/")}`;
}

export default function OemPageClient() {
  const [filter, setFilter] = useState("all");
  const [catalogueImages, setCatalogueImages] = useState({});
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
  useEffect(() => {
    let cancelled = false;
    fetch("/omsons_catalogue_fixed.json")
      .then((response) => response.json())
      .then((catalogue) => {
        if (cancelled) return;
        const nextImages = {};
        (catalogue.products || []).forEach((product) => {
          if (product.name && product.imagePath) {
            nextImages[normaliseProductName(product.name)] = catalogueImageUrl(product.imagePath);
          }
        });
        setCatalogueImages(nextImages);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const visibleProducts = products.filter(([type]) => filter === "all" || type === filter);
  return <main className={styles.page}>
    <StorefrontHeader />
    <section className={styles.hero}><div className={`${styles.wrap} ${styles.heroGrid}`}><div><span className={styles.eyebrow}>OEM & Private Label Manufacturing</span><h1>Your brand. <em>Our laboratory manufacturing expertise.</em></h1><p>From borosilicate glassware and calibrated hydrometers to filtration products and laboratory instruments - OMSONS manufactures to your specification, prints your brand, and ships export-ready to your warehouse.</p><div className={styles.actions}><a className={styles.primary} href="#rfq">Start an OEM Project</a><a className={styles.ghost} href="#range">Explore Product Range</a></div><div className={styles.trust}><span><b>In-house manufacturing</b>Glass, calibration & finishing</span><span><b>Your branding</b>Printing, labels & packaging</span><span><b>Export ready</b>Documentation & global shipping</span></div></div><div className={styles.heroVisual}><b>OMSONS OEM</b><span>Glassware | Measurement | Filtration | Instruments</span></div></div></section>

    <section className={styles.values}><div className={`${styles.wrap} ${styles.valueGrid}`}>{[["Single-Source Range", "Glassware, measurement, filtration, plasticware and instruments from one supplier."], ["Built to Your Spec", "Manufactured to your drawing, sample or the standard you specify."], ["Inspected Every Batch", "Documented in-process and final inspection with batch traceability."], ["Export Partner", "Experienced with international buyers, documentation and logistics."]].map(([title, text], index) => <article key={title}><span className={styles.icon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{valueIcons[index]}</svg></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section id="services"><div className={styles.wrap}><div className={styles.center}><span className={styles.eyebrow}>What We Offer</span><h2>Flexible OEM models for every partner</h2><p className={styles.lead}>Whether you need your logo on our proven products or a fully new product built to your drawing, we adapt to your business model.</p></div><div className={styles.grid}>{services.map((name, index) => <article className={styles.card} key={name}><span className={styles.icon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{serviceIcons[index]}</svg></span><h3>{name}</h3><p>{["Our standard catalogue products supplied under your brand - your logo printed on the product, your labels and your packaging.", "Products manufactured to your technical drawings, tolerances and material specifications, with first-article approval.", "Joint development of new products - from concept and prototyping to validation and serial production.", "Hydrometers and thermometers calibrated to your scale, range and reference temperature.", "Chemical-resistant graduations, logos and batch markings on glass and plastic, in your colours and layout.", "Branded boxes, inserts, multilingual labels, barcodes and kits assembled ready for your shelf."][index]}</p></article>)}</div></div></section>

    <section id="range" className={`${styles.tinted} ${styles.range}`}><div className={styles.wrap}><div className={styles.center}><span className={styles.eyebrow}>OEM Product Range</span><h2>Complete laboratory portfolio, available under your brand</h2><p className={styles.lead}>Every category below can be supplied as private label or customised to your specification.</p></div><div className={styles.filters}>{[["all", "All Products"], ["glass", "Glassware"], ["measure", "Measurement"], ["filter", "Filtration"], ["plastic", "Plasticware"], ["instr", "Instruments"], ["services", "Services"], ["development", "Development"]].map(([key, label]) => <button key={key} className={filter === key ? styles.active : ""} onClick={() => setFilter(key)}>{label}</button>)}</div><div className={styles.grid}>{visibleProducts.map(([type, tag, title, text, items, options]) => { return <article className={styles.product} key={title}><div className={styles.productImage}><span>PRODUCT PHOTO<small>{title}</small></span></div><div><span className={styles.tag}>{tag}</span><h3>{title}</h3><p>{text}</p><ul>{items.map(item => <li key={item}>{item}</li>)}</ul><small className={styles.oemOptions}><b>OEM options:</b> {options}</small></div></article>; })}</div></div></section>

    <section id="customisation" className={styles.customisation}><div className={`${styles.wrap} ${styles.customGrid}`}><div className={styles.customPhotos}><div className={styles.customPhoto}><span>PHOTO<small>Logo / graduation printing close-up - 600 x 800 px</small></span></div><div className={styles.customPhoto}><span>PHOTO<small>Branded product sample - 600 x 400 px</small></span></div><div className={styles.customPhoto}><span>PHOTO<small>Branded box / packaging - 600 x 400 px</small></span></div></div><div><span className={styles.eyebrow}>Customisation</span><h2>Make every product unmistakably yours</h2><p className={styles.lead}>Choose the level of customisation your market needs - from a simple logo to a fully engineered product.</p><table className={styles.customTable}><thead><tr><th>Option</th><th>What we can customise</th></tr></thead><tbody>{[["Branding", "Logo, brand name, colours and product code printed on the item"], ["Graduations & scales", "Layout, colour, units, languages and scale ranges"], ["Dimensions & design", "Capacities, sizes, joints, wall thickness and special forms"], ["Calibration", "Range, reference temperature, tolerance class and certificate format"], ["Packaging", "Branded boxes, inserts, barcodes, multilingual labels, pack quantities"], ["Documentation", "Certificates, instruction leaflets and product data sheets in your brand"]].map(([option, detail]) => <tr key={option}><td>{option}</td><td>{detail}</td></tr>)}</tbody></table></div></div></section>
    <section id="process" className={styles.process}><div className={styles.wrap}><div className={styles.center}><span className={styles.eyebrow}>How It Works</span><h2>A clear, controlled path from enquiry to delivery</h2><p className={styles.lead}>Every OEM project follows a documented process with approvals at each critical stage.</p></div><div className={styles.steps}>{["Enquiry", "Specification", "Quotation", "Sample", "Production", "Inspection", "Dispatch"].map((step, i) => <div key={step}><span>0{i + 1}</span><h3>{step}</h3><p>Documented approval at every critical stage.</p></div>)}</div></div></section>

    <section id="quality" className={styles.quality}><div className={styles.wrap}><div className={styles.center}><span className={styles.eyebrow}>Manufacturing &amp; Quality</span><h2>Made, measured and checked in-house</h2><p className={styles.lead}>Our manufacturing, calibration and quality teams work under one roof, giving you control, consistency and traceability.</p></div><div className={styles.qualityGallery}><div className={styles.facilityPhoto}><span>FACILITY PHOTO<small>Main production hall - 1000 x 700 px</small></span></div><div className={styles.qualityPhoto}><span>PHOTO<small>Glassblowing / forming</small></span></div><div className={styles.qualityPhoto}><span>PHOTO<small>Printing / marking line</small></span></div><div className={styles.qualityPhoto}><span>PHOTO<small>QC / inspection</small></span></div><div className={styles.qualityPhoto}><span>PHOTO<small>Packing &amp; warehouse</small></span></div></div><div className={styles.qualityCards}>{[["Incoming Inspection","Defined checks, records and certificates linked to each production batch."],["In-Process Control","Defined checks, records and certificates linked to each production batch."],["Calibration & Testing","Defined checks, records and certificates linked to each production batch."],["Batch Traceability","Defined checks, records and certificates linked to each production batch."]].map(([name,text], index) => <article className={styles.card} key={name}><span className={styles.qualityIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{index===0 ? <><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 4V2h8v2M8 12l2 2 5-5"/></> : index===1 ? <><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/></> : index===2 ? <><path d="M5 19V9M10 19V5M15 19v-7M3 19h16"/></> : <><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/></>}</svg></span><h3>{name}</h3><p>{text}</p></article>)}</div><div className={styles.certificates}>{["CERT LOGO 1","CERT LOGO 2","CERT LOGO 3","CERT LOGO 4"].map(label => <div className={styles.certificate} key={label}>{label}</div>)}</div></div></section>

    <section id="faq" className={styles.tinted}><div className={styles.wrap}><div className={styles.center}><span className={styles.eyebrow}>FAQ</span><h2>Common OEM questions</h2></div><div className={styles.faq}>{faqs.map((question, i) => <details key={question} open={i === 0}><summary>{question}</summary><p>Share your requirement and our technical team will confirm feasibility, MOQ, documentation and lead time in the quotation.</p></details>)}</div></div></section>

    <section id="rfq" className={styles.rfq}><div className={`${styles.wrap} ${styles.rfqGrid}`}><div className={styles.rfqIntro}><span className={styles.eyebrow}>Request an OEM Quote</span><h2>Let's build your laboratory brand together</h2><p className={styles.lead}>Tell us about your requirement. Our international sales team will respond with feasibility, pricing and next steps.</p><div className={styles.contact}><div className={styles.contactItem}><span className={styles.contactIcon} aria-hidden="true" /><div><b>Email</b><span>oem@omsons.com</span></div></div><div className={styles.contactItem}><span className={styles.contactIcon} aria-hidden="true" /><div><b>Phone / WhatsApp</b><span>+91 XXXXX XXXXX</span></div></div></div></div><form><div className={styles.formHeading}><span className={styles.formMark} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19l-6-10V3"/></svg></span><h3>OEM Enquiry</h3></div><div className={styles.formRow}><label className={styles.field}>Full name *<input placeholder="Enter your full name" required /></label><label className={styles.field}>Company *<input placeholder="Enter company name" required /></label></div><div className={styles.formRow}><label className={styles.field}>Business email *<input type="email" placeholder="Enter your business email" required /></label><label className={styles.field}>Phone / WhatsApp<input placeholder="Enter phone number" /></label></div><div className={styles.formRow}><label className={styles.field}>Country *<input placeholder="Select country" required /></label><label className={styles.field}>Business type<select defaultValue="Distributor / Dealer"><option>Distributor / Dealer</option><option>Manufacturer</option><option>Laboratory</option><option>Other</option></select></label></div><fieldset className={styles.categoryField}><legend>Product categories of interest</legend><div className={styles.checkGrid}>{["Glassware","Hydrometers","Thermometers","Filtration","Plasticware","Instruments","Calibration"].map(item => <label key={item}><input type="checkbox" />{item}</label>)}</div></fieldset><div className={styles.formRow}><label className={styles.field}>OEM type<select defaultValue="Private label (our product, your brand)"><option>Private label (our product, your brand)</option><option>Build to print</option><option>Custom development</option></select></label><label className={styles.field}>Estimated annual quantity<input placeholder="e.g. 5,000 pcs / year" /></label></div><label className={styles.field}>Requirement details<textarea placeholder="Products, specifications, standards, branding and packaging requirements..." /></label><label className={styles.field}>Attach drawing / specification (optional)<input type="file" /></label><button className={styles.primary} type="submit">Submit OEM Enquiry</button><small>We respect your confidentiality. NDA available on request.</small></form></div></section>
  </main>;
}

















