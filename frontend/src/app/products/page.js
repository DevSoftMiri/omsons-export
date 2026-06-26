import StorefrontChrome from "@/components/store/StorefrontChrome";
import ProductCatalogClient from "@/components/store/ProductCatalogClient";
import { fetchCatalogueCategories } from "@/lib/storefront";

export default async function ProductsPage() {
  const categories = await fetchCatalogueCategories();
  const products = categories.flatMap((category) =>
    (category.products || []).map((product) => ({
      ...product,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        tableColumns: category.tableColumns || [],
      },
    }))
  );

  return (
    <StorefrontChrome>
      <ProductCatalogClient
        products={products}
        categories={categories}
        title="All Products"
        description="Browse products by category from the backend catalogue."
      />
    </StorefrontChrome>
  );
}
