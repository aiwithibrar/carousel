/**
 * CarouselForge — Universal Navigation & Footer Component
 * Single Source of Truth for Header, Mobile Slider Drawer, and Footer.
 * Guarantees 100% identical styling, links, and mobile behavior across all pages.
 */
(function () {
  function initUniversalLayout() {
    var rawPath = window.location.pathname.replace(/\/$/, '') || '/';
    var isStudio = rawPath.startsWith('/studio');

    // Skip mounting header/footer on studio canvas (Studio has its own full-viewport layout)
    if (isStudio) return;

    var isHome = rawPath === '/' || rawPath === '' || rawPath === '/index.html';
    var isTools = rawPath.startsWith('/tools') || rawPath === '/linkedin-carousel-generator' || rawPath === '/instagram-carousel-maker';
    var isBlog = rawPath.startsWith('/blog');
    var isAbout = rawPath === '/about' || rawPath === '/about.html';
    var isContact = rawPath === '/contact' || rawPath === '/contact.html';

    // 1. Inject Universal CSS to guarantee zero styling discrepancies across pages
    if (!document.getElementById('cf-universal-layout-css')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'cf-universal-layout-css';
      styleEl.textContent = [
        '/* CarouselForge Universal Layout Styles */',
        '.home-nav {',
        '  display: flex !important; justify-content: space-between !important; align-items: center !important;',
        '  padding: 18px 48px !important; position: sticky !important; top: 0 !important; z-index: 1000 !important;',
        '  background: rgba(255, 255, 255, 0.94) !important; backdrop-filter: blur(20px) !important;',
        '  -webkit-backdrop-filter: blur(20px) !important; border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;',
        '  transition: all 0.25s ease !important; box-sizing: border-box !important;',
        '}',
        '.home-nav.scrolled {',
        '  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;',
        '  background: rgba(255, 255, 255, 0.98) !important;',
        '}',
        '.home-nav .logo {',
        '  display: inline-flex !important; align-items: center !important; gap: 10px !important;',
        '  text-decoration: none !important; font-family: "Outfit", -apple-system, sans-serif !important;',
        '  font-weight: 800 !important; font-size: 1.25rem !important; color: #0f172a !important;',
        '}',
        '.home-nav .logo-icon {',
        '  display: flex !important; align-items: center !important; justify-content: center !important;',
        '  transition: transform 0.3s ease !important;',
        '}',
        '.home-nav .logo:hover .logo-icon {',
        '  transform: rotate(15deg) scale(1.1) !important;',
        '}',
        '.home-nav .logo-text {',
        '  font-size: 1.25rem !important; font-weight: 800 !important; letter-spacing: -0.02em !important;',
        '  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%) !important;',
        '  -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important;',
        '}',
        '.home-nav-actions {',
        '  display: flex !important; gap: 14px !important; align-items: center !important;',
        '}',
        '.home-nav-actions .nav-link-item {',
        '  color: #475569 !important; text-decoration: none !important; font-weight: 500 !important;',
        '  font-size: 0.95rem !important; padding: 8px 14px !important; border-radius: 8px !important;',
        '  transition: all 0.2s ease !important; font-family: "Inter", -apple-system, sans-serif !important;',
        '}',
        '.home-nav-actions .nav-link-item:hover {',
        '  color: #2563eb !important; background: rgba(59, 130, 246, 0.08) !important;',
        '}',
        '.home-nav-actions .nav-link-item.active {',
        '  color: #2563eb !important; font-weight: 700 !important; background: rgba(59, 130, 246, 0.08) !important;',
        '}',
        '.home-nav-actions .nav-btn-primary {',
        '  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important; color: #ffffff !important;',
        '  text-decoration: none !important; padding: 10px 22px !important; font-weight: 600 !important;',
        '  font-size: 0.92rem !important; border-radius: 8px !important; box-shadow: 0 2px 8px rgba(37,99,235,0.25) !important;',
        '  transition: all 0.2s ease !important; display: inline-flex !important; align-items: center !important;',
        '  font-family: "Inter", -apple-system, sans-serif !important;',
        '}',
        '.home-nav-actions .nav-btn-primary:hover {',
        '  background: #2563eb !important; transform: translateY(-1px) !important; box-shadow: 0 4px 14px rgba(37,99,235,0.35) !important;',
        '}',
        '.mobile-menu-btn {',
        '  display: none !important; background: none !important; border: none !important;',
        '  cursor: pointer !important; padding: 8px !important; border-radius: 8px !important;',
        '  transition: background 0.2s ease !important; align-items: center !important; justify-content: center !important;',
        '}',
        '.mobile-menu-btn:hover { background: rgba(59, 130, 246, 0.08) !important; }',
        '.hamburger { display: flex !important; flex-direction: column !important; gap: 5px !important; width: 22px !important; }',
        '.hamburger span { display: block !important; width: 100% !important; height: 2px !important; background: #0f172a !important; border-radius: 2px !important; transition: all 0.3s ease !important; }',
        '.mobile-menu-btn.active .hamburger span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px) !important; }',
        '.mobile-menu-btn.active .hamburger span:nth-child(2) { opacity: 0 !important; }',
        '.mobile-menu-btn.active .hamburger span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px) !important; }',
        '@media (max-width: 991px) {',
        '  .home-nav { padding: 12px 18px !important; }',
        '  .home-nav-actions .nav-link-item, .home-nav-actions .nav-btn-primary { display: none !important; }',
        '  .mobile-menu-btn { display: flex !important; }',
        '}',
        '@media (min-width: 992px) {',
        '  .mobile-menu-btn { display: none !important; }',
        '}',
        '/* Drawer & Backdrop */',
        '.mobile-menu-backdrop {',
        '  position: fixed !important; inset: 0 !important; background: rgba(15, 23, 42, 0.55) !important;',
        '  backdrop-filter: blur(4px) !important; -webkit-backdrop-filter: blur(4px) !important;',
        '  z-index: 99998 !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;',
        '  transition: opacity 0.25s ease, visibility 0.25s ease !important;',
        '}',
        '.mobile-menu-backdrop.active { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; }',
        '.mobile-menu {',
        '  position: fixed !important; top: 0 !important; right: 0 !important; bottom: 0 !important;',
        '  width: min(340px, 86vw) !important; background: #ffffff !important; box-shadow: -10px 0 35px rgba(15, 23, 42, 0.2) !important;',
        '  z-index: 99999 !important; display: flex !important; flex-direction: column !important;',
        '  transform: translateX(100%) !important; transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;',
        '  overflow-y: auto !important; -webkit-overflow-scrolling: touch !important;',
        '  border-left: 1px solid #e2e8f0 !important; box-sizing: border-box !important;',
        '  font-family: "Inter", -apple-system, sans-serif !important;',
        '}',
        '.mobile-menu.active { transform: translateX(0) !important; }',
        '.mobile-drawer-header {',
        '  display: flex !important; align-items: center !important; justify-content: space-between !important;',
        '  padding: 16px 20px !important; border-bottom: 1px solid #e2e8f0 !important; background: #fafbfc !important;',
        '  position: sticky !important; top: 0 !important; z-index: 2 !important;',
        '}',
        '.mobile-drawer-brand {',
        '  display: flex !important; align-items: center !important; gap: 10px !important; text-decoration: none !important;',
        '  color: #0f172a !important; font-family: "Outfit", sans-serif !important; font-weight: 800 !important; font-size: 1.15rem !important;',
        '}',
        '.mobile-drawer-close {',
        '  width: 36px !important; height: 36px !important; border-radius: 8px !important;',
        '  border: 1px solid #e2e8f0 !important; background: #ffffff !important; color: #64748b !important;',
        '  display: flex !important; align-items: center !important; justify-content: center !important;',
        '  cursor: pointer !important; font-size: 1.15rem !important; line-height: 1 !important; transition: all 0.2s ease !important;',
        '}',
        '.mobile-drawer-close:hover { background: #fef2f2 !important; color: #ef4444 !important; border-color: #fecaca !important; }',
        '.mobile-drawer-content { padding: 18px 16px 36px !important; display: flex !important; flex-direction: column !important; gap: 18px !important; }',
        '.mobile-drawer-section { display: flex !important; flex-direction: column !important; gap: 4px !important; }',
        '.mobile-drawer-label { font-size: 0.72rem !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; color: #94a3b8 !important; padding: 4px 10px !important; }',
        '.mobile-drawer-item {',
        '  display: flex !important; align-items: center !important; gap: 12px !important; padding: 10px 14px !important;',
        '  border-radius: 10px !important; color: #334155 !important; text-decoration: none !important;',
        '  font-size: 0.92rem !important; font-weight: 500 !important; transition: all 0.2s ease !important;',
        '}',
        '.mobile-drawer-item:hover { background: rgba(59, 130, 246, 0.08) !important; color: #2563eb !important; }',
        '.mobile-drawer-item.active { background: rgba(59, 130, 246, 0.12) !important; color: #2563eb !important; font-weight: 600 !important; }',
        '.mobile-drawer-item.highlight-tool { background: rgba(236, 72, 153, 0.06) !important; border: 1px solid rgba(236, 72, 153, 0.18) !important; font-weight: 600 !important; }',
        '.mobile-drawer-badge { margin-left: auto !important; font-size: 0.65rem !important; font-weight: 800 !important; padding: 2px 7px !important; border-radius: 999px !important; color: #ffffff !important; letter-spacing: 0.04em !important; }',
        '.mobile-cta {',
        '  display: block !important; width: 100% !important; text-align: center !important;',
        '  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important; color: #ffffff !important;',
        '  padding: 12px 18px !important; border-radius: 10px !important; font-weight: 700 !important; font-size: 0.92rem !important;',
        '  box-shadow: 0 4px 12px rgba(37,99,235,0.25) !important; text-decoration: none !important; transition: all 0.2s ease !important;',
        '  box-sizing: border-box !important;',
        '}',
        '.mobile-cta:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 16px rgba(37,99,235,0.35) !important; }',
        '/* Footer */',
        '.home-footer { margin-top: auto !important; background: #ffffff !important; border-top: 1px solid #e2e8f0 !important; font-family: "Inter", -apple-system, sans-serif !important; box-sizing: border-box !important; }',
        '.footer-grid { display: grid !important; grid-template-columns: 2fr 1fr 1fr 1fr !important; gap: 48px !important; padding: 64px 48px 32px !important; max-width: 1200px !important; margin: 0 auto !important; box-sizing: border-box !important; }',
        '.footer-brand .logo { margin-bottom: 16px !important; display: inline-flex !important; align-items: center !important; gap: 10px !important; text-decoration: none !important; }',
        '.footer-desc { font-size: 0.9rem !important; color: #64748b !important; line-height: 1.6 !important; max-width: 320px !important; margin: 0 !important; }',
        '.footer-links-col h4 { font-size: 0.85rem !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; color: #0f172a !important; margin-bottom: 16px !important; margin-top: 0 !important; }',
        '.footer-links-col ul { list-style: none !important; display: flex !important; flex-direction: column !important; gap: 10px !important; padding: 0 !important; margin: 0 !important; }',
        '.footer-links-col a { color: #64748b !important; text-decoration: none !important; font-size: 0.9rem !important; transition: color 0.2s ease !important; }',
        '.footer-links-col a:hover { color: #2563eb !important; }',
        '.footer-bottom { text-align: center !important; padding: 24px 48px !important; border-top: 1px solid #e2e8f0 !important; color: #94a3b8 !important; font-size: 0.8rem !important; margin: 0 !important; }',
        '@media (max-width: 768px) {',
        '  .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 40px 24px 20px !important; }',
        '  .footer-bottom { padding: 20px 24px !important; }',
        '}'
      ].join('\n');
      document.head.appendChild(styleEl);
    }

    // 2. Build Header HTML
    function buildHeaderHTML() {
      return [
        '<nav class="home-nav" id="homeNav">',
        '  <a href="/" class="logo" style="text-decoration:none;">',
        '    <div class="logo-icon" aria-hidden="true">',
        '      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">',
        '        <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>',
        '        <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>',
        '        <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>',
        '        <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>',
        '      </svg>',
        '    </div>',
        '    <span class="logo-text">CarouselForge</span>',
        '  </a>',
        '  <div class="home-nav-actions">',
        '    <a href="/" class="nav-link-item' + (isHome ? ' active' : '') + '">Home</a>',
        '    <a href="/tools/" class="nav-link-item' + (isTools ? ' active' : '') + '">Tools</a>',
        '    <a href="/blog/" class="nav-link-item' + (isBlog ? ' active' : '') + '">Blog</a>',
        '    <a href="/about" class="nav-link-item' + (isAbout ? ' active' : '') + '">About</a>',
        '    <a href="/contact" class="nav-link-item' + (isContact ? ' active' : '') + '">Contact</a>',
        '    <a href="/studio/" class="nav-btn-primary" style="text-decoration:none;">Create Free →</a>',
        '    <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open navigation menu">',
        '      <div class="hamburger">',
        '        <span></span>',
        '        <span></span>',
        '        <span></span>',
        '      </div>',
        '    </button>',
        '  </div>',
        '</nav>'
      ].join('\n');
    }

    // 3. Build Mobile Drawer HTML
    function buildDrawerHTML() {
      var isGridMaker = rawPath === '/tools/instagram-grid-maker';
      var isFormatter = rawPath === '/tools/linkedin-text-formator' || rawPath === '/tools/linkedin-text-formatter';
      var isLiCarousel = rawPath === '/linkedin-carousel-generator';
      var isIgCarousel = rawPath === '/instagram-carousel-maker';
      var isToolsHub = rawPath === '/tools' || rawPath === '/tools/';

      return [
        '<div class="mobile-menu-backdrop" id="mobileMenuBackdrop"></div>',
        '<div class="mobile-menu" id="mobileMenu">',
        '  <div class="mobile-drawer-header">',
        '    <a href="/" class="mobile-drawer-brand">',
        '      <div class="logo-icon" aria-hidden="true">',
        '        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">',
        '          <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>',
        '          <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>',
        '          <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>',
        '          <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>',
        '        </svg>',
        '      </div>',
        '      <span>CarouselForge</span>',
        '    </a>',
        '    <button type="button" class="mobile-drawer-close" id="mobileMenuCloseBtn" aria-label="Close navigation menu">✕</button>',
        '  </div>',
        '  <div class="mobile-drawer-content">',
        '    <div class="mobile-drawer-section">',
        '      <span class="mobile-drawer-label">⚡ Free Creator Tools</span>',
        '      <a href="/tools/instagram-grid-maker" class="mobile-drawer-item highlight-tool' + (isGridMaker ? ' active' : '') + '">',
        '        <span class="item-icon">📸</span>',
        '        <span>Instagram Grid Maker</span>',
        '        <span class="mobile-drawer-badge" style="background:#ec4899;">NEW</span>',
        '      </a>',
        '      <a href="/tools/linkedin-text-formator" class="mobile-drawer-item' + (isFormatter ? ' active' : '') + '">',
        '        <span class="item-icon">🔤</span>',
        '        <span>LinkedIn Text Formatter</span>',
        '      </a>',
        '      <a href="/linkedin-carousel-generator" class="mobile-drawer-item' + (isLiCarousel ? ' active' : '') + '">',
        '        <span class="item-icon">💼</span>',
        '        <span>LinkedIn Carousel Maker</span>',
        '      </a>',
        '      <a href="/instagram-carousel-maker" class="mobile-drawer-item' + (isIgCarousel ? ' active' : '') + '">',
        '        <span class="item-icon">📱</span>',
        '        <span>Instagram Carousel Maker</span>',
        '      </a>',
        '      <a href="/tools/" class="mobile-drawer-item' + (isToolsHub ? ' active' : '') + '">',
        '        <span class="item-icon">🛠️</span>',
        '        <span>All Free Tools Hub</span>',
        '      </a>',
        '    </div>',
        '    <div class="mobile-drawer-section">',
        '      <span class="mobile-drawer-label">🎨 Studio</span>',
        '      <a href="/studio/" class="mobile-cta" style="text-decoration:none;">⚡ Open Carousel Studio</a>',
        '    </div>',
        '    <div class="mobile-drawer-section">',
        '      <span class="mobile-drawer-label">🧭 Navigation</span>',
        '      <a href="/" class="mobile-drawer-item' + (isHome ? ' active' : '') + '">Home Page</a>',
        '      <a href="/blog/" class="mobile-drawer-item' + (isBlog ? ' active' : '') + '">Blog &amp; Guides</a>',
        '      <a href="/about" class="mobile-drawer-item' + (isAbout ? ' active' : '') + '">About Us</a>',
        '      <a href="/contact" class="mobile-drawer-item' + (isContact ? ' active' : '') + '">Contact Us</a>',
        '    </div>',
        '    <div class="mobile-drawer-section">',
        '      <span class="mobile-drawer-label">⚖️ Legal</span>',
        '      <a href="/privacy" class="mobile-drawer-item" style="font-size:0.84rem;color:#64748b;">Privacy Policy</a>',
        '      <a href="/terms" class="mobile-drawer-item" style="font-size:0.84rem;color:#64748b;">Terms of Service</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }

    // 4. Build Footer HTML
    function buildFooterHTML() {
      return [
        '<footer class="home-footer" id="homeFooter">',
        '  <div class="footer-grid">',
        '    <div class="footer-brand">',
        '      <div class="logo">',
        '        <div class="logo-icon" aria-hidden="true">',
        '          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">',
        '            <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>',
        '            <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>',
        '            <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>',
        '            <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>',
        '          </svg>',
        '        </div>',
        '        <span class="logo-text">CarouselForge</span>',
        '      </div>',
        '      <p class="footer-desc">The fastest way to create beautiful social media carousels. 100% free with no signup required.</p>',
        '    </div>',
        '    <div class="footer-links-col">',
        '      <h4>Free Tools</h4>',
        '      <ul>',
        '        <li><a href="/tools/instagram-grid-maker">Instagram Grid Maker</a></li>',
        '        <li><a href="/tools/linkedin-text-formator">LinkedIn Text Formatter</a></li>',
        '        <li><a href="/linkedin-carousel-generator">LinkedIn Carousel Maker</a></li>',
        '        <li><a href="/instagram-carousel-maker">Instagram Carousel Maker</a></li>',
        '        <li><a href="/tools/">All Tools Hub</a></li>',
        '      </ul>',
        '    </div>',
        '    <div class="footer-links-col">',
        '      <h4>Product</h4>',
        '      <ul>',
        '        <li><a href="/studio/">Carousel Studio</a></li>',
        '        <li><a href="/blog/">Blog &amp; Guides</a></li>',
        '        <li><a href="/about">About Us</a></li>',
        '        <li><a href="/contact">Contact Us</a></li>',
        '      </ul>',
        '    </div>',
        '    <div class="footer-links-col">',
        '      <h4>Legal</h4>',
        '      <ul>',
        '        <li><a href="/privacy">Privacy Policy</a></li>',
        '        <li><a href="/terms">Terms of Service</a></li>',
        '        <li><a href="/disclaimer">Disclaimer</a></li>',
        '      </ul>',
        '    </div>',
        '  </div>',
        '  <div class="footer-bottom">',
        '    <p>© 2026 CarouselForge. All rights reserved.</p>',
        '  </div>',
        '</footer>'
      ].join('\n');
    }

    // 5. Mount Header
    var navPlaceholder = document.getElementById('cf-nav');
    if (navPlaceholder) {
      navPlaceholder.innerHTML = buildHeaderHTML();
    } else {
      var existingNavs = document.querySelectorAll('.home-nav, .tools-nav, .blog-nav');
      if (existingNavs.length > 0) {
        existingNavs.forEach(function(nav, idx) {
          if (idx === 0) {
            var tempNav = document.createElement('div');
            tempNav.innerHTML = buildHeaderHTML();
            nav.parentNode.replaceChild(tempNav.firstElementChild, nav);
          } else if (nav.parentNode) {
            nav.parentNode.removeChild(nav);
          }
        });
      } else {
        var tempNav = document.createElement('div');
        tempNav.innerHTML = buildHeaderHTML();
        document.body.insertBefore(tempNav.firstElementChild, document.body.firstChild);
      }
    }

    // 6. Mount Mobile Drawer (clean up all existing instances)
    document.querySelectorAll('#mobileMenuBackdrop, .mobile-menu-backdrop').forEach(function(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    document.querySelectorAll('#mobileMenu, .mobile-menu').forEach(function(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    var drawerContainer = document.createElement('div');
    drawerContainer.innerHTML = buildDrawerHTML();
    while (drawerContainer.firstChild) {
      document.body.appendChild(drawerContainer.firstChild);
    }

    // 7. Mount Footer
    var footerPlaceholder = document.getElementById('cf-footer');
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = buildFooterHTML();
    } else {
      var existingFooters = document.querySelectorAll('.home-footer, .page-footer, .blog-footer');
      if (existingFooters.length > 0) {
        existingFooters.forEach(function(footer, idx) {
          if (idx === 0) {
            var tempFooter = document.createElement('div');
            tempFooter.innerHTML = buildFooterHTML();
            footer.parentNode.replaceChild(tempFooter.firstElementChild, footer);
          } else if (footer.parentNode) {
            footer.parentNode.removeChild(footer);
          }
        });
      } else {
        var tempFooter = document.createElement('div');
        tempFooter.innerHTML = buildFooterHTML();
        document.body.appendChild(tempFooter.firstElementChild);
      }
    }

    // 8. Sticky Scroll Behavior
    var nav = document.getElementById('homeNav');
    if (nav) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 15) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }, { passive: true });
    }
  }

  // 9. Delegated Mobile Drawer Interactions
  function openMobileDrawer() {
    var drawer = document.getElementById('mobileMenu');
    var backdrop = document.getElementById('mobileMenuBackdrop');
    var btn = document.getElementById('mobileMenuBtn');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    if (btn) btn.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    var drawer = document.getElementById('mobileMenu');
    var backdrop = document.getElementById('mobileMenuBackdrop');
    var btn = document.getElementById('mobileMenuBtn');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    if (btn) btn.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggleMobileDrawer() {
    var drawer = document.getElementById('mobileMenu');
    if (drawer && drawer.classList.contains('active')) {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  }

  // Bind delegated events to document once
  if (!window.__CF_UNIVERSAL_LAYOUT_BOUND__) {
    window.__CF_UNIVERSAL_LAYOUT_BOUND__ = true;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#mobileMenuBtn, .mobile-menu-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileDrawer();
        return;
      }

      var closeBtn = e.target.closest('#mobileMenuCloseBtn, .mobile-drawer-close');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        closeMobileDrawer();
        return;
      }

      var backdrop = e.target.closest('#mobileMenuBackdrop, .mobile-menu-backdrop');
      if (backdrop) {
        e.preventDefault();
        e.stopPropagation();
        closeMobileDrawer();
        return;
      }

      var drawerLink = e.target.closest('#mobileMenu a, .mobile-menu a');
      if (drawerLink) {
        closeMobileDrawer();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMobileDrawer();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalLayout);
  } else {
    initUniversalLayout();
  }
})();
