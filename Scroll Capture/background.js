// background.js
importScripts('jspdf.umd.min.js');

let captureSession = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_CAPTURE') {
    startCapture(msg.tabId, msg.count, msg.delay);
  }
  if (msg.type === 'SCROLL_DONE') {
    if (captureSession) captureSession.scrollResolve?.();
  }
});

async function ensureContentScript(tabId) {
  try {
    const resp = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    if (resp?.ok) return;
  } catch (e) {}

  await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  await sleep(300);

  const resp = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
  if (!resp?.ok) throw new Error('Content script failed. Please refresh the page and try again.');
}

async function startCapture(tabId, count, delay) {
  captureSession = { tabId, count, delay, screenshots: [], scrollResolve: null };

  try {
    await ensureContentScript(tabId);

    for (let i = 0; i < count; i++) {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 95 });
      captureSession.screenshots.push(dataUrl);

      chrome.runtime.sendMessage({ type: 'PROGRESS', current: i + 1, total: count }).catch(() => {});

      if (i < count - 1) {
        await new Promise((resolve) => {
          captureSession.scrollResolve = resolve;
          chrome.tabs.sendMessage(tabId, { type: 'DO_SCROLL' });
          setTimeout(resolve, delay + 2000);
        });
        await sleep(delay);
      }
    }

    chrome.runtime.sendMessage({ type: 'PROGRESS', current: count, total: count }).catch(() => {});
    await buildAndDownloadPDF(captureSession.screenshots);
    chrome.runtime.sendMessage({ type: 'DONE', total: captureSession.screenshots.length }).catch(() => {});

  } catch (err) {
    console.error('[ScrollCapture]', err);
    chrome.runtime.sendMessage({ type: 'ERROR', message: err.message || 'Unknown error.' }).catch(() => {});
  }

  captureSession = null;
}

async function buildAndDownloadPDF(screenshots) {
  const { jsPDF } = jspdf;

  // Get dimensions via createImageBitmap (works in service workers)
  const firstBlob = await (await fetch(screenshots[0])).blob();
  const firstBitmap = await createImageBitmap(firstBlob);
  const imgW = firstBitmap.width;
  const imgH = firstBitmap.height;
  firstBitmap.close();

  const pdf = new jsPDF({
    orientation: imgW >= imgH ? 'landscape' : 'portrait',
    unit: 'px',
    format: [imgW, imgH],
    hotfixes: ['px_scaling']
  });

  for (let i = 0; i < screenshots.length; i++) {
    if (i > 0) pdf.addPage([imgW, imgH], imgW >= imgH ? 'landscape' : 'portrait');
    // Pass the raw base64 data string (strip the data:image/png;base64, prefix)
    const b64 = screenshots[i].split(',')[1];
    pdf.addImage(b64, 'PNG', 0, 0, imgW, imgH, undefined, 'FAST');
  }

  // output as base64 string — works fine in service workers
  const base64pdf = pdf.output('datauristring');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  await chrome.downloads.download({
    url: base64pdf,
    filename: `ScrollCapture_${timestamp}.pdf`,
    saveAs: false
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
