(() => {
  'use strict';
  const match = /^#c=([A-Za-z0-9_-]{24})$/.exec(window.location.hash);
  const token = match ? match[1] : null;
  // Remove recipient attribution before other page resources or scripts run.
  if (window.location.hash.startsWith('#c=')) {
    try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch (_) {}
  }
  if (!token) return;

  const consentKey = 'bigiron_analytics_consent';
  const endpoint = 'https://jobs.bigironconstruction.co/api/public/card-engagement';
  let choice = null;
  let opened = false;
  let openTimer = null;
  try { choice = localStorage.getItem(consentKey); } catch (_) {}

  const record = event => {
    if (choice !== 'accepted' || typeof crypto.randomUUID !== 'function') return;
    try {
      fetch(endpoint, {
        method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
        referrerPolicy: 'no-referrer', headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({token, event, event_id: crypto.randomUUID()})
      }).catch(() => {});
    } catch (_) {
      // Card saving and sharing always work when measurement is unavailable.
    }
  };

  const scheduleOpen = () => {
    clearTimeout(openTimer);
    if (opened || choice !== 'accepted' || document.visibilityState !== 'visible') return;
    openTimer = setTimeout(() => {
      if (choice !== 'accepted' || document.visibilityState !== 'visible') return;
      opened = true;
      record('page_open');
    }, 1500);
  };

  const initialize = () => {
    document.addEventListener('click', event => {
      if (!event.isTrusted || choice !== 'accepted') return;
      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;
      const target = new URL(anchor.href, document.baseURI);
      if (target.origin === window.location.origin && target.pathname.endsWith('/Big-Iron-Construction.vcf')) {
        record('save_contact_tap');
      }
    });
    document.addEventListener('visibilitychange', scheduleOpen);
    scheduleOpen();
    if (choice === 'accepted' || choice === 'declined') return;

    const panel = document.createElement('section');
    panel.className = 'card-analytics-choice';
    panel.setAttribute('aria-label', 'Optional card analytics');
    panel.innerHTML = '<p>Allow Big Iron to see when this card link is opened or “Save our contact” is tapped? <a href="/privacy.html">Privacy</a></p><div><button type="button" data-card-choice="declined">No thanks</button><button type="button" data-card-choice="accepted">Allow</button></div>';
    panel.querySelectorAll('[data-card-choice]').forEach(button => {
      button.addEventListener('click', () => {
        choice = button.dataset.cardChoice;
        try { localStorage.setItem(consentKey, choice); } catch (_) {}
        panel.remove();
        scheduleOpen();
      });
    });
    document.querySelector('.contact-card footer')?.appendChild(panel);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once: true});
  else initialize();
})();
