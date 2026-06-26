import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/auth";
import Link from "next/link";
import { appRoutes } from "@/lib/routes";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const stats = await getAdminStats(session.token);

  // ── Mock/fallback data for sections not yet wired to API ──
  const recentProducts = stats.recentProducts || [
    { id: 1, name: "Bottle Top Dispenser", category: "Liquid Handling", status: "Published" },
    { id: 2, name: "Glass Beaker 500ml", category: "Glassware", status: "Draft" },
    { id: 3, name: "Syringe Filter 0.22µm", category: "Filtration", status: "Published" },
    { id: 4, name: "Measuring Cylinder 100ml", category: "Glassware", status: "Published" },
    { id: 5, name: "Micropipette 200µl", category: "Liquid Handling", status: "Draft" },
  ];

  const completionStatus = stats.completionStatus || {
    missingImages: 12,
    missingDescription: 8,
    missingPriceList: 21,
    missingVideos: 40,
    missingReviews: 35,
  };

  const categoryOverview = stats.categoryOverview || [
    { name: "Glassware", count: 320, total: 500 },
    { name: "Liquid Handling", count: 180, total: 500 },
    { name: "Filtration", count: 145, total: 500 },
    { name: "Plasticware", count: 210, total: 500 },
    { name: "Lab Instruments", count: 196, total: 500 },
  ];

  const recentActivity = stats.recentActivity || [
    { type: "add", text: "Product added: Bottle Top Dispenser", time: "2 min ago" },
    { type: "edit", text: "Category updated: Glassware", time: "18 min ago" },
    { type: "add", text: "Navbar item added: Filtration", time: "1 hr ago" },
    { type: "add", text: "Review added: Omsons Glassware", time: "3 hr ago" },
    { type: "edit", text: "Product image updated: Measuring Cylinder", time: "5 hr ago" },
  ];

  const statCards = [
    {
      label: "Total Products",
      value: stats.productCount ?? 1051,
      icon: "📦",
      accent: "#0046AD",
      bg: "#EEF4FF",
    },
    {
      label: "Total Categories",
      value: stats.categoryCount ?? 27,
      icon: "🗂",
      accent: "#0369a1",
      bg: "#E0F2FE",
    },
    {
      label: "Navbar Items",
      value: stats.navbarCount ?? 8,
      icon: "🔗",
      accent: "#0f766e",
      bg: "#CCFBF1",
    },
    {
      label: "Customer Reviews",
      value: stats.reviewCount ?? 426,
      icon: "⭐",
      accent: "#b45309",
      bg: "#FEF3C7",
    },
    {
      label: "Product Images",
      value: "3,500+",
      icon: "🖼",
      accent: "#7c3aed",
      bg: "#EDE9FE",
    },
    {
      label: "Videos Added",
      value: 48,
      icon: "🎬",
      accent: "#be123c",
      bg: "#FFE4E6",
    },
  ];

  const quickActions = [
    { label: "Add New Product", href: appRoutes.adminProducts, icon: "➕", color: "#0046AD" },
    { label: "Manage Categories", href: appRoutes.adminCategories, icon: "🗂", color: "#0369a1" },
    { label: "Update Navbar", href: appRoutes.adminNavbar, icon: "🔗", color: "#0f766e" },
    { label: "Upload Images", href: "#", icon: "🖼", color: "#7c3aed" },
    { label: "Add Video", href: "#", icon: "🎬", color: "#be123c" },
    { label: "Add Review", href: "#", icon: "⭐", color: "#b45309" },
  ];

  const completionItems = [
    { label: "Missing Images", value: completionStatus.missingImages, color: "#be123c", max: 100 },
    { label: "Missing Description", value: completionStatus.missingDescription, color: "#b45309", max: 100 },
    { label: "Missing Price List", value: completionStatus.missingPriceList, color: "#7c3aed", max: 100 },
    { label: "Missing Videos", value: completionStatus.missingVideos, color: "#0369a1", max: 100 },
    { label: "Missing Reviews", value: completionStatus.missingReviews, color: "#0f766e", max: 100 },
  ];

  return (
    <AdminShell title="Dashboard" description="">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .db-root {
          font-family: 'Inter', sans-serif;
          background: #f1f5fb;
          min-height: 100vh;
          padding: 2rem;
          display: grid;
          gap: 1.75rem;
        }

        /* ── Welcome header ── */
        .db-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          background: linear-gradient(135deg, #0f2d6e 0%, #0046AD 100%);
          border-radius: 14px;
          padding: 1.75rem 2rem;
          box-shadow: 0 4px 20px rgba(0,70,173,0.18);
          position: relative;
          overflow: hidden;
        }
        .db-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }
        .db-header-left { position: relative; z-index: 1; }
        .db-greeting {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.35rem;
          letter-spacing: -0.02em;
        }
        .db-subgreeting {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.65);
          margin: 0;
        }
        .db-header-actions {
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .db-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.1rem;
          background: #ffffff;
          color: #0046AD;
          font-family: 'Inter', sans-serif;
          font-size: 0.8375rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .db-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.18); }
        .db-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.1rem;
          background: rgba(255,255,255,0.12);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 0.8375rem;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s;
        }
        .db-btn-ghost:hover { background: rgba(255,255,255,0.2); }

        /* ── Section titles ── */
        .db-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0046AD;
          margin: 0 0 1rem;
        }

        /* ── Stat cards ── */
        .db-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }
        .db-stat-card {
          background: #ffffff;
          border: 1px solid #dde6f5;
          border-radius: 12px;
          padding: 1.25rem 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-shadow: 0 2px 10px rgba(0,70,173,0.05);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,70,173,0.1); }
        .db-stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
        }
        .db-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f2d6e;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .db-stat-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
        }

        /* ── Quick actions ── */
        .db-qa-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.875rem;
        }
        .db-qa-card {
          background: #ffffff;
          border: 1px solid #dde6f5;
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f2d6e;
          box-shadow: 0 2px 8px rgba(0,70,173,0.04);
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .db-qa-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,70,173,0.1); border-color: #b3c9f0; }
        .db-qa-icon { font-size: 1.25rem; }

        /* ── Two-column row ── */
        .db-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 900px) { .db-two-col { grid-template-columns: 1fr; } }

        /* ── Card shell ── */
        .db-card {
          background: #ffffff;
          border: 1px solid #dde6f5;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,70,173,0.05);
        }

        /* ── Products table ── */
        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th {
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0 0.75rem 0.75rem;
          border-bottom: 1px solid #e8eef8;
        }
        .db-table td {
          padding: 0.8rem 0.75rem;
          font-size: 0.875rem;
          color: #334155;
          border-bottom: 1px solid #f1f5fb;
        }
        .db-table tr:last-child td { border-bottom: none; }
        .db-table tr:hover td { background: #f8faff; }
        .db-status {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .db-status-published { background: #dcfce7; color: #15803d; }
        .db-status-draft { background: #fef3c7; color: #b45309; }
        .db-edit-link {
          font-size: 0.8rem;
          font-weight: 600;
          color: #0046AD;
          text-decoration: none;
        }
        .db-edit-link:hover { text-decoration: underline; }

        /* ── Completion bars ── */
        .db-completion-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .db-comp-item { display: grid; gap: 0.35rem; }
        .db-comp-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .db-comp-label { font-size: 0.8375rem; font-weight: 500; color: #334155; }
        .db-comp-value { font-size: 0.8rem; font-weight: 700; color: #0f2d6e; }
        .db-bar-track {
          height: 7px;
          border-radius: 999px;
          background: #e8eef8;
          overflow: hidden;
        }
        .db-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s ease;
        }

        /* ── Category overview ── */
        .db-cat-row { display: grid; gap: 0.875rem; }
        .db-cat-item { display: grid; gap: 0.3rem; }
        .db-cat-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .db-cat-name { font-size: 0.875rem; font-weight: 500; color: #334155; }
        .db-cat-count { font-size: 0.8rem; font-weight: 700; color: #0046AD; }

        /* ── Activity ── */
        .db-activity-list { display: grid; gap: 0.75rem; }
        .db-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .db-act-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .db-act-dot-add { background: #22c55e; }
        .db-act-dot-edit { background: #0046AD; }
        .db-act-text { font-size: 0.85rem; color: #334155; flex: 1; }
        .db-act-time { font-size: 0.75rem; color: #94a3b8; flex-shrink: 0; }

        /* ── Review summary ── */
        .db-review-summary {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.5rem;
          align-items: center;
        }
        .db-rating-big {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .db-rating-num {
          font-size: 2.75rem;
          font-weight: 700;
          color: #0f2d6e;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .db-stars { color: #f59e0b; font-size: 1.1rem; letter-spacing: 1px; }
        .db-rating-sub { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
        .db-review-detail { display: grid; gap: 0.5rem; }
        .db-review-stat { font-size: 0.85rem; color: #475569; }
        .db-review-stat strong { color: #0f2d6e; font-weight: 700; }
        .db-review-quote {
          font-size: 0.85rem;
          color: #64748b;
          font-style: italic;
          border-left: 3px solid #0046AD;
          padding-left: 0.75rem;
          margin-top: 0.25rem;
        }
      `}</style>

      <div className="db-root">

        {/* 1 ── Welcome Header */}
        <header className="db-header">
          <div className="db-header-left">
            <h1 className="db-greeting">Good Morning, Admin 👋</h1>
            <p className="db-subgreeting">Manage your laboratory product catalog from one place.</p>
          </div>
          <div className="db-header-actions">
            <Link href={appRoutes.adminProducts} className="db-btn-primary">
              + Add Product
            </Link>
            <Link href={appRoutes.adminCategories} className="db-btn-ghost">
              + Add Category
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="db-btn-ghost">
              View Website ↗
            </a>
          </div>
        </header>

        {/* 2 ── Stat Cards */}
        <section>
          <p className="db-section-title">Overview</p>
          <div className="db-stat-grid">
            {statCards.map((card) => (
              <div key={card.label} className="db-stat-card">
                <div className="db-stat-icon-wrap" style={{ background: card.bg }}>
                  <span>{card.icon}</span>
                </div>
                <div>
                  <div className="db-stat-value">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</div>
                  <div className="db-stat-label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 ── Quick Actions */}
        <section>
          <p className="db-section-title">Quick Actions</p>
          <div className="db-qa-grid">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="db-qa-card">
                <span className="db-qa-icon">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        {/* 4 ── Recently Added Products */}
        <section className="db-card">
          <p className="db-section-title">Recently Added Products</p>
          <table className="db-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 500, color: "#0f2d6e" }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    <span className={`db-status ${product.status === "Published" ? "db-status-published" : "db-status-draft"}`}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: product.status === "Published" ? "#15803d" : "#b45309",
                        display: "inline-block"
                      }} />
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <a href="#" className="db-edit-link">Edit</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 5+6 ── Completion Status + Category Overview */}
        <div className="db-two-col">

          {/* 5 — Completion */}
          <section className="db-card">
            <p className="db-section-title">Product Completion Status</p>
            <div className="db-completion-row">
              {completionItems.map((item) => (
                <div key={item.label} className="db-comp-item">
                  <div className="db-comp-meta">
                    <span className="db-comp-label">{item.label}</span>
                    <span className="db-comp-value">{item.value}</span>
                  </div>
                  <div className="db-bar-track">
                    <div
                      className="db-bar-fill"
                      style={{
                        width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6 — Category Overview */}
          <section className="db-card">
            <p className="db-section-title">Category Overview</p>
            <div className="db-cat-row">
              {categoryOverview.map((cat) => (
                <div key={cat.name} className="db-cat-item">
                  <div className="db-cat-meta">
                    <span className="db-cat-name">{cat.name}</span>
                    <span className="db-cat-count">{cat.count} products</span>
                  </div>
                  <div className="db-bar-track">
                    <div
                      className="db-bar-fill"
                      style={{
                        width: `${Math.round((cat.count / cat.total) * 100)}%`,
                        background: "linear-gradient(90deg, #0046AD, #0f2d6e)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* 7+8 ── Recent Activity + Review Summary */}
        <div className="db-two-col">

          {/* 7 — Activity */}
          <section className="db-card">
            <p className="db-section-title">Recent Activity</p>
            <div className="db-activity-list">
              {recentActivity.map((item, i) => (
                <div key={i} className="db-activity-item">
                  <span className={`db-act-dot ${item.type === "add" ? "db-act-dot-add" : "db-act-dot-edit"}`} />
                  <span className="db-act-text">{item.text}</span>
                  <span className="db-act-time">{item.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 8 — Review Summary */}
          <section className="db-card">
            <p className="db-section-title">Customer Review Summary</p>
            <div className="db-review-summary">
              <div className="db-rating-big">
                <span className="db-rating-num">4.8</span>
                <span className="db-stars">★★★★★</span>
                <span className="db-rating-sub">out of 5</span>
              </div>
              <div className="db-review-detail">
                <p className="db-review-stat">
                  <strong>{stats.reviewCount ?? 426}</strong> total reviews
                </p>
                <p className="db-review-stat">
                  Average rating: <strong>4.8 / 5</strong>
                </p>
                <p className="db-review-quote">
                  "Good quality laboratory glassware. Highly recommended for research labs."
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </AdminShell>
  );
}

async function getAdminStats(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return defaultStats();
    const data = await response.json();
    return data.stats || defaultStats();
  } catch {
    return defaultStats();
  }
}

function defaultStats() {
  return {
    navbarCount: 0,
    categoryCount: 0,
    productCount: 0,
    reviewCount: 0,
    recentProducts: null,
    completionStatus: null,
    categoryOverview: null,
    recentActivity: null,
  };
}