'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('    const constrainedFragmentSource = '),b=s.indexOf('    const softwareFragmentSource = ',a);
const make=new Function('webgl2','mobile','softwareRenderer','constrained','auditMode',`
 const versionLine=webgl2?'#version 300 es\\n':'',fragmentIn=webgl2?'in':'varying',outputName=webgl2?'outColor':'gl_FragColor';
 ${s.slice(a,b)}
 return constrainedFragmentSource;
`);
const desktop=make(true,false,false,false,false);
for(const token of ['fwidth(machiningPhase)','fwidth(opticPhase)','machiningHighlight','opticDetailVisibility','machinedSilver+='])assert.ok(desktop.includes(token),token);
for(const profile of [[false,false,false,false,false],[true,true,false,false,false],[true,false,true,false,false],[true,false,false,true,false],[true,false,false,false,true]]){
 const fragment=make(...profile);
 assert.ok(!fragment.includes('machiningPhase')&&!fragment.includes('opticPhase'));
}
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const visibility=x=>1-smooth(.55,2.4,x);
assert.equal(visibility(.25),1);assert.equal(visibility(2.4),0);
assert.ok(visibility(1.2)>visibility(2.1));
console.log('R2329 optical finishing shader source/profile and filter: PASS');
