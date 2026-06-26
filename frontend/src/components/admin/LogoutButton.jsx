"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    document.cookie = "admin_token=; path=/; max-age=0; samesite=lax";
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} style={styles.button}>
      Logout
    </button>
  );
}

const styles = {
  button: {
    padding: "0.75rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #334155",
    background: "transparent",
    color: "#cbd5e1",
    textAlign: "left",
    cursor: "pointer",
  },
};
