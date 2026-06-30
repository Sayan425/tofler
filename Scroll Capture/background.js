// background.js
importScripts('jspdf.umd.min.js');

let captureSession = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_CAPTURE') {
    startCapture(msg.tabId, msg.url, msg.count, msg.delay, msg.format);
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

async function startCapture(tabId, url, count, delay, format) {
  captureSession = { tabId, url, count, delay, format, screenshots: [], scrollResolve: null };

  try {
    await ensureContentScript(tabId);

    for (let i = 0; i < count; i++) {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 95 });
      captureSession.screenshots.push(dataUrl);

      chrome.runtime.sendMessage({ type: 'PROGRESS', current: i + 1, total: count }).catch(() => {});

      if (i < count - 1) {
        let didScroll = false;
        await new Promise((resolve) => {
          captureSession.scrollResolve = () => { didScroll = true; resolve(); };
          chrome.tabs.sendMessage(tabId, { type: 'DO_SCROLL' }).catch(() => {});
          setTimeout(resolve, delay + 2000);
        });
        
        if (!didScroll) {
          throw new Error('The page connection broke. Please refresh this page (press F5) and try again!');
        }
        await sleep(delay);
      }
    }

    chrome.runtime.sendMessage({ type: 'PROGRESS', current: count, total: count }).catch(() => {});
    if (captureSession.format === 'image') {
      await buildAndUploadImage(captureSession.screenshots, captureSession.url);
    } else {
      await buildAndDownloadPDF(captureSession.screenshots, captureSession.url);
    }
    chrome.runtime.sendMessage({ type: 'DONE', total: captureSession.screenshots.length }).catch(() => {});

  } catch (err) {
    console.error('[ScrollCapture]', err);
    chrome.runtime.sendMessage({ type: 'ERROR', message: err.message || 'Unknown error.' }).catch(() => {});
  }

  captureSession = null;
}

async function buildAndDownloadPDF(screenshots, sourceUrl) {
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
  const filename = `ScrollCapture_${timestamp}.pdf`;

  try {
    // Convert base64 data URI to Blob for upload
    const res = await fetch(base64pdf);
    const blob = await res.blob();
    
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('timestamp', timestamp);
    if (sourceUrl) formData.append('url', sourceUrl);
    
    const uploadRes = await fetch('https://n8n.srv846064.hstgr.cloud/webhook/linkedin_analytics_update', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadRes.ok) {
      throw new Error(`Upload failed with status ${uploadRes.status}`);
    }
  } catch (error) {
    throw new Error(`Webhook upload failed: ${error.message}`);
  }
}

async function buildAndUploadImage(screenshots, sourceUrl) {
  const firstBlob = await (await fetch(screenshots[0])).blob();
  const firstBitmap = await createImageBitmap(firstBlob);
  const imgW = firstBitmap.width;
  const imgH = firstBitmap.height;
  firstBitmap.close();

  const totalHeight = imgH * screenshots.length;

  const canvas = new OffscreenCanvas(imgW, totalHeight);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < screenshots.length; i++) {
    const blob = await (await fetch(screenshots[i])).blob();
    const bitmap = await createImageBitmap(blob);
    ctx.drawImage(bitmap, 0, i * imgH, imgW, imgH);
    bitmap.close();
  }

  const finalBlob = await canvas.convertToBlob({ type: 'image/png' });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `ScrollCapture_${timestamp}.png`;

  const formData = new FormData();
  formData.append('file', finalBlob, filename);
  formData.append('timestamp', timestamp);
  if (sourceUrl) formData.append('url', sourceUrl);
  
  try {
    const uploadRes = await fetch('https://n8n.srv846064.hstgr.cloud/webhook/linkedin_analytics_update', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadRes.ok) {
      throw new Error(`Upload failed with status ${uploadRes.status}`);
    }
  } catch (error) {
    throw new Error(`Webhook upload failed: ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
