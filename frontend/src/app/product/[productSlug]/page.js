import ProductDetailClient from "@/components/store/ProductDetailClient";
import StorefrontChrome from "@/components/store/StorefrontChrome";
import {
  fetchCategoryProducts,
  fetchProduct,
} from "@/lib/storefront";

export default async function ProductPage({ params }) {
  const { productSlug } = await params;
  const product = await fetchProduct(productSlug);

  if (!product) {
    return <main style={styles.empty}>Product not found.</main>;
  }

  const relatedProducts = product.category?.slug
    ? rankSimilarProducts(
        product,
        (await fetchCategoryProducts(product.category.slug)).filter((item) => item.slug !== product.slug)
      )
        .map((item) => item.product)
        .slice(0, 6)
    : [];

  return (
    <StorefrontChrome>
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </StorefrontChrome>
  );
}

const styles = {
  empty: {
    padding: "3rem",
  },
};

function rankSimilarProducts(sourceProduct, products) {
  const sourceText = normalizeComparisonText([
    sourceProduct.name,
    sourceProduct.slug,
    sourceProduct.category?.name,
  ].join(" "));
  const sourceTokens = tokenizeComparisonText(sourceText);

  return [...products]
    .map((product) => {
      const targetText = normalizeComparisonText([
        product.name,
        product.slug,
        product.category?.name,
      ].join(" "));
      const targetTokens = tokenizeComparisonText(targetText);
      const overlap = calculateTokenOverlap(sourceTokens, targetTokens);
      const includesBoost =
        targetText.includes(sourceText) || sourceText.includes(targetText) ? 0.75 : 0;
      const prefixBoost = hasSharedPrefix(sourceText, targetText) ? 0.35 : 0;
      const nameLengthPenalty = Math.min(Math.abs(sourceText.length - targetText.length) / 120, 0.25);
      const score = overlap + includesBoost + prefixBoost - nameLengthPenalty;

      return { product, score };
    })
    .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name))
    .filter((item) => item.score > 0 || !sourceTokens.length);
}

function normalizeComparisonText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeComparisonText(value) {
  const stopWords = new Set(["and", "for", "the", "with", "a", "an", "of", "to", "in", "on"]);
  return normalizeComparisonText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token && token.length > 2 && !stopWords.has(token));
}

function calculateTokenOverlap(sourceTokens, targetTokens) {
  if (!sourceTokens.length || !targetTokens.length) {
    return 0;
  }

  const targetSet = new Set(targetTokens);
  const matches = sourceTokens.filter((token) => targetSet.has(token)).length;
  return matches / Math.max(sourceTokens.length, targetTokens.length);
}

function hasSharedPrefix(sourceText, targetText) {
  const sourceHead = sourceText.split(" ").slice(0, 2).join(" ");
  const targetHead = targetText.split(" ").slice(0, 2).join(" ");
  return Boolean(sourceHead && targetHead && (sourceHead === targetHead || sourceHead.includes(targetHead) || targetHead.includes(sourceHead)));
}
