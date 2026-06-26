import DynamicNavbar from "@/components/store/DynamicNavbar";
import CategorySidebar from "@/components/store/CategorySidebar";
import ProductCard from "@/components/store/ProductCard";
import {
  buildCategoryContext,
  fetchCategory,
  fetchCategoryProducts,
  fetchNavbar,
} from "@/lib/storefront";

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params;
  const [navbars, categoryRecord, categoryProducts] = await Promise.all([
    fetchNavbar(),
    fetchCategory(categorySlug),
    fetchCategoryProducts(categorySlug),
  ]);
  const category = buildCategoryContext(navbars, categorySlug, categoryRecord);

  if (!category) {
    return <main style={styles.empty}>Category not found.</main>;
  }

  return (
    <main style={styles.page}>
      <DynamicNavbar categories={navbars} />
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>{category.parentTitle}</p>
          <h1 style={styles.title}>{category.title}</h1>
          <p style={styles.description}>{category.description}</p>
        </div>
        <div style={styles.heroCard}>
          <span style={styles.heroMeta}>{category.submenuTitle}</span>
          <p style={styles.heroCopy}>
            Product count: {categoryProducts.length}
          </p>
        </div>
      </section>
      <section style={styles.content}>
        <CategorySidebar category={category} />
        <div style={styles.grid}>
          {categoryProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "1.5rem",
    alignItems: "center",
    padding: "2rem",
  },
  eyebrow: {
    margin: "0 0 0.5rem",
    color: "#64748b",
    textTransform: "uppercase",
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
  },
  title: {
    margin: "0 0 0.75rem",
    color: "#0f172a",
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },
  heroImage: {
    width: "100%",
    height: "18rem",
    objectFit: "cover",
    borderRadius: "0.5rem",
  },
  heroCard: {
    display: "grid",
    gap: "0.75rem",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    alignContent: "start",
  },
  heroMeta: {
    color: "#0f172a",
    fontWeight: 600,
  },
  heroCopy: {
    margin: 0,
    color: "#475569",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "18rem 1fr",
    gap: "1.5rem",
    padding: "0 2rem 2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
    gap: "1.25rem",
  },
  empty: {
    padding: "3rem",
  },
};
