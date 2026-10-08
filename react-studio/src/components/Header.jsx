import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function Header({
  slideCount,
  onOpenSliderMenu,
  onExportZIP,
  onExportPDF,
  isExporting
}) {
  return (
    <header className="pro-header">
      {/* Left: Brand Logo & Desktop Navigation Links (Same as whole website) */}
      <div className="header-left">
        <a href="/" className="studio-brand-link" title="CarouselForge Home">
          <div className="logo-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>
              <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>
              <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>
              <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>
            </svg>
          </div>
          <span className="logo-text">CarouselForge</span>
        </a>

        {/* Website Navigation Links (Desktop) */}
        <nav className="header-nav-links desktop-only">
          <a href="/" className="nav-link-item">Home</a>
          <a href="/tools/" className="nav-link-item">Tools</a>
          <a href="/blog/" className="nav-link-item">Blog</a>
          <a href="/about" className="nav-link-item">About</a>
          <a href="/contact" className="nav-link-item">Contact</a>
        </nav>
      </div>

      {/* Right: Studio Export Actions & Mobile-Only Menu Button */}
      <div className="header-right">
        <button
          type="button"
          className="btn-export-pdf"
          onClick={onExportPDF}
          disabled={isExporting || slideCount === 0}
          title="Export as native LinkedIn multi-page PDF document"
        >
          <FileText size={15} />
          <span className="btn-text">LinkedIn PDF</span>
        </button>

        <button
          type="button"
          className="btn-export-main"
          onClick={onExportZIP}
          disabled={isExporting || slideCount === 0}
          title="Export all slides as high-res PNG images in a ZIP"
        >
          <Download size={15} />
          <span className="btn-text">{isExporting ? 'Exporting...' : 'ZIP PNGs'}</span>
        </button>

        {/* Mobile-Only Hamburger Menu Button (Completely hidden on desktop) */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenSliderMenu}
          aria-label="Open navigation menu"
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </header>
  );
}
