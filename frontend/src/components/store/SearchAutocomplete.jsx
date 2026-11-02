"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { appRoutes } from "@/lib/routes";
import styles from "./SearchAutocomplete.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function SearchAutocomplete({ shellClassName, selectClassName, inputClassName, buttonClassName }) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2 || searchType === "categories") {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(value)}&limit=12`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!controller.signal.aborted) {
          setResults(Array.isArray(data?.products) ? data.products : []);
          setOpen(true);
        }
      } catch (error) {
        if (error.name !== "AbortError") setResults([]);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query, searchType]);

  return (
    <div className={styles.wrapper} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <form className={shellClassName} action={appRoutes.products} method="get" onSubmit={() => setOpen(false)}>
        <select className={selectClassName} name="searchType" value={searchType} onChange={(event) => { setSearchType(event.target.value); setResults([]); setOpen(false); }} aria-label="Search in">
          <option value="all">All</option>
          <option value="products">Products</option>
          <option value="categories">Categories</option>
        </select>
        <input className={inputClassName} name="search" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(event.target.value.trim().length >= 2); }} onFocus={() => query.trim().length >= 2 && setOpen(true)} placeholder="Search by name, SKU, category, or specs..." aria-label="Search products and categories" autoComplete="off" />
        <button type="submit" className={buttonClassName} aria-label="Search">🔎</button>
      </form>
      {open && searchType !== "categories" ? (
        <div className={styles.dropdown} role="listbox">
          {results.length ? results.map((product) => (
            <Link key={product.slug} href={appRoutes.product(product.slug)} className={styles.result} onClick={() => setOpen(false)}>
              <span className={styles.imageWrap}><img src={product.imageUrl || "/omsons-logo.jpg"} alt="" /></span>
              <span className={styles.resultText}><strong>{product.name}</strong><small>{product.category?.name || "Product"}</small></span>
            </Link>
          )) : <div className={styles.empty}>No matching products found.</div>}
        </div>
      ) : null}
    </div>
  );
}
