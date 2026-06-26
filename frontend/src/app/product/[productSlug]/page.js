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

  const relatedProducts = product.category
    ? (await fetchCategoryProducts(product.category))
        .filter((item) => item.slug !== product.slug)
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
