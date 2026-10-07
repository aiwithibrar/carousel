import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  Heart, 
  Bookmark, 
  Share2, 
  MoreHorizontal, 
  Maximize2 
} from 'lucide-react';
import SlideCard from './SlideCard';

export default function FeedSimulatorModal({ slides, settings, onClose }) {
  const [platform, setPlatform] = useState('linkedin'); // 'linkedin' | 'instagram'
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [postText, setPostText] = useState(
    "Here is the breakdown most people don't talk about 👇\n\nSwipe through the carousel to see the full framework."
  );

  const total = slides.length;
  const currentSlide = slides[currentSlideIndex];
  const { brandKit } = settings;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="feed-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="feed-modal-header">
          <div className="feed-platform-tabs">
            <button
              type="button"
              className={`platform-tab-btn ${platform === 'linkedin' ? 'active' : ''}`}
              onClick={() => setPlatform('linkedin')}
            >
              💼 LinkedIn Feed Simulator
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${platform === 'instagram' ? 'active' : ''}`}
              onClick={() => setPlatform('instagram')}
            >
              📸 Instagram Feed Simulator
            </button>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="feed-modal-body">
          {/* LINKEDIN SIMULATOR */}
          {platform === 'linkedin' ? (
            <div className="linkedin-post-mockup">
              {/* Post Author Bar */}
              <div className="li-author-row">
                <div className="li-avatar">
                  {brandKit.logoData ? (
                    <img src={brandKit.logoData} alt="Author" />
                  ) : (
                    <span className="li-avatar-letter">{(brandKit.name || 'C')[0]}</span>
                  )}
                </div>
                <div className="li-author-info">
                  <div className="li-name-row">
                    <span className="li-author-name">{brandKit.name || 'Your Brand'}</span>
                    <span className="li-conn-degree">• 1st</span>
                  </div>
                  <span className="li-headline">Creator & Founder • Helping you grow with high-converting carousels</span>
                  <span className="li-post-time">2h • Edited • 🌐</span>
                </div>
                <button type="button" className="li-more-btn">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Post Caption */}
              <div className="li-post-caption">
                <textarea
                  className="li-caption-textarea"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={2}
                  placeholder="Add your post caption..."
                />
              </div>

              {/* LinkedIn Document Viewer Frame */}
              <div className="li-document-viewer">
                <div className="li-doc-top-bar">
                  <span className="li-doc-filename">
                    {(slides[0]?.heading || 'carousel-guide').slice(0, 32)}.pdf
                  </span>
                  <div className="li-doc-actions">
                    <span className="li-doc-page-counter">
                      {currentSlideIndex + 1} of {total}
                    </span>
                    <Maximize2 size={13} className="li-fullscreen-icon" />
                  </div>
                </div>

                <div className="li-slide-canvas-viewport">
                  {currentSlide && (
                    <SlideCard
                      slide={currentSlide}
                      index={currentSlideIndex}
                      totalSlides={total}
                      settings={settings}
                      onUpdateLayout={() => {}}
                      onEdit={() => {}}
                      onDuplicate={() => {}}
                      onDelete={() => {}}
                      onDownloadSingle={() => {}}
                      onDragStart={() => {}}
                      onDragOver={() => {}}
                      onDrop={() => {}}
                      isDragging={false}
                      isAnimated={false}
                    />
                  )}

                  {/* Left & Right Chevrons */}
                  {currentSlideIndex > 0 && (
                    <button
                      type="button"
                      className="li-nav-arrow left"
                      onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                    >
                      <ChevronLeft size={22} />
                    </button>
                  )}
                  {currentSlideIndex < total - 1 && (
                    <button
                      type="button"
                      className="li-nav-arrow right"
                      onClick={() => setCurrentSlideIndex((prev) => Math.min(total - 1, prev + 1))}
                    >
                      <ChevronRight size={22} />
                    </button>
                  )}
                </div>
              </div>

              {/* LinkedIn Reaction Stats */}
              <div className="li-stats-row">
                <div className="li-reaction-icons">
                  <span className="reaction-bubble blue">👍</span>
                  <span className="reaction-bubble red">❤️</span>
                  <span className="reaction-bubble green">💡</span>
                  <span className="li-likes-count">1,842</span>
                </div>
                <span className="li-comments-count">148 comments • 42 reposts</span>
              </div>

              {/* LinkedIn Action Buttons */}
              <div className="li-action-bar">
                <button type="button" className="li-action-btn">
                  <ThumbsUp size={16} />
                  <span>Like</span>
                </button>
                <button type="button" className="li-action-btn">
                  <MessageSquare size={16} />
                  <span>Comment</span>
                </button>
                <button type="button" className="li-action-btn">
                  <Repeat2 size={16} />
                  <span>Repost</span>
                </button>
                <button type="button" className="li-action-btn">
                  <Send size={16} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            /* INSTAGRAM SIMULATOR */
            <div className="instagram-post-mockup">
              {/* Instagram Top Bar */}
              <div className="ig-header-row">
                <div className="ig-avatar-ring">
                  <div className="ig-avatar-inner">
                    {brandKit.logoData ? (
                      <img src={brandKit.logoData} alt="Author" />
                    ) : (
                      <span>{(brandKit.handle || '@user').replace('@', '')[0]}</span>
                    )}
                  </div>
                </div>
                <div className="ig-author-meta">
                  <span className="ig-handle">{brandKit.handle || '@yourname'}</span>
                  <span className="ig-location">Original Audio</span>
                </div>
                <MoreHorizontal size={18} className="ig-menu-icon" />
              </div>

              {/* Instagram Carousel Viewer */}
              <div className="ig-slide-viewport">
                {currentSlide && (
                  <SlideCard
                    slide={currentSlide}
                    index={currentSlideIndex}
                    totalSlides={total}
                    settings={settings}
                    onUpdateLayout={() => {}}
                    onEdit={() => {}}
                    onDuplicate={() => {}}
                    onDelete={() => {}}
                    onDownloadSingle={() => {}}
                    onDragStart={() => {}}
                    onDragOver={() => {}}
                    onDrop={() => {}}
                    isDragging={false}
                    isAnimated={false}
                  />
                )}

                {currentSlideIndex > 0 && (
                  <button
                    type="button"
                    className="ig-arrow-btn left"
                    onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                {currentSlideIndex < total - 1 && (
                  <button
                    type="button"
                    className="ig-arrow-btn right"
                    onClick={() => setCurrentSlideIndex((prev) => Math.min(total - 1, prev + 1))}
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* Instagram Action Icons */}
              <div className="ig-actions-row">
                <div className="ig-actions-left">
                  <Heart size={22} className="ig-action-icon active-like" />
                  <MessageSquare size={22} className="ig-action-icon" />
                  <Share2 size={22} className="ig-action-icon" />
                </div>
                <div className="ig-pagination-dots">
                  {slides.map((_, i) => (
                    <span key={i} className={`ig-dot ${currentSlideIndex === i ? 'active' : ''}`} />
                  ))}
                </div>
                <Bookmark size={22} className="ig-action-icon" />
              </div>

              {/* Instagram Likes & Caption */}
              <div className="ig-caption-block">
                <div className="ig-likes-text">3,892 likes</div>
                <div className="ig-caption-line">
                  <strong>{brandKit.handle || '@yourname'}</strong>{' '}
                  {postText.replace('\n', ' ')}
                </div>
                <div className="ig-time-ago">3 HOURS AGO</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
