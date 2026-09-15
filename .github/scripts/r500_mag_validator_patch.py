from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / '.github/scripts/validate-mag-surface-energy-r484.cjs'
text = path.read_text(encoding='utf-8')

anchor = "fs.mkdirSync(output, { recursive: true });\n"
if 'MOBILE_OPTICS_SOURCE' not in text:
    if anchor not in text:
        raise SystemExit('MAG source anchor missing')
    source_contract = anchor + r"""const MOBILE_OPTICS_SOURCE = fs.readFileSync(
  path.join(__dirname, '../../docs/scifi-ui/styles/formatx-mag-mobile-optics-r480.css'),
  'utf8',
);
function sourceFilterToken(name, unit = '') {
  const match = MOBILE_OPTICS_SOURCE.match(
    new RegExp(`${name}\\(([-\\d.]+)${unit}\\)`)
  );
  assert.ok(match, `missing canonical mobile optics token ${name}`);
  return `${name}(${match[1]}${unit})`;
}
const EXPECTED_MOBILE_FILTER = [
  sourceFilterToken('brightness'),
  sourceFilterToken('contrast'),
  sourceFilterToken('saturate'),
  sourceFilterToken('hue-rotate', 'deg'),
  sourceFilterToken('blur', 'px'),
];
"""
    text = text.replace(anchor, source_contract, 1)

old = r"""      assert.match(report.dom.filter, /brightness\(0?\.965\)/);
      assert.match(report.dom.filter, /contrast\(0?\.885\)/);
      assert.match(report.dom.filter, /saturate\(1\.14\)/);
      assert.match(report.dom.filter, /blur\(0?\.58px\)/);"""
new = r"""      for (const token of EXPECTED_MOBILE_FILTER) {
        assert.ok(
          report.dom.filter.includes(token),
          `${name}: canonical mobile optics token missing ${token}; computed=${report.dom.filter}`,
        );
      }"""
if old in text:
    text = text.replace(old, new, 1)
if r'brightness\(0?\.965\)' in text:
    raise SystemExit('stale MAG optics remains after exact patch')
if 'EXPECTED_MOBILE_FILTER' not in text:
    raise SystemExit('source-derived MAG filter contract missing')
path.write_text(text, encoding='utf-8')
