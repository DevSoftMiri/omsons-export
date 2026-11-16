import { Suspense } from "react";
import StorefrontChrome from "@/components/store/StorefrontChrome";
import ProductCatalogClient from "@/components/store/ProductCatalogClient";
import { fetchAllProducts, fetchCatalogueCategories } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const categories = await fetchCatalogueCategories();
  let products = categories.flatMap((category) =>
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

  if (!products.length) {
    products = await fetchAllProducts();
  }

  return (
    <StorefrontChrome>
      <Suspense fallback={null}>
        <ProductCatalogClient
          products={products}
          categories={categories}
          title="All Products"
          description="Browse products by category from the backend catalogue."
        />
      </Suspense>
    </StorefrontChrome>
  );
}
