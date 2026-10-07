import React from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ExportProgressModal({ current, total, statusText, isDone, onClose }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card compact" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-content">
          {isDone ? (
            <div className="export-done-animation">
              <CheckCircle2 size={54} className="text-emerald" />
              <h3>Download Complete!</h3>
              <p>Your high-resolution carousel ZIP has been prepared.</p>
              <button type="button" className="btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="export-spinner-wrap">
                <Loader2 size={36} className="spinner-icon text-primary" />
              </div>
              <h3>Generating Slides</h3>
              <p className="status-text">{statusText || `Rendering slide ${current} of ${total}...`}</p>

              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="percent-label">{percent}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
