"use client";

import { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const defaultStatus = { loading: false, error: "", notice: "" };

export default function ManageFeatureCardsClient() {
  const token = useMemo(() => getCookieValue("admin_token"), []);
  const [featureCards, setFeatureCards] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(createEmptyForm());
  const [status, setStatus] = useState(defaultStatus);
  const [uploadState, setUploadState] = useState({
    loading: false,
    error: "",
    name: "",
    uploadedUrl: "",
  });

  const loadFeatureCards = useCallback(async () => {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const response = await fetch(`${API_BASE_URL}/feature-cards/admin/list`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load feature cards");
      }

      setFeatureCards(data.featureCards || []);
      setStatus((current) => ({ ...current, loading: false }));
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to load feature cards",
        notice: "",
      });
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFeatureCards();
  }, [loadFeatureCards]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(
        editingId ? `${API_BASE_URL}/feature-cards/${editingId}` : `${API_BASE_URL}/feature-cards`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save feature card");
      }

      await loadFeatureCards();
      resetForm();
      setStatus({
        loading: false,
        error: "",
        notice: editingId ? "Feature card updated" : "Feature card created",
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to save feature card",
        notice: "",
      });
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadState({ loading: true, error: "", name: file.name });

    try {
      const payload = new FormData();
      payload.append("image", file);
      if (form.imagePublicId) {
        payload.append("previousPublicId", form.imagePublicId);
      }

      const response = await fetch(`${API_BASE_URL}/feature-cards/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload feature card image");
      }

      setForm((current) => ({
        ...current,
        imageUrl: data.imageUrl || "",
        imagePublicId: data.imagePublicId || "",
      }));
      setUploadState({
        loading: false,
        error: "",
        name: file.name,
        uploadedUrl: data.imageUrl || "",
      });
    } catch (error) {
      setUploadState({
        loading: false,
        error: error.message || "Failed to upload feature card image",
        name: file.name,
        uploadedUrl: "",
      });
    } finally {
      event.target.value = "";
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this feature card?")) {
      return;
    }

    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/feature-cards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete feature card");
      }

      if (editingId === id) {
        resetForm();
      }

      await loadFeatureCards();
      setStatus({ loading: false, error: "", notice: "Feature card deleted" });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to delete feature card",
        notice: "",
      });
    }
  }

  function handleEdit(card) {
    setEditingId(card._id);
    setForm({
      name: card.name || "",
      imageUrl: card.imageUrl || "",
      imagePublicId: card.imagePublicId || "",
      isActive: Boolean(card.isActive),
    });
    setUploadState({
      loading: false,
      error: "",
      name: "",
      uploadedUrl: card.imageUrl || "",
    });
  }

  function resetForm() {
    setEditingId("");
    setForm(createEmptyForm());
    setUploadState({ loading: false, error: "", name: "", uploadedUrl: "" });
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
              Reusable Product Cards
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">Feature card library</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Create reusable cards with a name and image, then attach them to any product page.
            </p>
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

      <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Card Name">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className={inputClassName}
              required
            />
          </Field>

          <Field label="Card Image">
            <div className="grid gap-3">
              <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="sr-only"
                  disabled={uploadState.loading}
                />
                {uploadState.loading ? "Uploading..." : "Upload Image"}
              </label>
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
                placeholder="Or paste hosted image URL"
                className={inputClassName}
              />
              {uploadState.error ? (
                <p className="text-sm text-red-600">{uploadState.error}</p>
              ) : null}
              {uploadState.name && !uploadState.error ? (
                <p className="text-xs text-emerald-700">
                  Uploaded to Cloudinary: {uploadState.name}
                </p>
              ) : null}
              {form.imageUrl ? (
                <p className="break-all text-xs text-slate-500">{form.imageUrl}</p>
              ) : null}
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt={form.name || "Feature card preview"}
                  className="h-28 w-28 rounded-2xl border border-slate-200 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
            </div>
          </Field>
        </div>

        <label className="mt-6 flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
          />
          Feature card is active
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={status.loading || uploadState.loading}
            className="inline-flex items-center rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white"
          >
            {uploadState.loading
              ? "Waiting For Upload..."
              : status.loading
                ? "Saving..."
                : editingId
                  ? "Update Card"
                  : "Create Card"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Clear Form
          </button>
        </div>
      </form>

      <section className="grid gap-4">
        {status.loading && !featureCards.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading feature cards...
          </div>
        ) : null}

        {featureCards.map((card) => (
          <article
            key={card._id}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No image</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{card.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {card.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(card)}
                  className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(card._id)}
                  className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
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

function createEmptyForm() {
  return {
    name: "",
    imageUrl: "",
    imagePublicId: "",
    isActive: true,
  };
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
