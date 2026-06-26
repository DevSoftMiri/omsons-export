"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import ProductCard from "./ProductCard";
import styles from "./ProductCatalogClient.module.css";

const ITEMS_PER_PAGE = 16;

export default function ProductCatalogClient({
  products = [],
  categories = [],
  title = "All Products",
  description = "",
  activeCategorySlug = "all",
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState(activeCategorySlug || "all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const resetPage = useCallback(() => setPage(1), []);

  const handleQuery = (e) => { setQuery(e.target.value); resetPage(); };
  const handleSort = (e) => { setSort(e.target.value); resetPage(); };
  const handleCategory = (slug) => { setSelectedCategory(slug); resetPage(); };
  const handleInStock = (e) => { setInStockOnly(e.target.checked); resetPage(); };

  const categoryOptions = useMemo(() => {
    const counts = products.reduce((map, product) => {
      const slug = product.category || "uncategorized";
      map.set(slug, (map.get(slug) || 0) + 1);
      return map;
    }, new Map());

    const normalized = categories.map((category) => ({
      slug: category.slug,
      label: category.name,
      count: counts.get(category.slug) || 0,
    }));

    for (const [slug, count] of counts.entries()) {
      if (!normalized.some((item) => item.slug === slug)) {
        normalized.push({ slug, label: toTitleCase(slug), count });
      }
    }

    normalized.sort((left, right) => left.label.localeCompare(right.label));

    return [{ slug: "all", label: "All Products", count: products.length }, ...normalized];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter((product) => (product.category || "uncategorized") === selectedCategory);
    }

    if (inStockOnly) {
      result = result.filter((product) => hasInStockVariant(product));
    }

    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      result = result.filter((product) => {
        const haystacks = [
          product.name,
          product.sku,
          product.category,
          product.mainCategory,
          product.shortDescription,
          ...(product.variants || []).flatMap((variant) => [
            variant.name,
            variant.sku,
            variant.specsText,
            ...Object.values(variant.specs || {}),
          ]),
        ];
        return haystacks.some((value) =>
          String(value || "").toLowerCase().includes(normalizedQuery)
        );
      });
    }

    if (sort === "name-asc") {
      result.sort((left, right) => left.name.localeCompare(right.name));
    } else if (sort === "variants-desc") {
      result.sort((left, right) => (right.variants?.length || 0) - (left.variants?.length || 0));
    }

    return result;
  }, [inStockOnly, products, query, selectedCategory, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const activeCategoryLabel =
    categoryOptions.find((item) => item.slug === selectedCategory)?.label || title;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href={appRoutes.home}>Home</Link>
        <span>/</span>
        <Link href={appRoutes.products}>Categories</Link>
        <span>/</span>
        <span>{activeCategoryLabel}</span>
      </div>

      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Product Catalogue</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            {description || `${filteredProducts.length.toLocaleString()} products available.`}
          </p>
        </div>

        <div className={styles.toolbar}>
          <input
            className={styles.search}
            value={query}
            onChange={handleQuery}
            placeholder="Search by name, SKU, category..."
          />
          <select
            className={styles.sort}
            value={sort}
            onChange={handleSort}
          >
            <option value="default">Default</option>
            <option value="name-asc">Name A–Z</option>
            <option value="variants-desc">Most Variants</option>
          </select>
        </div>
      </section>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.group}>
            <h2 className={styles.groupTitle}>Availability</h2>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={handleInStock}
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <div className={styles.group}>
            <h2 className={styles.groupTitle}>Categories</h2>
            <div className={styles.categoryScroller}>
              {categoryOptions.map((category) => {
                const isActive = category.slug === selectedCategory;
                return (
                  <button
                    key={category.slug}
                    type="button"
                    className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ""}`}
                    onClick={() => handleCategory(category.slug)}
                  >
                    <span className={styles.indicator} />
                    <span>{category.label}</span>
                    <span className={styles.count}>({category.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className={styles.results}>
          <div className={styles.resultsBar}>
            <span>
              {filteredProducts.length.toLocaleString()} product{filteredProducts.length !== 1 ? "s" : ""} found
              {filteredProducts.length > ITEMS_PER_PAGE && ` · showing ${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)}`}
            </span>
            <span>Data loaded from backend</span>
          </div>

          {pagedProducts.length ? (
            <div className={styles.grid}>
              {pagedProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              No products match the selected filters.
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {safePage} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function hasInStockVariant(product) {
  if (!product.variants?.length) return false;
  return product.variants.some((variant) => variant.inStock);
}

function toTitleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}