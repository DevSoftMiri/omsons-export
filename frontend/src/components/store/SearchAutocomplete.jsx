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
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const requestRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const closeMenus = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setTypeMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeMenus);
    return () => document.removeEventListener("pointerdown", closeMenus);
  }, []);

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
    <div ref={wrapperRef} className={styles.wrapper} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
        setTypeMenuOpen(false);
      }
    }}>
      <form className={shellClassName} action={appRoutes.products} method="get" onSubmit={() => setOpen(false)}>
        <div className={styles.typePicker}>
          <button type="button" className={selectClassName} onClick={() => setTypeMenuOpen((value) => !value)} aria-expanded={typeMenuOpen}>
            <span>{searchType === "products" ? "Products" : searchType === "categories" ? "Categories" : "All"}</span>
            <img src="/omsons_header_icons/all-categories-chevron-blue.svg" alt="" />
          </button>
          {typeMenuOpen ? (
            <div className={styles.typeMenu}>
              {[{ value: "all", label: "All", icon: "/omsons_header_icons/all-categories-chevron-blue.svg" }, { value: "products", label: "Products", icon: "/file.svg" }, { value: "categories", label: "Categories", icon: "/globe.svg" }].map((option) => (
                <button type="button" key={option.value} className={`${styles.typeOption} ${searchType === option.value ? styles.typeOptionActive : ""}`} onClick={() => { setSearchType(option.value); setResults([]); setOpen(false); setTypeMenuOpen(false); }}>
                  <img src={option.icon} alt="" />
                  <span>{option.label}</span>
                  {searchType === option.value ? <span className={styles.typeCheck}>✓</span> : null}
                </button>
              ))}
            </div>
          ) : null}
          <input type="hidden" name="searchType" value={searchType} />
        </div>
        <input className={inputClassName} name="search" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(event.target.value.trim().length >= 2); }} onFocus={() => query.trim().length >= 2 && setOpen(true)} placeholder="Search by name, SKU, or category..." aria-label="Search products and categories" autoComplete="off" />
      </form>
      {open && searchType !== "categories" ? (
        <div className={styles.dropdown} role="listbox">
          {results.length ? results.map((product) => (
            <Link key={product.slug} href={appRoutes.product(product.slug)} className={styles.result} onClick={() => setOpen(false)}>
              <span className={styles.imageWrap}><img src={product.imageUrl || "/omsons-germany-logo.png"} alt="" /></span>
              <span className={styles.resultText}><strong>{product.name}</strong><small>{product.category?.name || "Product"}</small></span>
            </Link>
          )) : <div className={styles.empty}>No matching products found.</div>}
        </div>
      ) : null}
    </div>
  );
}
