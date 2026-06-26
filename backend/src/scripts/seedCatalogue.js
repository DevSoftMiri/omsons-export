const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductRow = require("../models/ProductRow");

const catalogueData = [
  {
    name: "Adapters",
    slug: "adapters",
    description: "Laboratory adapters and reduction pieces for compact joint assemblies.",
    tableColumns: ["Cat. No.", "Socket Size", "Cone Size", "Pack Unit"],
    products: [
      {
        name: "Adapters, Bushing, with Drip-tip",
        slug: "adapters-bushing-with-drip-tip",
        description: "Thick wall and reinforced rim adaptor for compact dissimilar joint assemblies.",
        bulletPoints: [
          "Thick wall and reinforced Rim.",
          "Outside of the bushing has full length and inside has smaller length.",
          "For compact assembly of dissimilar Joints.",
        ],
        imageUrl: buildProductCardSvg("Drip-tip"),
        icons: buildIconSet(["Glass Boro 3.3", "Chemical Resistant", "One Cone", "Drip-tip"]),
        rows: [
          {
            values: {
              "Cat. No.": "1000.100.01",
              "Socket Size": "14/23",
              "Cone Size": "19/26",
              "Pack Unit": "10",
            },
          },
        ],
      },
      {
        name: "Adapters, Bushing, with Drip-tip, ASTM",
        slug: "adapters-bushing-with-drip-tip-astm",
        description: "Heavy-wall ASTM adaptor for compact and serviceable laboratory assemblies.",
        bulletPoints: [
          "These adapters are fabricated with heavy walls for mechanical strength.",
          "Further strengthened by the heavy, uniform rim at the top which affords a serviceable finger grip.",
          "These adapters are shorter than the conventional type, thus allowing more compact assemblies.",
          "Useful for attaching thermometers.",
        ],
        imageUrl: buildProductCardSvg("ASTM"),
        icons: buildIconSet(["Glass Boro 3.3", "Chemical Resistant", "One Cone", "Drip-tip"]),
        rows: [
          {
            values: {
              "Cat. No.": "1000.101.01",
              "Socket Size": "14/20",
              "Cone Size": "19/22",
              "Pack Unit": "10",
            },
          },
        ],
      },
      {
        name: "Adapters, Reduction",
        slug: "adapters-reduction",
        description: "Reduction adaptors for socket-to-cone assemblies in laboratory glassware.",
        bulletPoints: [
          "Complies as per DIN 12257.",
          "Small size socket at top & big size cone at bottom.",
        ],
        imageUrl: buildProductCardSvg("Reduction"),
        icons: buildIconSet(["Glass Boro 3.3", "Chemical Resistant", "One Cone", "One Socket"]),
        rows: [
          { values: { "Cat. No.": "1001.100.01", "Socket Size": "14/23", "Cone Size": "19/26", "Pack Unit": "10" } },
          { values: { "Cat. No.": "1001.100.02", "Socket Size": "14/23", "Cone Size": "24/29", "Pack Unit": "10" } },
          { values: { "Cat. No.": "1001.100.03", "Socket Size": "14/23", "Cone Size": "29/32", "Pack Unit": "10" } },
          { values: { "Cat. No.": "1001.100.04", "Socket Size": "19/26", "Cone Size": "24/29", "Pack Unit": "10" } },
          { values: { "Cat. No.": "1001.100.05", "Socket Size": "19/26", "Cone Size": "29/32", "Pack Unit": "10" } },
        ],
      },
    ],
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  await ProductRow.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});

  for (const [categoryIndex, categoryData] of catalogueData.entries()) {
    const category = await Category.create({
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
      tableColumns: categoryData.tableColumns,
      isActive: true,
      sortOrder: categoryIndex + 1,
    });

    for (const [productIndex, productData] of categoryData.products.entries()) {
      const product = await Product.create({
        categoryId: category._id,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        bulletPoints: productData.bulletPoints,
        imageUrl: productData.imageUrl,
        icons: productData.icons,
        technicalTags: [],
        isActive: true,
        sortOrder: productIndex + 1,
      });

      await ProductRow.insertMany(
        productData.rows.map((row, rowIndex) => ({
          productId: product._id,
          values: normalizeRowValues(row.values, category.tableColumns),
          isActive: true,
          sortOrder: rowIndex + 1,
        }))
      );
    }
  }

  console.log(`Seeded ${catalogueData.length} categories with grouped products and dynamic rows.`);
  await mongoose.disconnect();
}

function normalizeRowValues(values, tableColumns) {
  const source = values && typeof values === "object" ? values : {};

  return tableColumns.reduce((accumulator, column) => {
    accumulator[column] = String(source[column] ?? "").trim();
    return accumulator;
  }, {});
}

function buildIconSet(labels) {
  return labels.map((label) => ({
    label,
    imageUrl: buildCircleIconSvg(label),
  }));
}

function buildCircleIconSvg(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r="45" fill="white" stroke="#74c0fc" stroke-width="3"/>
      <text x="48" y="42" text-anchor="middle" font-size="12" font-family="Arial" fill="#1676b8">${escapeXml(
        wrapLabel(label)[0]
      )}</text>
      <text x="48" y="58" text-anchor="middle" font-size="12" font-family="Arial" fill="#1676b8">${escapeXml(
        wrapLabel(label)[1]
      )}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildProductCardSvg(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="440" height="620" viewBox="0 0 440 620">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#f8fbff" />
          <stop offset="100%" stop-color="#d7e7f8" />
        </linearGradient>
      </defs>
      <rect width="440" height="620" rx="36" fill="url(#g)" />
      <path d="M160 80h120v90c0 26 18 48 42 56v172c0 52-38 100-102 100s-102-48-102-100V226c24-8 42-30 42-56z" fill="#eff6fd" stroke="#93b4d8" stroke-width="6"/>
      <rect x="164" y="78" width="112" height="34" rx="14" fill="#dceaf8" stroke="#93b4d8" stroke-width="6"/>
      <rect x="172" y="114" width="96" height="54" rx="18" fill="#f7fbff" stroke="#93b4d8" stroke-width="5"/>
      <text x="220" y="540" text-anchor="middle" font-size="34" font-family="Arial" font-weight="700" fill="#194b86">${escapeXml(label)}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function wrapLabel(label) {
  const parts = String(label).split(" ");
  if (parts.length === 1) {
    return [parts[0], ""];
  }
  const midpoint = Math.ceil(parts.length / 2);
  return [parts.slice(0, midpoint).join(" "), parts.slice(midpoint).join(" ")];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

seed().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_error) {}
  process.exit(1);
});
