"use client";

import { useEffect } from "react";

function formatValue(value) {
  return value >= 1000 ? value.toLocaleString() : String(value);
}

export default function useLandingEffects() {
  useEffect(() => {
    const revealElements = document.querySelectorAll("[data-reveal]");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.querySelectorAll("[data-counter]").forEach((element) => {
            const target = Number(element.getAttribute("data-target") || 0);
            const suffix = element.getAttribute("data-suffix") || "";
            const start = performance.now();
            const duration = 1800;

            const tick = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const current = Math.floor(target * progress);
              element.textContent = `${formatValue(current)}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                element.textContent = `${formatValue(target)}${suffix}`;
              }
            };

            requestAnimationFrame(tick);
          });
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("[data-counter-section]").forEach((section) => counterObserver.observe(section));

    const videoWraps = document.querySelectorAll("[data-video-wrap]");
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            entry.target.querySelector("[data-video]")?.play().catch(() => {});
            videoObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    videoWraps.forEach((videoWrap) => videoObserver.observe(videoWrap));

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      videoObserver.disconnect();
    };
  }, []);
}
