'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 const start=source.indexOf('      this.mechLight=new T.PointLight(0x86f4f3,0,4.2,2);');
 const end=source.indexOf('      this.mechLight.position.set(0,0,.90);',start);
 assert(start>=0&&end>start,'Keep the existing local PointLight and authored position');
 const owner={};vm.runInNewContext('(function(){'+source.slice(start,end)+'})',{T}).call(owner);
 const old=new T.Color(0x86f4f3),key=owner.mechLight;
 const luminance=c=>c.r*.2126+c.g*.7152+c.b*.0722;
 assert.equal(key.color.r,key.color.g,'The physical key must not dye the silver chassis green');
 assert.equal(key.color.g,key.color.b,'The physical key must not dye the silver chassis blue');
 assert(Math.abs(luminance(old)-luminance(key.color))<1e-12,'Preserve the previous linear-light key luminance');
 assert.equal(key.intensity,0);assert.equal(key.distance,4.2);assert.equal(key.decay,2);
 assert(source.includes('this.mechLight.intensity=(.92+.18*finale)*opticWake*opticPulse;'),'Keep the original intensity and late optical ignition');
 console.log('MAG_STUDIO_KEY_R2212_PASS',JSON.stringify({three:T.REVISION,actualPointLight:true,neutralColor:key.color.toArray(),linearLuminance:luminance(key.color),notRenderedBrightnessOrHardwareAcceptance:true}));
})().catch(error=>{console.error(error);process.exitCode=1;});
