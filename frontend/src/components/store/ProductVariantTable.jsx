export default function ProductVariantTable({ variants = [] }) {
  if (!variants.length) {
    return null;
  }

  const specHeaders = Array.from(
    new Set(
      variants.flatMap((variant) =>
        Object.keys(variant.specs && typeof variant.specs === "object" ? variant.specs : {})
      )
    )
  );

  return (
    <section style={styles.section}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Variants</h2>
        <p style={styles.copy}>SKU, specs, pack size, price, and stock.</p>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.head}>SKU</th>
              <th style={styles.head}>Name</th>
              {specHeaders.map((header) => (
                <th key={header} style={styles.head}>
                  {header}
                </th>
              ))}
              <th style={styles.head}>Pack</th>
              <th style={styles.head}>Price</th>
              <th style={styles.head}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.externalId || variant.sku || variant.slug}>
                <td style={styles.cell}>{variant.sku || "-"}</td>
                <td style={styles.cell}>{variant.name || "-"}</td>
                {specHeaders.map((header) => (
                  <td key={header} style={styles.cell}>
                    {variant.specs?.[header] || "-"}
                  </td>
                ))}
                <td style={styles.cell}>{variant.pack ?? "-"}</td>
                <td style={styles.cell}>{variant.priceLabel || variant.price || "-"}</td>
                <td style={styles.cell}>{variant.inStock ? "In stock" : "Out of stock"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const styles = {
  section: {
    display: "grid",
    gap: "1rem",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  headerRow: {
    display: "grid",
    gap: "0.35rem",
  },
  title: {
    margin: 0,
    color: "#0f172a",
  },
  copy: {
    margin: 0,
    color: "#64748b",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "48rem",
    borderCollapse: "collapse",
  },
  head: {
    padding: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "left",
    color: "#334155",
    fontSize: "0.875rem",
  },
  cell: {
    padding: "0.75rem",
    borderBottom: "1px solid #f1f5f9",
    color: "#475569",
    fontSize: "0.9rem",
    verticalAlign: "top",
  },
};
