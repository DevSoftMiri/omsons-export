import AdminShell from "@/components/admin/AdminShell";
import CategoryListClient from "@/components/admin/CategoryListClient";

export default function AdminCategoriesPage() {
  return (
    <AdminShell
      title="Catalogue Categories"
      description="Create and maintain dynamic laboratory catalogue sections, visual assets, and their table structures."
    >
      <CategoryListClient />
    </AdminShell>
  );
}
