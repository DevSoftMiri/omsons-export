"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const INITIAL_FORM = { email: "admin@omsons.com", password: "Admin@123" };

export default function AdminLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      document.cookie = `admin_token=${data.token}; path=/; max-age=86400; samesite=lax`;
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Login failed" });
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          font-family: 'Inter', sans-serif;
          min-height: 100dvh;
          max-height: 100dvh;
          display: flex;
          background: #f1f5fb;
          overflow: hidden;
        }

        /* ── Left brand panel ── */
        .al-brand {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          background: linear-gradient(155deg, #0046AD 0%, #0f2d6e 100%);
          position: relative;
          overflow: hidden;
          flex: 0 0 44%;
        }
        @media (min-width: 900px) { .al-brand { display: flex; } }

        /* dot-grid texture */
        .al-brand::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* glowing orb */
        .al-brand::after {
          content: '';
          position: absolute;
          bottom: -120px;
          right: -120px;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(80,160,255,0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .al-brand-top { position: relative; z-index: 1; }

        .al-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          width: fit-content;
          border-radius: 14px;
          background: rgba(255,255,255,0.98);
          box-shadow: 0 10px 30px rgba(8, 26, 68, 0.16);
        }
        .al-logo img {
          height: 58px;
          width: auto;
          object-fit: contain;
          border-radius: 4px;
        }

        .al-brand-body {
          position: relative;
          z-index: 1;
        }
        .al-brand-body h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .al-brand-body h2 span {
          color: #7BBFFF;
        }
        .al-brand-body p {
          font-size: 0.9375rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.65;
          max-width: 300px;
        }

        .al-brand-footer {
          position: relative;
          z-index: 1;
        }
        .al-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          padding: 0.45rem 1rem;
          color: rgba(255,255,255,0.85);
          font-size: 0.8125rem;
          font-weight: 500;
        }
        .al-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ADE80;
          flex-shrink: 0;
        }

        /* ── Right form panel ── */
        .al-form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          min-height: 100dvh;
        }

        .al-form-wrap {
          width: 100%;
          max-width: 420px;
        }

        /* Mobile-only logo */
        .al-mobile-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .al-mobile-logo img {
          height: 56px;
          width: auto;
          object-fit: contain;
        }
        @media (min-width: 900px) { .al-mobile-logo { display: none; } }

        .al-mobile-logo-frame {
          display: inline-flex;
          padding: 0.75rem 1rem;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 45, 110, 0.08);
        }

        .al-form-header { margin-bottom: 2rem; }
        .al-eyebrow {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0046AD;
          margin-bottom: 0.5rem;
        }
        .al-form-header h1 {
          font-size: 1.625rem;
          font-weight: 700;
          color: #0f2d6e;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }
        .al-form-header p {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.6;
        }

        .al-card {
          background: #ffffff;
          border: 1px solid #dde6f5;
          border-radius: 12px;
          padding: 1.75rem;
          box-shadow: 0 4px 24px rgba(0, 70, 173, 0.07);
        }

        .al-field { display: grid; gap: 0.4rem; margin-bottom: 1.25rem; }
        .al-field:last-of-type { margin-bottom: 0; }

        .al-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #334155;
          letter-spacing: 0.01em;
        }

        .al-input-wrap { position: relative; }

        .al-input {
          width: 100%;
          padding: 0.8rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          color: #0f2d6e;
          background: #f8faff;
          border: 1.5px solid #ccd9f0;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .al-input::placeholder { color: #94a3b8; }
        .al-input:focus {
          border-color: #0046AD;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 70, 173, 0.1);
        }

        /* password toggle */
        .al-input-pw { padding-right: 3rem; }
        .al-pw-toggle {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 0.2rem;
          line-height: 1;
          display: flex;
          align-items: center;
        }
        .al-pw-toggle:hover { color: #0046AD; }

        .al-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: 8px;
          color: #be123c;
          font-size: 0.8375rem;
          font-weight: 500;
          margin-top: 1.25rem;
        }

        .al-submit {
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.875rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, #0046AD 0%, #0f2d6e 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(0, 70, 173, 0.35);
          position: relative;
          overflow: hidden;
        }
        .al-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 70, 173, 0.45);
        }
        .al-submit:active:not(:disabled) { transform: translateY(0); }
        .al-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .al-submit-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .al-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: al-spin 0.7s linear infinite;
        }
        @keyframes al-spin { to { transform: rotate(360deg); } }

        .al-footer-note {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.8125rem;
          color: #94a3b8;
        }
        .al-footer-note strong { color: #64748b; font-weight: 500; }
      `}</style>

      <div className="al-root">

        {/* ── Brand panel ── */}
        <aside className="al-brand">
          <div className="al-brand-top">
            <div className="al-logo">
              <img
                src="/omsons-logo.jpg"
                alt="Omsons"
              />
            </div>
          </div>

          <div className="al-brand-body">
            <h2>
              Precision tools for<br />
              <span>modern laboratories.</span>
            </h2>
            <p>
              Manage your product catalogue, orders, and customer data from a
              single, secure dashboard built for the Omsons team.
            </p>
          </div>

          <div className="al-brand-footer">
            <span className="al-badge">
              <span className="al-badge-dot" />
              Secure admin portal
            </span>
          </div>
        </aside>

        {/* ── Form panel ── */}
        <main className="al-form-side">
          <div className="al-form-wrap">

            {/* Mobile logo */}
            <div className="al-mobile-logo">
              <div className="al-mobile-logo-frame">
                <img
                  src="/omsons-logo.jpg"
                  alt="Omsons"
                />
              </div>
            </div>

            <div className="al-form-header">
              <p className="al-eyebrow">Admin Portal</p>
              <h1>Welcome back</h1>
              <p>Sign in to access the Omsons dashboard.</p>
            </div>

            <div className="al-card">
              {/* Email */}
              <div className="al-field">
                <label className="al-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@omsons.com"
                  className="al-input"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password */}
              <div className="al-field">
                <label className="al-label" htmlFor="password">Password</label>
                <div className="al-input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="al-input al-input-pw"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="al-pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {status.error && (
                <div className="al-error" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {status.error}
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                className="al-submit"
                disabled={status.loading}
                onClick={handleSubmit}
              >
                <span className="al-submit-inner">
                  {status.loading ? (
                    <>
                      <span className="al-spinner" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Enter Dashboard
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>

            <p className="al-footer-note">
              Use credentials from <strong>backend/.env</strong>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
