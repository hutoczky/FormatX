const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync(
  process.argv[2]||'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js',
  'utf8'
);

function listenerBody(event){
  const marker=`listen(window,'${event}',()=>{`;
  const start=source.indexOf(marker);
  assert.notEqual(start,-1,`missing ${event} listener`);
  const end=source.indexOf("},{passive:true});",start);
  assert.notEqual(end,-1,`unterminated ${event} listener`);
  return source.slice(start,end);
}

for(const event of ['resize','orientationchange']){
  const body=listenerBody(event);
  assert.match(body,/resize\(\)/,`${event} must still resize the real WebGL surface`);
  assert.match(body,/boost\(/,`${event} must retain a bounded living MAG response`);
  assert.doesNotMatch(body,/startSurfacePulse\(/,
    `${event} must not start a continuous viewport-driven surface sweep`);
}

assert.match(source,/fxCoreViewportReactionR2239='bounded-resize-burst'/,
  'missing resize burst telemetry');
assert.match(source,/fxCoreViewportReactionR2239='bounded-orientation-burst'/,
  'missing orientation burst telemetry');
assert.match(source,/function startSurfacePulse\(source='autonomous'\)/,
  'explicit and autonomous surface-pulse owner must remain present');
assert.match(source,/fxCoreIdleRenderR441='zero-frame'/,
  'zero-idle contract must remain present');

console.log('R2239 native MAG viewport burst validation passed');
