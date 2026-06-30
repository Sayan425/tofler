// popup.js

const setupView    = document.getElementById('setup-view');
const progressView = document.getElementById('progress-view');
const btnStart     = document.getElementById('btn-start');
const btnReset     = document.getElementById('btn-reset');
const scrollInput  = document.getElementById('scroll-count');
const delayInput   = document.getElementById('delay-input');
const formatSelect = document.getElementById('format-select');
const progressBar  = document.getElementById('progress-bar');
const progressLabel= document.getElementById('progress-label');
const statusMsg    = document.getElementById('status-msg');
const doneBadge    = document.getElementById('done-badge');
const doneText     = document.getElementById('done-text');
const errorMsg     = document.getElementById('error-msg');

function showSetup() {
  setupView.style.display    = 'block';
  progressView.style.display = 'none';
  doneBadge.classList.remove('show');
  btnReset.style.display     = 'none';
  errorMsg.style.display     = 'none';
  btnStart.disabled          = false;
}

function showProgress() {
  setupView.style.display    = 'none';
  progressView.style.display = 'block';
}

function updateProgress(current, total) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  progressBar.style.width  = pct + '%';
  progressLabel.textContent = `${current} / ${total} screenshots`;
  statusMsg.textContent     = current < total
    ? `📷 Captured #${current} — scrolling…`
    : `🧾 Building PDF…`;
}

btnStart.addEventListener('click', async () => {
  const count = parseInt(scrollInput.value, 10);
  const delay = Math.round(parseFloat(delayInput.value) * 1000);
  const format = formatSelect.value;

  if (!count || count < 1) {
    errorMsg.textContent  = 'Enter a valid number of scrolls (1 or more).';
    errorMsg.style.display = 'block';
    return;
  }

  if (!delay || delay < 100) {
    errorMsg.textContent  = 'Enter a valid delay (at least 0.1 seconds).';
    errorMsg.style.display = 'block';
    return;
  }

  errorMsg.style.display = 'none';
  btnStart.disabled = true;

  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    errorMsg.textContent  = 'No active tab found.';
    errorMsg.style.display = 'block';
    btnStart.disabled = false;
    return;
  }

  showProgress();
  updateProgress(0, count);
  statusMsg.textContent = '⚙️ Injecting capture script…';

  // Send message to background to start capture
  chrome.runtime.sendMessage({
    type: 'START_CAPTURE',
    tabId: tab.id,
    url: tab.url,
    count,
    delay,
    format
  });
});

btnReset.addEventListener('click', () => {
  showSetup();
});

// Listen for progress updates from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'PROGRESS') {
    updateProgress(msg.current, msg.total);
  }

  if (msg.type === 'DONE') {
    statusMsg.textContent = '✅ All done!';
    doneBadge.classList.add('show');
    doneText.textContent  = `PDF saved — ${msg.total} pages`;
    btnReset.style.display = 'block';
  }

  if (msg.type === 'ERROR') {
    showSetup();
    errorMsg.textContent  = '⚠️ ' + msg.message;
    errorMsg.style.display = 'block';
    btnStart.disabled = false;
  }
});
