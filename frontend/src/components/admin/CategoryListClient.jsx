"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appRoutes } from "@/lib/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function CategoryListClient() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", notice: "" });
  const token = useMemo(() => getCookieValue("admin_token"), []);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const response = await fetch(`${API_BASE_URL}/category`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load categories");
      }

      setCategories(data.categories || []);
      setStatus({ loading: false, error: "", notice: "" });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to load categories",
        notice: "",
      });
    }
  }

  async function handleDelete(categoryId) {
    if (!window.confirm("Delete this category and all of its rows?")) {
      return;
    }

    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete category");
      }

      await loadCategories();
      setStatus({ loading: false, error: "", notice: "Category deleted" });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to delete category",
        notice: "",
      });
    }
  }

  async function handleToggleActive(category) {
    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/category/${category._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      await loadCategories();
      setStatus({
        loading: false,
        error: "",
        notice: `${category.name} ${category.isActive ? "disabled" : "enabled"}`,
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to update status",
        notice: "",
      });
    }
  }

  async function moveCategory(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= categories.length) {
      return;
    }

    const reordered = [...categories];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setCategories(reordered);

    try {
      const response = await fetch(`${API_BASE_URL}/category/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryIds: reordered.map((item) => item._id) }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reorder categories");
      }
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to reorder categories",
        notice: "",
      });
      await loadCategories();
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
              Catalogue Categories
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Dynamic category catalogue
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Manage category sections, dynamic table columns, visual icons, and row
              structures for the public laboratory catalogue page.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {categories.length} categories
            </span>
            <Link
              href={appRoutes.adminCategoryCreate}
              className="inline-flex items-center rounded-full bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"
            >
              Add Category
            </Link>
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

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          {categories.map((category, index) => (
            <article
              key={category._id}
              className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 lg:grid-cols-[160px_minmax(0,1fr)_auto]"
            >
              <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-40 place-items-center text-sm text-slate-400">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold text-slate-900">{category.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      category.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Slug: {category.slug}</p>
                <p className="text-sm leading-6 text-slate-600">
                  {category.description || "No description added yet."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {category.tableColumns?.map((column) => (
                    <span
                      key={column}
                      className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                    >
                      {column}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{category.bulletPoints?.length || 0} bullet points</span>
                  <span>{category.icons?.length || 0} technical icons</span>
                  <span>Sort order {category.sortOrder}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={appRoutes.adminCategoryEdit(category._id)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Edit Details
                </Link>
                <Link
                  href={`${appRoutes.adminProducts}?categoryId=${category._id}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Manage Products
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggleActive(category)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {category.isActive ? "Disable" : "Enable"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveCategory(index, index - 1)}
                    className="flex-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(index, index + 1)}
                    className="flex-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(category._id)}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}

          {!categories.length && !status.loading ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              No categories yet. Create the first dynamic catalogue category.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
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
