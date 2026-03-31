/*
 * ============================================================
 *  CarouselForge v2.0 — Progressive Web App
 *  © 2026 CarouselForge. All rights reserved.
 * 
 *  LICENSE: Personal Use Only — Not for Resale
 *  This software is provided for personal, non-commercial use.
 *  Redistribution, resale, or sublicensing is strictly prohibited.
 * ============================================================
 */

(function () {
    'use strict';

    // ===== CONSTANTS =====
    var MAX_SLIDES = 20;
    var TOAST_DURATION = 3000;

    // ===== SUPABASE CONFIG =====
    var SUPABASE_URL = 'https://eyjybwkoucwoabzpatvm.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5anlid2tvdWN3b2FienBhdHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NDYyODYsImV4cCI6MjA5MDUyMjI4Nn0.byVDA_bMry8xqO9htPIyLLZxZGcorvy5MooFyV5RcIU';

    var supabase = null;
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.warn('Supabase init failed:', e);
    }

    // ===== STATE =====
    var state = {
        slides: [],
        theme: 'midnight',
        handle: '',
        avatarBase64: null,
        size: '1080x1080',
        fontSize: 28
    };

    var toastTimer = null;

    // ===== DOM REFS =====
    var mainTextInput = document.getElementById('mainTextInput');
    var themeGrid = document.getElementById('themeGrid');
    var handleInput = document.getElementById('handleInput');
    var avatarInput = document.getElementById('avatarInput');
    var uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    var avatarPreviewContainer = document.getElementById('avatarPreviewContainer');
    var avatarPreviewImg = document.getElementById('avatarPreviewImg');
    var removeAvatarBtn = document.getElementById('removeAvatarBtn');
    var fontSizeSlider = document.getElementById('fontSizeSlider');
    var fontSizeValue = document.getElementById('fontSizeValue');
    var generateBtn = document.getElementById('generateBtn');
    var slidesContainer = document.getElementById('slidesContainer');
    var previewActions = document.getElementById('previewActions');
    var downloadAllBtn = document.getElementById('downloadAllBtn');
    var renderArea = document.getElementById('renderArea');
    var loadingOverlay = document.getElementById('loadingOverlay');
    var loadingText = document.getElementById('loadingText');
    var loadingSub = document.getElementById('loadingSub');
    var toastEl = document.getElementById('toast');
    var slideCountBadge = document.getElementById('slideCountBadge');

    // =============================================
    // ===== ESCAPE HTML (regex-based) =====
    // =============================================
    var escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function (ch) { return escapeMap[ch]; });
    }

    function escapeHTMLWithBreaks(str) {
        if (!str) return '';
        return escapeHTML(str).replace(/\n/g, '<br>');
    }

    // Replace *word* with accent span (safe to run after escaping HTML)
    function highlightWords(str) {
        if (!str) return '';
        return str.replace(/\*([^*]+)\*/g, '<span class="accent-text">$1</span>');
    }

    // =============================================
    // ===== SMART TEXT PARSER =====
    // =============================================
    function parseTextToSlides(text) {
        var trimmed = text.trim();
        if (!trimmed) return [];

        var slides;

        slides = parseSlideMarkers(trimmed);
        if (slides && slides.length > 1) return wrapResult(slides, trimmed);

        slides = parseMarkdownHeadings(trimmed);
        if (slides && slides.length > 1) return wrapResult(slides, trimmed);

        slides = parseNumberedList(trimmed);
        if (slides && slides.length > 1) return wrapResult(slides, trimmed);

        slides = parseBoldMarkers(trimmed);
        if (slides && slides.length > 1) return wrapResult(slides, trimmed);

        slides = parseParagraphs(trimmed);
        if (slides && slides.length > 1) return wrapResult(slides, trimmed);

        return [{
            numberLabel: '',
            title: trimmed.substring(0, 80),
            body: trimmed.length > 80 ? trimmed.substring(80) : '',
            type: 'content'
        }];
    }

    function wrapResult(slides, rawText) {
        var mainTitle = slides._extractedTitle || '';
        delete slides._extractedTitle;
        return addCoverAndCTA(slides, rawText, mainTitle);
    }

    function parseSlideMarkers(text) {
        var regex = /(?:^|\n)\s*slide\s*(\d+)\s*[:\-\u2013\u2014]\s*/gi;
        var parts = text.split(regex);
        if (parts.length < 3) return null;
        var slides = [];
        for (var i = 1; i < parts.length; i += 2) {
            var num = parts[i];
            var content = (parts[i + 1] || '').trim();
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(parseInt(num)), title: parsed.title, body: parsed.body, type: 'content' });
        }
        return slides.length ? slides : null;
    }

    function parseMarkdownHeadings(text) {
        var lines = text.split('\n');
        var slides = [];
        var currentSlide = null;
        var mainTitle = null;
        for (var idx = 0; idx < lines.length; idx++) {
            var line = lines[idx];
            var h1Match = line.match(/^#\s+(.+)/);
            var h2Match = line.match(/^##\s+(.+)/);
            var h3Match = line.match(/^###\s+(.+)/);
            if (h1Match && !mainTitle) {
                mainTitle = h1Match[1].trim();
            } else if (h2Match || h3Match) {
                if (currentSlide) slides.push(currentSlide);
                var heading = (h2Match ? h2Match[1] : h3Match[1]).trim();
                currentSlide = { numberLabel: padNumber(slides.length + 1), title: heading, body: '', type: 'content' };
            } else if (currentSlide) {
                var trimLine = line.trim();
                if (trimLine) currentSlide.body += (currentSlide.body ? '\n' : '') + trimLine;
            }
        }
        if (currentSlide) slides.push(currentSlide);
        if (mainTitle && slides.length) slides._extractedTitle = mainTitle;
        return slides.length >= 2 ? slides : null;
    }

    function parseNumberedList(text) {
        var regex = /(?:^|\n)\s*(\d+)\s*[.)\-:\u2013\u2014]\s+/g;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) matches.push(m);
        if (matches.length < 2) return null;
        var slides = [];
        var firstMatchStart = matches[0].index;
        var preamble = text.substring(0, firstMatchStart).trim();
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var startIdx = match.index + match[0].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(parseInt(match[1])), title: parsed.title, body: parsed.body, type: 'content' });
        }
        if (preamble && slides.length) slides._extractedTitle = preamble.split('\n')[0].trim();
        return slides.length >= 2 ? slides : null;
    }

    function parseBoldMarkers(text) {
        var regex = /(?:^|\n)\s*\*\*(.+?)\*\*/g;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) matches.push(m);
        if (matches.length < 2) return null;
        var slides = [];
        for (var i = 0; i < matches.length; i++) {
            var title = matches[i][1].trim();
            var startIdx = matches[i].index + matches[i][0].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var body = text.substring(startIdx, endIdx).trim();
            slides.push({ numberLabel: padNumber(i + 1), title: title, body: cleanBody(body), type: 'content' });
        }
        return slides.length >= 2 ? slides : null;
    }

    function parseParagraphs(text) {
        var blocks = text.split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
        if (blocks.length < 2) return null;
        var slides = [];
        for (var i = 0; i < blocks.length; i++) {
            var parsed = splitTitleBody(blocks[i]);
            slides.push({ numberLabel: slides.length > 0 ? padNumber(slides.length) : '', title: parsed.title, body: parsed.body, type: i === 0 ? 'title' : 'content' });
        }
        return slides;
    }

    // ===== PARSER HELPERS =====
    function splitTitleBody(content) {
        if (!content) return { title: '', body: '' };
        content = cleanMarkdown(content);
        var lines = content.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        if (lines.length === 1) {
            if (lines[0].length <= 60) return { title: lines[0], body: '' };
            var sentence = lines[0].match(/^(.{20,60}[.!?])\s+/);
            if (sentence) return { title: sentence[1], body: lines[0].substring(sentence[0].length) };
            return { title: lines[0], body: '' };
        }
        return { title: lines[0], body: lines.slice(1).join('\n') };
    }

    function cleanMarkdown(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/_(.+?)_/g, '$1')
            .replace(/^[-*+]\s+/gm, '\u2022 ')
            .replace(/^>\s*/gm, '')
            .trim();
    }

    function cleanBody(text) {
        return text.replace(/^\s*[-\u2013\u2014]\s*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    }

    function padNumber(n) { return String(n).padStart(2, '0'); }

    function addCoverAndCTA(slides, rawText, mainTitle) {
        var totalContent = slides.length;
        var coverTitle = mainTitle || '';
        if (!coverTitle) {
            var firstLine = rawText.split('\n')[0].trim();
            if (firstLine && !firstLine.match(/^\d+[.):\-]/) && !firstLine.match(/^slide\s+\d+/i) && firstLine.length <= 80) {
                coverTitle = cleanMarkdown(firstLine);
            }
        }
        if (coverTitle) {
            slides.unshift({ numberLabel: '', title: coverTitle, body: totalContent + ' key points inside \u2014 swipe \u2192', type: 'cover' });
        }
        slides.push({ numberLabel: '', title: 'Thanks for reading!', body: state.handle ? 'Follow ' + state.handle + ' for more' : 'Save this post & share with a friend', type: 'cta' });
        return slides;
    }

    // =============================================
    // ===== UI CONTROLS =====
    // =============================================
    function initTheme() {
        themeGrid.querySelectorAll('.theme-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var active = themeGrid.querySelector('.active');
                if (active) active.classList.remove('active');
                btn.classList.add('active');
                state.theme = btn.dataset.theme;
            });
        });
    }

    function initSize() {
        document.querySelectorAll('.size-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.size-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                state.size = btn.dataset.size;
            });
        });
    }

    function initFontSize() {
        fontSizeSlider.addEventListener('input', function () {
            state.fontSize = parseInt(fontSizeSlider.value, 10);
            fontSizeValue.textContent = state.fontSize + 'px';
        });
    }

    function initHandle() {
        handleInput.addEventListener('input', function () {
            state.handle = handleInput.value.trim();
        });
    }

    function initAvatar() {
        if (!avatarInput) return;
        uploadAvatarBtn.addEventListener('click', function () {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', function (e) {
            var file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file.', true);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image too large (max 5MB)', true);
                return;
            }

            var reader = new FileReader();
            reader.onload = function (event) {
                state.avatarBase64 = event.target.result;
                avatarPreviewImg.src = state.avatarBase64;
                avatarPreviewContainer.style.display = 'flex';
                uploadAvatarBtn.style.display = 'none';
                
                // Live preview auto-refresh if there's already slides generated
                if (state.slides.length > 0) generatePreview();
            };
            reader.readAsDataURL(file);
        });

        removeAvatarBtn.addEventListener('click', function () {
            state.avatarBase64 = null;
            avatarInput.value = '';
            avatarPreviewImg.src = '';
            avatarPreviewContainer.style.display = 'none';
            uploadAvatarBtn.style.display = 'flex';
            
            // Live preview auto-refresh
            if (state.slides.length > 0) generatePreview();
        });
    }

    // =============================================
    // ===== GENERATE PREVIEW =====
    // =============================================
    function generatePreview() {
        var rawText = mainTextInput.value.trim();
        if (!rawText) {
            showToast('Please paste some text first!', true);
            mainTextInput.focus();
            return;
        }
        state.handle = handleInput.value.trim();
        state.slides = parseTextToSlides(rawText);
        if (!state.slides.length) {
            showToast('Could not parse any slides from the text', true);
            return;
        }
        if (state.slides.length > MAX_SLIDES) {
            state.slides = state.slides.slice(0, MAX_SLIDES);
            showToast('Limited to ' + MAX_SLIDES + ' slides for performance', true);
        }

        var isPortrait = state.size === '1080x1350';
        slidesContainer.innerHTML = '';
        state.slides.forEach(function (slide, i) {
            var card = document.createElement('div');
            card.className = 'slide-card';
            card.style.animationDelay = (i * 0.08) + 's';
            var slideClass = 'slide-inner theme-' + state.theme;
            if (isPortrait) slideClass += ' portrait';
            if (slide.type === 'cover') slideClass += ' title-slide';
            if (slide.type === 'cta') slideClass += ' cta-slide';
            var titleFontSize = state.fontSize * (slide.type === 'cover' ? 0.058 : 0.048);
            var bodyFontSize = state.fontSize * 0.029;
            card.innerHTML =
                '<button class="download-single" data-index="' + i + '" title="Download this slide" aria-label="Download slide ' + (i + 1) + '">' +
                    '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' +
                '</button>' +
                '<div class="' + slideClass + '">' +
                    '<div class="slide-deco-tl"></div>' +
                    '<div class="slide-deco-br"></div>' +
                    (slide.numberLabel ? '<div class="slide-number-label">' + escapeHTML(slide.numberLabel) + '</div>' : '') +
                    (slide.type !== 'cover' ? '<div class="slide-accent-line"></div>' : '') +
                    (slide.title ? '<div class="slide-title-text" style="font-size:' + titleFontSize + 'rem">' + highlightWords(escapeHTML(slide.title)) + '</div>' : '') +
                    (slide.body ? '<div class="slide-body-text" style="font-size:' + bodyFontSize + 'rem">' + highlightWords(escapeHTMLWithBreaks(slide.body)) + '</div>' : '') +
                    (state.handle || state.avatarBase64 ? 
                        '<div class="slide-author-combo">' + 
                            (state.avatarBase64 ? '<img src="' + state.avatarBase64 + '" class="slide-avatar" alt="Avatar">' : '') +
                            (state.handle ? '<div class="slide-handle">' + escapeHTML(state.handle) + '</div>' : '') +
                        '</div>' 
                    : '') +
                    '<div class="slide-page-indicator">' + (i + 1) + ' / ' + state.slides.length + '</div>' +
                '</div>';
            slidesContainer.appendChild(card);
        });

        slidesContainer.querySelectorAll('.download-single').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                downloadSingle(parseInt(btn.dataset.index, 10));
            });
        });

        previewActions.style.display = 'flex';
        if (slideCountBadge) {
            slideCountBadge.textContent = state.slides.length + ' slides';
            slideCountBadge.style.display = 'inline';
        }
        showToast(state.slides.length + ' slides generated!');
    }

    // =============================================
    // ===== DOWNLOAD =====
    // =============================================
    function downloadSingle(index) {
        var slide = state.slides[index];
        if (!slide) return;
        showLoading('Rendering slide...', 'Slide ' + (index + 1));
        renderSlideToCanvas(slide, index).then(function (canvas) {
            canvas.toBlob(function (blob) {
                saveAs(blob, 'carousel-slide-' + (index + 1) + '.png');
                hideLoading();
                showToast('Slide downloaded!');
            }, 'image/png');
        }).catch(function (err) {
            hideLoading();
            showToast('Failed to download slide', true);
            console.error(err);
        });
    }

    function downloadAll() {
        var slides = state.slides;
        if (!slides.length) return;
        showLoading('Preparing download...', '0 / ' + slides.length + ' slides');
        var zip = new JSZip();
        var i = 0;
        function processNext() {
            if (i >= slides.length) {
                loadingText.textContent = 'Creating ZIP file...';
                loadingSub.textContent = '';
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    saveAs(content, 'carousel-slides.zip');
                    hideLoading();
                    showToast('All slides downloaded!');
                }).catch(function (err) {
                    hideLoading();
                    showToast('Failed to create ZIP', true);
                    console.error(err);
                });
                return;
            }
            loadingSub.textContent = (i + 1) + ' / ' + slides.length + ' slides';
            renderSlideToCanvas(slides[i], i).then(function (canvas) {
                return new Promise(function (res) { canvas.toBlob(res, 'image/png'); });
            }).then(function (blob) {
                var num = String(i + 1);
                while (num.length < 2) num = '0' + num;
                zip.file('slide-' + num + '.png', blob);
                i++;
                processNext();
            }).catch(function (err) {
                hideLoading();
                showToast('Failed to create ZIP', true);
                console.error(err);
            });
        }
        processNext();
    }

    // ===== RENDER SLIDE TO CANVAS =====
    function renderSlideToCanvas(slide, index) {
        return new Promise(function (resolve, reject) {
            var parts = state.size.split('x');
            var w = parseInt(parts[0], 10);
            var h = parseInt(parts[1], 10);
            var scaledFontTitle = state.fontSize * (slide.type === 'cover' ? 1.9 : 1.6);
            var scaledFontBody = state.fontSize * 1.0;
            var slideClass = 'render-slide theme-' + state.theme;
            if (slide.type === 'cover') slideClass += ' title-slide';
            if (slide.type === 'cta') slideClass += ' cta-slide';
            var el = document.createElement('div');
            el.className = slideClass;
            el.style.width = w + 'px';
            el.style.height = h + 'px';
            el.innerHTML =
                '<div class="slide-deco-tl"></div>' +
                '<div class="slide-deco-br"></div>' +
                (slide.numberLabel ? '<div class="slide-number-label">' + escapeHTML(slide.numberLabel) + '</div>' : '') +
                (slide.type !== 'cover' ? '<div class="slide-accent-line"></div>' : '') +
                (slide.title ? '<div class="slide-title-text" style="font-size:' + scaledFontTitle + 'px">' + highlightWords(escapeHTML(slide.title)) + '</div>' : '') +
                (slide.body ? '<div class="slide-body-text" style="font-size:' + scaledFontBody + 'px">' + highlightWords(escapeHTMLWithBreaks(slide.body)) + '</div>' : '') +
                (state.handle || state.avatarBase64 ? 
                    '<div class="slide-author-combo">' + 
                        (state.avatarBase64 ? '<img src="' + state.avatarBase64 + '" class="slide-avatar" alt="Avatar">' : '') +
                        (state.handle ? '<div class="slide-handle">' + escapeHTML(state.handle) + '</div>' : '') +
                    '</div>' 
                : '') +
                '<div class="slide-page-indicator">' + (index + 1) + ' / ' + state.slides.length + '</div>';
            renderArea.appendChild(el);
            requestAnimationFrame(function () {
                html2canvas(el, { width: w, height: h, scale: 2, backgroundColor: null, useCORS: true }).then(function (canvas) {
                    renderArea.removeChild(el);
                    resolve(canvas);
                }).catch(function (err) {
                    renderArea.removeChild(el);
                    reject(err);
                });
            });
        });
    }

    // ===== HELPERS =====
    function showToast(msg, isError) {
        if (toastTimer) clearTimeout(toastTimer);
        toastEl.textContent = msg;
        toastEl.className = 'toast show' + (isError ? ' error' : '');
        toastTimer = setTimeout(function () {
            toastEl.className = 'toast';
            toastTimer = null;
        }, TOAST_DURATION);
    }

    function showLoading(text, sub) {
        loadingText.textContent = text;
        loadingSub.textContent = sub || '';
        loadingOverlay.classList.add('active');
    }

    function hideLoading() {
        loadingOverlay.classList.remove('active');
    }

    // =============================================
    // ===== ACCESS GATE SYSTEM (Supabase) =====
    // =============================================
    var accessGate = document.getElementById('accessGate');
    var tokenView = document.getElementById('tokenView');
    var requestView = document.getElementById('requestView');
    var tokenInput = document.getElementById('tokenInput');
    var tokenError = document.getElementById('tokenError');
    var unlockBtn = document.getElementById('unlockBtn');
    var showRequestBtn = document.getElementById('showRequestBtn');
    var showTokenBtn = document.getElementById('showTokenBtn');
    var requestEmailInput = document.getElementById('requestEmail');
    var sendRequestBtn = document.getElementById('sendRequestBtn');
    var requestSuccess = document.getElementById('requestSuccess');

    // Validate email against Supabase
    function validateEmail(email) {
        if (!supabase || !email) return Promise.resolve(false);
        return supabase
            .from('approved_users')
            .select('id')
            .eq('email', email.trim().toLowerCase())
            .eq('is_active', true)
            .then(function (result) {
                return result.data && result.data.length > 0;
            })
            .catch(function () {
                return false;
            });
    }

    function grantAccess(email) {
        localStorage.setItem('carouselforge_email', email.trim().toLowerCase());
        if (accessGate) accessGate.style.display = 'none';
    }

    function revokeAccess() {
        localStorage.removeItem('carouselforge_email');
    }

    function checkAccess() {
        var savedEmail = localStorage.getItem('carouselforge_email');
        if (savedEmail) {
            validateEmail(savedEmail).then(function (valid) {
                if (valid) {
                    grantAccess(savedEmail);
                } else {
                    revokeAccess();
                    if (accessGate) accessGate.style.display = 'flex';
                }
            });
            return;
        }

        // No saved email — show gate
        if (accessGate) accessGate.style.display = 'flex';
    }

    // Submit access request to Supabase
    function submitAccessRequest(email) {
        if (!supabase) {
            showToast('Unable to connect. Please try again later.', true);
            return Promise.resolve(false);
        }
        return supabase
            .from('approved_users')
            .insert([{ email: email.trim().toLowerCase(), is_active: false }])
            .then(function (result) {
                if (result.error) {
                    console.error('Request error:', result.error);
                    return false;
                }
                return true;
            })
            .catch(function (err) {
                console.error('Request failed:', err);
                return false;
            });
    }

    function initAccessGate() {
        if (!accessGate) return;

        // Toggle views
        if (showRequestBtn) {
            showRequestBtn.addEventListener('click', function () {
                tokenView.style.display = 'none';
                requestView.style.display = 'block';
            });
        }
        if (showTokenBtn) {
            showTokenBtn.addEventListener('click', function () {
                requestView.style.display = 'none';
                tokenView.style.display = 'block';
            });
        }

        // Unlock with email
        if (unlockBtn) {
            unlockBtn.addEventListener('click', function () {
                var email = tokenInput.value.trim().toLowerCase();
                if (!email || email.indexOf('@') === -1) {
                    tokenError.textContent = 'Please enter a valid email';
                    tokenError.style.display = 'block';
                    return;
                }
                unlockBtn.disabled = true;
                unlockBtn.textContent = 'Verifying...';
                validateEmail(email).then(function (valid) {
                    if (valid) {
                        grantAccess(email);
                    } else {
                        tokenError.textContent = 'Email not found or not approved yet';
                        tokenError.style.display = 'block';
                        tokenInput.style.borderColor = '#ef4444';
                        setTimeout(function () { tokenInput.style.borderColor = ''; }, 2000);
                    }
                    unlockBtn.disabled = false;
                    unlockBtn.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> Unlock App';
                });
            });
        }

        // Enter key on email input
        if (tokenInput) {
            tokenInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); unlockBtn.click(); }
            });
            tokenInput.addEventListener('input', function () {
                tokenError.style.display = 'none';
            });
        }

        // Send access request to Supabase
        if (sendRequestBtn) {
            sendRequestBtn.addEventListener('click', function () {
                var email = requestEmailInput.value.trim();
                if (!email || email.indexOf('@') === -1) {
                    requestEmailInput.style.borderColor = '#ef4444';
                    setTimeout(function () { requestEmailInput.style.borderColor = ''; }, 2000);
                    return;
                }
                sendRequestBtn.disabled = true;
                sendRequestBtn.textContent = 'Sending...';
                submitAccessRequest(email).then(function (success) {
                    if (success) {
                        sendRequestBtn.style.display = 'none';
                        requestEmailInput.style.display = 'none';
                        requestSuccess.style.display = 'block';
                        var label = document.querySelector('.gate-label[for="requestEmail"]');
                        if (label) label.style.display = 'none';
                    } else {
                        sendRequestBtn.disabled = false;
                        sendRequestBtn.textContent = 'Send Access Request';
                        showToast('Failed to send request. Try again.', true);
                    }
                });
            });
        }
    }

    // =============================================
    // ===== PWA INSTALL PROMPT =====
    // =============================================
    var deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        var installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.classList.add('visible');
            installBtn.addEventListener('click', function () {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function (result) {
                        if (result.outcome === 'accepted') showToast('App installed successfully!');
                        deferredPrompt = null;
                        installBtn.classList.remove('visible');
                    });
                }
            });
        }
    });
    window.addEventListener('appinstalled', function () {
        showToast('CarouselForge installed!');
        deferredPrompt = null;
        var installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.classList.remove('visible');
    });

    // =============================================
    // ===== SERVICE WORKER =====
    // =============================================
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').then(function (reg) {
                console.log('ServiceWorker registered:', reg.scope);
            }).catch(function (err) {
                console.log('ServiceWorker registration failed:', err);
            });
        }
    }

    // ===== INIT =====
    function init() {
        initAccessGate();
        checkAccess();

        initTheme();
        initSize();
        initFontSize();
        initHandle();
        initAvatar();

        generateBtn.addEventListener('click', generatePreview);
        downloadAllBtn.addEventListener('click', downloadAll);

        mainTextInput.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                generatePreview();
            }
        });

        registerServiceWorker();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
