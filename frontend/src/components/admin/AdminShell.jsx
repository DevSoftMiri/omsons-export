import DashboardSidebar from "./DashboardSidebar";

export default function AdminShell({ title, description, children }) {
  return (
    <>
      <style>{`
        .admin-shell-layout {
          min-height: 100vh;
          background: #f8fafc;
        }

        .admin-shell-main {
          display: grid;
          gap: 1.5rem;
          padding: 2rem;
          margin-left: 240px;
          min-height: 100vh;
          box-sizing: border-box;
          min-width: 0;
        }

        .admin-shell-header {
          display: grid;
          gap: 0.35rem;
        }

        .admin-shell-title {
          margin: 0;
          color: #0f172a;
        }

        .admin-shell-description {
          margin: 0;
          color: #475569;
          line-height: 1.6;
        }

        @media (max-width: 1200px) {
          .admin-shell-main {
            padding: 1.5rem;
          }
        }

        @media (max-width: 900px) {
          .admin-shell-main {
            margin-left: 240px;
            padding: 1rem;
          }
        }
      `}</style>
      <div className="admin-shell-layout">
      <DashboardSidebar />
      <main className="admin-shell-main">
        <header className="admin-shell-header">
          <h1 className="admin-shell-title">{title}</h1>
          <p className="admin-shell-description">{description}</p>
        </header>
        {children}
      </main>
      </div>
    </>
  );
}
