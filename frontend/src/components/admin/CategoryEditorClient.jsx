"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appRoutes } from "@/lib/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const createEmptyForm = () => ({
  name: "",
  slug: "",
  description: "",
  bulletPoints: [""],
  imageUrl: "",
  icons: [{ label: "", imageUrl: "" }],
  tableColumns: ["Cat. No.", "Socket Size", "Cone Size", "Pack Unit"],
  isActive: true,
});

export default function CategoryEditorClient({ categoryId }) {
  const [form, setForm] = useState(createEmptyForm);
  const [status, setStatus] = useState({ loading: false, error: "", notice: "" });
  const token = useMemo(() => getCookieValue("admin_token"), []);
  const isEditing = Boolean(categoryId);

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  async function loadCategory() {
    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/category/manage/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load category");
      }

      setForm({
        name: data.category.name || "",
        slug: data.category.slug || "",
        description: data.category.description || "",
        bulletPoints: data.category.bulletPoints?.length ? data.category.bulletPoints : [""],
        imageUrl: data.category.imageUrl || "",
        icons: data.category.icons?.length ? data.category.icons : [{ label: "", imageUrl: "" }],
        tableColumns: data.category.tableColumns?.length
          ? data.category.tableColumns
          : ["Cat. No.", "Socket Size", "Cone Size", "Pack Unit"],
        isActive: Boolean(data.category.isActive),
      });
      setStatus({ loading: false, error: "", notice: "" });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to load category",
        notice: "",
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(
        isEditing ? `${API_BASE_URL}/category/${categoryId}` : `${API_BASE_URL}/category`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save category");
      }

      setStatus({
        loading: false,
        error: "",
        notice: isEditing ? "Category updated" : "Category created",
      });

      if (!isEditing) {
        window.location.href = appRoutes.adminCategoryEdit(data.category._id);
      }
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to save category",
        notice: "",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
              {isEditing ? "Edit Category" : "Create Category"}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              {isEditing ? "Update catalogue section" : "New catalogue section"}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Configure the catalogue title, slug, visual treatment, bullet points,
              technical icons, and dynamic table columns for a laboratory product group.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={appRoutes.adminCategories}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Back to Listing
            </Link>
            {isEditing ? (
              <Link
                href={`${appRoutes.adminProducts}?categoryId=${categoryId}`}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
              >
                Manage Products
              </Link>
            ) : null}
          </div>
        </div>

        {status.error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {status.error}
          </p>
        ) : null}
        {status.notice ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status.notice}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Category Name">
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug: slugify(event.target.value),
                    }))
                  }
                  className={inputClassName}
                  required
                />
              </Field>
              <Field label="Slug">
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                  }
                  className={inputClassName}
                  required
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-5">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={4}
                  className={`${inputClassName} min-h-28`}
                />
              </Field>

              <Field label="Product Image URL">
                <input
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageUrl: event.target.value }))
                  }
                  placeholder="https://... or data:image/svg+xml..."
                  className={inputClassName}
                />
              </Field>
            </div>
          </div>

          <DynamicArraySection
            title="Bullet Points"
            description="These appear as the description bullets beside the product image on the public catalogue."
            items={form.bulletPoints}
            addLabel="Add bullet point"
            onAdd={() =>
              setForm((current) => ({
                ...current,
                bulletPoints: [...current.bulletPoints, ""],
              }))
            }
            onChange={(index, value) =>
              setForm((current) => ({
                ...current,
                bulletPoints: current.bulletPoints.map((item, itemIndex) =>
                  itemIndex === index ? value : item
                ),
              }))
            }
            onRemove={(index) =>
              setForm((current) => ({
                ...current,
                bulletPoints:
                  current.bulletPoints.length === 1
                    ? [""]
                    : current.bulletPoints.filter((_, itemIndex) => itemIndex !== index),
              }))
            }
          />
        </div>

        <div className="grid gap-6">
          <DynamicArraySection
            title="Table Columns"
            description="These control both the admin row form and the public product specification table."
            items={form.tableColumns}
            addLabel="Add column"
            onAdd={() =>
              setForm((current) => ({
                ...current,
                tableColumns: [...current.tableColumns, ""],
              }))
            }
            onChange={(index, value) =>
              setForm((current) => ({
                ...current,
                tableColumns: current.tableColumns.map((item, itemIndex) =>
                  itemIndex === index ? value : item
                ),
              }))
            }
            onRemove={(index) =>
              setForm((current) => ({
                ...current,
                tableColumns:
                  current.tableColumns.length === 1
                    ? [""]
                    : current.tableColumns.filter((_, itemIndex) => itemIndex !== index),
              }))
            }
          />

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
              Publishing
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Visibility</h3>
            <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              Category is active on the public catalogue
            </label>

            <button
              type="submit"
              disabled={status.loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
            </button>
          </section>
        </div>
      </section>
    </form>
  );
}

function DynamicArraySection({ title, description, items, addLabel, onAdd, onChange, onRemove }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <button type="button" onClick={onAdd} className={secondaryButtonClassName}>
          {addLabel}
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <input
              value={item}
              onChange={(event) => onChange(index, event.target.value)}
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500";

const secondaryButtonClassName =
  "inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700";
