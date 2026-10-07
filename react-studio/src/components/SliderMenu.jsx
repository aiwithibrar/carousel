import React from 'react';
import { 
  X, 
  Flame, 
  Smartphone, 
  Sparkles, 
  Play, 
  FileText, 
  Download, 
  Palette, 
  Sliders, 
  MessageSquare, 
  RotateCcw, 
  Layers, 
  Upload, 
  Save, 
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { CMP_THEMES, LAYOUT_TYPES, ASPECT_RATIOS } from '../constants/themes';

export default function SliderMenu({
  isOpen,
  onClose,
  slideCount,
  themeKey,
  setThemeKey,
  ratio,
  setRatio,
  globalLayout,
  setGlobalLayout,
  texture,
  setTexture,
  seamlessConnectors,
  setSeamlessConnectors,
  brandKit,
  setBrandKit,
  onSaveBrandKit,
  onResetBrandKit,
  onOpenViralHooks,
  onOpenFeedSimulator,
  onOpenAIPrompt,
  onOpenFeedback,
  onReplay,
  onExportPDF,
  onExportZIP,
  onResetDraft
}) {
  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 256 / img.height);
        const cv = document.createElement('canvas');
        cv.width = img.width * s;
        cv.height = img.height * s;
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        setBrandKit((prev) => ({ ...prev, logoData: cv.toDataURL('image/png') }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="slider-menu-backdrop" onClick={onClose}>
      <div className="slider-menu-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-brand-badge">
              <Layers size={18} className="text-acc" />
            </div>
            <div>
              <h3 className="drawer-title">Studio Menu</h3>
              <p className="drawer-subtitle">All features, tools & settings</p>
            </div>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="drawer-body">
          {/* SECTION 1: CREATIVE KILLER TOOLS */}
          <div className="drawer-section">
            <span className="drawer-section-label">⚡ Viral Tools & Simulators</span>
            
            <div className="drawer-actions-grid">
              <button
                type="button"
                className="drawer-action-card highlight-amber"
                onClick={() => { onOpenViralHooks(); onClose(); }}
              >
                <div className="card-icon-wrap amber">
                  <Flame size={18} />
                </div>
                <div className="card-text">
                  <span className="card-title">Viral Hooks Library</span>
                  <span className="card-desc">High-converting headline formulas</span>
                </div>
                <ChevronRight size={15} className="card-arrow" />
              </button>

              <button
                type="button"
                className="drawer-action-card highlight-indigo"
                onClick={() => { onOpenFeedSimulator(); onClose(); }}
              >
                <div className="card-icon-wrap indigo">
                  <Smartphone size={18} />
                </div>
                <div className="card-text">
                  <span className="card-title">Feed Simulator</span>
                  <span className="card-desc">LinkedIn & Instagram feed mockups</span>
                </div>
                <ChevronRight size={15} className="card-arrow" />
              </button>

              <button
                type="button"
                className="drawer-action-card"
                onClick={() => { onOpenAIPrompt(); onClose(); }}
              >
                <div className="card-icon-wrap violet">
                  <Sparkles size={18} />
                </div>
                <div className="card-text">
                  <span className="card-title">AI Prompt Generator</span>
                  <span className="card-desc">Prompts for ChatGPT & Claude</span>
                </div>
                <ChevronRight size={15} className="card-arrow" />
              </button>

              <button
                type="button"
                className="drawer-action-card"
                onClick={() => { onReplay(); onClose(); }}
              >
                <div className="card-icon-wrap blue">
                  <Play size={18} />
                </div>
                <div className="card-text">
                  <span className="card-title">Replay Word Motion</span>
                  <span className="card-desc">Replay rising kinetic typography</span>
                </div>
                <ChevronRight size={15} className="card-arrow" />
              </button>
            </div>
          </div>

          {/* SECTION 2: EXPORT OPTIONS */}
          <div className="drawer-section">
            <span className="drawer-section-label">📦 Export & Downloads</span>
            
            <div className="drawer-export-grid">
              <button
                type="button"
                className="drawer-btn-pdf"
                onClick={() => { onExportPDF(); onClose(); }}
              >
                <FileText size={16} />
                <span>Download LinkedIn PDF</span>
              </button>

              <button
                type="button"
                className="drawer-btn-zip"
                onClick={() => { onExportZIP(); onClose(); }}
              >
                <Download size={16} />
                <span>Download All PNGs (ZIP)</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: STYLE & RATIO */}
          <div className="drawer-section">
            <span className="drawer-section-label">🎨 Format & Theme Style</span>

            <div className="drawer-row-unit">
              <label className="drawer-unit-label">Aspect Ratio</label>
              <div className="seg-ratio-group full">
                <button
                  type="button"
                  className={ratio === 'r45' ? 'active' : ''}
                  onClick={() => setRatio('r45')}
                >
                  4:5 Portrait (LinkedIn & IG)
                </button>
                <button
                  type="button"
                  className={ratio === 'r11' ? 'active' : ''}
                  onClick={() => setRatio('r11')}
                >
                  1:1 Square (Feeds)
                </button>
              </div>
            </div>

            <div className="drawer-row-unit">
              <label className="drawer-unit-label">Slide Theme ({CMP_THEMES[themeKey]?.name || 'Custom'})</label>
              <div className="drawer-swatches-row">
                {Object.entries(CMP_THEMES).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    className={`pro-swatch-btn ${themeKey === k ? 'selected' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${v.b1}, ${v.b2})`,
                      boxShadow: `inset 0 0 0 5px ${v.b1}, inset 0 0 0 9px ${v.acc}`
                    }}
                    title={`${v.name}: ${v.desc}`}
                    onClick={() => setThemeKey(k)}
                  />
                ))}
                <button
                  type="button"
                  className={`pro-swatch-btn ${themeKey === 'brand' ? 'selected' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${brandKit.c1}, ${brandKit.c2})`,
                    boxShadow: `inset 0 0 0 5px ${brandKit.c1}, inset 0 0 0 9px ${brandKit.c4}`
                  }}
                  title="Custom Brand Kit Palette"
                  onClick={() => setThemeKey('brand')}
                >
                  <span className="brand-swatch-b">B</span>
                </button>
              </div>
            </div>

            <div className="drawer-row-unit">
              <label className="drawer-unit-label">Global Slide Layout</label>
              <select
                className="pro-select"
                value={globalLayout}
                onChange={(e) => setGlobalLayout(e.target.value)}
              >
                {LAYOUT_TYPES.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} — {lt.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 4: PRO FINISHING TOGGLES */}
          <div className="drawer-section">
            <span className="drawer-section-label">✨ Pro Visual Effects</span>

            <div className="drawer-toggle-row">
              <div>
                <span className="toggle-title">Connected Swipe Connectors</span>
                <span className="toggle-desc">Continuous arc bridges across slides</span>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${seamlessConnectors ? 'active' : ''}`}
                onClick={() => setSeamlessConnectors(!seamlessConnectors)}
              >
                <span className="toggle-switch-knob" />
              </button>
            </div>

            <div className="drawer-toggle-row">
              <div>
                <span className="toggle-title">Film Grain Noise Texture</span>
                <span className="toggle-desc">Organic subtle photographic overlay</span>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${texture === 'grain' ? 'active' : ''}`}
                onClick={() => setTexture(texture === 'grain' ? 'none' : 'grain')}
              >
                <span className="toggle-switch-knob" />
              </button>
            </div>
          </div>

          {/* SECTION 5: BRAND KIT */}
          <div className="drawer-section">
            <span className="drawer-section-label">🛡️ Brand Kit & Signature</span>

            <div className="drawer-brand-fields">
              <div className="field-unit">
                <label>Brand Name</label>
                <input
                  type="text"
                  className="pro-input"
                  value={brandKit.name}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Company / Name"
                />
              </div>

              <div className="field-unit">
                <label>Handle / Tagline</label>
                <input
                  type="text"
                  className="pro-input"
                  value={brandKit.handle}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, handle: e.target.value }))}
                  placeholder="@yourhandle"
                />
              </div>

              <div className="field-unit">
                <label>Logo Signature</label>
                <label className="logo-upload-trigger">
                  <Upload size={14} />
                  <span>{brandKit.logoData ? 'Change Logo' : 'Upload PNG Logo'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div className="field-unit">
                <label>Footer Visibility</label>
                <select
                  className="pro-select"
                  value={brandKit.showFooter ? '1' : '0'}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, showFooter: e.target.value === '1' }))}
                >
                  <option value="1">Show brand & logo in footer</option>
                  <option value="0">Hide footer</option>
                </select>
              </div>

              <div className="drawer-color-pickers">
                <div>
                  <label>Background 1</label>
                  <input type="color" className="color-input" value={brandKit.c1} onChange={(e) => setBrandKit((prev) => ({ ...prev, c1: e.target.value }))} />
                </div>
                <div>
                  <label>Background 2</label>
                  <input type="color" className="color-input" value={brandKit.c2} onChange={(e) => setBrandKit((prev) => ({ ...prev, c2: e.target.value }))} />
                </div>
                <div>
                  <label>Text Color</label>
                  <input type="color" className="color-input" value={brandKit.c3} onChange={(e) => setBrandKit((prev) => ({ ...prev, c3: e.target.value }))} />
                </div>
                <div>
                  <label>Accent Color</label>
                  <input type="color" className="color-input" value={brandKit.c4} onChange={(e) => setBrandKit((prev) => ({ ...prev, c4: e.target.value }))} />
                </div>
              </div>

              <div className="drawer-brand-btn-row">
                <button type="button" className="btn-secondary" onClick={onSaveBrandKit}>
                  <Save size={14} />
                  <span>Save on this device</span>
                </button>
                <button type="button" className="btn-secondary text-muted" onClick={onResetBrandKit}>
                  <RotateCcw size={14} />
                  <span>Reset Kit</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 6: SYSTEM & FEEDBACK */}
          <div className="drawer-section">
            <div className="drawer-system-row">
              <button
                type="button"
                className="drawer-sys-btn"
                onClick={() => { onOpenFeedback(); onClose(); }}
              >
                <MessageSquare size={15} />
                <span>Send Feedback</span>
              </button>

              <button
                type="button"
                className="drawer-sys-btn danger"
                onClick={() => { onResetDraft(); onClose(); }}
              >
                <RotateCcw size={15} />
                <span>Reset to Sample</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
