"use client";

import { useMemo, useState } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState(activeCategorySlug || "all");
  const [page, setPage] = useState(1);

  const categoryOptions = useMemo(() => {
    const counts = products.reduce((map, product) => {
      const slug = product.category?.slug || "uncategorized";
      map.set(slug, (map.get(slug) || 0) + 1);
      return map;
    }, new Map());

    const normalized = categories
      .map((category) => ({
        slug: category.slug,
        label: category.name,
        count: counts.get(category.slug) || 0,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));

    return [{ slug: "all", label: "All Products", count: products.length }, ...normalized];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter((product) => product.category?.slug === selectedCategory);
    }

    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      result = result.filter((product) => {
        const haystacks = [
          product.name,
          product.slug,
          product.description,
          product.category?.name,
          ...(product.bulletPoints || []),
          ...(product.technicalTags || []),
          ...(product.rows || []).flatMap((row) => Object.values(row.values || {})),
        ];

        return haystacks.some((value) =>
          String(value || "").toLowerCase().includes(normalizedQuery)
        );
      });
    }

    return result;
  }, [products, query, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  function handleCategory(slug) {
    setSelectedCategory(slug);
    setPage(1);
  }

  function handleQuery(event) {
    setQuery(event.target.value);
    setPage(1);
  }

  const activeCategoryLabel =
    categoryOptions.find((item) => item.slug === selectedCategory)?.label || title;
  const startIndex = filteredProducts.length ? (safePage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endIndex = filteredProducts.length
    ? Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href={appRoutes.home}>Home</Link>
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
            placeholder="Search by name, slug or category..."
          />
        </div>
      </section>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.group}>
            <h2 className={styles.groupTitle}>Availability</h2>
            <label className={styles.checkbox}>
              <input type="checkbox" disabled />
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
              {startIndex}-{endIndex} of{" "}
              {filteredProducts.length.toLocaleString()} products
            </span>
          </div>

          {pagedProducts.length ? (
            <div className={styles.grid}>
              {pagedProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No products match the selected category.</div>
          )}

          {totalPages > 1 ? (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>
                Page {safePage} of {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Next →
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
