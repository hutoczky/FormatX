'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const pairs = [
  {
    source: 'docs/scifi-ui/styles/formatx-reference-production-r244.css',
    compact: 'docs/scifi-ui/styles/formatx-reference-production-r244.min-r2099.css',
    selector: 'data-fx-reference-production-r244="true"',
    media: 'media="(min-width: 901px)"'
  },
  {
    source: 'docs/scifi-ui/styles/formatx-desktop-first-paint-r328.css',
    compact: 'docs/scifi-ui/styles/formatx-desktop-first-paint-r328.min-r2099.css',
    selector: 'data-fx-desktop-first-paint-r1600="true"',
    media: 'media="(min-width: 901px)"'
  }
];

function compactCss(source) {
  let out = '';
  let quote = '';
  let escaped = false;
  let round = 0;
  let square = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];
    if (quote) {
      out += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      out += char;
      continue;
    }
    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      assert.ok(end !== -1, 'Unclosed CSS comment');
      out += ' ';
      i = end + 1;
      continue;
    }
    if (char === '(') round++;
    if (char === ')') round--;
    if (char === '[') square++;
    if (char === ']') square--;
    if (/\s/.test(char)) {
      let j = i + 1;
      while (j < source.length && /\s/.test(source[j])) j++;
      const before = out.at(-1) || '';
      const after = source[j] || '';
      if (!(
        (round === 0 && square === 0 &&
          ('};{'.includes(before) || '};{'.includes(after))) ||
        before === ',' || after === ','
      )) out += ' ';
      i = j - 1;
      continue;
    }
    out += char;
  }
  assert.equal(quote, '', 'Unclosed CSS string');
  assert.equal(round, 0, 'Unbalanced CSS parentheses');
  assert.equal(square, 0, 'Unbalanced CSS attribute brackets');
  return out.trim() + '\n';
}

const html = fs.readFileSync(path.join(root, 'docs/scifi-ui/index.html'), 'utf8');

for (const entry of pairs) {
  const original = fs.readFileSync(path.join(root, entry.source), 'utf8');
  const compact = fs.readFileSync(path.join(root, entry.compact), 'utf8');
  assert.equal(compact, compactCss(original),
    'Compact stylesheet no longer matches the authoritative source: ' + entry.compact);
  assert.ok(compact.length <= original.length * 0.92,
    'Critical CSS is not meaningfully smaller: ' + entry.compact);
  const basename = path.basename(entry.compact);
  const matches = html.match(new RegExp(basename.replaceAll('.', '\\.') , 'g')) || [];
  assert.equal(matches.length, 1, 'Exactly one compact reference must load in index.html');
  const link = html.split('\n').find(line =>
    line.includes(basename) && line.includes(entry.selector));
  assert.ok(link && link.includes(entry.media),
    'Compact asset must keep its original render-blocking load and desktop media selector');
  assert.ok(!link.includes('media="print"'),
    'A critical CSS asset cannot be deferred: it regresses CLS');
  console.log('PASS R2099', entry.source, original.length,
    '=>', compact.length, 'bytes, same selectors and rule order');
}
