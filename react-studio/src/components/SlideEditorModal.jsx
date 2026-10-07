import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { LAYOUT_TYPES } from '../constants/themes';

export default function SlideEditorModal({ slide, onSave, onClose }) {
  const [heading, setHeading] = useState(slide?.heading || '');
  const [bodyText, setBodyText] = useState(
    Array.isArray(slide?.body) ? slide.body.join('\n') : (slide?.body || '')
  );
  const [layout, setLayout] = useState(slide?.layout || 'split');

  useEffect(() => {
    if (slide) {
      setHeading(slide.heading || '');
      setBodyText(Array.isArray(slide.body) ? slide.body.join('\n') : (slide.body || ''));
      setLayout(slide.layout || 'split');
    }
  }, [slide]);

  if (!slide) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(slide.id, {
      heading: heading.trim(),
      body: bodyText.split('\n').map((l) => l.trim()).filter(Boolean),
      layout
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>Edit Slide Content</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-form">
          <div className="form-field">
            <label className="field-label">Slide Layout</label>
            <select
              className="pro-select"
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
            >
              {LAYOUT_TYPES.filter((lt) => lt.id !== 'auto').map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} — {lt.desc}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="field-label">Headline / Number</label>
            <input
              type="text"
              className="pro-input"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Enter slide headline or big number..."
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="field-label">Body Text (One line per bullet / paragraph)</label>
            <textarea
              className="pro-textarea"
              rows={5}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter body text..."
            />
          </div>

          <div className="modal-footer-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pro-btn-primary">
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
