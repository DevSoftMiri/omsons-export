"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [featureCards, setFeatureCards] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [editingProductId, setEditingProductId] = useState(editProductId);
  const [form, setForm] = useState(createEmptyForm());
  const [status, setStatus] = useState(defaultStatus);
  const [imageUpload, setImageUpload] = useState({ loading: false, error: "", name: "" });
  const [galleryUpload, setGalleryUpload] = useState({ loading: false, error: "", name: "" });

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

  const loadInitialData = useCallback(async () => {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const [categoriesResponse, productsResponse, featureCardsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/category`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/products`, { cache: "no-store" }),
        fetch(`${API_BASE_URL}/feature-cards/admin/list`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const categoriesData = await categoriesResponse.json();
      const productsData = await productsResponse.json();
      const featureCardsData = await featureCardsResponse.json();

      if (!categoriesResponse.ok || !categoriesData.success) {
        throw new Error(categoriesData.message || "Failed to load categories");
      }

      if (!productsResponse.ok || !productsData.success) {
        throw new Error(productsData.message || "Failed to load products");
      }

      if (!featureCardsResponse.ok || !featureCardsData.success) {
        throw new Error(featureCardsData.message || "Failed to load feature cards");
      }

      const categoryItems = categoriesData.categories || [];
      setCategories(categoryItems);
      setProducts(productsData.products || []);
      setFeatureCards(featureCardsData.featureCards || []);

      if (!selectedCategoryId && categoryItems.length) {
        setSelectedCategoryId(categoryItems[0]._id);
        setForm((current) => syncRowsToColumns(current, categoryItems[0].tableColumns || []));
      }

      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to load product data",
        notice: "",
      });
    }
  }, [selectedCategoryId, token]);

  const loadProduct = useCallback(async (productId) => {
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
      setForm(createFormFromProduct(product));
      setImageUpload({ loading: false, error: "", name: "" });
      setGalleryUpload({ loading: false, error: "", name: "" });
      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to load product",
        notice: "",
      });
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!editProductId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProduct(editProductId);
  }, [editProductId, loadProduct]);

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
        detailSections: normalizeDetailSectionForm(form.detailSections),
        featureCardIds: form.featureCardIds.filter(Boolean),
        highlightCards: normalizeHighlightCardsForm(form.highlightCards),
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

  async function handleImageUpload(event, type) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const setUploadState = type === "gallery" ? setGalleryUpload : setImageUpload;
    setUploadState({ loading: true, error: "", name: file.name });

    try {
      const payload = new FormData();
      payload.append("image", file);
      if (type === "main" && form.imagePublicId) {
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

      if (type === "gallery") {
        setForm((current) => ({
          ...current,
          galleryImages: [...current.galleryImages, data.imageUrl || ""].filter(Boolean),
        }));
      } else {
        setForm((current) => ({
          ...current,
          imageUrl: data.imageUrl || "",
          imagePublicId: data.imagePublicId || "",
        }));
      }

      setUploadState({ loading: false, error: "", name: file.name });
    } catch (error) {
      setUploadState({
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
    setGalleryUpload({ loading: false, error: "", name: "" });
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
    setForm(createFormFromProduct(product));
    setImageUpload({ loading: false, error: "", name: "" });
    setGalleryUpload({ loading: false, error: "", name: "" });
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
              Build the full product detail page
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Manage gallery media, reusable feature cards, mixed paragraph and points sections,
              and product-specific brochure or COQ assets alongside the dynamic specification rows.
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
              href={appRoutes.adminFeatureCards}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
            >
              Manage Feature Cards
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

      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f6fd_100%)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Category Products
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Quick jump into an existing product to edit its detail page content.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
            {filteredProducts.length} in this category
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {filteredProducts.slice(0, 10).map((product) => (
            <button
              key={product._id}
              type="button"
              onClick={() => handleEdit(product)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {product.name}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
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
            <Field label="Short Description">
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
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-2">
            <Field label="Main Product Image">
              <div className="grid gap-3">
                <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event, "main")}
                    className="sr-only"
                    disabled={imageUpload.loading}
                  />
                  {imageUpload.loading ? "Uploading..." : "Upload Main Image"}
                </label>
                {imageUpload.error ? (
                  <p className="text-sm text-red-600">{imageUpload.error}</p>
                ) : null}
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.name || "Product preview"}
                    className="h-32 w-32 rounded-2xl border border-slate-200 object-cover"
                  />
                ) : (
                  <p className="text-xs text-slate-400">No image uploaded yet.</p>
                )}
              </div>
            </Field>

            <Field label="Gallery Images">
              <div className="grid gap-3">
                <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event, "gallery")}
                    className="sr-only"
                    disabled={galleryUpload.loading}
                  />
                  {galleryUpload.loading ? "Uploading..." : "Add Gallery Image"}
                </label>
                {galleryUpload.error ? (
                  <p className="text-sm text-red-600">{galleryUpload.error}</p>
                ) : null}
                <div className="grid gap-3">
                  {form.galleryImages.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[96px_minmax(0,1fr)_auto]"
                    >
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
                      />
                      <input
                        value={imageUrl}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            galleryImages: current.galleryImages.map((item, itemIndex) =>
                              itemIndex === index ? event.target.value : item
                            ),
                          }))
                        }
                        className={inputClassName}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            galleryImages: current.galleryImages.filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Field>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Brochure PDF URL">
              <input
                value={form.brochureUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, brochureUrl: event.target.value }))
                }
                placeholder="https://..."
                className={inputClassName}
              />
            </Field>
            <Field label="COQ PDF URL">
              <input
                value={form.coqUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, coqUrl: event.target.value }))
                }
                placeholder="https://..."
                className={inputClassName}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
                Feature Cards
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Choose the reusable cards that should appear beneath the product image gallery.
              </p>
            </div>
            <Link href={appRoutes.adminFeatureCards} className={secondaryButtonClassName}>
              Open Library
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((card) => {
              const checked = form.featureCardIds.includes(card._id);

              return (
                <label
                  key={card._id}
                  className={`grid gap-3 rounded-[22px] border p-4 transition ${
                    checked
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeatureCard(card._id, setForm)}
                    />
                    <span className="text-sm font-semibold text-slate-900">{card.name}</span>
                  </span>
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="h-24 w-full rounded-2xl border border-slate-200 object-cover"
                    />
                  ) : null}
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
                Product Highlights
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Add the feature strip shown below the hero section. Images come from the feature
                card library, while the title and description are written only for this product.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  highlightCards: [...current.highlightCards, createEmptyHighlightCard()],
                }))
              }
              className={secondaryButtonClassName}
            >
              Add Highlight
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            {form.highlightCards.map((item, index) => {
              const selectedFeatureCard =
                featureCards.find((card) => card._id === item.featureCardId) || null;

              return (
                <div
                  key={`highlight-card-${index}`}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Highlight {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveArrayItem(setForm, "highlightCards", index, index - 1)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveArrayItem(setForm, "highlightCards", index, index + 1)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            highlightCards:
                              current.highlightCards.length === 1
                                ? [createEmptyHighlightCard()]
                                : current.highlightCards.filter(
                                    (_, itemIndex) => itemIndex !== index
                                  ),
                          }))
                        }
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)]">
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                      {selectedFeatureCard?.imageUrl ? (
                        <img
                          src={selectedFeatureCard.imageUrl}
                          alt={selectedFeatureCard.name || "Selected feature card"}
                          className="mx-auto h-20 w-20 object-contain"
                        />
                      ) : (
                        <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                          No card image
                        </div>
                      )}
                      <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                        {selectedFeatureCard?.name || "Choose a feature card"}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Feature Card Image">
                        <select
                          value={item.featureCardId}
                          onChange={(event) =>
                            updateObjectArrayItem(
                              setForm,
                              "highlightCards",
                              index,
                              "featureCardId",
                              event.target.value
                            )
                          }
                          className={inputClassName}
                        >
                          <option value="">Select feature card</option>
                          {featureCards.map((card) => (
                            <option key={card._id} value={card._id}>
                              {card.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Title">
                        <input
                          value={item.title}
                          onChange={(event) =>
                            updateObjectArrayItem(
                              setForm,
                              "highlightCards",
                              index,
                              "title",
                              event.target.value
                            )
                          }
                          className={inputClassName}
                        />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Description">
                          <textarea
                            value={item.description}
                            onChange={(event) =>
                              updateObjectArrayItem(
                                setForm,
                                "highlightCards",
                                index,
                                "description",
                                event.target.value
                              )
                            }
                            rows={3}
                            className={`${inputClassName} min-h-24`}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <DynamicDetailSectionsEditor form={form} setForm={setForm} />

        <DynamicArraySection
          title="Overview Bullet Points"
          description="Optional short bullets for the summary area."
          items={form.bulletPoints}
          addLabel="Add bullet"
          onAdd={() =>
            setForm((current) => ({
              ...current,
              bulletPoints: [...current.bulletPoints, ""],
            }))
          }
          onChange={(index, value) => updateArrayField(setForm, "bulletPoints", index, value)}
          onRemove={(index) => removeArrayField(setForm, "bulletPoints", index, [""])}
        />

        <DynamicArraySection
          title="Specifications"
          description="Shown in the product page specifications section below the variants table."
          items={form.specifications}
          addLabel="Add specification"
          onAdd={() => appendArrayItem(setForm, "specifications")}
          onChange={(index, value) => updateArrayField(setForm, "specifications", index, value)}
          onRemove={(index) => removeArrayField(setForm, "specifications", index, [""])}
        />

        <DynamicArraySection
          title="Accessories & Spare Parts"
          description="Optional accessory list."
          items={form.accessoriesSpareParts}
          addLabel="Add accessory"
          onAdd={() => appendArrayItem(setForm, "accessoriesSpareParts")}
          onChange={(index, value) =>
            updateArrayField(setForm, "accessoriesSpareParts", index, value)
          }
          onRemove={(index) =>
            removeArrayField(setForm, "accessoriesSpareParts", index, [""])
          }
        />

        <DynamicArraySection
          title="Videos"
          description="Add video URLs."
          items={form.videos}
          addLabel="Add video URL"
          onAdd={() => appendArrayItem(setForm, "videos")}
          onChange={(index, value) => updateArrayField(setForm, "videos", index, value)}
          onRemove={(index) => removeArrayField(setForm, "videos", index, [""])}
        />

        <DynamicDownloadSection
          title="Extra Downloads"
          description="Optional additional downloads beyond brochure and COQ."
          items={form.downloads}
          onAdd={() =>
            setForm((current) => ({
              ...current,
              downloads: [...current.downloads, { name: "", url: "" }],
            }))
          }
          onChange={(index, key, value) =>
            setForm((current) => ({
              ...current,
              downloads: current.downloads.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item
              ),
            }))
          }
          onRemove={(index) =>
            setForm((current) => ({
              ...current,
              downloads:
                current.downloads.length === 1
                  ? [{ name: "", url: "" }]
                  : current.downloads.filter((_, itemIndex) => itemIndex !== index),
            }))
          }
        />

        <DynamicObjectArraySection
          title="Icons / Tags"
          description="Add small icon cards with labels for the summary rail."
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
          description="Optional small labels to surface above the product title."
          items={form.technicalTags}
          addLabel="Add tag"
          onAdd={() => appendArrayItem(setForm, "technicalTags")}
          onChange={(index, value) => updateArrayField(setForm, "technicalTags", index, value)}
          onRemove={(index) => removeArrayField(setForm, "technicalTags", index, [""])}
        />

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
                Comparison Row Values
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Dynamic rows from category columns
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {selectedCategory
                  ? `These values feed the public specification table for ${selectedCategory.name}: ${activeColumns.join(", ")}.`
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
    </div>
  );
}

function DynamicDetailSectionsEditor({ form, setForm }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
            Product Detail Sections
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Build the long-form product area with repeatable subheadings. Each section can be
            either a paragraph or a list of points.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((current) => ({
              ...current,
              detailSections: [...current.detailSections, createEmptyDetailSection()],
            }))
          }
          className={secondaryButtonClassName}
        >
          Add Section
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        {form.detailSections.map((section, index) => (
          <div
            key={`detail-section-${index}`}
            className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Section {index + 1}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveArrayItem(setForm, "detailSections", index, index - 1)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveArrayItem(setForm, "detailSections", index, index + 1)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      detailSections:
                        current.detailSections.length === 1
                          ? [createEmptyDetailSection()]
                          : current.detailSections.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Subheading">
                <input
                  value={section.title}
                  onChange={(event) =>
                    updateObjectArrayItem(setForm, "detailSections", index, "title", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Content Type">
                <select
                  value={section.contentType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      detailSections: current.detailSections.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              contentType: event.target.value,
                              paragraph: event.target.value === "paragraph" ? item.paragraph : "",
                              points: event.target.value === "points" ? item.points : [""],
                            }
                          : item
                      ),
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="points">Points</option>
                </select>
              </Field>
            </div>

            {section.contentType === "paragraph" ? (
              <div className="mt-4">
                <Field label="Paragraph">
                  <textarea
                    value={section.paragraph}
                    onChange={(event) =>
                      updateObjectArrayItem(
                        setForm,
                        "detailSections",
                        index,
                        "paragraph",
                        event.target.value
                      )
                    }
                    rows={5}
                    className={`${inputClassName} min-h-28`}
                  />
                </Field>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {section.points.map((point, pointIndex) => (
                  <div
                    key={`section-point-${index}-${pointIndex}`}
                    className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <input
                      value={point}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          detailSections: current.detailSections.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  points: item.points.map((pointItem, itemPointIndex) =>
                                    itemPointIndex === pointIndex
                                      ? event.target.value
                                      : pointItem
                                  ),
                                }
                              : item
                          ),
                        }))
                      }
                      className={inputClassName}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          detailSections: current.detailSections.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  points:
                                    item.points.length === 1
                                      ? [""]
                                      : item.points.filter(
                                          (_, itemPointIndex) => itemPointIndex !== pointIndex
                                        ),
                                }
                              : item
                          ),
                        }))
                      }
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      detailSections: current.detailSections.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, points: [...item.points, ""] }
                          : item
                      ),
                    }))
                  }
                  className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Add Point
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
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

function DynamicDownloadSection({ title, description, items, onAdd, onChange, onRemove }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">{title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <button type="button" onClick={onAdd} className={secondaryButtonClassName}>
          Add Download
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div
            key={`download-${index}`}
            className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_auto]"
          >
            <input
              value={item.name}
              onChange={(event) => onChange(index, "name", event.target.value)}
              placeholder="Download Name"
              className={inputClassName}
            />
            <input
              value={item.url}
              onChange={(event) => onChange(index, "url", event.target.value)}
              placeholder="Download URL"
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
    galleryImages: [],
    brochureUrl: "",
    coqUrl: "",
    bulletPoints: [""],
    specifications: [""],
    itemsSupplied: [""],
    accessoriesSpareParts: [""],
    videos: [""],
    downloads: [{ name: "", url: "" }],
    icons: [{ label: "", imageUrl: "" }],
    featureCardIds: [],
    highlightCards: [createEmptyHighlightCard()],
    technicalTags: [""],
    detailSections: [createEmptyDetailSection()],
    rows: [{ values: createEmptyRowValues(columns) }],
    isActive: true,
  };
}

function createEmptyDetailSection() {
  return {
    title: "",
    contentType: "paragraph",
    paragraph: "",
    points: [""],
  };
}

function createEmptyHighlightCard() {
  return {
    featureCardId: "",
    title: "",
    description: "",
  };
}

function createFormFromProduct(product) {
  return {
    categoryId: product.categoryId,
    name: product.name || "",
    slug: product.slug || "",
    tableColumns: product.tableColumns?.length
      ? product.tableColumns
      : product.category?.tableColumns || [],
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    imagePublicId: product.imagePublicId || "",
    galleryImages: product.galleryImages?.length ? product.galleryImages : [],
    brochureUrl: product.brochureUrl || "",
    coqUrl: product.coqUrl || "",
    bulletPoints: product.bulletPoints?.length ? product.bulletPoints : [""],
    specifications:
      product.specifications?.length
        ? product.specifications
        : product.itemsSupplied?.length
          ? product.itemsSupplied
          : [""],
    itemsSupplied: product.itemsSupplied?.length ? product.itemsSupplied : [""],
    accessoriesSpareParts: product.accessoriesSpareParts?.length
      ? product.accessoriesSpareParts
      : [""],
    videos: product.videos?.length ? product.videos : [""],
    downloads: normalizeDownloadFormItems(product.downloads),
    icons: product.icons?.length ? product.icons : [{ label: "", imageUrl: "" }],
    featureCardIds: product.featureCards?.map((card) => card._id) || [],
    highlightCards: product.highlightCards?.length
      ? product.highlightCards.map((item) => ({
          featureCardId: item.featureCardId || item.featureCard?._id || "",
          title: item.title || "",
          description: item.description || "",
        }))
      : [createEmptyHighlightCard()],
    technicalTags: product.technicalTags?.length ? product.technicalTags : [""],
    detailSections: product.detailSections?.length
      ? product.detailSections.map((section) => ({
          title: section.title || "",
          contentType: section.contentType || "paragraph",
          paragraph: section.paragraph || "",
          points: section.points?.length ? section.points : [""],
        }))
      : [createEmptyDetailSection()],
    rows: product.rows?.length
      ? product.rows.map((row) => ({
          values: { ...(row.values || {}) },
          sortOrder: row.sortOrder,
          isActive: row.isActive,
        }))
      : [{ values: createEmptyRowValues(product.tableColumns || product.category?.tableColumns || []) }],
    isActive: Boolean(product.isActive),
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

function normalizeDetailSectionForm(detailSections) {
  return detailSections.map((section, index) => ({
    title: section.title,
    contentType: section.contentType,
    paragraph: section.contentType === "paragraph" ? section.paragraph : "",
    points:
      section.contentType === "points"
        ? section.points.filter((item) => String(item || "").trim())
        : [],
    sortOrder: index + 1,
  }));
}

function normalizeHighlightCardsForm(highlightCards) {
  return Array.isArray(highlightCards)
    ? highlightCards.map((item, index) => ({
        featureCardId: item.featureCardId,
        title: item.title,
        description: item.description,
        sortOrder: index + 1,
      }))
    : [];
}

function normalizeDownloadFormItems(downloads) {
  if (!Array.isArray(downloads) || !downloads.length) {
    return [{ name: "", url: "" }];
  }

  return downloads.map((item) => {
    if (typeof item === "string") {
      return { name: "", url: item };
    }

    return {
      name: item?.name || "",
      url: item?.url || "",
    };
  });
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

function appendArrayItem(setForm, key) {
  setForm((current) => ({
    ...current,
    [key]: [...current[key], ""],
  }));
}

function updateArrayField(setForm, key, index, value) {
  setForm((current) => ({
    ...current,
    [key]: current[key].map((item, itemIndex) => (itemIndex === index ? value : item)),
  }));
}

function removeArrayField(setForm, key, index, fallback) {
  setForm((current) => ({
    ...current,
    [key]:
      current[key].length === 1
        ? fallback
        : current[key].filter((_, itemIndex) => itemIndex !== index),
  }));
}

function updateObjectArrayItem(setForm, key, index, field, value) {
  setForm((current) => ({
    ...current,
    [key]: current[key].map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ),
  }));
}

function moveArrayItem(setForm, key, fromIndex, toIndex) {
  setForm((current) => {
    if (toIndex < 0 || toIndex >= current[key].length) {
      return current;
    }

    const reordered = [...current[key]];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    return { ...current, [key]: reordered };
  });
}

function toggleFeatureCard(cardId, setForm) {
  setForm((current) => {
    const exists = current.featureCardIds.includes(cardId);
    return {
      ...current,
      featureCardIds: exists
        ? current.featureCardIds.filter((id) => id !== cardId)
        : [...current.featureCardIds, cardId],
    };
  });
}

const inputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500";

const secondaryButtonClassName =
  "inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700";
