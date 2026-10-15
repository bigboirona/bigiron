(() => {
  'use strict';
  const button = document.getElementById('share-card');
  const status = document.getElementById('share-status');
  const url = 'https://bigironconstruction.co/card/';
  const options = document.getElementById('share-options');
  const dialog = document.getElementById('qr-dialog');
  const showQr = document.getElementById('show-qr');
  const closeQr = document.getElementById('close-qr');

  const copyLink = async (output, container) => {
    output.textContent = '';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(url);
      output.textContent = 'Link copied. Paste it into a text to share.';
    } catch (_) {
      if (container === options) options.open = true;
      const manual = container.querySelector('.manual-link');
      if (manual) {
        manual.hidden = false;
        const field = manual.querySelector('input');
        field.focus();
        field.select();
      }
      output.textContent = 'Select and copy the card link below.';
    }
  };

  if (button && status && options) {
    button.hidden = false;
    if (!navigator.share) button.firstChild.textContent = 'Copy link ';
    button.addEventListener('click', async () => {
      status.textContent = '';
      if (navigator.share) {
        try {
          await navigator.share({title: 'Big Iron Construction', text: 'Keep Big Iron handy for the next project.', url});
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }
      await copyLink(status, options);
    });
  }

  document.querySelectorAll('[data-copy-card]').forEach(copy => {
    copy.hidden = false;
    copy.addEventListener('click', () => {
      const inDialog = copy.closest('dialog');
      const output = inDialog ? document.getElementById('qr-status') : status;
      const container = inDialog || options;
      if (output && container) copyLink(output, container);
    });
  });

  if (showQr && dialog && closeQr) {
    showQr.hidden = false;
    let returnFocus;
    showQr.addEventListener('click', () => {
      if (typeof dialog.showModal !== 'function') {
        window.location.assign('card-qr.svg');
        return;
      }
      returnFocus = document.activeElement;
      document.getElementById('qr-status').textContent = '';
      if (!dialog.open) dialog.showModal();
    });
    closeQr.addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(control => control.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      if (returnFocus?.isConnected) returnFocus.focus();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        dialog.close();
      }
    });
  }

  // Keep the manual URL available even when JavaScript cannot use clipboard.
  if (!navigator.clipboard?.writeText && options) {
    const manual = options.querySelector('.manual-link');
    if (manual) manual.hidden = false;
  }
})();
