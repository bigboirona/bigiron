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
  quotePreviews: "bigiron_quote_previews",
  latestQuoteSummary: "bigiron_latest_quote_summary",
};

const quoteCatalog = {
  categories: [
    "General",
    "Exterior",
    "Decks & Fences",
    "Roof & Gutters",
    "Interior",
    "Plumbing",
    "Electrical",
  ],
  services: [
    { id: "general_not_sure", category: "General", subcategory: "General / Not Sure", name: "General Handyman / Not Sure Yet", unit: "job", low: 250, high: 900, min: 250, included: 1, assumptions: "Use this when the project is mixed or unclear. Photos and a short list will narrow the range." },
    { id: "general_punch_list", category: "General", subcategory: "Punch List", name: "General Punch List", unit: "job", low: 250, high: 600, min: 250, included: 1, assumptions: "Assumes 2-4 small items, basic tools, normal access, and no heavy material handling." },
    { id: "hourly_handyman", category: "General", subcategory: "Punch List", name: "Hourly Handyman Work", unit: "hour", low: 250, high: 300, unitLow: 100, unitHigh: 150, min: 250, included: 2, assumptions: "Good for open-ended punch-list work. $250 minimum visit, roughly covering the first two hours, then about $100-$150/hr depending on scope." },
    { id: "half_day", category: "General", subcategory: "Punch List", name: "Half-Day Handyman Block", unit: "job", low: 575, high: 750, min: 575, included: 1, assumptions: "Four hours on site. Materials are separate unless listed." },
    { id: "full_day", category: "General", subcategory: "Punch List", name: "Full-Day Handyman Block", unit: "job", low: 1000, high: 1400, min: 1000, included: 1, assumptions: "Eight hours on site. Best for turnover lists or several bundled tasks." },
    { id: "bathroom_recaulk", category: "General", subcategory: "Caulking", name: "Bathroom Re-Caulk", unit: "job", low: 250, high: 500, min: 250, included: 1, assumptions: "Standard tub, shower, sink, or vanity caulk. Tile repair and grout are separate." },
    { id: "exterior_not_sure", category: "Exterior", subcategory: "General / Not Sure", name: "Exterior Repair / Not Sure Yet", unit: "job", low: 350, high: 1600, min: 350, included: 1, photos: true, assumptions: "Use this for exterior problem spots when the exact repair type is not clear yet. Photos help narrow it quickly." },
    { id: "window_recaulk", category: "Exterior", subcategory: "Caulking", name: "Window Re-Caulk", unit: "lf", low: 0, high: 0, unitLow: 10, unitHigh: 18, min: 250, included: 20, photos: true, assumptions: "Exterior-grade caulk. Paint touch-up is separate." },
    { id: "exterior_caulk_package", category: "Exterior", subcategory: "Caulking", name: "Exterior Caulk Package", unit: "job", low: 450, high: 900, min: 450, included: 1, photos: true, siteVisit: true, assumptions: "Single-story window, door, trim, and penetration caulking. Larger homes and two-story access increase the range." },
    { id: "siding_trim_repair", category: "Exterior", subcategory: "Siding & Trim", name: "Siding / Trim Repair", unit: "job", low: 450, high: 1500, min: 450, included: 1, photos: true, assumptions: "Localized exterior repair with standard wood or trim material. Rot behind the surface is separate." },
    { id: "door_adjustment", category: "Exterior", subcategory: "Doors & Sliders", name: "Door Adjustment / Repair", unit: "job", low: 250, high: 450, min: 250, included: 1, assumptions: "Sagging, sticking, strike-plate, hinge, or alignment repair. Door replacement is separate." },
    { id: "exterior_door_replace", category: "Exterior", subcategory: "Doors & Sliders", name: "Exterior Door Replace", unit: "job", low: 650, high: 1800, min: 650, included: 1, photos: true, siteVisit: true, assumptions: "Prehung or slab replacement. Rot, threshold repair, trim, and paint can move the range." },
    { id: "slider_door_repair", category: "Exterior", subcategory: "Doors & Sliders", name: "Slider / Screen Repair", unit: "job", low: 250, high: 550, min: 250, included: 1, photos: true, assumptions: "Track, roller, screen, or alignment type repair. Specialty parts may change the range." },
    { id: "deck_fence_not_sure", category: "Decks & Fences", subcategory: "General / Not Sure", name: "Deck / Fence Work / Not Sure Yet", unit: "job", low: 350, high: 1800, min: 350, included: 1, photos: true, assumptions: "Use this when you know the area but not whether it is boards, posts, railings, framing, or gate hardware." },
    { id: "deck_board_repair", category: "Decks & Fences", subcategory: "Decks", name: "Deck Board Repair", unit: "job", low: 350, high: 1200, min: 350, included: 1, photos: true, assumptions: "Localized deck board replacement or fastening. Hidden framing rot is separate." },
    { id: "decking_replace_sf", category: "Decks & Fences", subcategory: "Decks", name: "Decking Replacement", unit: "sf", low: 0, high: 0, unitLow: 22, unitHigh: 48, min: 650, included: 40, photos: true, siteVisit: true, assumptions: "Square-foot deck surface replacement. Framing rot, stairs, railings, and premium decking are separate." },
    { id: "deck_stair_railing", category: "Decks & Fences", subcategory: "Decks", name: "Deck Stair / Railing Repair", unit: "job", low: 450, high: 1800, min: 450, included: 1, photos: true, siteVisit: true, assumptions: "Small stair, railing, or guard repair. Structural rebuilds need site review." },
    { id: "deck_framing_repair", category: "Decks & Fences", subcategory: "Decks", name: "Deck Framing / Joist Repair", unit: "job", low: 850, high: 3500, min: 850, included: 1, photos: true, siteVisit: true, assumptions: "Structural deck framing repair. Rot extent, access, and code requirements drive the final range." },
    { id: "fence_repair", category: "Decks & Fences", subcategory: "Fences & Gates", name: "Fence / Gate Repair", unit: "job", low: 350, high: 1200, min: 350, included: 1, photos: true, assumptions: "Leaning sections, gate adjustment, loose boards, or localized repair. New fence runs price by scope." },
    { id: "fence_post_replace", category: "Decks & Fences", subcategory: "Fences & Gates", name: "Fence Post Replacement", unit: "item", low: 350, high: 650, unitLow: 225, unitHigh: 450, min: 350, included: 1, photos: true, assumptions: "Per post. Concrete removal, slope, and poor access can move the range." },
    { id: "roof_gutter_not_sure", category: "Roof & Gutters", subcategory: "General / Not Sure", name: "Roof / Gutter Work / Not Sure Yet", unit: "job", low: 350, high: 1800, min: 350, included: 1, photos: true, siteVisit: true, assumptions: "Use this for roofline, leak, drainage, or gutter issues when the exact material or repair is unknown." },
    { id: "gutter_cleaning", category: "Roof & Gutters", subcategory: "Gutters", name: "Gutter Cleaning", unit: "lf", low: 0, high: 0, unitLow: 4, unitHigh: 8, min: 300, included: 60, photos: true, assumptions: "Standard gutter cleaning with safe access. Guards, heavy debris, and steep roofs add cost." },
    { id: "aluminum_gutter_repair", category: "Roof & Gutters", subcategory: "Gutters", name: "Aluminum Gutter / Downspout Repair", unit: "job", low: 350, high: 850, min: 350, included: 1, photos: true, siteVisit: true, assumptions: "Localized aluminum gutter, downspout, seam, or hanger repair." },
    { id: "steel_gutter_repair", category: "Roof & Gutters", subcategory: "Gutters", name: "Steel Gutter Repair", unit: "job", low: 450, high: 1100, min: 450, included: 1, photos: true, siteVisit: true, assumptions: "Galvanized or steel gutter repair. Rust, coatings, and matching can raise the range." },
    { id: "copper_gutter_repair", category: "Roof & Gutters", subcategory: "Gutters", name: "Copper Gutter Repair", unit: "job", low: 700, high: 2200, min: 700, included: 1, photos: true, siteVisit: true, assumptions: "Copper gutter work requires specialty material and careful finish expectations." },
    { id: "gutter_guard_install", category: "Roof & Gutters", subcategory: "Gutters", name: "Gutter Guard Install", unit: "lf", low: 0, high: 0, unitLow: 12, unitHigh: 28, min: 450, included: 40, photos: true, assumptions: "Linear-foot gutter guard install. Product type, roof pitch, and cleaning beforehand change the range." },
    { id: "asphalt_shingle_roof_repair", category: "Roof & Gutters", subcategory: "Roofing", name: "Asphalt Shingle Roof Repair", unit: "job", low: 450, high: 1600, min: 450, included: 1, photos: true, siteVisit: true, assumptions: "Localized shingle, flashing, roof-edge, or minor dry-rot repair. Leak diagnostics are separate if needed." },
    { id: "concrete_tile_roof_repair", category: "Roof & Gutters", subcategory: "Roofing", name: "Concrete Tile Roof Repair", unit: "job", low: 650, high: 2200, min: 650, included: 1, photos: true, siteVisit: true, assumptions: "Concrete tile roof repair. Tile matching, breakage risk, and underlayment issues can move the range." },
    { id: "clay_tile_roof_repair", category: "Roof & Gutters", subcategory: "Roofing", name: "Clay / Spanish Tile Roof Repair", unit: "job", low: 850, high: 3200, min: 850, included: 1, photos: true, siteVisit: true, assumptions: "Clay or Spanish tile is fragile and often needs sourcing/matching. Underlayment issues are separate." },
    { id: "flat_roof_repair", category: "Roof & Gutters", subcategory: "Roofing", name: "Flat / Low-Slope Roof Repair", unit: "job", low: 650, high: 2500, min: 650, included: 1, photos: true, siteVisit: true, assumptions: "Localized membrane, flashing, or drainage repair. Active leak investigation may be separate." },
    { id: "roof_leak_diagnostic", category: "Roof & Gutters", subcategory: "Roofing", name: "Roof Leak Diagnostic Visit", unit: "job", low: 250, high: 450, min: 250, included: 1, photos: true, assumptions: "Diagnostic visit to inspect and identify likely leak source. Repair pricing follows once the issue is confirmed." },
    { id: "interior_not_sure", category: "Interior", subcategory: "General / Not Sure", name: "Interior Repair / Not Sure Yet", unit: "job", low: 250, high: 1200, min: 250, included: 1, photos: true, assumptions: "Use this for interior damage, finish work, or punch-list items when the exact trade is unclear." },
    { id: "drywall_patch_small", category: "Interior", subcategory: "Drywall", name: "Small Drywall Patch", unit: "job", low: 250, high: 450, min: 250, included: 1, photos: true, assumptions: "Small patch with prep and cleanup. Paint and complex texture match can add cost." },
    { id: "drywall_patch_medium", category: "Interior", subcategory: "Drywall", name: "Medium Drywall Patch", unit: "job", low: 450, high: 950, min: 450, included: 1, photos: true, assumptions: "Moderate patching, tape, mud, and texture blend. Paint is separate unless included." },
    { id: "tile_minor_repair", category: "Interior", subcategory: "Tile", name: "Minor Tile / Grout Repair", unit: "job", low: 350, high: 750, min: 350, included: 1, photos: true, assumptions: "Small tile reset, grout blend, or localized repair. Matching risk is separate." },
    { id: "tile_floor_install_sf", category: "Interior", subcategory: "Tile", name: "Floor Tile Install", unit: "sf", low: 0, high: 0, unitLow: 13, unitHigh: 24, min: 850, included: 100, photos: true, siteVisit: true, assumptions: "Square-foot tile install labor. Demo, setting materials, leveling, waterproofing, trim, and baseboard work are separate unless added." },
    { id: "backsplash_tile_sf", category: "Interior", subcategory: "Tile", name: "Backsplash Tile Install", unit: "sf", low: 0, high: 0, unitLow: 35, unitHigh: 75, min: 750, included: 20, photos: true, assumptions: "Square-foot backsplash install labor. Complex patterns, many outlets, and specialty tile add cost." },
    { id: "floor_repair_small", category: "Interior", subcategory: "Floors", name: "Small Floor Repair", unit: "job", low: 450, high: 1200, min: 450, included: 1, photos: true, assumptions: "Localized flooring repair. Matching, leveling, and subfloor damage can increase range." },
    { id: "tv_mount", category: "Interior", subcategory: "Mounting", name: "TV Mount Install", unit: "job", low: 175, high: 450, min: 295, included: 1, assumptions: "Customer-supplied mount. Simple visible cable management only." },
    { id: "furniture_assembly", category: "Interior", subcategory: "Assembly", name: "Furniture Assembly", unit: "item", low: 150, high: 400, min: 295, included: 1, assumptions: "Customer has all parts and hardware. Missing parts can require another trip." },
    { id: "plumbing_not_sure", category: "Plumbing", subcategory: "General / Not Sure", name: "Plumbing Fixture / Not Sure Yet", unit: "job", low: 250, high: 850, min: 250, included: 1, photos: true, assumptions: "Use this when you know it is plumbing-related but are not sure whether it is fixture fit, shutoff, drain, or access work." },
    { id: "toilet_replace", category: "Plumbing", subcategory: "Fixtures", name: "Toilet Replace / Reset", unit: "item", low: 275, high: 550, unitLow: 225, unitHigh: 450, min: 275, included: 1, assumptions: "Straightforward toilet replacement or reset. Fixture and wax ring/materials are separate unless stated." },
    { id: "faucet_replace", category: "Plumbing", subcategory: "Fixtures", name: "Faucet Replace", unit: "item", low: 225, high: 425, unitLow: 175, unitHigh: 325, min: 225, included: 1, assumptions: "Standard faucet swap with working shutoffs. Corroded plumbing adds risk." },
    { id: "garbage_disposal", category: "Plumbing", subcategory: "Fixtures", name: "Garbage Disposal Replace", unit: "item", low: 250, high: 500, unitLow: 200, unitHigh: 400, min: 250, included: 1, assumptions: "Basic disposal swap and reconnect. Electrical or plumbing changes are separate." },
    { id: "electrical_not_sure", category: "Electrical", subcategory: "General / Not Sure", name: "Electrical Fixture / Not Sure Yet", unit: "job", low: 250, high: 900, min: 250, included: 1, photos: true, assumptions: "Use this for small electrical fixture/device work when the exact issue is unclear. No major troubleshooting or panel work included." },
    { id: "light_fixture", category: "Electrical", subcategory: "Fixtures", name: "Light Fixture Swap", unit: "item", low: 175, high: 350, unitLow: 125, unitHigh: 250, min: 175, included: 1, assumptions: "Simple fixture replacement with existing box assumed usable." },
    { id: "outlet_switch", category: "Electrical", subcategory: "Devices", name: "Outlet / Switch Replace", unit: "item", low: 125, high: 225, unitLow: 65, unitHigh: 125, min: 150, included: 1, assumptions: "Minor electrical swaps only. No major troubleshooting or new circuits." },
  ],
  modifiers: [
    { id: "two_story", label: "2-story / ladder access", low: 100, high: 250 },
    { id: "hard_access", label: "Hard to access work area", low: 100, high: 300 },
    { id: "steep_roof", label: "Steep roof / tricky pitch", low: 150, high: 450 },
  ],
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

function quoteRange(low, high) {
  const roundedLow = Math.round(Number(low) || 0);
  const roundedHigh = Math.round(Number(high) || 0);
  if (roundedLow === roundedHigh) return currency(roundedLow);
  return `${currency(roundedLow)}-${currency(roundedHigh)}`;
}

function quoteUnitLabel(unit) {
  const labels = {
    job: "Project count",
    item: "Number of items",
    lf: "Linear feet",
    sf: "Square feet",
    hour: "Hours",
  };
  return labels[unit] || "Quantity";
}

function quoteUnitHint(unit) {
  const hints = {
    job: "Use 1 for a single project area.",
    item: "Count fixtures, posts, doors, or pieces.",
    lf: "Use rough linear footage.",
    sf: "Use rough square footage.",
    hour: "Use the expected labor block.",
  };
  return hints[unit] || "";
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
  const params = new URLSearchParams(window.location.search);
  if (params.get("from") === "quote") {
    const quoteSummary = localStorage.getItem(storageKeys.latestQuoteSummary);
    const message = form.querySelector("textarea[name='message']");
    const serviceType = form.querySelector("select[name='serviceType']");
    if (quoteSummary && message && !message.value.trim()) {
      message.value = quoteSummary;
    }
    if (serviceType && !serviceType.value) {
      serviceType.value = "Repairs";
    }
  }

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
      `Thanks, ${payload.fullName}. We have your request and will follow up after reviewing the job details.`;
    form.reset();
  });
}

