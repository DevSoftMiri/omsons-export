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
            className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#f7fbff_0%,#edf4ff_55%,#f8fbff_100%)] px-6 py-7 lg:px-8">
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
                <div className="flex flex-wrap gap-2">
                  {categoryColumns.map((column) => (
                    <span
                      key={column}
                      className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold text-sky-700"
                    >
                      {column}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-8 px-4 py-6 lg:px-6 lg:py-8">
              {(category.products || []).map((product) => {
                const productColumns = product.tableColumns?.length
                  ? product.tableColumns
                  : categoryColumns;

                return (
                  <article
                    key={product._id || product.slug}
                    className="overflow-hidden rounded-[26px] border border-slate-200 bg-white"
                  >
                    <div className="grid lg:grid-cols-[74px_180px_92px_minmax(0,1fr)]">
                      <div className="hidden items-center justify-center bg-indigo-100 lg:flex">
                        <span
                          className="text-xs font-bold uppercase tracking-[0.26em] text-slate-700"
                          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                        >
                          {category.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-center bg-slate-50 p-5">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="max-h-[220px] w-full object-contain"
                          />
                        ) : (
                          <div className="grid h-[220px] w-full place-items-center rounded-[22px] border border-dashed border-slate-300 text-sm text-slate-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row gap-3 overflow-x-auto border-t border-slate-100 px-4 py-4 lg:flex-col lg:border-t-0 lg:px-2 lg:py-5">
                        {(product.icons || []).map((icon, index) => (
                          <div
                            key={`${icon.label}-${index}`}
                            className="flex min-w-[72px] flex-col items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700"
                          >
                            {icon.imageUrl ? (
                              <img src={icon.imageUrl} alt={icon.label} className="h-11 w-11 object-contain" />
                            ) : (
                              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-300 bg-white px-1 text-[9px] leading-tight">
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
                            className="inline-flex items-center rounded-full bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"
                          >
                            View Details
                          </Link>
                        </div>

                        {product.technicalTags?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {product.technicalTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="overflow-x-auto rounded-[18px] border border-slate-200">
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
