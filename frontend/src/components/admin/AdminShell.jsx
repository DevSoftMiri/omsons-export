import DashboardSidebar from "./DashboardSidebar";

export default function AdminShell({ title, description, children }) {
  return (
    <div style={styles.layout}>
      <DashboardSidebar />
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.description}>{description}</p>
        </header>
        {children}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    background: "#f8fafc",
  },
  main: {
    display: "grid",
    gap: "1.5rem",
    padding: "2rem",
    marginLeft: "240px",
    minHeight: "100vh",
  },
  header: {
    display: "grid",
    gap: "0.35rem",
  },
  title: {
    margin: 0,
    color: "#0f172a",
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
};
