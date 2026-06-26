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

    const counterElements = document.querySelectorAll("[data-counter]");
    let counterStarted = false;
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || counterStarted) {
            return;
          }

          counterStarted = true;
          counterElements.forEach((element) => {
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

    const counterSection = document.querySelector("[data-counter-section]");
    if (counterSection) {
      counterObserver.observe(counterSection);
    }

    const videoWrap = document.querySelector("[data-video-wrap]");
    const videoElement = document.querySelector("[data-video]");
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            videoElement?.play().catch(() => {});
            videoObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    if (videoWrap) {
      videoObserver.observe(videoWrap);
    }

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      videoObserver.disconnect();
    };
  }, []);
}
