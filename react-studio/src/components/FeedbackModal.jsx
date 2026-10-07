import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eyjybwkoucwoabzpatvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5anlid2tvdWN3b2FienBhdHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDYyODYsImV4cCI6MjA5MDUyMjI4Nn0.byVDA_bMry8xqO9htPIyLLZxZGcorvy5MooFyV5RcIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function FeedbackModal({ onClose }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{ message: message.trim() }]);

      if (error) throw error;
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Feedback error:', err);
      setErrorMsg('Failed to send feedback. Please check your connection.');
      setStatus('error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <MessageSquare size={18} className="text-primary" />
            </div>
            <div>
              <h3>Send Feedback</h3>
              <p className="modal-subtitle">Feature requests, suggestions, or bug reports</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="feedback-success-state">
            <CheckCircle2 size={48} className="text-emerald" />
            <h4>Thank you for your feedback!</h4>
            <p>Your thoughts help us improve CarouselForge every day.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body-form">
            <div className="form-field">
              <label className="field-label">What's on your mind?</label>
              <textarea
                className="studio-textarea"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you'd love to see, what worked well, or any issues you encountered..."
                required
                autoFocus
              />
            </div>

            {status === 'error' && (
              <div className="error-alert">
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="modal-footer-row">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={status === 'sending'}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={status === 'sending' || !message.trim()}>
                <Send size={15} />
                <span>{status === 'sending' ? 'Sending...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
