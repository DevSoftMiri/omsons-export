"use client";

import { useEffect, useMemo, useState } from "react";
import { getNavbarPreviewData, omsonsNavbarPreset } from "@/lib/navbarPreset";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const emptyForm = {
  title: "",
  slug: "",
  order: 0,
  submenus: [],
};

let nextRowId = 1;

export default function ManageNavbarClient() {
  const [navbars, setNavbars] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: false, error: "", notice: "" });
  const [expandedIds, setExpandedIds] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const token = useMemo(() => getCookieValue("admin_token"), []);
  const navbarPresetPreview = useMemo(() => getNavbarPreviewData(omsonsNavbarPreset), []);

  useEffect(() => { fetchNavbars(); }, []);

  async function fetchNavbars() {
    setStatus((c) => ({ ...c, loading: true, error: "" }));
    try {
      const response = await fetch(`${API_BASE_URL}/navbar`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load navbar items");
      setNavbars(data.navbars || []);
      setStatus((c) => ({ ...c, loading: false }));
    } catch (error) {
      setStatus((c) => ({ ...c, loading: false, error: error.message || "Failed to load navbar items" }));
    }
  }

  function generateSlug(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(event) {
    const title = event.target.value;
    setForm((c) => ({ ...c, title, slug: generateSlug(title) }));
  }

  function addSubmenu() {
    setForm((c) => ({ ...c, submenus: [...c.submenus, createSubmenu()] }));
  }

  function updateSubmenuTitle(index, value) {
    setForm((c) => ({
      ...c,
      submenus: c.submenus.map((s, i) => i === index ? { ...s, title: value } : s),
    }));
  }

  function addItem(submenuIndex) {
    setForm((c) => ({
      ...c,
      submenus: c.submenus.map((s, i) =>
        i === submenuIndex ? { ...s, items: [...s.items, createSubmenuItem()] } : s
      ),
    }));
  }

  function updateItem(submenuIndex, itemIndex, value) {
    setForm((c) => ({
      ...c,
      submenus: c.submenus.map((s, i) => {
        if (i !== submenuIndex) return s;
        return {
          ...s,
          items: s.items.map((item, j) =>
            j === itemIndex ? { ...item, name: value, slug: generateSlug(value) } : item
          ),
        };
      }),
    }));
  }

  function removeSubmenu(index) {
    setForm((c) => ({ ...c, submenus: c.submenus.filter((_, i) => i !== index) }));
  }

  function removeItem(submenuIndex, itemIndex) {
    setForm((c) => ({
      ...c,
      submenus: c.submenus.map((s, i) =>
        i === submenuIndex ? { ...s, items: s.items.filter((_, j) => j !== itemIndex) } : s
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "", notice: "" });
    try {
      const url = editingId ? `${API_BASE_URL}/navbar/${editingId}` : `${API_BASE_URL}/navbar`;
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to save navbar");
      setForm(emptyForm);
      setEditingId(null);
      setStatus({ loading: false, error: "", notice: editingId ? "Navbar updated" : "Navbar added" });
      fetchNavbars();
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Failed to save navbar", notice: "" });
    }
  }

  function handleEdit(navbar) {
    setEditingId(navbar._id);
    setForm({
      title: navbar.title || "",
      slug: navbar.slug || "",
      order: navbar.order || 0,
      submenus: hydrateSubmenus(navbar.submenus || []),
    });
    setStatus((c) => ({ ...c, notice: "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this navbar item?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/navbar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to delete navbar");
      setStatus({ loading: false, error: "", notice: "Navbar deleted" });
      fetchNavbars();
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Failed to delete navbar", notice: "" });
    }
  }

  async function handleImportPresetNavbar() {
    setStatus({ loading: true, error: "", notice: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/navbar/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ navbars: navbarPresetPreview }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to import navbar preset");
      setNavbars(data.navbars || []);
      setStatus({
        loading: false, error: "",
        notice: `Navbar preset imported. Created: ${data.summary.created}, Updated: ${data.summary.updated}`,
      });
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Failed to import navbar preset", notice: "" });
    }
  }

  function toggleExpand(id) {
    setExpandedIds((c) => ({ ...c, [id]: !c[id] }));
  }

  const totalSubmenus = navbars.reduce((t, n) => t + (n.submenus?.length || 0), 0);
  const totalLinks = navbars.reduce((t, n) =>
    t + (n.submenus || []).reduce((s, sub) => s + (sub.items?.length || 0), 0), 0
  );

  const filteredNavbars = navbars.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .nb-root {
          font-family: 'Inter', sans-serif;
          background: #f1f5fb;
          min-height: 100vh;
          padding: 2rem;
          display: grid;
          gap: 1.75rem;
        }

        /* ── Page header ── */
        .nb-page-header {
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
        .nb-page-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          pointer-events: none;
        }
        .nb-page-header-left { position: relative; z-index: 1; }
        .nb-page-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.3rem;
          letter-spacing: -0.02em;
        }
        .nb-page-sub {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.65);
          margin: 0;
        }
        .nb-page-header-right {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
          align-items: center;
        }

        /* ── Stats row ── */
        .nb-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        .nb-stat {
          background: #fff;
          border: 1px solid #dde6f5;
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          box-shadow: 0 2px 10px rgba(0,70,173,0.05);
        }
        .nb-stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .nb-stat-value {
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f2d6e;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        /* ── Card shell ── */
        .nb-card {
          background: #fff;
          border: 1px solid #dde6f5;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
        }

        /* ── Section title ── */
        .nb-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0046AD;
          margin: 0 0 1.25rem;
        }

        /* ── Form ── */
        .nb-form { display: grid; gap: 1.1rem; }
        .nb-field { display: grid; gap: 0.4rem; }
        .nb-field-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
        }
        .nb-input {
          font-family: 'Inter', sans-serif;
          width: 100%;
          padding: 0.8rem 1rem;
          font-size: 0.9rem;
          color: #0f2d6e;
          background: #f8faff;
          border: 1.5px solid #ccd9f0;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .nb-input:focus {
          border-color: #0046AD;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,70,173,0.1);
        }

        /* ── Nested submenu card ── */
        .nb-nested-card {
          display: grid;
          gap: 0.875rem;
          padding: 1.25rem;
          border-radius: 10px;
          border: 1.5px solid #dde6f5;
          background: #f8faff;
        }
        .nb-nested-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .nb-nested-title {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #0046AD;
        }

        /* ── Item row in form ── */
        .nb-item-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 0.75rem;
          align-items: center;
        }
        .nb-slug-pill {
          font-size: 0.78rem;
          color: #64748b;
          background: #e8eef8;
          border-radius: 999px;
          padding: 0.2rem 0.65rem;
          white-space: nowrap;
          font-family: monospace;
        }

        /* ── Buttons ── */
        .nb-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.65rem 1.2rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #0046AD, #0f2d6e);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(0,70,173,0.3);
          transition: opacity 0.15s, transform 0.15s;
          text-decoration: none;
        }
        .nb-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .nb-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .nb-btn-white {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.65rem 1.1rem;
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
        .nb-btn-white:hover { transform: translateY(-1px); }

        .nb-btn-ghost-header {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.65rem 1.1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: #fff;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .nb-btn-ghost-header:hover { background: rgba(255,255,255,0.2); }

        .nb-btn-secondary {
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
        .nb-btn-secondary:hover { background: #dce8ff; }

        .nb-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.55rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #64748b;
          background: #f1f5fb;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .nb-btn-ghost:hover { background: #fee2e2; color: #be123c; border-color: #fca5a5; }

        .nb-btn-danger {
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
        .nb-btn-danger:hover { background: #ffe4e6; }

        .nb-inline { display: flex; gap: 0.625rem; flex-wrap: wrap; align-items: center; }

        /* ── Alerts ── */
        .nb-error {
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
        .nb-notice {
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

        /* ── Search + filter bar ── */
        .nb-search-bar {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .nb-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .nb-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .nb-search-input {
          font-family: 'Inter', sans-serif;
          width: 100%;
          padding: 0.72rem 1rem 0.72rem 2.5rem;
          font-size: 0.875rem;
          color: #0f2d6e;
          background: #fff;
          border: 1.5px solid #ccd9f0;
          border-radius: 8px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .nb-search-input:focus {
          border-color: #0046AD;
          box-shadow: 0 0 0 3px rgba(0,70,173,0.1);
        }
        .nb-filter-tabs {
          display: flex;
          gap: 0.375rem;
          background: #f1f5fb;
          border-radius: 8px;
          padding: 0.25rem;
        }
        .nb-filter-tab {
          padding: 0.4rem 0.875rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #64748b;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
        }
        .nb-filter-tab-active {
          background: #fff;
          color: #0046AD;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* ── Accordion navbar cards ── */
        .nb-accordion-list { display: grid; gap: 1rem; }

        .nb-accordion {
          border: 1.5px solid #dde6f5;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,70,173,0.04);
          transition: box-shadow 0.15s;
        }
        .nb-accordion:hover { box-shadow: 0 4px 20px rgba(0,70,173,0.1); }

        .nb-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.35rem;
          cursor: pointer;
          user-select: none;
          flex-wrap: wrap;
        }

        .nb-accordion-left {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          flex: 1;
          min-width: 0;
        }
        .nb-accordion-chevron {
          color: #94a3b8;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .nb-accordion-chevron-open { transform: rotate(180deg); }

        .nb-acc-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #EEF4FF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
        }
        .nb-acc-title {
          font-size: 0.975rem;
          font-weight: 700;
          color: #0f2d6e;
          margin: 0 0 0.2rem;
        }
        .nb-acc-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        /* Badges */
        .nb-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.18rem 0.6rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .nb-badge-blue { background: #EEF4FF; color: #0046AD; }
        .nb-badge-green { background: #f0fdf4; color: #15803d; }
        .nb-badge-slug { background: #f1f5fb; color: #64748b; font-family: monospace; }

        .nb-acc-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        /* Expanded body */
        .nb-accordion-body {
          border-top: 1.5px solid #e8eef8;
          background: #f8faff;
          padding: 1.25rem 1.35rem;
          display: grid;
          gap: 1rem;
        }

        /* Tree view */
        .nb-tree-submenu { display: grid; gap: 0.5rem; }
        .nb-tree-submenu-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.4rem;
        }
        .nb-tree-submenu-icon {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #0046AD;
          flex-shrink: 0;
        }
        .nb-tree-submenu-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f2d6e;
        }
        .nb-tree-submenu-count {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          margin-left: auto;
        }
        .nb-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-left: 1rem;
        }
        .nb-chip {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          padding: 0.45rem 0.8rem;
          border-radius: 8px;
          border: 1.5px solid #dde6f5;
          background: #fff;
          font-size: 0.8rem;
          font-weight: 500;
          color: #0f2d6e;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .nb-chip:hover { border-color: #0046AD; box-shadow: 0 2px 8px rgba(0,70,173,0.1); }
        .nb-chip-slug { font-size: 0.7rem; color: #94a3b8; font-family: monospace; }

        .nb-tree-divider {
          height: 1px;
          background: #e8eef8;
          margin: 0.25rem 0;
        }

        /* Empty state */
        .nb-empty {
          text-align: center;
          padding: 2.5rem 1rem;
          color: #94a3b8;
        }
        .nb-empty-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .nb-empty-title { font-size: 0.9rem; font-weight: 600; color: #64748b; margin-bottom: 0.35rem; }
        .nb-empty-sub { font-size: 0.8rem; }

        /* ── Homepage preview ── */
        .nb-preview-grid { display: grid; gap: 1rem; }
        .nb-preview-card {
          border: 1.5px solid #dde6f5;
          border-radius: 12px;
          padding: 1.25rem;
          background: #fff;
        }
        .nb-preview-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f2d6e;
          margin: 0 0 0.25rem;
        }

        /* ── Panel header ── */
        .nb-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .nb-panel-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f2d6e;
          margin: 0 0 0.2rem;
        }
        .nb-panel-sub {
          font-size: 0.8375rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        /* ── FAB ── */
        .nb-fab {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.35rem;
          background: linear-gradient(135deg, #0046AD, #0f2d6e);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(0,70,173,0.4);
          z-index: 100;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .nb-fab:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,70,173,0.5); }
      `}</style>

      <div className="nb-root">

        {/* ── Page Header ── */}
        <header className="nb-page-header">
          <div className="nb-page-header-left">
            <h1 className="nb-page-title">Manage Navigation</h1>
            <p className="nb-page-sub">Create and organize your storefront menu structure.</p>
          </div>
          <div className="nb-page-header-right">
            <button
              type="button"
              onClick={handleImportPresetNavbar}
              className="nb-btn-white"
              disabled={status.loading}
            >
              ⬇ {status.loading ? "Importing..." : "Import Existing Navigation"}
            </button>
          </div>
        </header>

        {/* ── Stats Row ── */}
        <div className="nb-stats-row">
          <div className="nb-stat">
            <span className="nb-stat-label">Navigation Items</span>
            <span className="nb-stat-value">{navbars.length}</span>
          </div>
          <div className="nb-stat">
            <span className="nb-stat-label">Submenus</span>
            <span className="nb-stat-value">{totalSubmenus}</span>
          </div>
          <div className="nb-stat">
            <span className="nb-stat-label">Category Links</span>
            <span className="nb-stat-value">{totalLinks}</span>
          </div>
          <div className="nb-stat">
            <span className="nb-stat-label">Last Updated</span>
            <span className="nb-stat-value" style={{ fontSize: "1.1rem" }}>Today</span>
          </div>
        </div>

        {/* ── Create / Edit Form ── */}
        <section className="nb-card">
          <p className="nb-section-label">
            {editingId ? "✏️ Edit Navigation Item" : "📁 Create Navigation Item"}
          </p>

          <div className="nb-form">
            <div className="nb-field">
              <label className="nb-field-label" htmlFor="nb-title">Main Navigation Title</label>
              <input
                id="nb-title"
                className="nb-input"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Liquid Handling"
                required
              />
            </div>

            <div className="nb-field">
              <label className="nb-field-label" htmlFor="nb-slug">Slug</label>
              <input
                id="nb-slug"
                className="nb-input"
                value={form.slug}
                onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))}
                placeholder="/liquid-handling"
                required
              />
            </div>

            <div className="nb-field">
              <label className="nb-field-label" htmlFor="nb-order">Display Order</label>
              <input
                id="nb-order"
                type="number"
                className="nb-input"
                style={{ maxWidth: 120 }}
                value={form.order}
                onChange={(e) => setForm((c) => ({ ...c, order: Number(e.target.value) }))}
              />
            </div>

            {form.submenus.map((submenu, submenuIndex) => (
              <div key={submenu._uiId} className="nb-nested-card">
                <div className="nb-nested-header">
                  <span className="nb-nested-title">📂 Submenu {submenuIndex + 1}</span>
                  <button type="button" onClick={() => removeSubmenu(submenuIndex)} className="nb-btn-danger">
                    × Remove
                  </button>
                </div>

                <div className="nb-field">
                  <label className="nb-field-label">Submenu Title</label>
                  <input
                    className="nb-input"
                    value={submenu.title}
                    onChange={(e) => updateSubmenuTitle(submenuIndex, e.target.value)}
                    placeholder="e.g. Dispensing"
                  />
                </div>

                {submenu.items.map((item, itemIndex) => (
                  <div key={item._uiId} className="nb-item-row">
                    <input
                      className="nb-input"
                      value={item.name}
                      onChange={(e) => updateItem(submenuIndex, itemIndex, e.target.value)}
                      placeholder="Item name"
                    />
                    <span className="nb-slug-pill">/{item.slug || "slug"}</span>
                    <button type="button" onClick={() => removeItem(submenuIndex, itemIndex)} className="nb-btn-danger">
                      ×
                    </button>
                  </div>
                ))}

                <div className="nb-inline">
                  <button type="button" onClick={() => addItem(submenuIndex)} className="nb-btn-secondary">
                    + Add Item
                  </button>
                </div>
              </div>
            ))}

            {form.submenus.length === 0 && (
              <div className="nb-empty" style={{ padding: "1.25rem", border: "1.5px dashed #ccd9f0", borderRadius: 10 }}>
                <div className="nb-empty-icon">📂</div>
                <div className="nb-empty-title">No submenu created yet.</div>
                <div className="nb-empty-sub">Use the button below to add one.</div>
              </div>
            )}

            {status.error && <div className="nb-error">⚠ {status.error}</div>}
            {status.notice && <div className="nb-notice">✓ {status.notice}</div>}

            <div className="nb-inline">
              <button type="button" onClick={addSubmenu} className="nb-btn-secondary">
                + Add Submenu
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="nb-btn-primary"
                disabled={status.loading}
              >
                {status.loading ? "Saving..." : editingId ? "✓ Update Navigation" : "✓ Save Navigation"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setForm(emptyForm); setEditingId(null); }}
                  className="nb-btn-ghost"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Navbar List ── */}
        <section className="nb-card">
          <div className="nb-panel-header">
            <div>
              <p className="nb-section-label" style={{ margin: "0 0 0.35rem" }}>Navigation Items</p>
              <h2 className="nb-panel-title">Saved Navigation</h2>
              <p className="nb-panel-sub">
                These items drive the storefront navigation menu.
              </p>
            </div>
            <span className="nb-badge nb-badge-blue" style={{ fontSize: "0.85rem", padding: "0.35rem 0.9rem" }}>
              {navbars.length} items
            </span>
          </div>

          {/* Search + filter */}
          <div className="nb-search-bar" style={{ marginBottom: "1.25rem" }}>
            <div className="nb-search-wrap">
              <span className="nb-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                className="nb-search-input"
                placeholder="Search navigation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="nb-filter-tabs">
              {["All", "Published", "Hidden"].map((tab) => (
                <button
                  key={tab}
                  className={`nb-filter-tab${filter === tab ? " nb-filter-tab-active" : ""}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {status.loading ? (
            <div className="nb-empty">
              <div className="nb-empty-icon">⏳</div>
              <div className="nb-empty-title">Loading navigation items…</div>
            </div>
          ) : filteredNavbars.length === 0 ? (
            <div className="nb-empty">
              <div className="nb-empty-icon">📂</div>
              <div className="nb-empty-title">No navigation items found.</div>
              <div className="nb-empty-sub">Create one using the form above.</div>
            </div>
          ) : (
            <div className="nb-accordion-list">
              {filteredNavbars.map((navbar) => {
                const isOpen = !!expandedIds[navbar._id];
                const submenuCount = navbar.submenus?.length || 0;
                const linkCount = (navbar.submenus || []).reduce((t, s) => t + (s.items?.length || 0), 0);

                return (
                  <div key={navbar._id} className="nb-accordion">
                    {/* Header row */}
                    <div className="nb-accordion-header" onClick={() => toggleExpand(navbar._id)}>
                      <div className="nb-accordion-left">
                        <svg
                          className={`nb-accordion-chevron${isOpen ? " nb-accordion-chevron-open" : ""}`}
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        <div className="nb-acc-icon">📁</div>
                        <div>
                          <div className="nb-acc-title">{navbar.title}</div>
                          <div className="nb-acc-meta">
                            <span className="nb-badge nb-badge-slug">/{navbar.slug}</span>
                            <span className="nb-badge nb-badge-blue">🗂 {submenuCount} Submenus</span>
                            <span className="nb-badge nb-badge-green">🔗 {linkCount} Links</span>
                          </div>
                        </div>
                      </div>
                      <div className="nb-acc-actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => handleEdit(navbar)} className="nb-btn-secondary">
                          ✏ Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(navbar._id)} className="nb-btn-danger">
                          🗑 Delete
                        </button>
                      </div>
                    </div>

                    {/* Expanded tree body */}
                    {isOpen && (
                      <div className="nb-accordion-body">
                        {submenuCount === 0 ? (
                          <div className="nb-empty" style={{ padding: "1rem" }}>
                            <div className="nb-empty-icon">📂</div>
                            <div className="nb-empty-title">No submenu created yet.</div>
                            <div className="nb-empty-sub">
                              Edit this item and use <strong>+ Add Submenu</strong>.
                            </div>
                          </div>
                        ) : (
                          navbar.submenus.map((submenu, idx) => (
                            <div key={`${navbar._id}-${idx}`} className="nb-tree-submenu">
                              {idx > 0 && <div className="nb-tree-divider" />}
                              <div className="nb-tree-submenu-header">
                                <span className="nb-tree-submenu-icon" />
                                <span className="nb-tree-submenu-title">{submenu.title}</span>
                                <span className="nb-tree-submenu-count">{submenu.items?.length || 0} items</span>
                              </div>
                              <div className="nb-chips">
                                {submenu.items?.length ? submenu.items.map((item, itemIdx) => (
                                  <div key={`${item.slug}-${itemIdx}`} className="nb-chip">
                                    <span>{item.name}</span>
                                    <span className="nb-chip-slug">/{item.slug}</span>
                                  </div>
                                )) : (
                                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No items</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Homepage Preview ── */}
        <section className="nb-card" hidden>
          <div className="nb-panel-header">
            <div>
              <p className="nb-section-label" style={{ margin: "0 0 0.35rem" }}>Preset Preview</p>
              <h2 className="nb-panel-title">Omsons Navbar Structure</h2>
              <p className="nb-panel-sub">
                Import this base structure now, then edit submenu groups and dropdown links here later.
              </p>
            </div>
            <button
              type="button"
              onClick={handleImportPresetNavbar}
              className="nb-btn-primary"
              disabled={status.loading}
            >
              {status.loading ? "Importing..." : "⬇ Import Existing Navigation"}
            </button>
          </div>

          <div className="nb-preview-grid">
            {navbarPresetPreview.map((navbar) => (
              <div key={navbar.slug} className="nb-preview-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1rem" }}>📁</span>
                  <div>
                    <div className="nb-preview-title">{navbar.title}</div>
                    <span className="nb-badge nb-badge-slug">/{navbar.slug}</span>
                  </div>
                </div>
                {(navbar.submenus || []).length ? (
                  navbar.submenus.map((submenu) => (
                    <div key={`${navbar.slug}-${submenu.title}`} style={{ marginBottom: "0.875rem" }}>
                      <div className="nb-tree-submenu-header">
                        <span className="nb-tree-submenu-icon" />
                        <span className="nb-tree-submenu-title">{submenu.title}</span>
                        <span className="nb-tree-submenu-count">{submenu.items?.length || 0} items</span>
                      </div>
                      <div className="nb-chips">
                        {submenu.items?.map((item) => (
                          <div key={`${navbar.slug}-${item.slug}`} className="nb-chip">
                            <span>{item.name}</span>
                            <span className="nb-chip-slug">/{item.slug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="nb-empty" style={{ padding: "1rem" }}>
                    <div className="nb-empty-icon">📂</div>
                    <div className="nb-empty-title">No submenu created yet.</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── Floating Action Button ── */}
      <button
        className="nb-fab"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ＋ Add Navigation
      </button>
    </>
  );
}

/* ── Helpers (unchanged) ── */
function createSubmenu() {
  return { _uiId: `submenu-${nextRowId++}`, title: "", items: [] };
}

function createSubmenuItem() {
  return { _uiId: `item-${nextRowId++}`, name: "", slug: "" };
}

function hydrateSubmenus(submenus) {
  return submenus.map((submenu) => ({
    ...submenu,
    _uiId: submenu._uiId || `submenu-${nextRowId++}`,
    items: Array.isArray(submenu.items)
      ? submenu.items.map((item) => ({ ...item, _uiId: item._uiId || `item-${nextRowId++}` }))
      : [],
  }));
}

function getCookieValue(name) {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").find((p) => p.startsWith(`${name}=`))?.split("=")[1] || "";
}
