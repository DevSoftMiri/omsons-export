"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes } from "@/lib/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const defaultStatus = { loading: false, error: "", notice: "" };

export default function ManageProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => getCookieValue("admin_token"), []);
  const editProductId = searchParams.get("edit") || "";
  const initialCategoryId = searchParams.get("categoryId") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [editingProductId, setEditingProductId] = useState(editProductId);
  const [form, setForm] = useState(createEmptyForm());
  const [status, setStatus] = useState(defaultStatus);
  const [imageUpload, setImageUpload] = useState({ loading: false, error: "", name: "" });

  const selectedCategory = useMemo(
    () => categories.find((item) => item._id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );
  const activeColumns = form.tableColumns?.length
    ? form.tableColumns
    : selectedCategory?.tableColumns || [];

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) {
      return products;
    }

    return products.filter((product) => product.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    setForm((current) =>
      current.tableColumns?.length
        ? current
        : syncRowsToColumns(current, selectedCategory.tableColumns || [])
    );
  }, [selectedCategory]);

  useEffect(() => {
    if (!editProductId) {
      return;
    }

    loadProduct(editProductId);
  }, [editProductId]);

  async function loadInitialData() {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/category`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/products`, { cache: "no-store" }),
      ]);
      const categoriesData = await categoriesResponse.json();
      const productsData = await productsResponse.json();

      if (!categoriesResponse.ok || !categoriesData.success) {
        throw new Error(categoriesData.message || "Failed to load categories");
      }

      if (!productsResponse.ok || !productsData.success) {
        throw new Error(productsData.message || "Failed to load products");
      }

      const categoryItems = categoriesData.categories || [];
      setCategories(categoryItems);
      setProducts(productsData.products || []);

      if (!selectedCategoryId && categoryItems.length) {
        setSelectedCategoryId(categoryItems[0]._id);
      }

      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to load product data",
        notice: "",
      });
    }
  }

  async function loadProduct(productId) {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const response = await fetch(`${API_BASE_URL}/products/manage/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load product");
      }

      const product = data.product;
      setEditingProductId(product._id);
      setSelectedCategoryId(product.categoryId);
      setForm({
        categoryId: product.categoryId,
        name: product.name || "",
        slug: product.slug || "",
        tableColumns: product.tableColumns?.length
          ? product.tableColumns
          : product.category?.tableColumns || [],
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        imagePublicId: product.imagePublicId || "",
        bulletPoints: product.bulletPoints?.length ? product.bulletPoints : [""],
        icons: product.icons?.length ? product.icons : [{ label: "", imageUrl: "" }],
        technicalTags: product.technicalTags?.length ? product.technicalTags : [""],
        rows: product.rows?.length
          ? product.rows.map((row) => ({
              values: { ...(row.values || {}) },
              sortOrder: row.sortOrder,
              isActive: row.isActive,
            }))
          : [{ values: createEmptyRowValues(product.tableColumns || product.category?.tableColumns || []) }],
        isActive: Boolean(product.isActive),
      });
      setImageUpload({ loading: false, error: "", name: "" });
      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to load product",
        notice: "",
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedCategoryId) {
      setStatus({ loading: false, error: "Select a category first", notice: "" });
      return;
    }

    setStatus({ loading: true, error: "", notice: "" });

    try {
      const payload = {
        ...form,
        categoryId: selectedCategoryId,
        tableColumns: activeColumns,
        rows: normalizeFormRows(form.rows, activeColumns),
      };

      const response = await fetch(
        editingProductId ? `${API_BASE_URL}/products/${editingProductId}` : `${API_BASE_URL}/products`,
        {
          method: editingProductId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save product");
      }

      await loadInitialData();
      setEditingProductId("");
      setSelectedCategoryId(data.product.categoryId);
      setForm(createEmptyForm(selectedCategory?.tableColumns || []));
      router.replace(`${appRoutes.adminProducts}?categoryId=${data.product.categoryId}`);
      setStatus({
        loading: false,
        error: "",
        notice: editingProductId ? "Product updated" : "Product created",
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to save product",
        notice: "",
      });
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageUpload({ loading: true, error: "", name: file.name });

    try {
      const payload = new FormData();
      payload.append("image", file);
      if (form.imagePublicId) {
        payload.append("previousPublicId", form.imagePublicId);
      }

      const response = await fetch(`${API_BASE_URL}/products/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image");
      }

      setForm((current) => ({
        ...current,
        imageUrl: data.imageUrl || "",
        imagePublicId: data.imagePublicId || "",
      }));
      setImageUpload({ loading: false, error: "", name: file.name });
    } catch (error) {
      setImageUpload({
        loading: false,
        error: error.message || "Failed to upload image",
        name: file.name,
      });
    } finally {
      event.target.value = "";
    }
  }

  async function handleDelete(productId) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      if (editingProductId === productId) {
        resetForm();
      }

      await loadInitialData();
      setStatus({ loading: false, error: "", notice: "Product deleted" });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to delete product",
        notice: "",
      });
    }
  }

  function resetForm() {
    setEditingProductId("");
    setForm(createEmptyForm(selectedCategory?.tableColumns || []));
    setImageUpload({ loading: false, error: "", name: "" });
    const nextCategory = selectedCategoryId ? `?categoryId=${selectedCategoryId}` : "";
    router.replace(`${appRoutes.adminProducts}${nextCategory}`);
  }

  function handleCategoryChange(categoryId) {
    setSelectedCategoryId(categoryId);
    const nextColumns = categories.find((item) => item._id === categoryId)?.tableColumns || [];
    setForm((current) => ({
      ...syncRowsToColumns(current, nextColumns),
      categoryId,
      tableColumns: nextColumns,
    }));
  }

  function handleEdit(product) {
    setEditingProductId(product._id);
    setSelectedCategoryId(product.categoryId);
    setForm({
      categoryId: product.categoryId,
      name: product.name || "",
      slug: product.slug || "",
      tableColumns: product.tableColumns?.length
        ? product.tableColumns
        : product.category?.tableColumns || [],
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      imagePublicId: product.imagePublicId || "",
      bulletPoints: product.bulletPoints?.length ? product.bulletPoints : [""],
      icons: product.icons?.length ? product.icons : [{ label: "", imageUrl: "" }],
      technicalTags: product.technicalTags?.length ? product.technicalTags : [""],
      rows: product.rows?.length
        ? product.rows.map((row) => ({
            values: { ...(row.values || {}) },
            sortOrder: row.sortOrder,
            isActive: row.isActive,
          }))
        : [{ values: createEmptyRowValues(product.tableColumns || product.category?.tableColumns || []) }],
      isActive: Boolean(product.isActive),
    });
    setImageUpload({ loading: false, error: "", name: "" });
    router.replace(`${appRoutes.adminProducts}?edit=${product._id}&categoryId=${product.categoryId}`);
  }

  function addRow() {
    setForm((current) => ({
      ...current,
      rows: [
        ...current.rows,
        {
          values: createEmptyRowValues(activeColumns),
          sortOrder: current.rows.length + 1,
          isActive: true,
        },
      ],
    }));
  }

  function removeRow(index) {
    setForm((current) => ({
      ...current,
      rows:
        current.rows.length === 1
          ? [{ values: createEmptyRowValues(activeColumns) }]
          : current.rows.filter((_, rowIndex) => rowIndex !== index),
    }));
  }

  function moveRow(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= form.rows.length) {
      return;
    }

    setForm((current) => {
      const reordered = [...current.rows];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);
      return { ...current, rows: reordered };
    });
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
              Product Catalogue Admin
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Add products under a main category
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Select a category, enter the product details, then add dynamic table rows using the
              table columns defined on that category.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={appRoutes.adminCategories}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Manage Categories
            </Link>
            <Link
              href={appRoutes.adminProductList}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Open Product List
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

      <section className="grid gap-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Main Category">
                <select
                  value={selectedCategoryId}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Select category</option>
                  {categories.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Product Name">
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
              <Field label="Product Slug">
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                  }
                  className={inputClassName}
                  required
                />
              </Field>
              <Field label="Product Image">
                <div className="grid gap-3">
                  <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                      disabled={imageUpload.loading}
                    />
                    {imageUpload.loading ? "Uploading..." : "Upload Image"}
                  </label>
                  <p className="text-xs text-slate-500">
                    Upload a product image to Cloudinary. The hosted URL will be saved in MongoDB.
                  </p>
                  {imageUpload.name ? (
                    <p className="text-xs text-slate-500">Selected file: {imageUpload.name}</p>
                  ) : null}
                  {imageUpload.error ? (
                    <p className="text-sm text-red-600">{imageUpload.error}</p>
                  ) : null}
                  {form.imageUrl ? (
                    <div className="grid gap-2">
                      <img
                        src={form.imageUrl}
                        alt={form.name || "Product preview"}
                        className="h-28 w-28 rounded-2xl border border-slate-200 object-cover"
                      />
                      <p className="break-all text-xs text-slate-500">{form.imageUrl}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No image uploaded yet.</p>
                  )}
                </div>
              </Field>
            </div>

            <div className="mt-5">
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
            </div>
          </div>

          <DynamicArraySection
            title="Bullet Points"
            description="These will appear in the product detail and catalogue section."
            items={form.bulletPoints}
            addLabel="Add bullet"
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

          <DynamicObjectArraySection
            title="Icons / Tags"
            description="Add icon labels and optional image URLs for the product."
            items={form.icons}
            onAdd={() =>
              setForm((current) => ({
                ...current,
                icons: [...current.icons, { label: "", imageUrl: "" }],
              }))
            }
            onChange={(index, key, value) =>
              setForm((current) => ({
                ...current,
                icons: current.icons.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, [key]: value } : item
                ),
              }))
            }
            onRemove={(index) =>
              setForm((current) => ({
                ...current,
                icons:
                  current.icons.length === 1
                    ? [{ label: "", imageUrl: "" }]
                    : current.icons.filter((_, itemIndex) => itemIndex !== index),
              }))
            }
          />

          <DynamicArraySection
            title="Technical Tags"
            description="Optional small labels to surface on the product."
            items={form.technicalTags}
            addLabel="Add tag"
            onAdd={() =>
              setForm((current) => ({
                ...current,
                technicalTags: [...current.technicalTags, ""],
              }))
            }
            onChange={(index, value) =>
              setForm((current) => ({
                ...current,
                technicalTags: current.technicalTags.map((item, itemIndex) =>
                  itemIndex === index ? value : item
                ),
              }))
            }
            onRemove={(index) =>
              setForm((current) => ({
                ...current,
                technicalTags:
                  current.technicalTags.length === 1
                    ? [""]
                    : current.technicalTags.filter((_, itemIndex) => itemIndex !== index),
              }))
            }
          />

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
                  Product Table Rows
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  Dynamic rows from category columns
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {selectedCategory
                    ? `These fields come from ${selectedCategory.name}: ${activeColumns.join(", ")}.`
                    : "Select a category to generate the table row fields."}
                </p>
              </div>
              <button
                type="button"
                onClick={addRow}
                disabled={!selectedCategory}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add Row
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {form.rows.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Row {rowIndex + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveRow(rowIndex, rowIndex - 1)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(rowIndex, rowIndex + 1)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(rowIndex)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {activeColumns.map((column) => (
                      <Field key={`${column}-${rowIndex}`} label={column}>
                        <input
                          value={row.values?.[column] || ""}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              rows: current.rows.map((item, itemIndex) =>
                                itemIndex === rowIndex
                                  ? {
                                      ...item,
                                      values: {
                                        ...item.values,
                                        [column]: event.target.value,
                                      },
                                    }
                                  : item
                              ),
                            }))
                          }
                          className={inputClassName}
                        />
                      </Field>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              Product is active on the public catalogue
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={status.loading}
                className="inline-flex items-center rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.loading ? "Saving..." : editingProductId ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Clear Form
              </button>
            </div>
          </section>
        </form>

      </section>
    </div>
  );
}

