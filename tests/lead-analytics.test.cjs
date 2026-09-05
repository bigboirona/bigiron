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

function harness({ choice = null, storageReadBlocked = false, storageWriteBlocked = false } = {}) {
  const storage = new Map(choice ? [["bigiron_analytics_consent", choice]] : []);
  const scripts = [];
  const buttons = {};
  let banner;
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
      return {
        setAttribute() {},
        remove() { banner = undefined; },
        scrollIntoView() {},
        querySelectorAll() {
          return ["accepted", "declined"].map((value) => {
            const button = { dataset: { consentChoice: value }, addEventListener(name, fn) { this[name] = fn; } };
            buttons[value] = button;
            return button;
          });
        },
      };
    },
  };
  const window = { location: { pathname: "/contact.html", search: "", href: "https://example.test/contact.html" } };
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
      removeItem(key) {
        if (storageWriteBlocked) throw new Error("storage blocked");
        storage.delete(key);
      },
    },
  });
  vm.runInContext(fs.readFileSync(path.join(root, "analytics.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "site.js"), "utf8"), context);
  return {
    context, window, scripts,
    choose(value) {
      if (!buttons[value] || !banner) reset.click({ preventDefault() {} });
      buttons[value].click();
    },
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
  assert.deepEqual(JSON.parse(JSON.stringify(h.events())), [["event", "generate_lead", { form_type: "contact_request", page_path: "/contact.html" }]]);
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
