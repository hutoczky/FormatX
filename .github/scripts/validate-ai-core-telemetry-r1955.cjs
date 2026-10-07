'use strict';

const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..','..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const must=(condition,message)=>{
  if(!condition){
    console.error('R1955 telemetry contract failed:',message);
    process.exit(1);
  }
};

const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const ident=read('docs/scifi-ui/scripts/formatx-ai-core-ident-r1951.js');
const css=read('docs/scifi-ui/styles/formatx-ai-core-ident-r1951.css');
const index=read('docs/scifi-ui/index.html');
const worker=read('billing-worker/src/production-content-entry.js');
const revision=read('docs/production-revision.txt');

must(birth.includes("r>=.815"),'MAG stabilization trigger must remain at 8.15 s of the 10 s intro.');
must(birth.includes("formatx:magcorestabilized"),'R533 must publish the stabilization event.');
must(birth.includes("fxMagCoreIdentityR1955='stabilized'"),'R533 must expose stabilized telemetry state.');
must(birth.includes("8.15s-stabilized-1.25s-telemetry-clears-before-handoff"),'Timeline contract marker missing.');

must(ident.includes("formatx:magcorestabilized"),'Identity runtime must listen to stabilization, not only intro completion.');
must(ident.includes("sub.textContent = 'ONLINE · LOCAL INTELLIGENCE';"),'System subtitle must remain exact.');
must(ident.includes("MOBILE ? 1150 : 1250"),'Telemetry hold must remain within the requested 1–1.5 s window.');
must(!/magbirthcomplete'[^\n]*=>\s*\{\s*showIdentity/.test(ident),'Identity must not be created after the intro handoff.');
must(ident.includes("forced-clean-at-handoff"),'Handoff cleanup contract missing.');

must(css.includes("production-r1955-stabilized-ai-core-telemetry"),'R1955 telemetry CSS marker missing.');
must(css.includes("filter:blur(8px)"),'Cinematic blur-in contract missing.');
must(css.includes("filter:blur(6px)"),'Cinematic blur-out contract missing.');
must(css.includes('"SFMono-Regular"'),'Telemetry must keep the system/monospace visual language.');

must(index.includes("20261007-r1955c-ai-core-telemetry-flow"),'Index must cache-bust R533 to R1955.');
must(index.includes("20261007-r1955c-stabilized-telemetry"),'Index must cache-bust telemetry assets.');
must(/data-fx-ai-core-ident-r1951="true"[^>]*data-fx-r487-deferred-style="true"[^>]*media="print"[^>]*formatx-ai-core-ident-r1951\.css/.test(index),'Telemetry CSS must stay off the render-blocking first-paint path.');
must(worker.includes("20261007-r1955c-stabilized-ai-core-telemetry"),'Worker startup revision must match R1955.');
must(worker.includes("sha256-c0cB6pDcAX6NWsOnhJrf8LPWn2c0Pr0JWSW1dPDwZhw="),'Worker CSP must match the R1955 inline bootstrap hash.');
must(revision.includes("token=20261007-r1955c-stabilized-ai-core-telemetry"),'Exact production revision token must match R1955.');

console.log('R1955 MAG AI CORE telemetry contract: OK');
