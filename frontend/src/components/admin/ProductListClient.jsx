"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes } from "@/lib/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const PAGE_SIZE = 24;

export default function ProductListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialPage = normalizePageParam(searchParams.get("page"));

  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [status, setStatus] = useState({ loading: false, error: "", notice: "" });
  const token = useMemo(() => getCookieValue("admin_token"), []);

  const categoryOptions = useMemo(() => {
    const totalProducts = categoryFilters.reduce((sum, item) => sum + item.count, 0);

    return [
      { slug: "all", label: "All Products", count: totalProducts },
      ...categoryFilters,
    ];
  }, [categoryFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPagination((current) => ({ ...current, page: 1 }));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const nextSearch = searchParams.get("search") || "";
    const nextCategory = searchParams.get("category") || "all";
    const nextPage = normalizePageParam(searchParams.get("page"));

    setSearchInput((current) => (current === nextSearch ? current : nextSearch));
    setSearchQuery((current) => (current === nextSearch ? current : nextSearch));
    setSelectedCategory((current) => (current === nextCategory ? current : nextCategory));
    setPagination((current) =>
      current.page === nextPage ? current : { ...current, page: nextPage }
    );
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    if (pagination.page > 1) {
      params.set("page", String(pagination.page));
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(
        `${appRoutes.adminProductList}${nextQuery ? `?${nextQuery}` : ""}`,
        { scroll: false }
      );
    }
  }, [router, searchParams, searchQuery, selectedCategory, pagination.page]);

  useEffect(() => {
    if (!token) {
      setStatus({
        loading: false,
        error: "Admin session missing. Please log in again.",
        notice: "",
      });
      return;
    }

    loadProducts();
  }, [token, pagination.page, searchQuery, selectedCategory]);

  async function loadProducts() {
    setStatus((current) => ({ ...current, loading: true, error: "" }));

    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(PAGE_SIZE),
      });

      if (searchQuery) {
        params.set("search", searchQuery);
      }

      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }

      const response = await fetch(`${API_BASE_URL}/products/admin/list?${params.toString()}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data.products || []);
      setCategoryFilters(data.filters || []);
      setPagination((current) => ({
        ...current,
        page: data.pagination?.page || 1,
        pageSize: data.pagination?.pageSize || PAGE_SIZE,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
      }));
      setStatus((current) => ({ ...current, loading: false, error: "" }));
    } catch (error) {
      setStatus((current) => ({
        ...current,
        loading: false,
        error: error.message || "Failed to load products",
      }));
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}" from the catalogue?`)) {
      return;
    }

    setStatus({ loading: true, error: "", notice: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/products/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      const isOnlyProductOnPage = products.length === 1 && pagination.page > 1;

      if (isOnlyProductOnPage) {
        setPagination((current) => ({ ...current, page: current.page - 1 }));
      } else {
        await loadProducts();
      }

      setStatus({
        loading: false,
        error: "",
        notice: `${product.name} deleted successfully.`,
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to delete product",
        notice: "",
      });
    }
  }

  function handleCategorySelect(categorySlug) {
    setSelectedCategory(categorySlug);
    setPagination((current) => ({ ...current, page: 1 }));
  }

  function handlePageChange(nextPage) {
    setPagination((current) => ({ ...current, page: nextPage }));
  }

  const pageStart = pagination.total ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const pageEnd = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="grid w-full gap-6">
      <style>{`
        .product-list-category-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #e2e8f0;
        }

        .product-list-category-scroll::-webkit-scrollbar {
          height: 10px;
        }

        .product-list-category-scroll::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 999px;
        }

        .product-list-category-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 999px;
          border: 2px solid #e2e8f0;
        }

        .product-list-category-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
              Catalogue Products
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">All saved products</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Browse every product created under the main categories and jump back into editing
              when needed.
            </p>
          </div>

          <Link
            href={appRoutes.adminProducts}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Add Product
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by product, slug or category"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
            />
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {pagination.total} products
          </span>
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

      <section className="min-w-0 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f6fd_100%)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Filter By Category
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Scroll inside this strip to browse all catalogue groups.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
            {categoryOptions.length} filters
          </span>
        </div>

        <div className="product-list-category-scroll min-w-0 w-full max-w-full overflow-x-auto overscroll-x-contain pb-2">
          <div className="flex min-w-max flex-nowrap gap-3 pr-2">
            {categoryOptions.map((category) => {
              const isActive = category.slug === selectedCategory;

              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => handleCategorySelect(category.slug)}
                  className={`inline-flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-sky-700 bg-sky-700 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <span>{category.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {status.loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading products...
          </div>
        ) : null}

        {!status.loading && !products.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            No products found.
          </div>
        ) : null}

        {!status.loading
          ? products.map((product) => (
              <article
                key={product._id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex min-w-0 flex-col gap-5">
                  <div className="flex gap-5">
                    <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                      <img
                        src={getAdminProductImage(product)}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                            {product.category?.name || "Category"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                            {product.rowCount || 0} rows
                          </span>
                        </div>
                        <h3 className="mt-3 break-words text-2xl font-semibold text-slate-900">
                          {product.name}
                        </h3>
                        <p className="mt-2 break-all text-sm text-slate-500">{product.slug}</p>
                      </div>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {product.description || product.bulletPoints?.[0] || "No description available."}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                        <Link
                          href={`${appRoutes.adminProducts}?edit=${product._id}&categoryId=${product.categoryId}`}
                          className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Edit
                        </Link>
                        <Link
                          href={appRoutes.product(product.slug)}
                          className="inline-flex min-w-[130px] items-center justify-center rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold !text-white"
                        >
                          View Detail
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {pageStart} to {pageEnd} of {pagination.total} products
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || status.loading}
              className="inline-flex min-w-[96px] items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || status.loading}
              className="inline-flex min-w-[96px] items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
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

function getAdminProductImage(product) {
  const galleryImages = Array.isArray(product.galleryImages)
    ? product.galleryImages.filter((image) => String(image || "").trim())
    : [];
  const preferredImage = galleryImages[0] || "";

  return product.imageUrl || preferredImage || "/omsons-logo.jpg";
}

function normalizePageParam(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
