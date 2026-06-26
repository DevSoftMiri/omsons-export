import DynamicNavbar from "@/components/store/DynamicNavbar";
import ProductGallery from "@/components/store/ProductGallery";
import ProductVariantTable from "@/components/store/ProductVariantTable";
import { fetchNavbar, fetchProduct } from "@/lib/storefront";

export default async function ProductPage({ params }) {
  const { productSlug } = await params;
  const [navbars, product] = await Promise.all([
    fetchNavbar(),
    fetchProduct(productSlug),
  ]);

  if (!product) {
    return <main style={styles.empty}>Product not found.</main>;
  }

  return (
    <main style={styles.page}>
      <DynamicNavbar categories={navbars} />
      <section style={styles.hero}>
        <ProductGallery product={product} />
        <div style={styles.summary}>
          <p style={styles.category}>{product.mainCategory}</p>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.description}>{product.description}</p>
          {product.features?.length ? (
            <ul style={styles.featureList}>
              {product.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {product.descriptionHtml ? (
        <section style={styles.htmlBlock}>
          <h2 style={styles.blockTitle}>Product Description</h2>
          <div
            style={styles.htmlContent}
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </section>
      ) : null}

      <ProductVariantTable variants={product.variants} />

      <section style={styles.sections}>
        <DetailBlock title="Price List" items={product.priceList.map((item) => `${item.model}: ${item.price}`)} />
        <DetailBlock title="Accessories" items={product.accessories} />
        <DetailBlock title="Spare Parts" items={product.spareParts} />
        <DetailBlock title="Advantages" items={product.advantages} />
        <DetailBlock title="Charts" items={product.chartImages} />
        <DetailBlock title="Videos" items={product.videos} />
        <DetailBlock
          title="Reviews"
          items={product.reviews.map((review) => `${review.name} (${review.rating}/5): ${review.comment}`)}
        />
      </section>
    </main>
  );
}

function DetailBlock({ title, items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section style={styles.block}>
      <h2 style={styles.blockTitle}>{title}</h2>
      <ul style={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "2rem",
    minHeight: "100vh",
    padding: "2rem",
    background: "#f8fafc",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "2rem",
    alignItems: "start",
  },
  summary: {
    display: "grid",
    gap: "1rem",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  category: {
    margin: 0,
    color: "#64748b",
  },
  title: {
    margin: 0,
    color: "#0f172a",
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.7,
  },
  featureList: {
    margin: 0,
    paddingLeft: "1.2rem",
    color: "#475569",
    lineHeight: 1.6,
  },
  htmlBlock: {
    display: "grid",
    gap: "0.75rem",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  htmlContent: {
    color: "#475569",
    lineHeight: 1.7,
  },
  sections: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
    gap: "1rem",
  },
  block: {
    display: "grid",
    gap: "0.75rem",
    padding: "1.25rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  blockTitle: {
    margin: 0,
    color: "#0f172a",
  },
  list: {
    margin: 0,
    paddingLeft: "1.2rem",
    color: "#475569",
    lineHeight: 1.6,
  },
  empty: {
    padding: "3rem",
  },
};
