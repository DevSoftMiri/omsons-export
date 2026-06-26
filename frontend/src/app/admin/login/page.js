import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main style={styles.page}>
      <AdminLoginForm />
    </main>
  );
}

const styles = {
  page: {
    display: "grid",
    placeItems: "center",
    minHeight: "100dvh",
    padding: 0,
    background: "#e2e8f0",
    overflow: "hidden",
  },
};
