import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SlideCard from './components/SlideCard';
import SlideEditorModal from './components/SlideEditorModal';
import AIPromptModal from './components/AIPromptModal';
import FeedbackModal from './components/FeedbackModal';
import ExportProgressModal from './components/ExportProgressModal';
import ViralHookModal from './components/ViralHookModal';
import FeedSimulatorModal from './components/FeedSimulatorModal';
import SliderMenu from './components/SliderMenu';

import { 
  CMP_THEMES, 
  DEFAULT_BRAND_KIT, 
  PRO_SAMPLE_TEXT,
  ASPECT_RATIOS 
} from './constants/themes';
import { parseCarouselProText } from './utils/parser';
import { 
  downloadSlidePNG, 
  downloadAllSlidesZIP,
  downloadLinkedInPDF,
  copySlideToClipboard 
} from './utils/canvasRenderer';

import { Plus, Wand2, Download, FileText, Sliders, Layers, Eye, Edit3 } from 'lucide-react';
import './App.css';

const TEXT_STORAGE_KEY = 'cmpText';
const BRAND_STORAGE_KEY = 'cmpBrand';
const PREFS_STORAGE_KEY = 'cmpPrefs';

export default function App() {
  const [rawText, setRawText] = useState(PRO_SAMPLE_TEXT);
  const [themeKey, setThemeKey] = useState('ink');
  const [globalLayout, setGlobalLayout] = useState('auto');
  const [ratio, setRatio] = useState('r45');
  const [brandKit, setBrandKit] = useState(DEFAULT_BRAND_KIT);

  const [slides, setSlides] = useState([]);
  const [viewMode, setViewMode] = useState('strip'); // 'strip' | 'grid'
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [texture, setTexture] = useState('grain'); // 'grain' | 'none'
  const [seamlessConnectors, setSeamlessConnectors] = useState(true);

  // Modals & Drawers
  const [isSliderMenuOpen, setIsSliderMenuOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isViralHookOpen, setIsViralHookOpen] = useState(false);
  const [isFeedSimulatorOpen, setIsFeedSimulatorOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    current: 0,
    total: 0,
    statusText: '',
    isDone: false
  });

  const [draggedIndex, setDraggedIndex] = useState(null);
  const stripRef = useRef(null);

  // Load saved preferences and brand kit on startup
  useEffect(() => {
    try {
      const savedText = localStorage.getItem(TEXT_STORAGE_KEY);
      if (savedText) setRawText(savedText);

      const savedBrand = localStorage.getItem(BRAND_STORAGE_KEY);
      if (savedBrand) {
        const parsed = JSON.parse(savedBrand);
        if (parsed.v) {
          setBrandKit({
            name: parsed.v[0] || DEFAULT_BRAND_KIT.name,
            handle: parsed.v[1] || DEFAULT_BRAND_KIT.handle,
            showFooter: parsed.v[2] === '1',
            c1: parsed.v[3] || DEFAULT_BRAND_KIT.c1,
            c2: parsed.v[4] || DEFAULT_BRAND_KIT.c2,
            c3: parsed.v[5] || DEFAULT_BRAND_KIT.c3,
            c4: parsed.v[6] || DEFAULT_BRAND_KIT.c4,
            logoData: parsed.logo || ''
          });
        }
      }

      const savedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.themeKey) setThemeKey(prefs.themeKey);
        if (prefs.ratio) setRatio(prefs.ratio);
        if (prefs.globalLayout) setGlobalLayout(prefs.globalLayout);
        if (prefs.texture) setTexture(prefs.texture);
        if (prefs.seamlessConnectors !== undefined) setSeamlessConnectors(prefs.seamlessConnectors);
      }
    } catch (e) {
      console.warn('Could not load preferences:', e);
    }
  }, []);

  // Parse text into slides whenever text or global layout changes
  useEffect(() => {
    const parsed = parseCarouselProText(rawText, globalLayout);
    setSlides(parsed);
    try {
      localStorage.setItem(TEXT_STORAGE_KEY, rawText);
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({ themeKey, ratio, globalLayout, texture, seamlessConnectors })
      );
    } catch (e) {}
  }, [rawText, globalLayout, themeKey, ratio, texture, seamlessConnectors]);

  // Strip observer for active dot update
  useEffect(() => {
    if (viewMode !== 'strip' || !stripRef.current) return;
    const strip = stripRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0.6) {
            const children = Array.from(strip.children);
            const idx = children.indexOf(entry.target);
            if (idx !== -1) setActiveSlideIndex(idx);
          }
        });
      },
      { root: strip, threshold: [0, 0.6, 1] }
    );

    Array.from(strip.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [slides, viewMode]);

  // Replay animation
  const handleReplay = useCallback(() => {
    setIsAnimationActive(false);
    if (stripRef.current) {
      stripRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      setIsAnimationActive(true);
    }, 150);
  }, []);

  // Save Brand Kit
  const handleSaveBrandKit = () => {
    try {
      const v = [
        brandKit.name,
        brandKit.handle,
        brandKit.showFooter ? '1' : '0',
        brandKit.c1,
        brandKit.c2,
        brandKit.c3,
        brandKit.c4
      ];
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify({ v, logo: brandKit.logoData }));
    } catch (e) {
      console.warn('Could not save brand kit:', e);
    }
  };

  // Reset Brand Kit
  const handleResetBrandKit = () => {
    setBrandKit(DEFAULT_BRAND_KIT);
    try {
      localStorage.removeItem(BRAND_STORAGE_KEY);
    } catch (e) {}
  };

  // Settings object for canvas & card rendering
  const currentTheme = themeKey === 'brand' ? 'brand' : (CMP_THEMES[themeKey] || CMP_THEMES.ink);
  const settings = {
    theme: currentTheme,
    brandKit,
    ratio,
    texture,
    seamlessConnectors
  };

  // Slide CRUD Actions
  const handleUpdateLayout = (id, newLayout) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, layout: newLayout } : s))
    );
  };

  const handleSaveSlide = (id, updatedData) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    setEditingSlide(null);
  };

  const handleDeleteSlide = (id) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicateSlide = (id) => {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const target = slides[idx];
    const copy = {
      ...target,
      id: `slide-copy-${Date.now()}`,
      heading: `${target.heading} (Copy)`
    };
    const nextList = [...slides];
    nextList.splice(idx + 1, 0, copy);
    setSlides(nextList);
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-new-${Date.now()}`,
      heading: 'New Key Point',
      body: ['Write your detailed tip or explanation here.'],
      layout: 'split'
    };
    setSlides((prev) => [...prev, newSlide]);
  };

  // Download Single PNG
  const handleDownloadSingle = async (slide, index) => {
    await downloadSlidePNG(slide, index, slides.length, settings);
  };

  // 1-Click Copy Slide PNG to Clipboard
  const handleCopyClipboard = async (slide, index) => {
    await copySlideToClipboard(slide, index, slides.length, settings);
  };

  // Export all PNGs in a ZIP
  const handleExportZIP = async () => {
    if (slides.length === 0) return;
    setExportProgress({
      isOpen: true,
      current: 1,
      total: slides.length,
      statusText: `Rendering slide 1 of ${slides.length}...`,
      isDone: false
    });

    try {
      await downloadAllSlidesZIP(slides, settings, (cur, total, text) => {
        setExportProgress((prev) => ({
          ...prev,
          current: cur,
          total: total,
          statusText: text
        }));
      });

      setExportProgress((prev) => ({
        ...prev,
        isDone: true,
        statusText: 'All slides exported to ZIP!'
      }));
    } catch (err) {
      console.error(err);
      setExportProgress((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Export all slides as native LinkedIn Multi-Page PDF
  const handleExportPDF = async () => {
    if (slides.length === 0) return;
    setExportProgress({
      isOpen: true,
      current: 1,
      total: slides.length,
      statusText: `Generating LinkedIn PDF page 1 of ${slides.length}...`,
      isDone: false
    });

    try {
      await downloadLinkedInPDF(slides, settings, (cur, total, text) => {
        setExportProgress((prev) => ({
          ...prev,
          current: cur,
          total: total,
          statusText: text
        }));
      });

      setExportProgress((prev) => ({
        ...prev,
        isDone: true,
        statusText: 'LinkedIn PDF Ready & Downloaded!'
      }));
    } catch (err) {
      console.error(err);
      setExportProgress((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Apply viral hook to slide 1
  const handleApplyHook = (hookText) => {
    const blocks = rawText.split(/\n\s*\n/);
    if (blocks.length > 0) {
      const firstLines = blocks[0].split('\n');
      firstLines[0] = hookText;
      blocks[0] = firstLines.join('\n');
      setRawText(blocks.join('\n\n'));
    } else {
      setRawText(hookText);
    }
    handleReplay();
  };

  // Drag and drop reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...slides];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setSlides(updated);
    setDraggedIndex(null);
  };

  // Reset to default sample
  const handleResetDraft = () => {
    if (window.confirm('Reset all slides and restore original template text?')) {
      setRawText(PRO_SAMPLE_TEXT);
      setGlobalLayout('auto');
      setThemeKey('ink');
      setRatio('r45');
      handleReplay();
    }
  };

  return (
    <div className="pro-app-root">
      {/* Top Header */}
      <Header
        slideCount={slides.length}
        onOpenSliderMenu={() => setIsSliderMenuOpen(true)}
        onExportZIP={handleExportZIP}
        onExportPDF={handleExportPDF}
        isExporting={exportProgress.isOpen && !exportProgress.isDone}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenViralHooks={() => setIsViralHookOpen(true)}
        onOpenFeedSimulator={() => setIsFeedSimulatorOpen(true)}
      />

      <main className="pro-main-container">
        {/* Left Control Sidebar */}
        <Sidebar
          rawText={rawText}
          setRawText={setRawText}
          themeKey={themeKey}
          setThemeKey={setThemeKey}
          globalLayout={globalLayout}
          setGlobalLayout={setGlobalLayout}
          ratio={ratio}
          setRatio={setRatio}
          brandKit={brandKit}
          setBrandKit={setBrandKit}
          texture={texture}
          setTexture={setTexture}
          seamlessConnectors={seamlessConnectors}
          setSeamlessConnectors={setSeamlessConnectors}
          onReplay={handleReplay}
          onOpenAIPrompt={() => setIsAIPromptOpen(true)}
          onOpenViralHooks={() => setIsViralHookOpen(true)}
          onSaveBrandKit={handleSaveBrandKit}
          onResetBrandKit={handleResetBrandKit}
          slidesCount={slides.length}
        />

        {/* Right Stage Display */}
        <section className="pro-stage-section">
          {slides.length === 0 ? (
            <div className="empty-pro-state">
              <Wand2 size={40} className="empty-icon" />
              <h3>No slides yet</h3>
              <p>Type your content on the left or click below to restore the template.</p>
              <button 
                type="button" 
                className="pro-btn-primary" 
                onClick={() => setRawText(PRO_SAMPLE_TEXT)}
              >
                Load Sample Carousel
              </button>
            </div>
          ) : viewMode === 'strip' ? (
            /* 1. HORIZONTAL CAROUSEL STRIP (Exact scroll-snap flow from Carousel Maker Pro) */
            <div className="strip-view-wrapper">
              <div 
                className="pro-carousel-strip" 
                id="strip" 
                ref={stripRef}
              >
                {slides.map((slide, index) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    index={index}
                    totalSlides={slides.length}
                    settings={settings}
                    onUpdateLayout={handleUpdateLayout}
                    onEdit={setEditingSlide}
                    onDuplicate={handleDuplicateSlide}
                    onDelete={handleDeleteSlide}
                    onDownloadSingle={handleDownloadSingle}
                    onCopyClipboard={handleCopyClipboard}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragging={draggedIndex === index}
                    isAnimated={isAnimationActive}
                  />
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="pro-strip-dots">
                {slides.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`dot ${activeSlideIndex === dotIdx ? 'active' : ''}`}
                    onClick={() => {
                      if (stripRef.current && stripRef.current.children[dotIdx]) {
                        stripRef.current.children[dotIdx].scrollIntoView({
                          behavior: 'smooth',
                          inline: 'center',
                          block: 'nearest'
                        });
                      }
                    }}
                  />
                ))}
              </div>

              {/* Strip Quick Actions */}
              <div className="strip-bottom-bar">
                <button 
                  type="button" 
                  className="pro-btn-secondary" 
                  onClick={handleAddSlide}
                >
                  <Plus size={15} />
                  <span>Add Slide</span>
                </button>

                <button 
                  type="button" 
                  className="pro-btn-secondary" 
                  onClick={handleExportPDF}
                  title="Export native LinkedIn multi-page PDF document"
                >
                  <FileText size={15} />
                  <span>Download LinkedIn PDF</span>
                </button>

                <button 
                  type="button" 
                  className="pro-btn-primary" 
                  onClick={handleExportZIP}
                >
                  <Download size={15} />
                  <span>Download All Slides (ZIP)</span>
                </button>
              </div>
            </div>
          ) : (
            /* 2. GRID OVERVIEW */
            <div className="pro-grid-wrapper">
              <div className="pro-grid-layout">
                {slides.map((slide, index) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    index={index}
                    totalSlides={slides.length}
                    settings={settings}
                    onUpdateLayout={handleUpdateLayout}
                    onEdit={setEditingSlide}
                    onDuplicate={handleDuplicateSlide}
                    onDelete={handleDeleteSlide}
                    onDownloadSingle={handleDownloadSingle}
                    onCopyClipboard={handleCopyClipboard}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragging={draggedIndex === index}
                    isAnimated={false}
                  />
                ))}

                <button 
                  type="button" 
                  className="pro-add-card-placeholder"
                  onClick={handleAddSlide}
                >
                  <Plus size={24} />
                  <span>Add New Slide</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Slider Menu Offcanvas Drawer */}
      <SliderMenu
        isOpen={isSliderMenuOpen}
        onClose={() => setIsSliderMenuOpen(false)}
        slideCount={slides.length}
        themeKey={themeKey}
        setThemeKey={setThemeKey}
        ratio={ratio}
        setRatio={setRatio}
        globalLayout={globalLayout}
        setGlobalLayout={setGlobalLayout}
        texture={texture}
        setTexture={setTexture}
        seamlessConnectors={seamlessConnectors}
        setSeamlessConnectors={setSeamlessConnectors}
        brandKit={brandKit}
        setBrandKit={setBrandKit}
        onSaveBrandKit={handleSaveBrandKit}
        onResetBrandKit={handleResetBrandKit}
        onOpenViralHooks={() => setIsViralHookOpen(true)}
        onOpenFeedSimulator={() => setIsFeedSimulatorOpen(true)}
        onOpenAIPrompt={() => setIsAIPromptOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onReplay={handleReplay}
        onExportPDF={handleExportPDF}
        onExportZIP={handleExportZIP}
        onResetDraft={handleResetDraft}
      />

      {/* Slide Edit Modal */}
      {editingSlide && (
        <SlideEditorModal
          slide={editingSlide}
          onSave={handleSaveSlide}
          onClose={() => setEditingSlide(null)}
        />
      )}

      {/* AI Prompt Modal */}
      {isAIPromptOpen && (
        <AIPromptModal
          onClose={() => setIsAIPromptOpen(false)}
        />
      )}

      {/* Viral Hooks Formula Modal */}
      {isViralHookOpen && (
        <ViralHookModal
          onApplyHook={handleApplyHook}
          onClose={() => setIsViralHookOpen(false)}
        />
      )}

      {/* Social Feed Simulator Modal */}
      {isFeedSimulatorOpen && (
        <FeedSimulatorModal
          slides={slides}
          settings={settings}
          onClose={() => setIsFeedSimulatorOpen(false)}
        />
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <FeedbackModal
          onClose={() => setIsFeedbackOpen(false)}
        />
      )}

      {/* Export Progress Modal */}
      {exportProgress.isOpen && (
        <ExportProgressModal
          current={exportProgress.current}
          total={exportProgress.total}
          statusText={exportProgress.statusText}
          isDone={exportProgress.isDone}
          onClose={() => setExportProgress((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
