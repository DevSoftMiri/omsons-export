"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { appRoutes } from "@/lib/routes";
import LogoutButton from "./LogoutButton";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const items = [
  {
    label: "Dashboard",
    href: appRoutes.admin,
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Navbar",
    href: appRoutes.adminNavbar,
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: appRoutes.adminCategories,
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: appRoutes.adminProducts,
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "Product List",
    href: appRoutes.adminProductList,
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [categoryCount, setCategoryCount] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryCount() {
      try {
        const response = await fetch(`${API_BASE_URL}/category`, { cache: "no-store" });
        const data = await response.json();

        if (!cancelled && response.ok && data.success) {
          setCategoryCount(Array.isArray(data.categories) ? data.categories.length : 0);
        }
      } catch (_error) {
        if (!cancelled) {
          setCategoryCount(null);
        }
      }
    }

    loadCategoryCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .sb-root {
          font-family: 'Inter', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 240px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(170deg, #0f2d6e 0%, #0a1e4a 100%);
          border-right: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
        }

        .sb-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
        }

        .sb-root::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -60px;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(0, 70, 173, 0.35) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .sb-brand {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.75rem 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .sb-logo-wrap {
          width: 110px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .sb-logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sb-brand-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }

        .sb-admin-badge {
          margin-top: 0.4rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(0, 70, 173, 0.35);
          border: 1px solid rgba(0, 110, 255, 0.3);
          border-radius: 999px;
          padding: 0.28rem 0.75rem;
          color: #7BBFFF;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .sb-admin-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ADE80;
          flex-shrink: 0;
        }

        .sb-nav {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem 0.875rem;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sb-nav::-webkit-scrollbar {
          display: none;
        }

        .sb-section-label {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          padding: 0 0.5rem;
          margin: 0.25rem 0 0.5rem;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.875rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          border: 1px solid transparent;
        }

        .sb-link:hover {
          background: rgba(255,255,255,0.07);
          color: #ffffff;
          border-color: rgba(255,255,255,0.06);
        }

        .sb-link:hover .sb-link-icon {
          color: #7BBFFF;
        }

        .sb-link[data-active="true"] {
          background: rgba(0, 70, 173, 0.4);
          color: #ffffff;
          border-color: rgba(0, 110, 255, 0.25);
        }

        .sb-link[data-active="true"] .sb-link-icon {
          color: #7BBFFF;
        }

        .sb-link-icon {
          color: rgba(255,255,255,0.35);
          flex-shrink: 0;
          transition: color 0.15s;
        }

        .sb-link-label {
          flex: 1;
        }

        .sb-link-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.75rem;
          height: 1.75rem;
          padding: 0 0.45rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .sb-link[data-active="true"] .sb-link-count {
          background: rgba(123, 191, 255, 0.2);
          color: #ffffff;
        }

        .sb-footer {
          position: relative;
          z-index: 1;
          padding: 0.875rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>

      <aside className="sb-root">
        <div className="sb-brand">
          <div className="sb-logo-wrap">
            <img
              src="/omsons-logo.jpg"
              alt="Omsons"
            />
          </div>
          <span className="sb-brand-label">Admin Panel</span>
          <span className="sb-admin-badge">
            <span className="sb-admin-dot" />
            Management
          </span>
        </div>

        <nav className="sb-nav">
          <span className="sb-section-label">Navigation</span>
          {items.map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              className="sb-link"
              data-active={isActiveRoute(pathname, href) ? "true" : "false"}
            >
              <span className="sb-link-icon">{icon}</span>
              <span className="sb-link-label">{label}</span>
              {label === "Categories" && categoryCount !== null ? (
                <span className="sb-link-count">{categoryCount}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="sb-footer">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

function isActiveRoute(pathname, href) {
  if (!pathname) {
    return false;
  }

  if (href === appRoutes.admin) {
    return pathname === href;
  }

  return pathname === href;
}
