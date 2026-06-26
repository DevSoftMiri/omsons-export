import AdminShell from "@/components/admin/AdminShell";
import CategoryEditorClient from "@/components/admin/CategoryEditorClient";

export default async function AdminCategoryEditPage({ params }) {
  const { categoryId } = await params;

  return (
    <AdminShell
      title="Edit Catalogue Category"
      description="Update the section content, image, technical icons, publishing state, and table columns."
    >
      <CategoryEditorClient categoryId={categoryId} />
    </AdminShell>
  );
}