function roundQuote(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value < 500) return Math.round(value / 25) * 25;
  return Math.round(value / 50) * 50;
}

function calculateQuoteItem(service, quantity, modifiers, photosAvailable) {
  const qty = Math.max(1, Number(quantity) || 1);
  let low = service.low || 0;
  let high = service.high || 0;

  if (["item", "lf", "sf", "hour"].includes(service.unit) && (service.unitLow || service.unitHigh)) {
    const unitLow = service.unitLow || 0;
    const unitHigh = service.unitHigh || 0;
    low = Math.max(low, unitLow * qty);
    high = Math.max(high, unitHigh * qty);
  }

  let percentTotal = 0;
  modifiers.forEach((modifier) => {
    low += modifier.low || 0;
    high += modifier.high || 0;
    percentTotal += modifier.percent || 0;
  });

  if (percentTotal) {
    const factor = 1 + percentTotal / 100;
    low *= factor;
    high *= factor;
  }

  low = roundQuote(Math.max(service.min || 0, low));
  high = roundQuote(Math.max(low, service.min || 0, high));

  const flags = [];
  if (service.photos && !photosAvailable) flags.push("Photos recommended before final pricing");
  if (service.siteVisit) flags.push("Site visit may be required");
  if (modifiers.some((modifier) => ["two_story", "hard_access", "steep_roof"].includes(modifier.id))) {
    flags.push("Access difficulty included");
  }

  return { low, high, flags };
}

