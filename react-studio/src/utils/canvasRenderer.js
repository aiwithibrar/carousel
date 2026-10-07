import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

export const onColorContrast = (hex) => {
  if (!hex || !hex.startsWith('#')) return '#ffffff';
  const clean = hex.slice(1);
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#111111' : '#ffffff';
};

// Generate procedural noise pattern on canvas
function applyFilmGrain(ctx, width, height, opacity = 0.04) {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 160;
  noiseCanvas.height = 160;
  const nCtx = noiseCanvas.getContext('2d');
  const imgData = nCtx.createImageData(160, 160);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const val = Math.floor(Math.random() * 255);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  nCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat');
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// Draw continuous seamless swipe connectors across slide boundaries
function drawSeamlessConnectors(ctx, width, height, index, totalSlides, accentColor) {
  if (totalSlides <= 1) return;
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.fillStyle = accentColor;

  const midY = height * 0.52;
  const arcRadius = 55;

  // If not first slide: draw the incoming half on the LEFT border
  if (index > 0) {
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(0, midY, arcRadius, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, midY, arcRadius, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  // If not last slide: draw the outgoing half on the RIGHT border
  if (index < totalSlides - 1) {
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(width, midY, arcRadius, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.fill();

    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width, midY, arcRadius, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSlideToCanvas(slide, index, totalSlides, settings) {
  const { theme, brandKit, ratio, seamlessConnectors = true, texture = 'grain' } = settings;
  const t = theme === 'brand' ? {
    b1: brandKit.c1,
    b2: brandKit.c2,
    fg: brandKit.c3,
    acc: brandKit.c4
  } : theme;

  const W = 1080;
  const H = ratio === 'r45' ? 1350 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 1. Gradient background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, t.b1);
  grad.addColorStop(1, t.b2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 2. Texture overlay (Film Grain)
  if (texture === 'grain') {
    applyFilmGrain(ctx, W, H, 0.04);
  }

  // 3. Seamless swipe connectors
  if (seamlessConnectors) {
    drawSeamlessConnectors(ctx, W, H, index, totalSlides, t.acc);
  }

  const F = '"CarouselFont", sans-serif';
  const P = 86;
  const W2 = W - 2 * P;
  const A = t.acc;
  const fg = t.fg;
  const hd = brandKit.handle || '';

  const h = slide.heading || '';
  const b = Array.isArray(slide.body) ? slide.body : (slide.body ? slide.body.split('\n').filter(Boolean) : []);
  const lay = slide.layout || 'split';

  const wrapText = (str, x, y, maxW, fontSize, lineHeight, dryRun) => {
    let line = '';
    const lines = [];
    const words = str.split(' ');
    words.forEach((w) => {
      const testLine = line + w + ' ';
      if (ctx.measureText(testLine).width > maxW && line) {
        lines.push(line);
        line = w + ' ';
      } else {
        line = testLine;
      }
    });
    lines.push(line);

    if (!dryRun) {
      lines.forEach((q, j) => {
        ctx.fillText(q.trim(), x, y + fontSize * 0.85 + j * lineHeight);
      });
    }
    return y + lines.length * lineHeight;
  };

  const drawAccentBar = (y, dryRun) => {
    if (!dryRun) {
      ctx.fillStyle = A;
      ctx.fillRect(P, y, 170, 12);
    }
    return y + 60;
  };

  const drawBodyLines = (y, dryRun, alignCenter = false, startX = P) => {
    ctx.font = `500 46px ${F}`;
    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.9;
    b.forEach((lineStr) => {
      y = wrapText(lineStr, startX, y, W2, 46, 64, dryRun) + 8;
    });
    ctx.globalAlpha = 1;
    return y;
  };

  const layoutRenderers = {
    cover: (y, dryRun) => {
      ctx.textAlign = 'left';
      y = drawAccentBar(y, dryRun);
      ctx.font = `800 124px ${F}`;
      ctx.fillStyle = fg;
      y = wrapText(h, P, y, W2, 124, 134, dryRun) + 24;
      return drawBodyLines(y, dryRun, false, P);
    },
    stat: (y, dryRun) => {
      ctx.textAlign = 'left';
      let sz = 240;
      for (; sz > 80; sz -= 10) {
        ctx.font = `800 ${sz}px ${F}`;
        if (ctx.measureText(h).width <= W2) break;
      }
      ctx.fillStyle = A;
      y = wrapText(h, P, y, W2, sz, sz * 1.05, dryRun) + 30;
      return drawBodyLines(y, dryRun, false, P);
    },
    question: (y, dryRun) => {
      ctx.textAlign = 'left';
      if (!dryRun) {
        ctx.font = `800 300px ${F}`;
        ctx.fillStyle = A;
        ctx.fillText('“', P - 6, y + 260);
      }
      y += 190;
      ctx.font = `800 96px ${F}`;
      ctx.fillStyle = fg;
      y = wrapText(h, P, y, W2, 96, 106, dryRun) + 24;
      return drawBodyLines(y, dryRun, false, P);
    },
    list: (y, dryRun) => {
      ctx.textAlign = 'left';
      ctx.font = `800 80px ${F}`;
      ctx.fillStyle = fg;
      y = wrapText(h, P, y, W2, 80, 90, dryRun) + 40;
      b.forEach((itemText, j) => {
        ctx.font = `600 48px ${F}`;
        const endY = wrapText(itemText, P + 104, y + 4, W2 - 104, 48, 62, true);
        if (!dryRun) {
          ctx.fillStyle = A;
          ctx.beginPath();
          ctx.arc(P + 36, y + 40, 36, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = onColorContrast(A);
          ctx.font = `800 38px ${F}`;
          ctx.textAlign = 'center';
          ctx.fillText(String(j + 1), P + 36, y + 54);

          ctx.textAlign = 'left';
          ctx.fillStyle = fg;
          ctx.font = `600 48px ${F}`;
          wrapText(itemText, P + 104, y + 4, W2 - 104, 48, 62, false);
        }
        y = Math.max(endY, y + 80) + 24;
      });
      return y;
    },
    split: (y, dryRun) => {
      ctx.textAlign = 'left';
      if (!dryRun) {
        ctx.font = `800 460px ${F}`;
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = fg;
        ctx.textAlign = 'right';
        ctx.fillText(String(index + 1).padStart(2, '0'), W - P + 10, H - 90);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }
      y = drawAccentBar(y, dryRun);
      ctx.font = `800 96px ${F}`;
      ctx.fillStyle = fg;
      y = wrapText(h, P, y, W2, 96, 106, dryRun) + 24;
      return drawBodyLines(y, dryRun, false, P);
    },
    cta: (y, dryRun) => {
      ctx.textAlign = 'center';
      ctx.font = `800 104px ${F}`;
      ctx.fillStyle = fg;
      y = wrapText(h, W / 2, y, W2, 104, 114, dryRun) + 24;
      y = drawBodyLines(y, dryRun, true, W / 2);
      const pillLabel = `Follow ${hd}`;
      ctx.font = `700 44px ${F}`;
      const pillW = ctx.measureText(pillLabel).width + 110;
      if (!dryRun) {
        ctx.fillStyle = A;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(W / 2 - pillW / 2, y + 24, pillW, 104, 52);
        } else {
          ctx.rect(W / 2 - pillW / 2, y + 24, pillW, 104);
        }
        ctx.fill();
        ctx.fillStyle = onColorContrast(A);
        ctx.fillText(pillLabel, W / 2, y + 24 + 68);
      }
      return y + 150;
    }
  };

  const renderer = layoutRenderers[lay] || layoutRenderers.split;
  const totalContentHeight = renderer(0, true);
  ctx.textAlign = 'left';
  const startTop = Math.max(180, (H - totalContentHeight) / 2 - 10);
  renderer(startTop, false);

  // Top header: handle left, index right
  ctx.textAlign = 'left';
  ctx.fillStyle = fg;
  ctx.globalAlpha = 0.7;
  ctx.font = `500 32px ${F}`;
  ctx.fillText(hd, P, P + 10);
  ctx.textAlign = 'right';
  ctx.fillText(`${index + 1}/${totalSlides}`, W - P, P + 10);
  ctx.globalAlpha = 0.85;
  ctx.textAlign = 'left';

  // Bottom footer: logo & brand name
  if (brandKit.showFooter) {
    let curX = P;
    if (brandKit.logoData) {
      try {
        const logoImg = new Image();
        logoImg.src = brandKit.logoData;
        if (logoImg.complete && logoImg.naturalHeight) {
          const hh = 58;
          const ww = (logoImg.naturalWidth / logoImg.naturalHeight) * hh;
          ctx.drawImage(logoImg, curX, H - P - hh + 14, ww, hh);
          curX += ww + 20;
        }
      } catch (e) {}
    }
    ctx.font = `600 32px ${F}`;
    ctx.fillText(brandKit.name || '', curX, H - P + 2);
  }

  // Next Arrow
  if (index < totalSlides - 1) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = A;
    ctx.textAlign = 'right';
    ctx.font = `800 64px ${F}`;
    ctx.fillText('→', W - P, H - P + 14);
  }

  return canvas;
}

// 1. Download Single PNG
export async function downloadSlidePNG(slide, index, totalSlides, settings) {
  try {
    await Promise.all([
      document.fonts.load('500 40px CarouselFont'),
      document.fonts.load('800 40px CarouselFont')
    ]);
  } catch (e) {}

  const canvas = drawSlideToCanvas(slide, index, totalSlides, settings);
  canvas.toBlob((blob) => {
    saveAs(blob, `slide-${String(index + 1).padStart(2, '0')}.png`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  }, 'image/png');
}

// 2. Copy Slide Image to Clipboard
export async function copySlideToClipboard(slide, index, totalSlides, settings) {
  try {
    await Promise.all([
      document.fonts.load('500 40px CarouselFont'),
      document.fonts.load('800 40px CarouselFont')
    ]);
  } catch (e) {}

  const canvas = drawSlideToCanvas(slide, index, totalSlides, settings);
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      try {
        if (!navigator.clipboard || !window.ClipboardItem) {
          throw new Error('Clipboard API not supported');
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}

// 3. Download All Slides as ZIP
export async function downloadAllSlidesZIP(slides, settings, onProgress) {
  try {
    await Promise.all([
      document.fonts.load('500 40px CarouselFont'),
      document.fonts.load('800 40px CarouselFont')
    ]);
  } catch (e) {}

  const zip = new JSZip();
  const total = slides.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total, `Rendering slide ${i + 1} of ${total}...`);
    const canvas = drawSlideToCanvas(slides[i], i, total, settings);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);
  }

  if (onProgress) onProgress(total, total, 'Packaging ZIP archive...');
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'carousel-pro-slides.zip');
  confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
}

// 4. Download Native LinkedIn Multi-Page PDF
export async function downloadLinkedInPDF(slides, settings, onProgress) {
  try {
    await Promise.all([
      document.fonts.load('500 40px CarouselFont'),
      document.fonts.load('800 40px CarouselFont')
    ]);
  } catch (e) {}

  const total = slides.length;
  const isPortrait = settings.ratio === 'r45';
  const widthPt = 1080;
  const heightPt = isPortrait ? 1350 : 1080;

  // Initialize jsPDF with custom page dimension
  const pdf = new jsPDF({
    orientation: isPortrait ? 'portrait' : 'landscape',
    unit: 'pt',
    format: [widthPt, heightPt]
  });

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total, `Rendering PDF page ${i + 1} of ${total}...`);
    const canvas = drawSlideToCanvas(slides[i], i, total, settings);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage([widthPt, heightPt], isPortrait ? 'portrait' : 'landscape');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, widthPt, heightPt, undefined, 'FAST');
  }

  if (onProgress) onProgress(total, total, 'Finalizing LinkedIn PDF document...');
  pdf.save('linkedin-carousel.pdf');
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
}
