import { Suspense } from "react";
import StorefrontChrome from "@/components/store/StorefrontChrome";
import ProductCatalogClient from "@/components/store/ProductCatalogClient";
import { fetchCatalogueCategories, fetchCategory } from "@/lib/storefront";

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  const [selectedCategory, catalogueCategories] = await Promise.all([
    fetchCategory(categorySlug),
    fetchCatalogueCategories(),
  ]);

  if (!selectedCategory) {
    return <main className="p-12 text-slate-500">Category not found.</main>;
  }

  const products = catalogueCategories.flatMap((category) =>
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
      <Suspense fallback={null}>
        <ProductCatalogClient
          products={products}
          categories={catalogueCategories}
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
