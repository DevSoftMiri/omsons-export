"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { appRoutes } from "@/lib/routes";
import ProductCard from "./ProductCard";
import styles from "./ProductCatalogClient.module.css";

const PAGE_SIZE_OPTIONS = [16, 24, 32, 48, 64];
const MAX_COMPARISON_PRODUCTS = 4;
const COMPARISON_CATEGORY_SLUG = "filters-membrane";

export default function ProductCatalogClient({
  products = [],
  categories = [],
  title = "All Products",
  description = "",
  activeCategorySlug = "all",
  showComparison = true,
  comparisonCategorySlug = COMPARISON_CATEGORY_SLUG,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultCategory = activeCategorySlug || "all";
  const initialQuery = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || defaultCategory;
  const initialPage = normalizePageParam(searchParams.get("page"));
  const initialLimit = normalizeLimitParam(searchParams.get("limit"));

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );
  const showComparisonPanel =
    showComparison && selectedCategory === comparisonCategorySlug;
  const comparisonModel = useMemo(
    () => (showComparisonPanel ? buildComparisonModel(filteredProducts) : null),
    [filteredProducts, showComparisonPanel]
  );
  const comparisonRows = useMemo(() => {
    if (!comparisonModel) {
      return [];
    }

    return showDifferencesOnly
      ? comparisonModel.rows.filter((row) => row.isDifferent)
      : comparisonModel.rows;
  }, [comparisonModel, showDifferencesOnly]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("search", query.trim());
    }

    if (selectedCategory !== defaultCategory) {
      params.set("category", selectedCategory);
    }

    if (safePage > 1) {
      params.set("page", String(safePage));
    }

    if (itemsPerPage !== PAGE_SIZE_OPTIONS[0]) {
      params.set("limit", String(itemsPerPage));
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, {
        scroll: false,
      });
    }
  }, [
    router,
    pathname,
    searchParams,
    query,
    selectedCategory,
    safePage,
    defaultCategory,
    itemsPerPage,
  ]);

  function handleCategory(slug) {
    startTransition(() => {
      setSelectedCategory(slug);
      setPage(1);
      setIsFilterDrawerOpen(false);
    });
  }

  function handleQuery(event) {
    const value = event.target.value;

    startTransition(() => {
      setQuery(value);
      setPage(1);
    });
  }

  function handleItemsPerPageChange(event) {
    const nextLimit = normalizeLimitParam(event.target.value);

    startTransition(() => {
      setItemsPerPage(nextLimit);
      setPage(1);
    });
  }

  function resetFilters() {
    startTransition(() => {
      setQuery("");
      setSelectedCategory(defaultCategory);
      setPage(1);
      setItemsPerPage(PAGE_SIZE_OPTIONS[0]);
      setShowDifferencesOnly(false);
      setIsFilterDrawerOpen(false);
    });
  }

  const activeCategoryLabel =
    categoryOptions.find((item) => item.slug === selectedCategory)?.label || title;
  const startIndex = filteredProducts.length ? (safePage - 1) * itemsPerPage + 1 : 0;
  const endIndex = filteredProducts.length
    ? Math.min(safePage * itemsPerPage, filteredProducts.length)
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
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setIsFilterDrawerOpen(true)}
          >
            Open Filters
          </button>
          <input
            className={styles.search}
            value={query}
            onChange={handleQuery}
            placeholder="Search by name, slug or category..."
          />
        </div>
      </section>

      <section className={styles.layout}>
        <div className={styles.sidebarColumn}>
          <aside
            className={`${styles.sidebar} ${isFilterDrawerOpen ? styles.sidebarOpen : ""}`}
            aria-label="Product filters"
          >
            <div className={styles.sidebarHeader}>
              <div>
                <p className={styles.groupTitle}>Filters</p>
                <h2 className={styles.sidebarTitle}>Refine Products</h2>
              </div>
              <button
                type="button"
                className={styles.sidebarClose}
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                Close
              </button>
            </div>

            <div className={styles.group}>
              <h2 className={styles.groupTitle}>Availability</h2>
              <label className={styles.checkbox}>
                <input type="checkbox" disabled />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h2 className={styles.groupTitle}>Categories</h2>
                <span className={styles.groupCount}>{categoryOptions.length}</span>
              </div>
              <div className={styles.categoryScroller}>
                {categoryOptions.map((category) => {
                  const isActive = category.slug === selectedCategory;

                  return (
                    <button
                      key={category.slug}
                      type="button"
                      className={`${styles.categoryButton} ${
                        isActive ? styles.categoryButtonActive : ""
                      }`}
                      onClick={() => handleCategory(category.slug)}
                    >
                      <span className={styles.indicator} />
                      <span className={styles.categoryLabel}>{category.label}</span>
                      <span className={styles.count}>{category.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" className={styles.resetButton} onClick={resetFilters}>
              Reset Filters
            </button>
          </aside>
        </div>

        {isFilterDrawerOpen ? (
          <button
            type="button"
            className={styles.sidebarBackdrop}
            aria-label="Close filters"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
        ) : null}

        <div className={styles.results}>
          {showComparisonPanel ? (
            <section className={styles.comparisonCard} aria-label="Product comparison">
            <div className={styles.comparisonHeader}>
              <div>
                <p className={styles.comparisonEyebrow}>Comparison</p>
                <h2 className={styles.comparisonTitle}>Similar Products</h2>
                <p className={styles.comparisonDescription}>
                  Compare the products in your current filter set. The Difference button hides
                  matching rows so only the changes stay visible.
                </p>
              </div>

              <div className={styles.comparisonActions}>
                {comparisonModel ? (
                  <span className={styles.comparisonBadge}>
                    {comparisonModel.products.length} products
                  </span>
                ) : null}
                <button
                  type="button"
                  className={`${styles.differenceButton} ${
                    showDifferencesOnly ? styles.differenceButtonActive : ""
                  }`}
                  onClick={() => setShowDifferencesOnly((current) => !current)}
                  disabled={!comparisonModel || !comparisonModel.hasDifferences}
                  aria-pressed={showDifferencesOnly}
                >
                  Difference
                </button>
              </div>
            </div>

            {comparisonModel ? (
              comparisonRows.length ? (
                <>
                  <div className={styles.comparisonTableWrap}>
                    <table className={styles.comparisonTable}>
                      <thead>
                        <tr>
                          <th scope="col">Specification</th>
                          {comparisonModel.products.map((product) => (
                            <th key={product._id} scope="col" className={styles.comparisonProductHead}>
                              <div className={styles.comparisonProductCard}>
                                <img
                                  src={getProductCardImage(product)}
                                  alt={product.name}
                                  className={styles.comparisonProductImage}
                                />
                                <div className={styles.comparisonProductText}>
                                  <span className={styles.comparisonProductName}>{product.name}</span>
                                  <span className={styles.comparisonProductMeta}>
                                    {product.category?.name || "Product"}
                                  </span>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((row) => (
                          <tr
                            key={row.label}
                            className={row.isDifferent ? styles.comparisonRowDifferent : ""}
                          >
                            <th scope="row">{row.label}</th>
                            {row.values.map((value, index) => (
                              <td key={`${row.label}-${index}`}>{value || "—"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {comparisonModel.truncated ? (
                    <p className={styles.comparisonFootnote}>
                      Showing the first {MAX_COMPARISON_PRODUCTS} comparable products from the
                      current filter set.
                    </p>
                  ) : null}
                </>
              ) : (
                <div className={styles.comparisonEmpty}>
                  {showDifferencesOnly
                    ? "No differing rows were found for this comparison set."
                    : "No comparison rows are available yet."}
                </div>
              )
            ) : (
              <div className={styles.comparisonEmpty}>
                Add at least two products with the same table structure to compare them here.
              </div>
            )}
            </section>
          ) : null}

          <div className={styles.resultsBar}>
            <div className={styles.resultsSummary}>
              <strong>{filteredProducts.length.toLocaleString()}</strong>
              <span>
                products
                {filteredProducts.length ? ` - Showing ${startIndex}-${endIndex}` : ""}
              </span>
            </div>

            <div className={styles.resultsControls}>
              <div className={styles.loadingState} aria-live="polite">
                {isPending ? "Updating catalogue..." : ""}
              </div>
              <label className={styles.limitControl}>
                <span>Products per page</span>
                <select
                  className={styles.limitSelect}
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {pagedProducts.length ? (
            <div className={styles.grid}>
              {pagedProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>0</div>
              <h3>No products match the current filters.</h3>
              <p>Try clearing the search, selecting another category, or resetting the filters.</p>
              <button type="button" className={styles.emptyAction} onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          )}

          {totalPages > 1 ? (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={safePage === 1}
                onClick={() =>
                  startTransition(() => {
                    setPage(safePage - 1);
                  })
                }
              >
                Prev
              </button>
              <div className={styles.pageInfo}>
                <strong>{safePage}</strong>
                <span>{`of ${totalPages}`}</span>
              </div>
              <button
                className={styles.pageBtn}
                disabled={safePage === totalPages}
                onClick={() =>
                  startTransition(() => {
                    setPage(safePage + 1);
                  })
                }
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function normalizePageParam(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeLimitParam(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : PAGE_SIZE_OPTIONS[0];
}

function buildComparisonModel(products) {
  const groups = new Map();

  products.forEach((product) => {
    const columns = normalizeColumns(product.tableColumns || product.category?.tableColumns || []);
    const primaryRow = getPrimaryComparisonRow(product.rows || [], columns);

    if (!columns.length || !primaryRow) {
      return;
    }

    const key = columns.join("||");
    const group = groups.get(key) || {
      key,
      columns,
      products: [],
    };

    group.products.push({
      ...product,
      primaryRow,
    });
    groups.set(key, group);
  });

  let bestGroup = null;

  for (const group of groups.values()) {
    if (!bestGroup || group.products.length > bestGroup.products.length) {
      bestGroup = group;
    }
  }

  if (!bestGroup || bestGroup.products.length < 2) {
    return null;
  }

  const comparisonProducts = bestGroup.products.slice(0, MAX_COMPARISON_PRODUCTS);
  const rows = bestGroup.columns.map((label) => {
    const values = comparisonProducts.map((product) =>
      normalizeComparisonValue(product.primaryRow?.values?.[label])
    );

    return {
      label,
      values,
      isDifferent: hasComparisonDifference(values),
    };
  });

  return {
    key: bestGroup.key,
    columns: bestGroup.columns,
    products: comparisonProducts,
    rows,
    hasDifferences: rows.some((row) => row.isDifferent),
    truncated: bestGroup.products.length > MAX_COMPARISON_PRODUCTS,
  };
}

function getPrimaryComparisonRow(rows, columns) {
  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  const filledRow = rows.find((row) =>
    columns.some((column) => String(row?.values?.[column] || "").trim())
  );

  return filledRow || rows[0] || null;
}

function normalizeColumns(columns) {
  return Array.isArray(columns)
    ? [...new Set(columns.map((column) => String(column || "").trim()).filter(Boolean))]
    : [];
}

function normalizeComparisonValue(value) {
  return String(value || "").trim();
}

function hasComparisonDifference(values) {
  const normalizedValues = values.map((value) => String(value || "").trim());
  return new Set(normalizedValues).size > 1;
}

function getProductCardImage(product) {
  const galleryImages = Array.isArray(product.galleryImages)
    ? product.galleryImages.filter((image) => String(image || "").trim())
    : [];

  return product.imageUrl || galleryImages[0] || "/omsons-logo.jpg";
}
