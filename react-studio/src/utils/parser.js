const VALID_LAYOUTS = ['cover', 'stat', 'question', 'list', 'split', 'cta'];

export function parseCarouselProText(rawText, forcedGlobalLayout = 'auto') {
  if (!rawText || !rawText.trim()) return [];

  // Split by blank lines (one or more empty lines)
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.split('\n').map((s) => s.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);

  const total = paragraphs.length;

  return paragraphs.map((lines, i) => {
    let heading = lines[0];
    const body = lines.slice(1);
    let layout;

    // Check for explicit layout tag like [stat], [question], etc.
    const tagMatch = heading.match(/^\[(\w+)\]\s*/i);
    if (tagMatch && VALID_LAYOUTS.includes(tagMatch[1].toLowerCase())) {
      layout = tagMatch[1].toLowerCase();
      heading = heading.slice(tagMatch[0].length).trim() || ' ';
    } else if (i === 0) {
      layout = 'cover';
    } else if (i === total - 1) {
      layout = 'cta';
    } else if (forcedGlobalLayout !== 'auto' && VALID_LAYOUTS.includes(forcedGlobalLayout)) {
      layout = forcedGlobalLayout;
    } else if (/^[\d$€£%]/.test(heading) && heading.length <= 10) {
      layout = 'stat';
    } else if (heading.endsWith('?')) {
      layout = 'question';
    } else if (lines.length >= 4) {
      layout = 'list';
    } else {
      layout = 'split';
    }

    return {
      id: `slide-${i}-${Date.now()}`,
      heading,
      body,
      layout,
      type: layout
    };
  });
}
