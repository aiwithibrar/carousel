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
})();
