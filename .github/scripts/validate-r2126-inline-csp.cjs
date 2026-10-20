'use strict';

const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const filename='docs/scifi-ui/index.html';
const html=fs.readFileSync(filename,'utf8');
const meta=html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
assert.ok(meta,'Canonical static site must have a restrictive CSP');
const scriptDirectives=meta[1].split(';').find(x=>x.startsWith('script-src '));
assert.ok(scriptDirectives,'CSP must explicitly authorize local-only script sources');
assert.ok(scriptDirectives.includes("'self'"),'Local script origin must remain authorized');
assert.ok(!scriptDirectives.includes("'unsafe-inline'"),
  'Do not weaken CSP to allow arbitrary inline JavaScript');
const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m=>m[2].trim().length>0);
assert.ok(inline.length>0,'Expected real bootstrap and locale inline owners');
const report=[];
for(let i=0;i<inline.length;i++){
  const bytes=Buffer.from(inline[i][2],'utf8');
  const hash="'sha256-"+crypto.createHash('sha256').update(bytes).digest('base64')+"'";
  const allowed=scriptDirectives.includes(hash);
  report.push({index:i,attributes:inline[i][1].trim(),size:bytes.length,hash,allowed});
  console.log('R2126_EXACT_INLINE_SCRIPT',JSON.stringify(report[report.length-1]));
}
const missing=report.filter(x=>!x.allowed);
assert.deepEqual(missing,[],
  'Exact inline bootstrap hashes changed without CSP authorization. '+
    'Update the precise hash, never use unsafe-inline');
console.log('PASS_R2126_SITE_INLINE_CSP',report.length);
