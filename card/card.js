(() => {
  'use strict';
  const button = document.getElementById('share-card');
  const status = document.getElementById('share-status');
  const url = 'https://bigironconstruction.co/card/';
  if (!button || !status || (!navigator.share && !navigator.clipboard?.writeText)) return;
  button.hidden = false;
  if (!navigator.share) button.firstChild.textContent = 'Copy card link ';
  button.addEventListener('click', async () => {
    status.textContent = '';
    if (navigator.share) {
      try {
        await navigator.share({title: 'Big Iron Construction', text: 'Keep Big Iron handy for the next project.', url});
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link copied. Paste it into a text to share.';
    } catch (_) {
      status.textContent = 'You can copy the card link below to share it.';
    }
  });
})();
