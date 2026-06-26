export const categoryMenu = [
  {
    title: "Liquid Handling",
    slug: "liquid-handling",
    heroImage:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1780480469/1_equrf4.png",
    description: "Dispensers, pipettes, tips, and precision liquid transfer tools.",
    subcategories: [
      { name: "Bottle Top Dispensers", slug: "bottle-top-dispensers" },
      { name: "Micropipettes", slug: "micropipettes" },
      { name: "Pipette Tips", slug: "pipette-tips" },
    ],
  },
  {
    title: "Filtration",
    slug: "filtration",
    heroImage:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1780480470/ChatGPT_Image_Jun_3_2026_03_18_42_PM_kxysqd.png",
    description: "Filter papers, syringe filters, and membrane solutions.",
    subcategories: [
      { name: "Syringe Filters", slug: "syringe-filters" },
      { name: "Filter Papers", slug: "filter-papers" },
    ],
  },
];

export const products = [
  {
    name: "Bottle-top Dispenser Dispensette S",
    slug: "bottle-top-dispenser-dispensette-s",
    mainCategory: "Liquid Handling",
    categorySlug: "liquid-handling",
    subcategory: "Bottle Top Dispensers",
    shortDescription: "High precision bottle-top dispenser for laboratory workflows.",
    description:
      "A production-ready product page will eventually fetch this content from MongoDB. For now, this scaffold shows where product content, options, pricing, accessories, charts, videos, and reviews belong.",
    mainImage:
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
    galleryImages: [
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1779262943/Screenshot_2026-05-20_131002_empckl.png",
      "https://res.cloudinary.com/dzrg0utcm/image/upload/v1780480890/ChatGPT_Image_Jun_3_2026_03_31_17_PM_nifxs0.png",
    ],
    options: [
      {
        title: "Volume Range",
        values: ["0.1 ml - 1 ml", "0.2 ml - 2 ml", "0.5 ml - 5 ml", "1 ml - 10 ml"],
      },
      {
        title: "Recirculation Valve",
        values: ["Yes", "No"],
      },
    ],
    priceList: [
      { model: "Model A", price: "INR 5,000" },
      { model: "Model B", price: "INR 7,200" },
    ],
    accessories: ["Adapter", "Tube", "Nozzle"],
    spareParts: ["Valve", "Piston", "Seal"],
    advantages: ["Accurate dispensing", "Easy calibration", "Chemical resistant"],
    charts: ["Chemical resistance chart", "Volume accuracy chart"],
    videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    reviews: [
      { name: "Customer Name", rating: 5, comment: "Good product" },
      { name: "Lab Manager", rating: 4, comment: "Reliable and easy to calibrate" },
    ],
  },
];

export function getCategoryBySlug(slug) {
  return categoryMenu.find((category) => category.slug === slug);
}

export function getProductsByCategorySlug(slug) {
  return products.filter((product) => product.categorySlug === slug);
}

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug);
}
