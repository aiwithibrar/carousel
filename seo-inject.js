/**
 * CarouselForge — Universal Page SEO Injector
 * Reads _data/pages-seo.json and applies SEO overrides to the current page.
 * Add <script src="/seo-inject.js"></script> to any static page.
 */
(function () {
  var BASE_URL = 'https://carouselforge.app';

  // Determine current page path (normalize trailing slash)
  var path = window.location.pathname;
  if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);

  // Fetch the central SEO data file
  fetch('/_data/pages-seo.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data || !data.pages) return;

      // Match page by path
      var page = data.pages.find(function (p) {
        var pPath = p.path;
        if (pPath !== '/' && pPath.endsWith('/')) pPath = pPath.slice(0, -1);
        return pPath === path;
      });

      if (!page) return; // No data for this page — keep hardcoded HTML tags

      var pageUrl  = BASE_URL + (page.path || path);
      var ogImage  = page.og_image || (BASE_URL + '/icons/icon-512.png');
      var schema   = page.schema_type || 'WebPage';

      // Helper: create or update a <meta> tag
      function setMeta(attr, name, content) {
        if (!content) return;
        var sel = 'meta[' + attr + '="' + name + '"]';
        var el = document.querySelector(sel);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      }

      // Helper: create or update a <link> tag
      function setLink(rel, href) {
        if (!href) return;
        var el = document.querySelector('link[rel="' + rel + '"]');
        if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
        el.setAttribute('href', href);
      }

      // ── Title ──────────────────────────────────────────────
      if (page.title) document.title = page.title;

      // ── Basic SEO ──────────────────────────────────────────
      setMeta('name', 'description', page.description);
      setMeta('name', 'keywords', page.keywords);
      setMeta('name', 'robots', page.noindex ? 'noindex, nofollow' : 'index, follow');
      setLink('canonical', pageUrl);

      // ── Open Graph ─────────────────────────────────────────
      setMeta('property', 'og:type',        schema === 'WebApplication' ? 'website' : 'website');
      setMeta('property', 'og:url',         pageUrl);
      setMeta('property', 'og:title',       page.title);
      setMeta('property', 'og:description', page.description);
      setMeta('property', 'og:image',       ogImage);
      setMeta('property', 'og:image:width',  '1200');
      setMeta('property', 'og:image:height', '630');
      setMeta('property', 'og:site_name',   'CarouselForge');

      // ── Twitter Card ───────────────────────────────────────
      setMeta('name', 'twitter:card',        'summary_large_image');
      setMeta('name', 'twitter:title',       page.title);
      setMeta('name', 'twitter:description', page.description);
      setMeta('name', 'twitter:image',       ogImage);
      setMeta('name', 'twitter:site',        '@CarouselForge');

      // ── JSON-LD Structured Data ────────────────────────────
      // Remove old ld+json if any
      var oldLd = document.querySelector('script[type="application/ld+json"]');

      var ld = {
        '@context': 'https://schema.org',
        '@type': schema,
        'name': page.title,
        'description': page.description,
        'url': pageUrl,
        'image': ogImage,
        'publisher': {
          '@type': 'Organization',
          'name': 'CarouselForge',
          'url': BASE_URL,
          'logo': { '@type': 'ImageObject', 'url': BASE_URL + '/icons/icon-512.png' }
        }
      };

      // Extra fields for WebApplication schema
      if (schema === 'WebApplication') {
        ld['applicationCategory'] = 'DesignApplication';
        ld['operatingSystem'] = 'Web';
        ld['offers'] = { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' };
      }

      var ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.textContent = JSON.stringify(ld, null, 2);

      // Replace or append
      if (oldLd) {
        oldLd.parentNode.replaceChild(ldScript, oldLd);
      } else {
        document.head.appendChild(ldScript);
      }
    })
    .catch(function () {
      // Fail silently — page still has its hardcoded SEO tags
    });

  // ── Universal Mobile Slider Menu Drawer for All Website Pages ──
  function initUniversalMobileMenu() {
    // Skip React Studio (it manages its own SliderMenu)
    if (window.location.pathname.indexOf('/studio') !== -1) return;

    var existingDrawer = document.getElementById('mobileMenu');
    var existingBtn = document.getElementById('mobileMenuBtn');

    // If no drawer exists on this page, inject one!
    if (!existingDrawer) {
      var navContainer = document.querySelector('.home-nav-actions') || 
                         document.querySelector('.blog-nav-links') || 
                         document.querySelector('nav');
      if (navContainer && !existingBtn) {
        var btn = document.createElement('button');
        btn.className = 'mobile-menu-btn';
        btn.id = 'mobileMenuBtn';
        btn.setAttribute('aria-label', 'Open navigation menu');
        btn.innerHTML = '<div class="hamburger"><span></span><span></span><span></span></div>';
        navContainer.appendChild(btn);
        existingBtn = btn;
      }

      var backdrop = document.createElement('div');
      backdrop.className = 'mobile-menu-backdrop';
      backdrop.id = 'mobileMenuBackdrop';
      document.body.appendChild(backdrop);

      var drawer = document.createElement('div');
      drawer.className = 'mobile-menu';
      drawer.id = 'mobileMenu';
      drawer.innerHTML = [
        '<div class="mobile-drawer-header">',
        '  <a href="/" class="mobile-drawer-brand">',
        '    <div class="logo-icon" aria-hidden="true">',
        '      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">',
        '        <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>',
        '        <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>',
        '        <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>',
        '        <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>',
        '      </svg>',
        '    </div>',
        '    <span>CarouselForge</span>',
        '  </a>',
        '  <button type="button" class="mobile-drawer-close" id="mobileMenuCloseBtn" aria-label="Close navigation menu">✕</button>',
        '</div>',
        '<div class="mobile-drawer-content">',
        '  <div class="mobile-drawer-section">',
        '    <span class="mobile-drawer-label">⚡ Free Creator Tools</span>',
        '    <a href="/tools/linkedin-text-formator" class="mobile-drawer-item highlight-tool">',
        '      <span class="item-icon">🔤</span>',
        '      <span>LinkedIn Text Formatter</span>',
        '      <span class="mobile-drawer-badge">NEW</span>',
        '    </a>',
        '    <a href="/linkedin-carousel-generator.html" class="mobile-drawer-item">',
        '      <span class="item-icon">💼</span>',
        '      <span>LinkedIn Carousel Maker</span>',
        '    </a>',
        '    <a href="/instagram-carousel-maker.html" class="mobile-drawer-item">',
        '      <span class="item-icon">📸</span>',
        '      <span>Instagram Carousel Maker</span>',
        '    </a>',
        '    <a href="/tools/" class="mobile-drawer-item">',
        '      <span class="item-icon">🛠️</span>',
        '      <span>All Free Tools Hub</span>',
        '    </a>',
        '  </div>',
        '  <div class="mobile-drawer-section">',
        '    <span class="mobile-drawer-label">🎨 Studio</span>',
        '    <a href="/studio/" class="mobile-cta" style="text-decoration:none;">⚡ Open Carousel Studio</a>',
        '  </div>',
        '  <div class="mobile-drawer-section">',
        '    <span class="mobile-drawer-label">🧭 Navigation</span>',
        '    <a href="/" class="mobile-drawer-item">Home Page</a>',
        '    <a href="/blog/" class="mobile-drawer-item">Blog &amp; Guides</a>',
        '    <a href="/about" class="mobile-drawer-item">About Us</a>',
        '    <a href="/contact" class="mobile-drawer-item">Contact Us</a>',
        '  </div>',
        '  <div class="mobile-drawer-section">',
        '    <span class="mobile-drawer-label">⚖️ Legal</span>',
        '    <a href="/privacy" class="mobile-drawer-item" style="font-size:0.84rem;color:var(--text-secondary);">Privacy Policy</a>',
        '    <a href="/terms" class="mobile-drawer-item" style="font-size:0.84rem;color:var(--text-secondary);">Terms of Service</a>',
        '  </div>',
        '</div>'
      ].join('\n');
      document.body.appendChild(drawer);
      existingDrawer = drawer;
    }

    // Attach listeners
    var menu = existingDrawer;
    var btn = existingBtn || document.getElementById('mobileMenuBtn');
    var backdrop = document.getElementById('mobileMenuBackdrop');
    var closeBtn = document.getElementById('mobileMenuCloseBtn');

    function closeMenu() {
      if (menu) menu.classList.remove('active');
      if (btn) btn.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      var isOpen = menu && menu.classList.contains('active');
      if (isOpen) {
        closeMenu();
      } else if (menu) {
        menu.classList.add('active');
        if (btn) btn.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    if (btn) {
      btn.removeEventListener('click', toggleMenu);
      btn.addEventListener('click', toggleMenu);
    }
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    if (menu) {
      menu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', closeMenu);
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalMobileMenu);
  } else {
    initUniversalMobileMenu();
  }
})();
