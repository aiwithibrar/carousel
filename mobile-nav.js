/**
 * CarouselForge — Universal Mobile Navigation Drawer Script
 * Provides 100% reliable slide-out drawer on all mobile viewports.
 */
(function () {
  function initMobileNav() {
    if (window.__CF_UNIVERSAL_LAYOUT_BOUND__) return;
    // Studio has its own React SliderMenu
    if (window.location.pathname.startsWith('/studio')) return;

    // 1. Ensure Backdrop exists
    var backdrop = document.getElementById('mobileMenuBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mobileMenuBackdrop';
      backdrop.className = 'mobile-menu-backdrop';
      document.body.appendChild(backdrop);
    }

    // 2. Ensure Mobile Drawer Markup exists
    var drawer = document.getElementById('mobileMenu');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'mobileMenu';
      drawer.className = 'mobile-menu';
      document.body.appendChild(drawer);
    }

    // If drawer is empty or needs standard structure, populate it
    if (!drawer.querySelector('.mobile-drawer-header')) {
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
        '    <a href="/tools/instagram-grid-maker" class="mobile-drawer-item highlight-tool">',
        '      <span class="item-icon">📸</span>',
        '      <span>Instagram Grid Maker</span>',
        '      <span class="mobile-drawer-badge" style="background:#ec4899;">NEW</span>',
        '    </a>',
        '    <a href="/tools/linkedin-text-formator" class="mobile-drawer-item">',
        '      <span class="item-icon">🔤</span>',
        '      <span>LinkedIn Text Formatter</span>',
        '    </a>',
        '    <a href="/linkedin-carousel-generator" class="mobile-drawer-item">',
        '      <span class="item-icon">💼</span>',
        '      <span>LinkedIn Carousel Maker</span>',
        '    </a>',
        '    <a href="/instagram-carousel-maker" class="mobile-drawer-item">',
        '      <span class="item-icon">📱</span>',
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
      ].join('');
    }

    // 3. Ensure Mobile Hamburger Button exists in the nav bar
    var btn = document.getElementById('mobileMenuBtn');
    if (!btn) {
      var navActions = document.querySelector('.home-nav-actions') || 
                       document.querySelector('.blog-nav-links') || 
                       document.querySelector('nav');
      if (navActions) {
        btn = document.createElement('button');
        btn.id = 'mobileMenuBtn';
        btn.className = 'mobile-menu-btn';
        btn.setAttribute('aria-label', 'Open navigation menu');
        btn.innerHTML = '<div class="hamburger"><span></span><span></span><span></span></div>';
        navActions.appendChild(btn);
      }
    }

    // 4. Bind event handlers
    var closeBtn = document.getElementById('mobileMenuCloseBtn') || drawer.querySelector('.mobile-drawer-close');

    function openDrawer() {
      drawer.classList.add('active');
      if (btn) btn.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('active');
      if (btn) btn.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    function toggleDrawer(e) {
      if (e) e.preventDefault();
      if (drawer.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }

    if (btn) {
      btn.onclick = null;
      btn.addEventListener('click', function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (drawer.classList.contains('active')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.onclick = null;
      closeBtn.addEventListener('click', function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        closeDrawer();
      });
    }

    if (backdrop) {
      backdrop.onclick = null;
      backdrop.addEventListener('click', function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        closeDrawer();
      });
    }

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', function (e) {
      if (!drawer.classList.contains('active')) return;
      if (drawer.contains(e.target)) return;
      if (btn && (btn === e.target || btn.contains(e.target))) return;
      closeDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
