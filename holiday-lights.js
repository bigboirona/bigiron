(() => {
  "use strict";
  const form = document.getElementById("holiday-plan-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const url = new URL("contact.html", window.location.href);
    url.searchParams.set("service", "holiday-lights");
    for (const field of ["season", "look", "lights", "storage"]) {
      url.searchParams.set(field, String(data.get(field) || "").slice(0, 120));
    }
    const source = new URLSearchParams(window.location.search);
    for (const field of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]) {
      if (source.has(field)) url.searchParams.set(field, source.get(field));
    }
    window.location.assign(url.href);
  });
})();
