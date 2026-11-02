function serializeCatalogueProduct(product, rows = [], category = null) {
  const tableColumns = product.tableColumns || category?.tableColumns || [];
  const primaryRow = rows.find((row) =>
    tableColumns.some((column) => String(row?.values?.[column] || "").trim())
  ) || rows[0];

  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl || "",
    category: category ? { _id: category._id, name: category.name, slug: category.slug } : null,
    tableColumns,
    rowCount: rows.length,
    catNo: primaryRow?.values?.["Cat. No."] || "",
    rows: primaryRow
      ? [{ _id: primaryRow._id, values: primaryRow.values, sortOrder: primaryRow.sortOrder || 0 }]
      : [],
  };
}

module.exports = { serializeCatalogueProduct };
