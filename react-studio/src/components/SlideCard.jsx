import React, { useState } from 'react';
import { 
  Download, 
  Trash2, 
  Copy, 
  GripVertical, 
  Edit3,
  Check,
  ClipboardCopy
} from 'lucide-react';
import { onColorContrast } from '../utils/canvasRenderer';
import { LAYOUT_TYPES } from '../constants/themes';

export default function SlideCard({
  slide,
  index,
  totalSlides,
  settings,
  onUpdateLayout,
  onEdit,
  onDuplicate,
  onDelete,
  onDownloadSingle,
  onCopyClipboard,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isAnimated = true
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (onCopyClipboard) {
      try {
        await onCopyClipboard(slide, index);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
      }
    }
  };
  const { theme, brandKit, ratio } = settings;
  const t = theme === 'brand' ? {
    b1: brandKit.c1,
    b2: brandKit.c2,
    fg: brandKit.c3,
    acc: brandKit.c4
  } : theme;

  const onAcc = onColorContrast(t.acc);
  const lay = slide.layout || 'split';
  const heading = slide.heading || '';
  const bodyLines = Array.isArray(slide.body) ? slide.body : (slide.body ? slide.body.split('\n').filter(Boolean) : []);
  const words = heading.split(/\s+/).filter(Boolean);

  const slideStyle = {
    '--b1': t.b1,
    '--b2': t.b2,
    '--fg': t.fg,
    '--sacc': t.acc,
    '--on': onAcc
  };

  return (
    <div 
      className={`pro-card-wrapper ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      {/* Top Card Controls */}
      <div className="card-top-controls">
        <div className="controls-left">
          <div className="grip-icon" title="Drag to reorder">
            <GripVertical size={14} />
          </div>
          <select 
            className="layout-select-pill"
            value={lay}
            onChange={(e) => onUpdateLayout(slide.id, e.target.value)}
            title="Change this slide layout"
          >
            <option value="cover">Tag: [cover]</option>
            <option value="split">Tag: [split]</option>
            <option value="stat">Tag: [stat]</option>
            <option value="question">Tag: [question]</option>
            <option value="list">Tag: [list]</option>
            <option value="cta">Tag: [cta]</option>
          </select>
        </div>

        <div className="controls-right">
          <button 
            type="button" 
            className="card-action-icon"
            onClick={() => onEdit(slide)}
            title="Edit text"
          >
            <Edit3 size={13} />
          </button>
          <button 
            type="button" 
            className="card-action-icon"
            onClick={() => onDuplicate(slide.id)}
            title="Duplicate"
          >
            <Copy size={13} />
          </button>
          <button 
            type="button" 
            className={`card-action-icon ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title={copied ? 'Copied image to clipboard!' : 'Copy slide PNG to clipboard'}
          >
            {copied ? <Check size={13} style={{ color: '#10b981' }} /> : <ClipboardCopy size={13} />}
          </button>
          <button 
            type="button" 
            className="card-action-icon"
            onClick={() => onDownloadSingle(slide, index)}
            title="Download PNG"
          >
            <Download size={13} />
          </button>
          {totalSlides > 1 && (
            <button 
              type="button" 
              className="card-action-icon danger"
              onClick={() => onDelete(slide.id)}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Slide Visual (Container Query Driven) */}
      <div className="slide-render-frame">
        <div 
          className={`slide ${ratio} ${lay} ${isAnimated ? 'on' : ''} ${settings.texture === 'grain' ? 'has-grain' : ''}`}
          style={slideStyle}
        >
          {/* Seamless Connectors */}
          {settings.seamlessConnectors && totalSlides > 1 && (
            <>
              {index > 0 && <div className="connector-half left" />}
              {index < totalSlides - 1 && <div className="connector-half right" />}
            </>
          )}
          {/* Top Meta */}
          <div className="meta">
            <span>{brandKit.handle}</span>
            <span>{index + 1}/{totalSlides}</span>
          </div>

          {/* Body Variations */}
          {lay === 'cover' && (
            <>
              <div className="bar" />
              <h2 className="h">
                {words.map((w, j) => (
                  <span key={j} style={{ animationDelay: `${0.15 + j * 0.08}s` }}>
                    {w}
                  </span>
                ))}
              </h2>
              {bodyLines.map((x, j) => (
                <p key={j} className="p" style={{ '--i': j }}>{x}</p>
              ))}
            </>
          )}

          {lay === 'question' && (
            <>
              <div className="qm">“</div>
              <h2 className="h">
                {words.map((w, j) => (
                  <span key={j} style={{ animationDelay: `${0.15 + j * 0.08}s` }}>
                    {w}
                  </span>
                ))}
              </h2>
              {bodyLines.map((x, j) => (
                <p key={j} className="p" style={{ '--i': j }}>{x}</p>
              ))}
            </>
          )}

          {lay === 'list' && (
            <>
              <h2 className="h">
                {words.map((w, j) => (
                  <span key={j} style={{ animationDelay: `${0.15 + j * 0.08}s` }}>
                    {w}
                  </span>
                ))}
              </h2>
              <ol className="ls">
                {bodyLines.map((x, j) => (
                  <li key={j} className="p" style={{ '--i': j }}>{x}</li>
                ))}
              </ol>
            </>
          )}

          {lay === 'split' && (
            <>
              <div className="ghost">{String(index + 1).padStart(2, '0')}</div>
              <div className="bar" />
              <h2 className="h">
                {words.map((w, j) => (
                  <span key={j} style={{ animationDelay: `${0.15 + j * 0.08}s` }}>
                    {w}
                  </span>
                ))}
              </h2>
              {bodyLines.map((x, j) => (
                <p key={j} className="p" style={{ '--i': j }}>{x}</p>
              ))}
            </>
          )}

          {lay === 'stat' && (
            <>
              <h2 className="h">
                {words.map((w, j) => (
                  <span key={j} style={{ animationDelay: `${0.15 + j * 0.08}s` }}>
                    {w}
                  </span>
                ))}
              </h2>
              {bodyLines.map((x, j) => (
                <p key={j} className="p" style={{ '--i': j }}>{x}</p>
              ))}
            </>
          )}

          {lay === 'cta' && (
            <>
              <h2 className="h">
                {words.map((w, j) => (
                  <span key={j} style={{ animationDelay: `${0.15 + j * 0.08}s` }}>
                    {w}
                  </span>
                ))}
              </h2>
              {bodyLines.map((x, j) => (
                <p key={j} className="p" style={{ '--i': j }}>{x}</p>
              ))}
              <div className="pill" style={{ '--i': bodyLines.length }}>
                Follow {brandKit.handle}
              </div>
            </>
          )}

          {/* Footer */}
          {brandKit.showFooter && (
            <div className="foot">
              {brandKit.logoData && <img src={brandKit.logoData} alt="Logo" />}
              <span>{brandKit.name}</span>
            </div>
          )}

          {/* Next Arrow Indicator */}
          {index < totalSlides - 1 && (
            <div className="next">→</div>
          )}
        </div>
      </div>
    </div>
  );
}
