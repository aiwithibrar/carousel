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
        rawText: '',
        customBg: {
            type: 'none',
            color: '#1e1b4b',
            imageBase64: null,
            overlayOpacity: 40
        }
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

    // Background picker refs
    var bgTypeNone = document.getElementById('bgTypeNone');
    var bgTypeColor = document.getElementById('bgTypeColor');
    var bgTypeImage = document.getElementById('bgTypeImage');
    var bgColorPanel = document.getElementById('bgColorPanel');
    var bgImagePanel = document.getElementById('bgImagePanel');
    var bgColorPicker = document.getElementById('bgColorPicker');
    var bgColorHex = document.getElementById('bgColorHex');
    var uploadBgBtn = document.getElementById('uploadBgBtn');
    var bgImageInput = document.getElementById('bgImageInput');
    var bgImagePreview = document.getElementById('bgImagePreview');
    var bgImagePreviewImg = document.getElementById('bgImagePreviewImg');
    var removeBgImageBtn = document.getElementById('removeBgImageBtn');
    var bgOverlaySlider = document.getElementById('bgOverlaySlider');
    var bgOverlayValue = document.getElementById('bgOverlayValue');
    var bgImageOptions = document.getElementById('bgImageOptions');

    // ===== SIZE CLASS HELPER =====
    function getSizeClass(sizeStr) {
        switch (sizeStr) {
            case '1080x1350': return ' portrait';
            case '1080x1920': return ' story';
            case '1200x627': return ' landscape-linkedin';
            case '1600x900': return ' landscape-twitter';
            case '1000x1500': return ' pinterest';
            default: return '';
        }
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
    // ===== TEXT CLEANUP =====
    // =============================================
    function cleanAIOutput(text) {
        var cleaned = text;
        
        // Remove common intro phrases (only at start of text, non-greedy)
        var introPatterns = [
            /^(sure|absolutely|of course|certainly|great|perfect|okay|ok)[^\n]*\n+/i,
            /^(i'?ve|i have|here is|here are)[^\n]*(created|written|prepared|made|generated)[^\n]*\n+/i,
            /^(below|following)[^\n]*(is|are)[^\n]*(carousel|content|slides?)[^\n]*:?\s*\n+/i,
            /^here'?s?\s+(your|the|a|my)\s+[^\n]*:\s*\n+/i,
            /^let me[^\n]*\n+/i,
            /^(this is|these are)[^\n]*(carousel|slides?|content)[^\n]*\n+/i,
        ];
        introPatterns.forEach(function(pattern) {
            cleaned = cleaned.replace(pattern, '');
        });
        
        // Remove image/visual/design suggestions in brackets
        cleaned = cleaned.replace(/\[(image|visual|photo|graphic|icon|design|color|font|background|layout|note)[^\]]*\]/gi, '');
        cleaned = cleaned.replace(/\((image|visual|suggest|note)[^)]*\)/gi, '');
        
        // Remove speaker notes
        cleaned = cleaned.replace(/^(note|caption|description|alt text):.*$/gim, '');
        
        // Remove character/word counts
        cleaned = cleaned.replace(/[(\[]\d+\s*(characters?|chars?|words?)[)\]]/gi, '');
        
        // Remove trailing AI outros
        cleaned = cleaned.replace(/\n+(let me know|hope this helps|feel free|if you need|want me to|shall i|i can also)[^\n]*$/gi, '');
        cleaned = cleaned.replace(/\n+---+\s*\n+(note|tip|remember)[^\n]*$/gi, '');
        
        // Clean up excessive whitespace
        cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
        cleaned = cleaned.replace(/^\n+/, '');
        
        return cleaned.trim();
    }

    // =============================================
    // ===== SMART TEXT PARSER (v3) =====
    // =============================================
    function parseTextToSlides(text) {
        var trimmed = text.trim();
        if (!trimmed) return [];
        
        // Clean artifacts
        var cleaned = cleanAIOutput(trimmed);
        if (!cleaned) return [];

        // Try all parsers and pick the best result by score
        var candidates = [];
        var result;

        result = parseSlideMarkers(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'slideMarkers') });

        result = parseHookFormat(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'hookFormat') });

        result = parseBracketMarkers(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'bracketMarkers') });

        result = parseMarkdownHeadings(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'markdown') });

        result = parseNumberedList(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'numbered') });

        result = parseTwitterThread(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'twitter') });

        result = parseLabeledSections(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'labeled') });

        result = parseBoldMarkers(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'bold') });

        result = parseDashSeparators(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'dash') });

        result = parseDoubleNewlineBlocks(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'blocks') });

        result = parseParagraphs(cleaned);
        if (result && result.length > 1) candidates.push({ slides: result, score: scoreResult(result, 'paragraphs') });

        // Pick the best candidate by score
        if (candidates.length > 0) {
            candidates.sort(function(a, b) { return b.score - a.score; });
            return wrapResult(candidates[0].slides, cleaned);
        }

        // Absolute fallback: single slide
        var fallbackParsed = splitTitleBody(cleaned);
        return [{
            numberLabel: '',
            title: fallbackParsed.title || cleaned.substring(0, 80),
            body: fallbackParsed.body || (cleaned.length > 80 ? cleaned.substring(80) : ''),
            type: 'content'
        }];
    }

    // Score a parser result to pick the best one
    function scoreResult(slides, parserType) {
        var score = 0;
        var contentSlides = slides.filter(function(s) { return s.type === 'content'; });
        
        // Reasonable slide count
        if (contentSlides.length >= 3 && contentSlides.length <= 12) score += 20;
        else if (contentSlides.length >= 2) score += 10;
        
        // Both title + body present
        var withBoth = contentSlides.filter(function(s) { return s.title && s.body; }).length;
        score += (withBoth / Math.max(contentSlides.length, 1)) * 30;
        
        // Consistent slide sizes
        if (contentSlides.length > 1) {
            var wordCounts = contentSlides.map(function(s) {
                return ((s.title || '') + ' ' + (s.body || '')).split(/\s+/).length;
            });
            var avg = wordCounts.reduce(function(a,b) { return a+b; }, 0) / wordCounts.length;
            var variance = wordCounts.reduce(function(acc, wc) { return acc + Math.pow(wc - avg, 2); }, 0) / wordCounts.length;
            var cv = Math.sqrt(variance) / Math.max(avg, 1);
            if (cv < 0.5) score += 15;
            else if (cv < 1.0) score += 8;
        }
        
        // Penalize empty or very short slides
        var emptySlides = contentSlides.filter(function(s) { return !s.title && !s.body; }).length;
        score -= emptySlides * 15;
        var shortTitles = contentSlides.filter(function(s) { return s.title && s.title.length < 5; }).length;
        score -= shortTitles * 5;
        
        // Bonus for structured parsers
        var structureBonus = {
            'slideMarkers': 20, 'hookFormat': 18, 'bracketMarkers': 16,
            'markdown': 14, 'numbered': 12, 'labeled': 14, 'twitter': 10,
            'bold': 8, 'dash': 6, 'blocks': 4, 'paragraphs': 2
        };
        score += (structureBonus[parserType] || 0);
        
        if (slides.some(function(s) { return s.type === 'cover'; })) score += 5;
        if (slides.some(function(s) { return s.type === 'cta'; })) score += 5;
        
        return score;
    }

    function wrapResult(slides, rawText) {
        var mainTitle = slides._extractedTitle || '';
        delete slides._extractedTitle;
        
        // Post-process: balance slide content
        slides = autoBalanceSlides(slides);
        
        var hasCover = slides.some(function(s) { return s.type === 'cover'; });
        var hasCTA = slides.some(function(s) { return s.type === 'cta'; });
        
        if (hasCover && hasCTA) return slides;
        return addCoverAndCTA(slides, rawText, mainTitle, hasCover, hasCTA);
    }

    // =============================================
    // ===== POST-PROCESSING: AUTO-BALANCE =====
    // =============================================
    function autoBalanceSlides(slides) {
        var MAX_WORDS = 55;
        var MIN_WORDS = 8;
        var result = [];
        
        // Step 1: Split long slides
        for (var i = 0; i < slides.length; i++) {
            var slide = slides[i];
            if (slide.type !== 'content') {
                result.push(slide);
                continue;
            }
            
            var fullText = ((slide.title || '') + ' ' + (slide.body || '')).trim();
            var wordCount = fullText.split(/\s+/).filter(Boolean).length;
            
            if (wordCount > MAX_WORDS) {
                // Split into two slides at sentence boundary
                var sentences = fullText.match(/[^.!?]+[.!?]+/g);
                if (sentences && sentences.length >= 2) {
                    var midIdx = Math.ceil(sentences.length / 2);
                    var firstHalf = sentences.slice(0, midIdx).join(' ').trim();
                    var secondHalf = sentences.slice(midIdx).join(' ').trim();
                    
                    var parsed1 = splitTitleBody(firstHalf);
                    var parsed2 = splitTitleBody(secondHalf);
                    result.push({ numberLabel: '', title: parsed1.title, body: parsed1.body, type: 'content' });
                    result.push({ numberLabel: '', title: parsed2.title, body: parsed2.body, type: 'content' });
                } else {
                    // No sentence boundaries: split at word midpoint
                    var words = fullText.split(/\s+/);
                    var mid = Math.ceil(words.length / 2);
                    var p1 = splitTitleBody(words.slice(0, mid).join(' '));
                    var p2 = splitTitleBody(words.slice(mid).join(' '));
                    result.push({ numberLabel: '', title: p1.title, body: p1.body, type: 'content' });
                    result.push({ numberLabel: '', title: p2.title, body: p2.body, type: 'content' });
                }
            } else {
                result.push(slide);
            }
        }
        
        // Step 2: Merge very short consecutive content slides
        var merged = [];
        for (var j = 0; j < result.length; j++) {
            var current = result[j];
            if (current.type !== 'content') {
                merged.push(current);
                continue;
            }
            
            var curText = ((current.title || '') + ' ' + (current.body || '')).trim();
            var curWords = curText.split(/\s+/).filter(Boolean).length;
            
            if (curWords < MIN_WORDS && j + 1 < result.length && result[j + 1].type === 'content') {
                var next = result[j + 1];
                var nextText = ((next.title || '') + ' ' + (next.body || '')).trim();
                var nextWords = nextText.split(/\s+/).filter(Boolean).length;
                
                // Only merge if combined is still reasonable
                if (curWords + nextWords <= MAX_WORDS) {
                    var combinedTitle = current.title || next.title || '';
                    var combinedBody = '';
                    if (current.body) combinedBody += current.body;
                    if (next.title && current.title) combinedBody += (combinedBody ? '\n' : '') + next.title;
                    if (next.body) combinedBody += (combinedBody ? '\n' : '') + next.body;
                    
                    merged.push({ numberLabel: '', title: combinedTitle, body: combinedBody, type: 'content' });
                    j++; // skip next
                    continue;
                }
            }
            merged.push(current);
        }
        
        // Step 3: Renumber content slides
        var num = 1;
        merged.forEach(function(s) {
            if (s.type === 'content') {
                s.numberLabel = padNumber(num++);
            }
        });
        
        return merged;
    }

    // =============================================
    // ===== INDIVIDUAL PARSERS =====
    // =============================================

    // --- Slide Markers: "Slide 1:", "Slide 2:" ---
    function parseSlideMarkers(text) {
        var regex = /(?:^|\n)\s*slide\s*(\d+)\s*[:\-\u2013\u2014]\s*/gi;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) {
            matches.push({ index: m.index, length: m[0].length, num: parseInt(m[1]) });
        }
        if (matches.length < 2) return null;
        
        var slides = [];
        var preamble = text.substring(0, matches[0].index).trim();

        for (var i = 0; i < matches.length; i++) {
            var startIdx = matches[i].index + matches[i].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            if (!content) continue;
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(matches[i].num), title: parsed.title, body: parsed.body, type: 'content' });
        }
        
        if (preamble && slides.length) {
            var firstLine = preamble.split('\n')[0].trim();
            if (firstLine.length > 0 && firstLine.length <= 100) slides._extractedTitle = cleanMarkdown(firstLine);
        }
        return slides.length >= 2 ? slides : null;
    }

    // --- Hook / CTA Format ---
    function parseHookFormat(text) {
        var hookPattern = /(?:^|\n)\s*(?:\*\*)?(hook|title|opening|intro)\s*(?:\*\*)?[:\-]\s*/i;
        var ctaPattern = /(?:^|\n)\s*(?:\*\*)?(cta|call[\- ]?to[\- ]?action|closing|outro|final|conclusion)\s*(?:\*\*)?[:\-]\s*/i;
        var hasPoints = /(?:^|\n)\s*(?:\*\*)?(point|tip|step|key|insight)\s*\d+/i.test(text);
        
        // Must have hook AND (cta OR numbered points)
        if (!hookPattern.test(text)) return null;
        if (!ctaPattern.test(text) && !hasPoints) return null;
        
        var regex = /(?:^|\n)\s*(?:\*\*)?(title|hook|opening|intro|point\s*\d+|tip\s*\d+|step\s*\d+|key\s*\d+|insight\s*\d+|slide\s*\d+|takeaway|cta|call[\- ]?to[\- ]?action|closing|outro|final|conclusion)\s*(?:\*\*)?[:\-]\s*/gi;
        
        var matchList = [];
        var mm;
        while ((mm = regex.exec(text)) !== null) {
            matchList.push({ index: mm.index, length: mm[0].length, label: mm[1].toLowerCase() });
        }
        if (matchList.length < 2) return null;
        
        var slides = [];
        for (var i = 0; i < matchList.length; i++) {
            var startIdx = matchList[i].index + matchList[i].length;
            var endIdx = i + 1 < matchList.length ? matchList[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            var label = matchList[i].label;
            
            if (/title|hook|opening|intro/.test(label)) {
                var parsedHook = splitTitleBody(content);
                slides.push({ numberLabel: '', title: parsedHook.title, body: parsedHook.body, type: 'cover' });
            } else if (/cta|call|closing|outro|final|conclusion/.test(label)) {
                var ctaParsed = splitTitleBody(content);
                slides.push({ numberLabel: '', title: ctaParsed.title, body: ctaParsed.body, type: 'cta' });
            } else {
                var numMatch = label.match(/\d+/);
                var num = numMatch ? parseInt(numMatch[0]) : slides.filter(function(s) { return s.type === 'content'; }).length + 1;
                var contentParsed = splitTitleBody(content);
                slides.push({ numberLabel: padNumber(num), title: contentParsed.title, body: contentParsed.body, type: 'content' });
            }
        }
        
        var contentNum = 1;
        slides.forEach(function(s) {
            if (s.type === 'content') s.numberLabel = padNumber(contentNum++);
        });
        
        return slides.length >= 2 ? slides : null;
    }

    // --- Bracket Markers [1], [Slide 1] ---
    function parseBracketMarkers(text) {
        var regex = /(?:^|\n)\s*\[(?:slide\s*)?(\d+)\]\s*[:\-]?\s*/gi;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) matches.push(m);
        if (matches.length < 2) return null;
        
        var slides = [];
        var preamble = text.substring(0, matches[0].index).trim();
        
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var startIdx = match.index + match[0].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            if (!content) continue;
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(parseInt(match[1])), title: parsed.title, body: parsed.body, type: 'content' });
        }
        
        if (preamble && slides.length) {
            var firstLine = preamble.split('\n')[0].trim();
            if (firstLine.length > 0 && firstLine.length <= 100) slides._extractedTitle = cleanMarkdown(firstLine);
        }
        return slides.length >= 2 ? slides : null;
    }

    // --- Markdown Headings ---
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
                mainTitle = cleanMarkdown(h1Match[1].trim());
            } else if (h2Match || h3Match) {
                if (currentSlide) slides.push(currentSlide);
                var heading = cleanMarkdown((h2Match ? h2Match[1] : h3Match[1]).trim());
                currentSlide = { numberLabel: padNumber(slides.length + 1), title: heading, body: '', type: 'content' };
            } else if (currentSlide) {
                var trimLine = line.trim();
                if (trimLine) currentSlide.body += (currentSlide.body ? '\n' : '') + cleanMarkdown(trimLine);
            }
        }
        if (currentSlide) slides.push(currentSlide);
        if (mainTitle && slides.length) slides._extractedTitle = mainTitle;
        return slides.length >= 2 ? slides : null;
    }

    // --- Numbered List (with sequential validation) ---
    function parseNumberedList(text) {
        var regex = /(?:^|\n)\s*(\d+)\s*[.)\-:\u2013\u2014]\s+/g;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) matches.push(m);
        if (matches.length < 2) return null;
        
        // Validate sequential numbering
        var nums = matches.map(function(mm) { return parseInt(mm[1]); });
        var isSequential = true;
        for (var k = 1; k < nums.length; k++) {
            if (nums[k] !== nums[k-1] + 1) { isSequential = false; break; }
        }
        if (!isSequential) {
            var isIncreasing = nums[0] === 1;
            for (var k2 = 1; k2 < nums.length; k2++) {
                if (nums[k2] <= nums[k2-1]) { isIncreasing = false; break; }
            }
            if (!isIncreasing) return null;
        }

        var slides = [];
        var firstMatchStart = matches[0].index;
        var preamble = text.substring(0, firstMatchStart).trim();
        
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var startIdx = match.index + match[0].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            if (!content) continue;
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(parseInt(match[1])), title: parsed.title, body: parsed.body, type: 'content' });
        }
        
        if (preamble && slides.length) {
            var pLines = preamble.split('\n').filter(function(l) { return l.trim(); });
            if (pLines.length > 0) {
                var titleLine = cleanMarkdown(pLines[0].trim());
                if (titleLine.length > 0 && titleLine.length <= 100) slides._extractedTitle = titleLine;
            }
        }
        return slides.length >= 2 ? slides : null;
    }

    // --- Twitter Thread ---
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
            if (!content) continue;
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(parseInt(match[1])), title: parsed.title, body: parsed.body, type: 'content' });
        }
        return slides.length >= 2 ? slides : null;
    }

    // --- Labeled Sections ---
    function parseLabeledSections(text) {
        var regex = /(?:^|\n)\s*(?:\*\*)?(point|tip|step|key|insight|idea|reason|way|strategy|tactic|method|principle|rule|lesson|fact|myth|truth|secret)\s*(?:#)?(\d+)\s*(?:\*\*)?[:\-]\s*/gi;
        var matches = [];
        var m;
        while ((m = regex.exec(text)) !== null) matches.push(m);
        if (matches.length < 2) return null;
        
        var slides = [];
        var preamble = text.substring(0, matches[0].index).trim();
        
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var startIdx = match.index + match[0].length;
            var endIdx = i + 1 < matches.length ? matches[i + 1].index : text.length;
            var content = text.substring(startIdx, endIdx).trim();
            if (!content) continue;
            var parsed = splitTitleBody(content);
            slides.push({ numberLabel: padNumber(parseInt(match[2])), title: parsed.title, body: parsed.body, type: 'content' });
        }
        
        if (preamble && slides.length) {
            var lines = preamble.split('\n').filter(function(l) { return l.trim(); });
            if (lines.length > 0 && lines[0].length <= 100) slides._extractedTitle = cleanMarkdown(lines[0]);
        }
        return slides.length >= 2 ? slides : null;
    }

    // --- Bold Markers ---
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
            slides.push({ numberLabel: padNumber(i + 1), title: cleanMarkdown(title), body: cleanBody(body), type: 'content' });
        }
        return slides.length >= 2 ? slides : null;
    }

    // --- Dash Separators ---
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

    // --- Double Newline Blocks (title + body separated by blank lines) ---
    function parseDoubleNewlineBlocks(text) {
        var blocks = text.split(/\n\s*\n/).map(function(b) { return b.trim(); }).filter(Boolean);
        if (blocks.length < 3) return null;
        
        var slides = [];
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var blockLines = block.split('\n').filter(function(l) { return l.trim(); });
            if (blockLines.length === 0) continue;
            
            // Short single line + next block looks like body = combine them
            if (blockLines.length === 1 && blockLines[0].length <= 60 && i + 1 < blocks.length) {
                var nextBlock = blocks[i + 1];
                var nextLines = nextBlock.split('\n').filter(function(l) { return l.trim(); });
                if (nextLines.length > 1 || (nextLines.length === 1 && nextLines[0].length > 60)) {
                    slides.push({
                        numberLabel: padNumber(slides.length + 1),
                        title: cleanMarkdown(blockLines[0]),
                        body: cleanMarkdown(nextBlock),
                        type: 'content'
                    });
                    i++;
                    continue;
                }
            }
            
            var parsed = splitTitleBody(block);
            slides.push({
                numberLabel: padNumber(slides.length + 1),
                title: parsed.title,
                body: parsed.body,
                type: 'content'
            });
        }
        return slides.length >= 2 ? slides : null;
    }

    // --- Paragraphs fallback ---
    function parseParagraphs(text) {
        var blocks = text.split(/\n\s*\n/).map(function(b) { return b.trim(); }).filter(Boolean);
        if (blocks.length < 2) return null;
        
        var slides = [];
        for (var i = 0; i < blocks.length; i++) {
            var parsed = splitTitleBody(blocks[i]);
            var isFirst = slides.length === 0;
            slides.push({ 
                numberLabel: isFirst ? '' : padNumber(slides.length), 
                title: parsed.title, 
                body: parsed.body, 
                type: isFirst ? 'cover' : 'content' 
            });
        }
        return slides.length >= 2 ? slides : null;
    }

    // =============================================
    // ===== PARSER HELPERS =====
    // =============================================
    function splitTitleBody(content) {
        if (!content) return { title: '', body: '' };
        content = cleanMarkdown(content);
        var lines = content.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
        if (lines.length === 0) return { title: '', body: '' };
        
        if (lines.length === 1) {
            var titleLine = lines[0];
            
            // Check for "Title: body text" colon format
            var colonMatch = titleLine.match(/^([^:]{5,60}):\s+(.+)/);
            if (colonMatch && colonMatch[2].length > 10) {
                return { title: colonMatch[1].trim(), body: colonMatch[2].trim() };
            }
            
            if (titleLine.length <= 100) return { title: titleLine, body: '' };
            var sentence = titleLine.match(/^(.{20,80}[.!?])\s+/);
            if (sentence) return { title: sentence[1], body: titleLine.substring(sentence[0].length) };
            var lastSpace = titleLine.substring(0, 80).lastIndexOf(' ');
            if (lastSpace > 20) return { title: titleLine.substring(0, lastSpace), body: titleLine.substring(lastSpace + 1) };
            return { title: titleLine, body: '' };
        }
        
        // Multi-line: find the best title candidate
        var title = lines[0];
        var bodyStartIdx = 1;
        
        // If first line is a bullet point, look for a non-bullet title
        if (/^\u2022/.test(title)) {
            // All bullets - use first bullet as title, strip the bullet char
            title = title.replace(/^\u2022\s*/, '');
            bodyStartIdx = 1;
        }
        
        // Check for "Title: body" in first line
        var multiColonMatch = title.match(/^([^:]{5,60}):\s+(.+)/);
        if (multiColonMatch && multiColonMatch[2].length > 10) {
            title = multiColonMatch[1].trim();
            // Prepend the colon body to the rest
            var body = multiColonMatch[2].trim() + '\n' + lines.slice(bodyStartIdx).join('\n');
            return { title: title, body: body.trim() };
        }
        
        var body = lines.slice(bodyStartIdx).join('\n');
        
        // Very short label = combine with next line
        if (title.length < 5 && lines.length > 2) {
            title = lines[0] + ' ' + lines[1];
            body = lines.slice(2).join('\n');
        }
        
        // Strip trailing colon from title
        if (title.endsWith(':')) title = title.slice(0, -1).trim();
        
        return { title: title, body: body };
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

    function addCoverAndCTA(slides, rawText, mainTitle, skipCover, skipCTA) {
        var totalContent = slides.filter(function(s) { return s.type === 'content'; }).length;
        
        // Add cover if not skipped
        if (!skipCover) {
            var coverTitle = mainTitle || '';
            if (!coverTitle) {
                coverTitle = findBestTitle(rawText);
            }
            if (coverTitle) {
                // Dynamic cover body based on slide count
                var coverBody = '';
                if (totalContent >= 5) {
                    coverBody = totalContent + ' key insights inside \u2014 swipe \u2192';
                } else if (totalContent >= 3) {
                    coverBody = totalContent + ' essential points \u2014 swipe \u2192';
                } else {
                    coverBody = 'Keep reading to learn more \u2192';
                }
                slides.unshift({ numberLabel: '', title: coverTitle, body: coverBody, type: 'cover' });
            }
        }
        
        // Add CTA if not skipped
        if (!skipCTA) {
            var ctaTitle = generateSmartCTA(rawText, mainTitle);
            var ctaBody = state.handle ? 'Follow ' + state.handle + ' for more' : 'Save this post & share with a friend';
            slides.push({ numberLabel: '', title: ctaTitle, body: ctaBody, type: 'cta' });
        }
        
        return slides;
    }

    // Find the most "title-like" line from raw text
    function findBestTitle(text) {
        var lines = text.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
        var bestTitle = '';
        var bestScore = -1;
        
        // Only check first 5 lines
        var searchLines = lines.slice(0, Math.min(5, lines.length));
        
        for (var i = 0; i < searchLines.length; i++) {
            var line = cleanMarkdown(searchLines[i]);
            var score = 0;
            
            // Skip numbering, bullets, and slide markers
            if (/^\d+[.)\-:]/.test(line)) continue;
            if (/^slide\s+\d+/i.test(line)) continue;
            if (/^\u2022/.test(line)) continue;
            if (line.length > 100 || line.length < 5) continue;
            
            // Shorter is more title-like (but not too short)
            if (line.length >= 10 && line.length <= 60) score += 20;
            else if (line.length <= 80) score += 10;
            
            // No ending period = more title-like
            if (!/[.!]$/.test(line)) score += 10;
            
            // Question mark endings are great for titles
            if (/\?$/.test(line)) score += 15;
            
            // Title case bonus (starts with uppercase, has some uppercase words)
            var words = line.split(/\s+/);
            var upperWords = words.filter(function(w) { return /^[A-Z]/.test(w); }).length;
            if (upperWords > words.length * 0.5) score += 10;
            
            // First line gets a position bonus
            if (i === 0) score += 15;
            
            // Contains power words
            if (/\b(how|why|what|best|top|secret|hack|mistake|way|tip|step|guide|ultimate|essential)\b/i.test(line)) score += 10;
            
            // Contains numbers (e.g., "5 Ways to...")
            if (/^\d+\s+/.test(line)) score += 12;
            
            if (score > bestScore) {
                bestScore = score;
                bestTitle = line;
            }
        }
        
        return bestTitle;
    }

    // Generate context-aware CTA text
    function generateSmartCTA(rawText, mainTitle) {
        var source = (mainTitle || '') + ' ' + (rawText || '');
        source = source.toLowerCase();
        
        // Detect content type
        if (/\b(tip|hack|trick|shortcut)\b/i.test(source)) {
            return 'Found these tips useful?';
        }
        if (/\b(step|guide|tutorial|process)\b/i.test(source)) {
            return 'Ready to take the next step?';
        }
        if (/\b(mistake|avoid|wrong|never|stop)\b/i.test(source)) {
            return 'Don\u2019t make these mistakes!';
        }
        if (/\b(lesson|learn|taught|realize)\b/i.test(source)) {
            return 'Key takeaways to remember';
        }
        if (/\b(money|earn|income|revenue|profit|business)\b/i.test(source)) {
            return 'Start building your success!';
        }
        if (/\b(health|fitness|workout|exercise|diet)\b/i.test(source)) {
            return 'Your health journey starts now!';
        }
        if (/\b(product|tool|software|app|resource)\b/i.test(source)) {
            return 'Try these out today!';
        }
        
        // Generic CTAs (rotate randomly for variety)
        var genericCTAs = [
            'Thanks for reading!',
            'Found this valuable?',
            'Drop a comment below!',
            'Share this with someone who needs it!',
            'What did you think?'
        ];
        return genericCTAs[Math.floor(Math.random() * genericCTAs.length)];
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

    function initPromptTemplate() {
        var copyBtn = document.getElementById('copyPromptBtn');
        var topicInput = document.getElementById('promptTopicInput');
        var previewBox = document.getElementById('promptPreviewBox');
        if (!copyBtn || !topicInput) return;

        function buildPrompt(topic) {
            return 'Write a social media carousel about: ' + (topic || '[YOUR TOPIC]') + '\n\n' +
                'Use EXACTLY this format:\n\n' +
                '[Write an attention-grabbing title for the carousel]\n\n' +
                '1. [First point title]\n' +
                '[2-3 sentences explaining this point]\n\n' +
                '2. [Second point title]\n' +
                '[2-3 sentences explaining this point]\n\n' +
                '3. [Third point title]\n' +
                '[2-3 sentences explaining this point]\n\n' +
                '...continue for 5-8 points total.\n\n' +
                'Rules:\n' +
                '- Start with ONE title line (no numbering)\n' +
                '- Each point: number + period + title on one line\n' +
                '- Body text on the next lines (2-3 sentences max)\n' +
                '- Separate each point with a blank line\n' +
                '- No emojis, no bold (**), no markdown\n' +
                '- Keep each point under 40 words\n' +
                '- Make the title catchy and scroll-stopping\n' +
                '- End with a final point, no CTA needed';
        }

        // Update preview when topic changes
        topicInput.addEventListener('input', function() {
            if (previewBox) {
                previewBox.textContent = buildPrompt(topicInput.value.trim());
            }
        });

        copyBtn.addEventListener('click', function() {
            var topic = topicInput.value.trim();
            if (!topic) {
                showToast('Enter a topic first', true);
                topicInput.focus();
                return;
            }

            var prompt = buildPrompt(topic);
            
            navigator.clipboard.writeText(prompt).then(function() {
                copyBtn.classList.add('copied');
                var origHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
                showToast('Prompt copied! Paste it into any AI chatbot');
                
                setTimeout(function() {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = origHTML;
                }, 2000);
            }).catch(function() {
                // Fallback for older browsers
                var textarea = document.createElement('textarea');
                textarea.value = prompt;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast('Prompt copied! Paste it into any AI chatbot');
            });
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
        slidesContainer.innerHTML = '';
        
        // Build custom background HTML
        var customBgHTML = '';
        if (state.customBg.type === 'image' && state.customBg.imageBase64) {
            customBgHTML = '<img src="' + state.customBg.imageBase64 + '" class="custom-bg-image" alt="">' +
                '<div class="custom-bg-overlay" style="background:rgba(0,0,0,' + (state.customBg.overlayOpacity / 100) + ')"></div>';
        } else if (state.customBg.type === 'color' && state.customBg.color) {
            customBgHTML = '<div class="custom-bg-overlay" style="background:' + state.customBg.color + ';"></div>';
        }

        state.slides.forEach(function (slide, i) {
            var card = document.createElement('div');
            card.className = 'slide-card';
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-index', i);
            card.style.animationDelay = (i * 0.08) + 's';
            var slideClass = 'slide-inner font-' + state.fontFamily;
            if (state.customBg.type === 'none') {
                slideClass += ' theme-' + state.theme;
            }
            slideClass += getSizeClass(state.size);
            if (slide.type === 'cover') slideClass += ' title-slide';
            if (slide.type === 'cta') slideClass += ' cta-slide';
            var titleFontSize = state.fontSize * (slide.type === 'cover' ? 0.058 : 0.048);
            var bodyFontSize = state.fontSize * 0.029;
            
            // Custom bg inline styles
            var customInlineStyle = '';
            if (state.customBg.type === 'color') {
                // Determine text color based on bg brightness
                var isLight = isLightColor(state.customBg.color);
                customInlineStyle = 'color:' + (isLight ? '#1e293b' : '#f1f5f9') + ';';
            } else if (state.customBg.type === 'image') {
                customInlineStyle = 'color:#f1f5f9;';
            }

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
                '<div class="' + slideClass + statusClass + '"' + (customInlineStyle ? ' style="' + customInlineStyle + '"' : '') + '>' +
                    customBgHTML +
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
            var slideClass = 'render-slide font-' + state.fontFamily;
            if (state.customBg.type === 'none') {
                slideClass += ' theme-' + state.theme;
            }
            if (slide.type === 'cover') slideClass += ' title-slide';
            if (slide.type === 'cta') slideClass += ' cta-slide';
            var el = document.createElement('div');
            el.className = slideClass;
            el.style.width = w + 'px';
            el.style.height = h + 'px';
            
            // Custom bg inline style
            if (state.customBg.type === 'color') {
                var isLight = isLightColor(state.customBg.color);
                el.style.color = isLight ? '#1e293b' : '#f1f5f9';
            } else if (state.customBg.type === 'image') {
                el.style.color = '#f1f5f9';
            }

            // Build custom background HTML for export
            var exportBgHTML = '';
            if (state.customBg.type === 'image' && state.customBg.imageBase64) {
                exportBgHTML = '<img src="' + state.customBg.imageBase64 + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" alt="">' +
                    '<div style="position:absolute;inset:0;background:rgba(0,0,0,' + (state.customBg.overlayOpacity / 100) + ');z-index:0;"></div>';
            } else if (state.customBg.type === 'color' && state.customBg.color) {
                exportBgHTML = '<div style="position:absolute;inset:0;background:' + state.customBg.color + ';z-index:0;"></div>';
            }

            el.innerHTML =
                exportBgHTML +
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

    // ===== COLOR HELPERS =====
    function isLightColor(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.55;
    }

    // =============================================
    // ===== CUSTOM BACKGROUND =====
    // =============================================
    function initBackground() {
        if (!bgTypeNone) return;

        // Toggle between bg types
        var bgTypeBtns = [bgTypeNone, bgTypeColor, bgTypeImage];
        bgTypeBtns.forEach(function(btn) {
            if (!btn) return;
            btn.addEventListener('click', function() {
                bgTypeBtns.forEach(function(b) { if (b) b.classList.remove('active'); });
                btn.classList.add('active');
                var bgType = btn.dataset.bgType;
                state.customBg.type = bgType;

                if (bgColorPanel) bgColorPanel.style.display = bgType === 'color' ? 'block' : 'none';
                if (bgImagePanel) bgImagePanel.style.display = bgType === 'image' ? 'block' : 'none';

                saveDraft();
                if (state.slides.length > 0) renderSlidesPreview();
            });
        });

        // Color swatches
        document.querySelectorAll('.color-swatch').forEach(function(swatch) {
            swatch.addEventListener('click', function() {
                document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
                swatch.classList.add('active');
                var color = swatch.dataset.color;
                state.customBg.color = color;
                if (bgColorPicker) bgColorPicker.value = color;
                if (bgColorHex) bgColorHex.value = color;
                saveDraft();
                if (state.slides.length > 0) renderSlidesPreview();
            });
        });

        // Color picker
        if (bgColorPicker) {
            bgColorPicker.addEventListener('input', function() {
                state.customBg.color = bgColorPicker.value;
                if (bgColorHex) bgColorHex.value = bgColorPicker.value;
                document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
                saveDraft();
                if (state.slides.length > 0) renderSlidesPreview();
            });
        }

        // Hex input
        if (bgColorHex) {
            bgColorHex.addEventListener('change', function() {
                var val = bgColorHex.value.trim();
                if (!val.startsWith('#')) val = '#' + val;
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                    state.customBg.color = val;
                    if (bgColorPicker) bgColorPicker.value = val;
                    document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
                    saveDraft();
                    if (state.slides.length > 0) renderSlidesPreview();
                }
            });
        }

        // Background image upload
        if (uploadBgBtn && bgImageInput) {
            uploadBgBtn.addEventListener('click', function() {
                bgImageInput.click();
            });

            bgImageInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                    showToast('Please select an image file', true);
                    return;
                }
                if (file.size > 10 * 1024 * 1024) {
                    showToast('Image too large (max 10MB)', true);
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(event) {
                    state.customBg.imageBase64 = event.target.result;
                    if (bgImagePreviewImg) bgImagePreviewImg.src = event.target.result;
                    if (bgImagePreview) bgImagePreview.style.display = 'block';
                    if (bgImageOptions) bgImageOptions.style.display = 'block';
                    uploadBgBtn.style.display = 'none';
                    saveDraft();
                    if (state.slides.length > 0) renderSlidesPreview();
                };
                reader.readAsDataURL(file);
            });
        }

        // Remove bg image
        if (removeBgImageBtn) {
            removeBgImageBtn.addEventListener('click', function() {
                state.customBg.imageBase64 = null;
                if (bgImageInput) bgImageInput.value = '';
                if (bgImagePreview) bgImagePreview.style.display = 'none';
                if (bgImageOptions) bgImageOptions.style.display = 'none';
                if (uploadBgBtn) uploadBgBtn.style.display = 'flex';
                saveDraft();
                if (state.slides.length > 0) renderSlidesPreview();
            });
        }

        // Overlay opacity slider
        if (bgOverlaySlider) {
            bgOverlaySlider.addEventListener('input', function() {
                state.customBg.overlayOpacity = parseInt(bgOverlaySlider.value, 10);
                if (bgOverlayValue) bgOverlayValue.textContent = bgOverlaySlider.value + '%';
                saveDraft();
                if (state.slides.length > 0) renderSlidesPreview();
            });
        }
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
        
        var cleanEmail = email.trim().toLowerCase();
        
        // Instead of just inserting into the database, we call a Supabase Edge Function 
        // that handles the magic link creation and email sending through Resend/SendGrid
        return supabase.functions.invoke('send-verification', {
            body: { email: cleanEmail, app: 'carouselforge' }
        })
        .then(function (response) {
            if (response.error) {
                // If the edge function fails or isn't deployed yet, fallback to the manual approval row
                console.warn('Edge function failed/missing. Falling back to manual request.', response.error);
                return supabase
                    .from('approved_users')
                    .insert([{ email: cleanEmail, is_active: false }])
                    .then(function (result) {
                        if (result.error) return false;
                        return true;
                    });
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
            fontFamily: state.fontFamily,
            customBg: {
                type: state.customBg.type,
                color: state.customBg.color,
                overlayOpacity: state.customBg.overlayOpacity
                // Note: imageBase64 not saved to avoid localStorage quota
            }
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
            if (draft.customBg) {
                state.customBg.type = draft.customBg.type || 'none';
                state.customBg.color = draft.customBg.color || '#1e1b4b';
                state.customBg.overlayOpacity = draft.customBg.overlayOpacity != null ? draft.customBg.overlayOpacity : 40;
                // Restore bg type toggle
                var bgBtns = document.querySelectorAll('.bg-type-btn');
                bgBtns.forEach(function(b) {
                    b.classList.remove('active');
                    if (b.dataset.bgType === state.customBg.type) b.classList.add('active');
                });
                if (bgColorPanel) bgColorPanel.style.display = state.customBg.type === 'color' ? 'block' : 'none';
                if (bgImagePanel) bgImagePanel.style.display = state.customBg.type === 'image' ? 'block' : 'none';
                if (bgColorPicker) bgColorPicker.value = state.customBg.color;
                if (bgColorHex) bgColorHex.value = state.customBg.color;
                if (bgOverlaySlider) bgOverlaySlider.value = state.customBg.overlayOpacity;
                if (bgOverlayValue) bgOverlayValue.textContent = state.customBg.overlayOpacity + '%';
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
        initBackground();
        initPromptTemplate();

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
