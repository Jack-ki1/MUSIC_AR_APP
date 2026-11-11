// One-shot: rewrite hand-rolled card <div>s into the shared <Card> primitive.
//
// Pairing of <div>...</div> is found by depth scanning; every single edit is
// validated with esbuild before it is accepted, so a mis-paired close tag can
// never be written to disk.
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const file = process.argv[2];
const PAD = { 'p-3': 'sm', 'p-3.5': null, 'p-4': 'md', 'p-5': 'lg' };
const cardRe = /^(p-[0-9.]+ )?rounded (bg-surface(?:-subtle)?) border border-line(.*)$/;

function validate(text) {
  try {
    esbuild.transformSync(text, { loader: 'tsx', sourcefile: file });
    return true;
  } catch (e) {
    return false;
  }
}

function findTagEnd(s, from) {
  // JSX-aware: a '>' inside a quoted attribute or inside {...} does not close the tag
  let i = from, quote = null, depth = 0;
  while (i < s.length) {
    const c = s[i];
    if (quote) {
      if (c === '\\') { i += 2; continue; }
      if (c === quote) quote = null;
      i++; continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; i++; continue; }
    if (c === '{') depth++;
    else if (c === '}') depth = Math.max(0, depth - 1);
    else if (c === '>' && depth === 0) return i + 1;
    i++;
  }
  return -1;
}

function matchingClose(s, openEnd) {
  let depth = 1, i = openEnd;
  while (i < s.length) {
    if (s.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) return i;
      i += 6; continue;
    }
    if (s.startsWith('<div', i) && /[\s/>]/.test(s[i + 4] ?? '')) {
      const end = findTagEnd(s, i + 4);
      if (end === -1) return -1;
      if (s[end - 2] === '/') { i = end; continue; }   // self-closing
      depth++;
      i = end; continue;
    }
    i++;
  }
  return -1;
}

function candidates(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    if (!s.startsWith('<div', i) || !/[\s/>]/.test(s[i + 4] ?? '')) continue;
    const end = findTagEnd(s, i + 4);
    if (end === -1) continue;
    const tag = s.slice(i, end);
    const cls = /className="([^"]*)"/.exec(tag);
    if (!cls) continue;
    const m = cardRe.exec(cls[1].trim());
    if (!m) continue;
    const close = matchingClose(s, end);
    if (close === -1 || !s.startsWith('</div>', close)) continue;
    out.push({ openStart: i, openEnd: end, closeStart: close, closeEnd: close + 6, m });
  }
  return out;
}

function buildTag(m) {
  const padRaw = (m[1] || '').trim();
  const extra = (m[3] || '').trim();
  const variant = m[2] === 'bg-surface-subtle' ? 'subtle' : 'default';
  const attrs = [`variant="${variant}"`];
  const pad = PAD[padRaw];
  let rest;
  if (pad) {
    attrs.push(`padding="${pad}"`);
    rest = extra;
  } else {
    attrs.push('padding="none"');
    rest = [padRaw, extra].filter(Boolean).join(' ');
  }
  if (rest) attrs.push(`className="${rest}"`);
  return `<Card ${attrs.join(' ')}>`;
}

let text = fs.readFileSync(file, 'utf8');
if (!validate(text)) throw new Error('input file does not parse');

let accepted = 0;
const rejected = [];
for (;;) {
  const cands = candidates(text);
  let progressed = false;
  for (const c of cands) {
    const trial =
      text.slice(0, c.openStart) + buildTag(c.m) +
      text.slice(c.openEnd, c.closeStart) + '</Card>' + text.slice(c.closeEnd);
    if (validate(trial)) {
      text = trial;
      accepted++;
      progressed = true;
      break; // offsets changed — rescan
    }
    rejected.push(c.openStart);
  }
  if (!progressed) break;
}

if (!validate(text)) throw new Error('internal error: output does not parse');
fs.writeFileSync(file, text);
const remaining = candidates(text).length;
console.log(`accepted ${accepted}, rejected ${rejected.length}, remaining candidates ${remaining}`);
if (remaining) console.log('unconverted open tags at offsets:', candidates(text).map((c) => c.openStart).join(', '));
