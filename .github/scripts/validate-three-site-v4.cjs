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
  .replaceAll('ready-v3', 'ready-v4');

fs.writeFileSync(temporaryPath, source, 'utf8');
process.once('exit', () => {
  try { fs.unlinkSync(temporaryPath); } catch (_) {}
});

require(temporaryPath);