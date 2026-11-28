import Link from "next/link";

export default function UnderDevelopmentPage() {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, background: "#f5f8fc", color: "#0b2544", textAlign: "center" }}><div><p style={{ color: "#2f6fba", fontWeight: 700, letterSpacing: ".12em" }}>OMSONS</p><h1 style={{ margin: "16px 0 12px", fontSize: "clamp(2rem, 5vw, 4rem)" }}>Website under development</h1><p style={{ color: "#71839d" }}>This page will be available soon.</p><Link href="/" style={{ display: "inline-block", marginTop: 28, padding: "12px 22px", borderRadius: 999, background: "#2f6fba", color: "#fff", fontWeight: 700 }}>Back to home</Link></div></main>;
}
