/**
 * CarouselForge — Sticky Footer Anchor Ad (Adsterra)
 * Pinned to the bottom of all viewports (desktop & mobile).
 * Contains Adsterra 728x90 banner with responsive scaling & dismiss option.
 */
(function() {
  'use strict';

  // Prevent multiple initializations on the same page
  if (document.getElementById('cfStickyFooterAd')) return;

  function initStickyAd() {
    if (document.getElementById('cfStickyFooterAd')) return;

    var bar = document.createElement('div');
    bar.id = 'cfStickyFooterAd';
    bar.className = 'cf-sticky-footer-ad';

    var inner = document.createElement('div');
    inner.className = 'cf-sticky-ad-inner';

    // Dismiss / Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'cf-sticky-ad-close';
    closeBtn.setAttribute('aria-label', 'Close advertisement');
    closeBtn.setAttribute('title', 'Close Ad');
    closeBtn.innerHTML = '&#10005;';

    closeBtn.onclick = function(e) {
      e.stopPropagation();
      bar.classList.add('cf-minimized');
      updatePagePadding();
    };

    // Restore button when minimized
    var restoreBtn = document.createElement('button');
    restoreBtn.className = 'cf-sticky-ad-restore';
    restoreBtn.setAttribute('aria-label', 'Show advertisement');
    restoreBtn.setAttribute('title', 'Show Ad');
    restoreBtn.innerHTML = 'Ad &#9650;';
    restoreBtn.onclick = function(e) {
      e.stopPropagation();
      bar.classList.remove('cf-minimized');
      updateScale();
    };

    // Ad Scaler wrapper for responsive fit on mobile
    var scaler = document.createElement('div');
    scaler.className = 'cf-sticky-ad-scaler';

    // Isolated safe iframe for Adsterra document.write script
    var iframe = document.createElement('iframe');
    iframe.className = 'cf-adsterra-iframe';
    iframe.title = 'Advertisement';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.width = '728px';
    iframe.style.height = '90px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';

    scaler.appendChild(iframe);
    inner.appendChild(closeBtn);
    inner.appendChild(restoreBtn);
    inner.appendChild(scaler);
    bar.appendChild(inner);

    document.body.appendChild(bar);

    // Populate iframe with Adsterra script
    try {
      var doc = iframe.contentWindow.document;
      doc.open();
      doc.write(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<meta charset="utf-8">' +
        '<style>' +
        '* { margin: 0; padding: 0; box-sizing: border-box; }' +
        'html, body { background: transparent; width: 728px; height: 90px; overflow: hidden; display: flex; align-items: center; justify-content: center; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<script>' +
        'atOptions = {' +
        "'key' : '51f92787204c5663f4e6245c0d1f4a37'," +
        "'format' : 'iframe'," +
        "'height' : 90," +
        "'width' : 728," +
        "'params' : {}" +
        '};' +
        '<\/script>' +
        '<script src="https://bauval.org/22/51f92787204c5663f4e6245c0d1f4a37"><\/script>' +
        '</body>' +
        '</html>'
      );
      doc.close();
    } catch(err) {
      console.warn('Adsterra sticky ad frame init error:', err);
    }

    // Responsive scaling calculation
    function updateScale() {
      if (bar.classList.contains('cf-minimized')) {
        updatePagePadding();
        return;
      }
      var vw = window.innerWidth;
      var availWidth = vw - 32;
      var scale = 1;
      if (availWidth < 728) {
        scale = Math.max(0.38, Math.min(1, availWidth / 728));
      }
      scaler.style.transform = 'scale(' + scale + ')';
      var computedHeight = Math.round(90 * scale + 14);
      bar.style.height = computedHeight + 'px';
      document.documentElement.style.setProperty('--cf-sticky-ad-height', computedHeight + 'px');
      updatePagePadding();
    }

    function updatePagePadding() {
      if (bar.classList.contains('cf-minimized')) {
        document.body.style.paddingBottom = '0px';
        document.documentElement.style.setProperty('--cf-sticky-ad-height', '0px');
      } else {
        var h = bar.offsetHeight || 102;
        document.body.style.paddingBottom = (h + 12) + 'px';
        document.documentElement.style.setProperty('--cf-sticky-ad-height', h + 'px');
      }
    }

    window.addEventListener('resize', updateScale);
    updateScale();
    setTimeout(updateScale, 300);
    setTimeout(updateScale, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStickyAd);
  } else {
    initStickyAd();
  }
})();
