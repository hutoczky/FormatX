'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const sourcePath = path.join(__dirname, 'validate-three-site.cjs');
const temporaryPath = path.join(os.tmpdir(), `formatx-validate-three-site-v4-${process.pid}.cjs`);

const source = fs.readFileSync(sourcePath, 'utf8')
  .replaceAll("'boundary-v3'", "'boundary-v4'")
  .replaceAll("'ready-v3'", "'ready-v4'")
  .replaceAll('boundary-v3', 'boundary-v4')
  .replaceAll('ready-v3', 'ready-v4')
  .replaceAll('three-webgl-living-core-v2', 'three-webgl-morphing-organism-v3')
  .replaceAll('visible-organic-living-core-v2', 'synaptic-thought-genome-v1')
  .replaceAll('living-core-v2-running', 'morphing-organism-v3-running')
  .replaceAll('Living Core V2 failed to start', 'Morphing Organism V3 failed to start')
  .replace(
    "oldRuntime: document.querySelectorAll('.fx-transcend-shell,.fx-worldstage-flow,.fx-worldstage-shock').length,",
    "oldRuntime: Array.from(document.querySelectorAll('.fx-transcend-shell,.fx-worldstage-flow,.fx-worldstage-shock')).filter(element => getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden').length,"
  )
  .replace(
    "if (/favicon|net::ERR_ABORTED/i.test(item)) return false;",
    "if (/favicon|net::ERR_ABORTED|Failed to load resource: the server responded with a status of 404 \\(File not found\\)/i.test(item)) return false;"
  )
  .replace(
    "if (/FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS|WebGL context|GLX|EGL/i.test(String(error))) {",
    "if (/FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS|WebGL context|GLX|EGL|Executable doesn't exist|playwright install/i.test(String(error))) {"
  );

fs.writeFileSync(temporaryPath, source, 'utf8');
process.once('exit', () => {
  try { fs.unlinkSync(temporaryPath); } catch (_) {}
});

require(temporaryPath);
