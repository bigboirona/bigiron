(() => {
  "use strict";

  const measurementId = "G-XT8VM244F8";
  const adsId = "AW-17881504685";
  const adsDestination = "AW-17881504685/w53tCN7K8rAdEK23yM5C";
  const consentKey = "bigiron_analytics_consent";
  const adsConsentKey = "bigiron_ads_measurement_consent";
  const validChoices = new Set(["accepted", "declined"]);
  const pageChoices = new Map();
  const recordedLeadReceipts = new Set();
  const recordedAdReceipts = new Set();
  let tagInitialized = false;
  let tagLoaded = false;
  let adsConfigured = false;

  function readChoice(key) {
    if (pageChoices.has(key)) return pageChoices.get(key);
    try {
      const choice = localStorage.getItem(key);
      return validChoices.has(choice) ? choice : null;
    } catch {
      return null;
    }
  }

  function saveChoice(key, choice) {
    pageChoices.set(key, choice);
    try {
      localStorage.setItem(key, choice);
    } catch {
      // Current choices still apply when browser storage is unavailable.
    }
  }

  function globalPrivacyControl() {
    return window.navigator?.globalPrivacyControl === true;
  }

  function adsAllowed() {
    if (globalPrivacyControl()) {
      if (readChoice(adsConsentKey) !== "declined") saveChoice(adsConsentKey, "declined");
      return false;
    }
    return readChoice(adsConsentKey) === "accepted";
  }

  function applyChoices() {
    const analytics = readChoice(consentKey) === "accepted";
    const ads = adsAllowed();
    window[`ga-disable-${measurementId}`] = !analytics;
    if (!tagInitialized && !analytics && !ads) return;

    if (!tagInitialized) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
      };
      // Defaults precede every config/event; no library loads without opt-in.
      window.gtag("consent", "default", {
        analytics_storage: "denied", ad_storage: "denied",
        ad_user_data: "denied", ad_personalization: "denied",
      });
      window.gtag("set", "allow_ad_personalization_signals", false);
      window.gtag("set", "ads_data_redaction", true);
      window.gtag("js", new Date());
      tagInitialized = true;
    }
    window.gtag("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: ads ? "granted" : "denied",
      ad_user_data: ads ? "granted" : "denied",
      ad_personalization: "denied",
    });
    if (analytics && !window.bigIronAnalyticsLoaded) {
      window.gtag("config", measurementId, {
        allow_google_signals: false, allow_ad_personalization_signals: false,
      });
      window.bigIronAnalyticsLoaded = true;
    }
    if (ads && !adsConfigured) {
      window.gtag("config", adsId, { allow_ad_personalization_signals: false });
      adsConfigured = true;
    }
    if (!tagLoaded) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analytics ? measurementId : adsId)}`;
      document.head.appendChild(script);
      tagLoaded = true;
    }
  }

  function removeBanner() {
    document.getElementById("analytics-consent")?.remove();
  }

  function setChoices(analytics, ads) {
    saveChoice(consentKey, analytics ? "accepted" : "declined");
    saveChoice(adsConsentKey, ads && !globalPrivacyControl() ? "accepted" : "declined");
    removeBanner();
    applyChoices();
  }

  function showBanner() {
    if (document.getElementById("analytics-consent")) return;
    const banner = document.createElement("section");
    banner.id = "analytics-consent";
    banner.className = "analytics-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Optional measurement choices");
    banner.innerHTML = `
      <div>
        <strong>Optional website measurement</strong>
        <p>Choose either, both, or neither. The site and request forms work either way. <a href="${window.location.pathname.includes("/handyman-") ? "../privacy.html" : "privacy.html"}">Privacy notice</a></p>
        <div class="measurement-choices">
          <label><input type="checkbox" data-measurement-analytics> <span>Website analytics: allow Google Analytics to measure visits and completed requests.</span></label>
          <label><input type="checkbox" data-measurement-ads> <span>Ad measurement: allow Google Ads cookies and click information to measure which ads lead to a completed request. No form details or personalized ads.</span></label>
        </div>
        <p data-measurement-gpc hidden>Your Global Privacy Control signal keeps ad measurement off.</p>
      </div>
      <div class="analytics-consent-actions">
        <button type="button" class="button button-secondary" data-consent-decline>Decline all</button>
        <button type="button" class="button button-primary" data-consent-save>Save choices</button>
      </div>
    `;
    const analytics = banner.querySelector("[data-measurement-analytics]");
    const ads = banner.querySelector("[data-measurement-ads]");
    analytics.checked = readChoice(consentKey) === "accepted";
    ads.checked = adsAllowed();
    ads.disabled = globalPrivacyControl();
    banner.querySelector("[data-measurement-gpc]").hidden = !globalPrivacyControl();
    banner.querySelector("[data-consent-decline]").addEventListener("click", () => setChoices(false, false));
    banner.querySelector("[data-consent-save]").addEventListener("click", () => setChoices(analytics.checked, ads.checked));
    document.body.appendChild(banner);
  }

  function initialize() {
    const analyticsChoice = readChoice(consentKey);
    const adsChoice = readChoice(adsConsentKey);
    applyChoices();
    // Legacy analytics acceptance never supplies a positive Ads choice.
    if (!analyticsChoice || !adsChoice) showBanner();
    document.querySelectorAll("[data-analytics-consent-reset]").forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        showBanner();
        document.getElementById("analytics-consent")?.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  window.bigIronTrackEvent = (eventName, parameters = {}) => {
    if (readChoice(consentKey) !== "accepted") return false;
    try {
      applyChoices();
      // An Analytics event must not broadcast to the Ads destination.
      window.gtag("event", eventName, { ...parameters, send_to: measurementId });
      return true;
    } catch {
      return false;
    }
  };

  window.bigIronTrackLead = (receipt, formType) => {
    const prefix = { contact_request: "contact", booking_request: "booking" }[formType];
    if (!prefix || receipt?.ok !== true || typeof receipt.duplicate !== "boolean"
        || typeof receipt.intake_row_id !== "string"
        || !new RegExp(`^web-${prefix}_[A-Za-z0-9_-]{4,72}$`).test(receipt.intake_row_id)) return false;

    let recorded = false;
    if (!recordedLeadReceipts.has(receipt.intake_row_id)) {
      const analyticsRecorded = window.bigIronTrackEvent("generate_lead", {
        form_type: formType, page_path: window.location.pathname,
      });
      if (analyticsRecorded) recordedLeadReceipts.add(receipt.intake_row_id);
      recorded = analyticsRecorded;
    }
    // Current generated receipt IDs are opaque and under Google's 64-character
    // transaction limit. Never truncate a longer ID and risk a collision.
    if (adsAllowed() && receipt.intake_row_id.length <= 64
        && !recordedAdReceipts.has(receipt.intake_row_id)) {
      try {
        applyChoices();
        window.gtag("event", "conversion", {
          send_to: adsDestination, value: 0, currency: "USD",
          transaction_id: receipt.intake_row_id,
        });
        recordedAdReceipts.add(receipt.intake_row_id);
        recorded = true;
      } catch {
        // Optional measurement must not interrupt successful request delivery.
      }
    } else if (globalPrivacyControl()) {
      try { applyChoices(); } catch { /* Keep an opt-out effective. */ }
    }
    return recorded;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
