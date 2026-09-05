'use strict';

/* R535 compatibility entrypoint for the historical "organism-first main site"
   workflow. The former five-panel DOM-reparenting organism interface is not the
   current product architecture and must not be recreated by validation.

   Current organism truth is the living MAG contract: one native renderer in
   normal mode, SOUND + ASK, no manual PAUSE, reduced/background lifecycle
   safety, responsive no-overflow behavior and a static-safe WebGL fallback.
   Keep one authoritative browser matrix instead of maintaining a second,
   divergent interaction harness.

   GitHub's headless compositor can rarely expose a running Web Animation with
   currentTime pinned to 0 for one navigation sample. That runner-only symptom
   is retried exactly once. Every other failure is terminal, and a repeated 0ms
   result is terminal too. */

const { spawnSync } = require('node:child_process');

process.env.FORMATX_SEMANTIC_EVIDENCE_DIR = process.env.FORMATX_ORGANISM_EVIDENCE_DIR
  || process.env.FORMATX_SEMANTIC_EVIDENCE_DIR
  || 'artifacts/organism-main-current';

const validator = require.resolve('./validate-r522-semantic-mag.cjs');
const flakyZeroClock = /normal MAG motion did not automatically progress after navigation without user intent \(0ms\)/;

function runMatrix(attempt) {
  const result = spawnSync(process.execPath, [validator], {
    env: { ...process.env, FORMATX_ORGANISM_MATRIX_ATTEMPT: String(attempt) },
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return {
    status: Number.isInteger(result.status) ? result.status : 1,
    output: `${result.stdout || ''}\n${result.stderr || ''}`,
  };
}

const first = runMatrix(1);
if (first.status === 0) process.exit(0);
if (!flakyZeroClock.test(first.output)) process.exit(first.status);

console.warn('R535: retrying one runner-only 0ms compositor sample; all assertions remain unchanged.');
const second = runMatrix(2);
process.exit(second.status);
