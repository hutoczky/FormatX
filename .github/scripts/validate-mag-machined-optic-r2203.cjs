'use strict';
// Capture the actual native vertex program and prove that shared metal/glass
// edges stay coincident on the GPU. No alternate product renderer is selected.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const home=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output=process.env.FORMATX_MACHINED_MAG_EVIDENCE_DIR||'artifacts/mag-machined-optic-r2203';

function observe(){
  const original=WebGL2RenderingContext.prototype.drawArrays;
  WebGL2RenderingContext.prototype.drawArrays=function(mode,first,count){
    const value=Reflect.apply(original,this,arguments);
    if(!window.__machinedNative&&this.canvas?.classList.contains('fx-crystal-organism-r326-canvas')){
      const gl=this,program=gl.getParameter(gl.CURRENT_PROGRAM),attributes=[];
      for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_ATTRIBUTES);i++){
        const info=gl.getActiveAttrib(program,i),location=gl.getAttribLocation(program,info.name);
        attributes.push({name:info.name,location,
          buffer:gl.getVertexAttrib(location,gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING),
          size:gl.getVertexAttrib(location,gl.VERTEX_ATTRIB_ARRAY_SIZE),
          type:gl.getVertexAttrib(location,gl.VERTEX_ATTRIB_ARRAY_TYPE),
          normalized:gl.getVertexAttrib(location,gl.VERTEX_ATTRIB_ARRAY_NORMALIZED),
          stride:gl.getVertexAttrib(location,gl.VERTEX_ATTRIB_ARRAY_STRIDE),
          offset:gl.getVertexAttribOffset(location,gl.VERTEX_ATTRIB_ARRAY_POINTER)});
      }
      window.__machinedNative={gl,program,attributes,count};
    }
    return value;
  };
}