function DynamicArraySection({ title, description, items, addLabel, onAdd, onChange, onRemove }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">{title}</p>
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

function DynamicObjectArraySection({ title, description, items, onAdd, onChange, onRemove }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">{title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <button type="button" onClick={onAdd} className={secondaryButtonClassName}>
          Add Icon
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <input
              value={item.label}
              onChange={(event) => onChange(index, "label", event.target.value)}
              placeholder="Label"
              className={inputClassName}
            />
            <input
              value={item.imageUrl}
              onChange={(event) => onChange(index, "imageUrl", event.target.value)}
              placeholder="Image URL"
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

function createEmptyForm(columns = []) {
  return {
    categoryId: "",
    name: "",
    slug: "",
    tableColumns: columns,
    description: "",
    imageUrl: "",
    imagePublicId: "",
    bulletPoints: [""],
    icons: [{ label: "", imageUrl: "" }],
    technicalTags: [""],
    rows: [{ values: createEmptyRowValues(columns) }],
    isActive: true,
  };
}

function createEmptyRowValues(columns, source = {}) {
  return columns.reduce((accumulator, column) => {
    accumulator[column] = source[column] || "";
    return accumulator;
  }, {});
}

function normalizeFormRows(rows, columns) {
  return rows.map((row, index) => ({
    values: createEmptyRowValues(columns, row.values || {}),
    sortOrder: index + 1,
    isActive: row.isActive !== false,
  }));
}

function syncRowsToColumns(form, columns) {
  const syncedRows = (form.rows?.length ? form.rows : [{ values: {} }]).map((row, index) => ({
    values: createEmptyRowValues(columns, row.values || {}),
    sortOrder: row.sortOrder || index + 1,
    isActive: row.isActive !== false,
  }));

  return {
    ...form,
    tableColumns: columns,
    rows: syncedRows,
  };
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
