export const navItems = [
  {
    label: "Liquid Handling",
    groups: [
      {
        title: "Dispensing",
        links: ["Bottle-top dispensers", "Bottle-top burettes", "Aspirators"],
      },
      {
        title: "Pipetting",
        links: [
          "Micropipettes",
          "Repetitive pipettes",
          "Pipetting aids",
          "PD-Tips",
        ],
      },
      {
        title: "Accessories",
        links: ["Tips", "Calibration tools", "Spare parts"],
      },
    ],
    promo: {
      label: "Bottle-top Dispensers",
      title: "Dispensette S",
      price: "From EUR 89",
      strike: "EUR 110",
      badge: "19% Off",
      image:
        "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    },
  },
  {
    label: "Pipetting Robots",
    groups: [
      {
        title: "Automated Systems",
        links: [
          "PIPETBOY acu 2",
          "HandyStep touch",
          "Transferpette S",
          "Ovation Pipette System",
        ],
      },
      {
        title: "Accessories",
        links: ["Adapter kits", "Replacement parts", "Software"],
      },
    ],
    promo: {
      label: "Repetitive Pipettes",
      title: "HandyStep touch",
      price: "From EUR 220",
      strike: "EUR 270",
      badge: "18% Off",
      image:
        "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    },
  },
  {
    label: "Life Science Consumables",
    groups: [
      {
        title: "Tubes & Plates",
        links: [
          "Microcentrifuge tubes",
          "PCR consumables",
          "Microplates",
          "Sample storage",
        ],
      },
      {
        title: "Sealing & Culture",
        links: ["Sealing films", "Cell culture inserts", "Cuvettes", "Media bottles"],
      },
    ],
    promo: {
      label: "PCR Consumables",
      title: "PCR Tube Strips",
      price: "From EUR 12",
      strike: "EUR 15",
      badge: "20% Off",
      image:
        "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    },
  },
  {
    label: "Volumetric Instruments",
    groups: [
      {
        title: "Volumetric",
        links: [
          "Volumetric flasks",
          "Bulb pipettes",
          "Graduated pipettes",
          "Graduated cylinders",
          "Burettes",
        ],
      },
    ],
    promo: {
      label: "Volumetric Range",
      title: "Certified Glassware",
      price: "From EUR 18",
      strike: "EUR 24",
      badge: "15% Off",
      image:
        "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    },
  },
  {
    label: "General Lab Products",
    groups: [
      {
        title: "Glassware",
        links: ["Beakers", "Erlenmeyer flasks", "Funnels", "Desiccators"],
      },
      {
        title: "Lab Supplies",
        links: ["Sealing film", "Tubings", "Stopcocks", "Connectors"],
      },
    ],
    promo: {
      label: "Lab Essentials",
      title: "Erlenmeyer Flask Set",
      price: "From EUR 18",
      strike: "EUR 22",
      badge: "18% Off",
      image:
        "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    },
  },
  { label: "Promotions" },
  { label: "OEM" },
  { label: "Certificates" },
];

export const featuredBanners = [
  {
    tone: "peach",
    category: "Precision & Accuracy",
    title: "Thermometers",
    tagline: "Durable. Accurate. Reliable.",
    image:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1780480469/1_equrf4.png",
  },
  {
    tone: "mint",
    category: "Filtration Solutions",
    title: "Syringe Filters & Funnels",
    tagline: "Pure results. Reliable filtration.",
    image:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1780480470/ChatGPT_Image_Jun_3_2026_03_18_42_PM_kxysqd.png",
  },
  {
    tone: "sky",
    category: "Laboratory Essentials",
    title: "Glassware",
    tagline: "Borosilicate. High quality. Durable.",
    image: "https://www.spectrumchemical.com/media/catalog/category/glassware.png",
  },
];

export const featuredProducts = [
  {
    category: "Bottle-top Dispensers",
    name: "Dispensette S, analog-adjustable, DE-M",
    image:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    promo: true,
  },
  {
    category: "Repetitive Pipettes",
    name: "HandyStep touch, DE-M",
    image:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    promo: true,
  },
  {
    category: "Single-Channel Micropipette",
    name: "Transferpette S, adjustable, DE-M",
    image:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
  },
  {
    category: "Multi-Channel Micropipette",
    name: "Transferpette S, multi-channel, DE-M",
    image:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
  },
];

export const helpItems = [
  { icon: "ACC", title: "Create Account" },
  { icon: "%", title: "Special Offers" },
  { icon: "REP", title: "Contact Person" },
  { icon: "SUP", title: "Contact" },
];

export const categories = [
  "Liquid Handling",
  "Life Science Consumables",
  "Pipetting Robots",
  "Volumetric Instruments",
  "General Lab Products",
].map((title) => ({
  title,
  image:
    "https://res.cloudinary.com/dzrg0utcm/image/upload/v1780480890/ChatGPT_Image_Jun_3_2026_03_31_17_PM_nifxs0.png",
}));

export const stats = [
  {
    icon: "EST",
    value: 40,
    suffix: "+",
    label: "Years of Experience",
    description: "Trusted by laboratories since 1984",
  },
  {
    icon: "GLB",
    value: 40,
    suffix: "+",
    label: "Countries Served",
    description: "A truly global distribution network",
  },
  {
    icon: "SKU",
    value: 500,
    suffix: "+",
    label: "Product SKUs",
    description: "Comprehensive lab instrument catalog",
  },
  {
    icon: "CUS",
    value: 10000,
    suffix: "+",
    label: "Customers Served",
    description: "Research labs, hospitals, and industry",
  },
  {
    icon: "ISO",
    value: 15,
    suffix: "",
    label: "Awards & Certifications",
    description: "ISO, DAkkS, and international standards",
  },
];

export const services = [
  {
    icon: "DOC",
    title: "MyProduct Documentation",
    description:
      "Certificates of performance and technical documentation for Transferpette and volumetric instruments.",
  },
  {
    icon: "CAL",
    title: "Calibration & Maintenance",
    description:
      "Maintenance, repair services, and accredited laboratory calibration support.",
  },
  {
    icon: "SW",
    title: "Software",
    description:
      "Free calibration software downloads and companion tools for OMSONS instruments.",
  },
  {
    icon: "SOP",
    title: "Application Information",
    description:
      "Application notes and testing instructions for consistent scientific workflows.",
  },
];

export const whyPillars = [
  {
    icon: "ISO",
    title: "ISO-Certified Precision Manufacturing",
    description:
      "Every instrument leaves our facility after rigorous metrological validation and calibrated quality checks.",
  },
  {
    icon: "BIO",
    title: "Purpose-Built for Life Sciences",
    description:
      "From glassware to liquid handling systems, the portfolio is shaped around biological and analytical workflows.",
  },
  {
    icon: "SI",
    title: "Traceable to SI Units",
    description:
      "Volumetric instruments include traceability documentation linked to recognized measurement standards.",
  },
  {
    icon: "MAT",
    title: "Uncompromising Material Quality",
    description:
      "Chemical-resistant polymers, borosilicate glass, and durable alloys support demanding reagent environments.",
  },
  {
    icon: "NET",
    title: "Global Reach, Local Support",
    description:
      "A broad distribution network helps OMSONS deliver technical guidance and spare parts quickly.",
  },
  {
    icon: "DATA",
    title: "Data Integrity by Design",
    description:
      "Built-in reliability supports auditability, repeatability, and dependable scientific output.",
  },
];

export const whyStats = [
  { value: "40+", label: "Years in Science" },
  { value: "500+", label: "Product SKUs" },
  { value: "40+", label: "Countries Served" },
  { value: "ISO", label: "Certified Facility" },
];

export const testimonials = [
  {
    quote:
      "We've used OMSONS dispensers for years. The accuracy is excellent and the build quality has lasted longer than competing systems.",
    author: "Dr. Rahul Mehta",
    role: "Senior Analytical Chemist · Cipla Ltd.",
    initials: "DR",
  },
  {
    quote:
      "Switching to OMSONS volumetric glassware strengthened our compliance process. The traceability documentation is consistently accepted.",
    author: "Sarah Kowalski",
    role: "Lab Manager · TUV Rheinland, Germany",
    initials: "SK",
    highlight: true,
  },
  {
    quote:
      "The pipettes improved our high-throughput workflow and the after-sales support has been genuinely dependable.",
    author: "Dr. Ananya Patel",
    role: "Research Scientist · CSIR-CDRI",
    initials: "AP",
  },
  {
    quote:
      "OMSONS delivers consistent quality and dependable timelines, which matters enormously for procurement and distribution.",
    author: "Marcus Jensen",
    role: "Procurement Director · LabSupply Europe",
    initials: "MJ",
  },
  {
    quote:
      "The teaching lab uses OMSONS burettes heavily and they have remained smooth and reliable across years of use.",
    author: "Prof. Priya Verma",
    role: "Head of Chemistry · IIT Roorkee",
    initials: "PV",
  },
  {
    quote:
      "The product quality is strong, but the documentation and technical responsiveness are what make OMSONS feel like a partner.",
    author: "Liang Ning",
    role: "Laboratory Director · Biotech Shanghai",
    initials: "LN",
  },
];

export const footerColumns = [
  {
    title: "Liquid Handling",
    links: [
      "Bottle-top dispensers",
      "Bottle-top burettes",
      "Micropipettes",
      "Tips",
      "Pipetting aids",
    ],
  },
  {
    title: "Pipetting Robots",
    links: ["PIPETBOY acu 2", "HandyStep touch", "Transferpette S"],
  },
  {
    title: "Life Science",
    links: ["Microcentrifuge tubes", "PCR consumables", "Sample storage", "Microplates"],
  },
  {
    title: "Volumetric",
    links: ["Volumetric flasks", "Bulb pipettes", "Graduated pipettes", "Burettes"],
  },
  {
    title: "General Lab",
    links: ["Sealing film", "Erlenmeyer flasks", "Beakers", "Funnels", "Desiccators"],
  },
];
