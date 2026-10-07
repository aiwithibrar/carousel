import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';

export default function AIPromptModal({ onClose }) {
  const [topic, setTopic] = useState('5 habits of high-performing leaders');
  const [copied, setCopied] = useState(false);

  const promptText = `Write a viral social media carousel about: ${topic || '[YOUR TOPIC]'}

Use EXACTLY this format:

[Write an attention-grabbing title for the carousel]

1. [First point headline]
[2-3 punchy sentences explaining this point. Keep it practical.]

2. [Second point headline]
[2-3 punchy sentences explaining this point. Keep it practical.]

3. [Third point headline]
[2-3 punchy sentences explaining this point. Keep it practical.]

...continue for 5-7 points total.

Rules:
- Start with ONE title line (no numbering on the cover title)
- Each point: number + period + title on one line
- Body text on the next lines (2-3 sentences max)
- Separate each point with a blank line
- No emojis, no markdown tables, no speaker notes
- Keep each point under 40 words so slides remain legible
- End with a final takeaway, no CTA needed`;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Sparkles size={18} className="text-violet" />
            </div>
            <div>
              <h3>AI Prompt Generator</h3>
              <p className="modal-subtitle">Generate carousel-ready prompts for ChatGPT, Gemini, or Claude</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-form">
          <div className="form-field">
            <label className="field-label">What topic do you want to create a carousel on?</label>
            <div className="prompt-input-row">
              <input
                type="text"
                className="studio-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 5 steps to master personal finance"
              />
              <button 
                type="button" 
                className={`btn-primary ${copied ? 'btn-copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied Prompt!' : 'Copy Prompt'}</span>
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Prompt Preview (Ready to paste into ChatGPT/Claude)</label>
            <pre className="prompt-pre-box">{promptText}</pre>
          </div>

          <div className="ai-tips-callout">
            <strong>How to use:</strong>
            <ol>
              <li>Enter your topic and click <strong>Copy Prompt</strong>.</li>
              <li>Paste it into <a href="https://chatgpt.com" target="_blank" rel="noreferrer">ChatGPT</a> or <a href="https://claude.ai" target="_blank" rel="noreferrer">Claude</a>.</li>
              <li>Copy the AI response and paste it directly into CarouselForge Content tab!</li>
            </ol>
          </div>

          <div className="modal-footer-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
