import StorefrontChrome from "@/components/store/StorefrontChrome";
import CatalogueSections from "@/components/store/CatalogueSections";
import { fetchCategory } from "@/lib/storefront";

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  const category = await fetchCategory(categorySlug);

  if (!category) {
    return <main className="p-12 text-slate-500">Category not found.</main>;
  }

  return (
    <StorefrontChrome>
      <CatalogueSections categories={[category]} singleSection />
    </StorefrontChrome>
  );
}