function proveEdges(){
  const {gl,program,attributes,count}=window.__machinedNative;
  const saved={program:gl.getParameter(gl.CURRENT_PROGRAM),vao:gl.getParameter(gl.VERTEX_ARRAY_BINDING),
    array:gl.getParameter(gl.ARRAY_BUFFER_BINDING),feedback:gl.getParameter(gl.TRANSFORM_FEEDBACK_BINDING),
    feedbackBuffer:gl.getParameter(gl.TRANSFORM_FEEDBACK_BUFFER_BINDING),discard:gl.isEnabled(gl.RASTERIZER_DISCARD)};
  let probe,vao,feedback,buffer;const shaders=[];
  const read=name=>{
    const a=attributes.find(v=>v.name===name);if(!a)throw Error('Missing actual attribute '+name);
    if(a.type!==gl.FLOAT||a.stride!==0||a.offset!==0)throw Error('Unexpected native buffer layout');
    gl.bindBuffer(gl.ARRAY_BUFFER,a.buffer);const data=new Float32Array(count*a.size);
    gl.getBufferSubData(gl.ARRAY_BUFFER,0,data);return data;
  };
  try{
    const positions=read('aCrystal'),facets=read('aFacet'),map=new Map();
    for(let i=0;i<count;i++){
      if(facets[i]<5||facets[i]>=7)continue;
      const key=Array.from(positions.subarray(i*3,i*3+3)).join(',');
      if(!map.has(key))map.set(key,[]);map.get(key).push(i);
    }
    const groups=Array.from(map.values()).filter(g=>g.length>1);
    probe=gl.createProgram();
    for(const shader of gl.getAttachedShaders(program)){
      const type=gl.getShaderParameter(shader,gl.SHADER_TYPE),source=gl.getShaderSource(shader);
      const copy=gl.createShader(type);shaders.push(copy);gl.shaderSource(copy,source);gl.compileShader(copy);
      if(!gl.getShaderParameter(copy,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(copy));
      gl.attachShader(probe,copy);
    }
    for(const a of attributes)gl.bindAttribLocation(probe,a.location,a.name);
    gl.transformFeedbackVaryings(probe,['vLocal'],gl.INTERLEAVED_ATTRIBS);gl.linkProgram(probe);
    if(!gl.getProgramParameter(probe,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(probe));
    vao=gl.createVertexArray();gl.bindVertexArray(vao);
    for(const a of attributes){
      gl.bindBuffer(gl.ARRAY_BUFFER,a.buffer);gl.enableVertexAttribArray(a.location);
      gl.vertexAttribPointer(a.location,a.size,a.type,a.normalized,a.stride,a.offset);
    }
    gl.useProgram(probe);
    for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);i++){
      const u=gl.getActiveUniform(program,i),value=gl.getUniform(program,gl.getUniformLocation(program,u.name));
      const loc=gl.getUniformLocation(probe,u.name);if(loc===null)continue;
      if(u.type===gl.FLOAT)gl.uniform1f(loc,value);
      else if(u.type===gl.FLOAT_VEC2)gl.uniform2fv(loc,value);
      else if(u.type===gl.FLOAT_VEC3)gl.uniform3fv(loc,value);
      else if(u.type===gl.FLOAT_VEC4)gl.uniform4fv(loc,value);
      else throw Error('Uncopied native uniform '+u.name);
    }
    feedback=gl.createTransformFeedback();gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK,feedback);
    buffer=gl.createBuffer();gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER,buffer);
    gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER,count*12,gl.STREAM_READ);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,buffer);
    const samples=[];
    for(const time of [0,.7,1.9]){
      gl.uniform1f(gl.getUniformLocation(probe,'uTime'),time);
      gl.uniform1f(gl.getUniformLocation(probe,'uEnergy'),1);
      gl.enable(gl.RASTERIZER_DISCARD);gl.beginTransformFeedback(gl.POINTS);
      gl.drawArrays(gl.POINTS,0,count);gl.endTransformFeedback();
      gl.disable(gl.RASTERIZER_DISCARD);
      const actual=new Float32Array(count*3);gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER,0,actual);
      let maximum=0,extent=0;
      for(const v of actual)extent=Math.max(extent,Math.abs(v));
      for(const g of groups){const a=g[0];for(const b of g.slice(1))maximum=Math.max(maximum,
        Math.hypot(actual[a*3]-actual[b*3],actual[a*3+1]-actual[b*3+1],actual[a*3+2]-actual[b*3+2]));}
      samples.push({time,maximumSharedEdgeSeparation:maximum,extent});
    }
    return {vertices:count,sharedEdgeGroups:groups.length,samples,
      actualVertexProgram:true,actualNativeBuffers:true,glError:gl.getError(),
      renderer:gl.getParameter(gl.RENDERER),surface:document.documentElement.dataset.fxNativeMagSurfaceR2203,
      canvases:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length};
  }finally{
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK,saved.feedback);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER,saved.feedbackBuffer);
    gl.bindVertexArray(saved.vao);gl.bindBuffer(gl.ARRAY_BUFFER,saved.array);gl.useProgram(saved.program);
    if(saved.discard)gl.enable(gl.RASTERIZER_DISCARD);else gl.disable(gl.RASTERIZER_DISCARD);
    if(buffer)gl.deleteBuffer(buffer);if(feedback)gl.deleteTransformFeedback(feedback);
    if(vao)gl.deleteVertexArray(vao);if(probe)gl.deleteProgram(probe);
    for(const shader of shaders)gl.deleteShader(shader);
  }
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report={auditedSha:process.env.AUDITED_SHA||null,browser:browser.version(),cases:[]};
  try{
    for(const width of [390,1440]){
      const context=await browser.newContext({viewport:{width,height:width===390?844:900},
        deviceScaleFactor:width===390?2:1,isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
      try{
        await context.addInitScript(observe);const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const url=new URL(home);url.searchParams.set('intro','0');
        // webdriver normally selects the audit renderer. This explicit,
        // existing functional route keeps the actual native material active.
        url.searchParams.set('r486-optics-energy-check',`machined-edges-${width}`);
        await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
        // Reduced motion intentionally has no ambient WebGL start. Exercise
        // the existing trusted keyboard-intent path a visitor uses instead of
        // adding a test-only product bypass or weakening the readiness limit.
        await page.keyboard.press('Shift');
        await page.waitForFunction(()=>window.__machinedNative&&document.documentElement.dataset.fxCrystalOrganismR326==='ready',null,{timeout:30000});
        const result=await page.evaluate(proveEdges);report.cases.push({width,...result,errors});
        console.log('MACHINED_MAG_GPU_EDGES',JSON.stringify(report.cases.at(-1)));
        assert.deepEqual(errors,[]);assert.equal(result.glError,0);assert.equal(result.canvases,1);
        assert(result.sharedEdgeGroups>150,'Actual connected metal/glass geometry was not observed');
        for(const sample of result.samples){
          assert(sample.extent>.4,'Transform feedback returned an empty or invalid vertex stream');
          assert(sample.maximumSharedEdgeSeparation<1e-6,'Rigid metal/glass edges tear during membrane animation');
        }
        assert.equal(result.surface,'body-anchored-filtered-machined-silver-recessed-optical-aperture');
        assert.equal(await page.evaluate(()=>document.documentElement.dataset.fxNativeMagSurfaceR2204),
          'travelling-softbox-readable-across-machined-silver');
        // The reduced-motion product state intentionally keeps its WebGL
        // canvas visually concealed. Preserve that actual page state in the
        // auxiliary artifact; the shader/buffer proof above is authoritative.
        await page.screenshot({path:`${output}/${width}-reduced-page.png`,fullPage:false});
        assert.equal(await page.evaluate(()=>window.__machinedNative.gl.getError()),0,'Proof failed to restore native GL state');
      }finally{await context.close();}
    }
  }finally{await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2)+'\n');}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
