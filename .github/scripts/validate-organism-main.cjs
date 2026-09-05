'use strict';

/* R530 compatibility entrypoint for the historical "organism-first main site"
   workflow. The former five-panel DOM-reparenting organism interface is not the
   current product architecture and must not be recreated by validation.

   Current organism truth is the living MAG contract: one native renderer in
   normal mode, SOUND + ASK, no manual PAUSE, reduced/background lifecycle
   safety, responsive no-overflow behavior and a static-safe WebGL fallback.
   Keep one authoritative browser matrix instead of maintaining a second,
   divergent interaction harness. */
process.env.FORMATX_SEMANTIC_EVIDENCE_DIR = process.env.FORMATX_ORGANISM_EVIDENCE_DIR
  || process.env.FORMATX_SEMANTIC_EVIDENCE_DIR
  || 'artifacts/organism-main-current';

require('./validate-r522-semantic-mag.cjs');
