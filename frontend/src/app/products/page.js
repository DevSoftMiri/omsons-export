import ProductCatalogClient from "@/components/store/ProductCatalogClient";
import StorefrontChrome from "@/components/store/StorefrontChrome";
import { fetchAllProducts, fetchCategories } from "@/lib/storefront";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    fetchAllProducts(),
    fetchCategories(),
  ]);

  return (
    <StorefrontChrome>
      <ProductCatalogClient
        products={products}
        categories={categories}
        title="All Products"
        description={`${products.length.toLocaleString()} products`}
        activeCategorySlug="all"
      />
    </StorefrontChrome>
  );
}
