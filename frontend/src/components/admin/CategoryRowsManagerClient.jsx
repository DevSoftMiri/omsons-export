"use client";

import Link from "next/link";
import { appRoutes } from "@/lib/routes";

export default function CategoryRowsManagerClient({ categoryId }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
        Row Management Moved
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">
        Table rows are now managed inside products
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
        This catalogue now uses the structure Main Category → Products → Product Rows. To add or
        edit table rows, open the product manager for this category and edit the rows inside a
        specific product form.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`${appRoutes.adminProducts}?categoryId=${categoryId}`}
          className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Open Product Manager
        </Link>
        <Link
          href={appRoutes.adminCategories}
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
        >
          Back to Categories
        </Link>
      </div>
    </section>
  );
}
