import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type CleanUp = () => void;

const cleanups: CleanUp[] = [];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js-enabled");

const addCleanup = (callback: CleanUp) => cleanups.push(callback);

const runEntrance = () => {
  if (prefersReducedMotion) {
    document.documentElement.classList.add("motion-reduced");
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(".masthead__edge span, .masthead__edge a", { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 })
    .fromTo(".wordmark", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "-=0.35")
    .fromTo(".mastnav a", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, "-=0.65")
    .fromTo(".hero__copy > *", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.09 }, "-=0.35")
    .fromTo(".hero__artifact", { scale: 0.98, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 }, "-=0.9")
    .fromTo(".hero__footnote", { opacity: 0 }, { opacity: 1, duration: 0.7 }, "-=0.55");
};

const setupReveals = () => {
  if (prefersReducedMotion) return;

  document.querySelectorAll<HTMLElement>(".section-frame").forEach((section) => {
    const items = section.querySelectorAll<HTMLElement>(":scope > *");
    gsap.fromTo(items, { y: 24, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
    });
  });
};

const setupMineral = () => {
  const object = document.querySelector<HTMLElement>("[data-mineral]");
  if (!object || prefersReducedMotion) return;

  gsap.to(object, {
    y: -10,
    rotation: 0.5,
    duration: 4.8,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });

  object.addEventListener("pointermove", (event) => {
    const rect = object.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(object, { rotateY: x * 3, rotateX: y * -3, duration: 0.5, overwrite: true });
  });

  const reset = () => gsap.to(object, { rotateY: 0, rotateX: 0, duration: 0.7, overwrite: true });
  object.addEventListener("pointerleave", reset);
  addCleanup(() => {
    object.removeEventListener("pointerleave", reset);
  });
};

const setupMagneticButtons = () => {
  if (prefersReducedMotion) return;

  document.querySelectorAll<HTMLElement>(".magnetic").forEach((button) => {
    const onMove = (event: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      gsap.to(button, { x: dx * 0.09, y: dy * 0.12, duration: 0.35, ease: "power2.out" });
    };
    const onLeave = () => gsap.to(button, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.55)" });
    button.addEventListener("pointermove", onMove);
    button.addEventListener("pointerleave", onLeave);
    addCleanup(() => {
      button.removeEventListener("pointermove", onMove);
      button.removeEventListener("pointerleave", onLeave);
    });
  });
};

const setupSeals = () => {
  document.querySelectorAll<HTMLElement>("[data-seal]").forEach((seal, index) => {
    const ring = seal.querySelector<HTMLElement>(".seal__orbit");
    if (!ring || prefersReducedMotion) return;
    gsap.to(ring, { rotation: index % 2 === 0 ? 360 : -360, duration: 28, ease: "none", repeat: -1 });
  });
};

const setupCopy = () => {
  const button = document.querySelector<HTMLButtonElement>(".copy-email");
  if (!button) return;

  button.addEventListener("click", async () => {
    const value = button.dataset.copyEmail ?? "wiresandstone@gmail.com";
    try {
      await navigator.clipboard.writeText(value);
      const original = button.innerHTML;
      button.innerHTML = "COPIED <span>✓</span>";
      window.setTimeout(() => { button.innerHTML = original; }, 1700);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
};

const setupMobileNav = () => {
  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const nav = document.querySelector<HTMLElement>("#site-nav");
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.hidden = true;
    document.body.classList.remove("mobile-nav-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.hidden = open;
    document.body.classList.toggle("mobile-nav-open", !open);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
};

const setupScrollLine = () => {
  const line = document.querySelector<HTMLElement>(".site-rail--right");
  if (!line || prefersReducedMotion) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    line.style.setProperty("--scroll-progress", String(progress));
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  addCleanup(() => window.removeEventListener("scroll", update));
};

runEntrance();
setupReveals();
setupMineral();
setupMagneticButtons();
setupSeals();
setupCopy();
setupMobileNav();
setupScrollLine();

window.addEventListener("pagehide", () => cleanups.splice(0).forEach((cleanup) => cleanup()));
