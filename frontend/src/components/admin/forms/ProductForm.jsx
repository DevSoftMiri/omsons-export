export default function ProductForm() {
  const fields = [
    "Product Name",
    "Slug",
    "Main Category",
    "Subcategory",
    "Short Description",
    "Full Description",
  ];

  return (
    <section style={styles.panel}>
      <h2 style={styles.heading}>Product Form Scaffold</h2>
      <div style={styles.grid}>
        {fields.map((field) => (
          <label key={field} style={styles.field}>
            <span>{field}</span>
            <input placeholder={field} style={styles.input} />
          </label>
        ))}
      </div>
      <div style={styles.note}>
        This is the correct place to wire dynamic options, price list rows, gallery uploads,
        charts, videos, accessories, and reviews.
      </div>
    </section>
  );
}

const styles = {
  panel: {
    display: "grid",
    gap: "1rem",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  heading: {
    margin: 0,
    color: "#0f172a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
    gap: "1rem",
  },
  field: {
    display: "grid",
    gap: "0.5rem",
    color: "#334155",
  },
  input: {
    padding: "0.8rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
  },
  note: {
    color: "#475569",
    lineHeight: 1.6,
  },
};
