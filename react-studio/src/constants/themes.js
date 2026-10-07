export const CMP_THEMES = {
  ink: {
    id: 'ink',
    name: 'Ink',
    b1: '#101a3a',
    b2: '#0a0f24',
    fg: '#ffffff',
    acc: '#ffd23f',
    desc: 'Deep navy with electric gold accent'
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    b1: '#ffffff',
    b2: '#eef1f8',
    fg: '#12182b',
    acc: '#2547f5',
    desc: 'Clean editorial paper with royal blue'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    b1: '#ff7a45',
    b2: '#d6246e',
    fg: '#ffffff',
    acc: '#fff1b8',
    desc: 'Vibrant coral & magenta warm glow'
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    b1: '#0f3d36',
    b2: '#0a2723',
    fg: '#eafff8',
    acc: '#5df2c1',
    desc: 'Dark forest teal with radiant mint'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    b1: '#0b6e99',
    b2: '#063b5c',
    fg: '#ffffff',
    acc: '#9ef0ff',
    desc: 'Deep azure sea with cyan highlight'
  },
  plum: {
    id: 'plum',
    name: 'Plum',
    b1: '#3b1450',
    b2: '#1d0a2b',
    fg: '#fbeeff',
    acc: '#ff8bd6',
    desc: 'Midnight purple with neon rose'
  },
  sand: {
    id: 'sand',
    name: 'Sand',
    b1: '#f6ead6',
    b2: '#e9d5b4',
    fg: '#2b1e10',
    acc: '#c2410c',
    desc: 'Warm parchment with rust orange'
  },
  mono: {
    id: 'mono',
    name: 'Mono',
    b1: '#f4f4f4',
    b2: '#dcdcdc',
    fg: '#111111',
    acc: '#111111',
    desc: 'Brutalist high-contrast monochrome'
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    b1: '#0a0a0a',
    b2: '#141414',
    fg: '#f5f5f5',
    acc: '#b6ff3b',
    desc: 'Dark slate with radioactive lime'
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    b1: '#1f3d2b',
    b2: '#122419',
    fg: '#f1f7ee',
    acc: '#f2c14e',
    desc: 'Emerald evergreen with warm gold'
  }
};

export const LAYOUT_TYPES = [
  { id: 'auto', name: 'Layout: Auto (Smart)', desc: 'Detects stat, list, question, split automatically' },
  { id: 'cover', name: 'Cover / Title', desc: 'Prominent headline with accent line' },
  { id: 'split', name: 'Split (Watermark Number)', desc: 'Huge ghost number in background' },
  { id: 'stat', name: 'Big Stat / Number', desc: 'Giant accent metric with explanation' },
  { id: 'question', name: 'Question / Quote', desc: 'Oversized quotation mark with question' },
  { id: 'list', name: 'Numbered List', desc: 'Numbered circular accent badges' },
  { id: 'cta', name: 'CTA / Action', desc: 'Centered closing with follow button' }
];

export const ASPECT_RATIOS = [
  { id: 'r45', name: '4:5 Portrait', dims: '1080 × 1350', width: 1080, height: 1350, ratio: '4/5', platform: 'LinkedIn & IG Portrait' },
  { id: 'r11', name: '1:1 Square', dims: '1080 × 1080', width: 1080, height: 1080, ratio: '1/1', platform: 'Instagram & Feed' }
];

export const DEFAULT_BRAND_KIT = {
  name: 'CarouselForge',
  handle: '@carouselforge',
  showFooter: true,
  logoData: '',
  c1: '#0f172a',
  c2: '#1e293b',
  c3: '#ffffff',
  c4: '#22d3ee'
};

export const PRO_SAMPLE_TEXT = `SEO basics for beginners
Swipe for 6 steps to rank higher

Pick one keyword per page
Know what people type into Google, then focus each page on one clear topic.

Why does intent matter?
Does the searcher want to learn, compare, or buy? Write exactly that.

3 things every page needs
A clear title under 60 characters
Helpful, easy-to-scan content
Links to your other pages

90%
of pages get no traffic from Google. Helpful content and patience change that.

Be patient and keep going
SEO takes months, not days. Publish consistently.

Found this useful?
Save this post and follow for more.`;
