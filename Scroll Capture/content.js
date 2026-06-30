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
      // Just scroll the page itself, nothing else.
      const scrollAmt = window.innerHeight * 0.85; 
      
      window.scrollBy({ top: scrollAmt, behavior: 'smooth' });

      // Fallback in case smooth scroll is blocked
      setTimeout(() => {
        if (window.scrollY === 0) {
           window.scrollBy(0, scrollAmt);
        }
        chrome.runtime.sendMessage({ type: 'SCROLL_DONE' });
      }, 700);
      
      return true;
    }

  });

})();
