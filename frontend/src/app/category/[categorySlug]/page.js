import ProductCatalogClient from "@/components/store/ProductCatalogClient";
import StorefrontChrome from "@/components/store/StorefrontChrome";
import {
  fetchAllProducts,
  buildCategoryContext,
  fetchCategory,
  fetchCategories,
  fetchNavbar,
} from "@/lib/storefront";

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  const [navbars, categoryRecord, products, categories] = await Promise.all([
    fetchNavbar(),
    fetchCategory(categorySlug),
    fetchAllProducts(),
    fetchCategories(),
  ]);
  const category = buildCategoryContext(navbars, categorySlug, categoryRecord);

  if (!category) {
    return <main style={styles.empty}>Category not found.</main>;
  }

  return (
    <StorefrontChrome>
      <ProductCatalogClient
        products={products}
        categories={categories}
        title={category.title}
        description={category.description}
        activeCategorySlug={category.slug}
      />
    </StorefrontChrome>
  );
}

const styles = {
  empty: {
    padding: "3rem",
  },
};
