import Link from "next/link";
import { appRoutes } from "@/lib/routes";

export default function DynamicNavbar({ categories = [] }) {
  return (
    <nav style={styles.nav}>
      {categories.map((category) => (
        <div key={category.slug} style={styles.item}>
          <span style={styles.link}>{category.title}</span>
          <div style={styles.dropdown}>
            <strong style={styles.dropdownTitle}>{category.title}</strong>
            {(category.submenus || []).map((submenu) => (
              <div key={`${category.slug}-${submenu.title}`} style={styles.submenuGroup}>
                <span style={styles.submenuTitle}>{submenu.title}</span>
                {(submenu.items || []).map((item) => (
                  <Link
                    key={item.slug}
                    href={appRoutes.category(item.slug)}
                    style={styles.dropdownLink}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  item: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  link: {
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 600,
  },
  dropdown: {
    display: "grid",
    gap: "0.35rem",
    minWidth: "14rem",
    padding: "0.9rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    background: "#f8fafc",
  },
  dropdownTitle: {
    color: "#334155",
  },
  submenuGroup: {
    display: "grid",
    gap: "0.35rem",
  },
  submenuTitle: {
    color: "#0f172a",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  dropdownLink: {
    color: "#475569",
    textDecoration: "none",
  },
};
