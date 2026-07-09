export const omsonsNavbarPreset = [
  {
    title: "Filtration",
    slug: "filtration",
    order: 0,
    submenus: [{ title: "Filters & Membrane", items: [] }],
  },
  {
    title: "Laboratory Instruments",
    slug: "laboratory-instruments",
    order: 1,
    submenus: [
      { title: "Lab Instruments", items: [] },
      { title: "Accessories", items: [] },
      { title: "Viscometers", items: [] },
      { title: "Porcelain", items: [] },
    ],
  },
  {
    title: "Plasticware",
    slug: "plasticware",
    order: 2,
    submenus: [{ title: "Plasticware", items: [] }],
  },
  {
    title: "Glassware",
    slug: "glassware",
    order: 3,
    submenus: [
      { title: "Adapters", items: [] },
      { title: "Beakers", items: [] },
      { title: "Bottles", items: [] },
      { title: "Burettes", items: [] },
      { title: "Columns", items: [] },
      { title: "Condensers", items: [] },
      { title: "Cylinders", items: [] },
      { title: "Desiccator / Dishes", items: [] },
      { title: "Distillation", items: [] },
      { title: "Volumetric Flasks", items: [] },
      { title: "Flasks", items: [] },
      { title: "Funnels", items: [] },
      { title: "Pipettes", items: [] },
      { title: "Tubes", items: [] },
    ],
  },
  {
    title: "Hydrometers",
    slug: "hydrometers",
    order: 4,
    submenus: [{ title: "Hydrometers", items: [] }],
  },
  {
    title: "Thermometers",
    slug: "thermometers",
    order: 5,
    submenus: [{ title: "Thermometers", items: [] }],
  },
  {
    title: "Rubberware",
    slug: "rubberware",
    order: 6,
    submenus: [{ title: "Rubberware", items: [] }],
  },
  {
    title: "Metalware",
    slug: "metalware",
    order: 7,
    submenus: [{ title: "Metalware", items: [] }],
  },
  {
    title: "Sintered Ware",
    slug: "sintered-ware",
    order: 8,
    submenus: [{ title: "Sintered Glassware", items: [] }],
  },
  {
    title: "Quartzware",
    slug: "quartzware",
    order: 9,
    submenus: [{ title: "Quartzware", items: [] }],
  },
];

export function getNavbarPreviewData(navbars = omsonsNavbarPreset) {
  return navbars.map((navbar, index) => ({
    title: navbar.title,
    slug: navbar.slug || createSlug(navbar.title),
    order: Number.isFinite(Number(navbar.order)) ? Number(navbar.order) : index,
    submenus: Array.isArray(navbar.submenus)
      ? navbar.submenus.map((submenu) => ({
          title: submenu.title,
          slug: submenu.slug || createSlug(submenu.title),
          items: Array.isArray(submenu.items)
            ? submenu.items.map((item) => ({
                name: item.name,
                slug: item.slug || createSlug(item.name),
              }))
            : [],
        }))
      : [],
  }));
}

function createSlug(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
