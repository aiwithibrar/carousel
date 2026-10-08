const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log('--- Starting CarouselForge Clean URLs & SEO Build ---');

  // Cache or load marked.js locally for offline resilience
  const localMarkedPath = path.join(__dirname, 'lib', 'marked.min.js');
  let markedCode = '';
  if (fs.existsSync(localMarkedPath)) {
    console.log('Loading local marked.js from lib/marked.min.js...');
    markedCode = fs.readFileSync(localMarkedPath, 'utf8');
  } else {
    console.log('Fetching marked.js from CDN and saving locally...');
    const markedRes = await fetch('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
    markedCode = await markedRes.text();
    fs.writeFileSync(localMarkedPath, markedCode, 'utf8');
  }

  const evalFunc = new Function(markedCode + '; return marked;');
  const marked = evalFunc();

  // 1. Process all blog posts with robust frontmatter parser supporting CRLF & nested keys
  const postsDir = path.join(__dirname, 'blog', 'posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  function parseFrontmatter(text) {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return { body: text, meta: {} };
    const yamlStr = match[1];
    const body = text.slice(match[0].length).trim();
    const meta = {};
    let currentParent = null;

    yamlStr.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const isIndented = line.startsWith(' ') || line.startsWith('\t');
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return;
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if (val.length >= 2 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
        val = val.slice(1, -1);
      }
      if (!isIndented && val === '') {
        currentParent = key;
        meta[key] = {};
      } else if (isIndented && currentParent) {
        meta[currentParent][key] = val;
      } else {
        currentParent = null;
        meta[key] = val;
      }
    });
    return { body, meta };
  }

  function formatDate(d) {
    if (!d) return 'October 2026';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return d;
    }
  }

  const generatedPosts = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { body, meta } = parseFrontmatter(content);

    const seo = (meta.seo && typeof meta.seo === 'object') ? meta.seo : {};
    const og = (meta.og && typeof meta.og === 'object') ? meta.og : {};
    const tw = (meta.twitter && typeof meta.twitter === 'object') ? meta.twitter : {};

    const pageUrl = `https://carouselforge.app/blog/${slug}/`;
    const seoTitle = seo.meta_title || meta.title || 'Carousel Tips & Guides';
    const metaDesc = seo.meta_description || meta.description || 'Learn how to create high-converting social media carousels with CarouselForge.';
    const keywords = seo.keywords || meta.keywords || 'carousel generator, linkedin carousel, instagram carousel';
    const canonical = pageUrl;
    const ogImage = og.og_image || meta.thumbnail || 'https://carouselforge.app/icons/icon-512.png';
    const twCard = tw.twitter_card || 'summary_large_image';
    const schemaType = meta.schema_type || 'BlogPosting';
    const author = meta.author || 'CarouselForge Team';
    const category = meta.category || 'Guides';
    const dateStr = formatDate(meta.date);

    // Parse body markdown
    let bodyHtml = marked.parse(body);

    // Replace any legacy internal links
    bodyHtml = bodyHtml.replace(/https:\/\/carouselforge\.app\/blog\/post\.html\?slug=([a-zA-Z0-9_-]+)/g, 'https://carouselforge.app/blog/$1/');
    bodyHtml = bodyHtml.replace(/\/blog\/post\.html\?slug=([a-zA-Z0-9_-]+)/g, '/blog/$1/');
    bodyHtml = bodyHtml.replace(/https:\/\/carouselforge\.app\/([a-zA-Z0-9_-]+)\.html/g, 'https://carouselforge.app/$1');

    // Build standalone static HTML for this post
    const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle} | CarouselForge Blog</title>
  <meta name="description" content="${metaDesc}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="${author}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${og.og_title || seoTitle}">
  <meta property="og:description" content="${og.og_description || metaDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="CarouselForge">
  ${meta.date ? `<meta property="article:published_time" content="${meta.date}">` : ''}
  <meta property="article:section" content="${category}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="${twCard}">
  <meta name="twitter:title" content="${tw.twitter_title || og.og_title || seoTitle}">
  <meta name="twitter:description" content="${tw.twitter_description || og.og_description || metaDesc}">
  <meta name="twitter:image" content="${tw.twitter_image || ogImage}">
  <meta name="twitter:site" content="@CarouselForge">

  <!-- JSON-LD Structured Data: BlogPosting & BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${schemaType}",
    "headline": "${seoTitle.replace(/"/g, '\\"')}",
    "description": "${metaDesc.replace(/"/g, '\\"')}",
    "url": "${pageUrl}",
    "image": "${ogImage}",
    ${meta.date ? `"datePublished": "${meta.date}",` : ''}
    "author": {
      "@type": "Person",
      "name": "${author}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CarouselForge",
      "url": "https://carouselforge.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://carouselforge.app/icons/icon-512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${pageUrl}"
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://carouselforge.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://carouselforge.app/blog/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${(meta.title || seoTitle).replace(/"/g, '\\"')}",
        "item": "${pageUrl}"
      }
    ]
  }
  </script>

  <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">

  <style>
    .blog-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 40px; height: 64px; position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,0.92); backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
    }
    .blog-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .blog-nav-logo span { font-size: 1.1rem; font-weight: 800; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .blog-nav-links { display: flex; align-items: center; gap: 24px; }
    .blog-nav-links a { color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
    .blog-nav-links a:hover { color: var(--accent-primary); }
    .blog-nav-btn { background: var(--accent-primary); color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: none; font-family: inherit; transition: all 0.2s; }
    .blog-nav-btn:hover { background: #2563eb; transform: translateY(-1px); }

    .article-wrap { max-width: 760px; margin: 0 auto; padding: 48px 24px 80px; }
    .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 32px; flex-wrap: wrap; }
    .breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .breadcrumb a:hover { color: var(--accent-primary); }
    .breadcrumb-sep { color: var(--border-subtle); }

    .article-header { margin-bottom: 40px; }
    .article-category { display: inline-block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-primary); background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 4px 14px; border-radius: 999px; margin-bottom: 16px; }
    .article-title { font-size: clamp(2rem, 4.5vw, 2.75rem); font-weight: 900; line-height: 1.2; letter-spacing: -0.03em; color: var(--text-primary); margin-bottom: 20px; }
    .article-meta { display: flex; align-items: center; gap: 16px; font-size: 0.85rem; color: var(--text-secondary); flex-wrap: wrap; padding-bottom: 24px; border-bottom: 1px solid var(--border-subtle); }
    .article-meta-sep { color: var(--border-subtle); }

    .article-thumb { width: 100%; border-radius: 14px; margin-bottom: 40px; aspect-ratio: 16/9; object-fit: cover; }

    .article-content { font-family: 'Merriweather', Georgia, serif; font-size: 1.06rem; line-height: 1.85; color: #2d3748; }
    .article-content h1, .article-content h2, .article-content h3, .article-content h4 { font-family: 'Inter', -apple-system, sans-serif; font-weight: 800; color: var(--text-primary); margin-top: 48px; margin-bottom: 16px; letter-spacing: -0.02em; line-height: 1.3; }
    .article-content h2 { font-size: 1.55rem; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle); }
    .article-content h3 { font-size: 1.25rem; }
    .article-content p { margin-bottom: 24px; }
    .article-content ul, .article-content ol { margin: 0 0 24px 24px; }
    .article-content li { margin-bottom: 8px; }
    .article-content blockquote { border-left: 4px solid var(--accent-primary); margin: 32px 0; padding: 16px 24px; background: rgba(59,130,246,0.04); border-radius: 0 10px 10px 0; font-style: italic; color: var(--text-secondary); }
    .article-content blockquote p { margin: 0; }
    .article-content code { font-family: monospace; font-size: 0.88em; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; }
    .article-content pre { background: #0f172a; color: #f8fafc; padding: 20px; border-radius: 10px; overflow-x: auto; margin-bottom: 24px; }
    .article-content pre code { background: none; padding: 0; color: inherit; }
    .article-content a { color: var(--accent-primary); text-decoration: underline; text-underline-offset: 3px; }
    .article-content a:hover { color: #2563eb; }
    .article-content img { max-width: 100%; border-radius: 10px; margin: 24px 0; }
    .article-content table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-family: 'Inter', sans-serif; font-size: 0.95rem; }
    .article-content th, .article-content td { border: 1px solid var(--border-subtle); padding: 10px 14px; text-align: left; }
    .article-content th { background: #f8fafc; font-weight: 700; }

    .article-cta { margin-top: 60px; padding: 36px 32px; background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.08) 100%); border: 1px solid rgba(59,130,246,0.25); border-radius: 16px; text-align: center; }
    .article-cta h3 { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; }
    .article-cta p { color: var(--text-secondary); margin-bottom: 20px; font-size: 0.95rem; }
    .article-cta a { display: inline-block; background: var(--accent-primary); color: #fff; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 0.95rem; text-decoration: none; transition: all 0.2s; }
    .article-cta a:hover { background: #2563eb; transform: translateY(-2px); }

    .back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; font-weight: 600; margin-top: 40px; transition: color 0.2s; }
    .back-link:hover { color: var(--accent-primary); }

    .blog-footer { border-top: 1px solid var(--border-subtle); text-align: center; padding: 24px; font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 16px; }
    .blog-footer a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .blog-footer a:hover { color: var(--accent-primary); }

    @media (max-width: 991px) {
      .blog-nav { padding: 0 16px; }
      .blog-nav-links a { display: none !important; }
      .blog-nav-links .blog-nav-btn { display: none !important; }
      .article-wrap { padding: 24px 16px 60px; }
    }
  </style>
</head>
<body>

  <nav class="blog-nav">
    <a href="/" class="blog-nav-logo">
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>
        <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>
        <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>
        <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>
      </svg>
      <span>CarouselForge</span>
    </a>
    <div class="blog-nav-links">
      <a href="/" class="hide-mobile">Home</a>
      <a href="/tools/" class="hide-mobile">Tools</a>
      <a href="/blog/" class="hide-mobile">Blog</a>
      <a href="/about" class="hide-mobile">About</a>
      <a href="/studio/" class="blog-nav-btn">Create Free &#8594;</a>
      <!-- Mobile hamburger -->
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open navigation menu">
        <div class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
  </nav>

  <!-- Mobile Slider Menu Backdrop & Drawer -->
  <div class="mobile-menu-backdrop" id="mobileMenuBackdrop"></div>
  <div class="mobile-menu" id="mobileMenu">
    <div class="mobile-drawer-header">
      <a href="/" class="mobile-drawer-brand">
        <div class="logo-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>
            <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>
            <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>
            <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>
          </svg>
        </div>
        <span>CarouselForge</span>
      </a>
      <button type="button" class="mobile-drawer-close" id="mobileMenuCloseBtn" aria-label="Close navigation menu">✕</button>
    </div>
    <div class="mobile-drawer-content">
      <div class="mobile-drawer-section">
        <span class="mobile-drawer-label">⚡ Free Creator Tools</span>
        <a href="/tools/instagram-grid-maker" class="mobile-drawer-item highlight-tool">
          <span class="item-icon">📸</span>
          <span>Instagram Grid Maker</span>
          <span class="mobile-drawer-badge" style="background:#ec4899;">NEW</span>
        </a>
        <a href="/tools/linkedin-text-formator" class="mobile-drawer-item">
          <span class="item-icon">🔤</span>
          <span>LinkedIn Text Formatter</span>
        </a>
        <a href="/linkedin-carousel-generator" class="mobile-drawer-item">
          <span class="item-icon">💼</span>
          <span>LinkedIn Carousel Maker</span>
        </a>
        <a href="/instagram-carousel-maker" class="mobile-drawer-item">
          <span class="item-icon">📱</span>
          <span>Instagram Carousel Maker</span>
        </a>
        <a href="/tools/" class="mobile-drawer-item">
          <span class="item-icon">🛠️</span>
          <span>All Free Tools Hub</span>
        </a>
      </div>
      <div class="mobile-drawer-section">
        <span class="mobile-drawer-label">🎨 Studio</span>
        <a href="/studio/" class="mobile-cta" style="text-decoration:none;">⚡ Open Carousel Studio</a>
      </div>
      <div class="mobile-drawer-section">
        <span class="mobile-drawer-label">🧭 Navigation</span>
        <a href="/" class="mobile-drawer-item">Home Page</a>
        <a href="/blog/" class="mobile-drawer-item">Blog &amp; Guides</a>
        <a href="/about" class="mobile-drawer-item">About Us</a>
        <a href="/contact" class="mobile-drawer-item">Contact Us</a>
      </div>
      <div class="mobile-drawer-section">
        <span class="mobile-drawer-label">⚖️ Legal</span>
        <a href="/privacy" class="mobile-drawer-item" style="font-size:0.84rem;color:var(--text-secondary);">Privacy Policy</a>
        <a href="/terms" class="mobile-drawer-item" style="font-size:0.84rem;color:var(--text-secondary);">Terms of Service</a>
      </div>
    </div>
  </div>

  <div id="pageContent">
    <article class="article-wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span class="breadcrumb-sep">/</span>
        <a href="/blog/">Blog</a>
        <span class="breadcrumb-sep">/</span>
        <span>${(meta.title || seoTitle).replace(/</g, '&lt;')}</span>
      </nav>

      <header class="article-header">
        <span class="article-category">${category}</span>
        <h1 class="article-title">${(meta.title || seoTitle).replace(/</g, '&lt;')}</h1>
        <div class="article-meta">
          <span>By ${author}</span>
          <span class="article-meta-sep">&#183;</span>
          <time datetime="${meta.date || ''}">${dateStr}</time>
          <span class="article-meta-sep">&#183;</span>
          <span>Free Guide</span>
        </div>
      </header>

      ${meta.thumbnail ? `<img class="article-thumb" src="${meta.thumbnail}" alt="${(meta.title || seoTitle).replace(/"/g, '&quot;')}" loading="lazy">` : ''}

      <div class="article-content">
        ${bodyHtml}
      </div>

      <div class="article-cta">
        <h3>Ready to make your carousel?</h3>
        <p>Turn any text into beautiful social media slides &#8212; free, no signup needed.</p>
        <a href="/studio/">Create Carousel Free &#8594;</a>
      </div>

      <a href="/blog/" class="back-link">&#8592; Back to all articles</a>
    </article>
  </div>

  <footer class="blog-footer">
    <span>&#169; 2026 CarouselForge</span>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
    <a href="/contact">Contact</a>
  </footer>

  <!-- Universal Layout Component (Nav, Drawer, Footer) -->
  <script src="/universal-layout.js" defer></script>
</body>
</html>`;

    const postDir = path.join(__dirname, 'blog', slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');
    console.log(`Generated Blog Post: /blog/${slug}/index.html (Title: "${seoTitle}")`);

    generatedPosts.push({
      slug,
      title: meta.title || seoTitle,
      url: pageUrl,
      lastmod: (meta.date ? meta.date.split('T')[0] : '2026-10-09')
    });
  }

  // Alias /blog/best-free-carousel-generators -> /blog/best-free-carousel-generators-2026/
  const aliasDir = path.join(__dirname, 'blog', 'best-free-carousel-generators');
  if (!fs.existsSync(aliasDir)) {
    fs.mkdirSync(aliasDir, { recursive: true });
  }
  const aliasRedirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting to /blog/best-free-carousel-generators-2026/...</title>
  <link rel="canonical" href="https://carouselforge.app/blog/best-free-carousel-generators-2026/">
  <meta http-equiv="refresh" content="0; url=/blog/best-free-carousel-generators-2026/">
  <script>
    window.location.replace('/blog/best-free-carousel-generators-2026/');
  </script>
</head>
<body>
  <p>Redirecting to <a href="/blog/best-free-carousel-generators-2026/">/blog/best-free-carousel-generators-2026/</a>...</p>
</body>
</html>`;
  fs.writeFileSync(path.join(aliasDir, 'index.html'), aliasRedirectHtml, 'utf8');
  console.log('Created alias redirect: /blog/best-free-carousel-generators/ -> /blog/best-free-carousel-generators-2026/');

  // 2. Process Static Pages: Read from git show HEAD to get clean original content
  const staticPages = [
    { name: 'about', title: 'About Us | CarouselForge', schema: 'AboutPage' },
    { name: 'contact', title: 'Contact Us | CarouselForge', schema: 'ContactPage' },
    { name: 'privacy', title: 'Privacy Policy | CarouselForge', schema: 'WebPage' },
    { name: 'terms', title: 'Terms of Service | CarouselForge', schema: 'WebPage' },
    { name: 'disclaimer', title: 'Disclaimer | CarouselForge', schema: 'WebPage' },
    { name: 'linkedin-carousel-generator', title: 'LinkedIn Carousel Maker | CarouselForge', schema: 'WebApplication' },
    { name: 'instagram-carousel-maker', title: 'Instagram Carousel Maker | CarouselForge', schema: 'WebApplication' }
  ];

  for (const p of staticPages) {
    const filename = `${p.name}.html`;
    console.log(`Extracting pristine content from git show HEAD:${filename}...`);
    let originalHtml = '';
    try {
      originalHtml = execSync(`git show HEAD:${filename}`, { encoding: 'utf8' });
    } catch (err) {
      console.error(`Failed to get git HEAD content for ${filename}`, err);
      continue;
    }

    // Target directory: /<name>/index.html
    const targetDir = path.join(__dirname, p.name);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Clean up content for /<name>/index.html
    let cleanContent = originalHtml;

    // 1. Canonical tag: must point to clean URL
    const canonicalClean = `https://carouselforge.app/${p.name}`;
    if (cleanContent.includes('<link rel="canonical"')) {
      cleanContent = cleanContent.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonicalClean}">`);
    } else {
      cleanContent = cleanContent.replace(/<\/head>/i, `    <link rel="canonical" href="${canonicalClean}">\n</head>`);
    }

    // 2. JSON-LD and OG URLs: clean URL
    cleanContent = cleanContent.replace(new RegExp(`https://carouselforge\\.app/${p.name}\\.html`, 'g'), canonicalClean);
    cleanContent = cleanContent.replace(new RegExp(`"url":\\s*"https://carouselforge\\.app/${p.name}\\.html"`, 'g'), `"url": "${canonicalClean}"`);

    // 3. Convert all internal .html links to clean URLs
    cleanContent = cleanContent
      .replace(/href="\.\/about\.html"/g, 'href="/about"')
      .replace(/href="\.\/contact\.html"/g, 'href="/contact"')
      .replace(/href="\.\/privacy\.html"/g, 'href="/privacy"')
      .replace(/href="\.\/terms\.html"/g, 'href="/terms"')
      .replace(/href="\.\/disclaimer\.html"/g, 'href="/disclaimer"')
      .replace(/href="\.\/linkedin-carousel-generator\.html"/g, 'href="/linkedin-carousel-generator"')
      .replace(/href="\.\/instagram-carousel-maker\.html"/g, 'href="/instagram-carousel-maker"')
      .replace(/href="about\.html"/g, 'href="/about"')
      .replace(/href="contact\.html"/g, 'href="/contact"')
      .replace(/href="privacy\.html"/g, 'href="/privacy"')
      .replace(/href="terms\.html"/g, 'href="/terms"')
      .replace(/href="disclaimer\.html"/g, 'href="/disclaimer"')
      .replace(/href="linkedin-carousel-generator\.html"/g, 'href="/linkedin-carousel-generator"')
      .replace(/href="instagram-carousel-maker\.html"/g, 'href="/instagram-carousel-maker"')
      .replace(/href="\.\/studio\/"/g, 'href="/studio/"')
      .replace(/href="\.\/blog\/"/g, 'href="/blog/"')
      .replace(/href="\.\/"/g, 'href="/"');

    // 4. Convert relative assets to root-relative so /<page>/ serves without 404
    cleanContent = cleanContent
      .replace(/href="\.\/style\.css"/g, 'href="/style.css"')
      .replace(/href="style\.css"/g, 'href="/style.css"')
      .replace(/href="\.\/icons\//g, 'href="/icons/')
      .replace(/src="\.\/lib\//g, 'src="/lib/')
      .replace(/src="\.\/app\.js"/g, 'src="/app.js"')
      .replace(/src="\.\/feedback\.js"/g, 'src="/feedback.js"')
      .replace(/src="\.\/sticky-footer-ad\.js"/g, 'src="/sticky-footer-ad.js"')
      .replace(/src="\.\/seo-inject\.js"/g, 'src="/seo-inject.js"');

    // 5. Ensure universal-layout.js is included before </body>
    if (!cleanContent.includes('universal-layout.js')) {
      cleanContent = cleanContent.replace(/<\/body>/i, '    <script src="/universal-layout.js" defer></script>\n</body>');
    }

    // Write clean directory index.html
    fs.writeFileSync(path.join(targetDir, 'index.html'), cleanContent, 'utf8');
    console.log(`Generated Clean Page: /${p.name}/index.html (Canonical: ${canonicalClean})`);

    // Now write 301 redirect wrapper into the legacy .html file
    const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting to /${p.name}...</title>
  <link rel="canonical" href="${canonicalClean}">
  <meta http-equiv="refresh" content="0; url=/${p.name}">
  <script>
    window.location.replace('/${p.name}');
  </script>
</head>
<body>
  <p>Redirecting to <a href="/${p.name}">/${p.name}</a>...</p>
</body>
</html>`;
    fs.writeFileSync(path.join(__dirname, filename), redirectHtml, 'utf8');
    console.log(`Updated 301 Redirect: ${filename} -> /${p.name}`);
  }

  // 3. Update Netlify _redirects file
  const redirectsContent = `# CarouselForge Netlify 301 Redirect Rules
# Blog URLs: Old query parameter URL -> Clean URL
/blog/post.html?slug=:slug  /blog/:slug/  301!

# Blog URL alias
/blog/best-free-carousel-generators  /blog/best-free-carousel-generators-2026/  301!

# Legacy HTML URLs -> Clean Canonical URLs
/about.html                         /about                         301!
/contact.html                       /contact                       301!
/privacy.html                       /privacy                       301!
/terms.html                         /terms                         301!
/disclaimer.html                    /disclaimer                    301!
/linkedin-carousel-generator.html   /linkedin-carousel-generator   301!
/instagram-carousel-maker.html      /instagram-carousel-maker     301!
/linkedin-text-formatter            /tools/linkedin-text-formator  301!
/tools/linkedin-text-formatter      /tools/linkedin-text-formator  301!
`;
  fs.writeFileSync(path.join(__dirname, '_redirects'), redirectsContent, 'utf8');
  console.log('Created _redirects file with 301 rules');

  // 4. Update sitemap.xml with all canonical clean URLs
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Site Pages -->
  <url>
    <loc>https://carouselforge.app/</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/studio/</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/tools/linkedin-text-formator</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/linkedin-carousel-generator</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/instagram-carousel-maker</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/tools/instagram-grid-maker</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/tools/</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Blog Index -->
  <url>
    <loc>https://carouselforge.app/blog/</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Clean Blog Article URLs -->
${generatedPosts.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Supporting Pages (Clean URLs) -->
  <url>
    <loc>https://carouselforge.app/about</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/contact</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/privacy</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/terms</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://carouselforge.app/disclaimer</loc>
    <lastmod>2026-10-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
`;
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('Updated sitemap.xml with all clean URLs');

  console.log('--- Build Clean URLs Complete Successfully! ---');
}

run().catch(err => {
  console.error('Error in build-clean-urls:', err);
  process.exit(1);
});
