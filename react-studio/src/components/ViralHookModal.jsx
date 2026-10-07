import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Copy } from 'lucide-react';
import { VIRAL_HOOK_CATEGORIES } from '../constants/viralHooks';

export default function ViralHookModal({ onApplyHook, onClose }) {
  const [topic, setTopic] = useState('remote work');
  const [copiedId, setCopiedId] = useState(null);

  const fillTemplate = (template) => {
    return template
      .replace(/\[topic\]/gi, topic || 'your topic')
      .replace(/\[audience\]/gi, topic ? `${topic} leaders` : 'creators')
      .replace(/\[goal\]/gi, `scaling ${topic || 'your business'}`)
      .replace(/\[result\]/gi, `consistent growth in ${topic || 'your niche'}`)
      .replace(/\[pain\]/gi, 'working 60 hours a week')
      .replace(/\[metric\]/gi, 'engagement')
      .replace(/\[items\]/gi, 'posts');
  };

  const handleCopy = (hookText, id) => {
    navigator.clipboard.writeText(hookText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Sparkles size={18} className="text-amber" />
            </div>
            <div>
              <h3>Viral Carousel Hooks</h3>
              <p className="modal-subtitle">Proven headline formulas that compel readers to swipe</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="viral-hook-body">
          {/* Custom Topic Input */}
          <div className="hook-topic-bar">
            <label>Customize with your niche / topic:</label>
            <input
              type="text"
              className="pro-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. cold emailing, web design, habit building..."
            />
          </div>

          <div className="hooks-categories-scroll">
            {VIRAL_HOOK_CATEGORIES.map((cat, cIdx) => (
              <div key={cIdx} className="hook-category-block">
                <div className="hook-cat-header">
                  <span>{cat.icon}</span>
                  <h4>{cat.category}</h4>
                </div>

                <div className="hooks-items-list">
                  {cat.hooks.map((h, hIdx) => {
                    const filled = fillTemplate(h.template);
                    const id = `${cIdx}-${hIdx}`;
                    return (
                      <div key={hIdx} className="hook-item-card">
                        <div className="hook-item-text">
                          <p className="hook-filled-headline">{filled}</p>
                          <span className="hook-original-pattern">Formula: {h.template}</span>
                        </div>

                        <div className="hook-item-actions">
                          <button
                            type="button"
                            className="hook-copy-btn"
                            onClick={() => handleCopy(filled, id)}
                            title="Copy to clipboard"
                          >
                            {copiedId === id ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                          </button>
                          <button
                            type="button"
                            className="hook-apply-btn"
                            onClick={() => {
                              onApplyHook(filled);
                              onClose();
                            }}
                            title="Use as Cover Slide Heading"
                          >
                            <span>Use as Hook</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
