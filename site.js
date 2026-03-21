const siteConfig = {
  bookingRequestUrl: "#",
  leadPipeline: ["New Inquiry", "Contacted", "Booked", "Paid", "Completed", "Lost"],
  services: [
    {
      id: "exterior-repair-visit",
      name: "Exterior Repair Visit",
      price: 349,
      duration: "90 minutes",
      slots: ["Tue 9:00 AM", "Tue 1:30 PM", "Thu 10:00 AM", "Fri 3:00 PM"],
    },
    {
      id: "interior-tune-up",
      name: "Interior Tune-Up",
      price: 289,
      duration: "75 minutes",
      slots: ["Mon 11:00 AM", "Wed 2:00 PM", "Thu 9:30 AM", "Sat 10:00 AM"],
    },
    {
      id: "seasonal-guard",
      name: "Seasonal Guard",
      price: 429,
      duration: "120 minutes",
      slots: ["Wed 9:00 AM", "Fri 12:30 PM", "Sat 1:00 PM", "Sun 9:30 AM"],
    },
  ],
};

const storageKeys = {
  bookings: "bigiron_bookings",
  leads: "bigiron_leads",
};

function byId(id) {
  return document.getElementById(id);
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getQueryServiceId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("service");
}

function saveRecord(key, payload) {
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  current.push({ ...payload, capturedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(current));
}

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function initTestimonials() {
  const rail = byId("testimonial-rail");
  if (!rail) return;

  const cards = [...rail.querySelectorAll(".testimonial-card")];
  let index = 0;

  window.setInterval(() => {
    cards[index].classList.remove("is-active");
    index = (index + 1) % cards.length;
    cards[index].classList.add("is-active");
  }, 2800);
}

function initCarousel() {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const viewport = root.querySelector("[data-carousel-viewport]");
  const slides = [...viewport.querySelectorAll("[data-carousel-card]")];
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const count = root.querySelector("[data-carousel-count]");

  let pointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  function getStep() {
    const first = slides[0];
    if (!first) return viewport.clientWidth;
    const gap = Number.parseFloat(window.getComputedStyle(viewport).columnGap || window.getComputedStyle(viewport).gap || "0");
    return first.getBoundingClientRect().width + gap;
  }

  function syncCount() {
    if (!count || !slides.length) return;
    const step = getStep();
    const index = Math.round(viewport.scrollLeft / step);
    const visible = window.innerWidth <= 560 ? 1 : window.innerWidth <= 760 ? 2 : 3;
    const page = Math.min(index + 1, slides.length);
    count.textContent = `${page} / ${slides.length}`;
    const atStart = viewport.scrollLeft <= 4;
    const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;
    prev.disabled = atStart;
    next.disabled = atEnd;
    prev.style.opacity = atStart ? "0.35" : "";
    next.style.opacity = atEnd ? "0.35" : "";
    root.dataset.visibleCards = String(visible);
  }

  function scrollByStep(direction) {
    viewport.scrollBy({ left: getStep() * direction, behavior: "smooth" });
  }

  prev.addEventListener("click", () => {
    scrollByStep(-1);
  });

  next.addEventListener("click", () => {
    scrollByStep(1);
  });

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByStep(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByStep(1);
    }
  });

  viewport.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    startX = event.clientX;
    startScrollLeft = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!pointerDown) return;
    const delta = event.clientX - startX;
    viewport.scrollLeft = startScrollLeft - delta;
  });

  function endPointer(event) {
    if (!pointerDown) return;
    pointerDown = false;
    viewport.classList.remove("is-dragging");
    if (event?.pointerId !== undefined && viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    window.requestAnimationFrame(syncCount);
  }

  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);
  viewport.addEventListener("pointerleave", endPointer);

  let scrollTimer;
  viewport.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(syncCount, 60);
  });

  window.addEventListener("resize", syncCount);

  if (slides.length) {
    slides.forEach((slide) => {
      slide.addEventListener("click", () => {
        slide.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      });
    });
  }

  syncCount();
}

function initBookingPage() {
  const form = byId("booking-form");
  if (!form) return;

  const serviceOptions = byId("service-options");
  const slotGrid = byId("slot-grid");
  const summaryService = byId("summary-service");
  const summaryPrice = byId("summary-price");
  const summaryDuration = byId("summary-duration");
  const summarySlot = byId("summary-slot");
  const successCard = byId("booking-success");
  const successCopy = byId("booking-success-copy");

  let selectedService = siteConfig.services[0];
  let selectedSlot = "";

  function renderSlots(service) {
    slotGrid.innerHTML = "";
    service.slots.forEach((slot, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `slot-button ${index === 0 ? "is-selected" : ""}`;
      button.innerHTML = `<strong>${slot}</strong><span>Availability preview</span>`;
      button.addEventListener("click", () => {
        slotGrid.querySelectorAll(".slot-button").forEach((node) => node.classList.remove("is-selected"));
        button.classList.add("is-selected");
        selectedSlot = slot;
        updateSummary();
      });
      slotGrid.appendChild(button);
    });
    selectedSlot = service.slots[0];
  }

  function updateSummary() {
    summaryService.textContent = selectedService.name;
    summaryPrice.textContent = currency(selectedService.price);
    summaryDuration.textContent = selectedService.duration;
    summarySlot.textContent = selectedSlot || "Pick a time";
  }

  function renderServices() {
    const preferredId = getQueryServiceId();
    if (preferredId) {
      const match = siteConfig.services.find((service) => service.id === preferredId);
      if (match) {
        selectedService = match;
      }
    }

    serviceOptions.innerHTML = "";
    siteConfig.services.forEach((service) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `service-option ${service.id === selectedService.id ? "is-selected" : ""}`;
      button.innerHTML = `
        <strong>${service.name}</strong>
        <span>${currency(service.price)} · ${service.duration}</span>
      `;
      button.addEventListener("click", () => {
        selectedService = service;
        serviceOptions.querySelectorAll(".service-option").forEach((node) => node.classList.remove("is-selected"));
        button.classList.add("is-selected");
        renderSlots(service);
        updateSummary();
      });
      serviceOptions.appendChild(button);
    });
    renderSlots(selectedService);
    updateSummary();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      fullName: data.get("fullName"),
      email: data.get("email"),
      phone: data.get("phone"),
      address: data.get("address"),
      notes: data.get("notes"),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: selectedService.price,
      slot: selectedSlot,
      targetUrl: siteConfig.bookingRequestUrl,
    };

    saveRecord(storageKeys.bookings, payload);
    successCard.classList.remove("is-hidden");
    successCopy.textContent =
      `${payload.fullName}, your ${selectedService.name} request for ${selectedSlot} was saved locally in this preview site. The live version can later route this into Big Iron's real booking and confirmation flow.`;
    form.reset();
    renderServices();
  });

  renderServices();
}

function initContactPage() {
  const form = byId("contact-form");
  if (!form) return;

  const successCard = byId("contact-success");
  const successCopy = byId("contact-success-copy");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      fullName: data.get("fullName"),
      email: data.get("email"),
      phone: data.get("phone"),
      serviceType: data.get("serviceType"),
      timing: data.get("timing"),
      address: data.get("address"),
      message: data.get("message"),
      pipelineStage: siteConfig.leadPipeline[0],
    };

    saveRecord(storageKeys.leads, payload);
    successCard.classList.remove("is-hidden");
    successCopy.textContent =
      `${payload.fullName}'s quote request was saved locally as a "${payload.pipelineStage}" lead in this preview site. The live version can later connect this to Big Iron's actual intake workflow.`;
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initTestimonials();
  initCarousel();
  initBookingPage();
  initContactPage();
});
