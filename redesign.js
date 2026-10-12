/* Editorial gallery controls. No customer data or analytics are collected here. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");
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
      caption.textContent = link.dataset.caption || "Big Iron Construction · actual project photograph";
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
