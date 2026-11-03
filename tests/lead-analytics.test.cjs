const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const acceptedReceipt = {
  ok: true,
  intake_row_id: "web-contact_synthetic12345678",
  duplicate: false,
};

function harness({ choice = null, adsChoice = null, gpc = false, storageReadBlocked = false, storageWriteBlocked = false } = {}) {
  const storage = new Map();
  if (choice) storage.set("bigiron_analytics_consent", choice);
  if (adsChoice) storage.set("bigiron_ads_measurement_consent", adsChoice);
  const scripts = [];
  let banner;
  let controls;
  const reset = { addEventListener(name, fn) { this[name] = fn; } };
  const document = {
    readyState: "complete",
    addEventListener() {},
    querySelectorAll: () => [reset],
    getElementById: () => banner,
    head: { appendChild(script) { scripts.push(script); } },
    body: { appendChild(node) { banner = node; } },
    createElement(tag) {
      if (tag === "script") return {};
      controls = Object.fromEntries(["data-measurement-analytics", "data-measurement-ads", "data-measurement-gpc", "data-consent-save", "data-consent-decline"].map(name => [name, {
        checked: false, disabled: false, hidden: false,
        addEventListener(event, callback) { this[event] = callback; },
      }]));
      const current = controls;
      return {
        setAttribute() {},
        remove() { banner = undefined; },
        scrollIntoView() {},
        querySelector(selector) { return current[selector.slice(1, -1)]; },
      };
    },
  };
  const window = {
    navigator: { globalPrivacyControl: gpc },
    location: { pathname: "/contact.html", search: "", href: "https://example.test/contact.html" },
  };
  const context = vm.createContext({
    window, document, URL, URLSearchParams,
    localStorage: {
      getItem(key) {
        if (storageReadBlocked) throw new Error("storage blocked");
        return storage.get(key) || null;
      },
      setItem(key, value) {
        if (storageWriteBlocked) throw new Error("storage blocked");
        storage.set(key, value);
      },
    },
  });
  vm.runInContext(fs.readFileSync(path.join(root, "analytics.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "site.js"), "utf8"), context);
  const openChoices = () => { if (!banner) reset.click({ preventDefault() {} }); };
  const chooseChoices = ({ analytics = false, ads = false } = {}) => {
    openChoices();
    controls["data-measurement-analytics"].checked = analytics;
    controls["data-measurement-ads"].checked = ads;
    controls["data-consent-save"].click();
  };
  return {
    context, window, scripts, storage,
    choose(value) { chooseChoices({ analytics: value === "accepted", ads: false }); },
    chooseChoices,
    openChoices,
    control(name) { return controls[name]; },
    declineAll() { openChoices(); controls["data-consent-decline"].click(); },
    commands() { return JSON.parse(JSON.stringify((window.dataLayer || []).map(args => Array.from(args)))); },
    events() { return (window.dataLayer || []).map((args) => Array.from(args)).filter((args) => args[0] === "event"); },
  };
}

test("unknown and declined consent load no tag and emit no completion event", () => {
  const h = harness();
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
  h.choose("declined");
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
  assert.equal(h.scripts.length, 0);
  assert.equal(h.events().length, 0);
});

test("saved lead emits one GA4 event with only non-personal fields", () => {
  const h = harness({ choice: "accepted" });
  const receipt = { ...acceptedReceipt, fullName: "Synthetic Person", email: "synthetic@example.test", phone: "8315550100", message: "Private synthetic scope" };
  assert.equal(h.window.bigIronTrackLead(receipt, "contact_request"), true);
  assert.equal(h.window.bigIronTrackLead({ ...receipt, duplicate: true }, "contact_request"), false);
  assert.equal(h.scripts.length, 1);
  assert.match(h.scripts[0].src, /id=G-XT8VM244F8$/);
  assert.deepEqual(JSON.parse(JSON.stringify(h.events())), [["event", "generate_lead", { form_type: "contact_request", page_path: "/contact.html", send_to: "G-XT8VM244F8" }]]);
  const consent = Array.from(h.window.dataLayer[0]);
  assert.equal(consent[0], "consent");
  assert.equal(consent[2].ad_storage, "denied");
  assert.equal(consent[2].ad_user_data, "denied");
  assert.equal(consent[2].ad_personalization, "denied");
});

test("first observed idempotent success after a lost response is counted once", () => {
  const h = harness({ choice: "accepted" });
  const receipt = { ...acceptedReceipt, duplicate: true };
  assert.equal(h.window.bigIronTrackLead(receipt, "contact_request"), true);
  assert.equal(h.window.bigIronTrackLead(receipt, "contact_request"), false);
  assert.equal(h.events().length, 1);
});

test("invalid, incomplete and wrong-form receipts cannot count as leads", () => {
  const h = harness({ choice: "accepted" });
  for (const receipt of [null, { ok: true }, { ...acceptedReceipt, ok: false }, { ...acceptedReceipt, duplicate: undefined }, { ...acceptedReceipt, intake_row_id: "arbitrary" }]) {
    assert.equal(h.window.bigIronTrackLead(receipt, "contact_request"), false);
  }
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "booking_request"), false);
  assert.equal(h.events().length, 0);
});

test("explicit consent works with blocked storage and re-acceptance restores analytics", () => {
  const h = harness({ storageReadBlocked: true, storageWriteBlocked: true });
  h.choose("accepted");
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), true);
  h.choose("declined");
  assert.equal(h.window["ga-disable-G-XT8VM244F8"], true);
  const next = { ...acceptedReceipt, intake_row_id: "web-contact_synthetic98765432" };
  assert.equal(h.window.bigIronTrackLead(next, "contact_request"), false);
  h.choose("accepted");
  assert.equal(h.window["ga-disable-G-XT8VM244F8"], false);
  assert.equal(h.window.bigIronTrackLead(next, "contact_request"), true);
  assert.equal(h.scripts.length, 1);
  assert.equal(h.events().length, 2);
});

