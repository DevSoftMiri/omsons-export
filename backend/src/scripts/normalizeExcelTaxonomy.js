const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const Category = require("../models/Category");
const Product = require("../models/Product");
const { excelTaxonomy, resolveCanonicalCategory, taxonomySlug } = require("../config/excelTaxonomy");

function clean(value) {
  return String(value || "").trim();
}

function inferCanonicalCategory(product, currentCategory) {
  const haystack = `${product.name || ""} ${currentCategory?.name || ""}`.toLowerCase();
  const currentName = String(currentCategory?.name || "").trim().toLowerCase();
  const parentFallbacks = {
    "sintered glassware": "Filters & Membrane",
    porcelain: "Lab Instruments",
    tubes: "Lab Glassware",
    flasks: "Lab Glassware",
    "desiccator / dishes": "Desiccator",
  };
  // Specific rules must run before their broader parent terms. This keeps
  // products such as "IP/ASTM glass thermometer" and "hotplate with stirrer"
  // in the matching Excel subcategory instead of the generic category.
  const specificRules = [
    ["double layered syringe filters", "Double Layered Syringe Filters"],
    ["filter funnel manifold", "Filter Funnel Manifolds"],
    ["hotplate with magnetic stirrer", "Hotplate with Magnetic Stirrer"],
    ["heating mantle with stirrer", "Heating Mantles with Stirrer"],
    ["ip/astm", "IP/ASTM Glass Thermometers"],
    ["maximum & minimum", "Maximum & Minimum Thermometers"],
    ["closed cup", "Closed Cup Thermometers (CCT)"],
    ["cold chain", "Cold Chain Vaccine Thermometers"],
    ["minus range", "Minus Range Glass Thermometers"],
    ["precision glass thermometer", "Precision Glass Thermometers"],
    ["petroleum glass thermometer", "Petroleum Glass Thermometers"],
    ["soil thermometer", "Soil Thermometers"],
    ["room thermometer", "Room Thermometers"],
    ["whirling hygrometer", "Whirling Hygrometers"],
    ["brass baume", "Brass Baume Hydrometers"],
    ["corks/stoppers", "Corks/Stoppers"],
    ["petri-dish", "Petri-dishes"],
    ["rectangular stand", "Rectangular Stands"],
    ["safety ring", "Safety Rings"],
    ["sleeve", "Sleeves"],
    ["spatula, pp", "Spatula"],
    ["canister", "Canisters"],
    ["thimble", "Thimbles"],
    ["laboratory tray", "Laboratory Trays"],
    ["sample container bottle", "Sample Container Bottle"],
    ["screw cap", "Screw Caps"],
    ["stopper", "Stoppers"],
    ["burner", "Burners"],
    ["tongs", "Tongs"],
    ["spatula", "Spatulas"],
    ["desiccator", "Desiccators"],
    ["dish", "Dishes"],
  ];
  const rules = [
    ["double layered syringe filters", "Double Layered Syringe Filters"],
    ["membrane disc filter", "Membrane Disc Filter"],
    ["syringe filter", "Syringe Filters"],
    ["capsule filter", "Capsule Filter"],
    ["filter funnel manifold", "Filter Funnel Manifolds"],
    ["micro filter funnel", "Micro Filter Funnel"],
    ["cartridge filter", "Cartridge Filters"],
    ["glassware dryer", "Glassware Dryer"],
    ["boiling flask", "Boiling Flasks"],
    ["volumetric flask", "Volumetric Flasks"],
    ["conical flask", "Conical Flasks"],
    ["separating funnel", "Separating Funnels"],
    ["kjeldahl", "Kjeldahl Digestion Units"],
    ["hotplate", "Hotplates"],
    ["heating mantle", "Heating Mantles"],
    ["vortex mixer", "Vortex Mixer"],
    ["beaker", "Beakers"],
    ["measuring cylinder", "Measuring Cylinders"],
    ["measuring jug", "Measuring Jugs"],
    ["aspirator bottle", "Aspirator Bottles"],
    ["dropping bottle", "Dropping Bottles"],
    ["carboy", "Carboys"],
    ["reagent bottle", "Reagent Bottles"],
    ["wash bottle", "Wash Bottles"],
    ["cryo vial", "Cryo Vials"],
    ["petri", "Petri-dishes"],
    ["pipette bulb", "Pipette Bulbs"],
    ["safety ring", "Safety Rings"],
    ["flask stand", "Flask Stands"],
    ["tubing", "Tubings"],
    ["turnover flange", "Turnover Flange Septa"],
    ["cork", "Corks/Stoppers"],
    ["petroleum", "Petroleum Measurement"],
    ["water finding paste", "Petroleum Measurement"],
    ["wine", "Wine & Beer Hydrometers"],
    ["beer", "Wine & Beer Hydrometers"],
    ["ethanol", "Ethanol Kits"],
    ["battery hydrometer", "Battery Hydrometers"],
    ["density", "Density Hydrometers"],
    ["specific gravity", "Specific Gravity Glass Hydrometers, General Purpose"],
    ["baume", "Baume Glass Hydrometers"],
    ["twaddle", "Twaddle Glass Hydrometers"],
    ["brix", "Brix Glass Hydrometers"],
    ["soil hydrometer", "Soil Glass Hydrometers"],
    ["sikes", "Sikes Glass Hydrometers"],
    ["alcoholometer", "Glass Alcoholometers"],
    ["lactometer", "Lactometer"],
    ["urinometer", "Urinometers"],
    ["brass baume", "Brass Baume Hydrometers"],
    ["petroleum glass thermometer", "Petroleum Glass Thermometers"],
    ["glass thermometer", "Glass Thermometers, General Purpose"],
    ["thermometer", "Thermometers"],
    ["hygrometer", "Hygrometers, Wet & Dry Bulb"],
    ["pipette stand", "Pipette Stands"],
    ["test tube stand", "Test Tube Stands"],
    ["pipette pump", "Pipette Pumps"],
    ["burette clamp", "Burette Clamps"],
    ["laboratory jack", "Laboratory Jacks"],
    ["retort clamp", "Retort Clamps"],
    ["bosshead", "Bossheads"],
    ["retort ring", "Retort Rings"],
    ["tripod", "Tripod Stands"],
    ["forceps", "Forceps"],
    ["test tube holder", "Test Tube Holder"],
  ];
  const rule = [...specificRules, ...rules].find(([needle]) => haystack.includes(needle));
  return resolveCanonicalCategory(rule ? rule[1] : parentFallbacks[currentName] || currentCategory?.name);
}

