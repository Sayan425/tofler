// content.js
// Only handles scrolling — PDF is built in background.js now

(function () {
  if (window.__scrollCaptureLoaded) return;
  window.__scrollCaptureLoaded = true;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.type === 'PING') {
      sendResponse({ ok: true });
      return true;
    }

    if (msg.type === 'DO_SCROLL') {
      const scrollAmt = window.innerHeight;
      window.scrollBy({ top: scrollAmt, behavior: 'smooth' });
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'SCROLL_DONE' });
      }, 700);
      return true;
    }

  });

})();
