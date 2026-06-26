import AdminShell from "@/components/admin/AdminShell";
import CategoryRowsManagerClient from "@/components/admin/CategoryRowsManagerClient";

export default async function AdminCategoryRowsPage({ params }) {
  const { categoryId } = await params;

  return (
    <AdminShell
      title="Manage Catalogue Rows"
      description="Add, update, delete, and reorder dynamic product table rows for this category."
    >
      <CategoryRowsManagerClient categoryId={categoryId} />
    </AdminShell>
  );
}
