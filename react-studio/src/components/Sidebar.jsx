import React, { useState } from 'react';
import { 
  FileText, 
  Palette, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Save, 
  Upload, 
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  Sliders,
  Sparkle,
  Eye
} from 'lucide-react';
import { CMP_THEMES, LAYOUT_TYPES, ASPECT_RATIOS } from '../constants/themes';

export default function Sidebar({
  rawText,
  setRawText,
  themeKey,
  setThemeKey,
  globalLayout,
  setGlobalLayout,
  ratio,
  setRatio,
  brandKit,
  setBrandKit,
  texture = 'grain',
  setTexture,
  seamlessConnectors = true,
  setSeamlessConnectors,
  onReplay,
  onOpenAIPrompt,
  onOpenViralHooks,
  onSaveBrandKit,
  onResetBrandKit,
  onGoToPreview,
  slidesCount
}) {
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [brandKitMsg, setBrandKitMsg] = useState('');

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
        const data = cv.toDataURL('image/png');
        setBrandKit((prev) => ({ ...prev, logoData: data }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveKit = () => {
    onSaveBrandKit();
    setBrandKitMsg('Saved on this device.');
    setTimeout(() => setBrandKitMsg(''), 2500);
  };

  const handleResetKit = () => {
    onResetBrandKit();
    setBrandKitMsg('Brand kit reset.');
    setTimeout(() => setBrandKitMsg(''), 2500);
  };

  return (
    <aside className="pro-sidebar">
      {/* 1. Main Text Input & Quick Controls */}
      <div className="pro-panel">
        <div className="panel-header-row">
          <label htmlFor="txt" className="panel-title">Your Carousel Text</label>
          <div className="header-helpers">
            <button 
              type="button" 
              className="ai-helper-link viral"
              onClick={onOpenViralHooks}
              title="Pick a high-performing headline formula"
            >
              <Flame size={13} className="text-amber" />
              <span>Hooks</span>
            </button>
            <button 
              type="button" 
              className="ai-helper-link"
              onClick={onOpenAIPrompt}
              title="AI Prompt generator"
            >
              <Sparkles size={13} />
              <span>Prompt</span>
            </button>
          </div>
        </div>

        <textarea
          id="txt"
          className="pro-textarea"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Headline for slide 1
Subtitle or context

Next slide headline
Body text for slide 2...`}
          rows={10}
        />

        <p className="pro-hint">
          <strong>Blank line = new slide.</strong> First line = heading, other lines = body. Layouts pick automatically. Force one by adding a tag like <code>[stat]</code>, <code>[list]</code>, <code>[question]</code>, <code>[split]</code>, <code>[cover]</code>, or <code>[cta]</code>.
        </p>

        {/* Style Swatches */}
        <div className="swatches-label">Color Style</div>
        <div className="swatches-row" role="group" aria-label="Style Themes">
          {Object.entries(CMP_THEMES).map(([k, v]) => (
            <button
              key={k}
              type="button"
              className={`pro-swatch-btn ${themeKey === k ? 'selected' : ''}`}
              style={{
                background: `linear-gradient(135deg, ${v.b1}, ${v.b2})`,
                boxShadow: `inset 0 0 0 5px ${v.b1}, inset 0 0 0 9px ${v.acc}`
              }}
              aria-label={v.name}
              title={`${v.name}: ${v.desc}`}
              onClick={() => setThemeKey(k)}
            />
          ))}

          {/* Brand Swatch */}
          <button
            type="button"
            className={`pro-swatch-btn ${themeKey === 'brand' ? 'selected' : ''}`}
            style={{
              background: `linear-gradient(135deg, ${brandKit.c1}, ${brandKit.c2})`,
              boxShadow: `inset 0 0 0 5px ${brandKit.c1}, inset 0 0 0 9px ${brandKit.c4}`
            }}
            aria-label="Brand Custom"
            title="Custom Brand Kit Palette"
            onClick={() => setThemeKey('brand')}
          >
            <span className="brand-swatch-b">B</span>
          </button>
        </div>

        {/* Quick Toolbar (Ratio, Layout, Replay) */}
        <div className="pro-row-controls">
          <div className="seg-ratio-group" role="group" aria-label="Aspect Ratio">
            <button
              type="button"
              className={ratio === 'r45' ? 'active' : ''}
              onClick={() => setRatio('r45')}
              title="4:5 Portrait (Optimized for LinkedIn & Instagram)"
            >
              4:5
            </button>
            <button
              type="button"
              className={ratio === 'r11' ? 'active' : ''}
              onClick={() => setRatio('r11')}
              title="1:1 Square (Instagram & Feeds)"
            >
              1:1
            </button>
          </div>

          <select
            className="pro-select"
            value={globalLayout}
            onChange={(e) => setGlobalLayout(e.target.value)}
            aria-label="Global Layout"
          >
            {LAYOUT_TYPES.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="pro-btn-secondary"
            onClick={onReplay}
            title="Replay slide animations"
          >
            <Play size={13} />
            <span>Replay</span>
          </button>
        </div>

        {/* Pro Effects & Finishing Toggles */}
        <div className="pro-finishing-controls">
          <div className="finishing-toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Connected Swipe</span>
              <span className="toggle-sub">Arcs bridging consecutive slides</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${seamlessConnectors ? 'active' : ''}`}
              onClick={() => setSeamlessConnectors(!seamlessConnectors)}
              title="Toggle Connected Swipe Graphics"
            >
              <span className="toggle-switch-knob" />
            </button>
          </div>

          <div className="finishing-toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Film Grain Texture</span>
              <span className="toggle-sub">Subtle photographic noise</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${texture === 'grain' ? 'active' : ''}`}
              onClick={() => setTexture(texture === 'grain' ? 'none' : 'grain')}
              title="Toggle Film Grain Overlay"
            >
              <span className="toggle-switch-knob" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Brand Kit Panel */}
      <div className="pro-panel">
        <button
          type="button"
          className="brand-kit-toggle"
          onClick={() => setIsBrandKitOpen((prev) => !prev)}
        >
          <div className="toggle-left">
            <Palette size={16} />
            <span className="toggle-title">Brand Kit & Signature</span>
          </div>
          {isBrandKitOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isBrandKitOpen && (
          <div className="brand-kit-body">
            <div className="brand-grid">
              <div className="field-unit">
                <label>Brand name</label>
                <input
                  type="text"
                  className="pro-input"
                  value={brandKit.name}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Brand"
                />
              </div>

              <div className="field-unit">
                <label>Handle</label>
                <input
                  type="text"
                  className="pro-input"
                  value={brandKit.handle}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, handle: e.target.value }))}
                  placeholder="@yourname"
                />
              </div>

              <div className="field-unit">
                <label>Logo (PNG/JPG)</label>
                <label className="logo-upload-trigger">
                  <Upload size={14} />
                  <span>{brandKit.logoData ? 'Change logo' : 'Upload logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="field-unit">
                <label>Footer</label>
                <select
                  className="pro-select"
                  value={brandKit.showFooter ? '1' : '0'}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, showFooter: e.target.value === '1' }))}
                >
                  <option value="1">Show logo & brand</option>
                  <option value="0">Hide footer</option>
                </select>
              </div>

              <div className="field-unit">
                <label>Background 1</label>
                <input
                  type="color"
                  className="color-input"
                  value={brandKit.c1}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, c1: e.target.value }))}
                />
              </div>

              <div className="field-unit">
                <label>Background 2</label>
                <input
                  type="color"
                  className="color-input"
                  value={brandKit.c2}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, c2: e.target.value }))}
                />
              </div>

              <div className="field-unit">
                <label>Text Color</label>
                <input
                  type="color"
                  className="color-input"
                  value={brandKit.c3}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, c3: e.target.value }))}
                />
              </div>

              <div className="field-unit">
                <label>Accent Color</label>
                <input
                  type="color"
                  className="color-input"
                  value={brandKit.c4}
                  onChange={(e) => setBrandKit((prev) => ({ ...prev, c4: e.target.value }))}
                />
              </div>
            </div>

            <div className="brand-actions-row">
              <button type="button" className="pro-btn-primary" onClick={handleSaveKit}>
                <Save size={14} />
                <span>Save brand kit</span>
              </button>
              <button type="button" className="pro-btn-secondary" onClick={handleResetKit}>
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
              {brandKitMsg && <span className="brand-save-msg">{brandKitMsg}</span>}
            </div>

            <p className="pro-hint">
              👉 Select the last swatch circle marked with <strong>"B" (Brand)</strong> to use your custom colors.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