function initQuotePage() {
  const root = document.querySelector("[data-page='quote']");
  if (!root) return;

  const categoryTabs = byId("quote-category-tabs");
  const subcategoryTabs = byId("quote-subcategory-tabs");
  const serviceList = byId("quote-service-list");
  const search = byId("quote-search");
  const quantityLabel = byId("quote-quantity-label");
  const quantity = byId("quote-quantity");
  const location = byId("quote-location");
  const scope = byId("quote-scope");
  const photos = byId("quote-photos");
  const modifierGrid = byId("quote-modifiers");
  const addTopButton = byId("quote-add-service-top");
  const resetButton = byId("quote-reset");
  const totalRange = byId("quote-total-range");
  const resultCopy = byId("quote-result-copy");
  const selectedList = byId("quote-selected-list");
  const flagList = byId("quote-flags");
  const assumptions = byId("quote-assumptions");
  const copyButton = byId("quote-copy");
  const contactLink = byId("quote-contact-link");

  let activeCategory = quoteCatalog.categories[0];
  let activeSubcategory = "All";
  let selectedService = quoteCatalog.services[0];
  let quoteItems = [];

  function selectedModifiers() {
    return [...modifierGrid.querySelectorAll("input:checked")]
      .map((input) => quoteCatalog.modifiers.find((modifier) => modifier.id === input.value))
      .filter(Boolean);
  }

  function serviceMatches(service, query) {
    const categoryMatch = service.category === activeCategory;
    const subcategoryMatch = activeSubcategory === "All" || service.subcategory === activeSubcategory;
    if (!query) return categoryMatch && subcategoryMatch;
    const haystack = `${service.name} ${service.category} ${service.subcategory || ""} ${service.assumptions}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function subcategoriesForActiveCategory() {
    const names = quoteCatalog.services
      .filter((service) => service.category === activeCategory)
      .map((service) => service.subcategory || "Other");
    const unique = [...new Set(names)];
    return ["All", ...unique.sort((a, b) => {
      if (a === "General / Not Sure") return -1;
      if (b === "General / Not Sure") return 1;
      return a.localeCompare(b);
    })];
  }

  function preferredServiceForCategory(category) {
    return (
      quoteCatalog.services.find((service) => service.category === category && service.subcategory === "General / Not Sure")
      || quoteCatalog.services.find((service) => service.category === category)
      || selectedService
    );
  }

  function renderCategories() {
    categoryTabs.innerHTML = "";
    quoteCatalog.categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `quote-category-tab ${category === activeCategory ? "is-selected" : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => {
        activeCategory = category;
        activeSubcategory = "All";
        search.value = "";
        selectedService = preferredServiceForCategory(category);
        renderCategories();
        renderSubcategories();
        renderServices();
        renderPreview();
      });
      categoryTabs.appendChild(button);
    });
  }

  function renderSubcategories() {
    subcategoryTabs.innerHTML = "";
    subcategoriesForActiveCategory().forEach((subcategory) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `quote-subcategory-tab ${subcategory === activeSubcategory ? "is-selected" : ""}`;
      button.textContent = subcategory === "All" ? "Show all" : subcategory;
      button.addEventListener("click", () => {
        activeSubcategory = subcategory;
        selectedService = quoteCatalog.services.find((service) => serviceMatches(service, search.value.trim())) || preferredServiceForCategory(activeCategory);
        renderSubcategories();
        renderServices();
        renderPreview();
      });
      subcategoryTabs.appendChild(button);
    });
  }

  function renderServices() {
    const query = search.value.trim();
    const services = quoteCatalog.services.filter((service) => serviceMatches(service, query));
    serviceList.innerHTML = "";
    services.forEach((service) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `quote-service-option ${service.id === selectedService.id ? "is-selected" : ""}`;
      button.innerHTML = `
        <strong>${service.name}</strong>
        <span>${service.subcategory || service.category} / ${quoteUnitLabel(service.unit)}</span>
        <em>${service.id === selectedService.id ? "Selected - adjust quantity, then add it" : "Tap to select"}</em>
      `;
      button.addEventListener("click", () => {
        selectedService = service;
        renderServices();
        renderPreview();
        quantity.focus({ preventScroll: true });
      });
      serviceList.appendChild(button);
    });
  }

  function renderModifiers() {
    modifierGrid.innerHTML = "";
    quoteCatalog.modifiers.forEach((modifier) => {
      const label = document.createElement("label");
      label.className = "quote-check";
      label.innerHTML = `
        <input type="checkbox" value="${modifier.id}" />
        <span>${modifier.label}</span>
      `;
      label.querySelector("input").addEventListener("change", renderPreview);
      modifierGrid.appendChild(label);
    });
  }

  function currentPreview() {
    return calculateQuoteItem(selectedService, quantity.value, selectedModifiers(), photos.checked);
  }

  function syncQuantityLabel() {
    const label = quoteUnitLabel(selectedService.unit);
    const hint = quoteUnitHint(selectedService.unit);
    quantityLabel.childNodes[0].textContent = label;
    quantity.placeholder = hint;
  }

  function total(items) {
    return items.reduce(
      (acc, item) => ({ low: acc.low + item.low, high: acc.high + item.high }),
      { low: 0, high: 0 }
    );
  }

  function renderFlags(flags) {
    flagList.innerHTML = "";
    if (!flags.length) {
      const item = document.createElement("li");
      item.textContent = "No major flags selected yet.";
      flagList.appendChild(item);
      return;
    }
    [...new Set(flags)].forEach((flag) => {
      const item = document.createElement("li");
      item.textContent = flag;
      flagList.appendChild(item);
    });
  }

  function renderSelectedItems() {
    selectedList.innerHTML = "";
    if (!quoteItems.length) {
      const empty = document.createElement("p");
      empty.className = "quote-empty";
      empty.textContent = "Add one or more scopes to build the total range.";
      selectedList.appendChild(empty);
      return;
    }

    quoteItems.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "quote-selected-item";
      row.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <span>${item.quantity} ${quoteUnitLabel(item.unit).toLowerCase()}${item.location ? ` / ${item.location}` : ""}</span>
        </div>
        <div>
          <b>${quoteRange(item.low, item.high)}</b>
          <button type="button" aria-label="Remove ${item.name}">Remove</button>
        </div>
      `;
      row.querySelector("button").addEventListener("click", () => {
        quoteItems.splice(index, 1);
        renderPreview();
      });
      selectedList.appendChild(row);
    });
  }

  function renderPreview() {
    const preview = currentPreview();
    const combined = quoteItems.length ? total(quoteItems) : preview;
    const allFlags = quoteItems.length ? quoteItems.flatMap((item) => item.flags) : preview.flags;

    syncQuantityLabel();
    totalRange.textContent = quoteRange(combined.low, combined.high);
    resultCopy.textContent = quoteItems.length
      ? `${quoteItems.length} item${quoteItems.length === 1 ? "" : "s"} in this project. Current selection: ${selectedService.name} ${quoteRange(preview.low, preview.high)}.`
      : `${selectedService.name}: ${quoteRange(preview.low, preview.high)} before formal review.`;
    assumptions.textContent = selectedService.assumptions;
    renderSelectedItems();
    renderFlags(allFlags);
  }

  function buildSummaryText() {
    const preview = currentPreview();
    const items = quoteItems.length
      ? quoteItems
      : [{
          name: selectedService.name,
          quantity: quantity.value,
          unit: selectedService.unit,
          low: preview.low,
          high: preview.high,
          flags: preview.flags,
          location: location.value.trim(),
        }];
    const summed = total(items);
    const lines = [
      `Big Iron rough range: ${quoteRange(summed.low, summed.high)}`,
      `Location: ${location.value.trim() || "Not specified"}`,
      `Scope notes: ${scope.value.trim() || "Not specified"}`,
      "",
      "Scopes:",
      ...items.map((item) => `- ${item.name}: ${quoteRange(item.low, item.high)} (${item.quantity} ${quoteUnitLabel(item.unit).toLowerCase()})`),
      "",
      "This is a rough range, not a final estimate.",
    ];
    return lines.join("\n");
  }

  function addCurrentProject() {
    const modifiers = selectedModifiers();
    const preview = currentPreview();
    quoteItems.push({
      id: selectedService.id,
      name: selectedService.name,
      unit: selectedService.unit,
      quantity: Math.max(1, Number(quantity.value) || 1),
      location: location.value.trim(),
      modifiers: modifiers.map((modifier) => modifier.label),
      low: preview.low,
      high: preview.high,
      flags: preview.flags,
      assumptions: selectedService.assumptions,
    });
    saveRecord(storageKeys.quotePreviews, {
      items: quoteItems,
      scope: scope.value.trim(),
      location: location.value.trim(),
    });
    quantity.value = "1";
    photos.checked = false;
    modifierGrid.querySelectorAll("input").forEach((input) => {
      input.checked = false;
    });
    renderPreview();
  }

  addTopButton.addEventListener("click", addCurrentProject);

  contactLink.addEventListener("click", () => {
    localStorage.setItem(storageKeys.latestQuoteSummary, buildSummaryText());
  });

  resetButton.addEventListener("click", () => {
    quoteItems = [];
    quantity.value = "1";
    scope.value = "";
    location.value = "";
    photos.checked = false;
    modifierGrid.querySelectorAll("input").forEach((input) => {
      input.checked = false;
    });
    renderPreview();
  });

  [search, quantity, location, scope, photos].forEach((input) => {
    input.addEventListener("input", () => {
      if (input === search) renderServices();
      renderPreview();
    });
    input.addEventListener("change", renderPreview);
  });

  copyButton.addEventListener("click", async () => {
    const text = buildSummaryText();
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = "Copy Range Summary";
      }, 1400);
    } catch {
      window.prompt("Copy quote summary", text);
    }
  });

  renderCategories();
  renderSubcategories();
  renderServices();
  renderModifiers();
  renderPreview();
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initTestimonials();
  initCarousel();
  initBookingPage();
  initContactPage();
  initQuotePage();
});
