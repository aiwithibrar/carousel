import React from 'react';
import { 
  Menu,
  Flame, 
  Smartphone, 
  FileText, 
  Download, 
  Layers,
  Sliders,
  Home
} from 'lucide-react';

export default function Header({
  slideCount,
  onOpenSliderMenu,
  onExportZIP,
  onExportPDF,
  isExporting,
  viewMode,
  setViewMode,
  onOpenViralHooks,
  onOpenFeedSimulator
}) {
  return (
    <header className="pro-header">
      {/* Left: Menu Drawer Toggle + Logo + Slide count */}
      <div className="header-left">
        <a
          href="/"
          className="header-home-btn"
          title="Back to CarouselForge Home Page"
        >
          <Home size={15} />
          <span className="desktop-only">Home</span>
        </a>

        <button
          type="button"
          className="header-menu-trigger"
          onClick={onOpenSliderMenu}
          aria-label="Open Studio Menu"
          title="Open Studio Menu (Tools, Brand Kit, Themes & Settings)"
        >
          <Menu size={18} />
          <span className="menu-btn-text">Menu</span>
        </button>

        <div className="pro-brand-logo">
          <span className="pro-brand-title">Carousel Maker Pro</span>
          <span className="pro-brand-pill">Studio</span>
        </div>

        {slideCount > 0 && (
          <div className="pro-count-chip desktop-only">
            <Layers size={13} />
            <span>{slideCount} {slideCount === 1 ? 'Slide' : 'Slides'}</span>
          </div>
        )}
      </div>

      {/* Center: Strip / Grid View Mode & Creative Shortcuts (Desktop) */}
      <div className="header-center desktop-only">
        <div className="pro-mode-selector">
          <button
            type="button"
            className={viewMode === 'strip' ? 'active' : ''}
            onClick={() => setViewMode('strip')}
            title="Horizontal Carousel View"
          >
            Strip Flow
          </button>
          <button
            type="button"
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid Overview"
          >
            Grid View
          </button>
        </div>

        <button
          type="button"
          className="pro-header-subbtn highlight-amber"
          onClick={onOpenViralHooks}
          title="Browse viral headline hooks & formulas"
        >
          <Flame size={14} className="text-amber" />
          <span>Viral Hooks</span>
        </button>

        <button
          type="button"
          className="pro-header-subbtn highlight-indigo"
          onClick={onOpenFeedSimulator}
          title="Preview in realistic LinkedIn & Instagram feeds"
        >
          <Smartphone size={14} className="text-indigo" />
          <span>Feed Simulator</span>
        </button>
      </div>

      {/* Right: Primary Export Buttons */}
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

        <button
          type="button"
          className="header-tools-mobile-btn mobile-only"
          onClick={onOpenSliderMenu}
          title="All Tools & Brand Kit"
        >
          <Sliders size={17} />
        </button>
      </div>
    </header>
  );
}
