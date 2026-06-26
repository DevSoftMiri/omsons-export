"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/lib/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function ProductListClient() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", notice: "" });
  const token = useMemo(() => getCookieValue("admin_token"), []);

  const categoryOptions = useMemo(() => {
    const counts = products.reduce((accumulator, product) => {
      const categorySlug = product.category || "uncategorized";
      accumulator[categorySlug] = (accumulator[categorySlug] || 0) + 1;
      return accumulator;
    }, {});

    return [
      { label: "All Products", value: "all", count: products.length },
      ...categories.map((category) => ({
        label: category.name,
        value: category.slug,
        count: counts[category.slug] || 0,
      })),
      ...Object.entries(counts)
        .filter(([slug]) => !categories.some((category) => category.slug === slug))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([slug, count]) => ({ label: slug, value: slug, count })),
    ];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    let result = activeCategory === "all"
      ? products
      : products.filter((p) => (p.category || "uncategorized") === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.slug?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, products, search]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchProducts() {
    setStatus((c) => ({ ...c, loading: true, error: "" }));
    try {
      const response = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load products");
      setProducts(data.products || []);
      setStatus((c) => ({ ...c, loading: false }));
    } catch (error) {
      setStatus((c) => ({ ...c, loading: false, error: error.message || "Failed to load products" }));
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/category`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.success) setCategories(data.categories || []);
    } catch (_) {
      setCategories([]);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to delete product");
      setStatus({ loading: false, error: "", notice: "Product deleted" });
      fetchProducts();
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Failed to delete product", notice: "" });
    }
  }

  function toggleDetails(productId) {
    setExpandedProductId((c) => (c === productId ? null : productId));
  }

  const publishedCount = products.filter((p) => p.status === "published" || !p.status).length;
  const draftCount = products.filter((p) => p.status === "draft").length;
  const withImageCount = products.filter((p) => p.mainImage).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .pl-root {
          font-family: 'Inter', sans-serif;
          background: #f1f5fb;
          min-height: 100%;
          padding: 1.5rem;
          display: grid;
          gap: 1.75rem;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* ── Page Header ── */
        .pl-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          background: linear-gradient(135deg, #0f2d6e 0%, #0046AD 100%);
          border-radius: 14px;
          padding: 1.75rem 2rem;
          box-shadow: 0 4px 20px rgba(0,70,173,0.18);
          position: relative;
          overflow: hidden;
        }
        .pl-page-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }
        .pl-header-left { position: relative; z-index: 1; }
        .pl-page-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.3rem;
          letter-spacing: -0.02em;
        }
        .pl-page-sub { font-size: 0.875rem; color: rgba(255,255,255,0.65); margin: 0; }
        .pl-header-right {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
          align-items: center;
        }

        /* ── Stats row ── */
        .pl-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        .pl-stat {
          background: #fff;
          border: 1px solid #dde6f5;
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          box-shadow: 0 2px 10px rgba(0,70,173,0.05);
        }
        .pl-stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .pl-stat-value {
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f2d6e;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        /* ── Card shell ── */
        .pl-card {
          background: #fff;
          border: 1px solid #dde6f5;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* ── Section label ── */
        .pl-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0046AD;
          margin: 0 0 1.1rem;
        }

        /* ── Top bar (search + count) ── */
        .pl-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .pl-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 340px; }
        .pl-search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .pl-search {
          font-family: 'Inter', sans-serif;
          width: 100%;
          padding: 0.72rem 1rem 0.72rem 2.5rem;
          font-size: 0.875rem;
          color: #0f2d6e;
          background: #f8faff;
          border: 1.5px solid #ccd9f0;
          border-radius: 8px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .pl-search:focus { border-color: #0046AD; box-shadow: 0 0 0 3px rgba(0,70,173,0.1); }

        .pl-result-count {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
        }
        .pl-result-count strong { color: #0f2d6e; }

        /* ── Category filter tabs ── */
        .pl-filter-bar {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          margin-bottom: 1.5rem;
          scrollbar-width: none;
        }
        .pl-filter-bar::-webkit-scrollbar { display: none; }

        .pl-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1.5px solid #dde6f5;
          background: #fff;
          color: #64748b;
          font-family: 'Inter', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
        }
        .pl-filter-btn:hover { border-color: #b3c9f0; color: #0046AD; }
        .pl-filter-btn-active {
          background: #0046AD;
          color: #fff;
          border-color: #0046AD;
        }
        .pl-filter-btn-active:hover { background: #0039a0; color: #fff; }
        .pl-filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.5rem;
          height: 1.5rem;
          padding: 0 0.4rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.2);
          font-size: 0.72rem;
          font-weight: 700;
        }
        .pl-filter-btn:not(.pl-filter-btn-active) .pl-filter-count {
          background: #f1f5fb;
          color: #64748b;
        }

        /* ── Product list ── */
        .pl-list { display: grid; gap: 1rem; }

        .pl-product-card {
          border: 1.5px solid #dde6f5;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,70,173,0.04);
          transition: box-shadow 0.15s;
        }
        .pl-product-card:hover { box-shadow: 0 4px 20px rgba(0,70,173,0.1); }

        .pl-product-header {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.25rem 1.35rem;
          flex-wrap: wrap;
          width: 100%;
          box-sizing: border-box;
        }

        /* thumbnail */
        .pl-thumb-wrap {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          border: 1.5px solid #dde6f5;
          overflow: hidden;
          flex-shrink: 0;
          background: #f8faff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pl-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pl-thumb-placeholder { font-size: 1.75rem; }

        /* product info */
        .pl-product-info { flex: 1; min-width: 0; }
        .pl-product-name {
          font-size: 1rem;
          font-weight: 700;
          color: #0f2d6e;
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }
        .pl-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
        }
        .pl-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .pl-badge-blue { background: #EEF4FF; color: #0046AD; }
        .pl-badge-green { background: #f0fdf4; color: #15803d; }
        .pl-badge-amber { background: #fef3c7; color: #b45309; }
        .pl-badge-slate { background: #f1f5fb; color: #64748b; font-family: monospace; font-size: 0.7rem; }

        .pl-meta-details {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: #64748b;
        }
        .pl-meta-detail strong { color: #334155; font-weight: 600; }

        /* action buttons */
        .pl-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: flex-end;
        }

        .pl-btn-view {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.55rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #0046AD, #0f2d6e);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,70,173,0.25);
          transition: opacity 0.15s, transform 0.15s;
        }
        .pl-btn-view:hover { opacity: 0.9; transform: translateY(-1px); }

        .pl-btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.55rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #0046AD;
          background: #EEF4FF;
          border: 1.5px solid #c7d9f8;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pl-btn-edit:hover { background: #dce8ff; }

        .pl-btn-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.55rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #be123c;
          background: #fff1f2;
          border: 1.5px solid #fca5a5;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pl-btn-delete:hover { background: #ffe4e6; }

        /* ── Expanded details panel ── */
        .pl-details-panel {
          border-top: 1.5px solid #e8eef8;
          background: #f8faff;
          padding: 1.35rem;
          display: grid;
          gap: 1rem;
        }
        .pl-details-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0046AD;
          margin: 0 0 0.35rem;
        }
        .pl-details-desc {
          font-size: 0.875rem;
          color: #334155;
          line-height: 1.65;
          margin: 0;
        }

        .pl-table-wrap {
          overflow-x: auto;
          border: 1.5px solid #dde6f5;
          border-radius: 10px;
          background: #fff;
        }
        .pl-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 40rem;
          font-family: 'Inter', sans-serif;
        }
        .pl-thead th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          background: #EEF4FF;
          border-bottom: 1.5px solid #dde6f5;
          white-space: nowrap;
        }
        .pl-table tbody tr { transition: background 0.12s; }
        .pl-table tbody tr:hover td { background: #f8faff; }
        .pl-table td {
          padding: 0.8rem 1rem;
          font-size: 0.85rem;
          color: #334155;
          border-bottom: 1px solid #f1f5fb;
          vertical-align: top;
        }
        .pl-table tbody tr:last-child td { border-bottom: none; }

        .pl-stock-in {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #15803d;
          font-weight: 600;
          font-size: 0.8rem;
        }
        .pl-stock-out {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #be123c;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .pl-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #94a3b8;
        }
        .pl-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .pl-empty-title { font-size: 0.9rem; font-weight: 600; color: #64748b; margin-bottom: 0.3rem; }
        .pl-empty-sub { font-size: 0.8rem; }

        /* ── Alerts ── */
        .pl-alert-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #fff1f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          color: #be123c;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .pl-alert-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          color: #15803d;
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* ── Button used in header ── */
        .pl-btn-primary-header {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.65rem 1.2rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0046AD;
          background: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.15s;
          text-decoration: none;
        }
        .pl-btn-primary-header:hover { transform: translateY(-1px); }

        @media (max-width: 1200px) {
          .pl-root {
            padding: 1.25rem;
          }

          .pl-card {
            padding: 1.35rem;
          }

          .pl-product-header {
            gap: 1rem;
            padding: 1rem 1.1rem;
          }
        }

        @media (max-width: 900px) {
          .pl-root {
            padding: 1rem;
            gap: 1.25rem;
          }

          .pl-page-header,
          .pl-card {
            padding: 1rem;
          }

          .pl-top-bar {
            align-items: stretch;
          }

          .pl-search-wrap {
            max-width: none;
          }

          .pl-result-count {
            white-space: normal;
          }

          .pl-product-header {
            display: grid;
            grid-template-columns: 72px minmax(0, 1fr);
            align-items: start;
          }

          .pl-actions {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }

          .pl-btn-view,
          .pl-btn-edit,
          .pl-btn-delete {
            flex: 1 1 10rem;
            justify-content: center;
          }

          .pl-table {
            min-width: 34rem;
          }
        }

        @media (max-width: 640px) {
          .pl-root {
            padding: 0.75rem;
          }

          .pl-page-header {
            padding: 0.9rem;
          }

          .pl-page-title {
            font-size: 1.2rem;
          }

          .pl-stats-row {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .pl-product-header {
            grid-template-columns: 1fr;
          }

          .pl-thumb-wrap {
            width: 72px;
            height: 72px;
          }

          .pl-actions {
            width: 100%;
          }

          .pl-btn-view,
          .pl-btn-edit,
          .pl-btn-delete {
            width: 100%;
            flex-basis: 100%;
          }

          .pl-details-panel {
            padding: 1rem;
          }

          .pl-table {
            min-width: 30rem;
          }
        }
      `}</style>

      <div className="pl-root">

        {/* ── Page Header ── */}
        <header className="pl-page-header">
          <div className="pl-header-left">
            <h1 className="pl-page-title">Product List</h1>
            <p className="pl-page-sub">Imported and manually created products from MongoDB.</p>
          </div>
          <div className="pl-header-right">
            <button
              type="button"
              className="pl-btn-primary-header"
              onClick={() => router.push(appRoutes.adminProducts)}
            >
              + Add Product
            </button>
          </div>
        </header>

        {/* ── Stats Row ── */}
        <div className="pl-stats-row">
          <div className="pl-stat">
            <span className="pl-stat-label">Total Products</span>
            <span className="pl-stat-value">{products.length}</span>
          </div>
          <div className="pl-stat">
            <span className="pl-stat-label">Categories</span>
            <span className="pl-stat-value">{categories.length}</span>
          </div>
          <div className="pl-stat">
            <span className="pl-stat-label">With Images</span>
            <span className="pl-stat-value">{withImageCount}</span>
          </div>
          <div className="pl-stat">
            <span className="pl-stat-label">Published</span>
            <span className="pl-stat-value">{publishedCount}</span>
          </div>
          <div className="pl-stat">
            <span className="pl-stat-label">Drafts</span>
            <span className="pl-stat-value">{draftCount}</span>
          </div>
        </div>

        {/* ── Main Card ── */}
        <section className="pl-card">
          <p className="pl-section-label">📦 All Products</p>

          {/* Alerts */}
          {status.error && <div className="pl-alert-error" style={{ marginBottom: "1rem" }}>⚠ {status.error}</div>}
          {status.notice && <div className="pl-alert-notice" style={{ marginBottom: "1rem" }}>✓ {status.notice}</div>}

          {/* Top bar */}
          <div className="pl-top-bar">
            <div className="pl-search-wrap">
              <span className="pl-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                className="pl-search"
                placeholder="Search by name, SKU or slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="pl-result-count">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
            </span>
          </div>

          {/* Category filter */}
          <div className="pl-filter-bar">
            {categoryOptions.map((cat) => {
              const isActive = cat.value === activeCategory;
              return (
                <button
                  key={cat.value}
                  type="button"
                  className={`pl-filter-btn${isActive ? " pl-filter-btn-active" : ""}`}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  <span>{cat.label}</span>
                  <span className="pl-filter-count">{cat.count}</span>
                </button>
              );
            })}
          </div>

          {/* Product list */}
          {status.loading ? (
            <div className="pl-empty">
              <div className="pl-empty-icon">⏳</div>
              <div className="pl-empty-title">Loading products…</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="pl-empty">
              <div className="pl-empty-icon">📦</div>
              <div className="pl-empty-title">No products found.</div>
              <div className="pl-empty-sub">Try a different category or search term.</div>
            </div>
          ) : (
            <div className="pl-list">
              {filteredProducts.map((product) => {
                const isExpanded = expandedProductId === product._id;
                const variantCount = product.variants?.length || 0;
                const isDraft = product.status === "draft";

                return (
                  <article key={product._id} className="pl-product-card">

                    {/* Header row */}
                    <div className="pl-product-header">

                      {/* Thumbnail */}
                      <div className="pl-thumb-wrap">
                        {product.mainImage ? (
                          <img src={product.mainImage} alt={product.name} className="pl-thumb" />
                        ) : (
                          <span className="pl-thumb-placeholder">🧪</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="pl-product-info">
                        <h3 className="pl-product-name">{product.name}</h3>

                        <div className="pl-meta-row">
                          <span className={`pl-badge ${isDraft ? "pl-badge-amber" : "pl-badge-green"}`}>
                            {isDraft ? "Draft" : "Published"}
                          </span>
                          {product.category && (
                            <span className="pl-badge pl-badge-blue">🗂 {product.category}</span>
                          )}
                          {variantCount > 0 && (
                            <span className="pl-badge pl-badge-blue">
                              {variantCount} variant{variantCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {product.slug && (
                            <span className="pl-badge pl-badge-slate">/{product.slug}</span>
                          )}
                        </div>

                        <div className="pl-meta-details">
                          {product.externalId && (
                            <span><strong>Source ID:</strong> {product.externalId}</span>
                          )}
                          {product.sku && (
                            <span><strong>SKU:</strong> {product.sku}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pl-actions">
                        <button
                          type="button"
                          className="pl-btn-view"
                          onClick={() => toggleDetails(product._id)}
                        >
                          {isExpanded ? "▲ Hide" : "▼ Details"}
                        </button>
                        <button
                          type="button"
                          className="pl-btn-edit"
                          onClick={() => router.push(`${appRoutes.adminProducts}?edit=${product._id}`)}
                        >
                          ✏ Edit
                        </button>
                        <button
                          type="button"
                          className="pl-btn-delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="pl-details-panel">
                        {product.shortDescription && (
                          <div>
                            <p className="pl-details-label">Description</p>
                            <p className="pl-details-desc">{product.shortDescription}</p>
                          </div>
                        )}

                        <div>
                          <p className="pl-details-label">Variant Details</p>
                          {variantCount > 0 ? (
                            <div className="pl-table-wrap">
                              <table className="pl-table">
                                <thead className="pl-thead">
                                  <tr>
                                    <th>Variant</th>
                                    <th>SKU</th>
                                    <th>Specs</th>
                                    <th>Pack</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.variants.map((variant, index) => (
                                    <tr key={variant._id || variant.externalId || variant.sku || index}>
                                      <td style={{ fontWeight: 600, color: "#0f2d6e" }}>{variant.name || "-"}</td>
                                      <td><span className="pl-badge pl-badge-slate">{variant.sku || "-"}</span></td>
                                      <td>{formatVariantSpecs(variant)}</td>
                                      <td>{variant.pack ?? "-"}</td>
                                      <td style={{ fontWeight: 600 }}>{variant.priceLabel || variant.price || "-"}</td>
                                      <td>
                                        {variant.inStock ? (
                                          <span className="pl-stock-in">● In stock</span>
                                        ) : (
                                          <span className="pl-stock-out">● Out of stock</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="pl-empty" style={{ padding: "1.5rem" }}>
                              <div className="pl-empty-icon">📋</div>
                              <div className="pl-empty-title">No variants available.</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </>
  );
}

/* ── Helpers (unchanged) ── */
function formatVariantSpecs(variant) {
  if (variant.specsText) return variant.specsText;
  if (variant.specs && typeof variant.specs === "object") {
    const parts = Object.entries(variant.specs)
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`);
    if (parts.length) return parts.join(", ");
  }
  return "-";
}

function getCookieValue(name) {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").find((p) => p.startsWith(`${name}=`))?.split("=")[1] || "";
}
