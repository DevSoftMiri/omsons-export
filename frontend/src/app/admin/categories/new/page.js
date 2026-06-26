import AdminShell from "@/components/admin/AdminShell";
import CategoryEditorClient from "@/components/admin/CategoryEditorClient";

export default function AdminCategoryCreatePage() {
  return (
    <AdminShell
      title="Create Catalogue Category"
      description="Set up a new catalogue section with dynamic columns, bullets, imagery, and technical icons."
    >
      <CategoryEditorClient />
    </AdminShell>
  );
}
