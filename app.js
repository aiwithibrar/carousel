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
        fontSize: 28,
        fontFamily: 'playfair',
        rawText: ''
    };

    var toastTimer = null;
    var dragSrcIndex = null;

    // ===== DOM REFS =====
    var mainTextInput = document.getElementById('mainTextInput');
    var themeGrid = document.getElementById('themeGrid');
    var handleInput = document.getElementById('handleInput');
    var avatarInput = document.getElementById('avatarInput');
    var uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    var avatarPreviewContainer = document.getElementById('avatarPreviewContainer');
    var avatarPreviewImg = document.getElementById('avatarPreviewImg');
    var removeAvatarBtn = document.getElementById('removeAvatarBtn');
    var fontSelect = document.getElementById('fontSelect');
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
    var promptHelperBtn = document.getElementById('promptHelperBtn');

    // =============================================
    // ===== PROMPT HELPER =====
    // =============================================
    var PROMPT_TEMPLATE = 'Write a [NUMBER]-slide Instagram carousel about [TOPIC].\n\nFormat EXACTLY like this (I will paste directly into my tool):\n\nTitle: [Catchy main headline]\n\n1. [First point title]\n[1-2 sentence explanation]\n\n2. [Second point title]\n[1-2 sentence explanation]\n\n3. [Third point title]\n[1-2 sentence explanation]\n\n... continue for all slides ...\n\nCTA: [Call to action - e.g., "Follow for more tips!"]\n\nRULES:\n- No image suggestions or [brackets]\n- No "Here\'s your carousel" intro\n- No notes or instructions\n- Keep each point under 40 words\n- Make titles punchy and scannable';

    function showPromptHelper() {
        var modal = document.createElement('div');
        modal.className = 'prompt-modal-overlay';
        modal.innerHTML = 
            '<div class="prompt-modal">' +
                '<h3>' +
                    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
                    'AI Prompt Template' +
                '</h3>' +
                '<p class="modal-subtitle">Copy this prompt and paste it into ChatGPT, Claude, or any AI</p>' +
                '<div class="prompt-template" id="promptText">' + escapeHTML(PROMPT_TEMPLATE) + '</div>' +
                '<div class="prompt-actions">' +
                    '<button class="prompt-btn close-btn" id="closePrompt">Close</button>' +
                    '<button class="prompt-btn copy-btn" id="copyPrompt">' +
                        '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
                        'Copy Prompt' +
                    '</button>' +
                '</div>' +
                '<div class="prompt-tips">' +
                    '<h4>Tips for best results</h4>' +
                    '<ul>' +
                        '<li>Replace [NUMBER] with how many slides you want (5-10 works best)</li>' +
                        '<li>Replace [TOPIC] with your specific subject</li>' +
                        '<li>The AI output will paste directly into CarouselForge</li>' +
                        '<li>Works with ChatGPT, Claude, Gemini, and others</li>' +
                    '</ul>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        document.getElementById('copyPrompt').addEventListener('click', function () {
            navigator.clipboard.writeText(PROMPT_TEMPLATE).then(function () {
                showToast('Prompt copied! Paste into ChatGPT');
                document.body.removeChild(modal);
            }).catch(function () {
                // Fallback
                var textArea = document.createElement('textarea');
                textArea.value = PROMPT_TEMPLATE;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('Prompt copied!');
                document.body.removeChild(modal);
            });
        });

        document.getElementById('closePrompt').addEventListener('click', function () {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    if (promptHelperBtn) {
        promptHelperBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showPromptHelper();
        });
    }

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
    // ===== AI TEXT CLEANUP =====
    // =============================================
    function cleanAIOutput(text) {
        var cleaned = text;
        
        // Remove common AI intro phrases (more aggressive matching)
        // Pattern: "Here's your/the/a [anything] carousel/content [anything]:" at start
        cleaned = cleaned.replace(/^[\s\S]*?here'?s?\s+(your|the|a|my)?\s*[\w\s\-]*?(carousel|content|text|copy|slides?)[\w\s\-]*?(on|for|about)?[^\n]*\n*/i, '');
        
        // More intro patterns
        var introPatterns = [
            /^(sure|absolutely|of course|certainly|great|perfect|okay|ok)[\s!,]*\n*/i,
            /^(i'?ve|i have|i've|here is|here are)[^\n]*(created|written|prepared|made|generated)[^\n]*\n*/i,
            /^(below|following|here)[^\n]*(is|are)[^\n]*(carousel|content|slides?)[^\n]*:?\s*\n*/i,
            /^let me[^\n]*\n*/i,
            /^(this is|these are)[^\n]*(carousel|slides?|content)[^\n]*\n*/i,
        ];
        introPatterns.forEach(function(pattern) {
            cleaned = cleaned.replace(pattern, '');
        });
        
        // Remove lines that are just emojis with arrows pointing to titles
        cleaned = cleaned.replace(/^[\s]*[👉🔥💡✨🚀💰💳⚡🎯📌]+\s*[""]?[^""\n]*[""]?\s*[💻💰🔥💡✨🚀📌🎯]*\s*\n/gm, '');
        
        // Remove image/visual suggestions
        cleaned = cleaned.replace(/\[image[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[visual[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[photo[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[graphic[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[icon[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\(image[^)]*\)/gi, '');
        cleaned = cleaned.replace(/\(visual[^)]*\)/gi, '');
        cleaned = cleaned.replace(/\(suggest[^)]*\)/gi, '');
        
        // Remove speaker notes and instructions
        cleaned = cleaned.replace(/\[note[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\(note[^)]*\)/gi, '');
        cleaned = cleaned.replace(/^note:.*$/gim, '');
        cleaned = cleaned.replace(/^caption:.*$/gim, '');
        cleaned = cleaned.replace(/^description:.*$/gim, '');
        cleaned = cleaned.replace(/^alt text:.*$/gim, '');
        
        // Remove design instructions
        cleaned = cleaned.replace(/\[design[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[color[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[font[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[background[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\[layout[^\]]*\]/gi, '');
        
        // Remove slide labels like "Slide 1:" or "Slide 1 -" but keep content
        // This helps normalize the format
        cleaned = cleaned.replace(/^slide\s*\d+\s*[:\-–—]\s*/gim, '');
        
        // Remove character/word counts
        cleaned = cleaned.replace(/\(\d+\s*(characters?|chars?|words?)\)/gi, '');
        cleaned = cleaned.replace(/\[\d+\s*(characters?|chars?|words?)\]/gi, '');
        
        // Remove trailing AI outros
        cleaned = cleaned.replace(/\n+(let me know|hope this helps|feel free|if you need|want me to|shall i|i can also)[^\n]*$/gi, '');
        cleaned = cleaned.replace(/\n+---+\s*\n+(note|tip|remember)[^\n]*$/gi, '');
        
        // Clean up excessive whitespace
        cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
        cleaned = cleaned.replace(/^\n+/, ''); // Remove leading newlines
        
        return cleaned.trim();
    }

    // =============================================
    // ===== SMART TEXT PARSER =====
    // =============================================
    function parseTextToSlides(text) {
        var trimmed = text.trim();
        if (!trimmed) return [];
        
        // Clean AI artifacts first
        var cleaned = cleanAIOutput(trimmed);

        var slides;
        
        // Try Hook/CTA format first (common AI output)
        slides = parseHookFormat(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);

        slides = parseSlideMarkers(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);
        
        // Try bracket markers [1] or [Slide 1]
        slides = parseBracketMarkers(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);

        slides = parseMarkdownHeadings(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);

        slides = parseNumberedList(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);
        
        // Try Twitter thread format 1/ 2/ 3/
        slides = parseTwitterThread(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);
        
        // Try emoji headers
        slides = parseEmojiHeaders(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);
        
        // Try labeled sections (Point 1:, Tip 1:, etc.)
        slides = parseLabeledSections(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);
        
        // Try dash separators ---
        slides = parseDashSeparators(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);

        slides = parseBoldMarkers(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);

        slides = parseParagraphs(cleaned);
        if (slides && slides.length > 1) return wrapResult(slides, cleaned);

        return [{
            numberLabel: '',
            title: cleaned.substring(0, 80),
            body: cleaned.length > 80 ? cleaned.substring(80) : '',
            type: 'content'
        }];
    }

    function wrapResult(slides, rawText) {
        var mainTitle = slides._extractedTitle || '';
        delete slides._extractedTitle;
        return addCoverAndCTA(slides, rawText, mainTitle);
    }

    // ===== HOOK/CTA FORMAT PARSER (Common AI output) =====
    function parseHookFormat(text) {
        // Matches: Hook:, **Hook**, 🎣 Hook, Opening:, Intro:
        var hookPattern = /(?:^|\n)\s*(?:\*\*)?(?:hook|opening|intro|attention[- ]?grabber)\s*(?:\*\*)?[:\-]\s*/i;
        var ctaPattern = /(?:^|\n)\s*(?:\*\*)?(?:cta|call[- ]?to[- ]?action|closing|outro|final)\s*(?:\*\*)?[:\-]\s*/i;
        
        if (!hookPattern.test(text) && !ctaPattern.test(text)) return null;
        
        // Split by common section markers
        var sectionRegex = /(?:^|\n)\s*(?:\*\*)?(?:hook|opening|intro|point\s*\d+|tip\s*\d+|step\s*\d+|slide\s*\d+|key\s*\d+|insight\s*\d+|takeaway|cta|call[- ]?to[- ]?action|closing|outro|final|conclusion)\s*(?:\*\*)?[:\-]\s*/gi;
        
        var matches = [];
        var m;
        var regex = /(?:^|\n)\s*(?:\*\*)?(hook|opening|intro|point\s*\d+|tip\s*\d+|step\s*\d+|slide\s*\d+|key\s*\d+|insight\s*\d+|takeaway|cta|call[- ]?to[- ]?action|closing|outro|final|conclusion)\s*(?:\*\*)?[:\-]\s*/gi;
        
        while ((m = regex.exec(text)) !== null) {
            matches.push({ index: m.index, length: m[0].length, label: m[1].toLowerCase() });
        }
        
        if (matches.length < 2) return null;
        
        var slides = [];
        for (var i = 0; i < matches.length; i++) {
            var startIdx = matches[i].index + matches[i].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            var parsed = splitTitleBody(content);
            var label = matches[i].label;
            
            var type = 'content';
            var numberLabel = '';
            
            if (/hook|opening|intro/.test(label)) {
                type = 'cover';
            } else if (/cta|call|closing|outro|final|conclusion/.test(label)) {
                type = 'cta';
            } else {
                var numMatch = label.match(/\d+/);
                numberLabel = numMatch ? padNumber(parseInt(numMatch[0])) : padNumber(slides.filter(function(s) { return s.type === 'content'; }).length + 1);
            }
            
            slides.push({ numberLabel: numberLabel, title: parsed.title, body: parsed.body, type: type });
        }
        
        return slides.length >= 2 ? slides : null;
    }

    // ===== BRACKET MARKERS [1] or [Slide 1] =====
    function parseBracketMarkers(text) {
        var regex = /(?:^|\n)\s*\[(?:slide\s*)?(\d+)\]\s*[:\-]?\s*/gi;
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
        
        if (preamble && slides.length) {
            var firstLine = preamble.split('\n')[0].trim();
            if (firstLine.length <= 80) slides._extractedTitle = firstLine;
        }
        return slides.length >= 2 ? slides : null;
    }

    // ===== TWITTER THREAD FORMAT 1/ 2/ 3/ =====
    function parseTwitterThread(text) {
        var regex = /(?:^|\n)\s*(\d+)\/\s+/g;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) matches.push(m);
        if (matches.length < 2) return null;
        
        var slides = [];
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var startIdx = match.index + match[0].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(parseInt(match[1])), title: parsed.title, body: parsed.body, type: 'content' });
        }
        return slides.length >= 2 ? slides : null;
    }

    // ===== EMOJI HEADERS 🔥 Title =====
    function parseEmojiHeaders(text) {
        // Common emoji patterns at start of lines followed by title
        var regex = /(?:^|\n)\s*([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\s*(.+?)(?=\n\s*[\u{1F300}-\u{1F9FF}]|\n\s*[\u{2600}-\u{26FF}]|\n\s*[\u{2700}-\u{27BF}]|$)/gsu;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) {
            if (m[2].trim().length > 0) matches.push(m);
        }
        if (matches.length < 3) return null;
        
        var slides = [];
        for (var i = 0; i < matches.length; i++) {
            var content = matches[i][2].trim();
            var parsed = splitTitleBody(content);
            // Prepend emoji to title
            var emoji = matches[i][1];
            parsed.title = emoji + ' ' + parsed.title;
            slides.push({ numberLabel: padNumber(i + 1), title: parsed.title, body: parsed.body, type: 'content' });
        }
        return slides.length >= 2 ? slides : null;
    }

    // ===== LABELED SECTIONS (Point 1:, Tip 1:, Step 1:) =====
    function parseLabeledSections(text) {
        var regex = /(?:^|\n)\s*(?:\*\*)?(point|tip|step|key|insight|idea|reason|way|strategy|tactic|method|principle|rule|lesson|fact|myth|truth|secret)\s*(?:#)?(\d+)\s*(?:\*\*)?[:\-]\s*/gi;
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
            slides.push({ numberLabel: padNumber(parseInt(match[2])), title: parsed.title, body: parsed.body, type: 'content' });
        }
        
        if (preamble && slides.length) {
            var lines = preamble.split('\n').filter(function(l) { return l.trim(); });
            if (lines.length > 0 && lines[0].length <= 80) {
                slides._extractedTitle = cleanMarkdown(lines[0]);
            }
        }
        return slides.length >= 2 ? slides : null;
    }

    // ===== DASH SEPARATORS --- =====
    function parseDashSeparators(text) {
        var parts = text.split(/\n\s*[-=]{3,}\s*\n/);
        if (parts.length < 3) return null;
        
        var slides = [];
        for (var i = 0; i < parts.length; i++) {
            var content = parts[i].trim();
            if (!content) continue;
            var parsed = splitTitleBody(content);
            slides.push({ 
                numberLabel: slides.length > 0 ? padNumber(slides.length) : '', 
                title: parsed.title, 
                body: parsed.body, 
                type: slides.length === 0 ? 'cover' : 'content' 
            });
        }
        return slides.length >= 2 ? slides : null;
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
        if (lines.length === 0) return { title: '', body: '' };
        
        if (lines.length === 1) {
            // Clean trailing emojis from title for cleaner look (optional)
            var titleLine = lines[0];
            if (titleLine.length <= 80) return { title: titleLine, body: '' };
            // Try to split at sentence boundary
            var sentence = titleLine.match(/^(.{20,70}[.!?])\s+/);
            if (sentence) return { title: sentence[1], body: titleLine.substring(sentence[0].length) };
            // Split at last space before 80 chars
            var lastSpace = titleLine.substring(0, 80).lastIndexOf(' ');
            if (lastSpace > 30) return { title: titleLine.substring(0, lastSpace), body: titleLine.substring(lastSpace + 1) };
            return { title: titleLine, body: '' };
        }
        return { title: lines[0], body: lines.slice(1).join('\n') };
    }

    function cleanMarkdown(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/_(.+?)_/g, '$1')
            .replace(/^[-*+]\s+/gm, '• ')
            .replace(/^>\s*/gm, '')
            .trim();
    }

    function cleanBody(text) {
        return text.replace(/^\s*[-\u2013\u2014]\s*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    }

    function padNumber(n) { return String(n).padStart(2, '0'); }

    // =============================================
    // ===== SMART CONTENT BALANCING =====
    // =============================================
    var OPTIMAL_WORDS = { min: 15, max: 50 };
    var OPTIMAL_CHARS = { min: 80, max: 280 };
    
    function getSlideStats(slide) {
        var fullText = (slide.title || '') + ' ' + (slide.body || '');
        var words = fullText.trim().split(/\s+/).filter(Boolean).length;
        var chars = fullText.replace(/\s/g, '').length;
        return { words: words, chars: chars };
    }
    
    function getContentStatus(slide) {
        // Skip cover and CTA slides - they have preset content
        if (slide.type === 'cover' || slide.type === 'cta') {
            return { status: 'ok', message: '' };
        }
        
        var stats = getSlideStats(slide);
        
        if (stats.words > OPTIMAL_WORDS.max || stats.chars > OPTIMAL_CHARS.max) {
            return { 
                status: 'warning', 
                message: 'Too long (' + stats.words + ' words) - may be hard to read',
                canSplit: stats.words > OPTIMAL_WORDS.max * 1.5
            };
        }
        if (stats.words < OPTIMAL_WORDS.min && stats.chars < OPTIMAL_CHARS.min) {
            return { 
                status: 'short', 
                message: 'Short slide (' + stats.words + ' words)',
                canSplit: false
            };
        }
        return { 
            status: 'ok', 
            message: stats.words + ' words',
            canSplit: false
        };
    }
    
    function splitLongSlide(index) {
        var slide = state.slides[index];
        if (!slide || slide.type === 'cover' || slide.type === 'cta') return;
        
        var fullText = (slide.title ? slide.title + '\n' : '') + (slide.body || '');
        var sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
        
        if (sentences.length < 2) {
            // Split by words if no sentences
            var words = fullText.split(/\s+/);
            var midpoint = Math.ceil(words.length / 2);
            var part1 = words.slice(0, midpoint).join(' ');
            var part2 = words.slice(midpoint).join(' ');
            sentences = [part1, part2];
        }
        
        // Split sentences into two groups
        var midIdx = Math.ceil(sentences.length / 2);
        var firstHalf = sentences.slice(0, midIdx).join(' ').trim();
        var secondHalf = sentences.slice(midIdx).join(' ').trim();
        
        // Update current slide
        var parsed1 = splitTitleBody(firstHalf);
        state.slides[index] = {
            numberLabel: slide.numberLabel,
            title: parsed1.title,
            body: parsed1.body,
            type: 'content'
        };
        
        // Insert new slide after
        var parsed2 = splitTitleBody(secondHalf);
        var newSlide = {
            numberLabel: padNumber(parseInt(slide.numberLabel) + 1 || index + 2),
            title: parsed2.title,
            body: parsed2.body,
            type: 'content'
        };
        state.slides.splice(index + 1, 0, newSlide);
        
        // Renumber all slides
        renumberSlides();
        renderSlidesPreview();
        showToast('Slide split into 2 slides');
    }
    
    function renumberSlides() {
        var contentNum = 1;
        state.slides.forEach(function(slide) {
            if (slide.type === 'cover' || slide.type === 'cta') {
                slide.numberLabel = '';
            } else {
                slide.numberLabel = padNumber(contentNum);
                contentNum++;
            }
        });
    }

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
                saveDraft();
                if (state.slides.length > 0) generatePreview();
            });
        });
    }

    function initSize() {
        document.querySelectorAll('.size-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.size-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                state.size = btn.dataset.size;
                saveDraft();
                if (state.slides.length > 0) generatePreview();
            });
        });
    }

    function initFontSize() {
        fontSizeSlider.addEventListener('input', function () {
            state.fontSize = parseInt(fontSizeSlider.value, 10);
            fontSizeValue.textContent = state.fontSize + 'px';
            saveDraft();
        });
    }

    function initFontFamily() {
        if (!fontSelect) return;
        fontSelect.addEventListener('change', function () {
            state.fontFamily = fontSelect.value;
            saveDraft();
            if (state.slides.length > 0) generatePreview();
        });
    }

    function initHandle() {
        handleInput.addEventListener('input', function () {
            state.handle = handleInput.value.trim();
            saveDraft();
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

        renderSlidesPreview();
        showToast(state.slides.length + ' slides generated!');
    }

    function renderSlidesPreview() {
        var isPortrait = state.size === '1080x1350';
        slidesContainer.innerHTML = '';
        
        state.slides.forEach(function (slide, i) {
            var card = document.createElement('div');
            card.className = 'slide-card';
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-index', i);
            card.style.animationDelay = (i * 0.08) + 's';
            var slideClass = 'slide-inner theme-' + state.theme + ' font-' + state.fontFamily;
            if (isPortrait) slideClass += ' portrait';
            if (slide.type === 'cover') slideClass += ' title-slide';
            if (slide.type === 'cta') slideClass += ' cta-slide';
            var titleFontSize = state.fontSize * (slide.type === 'cover' ? 0.058 : 0.048);
            var bodyFontSize = state.fontSize * 0.029;
            
            // Smart content balancing
            var contentStatus = getContentStatus(slide);
            var statusClass = contentStatus.status === 'warning' ? ' content-warning' : 
                              contentStatus.status === 'short' ? ' content-short' : '';
            var statusBadge = '';
            if (contentStatus.status !== 'ok' || slide.type === 'content') {
                var badgeClass = contentStatus.status === 'warning' ? 'status-warning' : 
                                 contentStatus.status === 'short' ? 'status-short' : 'status-ok';
                statusBadge = '<div class="content-status ' + badgeClass + '">' +
                    '<span class="status-text">' + contentStatus.message + '</span>' +
                    (contentStatus.canSplit ? '<button class="split-slide-btn" data-index="' + i + '" title="Split into 2 slides">Split</button>' : '') +
                '</div>';
            }
            
            card.innerHTML =
                '<div class="slide-actions">' +
                    '<button class="slide-action-btn edit-slide" data-index="' + i + '" title="Edit slide" aria-label="Edit slide ' + (i + 1) + '">' +
                        '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
                    '</button>' +
                    '<button class="slide-action-btn delete-slide" data-index="' + i + '" title="Delete slide" aria-label="Delete slide ' + (i + 1) + '">' +
                        '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
                    '</button>' +
                    '<button class="slide-action-btn download-single" data-index="' + i + '" title="Download slide" aria-label="Download slide ' + (i + 1) + '">' +
                        '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>' +
                    '</button>' +
                '</div>' +
                statusBadge +
                '<div class="drag-handle" title="Drag to reorder">' +
                    '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>' +
                '</div>' +
                '<div class="' + slideClass + statusClass + '">' +
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

            // Drag events
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
            card.addEventListener('dragover', handleDragOver);
            card.addEventListener('drop', handleDrop);
            card.addEventListener('dragenter', handleDragEnter);
            card.addEventListener('dragleave', handleDragLeave);
        });

        // Attach event listeners
        slidesContainer.querySelectorAll('.download-single').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                downloadSingle(parseInt(btn.dataset.index, 10));
            });
        });

        slidesContainer.querySelectorAll('.edit-slide').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                openSlideEditor(parseInt(btn.dataset.index, 10));
            });
        });

        slidesContainer.querySelectorAll('.delete-slide').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                deleteSlide(parseInt(btn.dataset.index, 10));
            });
        });

        // Split slide buttons (smart content balancing)
        slidesContainer.querySelectorAll('.split-slide-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                splitLongSlide(parseInt(btn.dataset.index, 10));
            });
        });

        previewActions.style.display = 'flex';
        if (slideCountBadge) {
            slideCountBadge.textContent = state.slides.length + ' slides';
            slideCountBadge.style.display = 'inline';
        }
    }

    // =============================================
    // ===== DRAG AND DROP =====
    // =============================================
    function handleDragStart(e) {
        dragSrcIndex = parseInt(this.dataset.index, 10);
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrcIndex);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        document.querySelectorAll('.slide-card').forEach(function (card) {
            card.classList.remove('drag-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        var targetIndex = parseInt(this.dataset.index, 10);
        if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
            var movedSlide = state.slides.splice(dragSrcIndex, 1)[0];
            state.slides.splice(targetIndex, 0, movedSlide);
            updateSlideNumbers();
            renderSlidesPreview();
            showToast('Slide moved');
        }
        this.classList.remove('drag-over');
    }

    function updateSlideNumbers() {
        var contentIndex = 1;
        state.slides.forEach(function (slide) {
            if (slide.type === 'content') {
                slide.numberLabel = padNumber(contentIndex);
                contentIndex++;
            }
        });
    }

    // =============================================
    // ===== INLINE EDITING =====
    // =============================================
    function openSlideEditor(index) {
        var slide = state.slides[index];
        var modal = document.createElement('div');
        modal.className = 'slide-editor-overlay';
        modal.innerHTML = 
            '<div class="slide-editor-modal">' +
                '<h3>Edit Slide ' + (index + 1) + '</h3>' +
                '<label class="editor-label">Title</label>' +
                '<input type="text" class="editor-input" id="editTitle" value="' + escapeHTML(slide.title || '') + '" placeholder="Slide title">' +
                '<label class="editor-label">Body</label>' +
                '<textarea class="editor-textarea" id="editBody" rows="4" placeholder="Slide body text">' + escapeHTML(slide.body || '') + '</textarea>' +
                '<div class="editor-actions">' +
                    '<button class="editor-btn cancel-btn" id="cancelEdit">Cancel</button>' +
                    '<button class="editor-btn save-btn" id="saveEdit">Save Changes</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);

        var titleInput = document.getElementById('editTitle');
        var bodyInput = document.getElementById('editBody');
        
        titleInput.focus();

        document.getElementById('saveEdit').addEventListener('click', function () {
            state.slides[index].title = titleInput.value.trim();
            state.slides[index].body = bodyInput.value.trim();
            document.body.removeChild(modal);
            renderSlidesPreview();
            showToast('Slide updated');
        });

        document.getElementById('cancelEdit').addEventListener('click', function () {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function deleteSlide(index) {
        if (state.slides.length <= 1) {
            showToast('Cannot delete the last slide', true);
            return;
        }
        state.slides.splice(index, 1);
        updateSlideNumbers();
        renderSlidesPreview();
        showToast('Slide deleted');
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
            var slideClass = 'render-slide theme-' + state.theme + ' font-' + state.fontFamily;
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

    // =============================================
    // ===== DRAFT SAVE/LOAD SYSTEM =====
    // =============================================
    var DRAFT_KEY = 'carouselforge_draft';

    function saveDraft() {
        var draft = {
            rawText: mainTextInput.value,
            theme: state.theme,
            handle: state.handle,
            avatarBase64: state.avatarBase64,
            size: state.size,
            fontSize: state.fontSize,
            fontFamily: state.fontFamily
        };
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (e) {
            console.warn('Could not save draft:', e);
        }
    }

    function loadDraft() {
        try {
            var saved = localStorage.getItem(DRAFT_KEY);
            if (!saved) return false;
            var draft = JSON.parse(saved);
            
            if (draft.rawText) mainTextInput.value = draft.rawText;
            if (draft.theme) {
                state.theme = draft.theme;
                var activeBtn = themeGrid.querySelector('.theme-btn.active');
                if (activeBtn) activeBtn.classList.remove('active');
                var targetBtn = themeGrid.querySelector('[data-theme="' + draft.theme + '"]');
                if (targetBtn) targetBtn.classList.add('active');
            }
            if (draft.handle) {
                state.handle = draft.handle;
                handleInput.value = draft.handle;
            }
            if (draft.avatarBase64) {
                state.avatarBase64 = draft.avatarBase64;
                avatarPreviewImg.src = draft.avatarBase64;
                avatarPreviewContainer.style.display = 'flex';
                uploadAvatarBtn.style.display = 'none';
            }
            if (draft.size) {
                state.size = draft.size;
                document.querySelectorAll('.size-btn').forEach(function (b) { 
                    b.classList.remove('active'); 
                    if (b.dataset.size === draft.size) b.classList.add('active');
                });
            }
            if (draft.fontSize) {
                state.fontSize = draft.fontSize;
                fontSizeSlider.value = draft.fontSize;
                fontSizeValue.textContent = draft.fontSize + 'px';
            }
            if (draft.fontFamily && fontSelect) {
                state.fontFamily = draft.fontFamily;
                fontSelect.value = draft.fontFamily;
            }
            return true;
        } catch (e) {
            console.warn('Could not load draft:', e);
            return false;
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem(DRAFT_KEY);
            showToast('Draft cleared');
        } catch (e) {
            console.warn('Could not clear draft:', e);
        }
    }

    // ===== INIT =====
    function init() {
        initAccessGate();
        checkAccess();

        initTheme();
        initSize();
        initFontSize();
        initFontFamily();
        initHandle();
        initAvatar();

        // Load saved draft
        if (loadDraft()) {
            showToast('Draft restored');
        }

        // Auto-save on text input
        mainTextInput.addEventListener('input', function () {
            saveDraft();
        });

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
