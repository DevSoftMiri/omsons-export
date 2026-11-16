export const omsonsNavbarPreset = [
  {
    title: "Lab Glassware",
    slug: "lab-glassware",
    order: 0,
    submenus: [{ title: "Lab Glassware", items: ["Beakers", "Bottles", "Burettes", "Columns", "Condensers", "Cylinders", "Glassware Dryer", "Desiccator", "Dishes", "Distillation", "Boiling Flasks", "Volumetric Flasks", "Funnels", "Pipettes", "Accessories", "Viscometers"].map((name) => ({ name })) }],
  },
  {
    title: "Lab Instruments",
    slug: "lab-instruments",
    order: 1,
    submenus: [{ title: "Lab Instruments", items: ["Kjeldahl Digestion Units", "Hotplates", "Hotplate with Magnetic Stirrer", "Heating Mantles", "Heating Mantles with Stirrer", "Vortex Mixer", "Glassware Dryer"].map((name) => ({ name })) }],
  },
  {
    title: "Filters & Membrane",
    slug: "filters-membrane",
    order: 2,
    submenus: [{ title: "Filters & Membrane", items: ["Syringe Filters —> Sterile—> Non Sterile", "Double Layered Syringe Filters —> Sterile—> Non Sterile", "Capsule Filter", "Membrane Disc Filter —> Sterile—> Non Sterile", "Filter Funnel Manifolds", "Micro Filter Funnel", "Cartridge Filters", "Canisters", "Thimbles"].map((name) => ({ name })) }],
  },
  {
    title: "Hydrometers",
    slug: "hydrometers",
    order: 3,
    submenus: [{ title: "Hydrometers", items: ["Petroleum Measurement", "Wine & Beer Hydrometers", "Battery Hydrometers", "Density Hydrometers", "Specific Gravity Glass Hydrometers, General Purpose", "Baume Glass Hydrometers", "Twaddle Glass Hydrometers", "Brix Glass Hydrometers", "Soil Glass Hydrometers", "Sikes Glass Hydrometers", "Glass Alcoholometers", "Lactometer", "Urinometers", "Brass Baume Hydrometers"].map((name) => ({ name })) }],
  },
  {
    title: "Metalware",
    slug: "metalware",
    order: 4,
    submenus: [{ title: "Metalware", items: ["Burette Clamps", "Laboratory Jacks", "Retort Clamps", "Bossheads", "Rectangular Stands", "Retort Rings", "Tripod Stands", "Spatulas", "Burners", "Tongs", "Forceps", "Test Tube Holder"].map((name) => ({ name })) }],
  },
  {
    title: "Plasticware",
    slug: "plasticware",
    order: 5,
    submenus: [{ title: "Plasticware", items: ["Beakers", "Measuring Cylinders", "Burettes", "Volumetric Flasks", "Measuring Jugs", "Aspirator Bottles", "Dropping Bottles", "Carboys", "Reagent Bottles", "Wash Bottles", "Desiccators", "Conical Flasks", "Separating Funnels", "Sample Container Bottle", "Funnels", "Cryo Vials", "Laboratory Trays", "Petri-dishes", "Spatula", "Forceps", "Pipette Stands", "Test Tube Stands", "Stoppers", "Screw Caps", "Pipette Pumps"].map((name) => ({ name })) }],
  },
  {
    title: "Rubberware",
    slug: "rubberware",
    order: 6,
    submenus: [{ title: "Rubberware", items: ["Pipette Bulbs", "Safety Rings", "Flask Stands", "Sleeves", "Tubings", "Filtration Cones", "Turnover Flange Septa", "Corks/Stoppers"].map((name) => ({ name })) }],
  },
  {
    title: "Thermometers",
    slug: "thermometers",
    order: 7,
    submenus: [{ title: "Thermometers", items: ["Petroleum Glass Thermometers", "Glass Thermometers, General Purpose", "Minus Range Glass Thermometers", "Precision Glass Thermometers", "IP/ASTM Glass Thermometers", "Cold Chain Vaccine Thermometers", "Hygrometers, Wet & Dry Bulb", "Maximum & Minimum Thermometers", "Room Thermometers", "Closed Cup Thermometers (CCT)", "Soil Thermometers", "Whirling Hygrometers", "Sample Container Bottle"].map((name) => ({ name })) }],
  },
];

export function getNavbarPreviewData(navbars = omsonsNavbarPreset) {
  return navbars.map((navbar, index) => ({
    title: navbar.title,
    slug: navbar.slug || createSlug(navbar.title),
    order: Number.isFinite(Number(navbar.order)) ? Number(navbar.order) : index,
    submenus: Array.isArray(navbar.submenus)
      ? expandExcelCards(navbar).map((submenu) => ({
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

function expandExcelCards(navbar) {
  const excelSlugs = new Set([
    "lab-glassware",
    "lab-instruments",
    "filters-membrane",
    "hydrometers",
    "metalware",
    "plasticware",
    "rubberware",
    "thermometers",
  ]);
  const submenus = Array.isArray(navbar.submenus) ? navbar.submenus : [];
  const first = submenus[0];

  if (excelSlugs.has(navbar.slug) && submenus.length === 1 && first?.items?.length) {
    return first.items.map((item) => {
      const parts = String(item.name || "").split(/\s*(?:—>|->)\s*/).filter(Boolean);
      return {
        title: parts[0] || item.name,
        items: parts.slice(1).map((name) => ({ name })),
      };
    });
  }

  return submenus;
}

function createSlug(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
