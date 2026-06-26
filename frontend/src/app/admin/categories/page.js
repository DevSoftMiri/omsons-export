import AdminShell from "@/components/admin/AdminShell";
import ManageCategoriesClient from "@/components/admin/ManageCategoriesClient";

export default function AdminCategoriesPage() {
  return (
    <AdminShell
      title="Manage Categories"
      description="Create and maintain the category records used by the live storefront and imported products."
    >
      <ManageCategoriesClient />
    </AdminShell>
  );
}
