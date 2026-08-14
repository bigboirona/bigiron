(() => {
  "use strict";

  const measurementId = "G-XT8VM244F8";
  const consentKey = "bigiron_analytics_consent";
  const validChoices = new Set(["accepted", "declined"]);

  function readChoice() {
    try {
      const choice = localStorage.getItem(consentKey);
      return validChoices.has(choice) ? choice : null;
    } catch {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(consentKey, choice);
    } catch {
      // Consent still applies for this page even when storage is unavailable.
    }
  }

  function loadAnalytics() {
    if (window.bigIronAnalyticsLoaded) return;
    window[`ga-disable-${measurementId}`] = false;
    window.bigIronAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  function removeBanner() {
    document.getElementById("analytics-consent")?.remove();
  }

  function setChoice(choice) {
    saveChoice(choice);
    removeBanner();
    if (choice === "accepted") {
      loadAnalytics();
      return;
    }
    window[`ga-disable-${measurementId}`] = true;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
  }

  function showBanner() {
    if (document.getElementById("analytics-consent")) return;
    const banner = document.createElement("section");
    banner.id = "analytics-consent";
    banner.className = "analytics-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Analytics choice");
    banner.innerHTML = `
      <div>
        <strong>Optional website analytics</strong>
        <p>Big Iron uses Google Analytics only if you accept. It helps us understand site visits and form completion; we do not send your form details to Analytics. <a href="${window.location.pathname.includes("/handyman-") ? "../privacy.html" : "privacy.html"}">Privacy notice</a></p>
      </div>
      <div class="analytics-consent-actions">
        <button type="button" class="button button-secondary" data-consent-choice="declined">Decline</button>
        <button type="button" class="button button-primary" data-consent-choice="accepted">Accept analytics</button>
      </div>
    `;
    banner.querySelectorAll("[data-consent-choice]").forEach((button) => {
      button.addEventListener("click", () => setChoice(button.dataset.consentChoice));
    });
    document.body.appendChild(banner);
  }

  function initialize() {
    const choice = readChoice();
    if (choice === "accepted") loadAnalytics();
    if (!choice) showBanner();

    document.querySelectorAll("[data-analytics-consent-reset]").forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        try {
          localStorage.removeItem(consentKey);
        } catch {
          // The banner can still be shown without persistent storage.
        }
        showBanner();
        document.getElementById("analytics-consent")?.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  window.bigIronTrackEvent = (eventName, parameters = {}) => {
    if (readChoice() !== "accepted") return false;
    loadAnalytics();
    window.gtag("event", eventName, parameters);
    return true;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
