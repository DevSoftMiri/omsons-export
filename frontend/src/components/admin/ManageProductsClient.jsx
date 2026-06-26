"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const emptyForm = {
  externalId: "",
  sku: "",
  name: "",
  slug: "",
  mainCategory: "",
  category: "",
  categories: [],
  page: "",
  mainImage: "",
  galleryImages: [],
  shortDescription: "",
  description: "",
  descriptionHtml: "",
  features: [],
  options: [],
  priceList: [],
  accessories: [],
  spareParts: [],
  advantages: [],
  chartImages: [],
  videos: [],
  reviews: [],
  variants: [],
};

export default function ManageProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: false, error: "", notice: "" });
  const [importState, setImportState] = useState({
    text: "",
    loading: false,
    error: "",
    summary: null,
    errors: [],
  });

  const token = useMemo(() => getCookieValue("admin_token"), []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");

    if (!editId || !products.length) {
      return;
    }

    const matchedProduct = products.find((product) => product._id === editId);

    if (matchedProduct) {
      handleEdit(matchedProduct);
    }
  }, [products, searchParams]);

  async function fetchProducts() {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const response = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data.products || []);
      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        loading: false,
        error: error.message || "Failed to load products",
      }));
    }
  }

  function generateSlug(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function handleNameChange(event) {
    const name = event.target.value;

    setForm((current) => ({
      ...current,
      name,
      slug: generateSlug(name),
    }));
  }

  function addTextItem(field) {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], ""],
    }));
  }

  function updateTextItem(field, index, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function removeTextItem(field, index) {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [...current.options, { title: "", type: "radio", values: [] }],
    }));
  }

  function updateOptionTitle(index, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, title: value } : option
      ),
    }));
  }

  function addOptionValue(optionIndex) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, index) =>
        index === optionIndex ? { ...option, values: [...option.values, ""] } : option
      ),
    }));
  }

  function updateOptionValue(optionIndex, valueIndex, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, index) => {
        if (index !== optionIndex) {
          return option;
        }

        return {
          ...option,
          values: option.values.map((entry, entryIndex) =>
            entryIndex === valueIndex ? value : entry
          ),
        };
      }),
    }));
  }

  function removeOption(index) {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    }));
  }

  function removeOptionValue(optionIndex, valueIndex) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, index) =>
        index === optionIndex
          ? { ...option, values: option.values.filter((_, entryIndex) => entryIndex !== valueIndex) }
          : option
      ),
    }));
  }

  function addPrice() {
    setForm((current) => ({
      ...current,
      priceList: [...current.priceList, { model: "", price: "" }],
    }));
  }

  function updatePrice(index, field, value) {
    setForm((current) => ({
      ...current,
      priceList: current.priceList.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function removePrice(index) {
    setForm((current) => ({
      ...current,
      priceList: current.priceList.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addReview() {
    setForm((current) => ({
      ...current,
      reviews: [...current.reviews, { name: "", rating: 5, comment: "" }],
    }));
  }

  function updateReview(index, field, value) {
    setForm((current) => ({
      ...current,
      reviews: current.reviews.map((review, reviewIndex) =>
        reviewIndex === index ? { ...review, [field]: value } : review
      ),
    }));
  }

  function removeReview(index) {
    setForm((current) => ({
      ...current,
      reviews: current.reviews.filter((_, reviewIndex) => reviewIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "", notice: "" });

    try {
      const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;
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
        throw new Error(data.message || "Failed to save product");
      }

      setForm(emptyForm);
      setEditingId(null);
      setStatus({ loading: false, error: "", notice: editingId ? "Product updated" : "Product added" });
      fetchProducts();
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to save product",
        notice: "",
      });
    }
  }

  async function handleImportSubmit(event) {
    event.preventDefault();
    setImportState((current) => ({
      ...current,
      loading: true,
      error: "",
      summary: null,
      errors: [],
    }));

    try {
      const parsed = JSON.parse(importState.text);

      if (!Array.isArray(parsed)) {
        throw new Error("Import JSON must be an array of products");
      }

      const response = await fetch(`${API_BASE_URL}/products/import-json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: parsed }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Import failed");
      }

      setImportState((current) => ({
        ...current,
        loading: false,
        error: "",
        summary: data.summary,
        errors: data.errors || [],
      }));
      setStatus((current) => ({ ...current, notice: "Products imported successfully" }));
      fetchProducts();
    } catch (error) {
      setImportState((current) => ({
        ...current,
        loading: false,
        error: error.message || "Import failed",
      }));
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    setImportState((current) => ({
      ...current,
      text,
      error: "",
      summary: null,
      errors: [],
    }));
  }

  function handleEdit(product) {
    setEditingId(product._id);
    setForm({
      ...emptyForm,
      ...product,
      galleryImages: product.galleryImages || [],
      categories: product.categories || [],
      features: product.features || [],
      options: product.options || [],
      priceList: product.priceList || [],
      accessories: product.accessories || [],
      spareParts: product.spareParts || [],
      advantages: product.advantages || [],
      chartImages: product.chartImages || [],
      videos: product.videos || [],
      reviews: product.reviews || [],
      variants: product.variants || [],
      page: product.page ?? "",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      setStatus({ loading: false, error: "", notice: "Product deleted" });
      fetchProducts();
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to delete product",
        notice: "",
      });
    }
  }

  return (
    <div style={styles.layout}>
      <section style={styles.panel}>
        <h2 style={styles.sectionTitle}>Import Products from JSON</h2>
        <form onSubmit={handleImportSubmit} style={styles.form}>
          <label style={styles.fileLabel}>
            <span>Upload JSON file</span>
            <input type="file" accept=".json,application/json" onChange={handleFileChange} style={styles.fileInput} />
          </label>

          <textarea
            value={importState.text}
            onChange={(event) =>
              setImportState((current) => ({
                ...current,
                text: event.target.value,
                error: "",
                summary: null,
                errors: [],
              }))
            }
            placeholder="Paste product JSON array here"
            style={styles.importTextarea}
          />

          {importState.error ? <p style={styles.error}>{importState.error}</p> : null}
          {importState.summary ? (
            <div style={styles.summaryCard}>
              <strong>Import Summary</strong>
              <p style={styles.summaryText}>
                Total: {importState.summary.total} | Created: {importState.summary.created} | Updated: {importState.summary.updated} | Skipped: {importState.summary.skipped} | Errors: {importState.summary.errors}
              </p>
              {importState.errors.length ? (
                <ul style={styles.summaryList}>
                  {importState.errors.slice(0, 10).map((entry, index) => (
                    <li key={`${entry.index}-${index}`}>
                      Row {entry.index + 1}: {entry.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <button type="submit" style={styles.primaryButton} disabled={importState.loading}>
            {importState.loading ? "Importing..." : "Import JSON"}
          </button>
        </form>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.sectionTitle}>{editingId ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.subheading}>Basic Details</h3>
          <Input
            value={form.externalId}
            onChange={(event) => setForm((current) => ({ ...current, externalId: event.target.value }))}
            placeholder="External ID"
          />
          <Input
            value={form.sku}
            onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
            placeholder="SKU"
          />
          <Input value={form.name} onChange={handleNameChange} placeholder="Product Name" required />
          <Input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Slug"
            required
          />
          <Input
            value={form.mainCategory}
            onChange={(event) => setForm((current) => ({ ...current, mainCategory: event.target.value }))}
            placeholder="Main Category"
          />
          <Input
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            placeholder="Category Slug"
          />
          <Input
            value={form.mainImage}
            onChange={(event) => setForm((current) => ({ ...current, mainImage: event.target.value }))}
            placeholder="Main Image URL"
          />
          <TextArea
            value={form.shortDescription}
            onChange={(event) =>
              setForm((current) => ({ ...current, shortDescription: event.target.value }))
            }
            placeholder="Short Description"
          />
          <TextArea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Full Description"
          />

          <ArraySection
            title="Gallery Images"
            buttonLabel="Add Gallery Image"
            items={form.galleryImages}
            onAdd={() => addTextItem("galleryImages")}
            onChange={(index, value) => updateTextItem("galleryImages", index, value)}
            onRemove={(index) => removeTextItem("galleryImages", index)}
            placeholder="Image URL"
          />

          <ArraySection
            title="Features"
            buttonLabel="Add Feature"
            items={form.features}
            onAdd={() => addTextItem("features")}
            onChange={(index, value) => updateTextItem("features", index, value)}
            onRemove={(index) => removeTextItem("features", index)}
            placeholder="Feature"
          />

          <section style={styles.group}>
            <div style={styles.groupHeader}>
              <h3 style={styles.subheading}>Product Options / Radio Buttons</h3>
              <button type="button" onClick={addOption} style={styles.secondaryButton}>
                Add Option
              </button>
            </div>

            {form.options.map((option, optionIndex) => (
              <div key={`${optionIndex}-${option.title}`} style={styles.nestedCard}>
                <Input
                  value={option.title}
                  onChange={(event) => updateOptionTitle(optionIndex, event.target.value)}
                  placeholder="Option Title"
                />
                <div style={styles.inlineActions}>
                  <button type="button" onClick={() => addOptionValue(optionIndex)} style={styles.secondaryButton}>
                    Add Value
                  </button>
                  <button type="button" onClick={() => removeOption(optionIndex)} style={styles.ghostButton}>
                    Remove Option
                  </button>
                </div>
                {option.values.map((value, valueIndex) => (
                  <div key={`${valueIndex}-${value}`} style={styles.arrayRow}>
                    <input
                      value={value}
                      onChange={(event) => updateOptionValue(optionIndex, valueIndex, event.target.value)}
                      placeholder="Option Value"
                      style={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => removeOptionValue(optionIndex, valueIndex)}
                      style={styles.ghostButton}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </section>

          <section style={styles.group}>
            <div style={styles.groupHeader}>
              <h3 style={styles.subheading}>Price List</h3>
              <button type="button" onClick={addPrice} style={styles.secondaryButton}>
                Add Price
              </button>
            </div>

            {form.priceList.map((item, index) => (
              <div key={`${index}-${item.model}`} style={styles.priceRow}>
                <input
                  value={item.model}
                  onChange={(event) => updatePrice(index, "model", event.target.value)}
                  placeholder="Model"
                  style={styles.input}
                />
                <input
                  value={item.price}
                  onChange={(event) => updatePrice(index, "price", event.target.value)}
                  placeholder="Price"
                  style={styles.input}
                />
                <button type="button" onClick={() => removePrice(index)} style={styles.ghostButton}>
                  Remove
                </button>
              </div>
            ))}
          </section>

          <ArraySection
            title="Accessories"
            buttonLabel="Add Accessory"
            items={form.accessories}
            onAdd={() => addTextItem("accessories")}
            onChange={(index, value) => updateTextItem("accessories", index, value)}
            onRemove={(index) => removeTextItem("accessories", index)}
            placeholder="Accessory"
          />

          <ArraySection
            title="Spare Parts"
            buttonLabel="Add Spare Part"
            items={form.spareParts}
            onAdd={() => addTextItem("spareParts")}
            onChange={(index, value) => updateTextItem("spareParts", index, value)}
            onRemove={(index) => removeTextItem("spareParts", index)}
            placeholder="Spare Part"
          />

          <ArraySection
            title="Advantages"
            buttonLabel="Add Advantage"
            items={form.advantages}
            onAdd={() => addTextItem("advantages")}
            onChange={(index, value) => updateTextItem("advantages", index, value)}
            onRemove={(index) => removeTextItem("advantages", index)}
            placeholder="Advantage"
          />

          <ArraySection
            title="Chart Images"
            buttonLabel="Add Chart Image"
            items={form.chartImages}
            onAdd={() => addTextItem("chartImages")}
            onChange={(index, value) => updateTextItem("chartImages", index, value)}
            onRemove={(index) => removeTextItem("chartImages", index)}
            placeholder="Chart Image URL"
          />

          <ArraySection
            title="Videos"
            buttonLabel="Add Video"
            items={form.videos}
            onAdd={() => addTextItem("videos")}
            onChange={(index, value) => updateTextItem("videos", index, value)}
            onRemove={(index) => removeTextItem("videos", index)}
            placeholder="YouTube Video URL"
          />

          <section style={styles.group}>
            <div style={styles.groupHeader}>
              <h3 style={styles.subheading}>Customer Reviews</h3>
              <button type="button" onClick={addReview} style={styles.secondaryButton}>
                Add Review
              </button>
            </div>

            {form.reviews.map((review, index) => (
              <div key={`${index}-${review.name}`} style={styles.nestedCard}>
                <Input
                  value={review.name}
                  onChange={(event) => updateReview(index, "name", event.target.value)}
                  placeholder="Customer Name"
                />
                <Input
                  type="number"
                  value={review.rating}
                  onChange={(event) => updateReview(index, "rating", Number(event.target.value))}
                  placeholder="Rating"
                />
                <TextArea
                  value={review.comment}
                  onChange={(event) => updateReview(index, "comment", event.target.value)}
                  placeholder="Review Comment"
                />
                <button type="button" onClick={() => removeReview(index)} style={styles.ghostButton}>
                  Remove Review
                </button>
              </div>
            ))}
          </section>

          {status.error ? <p style={styles.error}>{status.error}</p> : null}
          {status.notice ? <p style={styles.notice}>{status.notice}</p> : null}

          <div style={styles.inlineActions}>
            <button type="submit" style={styles.primaryButton} disabled={status.loading}>
              {status.loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId ? (
              <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }} style={styles.ghostButton}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

    </div>
  );
}

function ArraySection({
  title,
  buttonLabel,
  items,
  onAdd,
  onChange,
  onRemove,
  placeholder,
}) {
  return (
    <section style={styles.group}>
      <div style={styles.groupHeader}>
        <h3 style={styles.subheading}>{title}</h3>
        <button type="button" onClick={onAdd} style={styles.secondaryButton}>
          {buttonLabel}
        </button>
      </div>
      {items.map((item, index) => (
        <div key={`${title}-${index}`} style={styles.arrayRow}>
          <input
            value={item}
            onChange={(event) => onChange(index, event.target.value)}
            placeholder={placeholder}
            style={styles.input}
          />
          <button type="button" onClick={() => onRemove(index)} style={styles.ghostButton}>
            Remove
          </button>
        </div>
      ))}
    </section>
  );
}

function Input(props) {
  return <input {...props} style={styles.input} />;
}

function TextArea(props) {
  return <textarea {...props} style={styles.textarea} />;
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
  form: {
    display: "grid",
    gap: "1rem",
  },
  sectionTitle: {
    margin: 0,
    color: "#0f172a",
  },
  subheading: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1rem",
  },
  group: {
    display: "grid",
    gap: "0.75rem",
  },
  groupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  input: {
    width: "100%",
    padding: "0.8rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
  },
  textarea: {
    width: "100%",
    minHeight: "7rem",
    padding: "0.8rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
    resize: "vertical",
  },
  fileLabel: {
    display: "grid",
    gap: "0.4rem",
    color: "#334155",
  },
  fileInput: {
    width: "fit-content",
  },
  importTextarea: {
    width: "100%",
    minHeight: "16rem",
    padding: "0.8rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
    resize: "vertical",
    fontFamily: "var(--font-mono), monospace",
    fontSize: "0.9rem",
  },
  summaryCard: {
    display: "grid",
    gap: "0.5rem",
    padding: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1fae5",
    background: "#ecfdf5",
  },
  summaryText: {
    margin: 0,
    color: "#166534",
  },
  summaryList: {
    margin: 0,
    paddingLeft: "1.2rem",
    color: "#166534",
  },
  nestedCard: {
    display: "grid",
    gap: "0.75rem",
    padding: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  arrayRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "0.75rem",
    alignItems: "center",
  },
  priceRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "0.75rem",
    alignItems: "center",
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
  error: {
    margin: 0,
    color: "#b91c1c",
  },
  notice: {
    margin: 0,
    color: "#166534",
  },
};