test("current explicit choice wins when an older stored choice cannot be overwritten", () => {
  const h = harness({ choice: "declined", storageWriteBlocked: true });
  h.choose("accepted");
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), true);
});

test("HTTP200 HTML and error-shaped responses do not prove a saved intake", async () => {
  for (const response of [
    { ok: true, json: async () => { throw new Error("HTML instead of JSON"); } },
    { ok: true, json: async () => ({ ok: false }) },
    { ok: true, json: async () => ({ ...acceptedReceipt, intake_row_id: "web-contact_another12345678" }) },
  ]) {
    const h = harness({ choice: "accepted" });
    h.context.fetch = async () => response;
    assert.equal(await h.context.sendWebsiteLead({ submissionId: "contact_synthetic12345678" }), null);
    assert.equal(h.events().length, 0);
  }
});

test("API fallback preserves the idempotency key and accepts only the matching receipt", async () => {
  const h = harness({ choice: "accepted" });
  const calls = [];
  h.context.fetch = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return calls.length === 1
      ? { ok: false }
      : { ok: true, json: async () => ({ ...acceptedReceipt, duplicate: true }) };
  };
  const receipt = await h.context.sendWebsiteLead({ submissionId: "contact_synthetic12345678" });
  assert.equal(receipt.intake_row_id, acceptedReceipt.intake_row_id);
  assert.equal(receipt.duplicate, true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body.submissionId, calls[1].body.submissionId);
  assert.equal(h.events().length, 0, "network helper alone must not emit a conversion");
});

const adsTarget = "AW-17881504685/w53tCN7K8rAdEK23yM5C";
const adsEvents = h => h.commands().filter(args => args[0] === "event" && args[1] === "conversion");
const adsConfigs = h => h.commands().filter(args => args[0] === "config" && args[1] === "AW-17881504685");
const consentUpdates = h => h.commands().filter(args => args[0] === "consent" && args[1] === "update");

test("both new choices default off and saving defaults never configures Ads", () => {
  const h = harness();
  assert.equal(h.control("data-measurement-analytics").checked, false);
  assert.equal(h.control("data-measurement-ads").checked, false);
  h.chooseChoices();
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
  assert.equal(h.scripts.length, 0);
  assert.equal(adsConfigs(h).length, 0);
  assert.equal(adsEvents(h).length, 0);
});

