import Link from "next/link";
import { appRoutes } from "@/lib/routes";

export default function CategorySidebar({ category }) {
  return (
    <aside style={styles.sidebar}>
      <h3 style={styles.heading}>{category.title}</h3>
      <p style={styles.description}>{category.description}</p>
      {category.subcategories.map((item) => (
        <Link key={item.slug} href={appRoutes.category(item.slug)} style={styles.link}>
          {item.name}
        </Link>
      ))}
    </aside>
  );
}

const styles = {
  sidebar: {
    display: "grid",
    gap: "0.75rem",
    padding: "1.25rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    background: "#ffffff",
    alignContent: "start",
  },
  heading: {
    margin: 0,
    color: "#0f172a",
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  link: {
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: 500,
  },
};
