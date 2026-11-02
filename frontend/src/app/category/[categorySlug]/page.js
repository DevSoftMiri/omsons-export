import { Suspense } from "react";
import StorefrontChrome from "@/components/store/StorefrontChrome";
import ProductCatalogClient from "@/components/store/ProductCatalogClient";
import { fetchCategories, fetchCategory } from "@/lib/storefront";

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  const [selectedCategory, categories] = await Promise.all([
    fetchCategory(categorySlug),
    fetchCategories(),
  ]);

  if (!selectedCategory) {
    return <main className="p-12 text-slate-500">Category not found.</main>;
  }

  const products = selectedCategory.products || [];

  return (
    <StorefrontChrome>
      <Suspense fallback={null}>
        <ProductCatalogClient
          products={products}
          categories={categories}
          title={selectedCategory.name}
          description={
            selectedCategory.description ||
            `Browse ${selectedCategory.name} products from the backend catalogue.`
          }
          activeCategorySlug={selectedCategory.slug}
        />
      </Suspense>
    </StorefrontChrome>
  );
}
