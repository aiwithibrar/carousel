import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';

function escapeHTML(str) {
  if (!str) return '';
  const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, (ch) => escapeMap[ch]);
}

function escapeHTMLWithBreaks(str) {
  if (!str) return '';
  return escapeHTML(str).replace(/\n/g, '<br>');
}

function highlightWords(str) {
  if (!str) return '';
  return str.replace(/\*([^*]+)\*/g, '<span class="accent-text">$1</span>');
}

function isLightColor(hex) {
  if (!hex) return false;
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

export function fireCelebration() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    // Ignore if not supported
  }
}

export async function renderSlideElementToCanvas(slide, index, totalSlides, settings) {
  const { sizeConfig, theme, fontFamily, fontSize, customBg, author } = settings;
  const w = sizeConfig.width;
  const h = sizeConfig.height;

  const scaledFontTitle = fontSize * (slide.type === 'cover' ? 1.9 : 1.6);
  const scaledFontBody = fontSize * 1.0;

  let slideClass = `render-slide font-${fontFamily}`;
  if (customBg.type === 'none') {
    slideClass += ` theme-${theme}`;
  }
  if (slide.type === 'cover') slideClass += ' title-slide';
  if (slide.type === 'cta') slideClass += ' cta-slide';

  const container = document.createElement('div');
  container.className = slideClass;
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = `${w}px`;
  container.style.height = `${h}px`;
  container.style.zIndex = '-9999';

  if (customBg.type === 'color') {
    const isLight = isLightColor(customBg.color);
    container.style.color = isLight ? '#1e293b' : '#f1f5f9';
  } else if (customBg.type === 'image') {
    container.style.color = '#f1f5f9';
  }

  let exportBgHTML = '';
  if (customBg.type === 'image' && customBg.imageBase64) {
    exportBgHTML = `
      <img src="${customBg.imageBase64}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" alt="" />
      <div style="position:absolute;inset:0;background:rgba(0,0,0,${customBg.overlayOpacity / 100});z-index:0;"></div>
    `;
  } else if (customBg.type === 'color' && customBg.color) {
    exportBgHTML = `<div style="position:absolute;inset:0;background:${customBg.color};z-index:0;"></div>`;
  }

  const numberLabelHTML = slide.numberLabel 
    ? `<div class="slide-number-label">${escapeHTML(slide.numberLabel)}</div>` 
    : '';

  const accentLineHTML = slide.type !== 'cover' ? '<div class="slide-accent-line"></div>' : '';

  const titleHTML = slide.title 
    ? `<div class="slide-title-text" style="font-size:${scaledFontTitle}px">${highlightWords(escapeHTML(slide.title))}</div>` 
    : '';

  const bodyHTML = slide.body 
    ? `<div class="slide-body-text" style="font-size:${scaledFontBody}px">${highlightWords(escapeHTMLWithBreaks(slide.body))}</div>` 
    : '';

  const authorHTML = (author.handle || author.avatarBase64) 
    ? `
      <div class="slide-author-combo">
        ${author.avatarBase64 ? `<img src="${author.avatarBase64}" class="slide-avatar" alt="Avatar" />` : ''}
        ${author.handle ? `<div class="slide-handle">${escapeHTML(author.handle)}</div>` : ''}
      </div>
    `
    : '';

  container.innerHTML = `
    ${exportBgHTML}
    <div class="slide-deco-tl"></div>
    <div class="slide-deco-br"></div>
    ${numberLabelHTML}
    ${accentLineHTML}
    ${titleHTML}
    ${bodyHTML}
    ${authorHTML}
    <div class="slide-page-indicator">${index + 1} / ${totalSlides}</div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      width: w,
      height: h,
      scale: 2,
      backgroundColor: null,
      useCORS: true
    });
    return canvas;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export async function downloadSingleSlidePNG(slide, index, totalSlides, settings) {
  const canvas = await renderSlideElementToCanvas(slide, index, totalSlides, settings);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      saveAs(blob, `carousel-slide-${String(index + 1).padStart(2, '0')}.png`);
      fireCelebration();
      resolve(true);
    }, 'image/png');
  });
}

export async function downloadAllSlidesZIP(slides, settings, onProgress) {
  if (!slides || slides.length === 0) return;

  const zip = new JSZip();
  const total = slides.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total, `Rendering slide ${i + 1} of ${total}...`);
    const canvas = await renderSlideElementToCanvas(slides[i], i, total, settings);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    const fileName = `slide-${String(i + 1).padStart(2, '0')}.png`;
    zip.file(fileName, blob);
  }

  if (onProgress) onProgress(total, total, 'Compressing ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'carousel-slides.zip');
  fireCelebration();
}
