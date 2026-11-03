'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const three=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const fragment=three.match(/    makeEmbryoFilm\(\)\{([\s\S]*?)    makeCinematicBiophotons\(/)?.[1]||three;
for(const literal of [
 'R2303: sculpt coherent lamellar microfolds in real 3D coordinates.',
 'const lamella=Math.sin(x*9.4+y*4.2+1.15*Math.sin(z*3.6))',
 'const stromalVein=Math.sin(x*5.8+z*4.2+1.4*Math.sin(y*3.2))',
 'const folded=envelope*(1+.014*lamella+.006*stromalVein)',
 'positions.setXYZ(i,x*folded,y*(1+.024*Math.cos(phi*4.0))*folded,z*folded)',
 'positions.needsUpdate=true;geometry.computeVertexNormals()'
])assert(fragment.includes(literal),'R2303 physical membrane surface lost: '+literal);
assert(three.includes('this.embryoShell=new T.Mesh(geometry,this.embryoMaterial)'),
 'must keep the one original PBR membrane mesh');
assert(birth.includes('const DURATION = 10000;'),'film duration must stay ten seconds');
assert.equal((three.match(/this\.mechLight=new T\.PointLight/g)||[]).length,1);
console.log('R2303_REAL_3D_MEMBRANE_MICROFOLDS_SOURCE_PASS');