test("legacy analytics acceptance and Analytics-only events never authorize Ads", () => {
  const h = harness({ choice: "accepted" });
  assert.equal(h.control("data-measurement-analytics").checked, true);
  assert.equal(h.control("data-measurement-ads").checked, false);
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), true);
  assert.equal(adsConfigs(h).length, 0);
  assert.equal(adsEvents(h).length, 0);
  assert.equal(h.scripts.length, 1);
  assert.match(h.scripts[0].src, /id=G-XT8VM244F8$/);
  assert.ok(consentUpdates(h).every(args => args[2].ad_storage === "denied" && args[2].ad_user_data === "denied"));
});

test("Ads-only explicit consent sends exact destination, zero value and opaque stable transaction only", () => {
  const h = harness();
  h.chooseChoices({ ads: true });
  assert.equal(h.scripts.length, 1);
  assert.match(h.scripts[0].src, /id=AW-17881504685$/);
  assert.equal(h.commands().some(args => args[0] === "config" && args[1] === "G-XT8VM244F8"), false);
  const privateReceipt = { ...acceptedReceipt, fullName: "Synthetic Private", email: "private@example.test", phone: "8315550199", address: "Private Place", message: "Private Scope" };
  assert.equal(h.window.bigIronTrackLead(privateReceipt, "contact_request"), true);
  assert.deepEqual(adsEvents(h), [["event", "conversion", { send_to: adsTarget, value: 0, currency: "USD", transaction_id: acceptedReceipt.intake_row_id }]]);
  assert.equal(h.events().some(args => args[1] === "generate_lead"), false);
  assert.equal(/Synthetic Private|private@example|8315550199|Private Place|Private Scope/.test(JSON.stringify(h.commands())), false);
  assert.equal(Object.hasOwn(adsEvents(h)[0][2], "user_data"), false);
  assert.equal(Object.hasOwn(adsEvents(h)[0][2], "user_id"), false);
  assert.equal(consentUpdates(h).at(-1)[2].analytics_storage, "denied");
  assert.equal(consentUpdates(h).at(-1)[2].ad_user_data, "granted");
});

test("both opt-ins share one loader and keep Analytics and Ads events destination-specific", () => {
  const h = harness();
  h.chooseChoices({ analytics: true, ads: true });
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), true);
  assert.equal(h.scripts.length, 1);
  assert.equal(adsConfigs(h).length, 1);
  assert.equal(h.events().length, 2);
  assert.equal(adsEvents(h).length, 1);
  h.window.bigIronTrackEvent("card_action", { send_to: adsTarget });
  assert.equal(h.commands().filter(args => args[0] === "event" && args[1] === "card_action")[0][2].send_to, "G-XT8VM244F8");
  assert.ok(consentUpdates(h).every(args => args[2].ad_personalization === "denied"));
  assert.ok(h.commands().some(args => args[0] === "set" && args[1] === "allow_ad_personalization_signals" && args[2] === false));
});

test("GPC overrides a saved Ads opt-in, disables its control and cannot be bypassed by Save", () => {
  const h = harness({ choice: "accepted", adsChoice: "accepted", gpc: true });
  assert.equal(adsConfigs(h).length, 0);
  assert.equal(h.storage.get("bigiron_ads_measurement_consent"), "declined");
  h.openChoices();
  assert.equal(h.control("data-measurement-ads").checked, false);
  assert.equal(h.control("data-measurement-ads").disabled, true);
  assert.equal(h.control("data-measurement-gpc").hidden, false);
  h.chooseChoices({ analytics: true, ads: true });
  h.window.bigIronTrackLead(acceptedReceipt, "contact_request");
  assert.equal(adsEvents(h).length, 0);
  assert.equal(adsConfigs(h).length, 0);
});

test("a new GPC signal revokes Ads before another lead and persists the opt-out", () => {
  const h = harness({ adsChoice: "accepted", choice: "declined" });
  h.window.navigator.globalPrivacyControl = true;
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
  assert.equal(adsEvents(h).length, 0);
  assert.equal(consentUpdates(h).at(-1)[2].ad_storage, "denied");
  assert.equal(h.storage.get("bigiron_ads_measurement_consent"), "declined");
  h.window.navigator.globalPrivacyControl = false;
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
});

