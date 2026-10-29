/* Editorial gallery controls. No customer data or analytics are collected here. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  function initializeProjectSlideshow(root) {
    const stage = root.querySelector(".project-slideshow-stage");
    const slides = [...root.querySelectorAll("[data-project-slide]")];
    const previous = root.querySelector("[data-slideshow-prev]");
    const next = root.querySelector("[data-slideshow-next]");
    const toggle = root.querySelector("[data-slideshow-toggle]");
    const count = root.querySelector("[data-slideshow-count]");
    if (!stage || slides.length < 2 || !previous || !next || !toggle || !count) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let paused = reducedMotion.matches;
    let motionOptIn = false;
    let hovered = false;
    let focused = false;
    let visible = false;
    let timer;
    let pointerStart;

    function schedule() {
      window.clearTimeout(timer);
      if (paused || hovered || focused || !visible || document.hidden || (reducedMotion.matches && !motionOptIn)) return;
      timer = window.setTimeout(() => move(1, false), 6000);
    }

    function render(manual = false) {
      slides.forEach((slide, index) => { slide.hidden = index !== current; });
      count.setAttribute("aria-live", manual ? "polite" : "off");
      count.textContent = `${current + 1} / ${slides.length}`;
      toggle.textContent = paused ? "Play slideshow" : "Pause slideshow";
      schedule();
    }

    function move(direction, manual = true) {
      current = (current + direction + slides.length) % slides.length;
      render(manual);
    }

    slides.forEach((slide, index) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} of ${slides.length}`);
    });
    stage.tabIndex = 0;
    stage.setAttribute("aria-label", "Project photographs. Use the left and right arrow keys to browse.");
    stage.setAttribute("aria-live", "off");
    count.setAttribute("aria-atomic", "true");
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    toggle.addEventListener("click", () => {
      paused = !paused;
      motionOptIn = !paused;
      render();
    });
    root.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    });
    root.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse") return;
      hovered = true;
      schedule();
    });
    root.addEventListener("pointerleave", () => { hovered = false; schedule(); });
    root.addEventListener("focusin", () => { focused = true; schedule(); });
    root.addEventListener("focusout", () => {
      window.requestAnimationFrame(() => {
        focused = root.contains(document.activeElement);
        schedule();
      });
    });

    // Native vertical scrolling remains available during horizontal touch gestures.
    stage.addEventListener("pointerdown", event => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    stage.addEventListener("pointerup", event => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;
      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;
      pointerStart = undefined;
      if (Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) move(deltaX < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", () => { pointerStart = undefined; });
    stage.addEventListener("dragstart", event => event.preventDefault());

    reducedMotion.addEventListener("change", event => {
      motionOptIn = false;
      if (event.matches) paused = true;
      render();
    });
    document.addEventListener("visibilitychange", schedule);
    if (typeof IntersectionObserver === "function") {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
        schedule();
      }, { threshold: [0, 0.2] });
      observer.observe(stage);
    } else {
      const checkVisibility = () => {
        const bounds = stage.getBoundingClientRect();
        visible = bounds.top < window.innerHeight && bounds.bottom > 0;
        schedule();
      };
      window.addEventListener("scroll", checkVisibility, { passive: true });
      window.addEventListener("resize", checkVisibility);
      checkVisibility();
    }

    root.setAttribute("aria-roledescription", "carousel");
    root.dataset.slideshowReady = "true";
    [previous, toggle, count, next].forEach(control => { control.hidden = false; });
    render();
  }

  function initialize() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    const route = path => path.replace(/\/index\.html$/, "/");
    nav?.querySelectorAll("a[href]").forEach(link => {
      if (route(new URL(link.href).pathname) === route(location.pathname)) link.setAttribute("aria-current", "page");
    });
    const closeNav = () => {
      nav?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    };
    nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav?.classList.contains("is-open")) {
        closeNav();
        toggle?.focus();
      }
    });
    document.addEventListener("click", event => {
      if (!event.target.closest(".topbar")) closeNav();
    });
    window.matchMedia("(max-width: 820px)").addEventListener("change", closeNav);

    // Receipt feedback stays next to the action and is reachable by keyboard.
    if (typeof MutationObserver === "function") {
      document.querySelectorAll("#contact-success, #booking-success").forEach(card => {
        const observer = new MutationObserver(() => {
          if (card.classList.contains("is-hidden")) return;
          card.focus({ preventScroll: true });
          card.scrollIntoView({ block: "nearest", behavior: "auto" });
        });
        observer.observe(card, { attributes: true, attributeFilter: ["class"] });
      });
    }

    document.querySelectorAll("[data-project-slideshow]").forEach(initializeProjectSlideshow);

    const gallery = document.querySelector("[data-project-gallery]");
    const filters = document.querySelectorAll("[data-gallery-filter]");
    const count = document.querySelector("[data-gallery-count]");
    if (gallery) {
      const projects = [...gallery.querySelectorAll("[data-project]")];
      filters.forEach(button => button.addEventListener("click", () => {
        const category = button.dataset.galleryFilter;
        filters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
        projects.forEach(project => {
          project.hidden = category !== "all" && !project.dataset.category.split(" ").includes(category);
        });
        gallery.classList.toggle("is-filtered", category !== "all");
        if (count) {
          const visible = projects.filter(project => !project.hidden).length;
          count.textContent = `${visible} ${visible === 1 ? "photograph" : "photographs"}`;
        }
      }));
    }

    const links = [...document.querySelectorAll("[data-project-image]")];
    const dialog = document.querySelector("[data-lightbox]");
    if (!dialog || !links.length || typeof dialog.showModal !== "function") return;
    const image = dialog.querySelector("[data-lightbox-image]");
    const title = dialog.querySelector("[data-lightbox-title]");
    const caption = dialog.querySelector("[data-lightbox-caption]");
    const position = dialog.querySelector("[data-lightbox-position]");
    const next = dialog.querySelector("[data-lightbox-next]");
    const previous = dialog.querySelector("[data-lightbox-prev]");
    let current = 0;
    let activeLinks = [];
    let opener;
    const render = () => {
      const link = activeLinks[current];
      image.src = link.href;
      image.alt = link.querySelector("img")?.alt || link.dataset.title || "Big Iron project photograph";
      title.textContent = link.dataset.title;
      caption.textContent = link.dataset.caption || "Big Iron Construction";
      position.textContent = `${current + 1} / ${activeLinks.length}`;
      previous.disabled = activeLinks.length < 2;
      next.disabled = activeLinks.length < 2;
    };
    const move = direction => { current = (current + direction + activeLinks.length) % activeLinks.length; render(); };
    links.forEach(link => link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activeLinks = links.filter(item => !item.closest("[hidden]"));
      current = activeLinks.indexOf(link);
      opener = link;
      render();
      dialog.showModal();
      document.body.classList.add("lightbox-open");
    }));
    dialog.querySelector("[data-lightbox-close]").addEventListener("click", () => dialog.close());
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    dialog.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      opener?.focus();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
