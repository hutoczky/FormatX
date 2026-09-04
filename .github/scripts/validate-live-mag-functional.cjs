'use strict';

/* R528 compatibility entrypoint for workflows historically named "live MAG".
   The canonical functional contract now lives in validate-r522-semantic-mag.cjs:
   one renderer/canvas/stage, continuous normal motion, functional ASK,
   reduced-motion identity, fallback safety and background lifecycle integrity.
   Manual PAUSE/RESUME is intentionally no longer a product requirement. */

process.env.FORMATX_SEMANTIC_EVIDENCE_DIR = process.env.FORMATX_MAG_EVIDENCE_DIR
  || process.env.FORMATX_SEMANTIC_EVIDENCE_DIR
  || 'artifacts/live-mag-functional';

require('./validate-r522-semantic-mag.cjs');
