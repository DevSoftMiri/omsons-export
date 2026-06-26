"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const emptyForm = {
  name: "",
  slug: "",
  mainCategory: "",
  submenuTitle: "",
  heroImage: "",
  description: "",
};

export default function ManageCategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: false, error: "", notice: "" });

  const token = useMemo(() => getCookieValue("admin_token"), []);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const response = await fetch(`${API_BASE_URL}/category`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load categories");
      }

      setCategories(data.categories || []);
      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        loading: false,
        error: error.message || "Failed to load categories",
      }));
    }
  }

  function handleNameChange(event) {
    const name = event.target.value;

    setForm((current) => ({
      ...current,
      name,
      slug: createSlug(name),
    }));
  }

  function handleEdit(category) {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      mainCategory: category.mainCategory || "",
      submenuTitle: category.submenuTitle || "",
      heroImage: category.heroImage || "",
      description: category.description || "",
    });
    setStatus((current) => ({ ...current, error: "", notice: "" }));
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setStatus((current) => ({ ...current, error: "", notice: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "", notice: "" });

    try {
      const url = editingId ? `${API_BASE_URL}/category/${editingId}` : `${API_BASE_URL}/category`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save category");
      }

      handleCancel();
      setStatus({
        loading: false,
        error: "",
        notice: editingId ? "Category updated" : "Category created",
      });
      fetchCategories();
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to save category",
        notice: "",
      });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    setStatus((current) => ({ ...current, loading: true, error: "", notice: "" }));

    try {
      const response = await fetch(`${API_BASE_URL}/category/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete category");
      }

      if (editingId === id) {
        handleCancel();
      }

      setStatus({ loading: false, error: "", notice: "Category deleted" });
      fetchCategories();
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to delete category",
        notice: "",
      });
    }
  }

  async function handleSyncFromProducts() {
    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/category/sync-from-products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to sync categories");
      }

      setStatus({
        loading: false,
        error: "",
        notice: `Synced categories from ${data.totalProducts} products.`,
      });
      fetchCategories();
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to sync categories",
        notice: "",
      });
    }
  }

  return (
    <div style={styles.layout}>
      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.sectionTitle}>{editingId ? "Edit Category" : "Add Category"}</h2>
            <p style={styles.copy}>
              Manage the category records that map storefront sections to imported products.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <label style={styles.field}>
              <span>Name</span>
              <input value={form.name} onChange={handleNameChange} required style={styles.input} />
            </label>

            <label style={styles.field}>
              <span>Slug</span>
              <input
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                required
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span>Main Category</span>
              <input
                value={form.mainCategory}
                onChange={(event) =>
                  setForm((current) => ({ ...current, mainCategory: event.target.value }))
                }
                required
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span>Submenu Title</span>
              <input
                value={form.submenuTitle}
                onChange={(event) =>
                  setForm((current) => ({ ...current, submenuTitle: event.target.value }))
                }
                style={styles.input}
              />
            </label>
          </div>

          <label style={styles.field}>
            <span>Hero Image URL</span>
            <input
              value={form.heroImage}
              onChange={(event) => setForm((current) => ({ ...current, heroImage: event.target.value }))}
              placeholder="https://..."
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              style={styles.textarea}
            />
          </label>

          {status.error ? <p style={styles.error}>{status.error}</p> : null}
          {status.notice ? <p style={styles.notice}>{status.notice}</p> : null}

          <div style={styles.inlineActions}>
            <button type="submit" style={styles.primaryButton} disabled={status.loading}>
              {status.loading ? "Saving..." : editingId ? "Update Category" : "Add Category"}
            </button>
            {editingId ? (
              <button type="button" onClick={handleCancel} style={styles.secondaryButton}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Category List</h2>
            <p style={styles.copy}>These records power category pages and admin organization.</p>
          </div>
          <div style={styles.headerActions}>
            <button type="button" onClick={handleSyncFromProducts} style={styles.secondaryButton}>
              Sync From Products
            </button>
            <span style={styles.badge}>{categories.length} total</span>
          </div>
        </div>

        {status.loading && !categories.length ? <p style={styles.muted}>Loading categories...</p> : null}

        <div style={styles.list}>
          {categories.map((category) => (
            <article key={category._id} style={styles.listCard}>
              <div style={styles.listHeader}>
                <div style={styles.listContent}>
                  <h3 style={styles.cardTitle}>{category.name}</h3>
                  <p style={styles.muted}>Slug: {category.slug}</p>
                  <p style={styles.muted}>Main Category: {category.mainCategory}</p>
                  <p style={styles.muted}>Submenu Title: {category.submenuTitle || "-"}</p>
                  <p style={styles.muted}>Description: {category.description || "-"}</p>
                </div>

                <div style={styles.sideColumn}>
                  {category.heroImage ? (
                    <img src={category.heroImage} alt={category.name} style={styles.thumbnail} />
                  ) : (
                    <div style={styles.thumbnailPlaceholder}>No image</div>
                  )}

                  <div style={styles.inlineActions}>
                    <button type="button" onClick={() => handleEdit(category)} style={styles.secondaryButton}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(category._id)} style={styles.ghostButton}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function createSlug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getCookieValue(name) {
  if (typeof document === "undefined") {
    return "";
  }

  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")[1] || "";
}

const styles = {
  layout: {
    display: "grid",
    gap: "1.5rem",
  },
  panel: {
    display: "grid",
    gap: "1rem",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "start",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    color: "#0f172a",
  },
  copy: {
    margin: "0.35rem 0 0",
    color: "#64748b",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.55rem 0.85rem",
    borderRadius: "999px",
    background: "#e2e8f0",
    color: "#0f172a",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  form: {
    display: "grid",
    gap: "1rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
    gap: "1rem",
  },
  field: {
    display: "grid",
    gap: "0.4rem",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "0.8rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
  },
  textarea: {
    width: "100%",
    padding: "0.8rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
    resize: "vertical",
    minHeight: "8rem",
  },
  inlineActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "0.8rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    padding: "0.8rem 1rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
  },
  ghostButton: {
    padding: "0.8rem 1rem",
    borderRadius: "0.5rem",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: "1rem",
  },
  listCard: {
    display: "grid",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "start",
    flexWrap: "wrap",
  },
  listContent: {
    minWidth: "16rem",
    flex: 1,
  },
  sideColumn: {
    display: "grid",
    gap: "0.75rem",
    justifyItems: "end",
  },
  cardTitle: {
    margin: 0,
    color: "#0f172a",
  },
  muted: {
    margin: "0.35rem 0 0",
    color: "#64748b",
  },
  thumbnail: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "0.5rem",
    border: "1px solid #e2e8f0",
  },
  thumbnailPlaceholder: {
    width: "120px",
    height: "120px",
    display: "grid",
    placeItems: "center",
    borderRadius: "0.5rem",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    background: "#f8fafc",
    fontSize: "0.9rem",
  },
  error: {
    margin: 0,
    color: "#b91c1c",
  },
  notice: {
    margin: 0,
    color: "#166534",
  },
};
