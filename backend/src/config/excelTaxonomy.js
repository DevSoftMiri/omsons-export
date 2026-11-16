const excelTaxonomy = {
  "Lab Glassware": ["Adapters", "Beakers", "Bottles", "Burettes", "Columns", "Condensers", "Cylinders", "Desiccator", "Dishes", "Distillation", "Boiling Flasks", "Volumetric Flasks", "Funnels", "Pipettes", "Accessories", "Viscometers"],
  "Lab Instruments": ["Kjeldahl Digestion Units", "Hotplates", "Hotplate with Magnetic Stirrer", "Heating Mantles", "Heating Mantles with Stirrer", "Vortex Mixer", "Glassware Dryer"],
  "Filters & Membrane": ["Syringe Filters", "Double Layered Syringe Filters", "Capsule Filter", "Membrane Disc Filter", "Filter Funnel Manifolds", "Micro Filter Funnel", "Cartridge Filters", "Canisters", "Thimbles"],
  Hydrometers: ["Petroleum Measurement", "Wine & Beer Hydrometers", "Ethanol Kits", "Battery Hydrometers", "Density Hydrometers", "Specific Gravity Glass Hydrometers, General Purpose", "Baume Glass Hydrometers", "Twaddle Glass Hydrometers", "Brix Glass Hydrometers", "Soil Glass Hydrometers", "Sikes Glass Hydrometers", "Glass Alcoholometers", "Lactometer", "Urinometers", "Brass Baume Hydrometers"],
  Metalware: ["Burette Clamps", "Laboratory Jacks", "Retort Clamps", "Bossheads", "Rectangular Stands", "Retort Rings", "Tripod Stands", "Spatulas", "Burners", "Tongs", "Forceps", "Test Tube Holder"],
  Plasticware: ["Beakers", "Measuring Cylinders", "Burettes", "Volumetric Flasks", "Measuring Jugs", "Aspirator Bottles", "Dropping Bottles", "Carboys", "Reagent Bottles", "Wash Bottles", "Desiccators", "Conical Flasks", "Separating Funnels", "Sample Container Bottle", "Funnels", "Cryo Vials", "Laboratory Trays", "Petri-dishes", "Spatula", "Forceps", "Pipette Stands", "Test Tube Stands", "Stoppers", "Screw Caps", "Pipette Pumps"],
  Rubberware: ["Pipette Bulbs", "Safety Rings", "Flask Stands", "Sleeves", "Tubings", "Filtration Cones", "Turnover Flange Septa", "Corks/Stoppers"],
  Thermometers: ["Petroleum Glass Thermometers", "Glass Thermometers, General Purpose", "Minus Range Glass Thermometers", "Precision Glass Thermometers", "IP/ASTM Glass Thermometers", "Cold Chain Vaccine Thermometers", "Hygrometers, Wet & Dry Bulb", "Maximum & Minimum Thermometers", "Room Thermometers", "Closed Cup Thermometers (CCT)", "Soil Thermometers", "Whirling Hygrometers", "Sample Container Bottle"],
};

const aliases = {
  adaptors: "adapters",
  thermometer: "thermometers",
  thermometers: "thermometers",
  hydrometer: "hydrometers",
  hydrometers: "hydrometers",
  "desiccator-dishes": "desiccator",
  distillations: "distillation",
  "flasks-volumetric": "volumetric-flasks",
  "sintered-glassware": "filtration-cones",
};

function normalizeTaxonomyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function taxonomySlug(value) {
  if (String(value || "").trim().toLowerCase() === "filters & membrane") {
    return "filters-membrane";
  }
  return normalizeTaxonomyName(value).replace(/ /g, "-");
}

const canonicalBySlug = new Map();
for (const [mainCategory, subcategories] of Object.entries(excelTaxonomy)) {
  canonicalBySlug.set(taxonomySlug(mainCategory), { name: mainCategory, slug: taxonomySlug(mainCategory), mainCategory });
  for (const name of subcategories) {
    canonicalBySlug.set(taxonomySlug(name), { name, slug: taxonomySlug(name), mainCategory });
  }
}

function resolveCanonicalCategory(value) {
  const rawSlug = taxonomySlug(value);
  const resolvedSlug = aliases[rawSlug] || rawSlug;
  return canonicalBySlug.get(resolvedSlug) || null;
}

module.exports = { aliases, excelTaxonomy, resolveCanonicalCategory, taxonomySlug };
