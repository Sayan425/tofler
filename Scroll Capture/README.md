# 📸 ScrollCapture — LinkedIn PDF Exporter

A Chrome extension that scrolls through any webpage (LinkedIn feed, articles, etc.) and saves each viewport as a page in a clean multi-page PDF.

---

## Installation (Developer Mode)

1. **Download / unzip** this folder somewhere permanent on your computer (don't delete it after installing).

2. Open Chrome and go to:
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode** — toggle in the top-right corner.

4. Click **"Load unpacked"** and select this folder (`scroll-capture-extension`).

5. The 📸 ScrollCapture icon will appear in your Chrome toolbar.  
   *(Pin it for easy access: click the puzzle icon → pin ScrollCapture)*

---

## How to Use

1. Open LinkedIn (or any page you want to capture).
2. Scroll to the **top** of where you want to start.
3. Click the 📸 extension icon.
4. Enter **how many scrolls** you want (e.g. `30` = 30 screenshots = 30 PDF pages).
5. Choose a **delay** between scrolls (1.2s works well for LinkedIn's lazy-loading feed).
6. Click **▶ Start Capturing**.
7. **Don't switch tabs** while it's running!
8. When done, a PDF is automatically downloaded to your Downloads folder.

---

## Tips

- **LinkedIn feed**: Use 1.2–2.0s delay to let images/posts lazy-load before screenshot.
- **Static pages**: 0.8s delay is fine.
- **Long articles**: 10–20 scrolls usually covers a full article.
- **PDF filename**: Automatically timestamped, e.g. `ScrollCapture_2026-05-29T14-30-00.pdf`

---

## File Structure

```
scroll-capture-extension/
├── manifest.json       — Extension config
├── popup.html          — The UI you see when clicking the icon
├── popup.js            — UI logic
├── background.js       — Screenshot orchestration
├── content.js          — Page scrolling + PDF assembly
├── jspdf.umd.min.js    — PDF library (bundled, no internet needed)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| PDF is blank / white pages | Increase the delay to 2–3s |
| Extension not working on LinkedIn | Make sure you're on `linkedin.com` and the page is fully loaded |
| "Could not establish connection" error | Refresh the LinkedIn tab and try again |
| PDF not downloading | Check Chrome's download settings / blocked downloads bar |
