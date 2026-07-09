import Link from "next/link";
import { appRoutes } from "@/lib/routes";

export default function CatalogueSections({ categories = [], singleSection = false }) {
  return (
    <div className={singleSection ? "grid gap-6" : "grid gap-8"}>
      {categories.map((category) => {
        const categoryColumns = getCategoryColumns(category);

        return (
          <section
            key={category._id || category.slug}
            className="overflow-hidden rounded-[30px] border border-sky-100/80 bg-white shadow-[0_22px_60px_rgba(17,37,79,0.12),0_3px_10px_rgba(17,37,79,0.06)] ring-1 ring-white/80"
          >
            <div className="border-b border-sky-100 bg-[linear-gradient(135deg,#f9fbff_0%,#edf4ff_55%,#f7fbff_100%)] px-6 py-7 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-sky-700">
                    Main Category
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {category.name}
                  </h2>
                  <p className="max-w-3xl text-sm leading-7 text-slate-500">
                    {category.description || "Browse laboratory catalogue products and dynamic tables."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-6 lg:px-6 lg:py-8">
              {(category.products || []).map((product) => {
                const productColumns = product.tableColumns?.length
                  ? product.tableColumns
                  : categoryColumns;
                const productImage = getProductDisplayImage(product);

                return (
                  <article
                    key={product._id || product.slug}
                    className="overflow-hidden rounded-[26px] border border-sky-100 bg-white shadow-[0_14px_36px_rgba(17,37,79,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-white/70"
                  >
                    <div className="grid lg:grid-cols-[74px_180px_92px_minmax(0,1fr)]">
                      <div className="hidden items-center justify-center bg-[linear-gradient(180deg,#dbe6ff_0%,#cfdaf8_100%)] shadow-[inset_-1px_0_0_rgba(255,255,255,0.65)] lg:flex">
                        <span
                          className="text-xs font-bold uppercase tracking-[0.26em] text-slate-700"
                          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                        >
                          {category.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-center border-r border-sky-50 bg-[linear-gradient(180deg,#fbfdff_0%,#f3f7fd_100%)] p-5">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="max-h-[220px] w-full object-contain"
                          />
                        ) : (
                          <div className="grid h-[220px] w-full place-items-center rounded-[22px] border border-dashed border-sky-200 bg-white/80 text-sm text-slate-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row gap-3 overflow-x-auto border-t border-sky-50 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 lg:flex-col lg:border-t-0 lg:border-r lg:px-2 lg:py-5">
                        {(product.icons || []).map((icon, index) => (
                          <div
                            key={`${icon.label}-${index}`}
                            className="flex min-w-[72px] flex-col items-center justify-center gap-2 rounded-full border border-sky-200 bg-[linear-gradient(180deg,#fafdff_0%,#eef6ff_100%)] px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700 shadow-[0_6px_14px_rgba(17,37,79,0.06)]"
                          >
                            {icon.imageUrl ? (
                              <img src={icon.imageUrl} alt={icon.label} className="h-11 w-11 object-contain" />
                            ) : (
                              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-300 bg-white px-1 text-[9px] leading-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                {icon.label}
                              </span>
                            )}
                            <span className="leading-tight">{icon.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-5 px-5 py-5 lg:px-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-3">
                            <h3 className="text-[30px] font-semibold tracking-tight text-slate-900">
                              {product.name}
                            </h3>
                            {product.description ? (
                              <p className="max-w-3xl text-sm leading-7 text-slate-500">
                                {product.description}
                              </p>
                            ) : null}
                            {product.bulletPoints?.length ? (
                              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-700">
                                {product.bulletPoints.map((point) => (
                                  <li key={point}>{point}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>

                          <Link
                            href={appRoutes.product(product.slug)}
                            className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,#0f79bd_0%,#0c63a6_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,121,189,0.24)] transition hover:translate-y-[-1px] hover:brightness-[0.98]"
                          >
                            View Details
                          </Link>
                        </div>

                        {product.technicalTags?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {product.technicalTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full border border-sky-100 bg-[linear-gradient(180deg,#f9fbff_0%,#f1f6fd_100%)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <details className="group overflow-hidden rounded-[18px] border border-sky-100 bg-white shadow-[0_10px_26px_rgba(17,37,79,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[linear-gradient(135deg,#fbfdff_0%,#edf4ff_100%)] px-5 py-4 marker:content-none">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-900">
                                View Specifications Table
                              </p>
                              <p className="text-xs text-slate-500">
                                {product.rows?.length || 0} variants available
                              </p>
                            </div>
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-white text-xl font-medium text-sky-700 shadow-[0_6px_14px_rgba(17,37,79,0.08)] transition group-open:rotate-45">
                              +
                            </span>
                          </summary>

                          <div className="overflow-x-auto border-t border-sky-100">
                            <table className="min-w-full border-collapse">
                              <thead>
                                <tr className="bg-sky-700 text-white">
                                  {productColumns.map((column) => (
                                    <th
                                      key={column}
                                      className="whitespace-nowrap border-r border-sky-500 px-4 py-3 text-left text-sm font-semibold last:border-r-0"
                                    >
                                      {column}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(product.rows || []).map((row, rowIndex) => (
                                  <tr
                                    key={row._id || rowIndex}
                                    className={rowIndex % 2 === 0 ? "bg-slate-50" : "bg-white"}
                                  >
                                    {productColumns.map((column) => (
                                      <td
                                        key={column}
                                        className="whitespace-nowrap border-t border-slate-200 px-4 py-3 text-sm text-slate-700"
                                      >
                                        {row.values?.[column] || ""}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function getCategoryColumns(category) {
  if (category.tableColumns?.length) {
    return category.tableColumns;
  }

  return [...new Set((category.products || []).flatMap((product) => product.tableColumns || []))];
}

function getProductDisplayImage(product) {
  const galleryImages = Array.isArray(product.galleryImages)
    ? product.galleryImages.filter((image) => String(image || "").trim())
    : [];
  const preferredImage = galleryImages[0] || "";

  return product.imageUrl || preferredImage || "";
}
