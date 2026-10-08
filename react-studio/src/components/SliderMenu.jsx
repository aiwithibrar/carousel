import React from 'react';
import { 
  X, 
  Home, 
  Wrench, 
  FileText, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function SliderMenu({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="mobile-menu-backdrop active" onClick={onClose}>
      <div className="mobile-menu active" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <a href="/" className="mobile-drawer-brand">
            <div className="logo-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="2" fill="#818cf8"/>
                <rect x="16" y="2" width="10" height="10" rx="2" fill="#c084fc"/>
                <rect x="2" y="16" width="10" height="10" rx="2" fill="#f472b6"/>
                <rect x="16" y="16" width="10" height="10" rx="2" fill="#fb923c"/>
              </svg>
            </div>
            <span>CarouselForge</span>
          </a>
          <button 
            type="button" 
            className="mobile-drawer-close" 
            onClick={onClose} 
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="mobile-drawer-content">
          {/* Section: Free Creator Tools */}
          <div className="mobile-drawer-section">
            <span className="mobile-drawer-label">⚡ Free Creator Tools</span>
            <a href="/tools/instagram-grid-maker" className="mobile-drawer-item highlight-tool">
              <span className="item-icon">📸</span>
              <span>Instagram Grid Maker</span>
              <span className="mobile-drawer-badge" style={{ background: '#ec4899' }}>NEW</span>
            </a>
            <a href="/tools/linkedin-text-formator" className="mobile-drawer-item">
              <span className="item-icon">🔤</span>
              <span>LinkedIn Text Formatter</span>
            </a>
            <a href="/linkedin-carousel-generator" className="mobile-drawer-item">
              <span className="item-icon">💼</span>
              <span>LinkedIn Carousel Maker</span>
            </a>
            <a href="/instagram-carousel-maker" className="mobile-drawer-item">
              <span className="item-icon">📱</span>
              <span>Instagram Carousel Maker</span>
            </a>
            <a href="/tools/" className="mobile-drawer-item">
              <span className="item-icon">🛠️</span>
              <span>All Free Tools Hub</span>
            </a>
          </div>

          {/* Section: Studio */}
          <div className="mobile-drawer-section">
            <span className="mobile-drawer-label">🎨 Studio</span>
            <button 
              type="button" 
              className="mobile-cta" 
              onClick={onClose}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              ⚡ Carousel Studio (Active)
            </button>
          </div>

          {/* Section: Navigation */}
          <div className="mobile-drawer-section">
            <span className="mobile-drawer-label">🧭 Navigation</span>
            <a href="/" className="mobile-drawer-item">
              <span className="item-icon">🏠</span>
              <span>Home Page</span>
            </a>
            <a href="/blog/" className="mobile-drawer-item">
              <span className="item-icon">📚</span>
              <span>Blog &amp; Guides</span>
            </a>
            <a href="/about" className="mobile-drawer-item">
              <span className="item-icon">ℹ️</span>
              <span>About Us</span>
            </a>
            <a href="/contact" className="mobile-drawer-item">
              <span className="item-icon">✉️</span>
              <span>Contact Us</span>
            </a>
          </div>

          {/* Section: Legal */}
          <div className="mobile-drawer-section">
            <span className="mobile-drawer-label">⚖️ Legal</span>
            <a href="/privacy" className="mobile-drawer-item" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Privacy Policy
            </a>
            <a href="/terms" className="mobile-drawer-item" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
