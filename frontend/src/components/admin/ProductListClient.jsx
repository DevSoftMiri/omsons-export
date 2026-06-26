"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appRoutes } from "@/lib/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function ProductListClient() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });

  const filteredProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }

    const query = search.toLowerCase();
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.slug?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query)
    );
  }, [products, search]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setStatus({ loading: true, error: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data.products || []);
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Failed to load products" });
    }
  }

  return (
    <div className="grid gap-6">
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, slug or category"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
            />
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {filteredProducts.length} products
          </span>
        </div>

        {status.error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {status.error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4">
        {status.loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading products...
          </div>
        ) : null}

        {!status.loading && !filteredProducts.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            No products found.
          </div>
        ) : null}

        {filteredProducts.map((product) => (
          <article
            key={product._id}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                <img
                  src={product.imageUrl || "/omsons-logo.jpg"}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                    {product.category?.name || "Category"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {product.rows?.length || 0} rows
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{product.slug}</p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {product.description || product.bulletPoints?.[0] || "No description available."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`${appRoutes.adminProducts}?edit=${product._id}&categoryId=${product.categoryId}`}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Edit
                </Link>
                <Link
                  href={appRoutes.product(product.slug)}
                  className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  View Detail
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