async function run() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const existingCategories = await Category.find().sort({ sortOrder: 1 }).lean();
  const products = await Product.find().select("_id name categoryId tableColumns sortOrder").lean();
  const categoryById = new Map(existingCategories.map((category) => [String(category._id), category]));
  const targetBySlug = new Map();
  let created = 0;
  let renamed = 0;
  let assigned = 0;
  let unresolved = 0;

  for (const [mainCategory, subcategories] of Object.entries(excelTaxonomy)) {
    const allNames = [mainCategory, ...subcategories];
    for (const name of allNames) {
      const slug = taxonomySlug(name);
      const existing = await Category.findOne({ slug }).lean();
      const category = await Category.findOneAndUpdate(
        { slug },
        {
          name,
          slug,
          description: `${name} | ${mainCategory}`,
          bulletPoints: [],
          imageUrl: "",
          icons: [],
          tableColumns: existing?.tableColumns?.length ? existing.tableColumns : ["Cat. No."],
          isActive: true,
          sortOrder: targetBySlug.size + 1,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      targetBySlug.set(slug, category);
      if (existing) renamed += 1; else created += 1;
    }
  }

  for (const product of products) {
    const current = categoryById.get(String(product.categoryId));
    const target = inferCanonicalCategory(product, current);
    if (!target) {
      unresolved += 1;
      continue;
    }
    const category = targetBySlug.get(target.slug);
    if (!category) {
      unresolved += 1;
      continue;
    }
    if (String(product.categoryId) !== String(category._id)) {
      await Product.updateOne({ _id: product._id }, { $set: { categoryId: category._id } });
      assigned += 1;
    }
  }

  const activeSlugs = [...targetBySlug.keys()];
  await Category.updateMany({ slug: { $nin: activeSlugs } }, { $set: { isActive: false } });
  console.log(JSON.stringify({ created, existingUpdated: renamed, productsAssigned: assigned, unresolved, activeCategories: activeSlugs.length }, null, 2));
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