test("withdrawal stops new Ads events while keeping independently accepted Analytics", () => {
  const h = harness({ choice: "accepted", adsChoice: "accepted" });
  h.window.bigIronTrackLead(acceptedReceipt, "contact_request");
  h.chooseChoices({ analytics: true, ads: false });
  h.window.bigIronTrackLead({ ...acceptedReceipt, intake_row_id: "web-contact_secondsynthetic1234" }, "contact_request");
  assert.equal(adsEvents(h).length, 1);
  assert.equal(h.events().filter(args => args[1] === "generate_lead").length, 2);
  assert.equal(consentUpdates(h).at(-1)[2].ad_storage, "denied");
  assert.equal(consentUpdates(h).at(-1)[2].ad_user_data, "denied");
  assert.equal(h.scripts.length, 1);
});

test("blocked storage still requires current explicit Ads choice and current decline wins", () => {
  const h = harness({ storageReadBlocked: true, storageWriteBlocked: true });
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
  h.chooseChoices({ ads: true });
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), true);
  h.declineAll();
  assert.equal(h.window.bigIronTrackLead({ ...acceptedReceipt, intake_row_id: "web-contact_nextsynthetic1234" }, "contact_request"), false);
  const old = harness({ adsChoice: "accepted", storageWriteBlocked: true });
  old.declineAll();
  assert.equal(old.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
});

test("retry and lost-response receipt emits one Ads conversion per durable opaque ID", () => {
  const h = harness({ adsChoice: "accepted" });
  const receipt = { ...acceptedReceipt, duplicate: true };
  assert.equal(h.window.bigIronTrackLead(receipt, "contact_request"), true);
  assert.equal(h.window.bigIronTrackLead(receipt, "contact_request"), false);
  assert.equal(adsEvents(h).length, 1);
  assert.equal(adsEvents(h)[0][2].transaction_id, acceptedReceipt.intake_row_id);
  const reload = harness({ adsChoice: "accepted" });
  reload.window.bigIronTrackLead(receipt, "contact_request");
  assert.equal(adsEvents(reload)[0][2].transaction_id, adsEvents(h)[0][2].transaction_id);
});

test("booking receipt works, wrong or invalid receipt and calculator activity cannot convert", () => {
  const h = harness({ adsChoice: "accepted" });
  for (const receipt of [null, {}, { ...acceptedReceipt, ok: false }, { ...acceptedReceipt, duplicate: undefined }, { ...acceptedReceipt, intake_row_id: "arbitrary" }]) {
    assert.equal(h.window.bigIronTrackLead(receipt, "contact_request"), false);
  }
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "booking_request"), false);
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "quote_calculation"), false);
  h.context.quoteRange(100, 200);
  h.context.newSubmissionId("contact");
  assert.equal(adsEvents(h).length, 0);
  const booking = { ...acceptedReceipt, intake_row_id: "web-booking_synthetic12345678" };
  assert.equal(h.window.bigIronTrackLead(booking, "booking_request"), true);
  assert.equal(adsEvents(h).length, 1);
});

test("overlong receipt IDs are never truncated into a misleading Ads transaction", () => {
  const h = harness({ adsChoice: "accepted" });
  assert.equal(h.window.bigIronTrackLead({ ...acceptedReceipt, intake_row_id: "web-contact_" + "a".repeat(60) }, "contact_request"), false);
  assert.equal(adsEvents(h).length, 0);
});

test("network failures and unmatched200 responses cannot emit Ads even with consent", async () => {
  for (const response of [null, { ok: false }, { ok: true, json: async () => ({ ok: false }) }, { ok: true, json: async () => ({ ...acceptedReceipt, intake_row_id: "web-contact_unmatched1234567" }) }]) {
    const h = harness({ adsChoice: "accepted" });
    h.context.fetch = async () => { if (!response) throw new Error("network failure"); return response; };
    assert.equal(await h.context.sendWebsiteLead({ submissionId: "contact_synthetic12345678" }), null);
    assert.equal(adsEvents(h).length, 0);
  }
});

test("measurement exception cannot interrupt a successfully delivered request", () => {
  const h = harness({ adsChoice: "accepted", choice: "accepted" });
  h.window.gtag = () => { throw new Error("synthetic blocked measurement"); };
  assert.doesNotThrow(() => h.window.bigIronTrackLead(acceptedReceipt, "contact_request"));
  assert.equal(h.window.bigIronTrackLead(acceptedReceipt, "contact_request"), false);
});
