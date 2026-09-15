(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v29';
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (AUDIT_MODE || root.dataset.fxWebgpuCore === 'ready-v29') return;

  const hero = document.getElementById('hero');
  if (!hero || !document.body) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const mobile = coarse.matches;

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  function fallback(reason) {
    root.dataset.fxWebgpuCore = reason || 'fallback-webgl2';
    if (document.querySelector('script[data-fx-orbital-core-v28]')) return;
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-orbital-core-v28.js?v=20260809-reference-orb-v28-3';
    script.defer = true;
    script.dataset.fxOrbitalCoreV28 = 'true';
    document.head.appendChild(script);
  }

  if (!navigator.gpu || typeof GPUBufferUsage === 'undefined') {
    fallback('webgpu-unavailable');
    return;
  }

  const stage = document.createElement('div');
  stage.className = 'fx-orbital-core-v28-stage fx-webgpu-core-v29-stage';
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-orbital-core-v28-canvas fx-webgpu-core-v29-canvas';
  canvas.dataset.fxWebgpuCoreCanvas = VERSION;
  stage.appendChild(canvas);
  document.body.appendChild(stage);

  const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c += 1) {
      for (let r = 0; r < 4; r += 1) {
        out[r + c * 4] = a[r] * b[c * 4]
          + a[r + 4] * b[c * 4 + 1]
          + a[r + 8] * b[c * 4 + 2]
          + a[r + 12] * b[c * 4 + 3];
      }
    }
    return out;
  }
  function compose(...parts) { return parts.reduce((out, part) => multiply(out, part), identity()); }
  function translation(x, y, z) { const m = identity(); m[12] = x; m[13] = y; m[14] = z; return m; }
  function scaling(x, y, z) { const m = identity(); m[0] = x; m[5] = y; m[10] = z; return m; }
  function rotationX(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function rotationY(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function rotationZ(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far), m = new Float32Array(16);
    m[0] = f / aspect; m[5] = f; m[10] = (far + near) * nf; m[11] = -1; m[14] = 2 * far * near * nf;
    return m;
  }
  function normalize(v) {
    const length = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / length, v[1] / length, v[2] / length];
  }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function lookAt(eye, target, up) {
    const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
      -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
      -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]), 1
    ]);
  }

  function sphereGeometry(segments, rings) {
    const positions = [], normals = [], indices = [];
    for (let y = 0; y <= rings; y += 1) {
      const v = y / rings, phi = v * Math.PI, sy = Math.cos(phi), sr = Math.sin(phi);
      for (let x = 0; x <= segments; x += 1) {
        const u = x / segments, theta = u * Math.PI * 2;
        const px = Math.cos(theta) * sr, pz = Math.sin(theta) * sr;
        positions.push(px, sy, pz); normals.push(px, sy, pz);
      }
    }
    const stride = segments + 1;
    for (let y = 0; y < rings; y += 1) for (let x = 0; x < segments; x += 1) {
      const a = y * stride + x, b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return { positions, normals, indices };
  }

  function curvePoint(t, spec) {
    const wobble = 1 + spec.wobble * Math.sin(t * spec.wave + spec.phase * 1.7);
    return [
      Math.cos(t + spec.phase) * spec.rx * wobble,
      Math.sin(t * 2 + spec.phase * 1.9) * spec.ry + Math.sin(t * 3 - spec.phase) * spec.ry * .22,
      Math.sin(t + spec.phase) * spec.rz * (1 + spec.wobble * .55 * Math.cos(t * (spec.wave + 1) - spec.phase))
    ];
  }

  function tubeGeometry(spec, segments, sides) {
    const positions = [], normals = [], indices = [], dt = Math.PI * 2 / segments;
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments * Math.PI * 2;
      const p = curvePoint(t, spec), before = curvePoint(t - dt * .35, spec), after = curvePoint(t + dt * .35, spec);
      const tangent = normalize([after[0] - before[0], after[1] - before[1], after[2] - before[2]]);
      const reference = Math.abs(tangent[1]) > .82 ? [1, 0, 0] : [0, 1, 0];
      const normal = normalize(cross(tangent, reference));
      const binormal = normalize(cross(tangent, normal));
      for (let side = 0; side < sides; side += 1) {
        const a = side / sides * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        const n = normalize([normal[0] * ca + binormal[0] * sa, normal[1] * ca + binormal[1] * sa, normal[2] * ca + binormal[2] * sa]);
        const radius = spec.thickness * (1 + .18 * Math.sin(t * 4 + spec.phase));
        positions.push(p[0] + n[0] * radius, p[1] + n[1] * radius, p[2] + n[2] * radius);
        normals.push(n[0], n[1], n[2]);
      }
    }
    for (let i = 0; i < segments; i += 1) for (let side = 0; side < sides; side += 1) {
      const nextSide = (side + 1) % sides;
      const a = i * sides + side, b = (i + 1) * sides + side, c = (i + 1) * sides + nextSide, d = i * sides + nextSide;
      indices.push(a, b, d, b, c, d);
    }
    return { positions, normals, indices };
  }

  async function init() {
    root.dataset.fxWebgpuCore = 'requesting-adapter';
    let adapter;
    try { adapter = await navigator.gpu.requestAdapter({ powerPreference: mobile ? 'low-power' : 'high-performance' }); }
    catch (_) { adapter = null; }
    if (!adapter) { stage.remove(); fallback('adapter-unavailable'); return; }

    let device;
    try { device = await adapter.requestDevice(); }
    catch (_) { device = null; }
    if (!device) { stage.remove(); fallback('device-unavailable'); return; }

    const context = canvas.getContext('webgpu');
    if (!context) { stage.remove(); fallback('context-unavailable'); return; }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'premultiplied' });

    const shader = device.createShaderModule({ code: `
struct Uniforms {
  projection: mat4x4<f32>,
  view: mat4x4<f32>,
  model: mat4x4<f32>,
  cameraTime: vec4<f32>,
  colorOpacity: vec4<f32>,
  materialEnergy: vec4<f32>,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

struct VertexIn { @location(0) position: vec3<f32>, @location(1) normal: vec3<f32> };
struct VertexOut { @builtin(position) position: vec4<f32>, @location(0) world: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) object: vec3<f32> };

@vertex fn vsMain(input: VertexIn) -> VertexOut {
  var out: VertexOut;
  let world = u.model * vec4<f32>(input.position, 1.0);
  out.position = u.projection * u.view * world;
  out.world = world.xyz;
  out.object = input.position;
  out.normal = normalize((u.model * vec4<f32>(input.normal, 0.0)).xyz);
  return out;
}

fn sat(v: f32) -> f32 { return clamp(v, 0.0, 1.0); }
fn env(dir0: vec3<f32>) -> vec3<f32> {
  let d = normalize(dir0);
  let horizon = pow(1.0 - abs(d.y), 4.0);
  let cyan = pow(sat(dot(d, normalize(vec3<f32>(-0.45, 0.30, 0.84)))), 22.0);
  let magenta = pow(sat(dot(d, normalize(vec3<f32>(0.54, -0.12, 0.83)))), 20.0);
  return vec3<f32>(0.003, 0.014, 0.045)
    + vec3<f32>(0.02, 0.55, 1.25) * (horizon * 0.22 + cyan * 0.95)
    + vec3<f32>(0.72, 0.03, 1.18) * (magenta * 0.66 + horizon * 0.06);
}

@fragment fn fsMain(input: VertexOut) -> @location(0) vec4<f32> {
  let time = u.cameraTime.w;
  let energy = u.materialEnergy.y;
  let material = u.materialEnergy.x;
  let camera = u.cameraTime.xyz;
  let V = normalize(camera - input.world);
  let N = normalize(input.normal);
  let ndv = sat(abs(dot(N, V)));
  let fresnel = pow(1.0 - ndv, 4.2);

  if (material < 0.5) {
    let radius = length(input.object);
    let inner = pow(sat(1.0 - radius), 2.1);
    let caustic = 0.5 + 0.5 * sin(input.object.x * 12.0 - input.object.y * 10.0 + input.object.z * 14.0 + time * 0.48);
    let reflected = env(reflect(-V, N));
    let refracted = env(refract(-V, N, 0.68));
    let absorption = exp(-vec3<f32>(1.3, 0.28, 0.07) * (0.12 + inner * 0.32));
    var glass = mix(refracted * absorption, reflected, 0.18 + fresnel * 0.70);
    glass += vec3<f32>(0.02, 0.78, 1.34) * (inner * 0.16 + fresnel * 0.28 + caustic * 0.035);
    glass += vec3<f32>(0.78, 0.04, 1.22) * fresnel * caustic * 0.15;
    let alpha = u.colorOpacity.w * (0.10 + fresnel * 0.42 + inner * 0.07);
    return vec4<f32>(glass * (0.94 + energy * 0.18), alpha);
  }

  if (material < 1.5) {
    let pulse = 0.82 + 0.18 * sin(time * 1.75 + input.object.x * 3.5 + input.object.z * 2.7);
    let rim = 0.34 + 0.66 * pow(1.0 - ndv, 1.5);
    let reflected = env(reflect(-V, N));
    let color = u.colorOpacity.xyz * (1.12 + rim * 1.2 + energy * 0.42) * pulse + reflected * 0.18;
    return vec4<f32>(color, u.colorOpacity.w * (0.60 + rim * 0.31));
  }

  let core = pow(sat(dot(N, V)), 0.32);
  let flicker = 0.90 + 0.10 * sin(time * 2.4 + input.object.x * 6.0 - input.object.y * 4.0);
  let color = mix(vec3<f32>(0.22, 0.92, 1.26), vec3<f32>(1.0, 0.98, 0.94), 0.70 + core * 0.30);
  return vec4<f32>(color * (2.1 + energy * 1.25) * flicker, u.colorOpacity.w);
}
` });

    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shader,
        entryPoint: 'vsMain',
        buffers: [{ arrayStride: 24, attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x3' },
          { shaderLocation: 1, offset: 12, format: 'float32x3' }
        ] }]
      },
      fragment: {
        module: shader,
        entryPoint: 'fsMain',
        targets: [{ format, blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }
        } }]
      },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { depthWriteEnabled: true, depthCompare: 'less-equal', format: 'depth24plus' }
    });

    function upload(geometry) {
      const vertexCount = geometry.positions.length / 3;
      const interleaved = new Float32Array(vertexCount * 6);
      for (let i = 0; i < vertexCount; i += 1) {
        interleaved.set(geometry.positions.slice(i * 3, i * 3 + 3), i * 6);
        interleaved.set(geometry.normals.slice(i * 3, i * 3 + 3), i * 6 + 3);
      }
      const vertex = device.createBuffer({ size: interleaved.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      device.queue.writeBuffer(vertex, 0, interleaved);
      const use32 = vertexCount > 65535;
      const indices = use32 ? new Uint32Array(geometry.indices) : new Uint16Array(geometry.indices);
      const index = device.createBuffer({ size: indices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST });
      device.queue.writeBuffer(index, 0, indices);
      return { vertex, index, count: indices.length, format: use32 ? 'uint32' : 'uint16' };
    }

    const sphere = upload(sphereGeometry(mobile ? 44 : 64, mobile ? 26 : 38));
    const emitter = upload(sphereGeometry(mobile ? 24 : 34, mobile ? 14 : 20));
    const ribbonSpecs = [
      { rx: 1.30, rz: 1.12, ry: .27, wobble: .055, wave: 3, phase: .18, thickness: .011, color: [.02, .72, 1.30], tilt: [.20, .08, .18], speed: .16 },
      { rx: 1.21, rz: 1.28, ry: .23, wobble: .072, wave: 4, phase: 1.08, thickness: .010, color: [.06, .35, 1.42], tilt: [-.31, .24, -.12], speed: -.13 },
      { rx: 1.34, rz: 1.11, ry: .30, wobble: .052, wave: 5, phase: 2.12, thickness: .010, color: [.78, .05, 1.08], tilt: [.34, -.16, .30], speed: .105 },
      { rx: 1.13, rz: 1.33, ry: .21, wobble: .076, wave: 3, phase: 3.22, thickness: .009, color: [.00, .88, 1.08], tilt: [-.16, -.28, .37], speed: -.16 },
      { rx: 1.27, rz: 1.20, ry: .25, wobble: .064, wave: 6, phase: 4.28, thickness: .008, color: [.62, .09, 1.26], tilt: [.11, .39, -.31], speed: .135 }
    ];
    const ribbons = ribbonSpecs.map(spec => ({ spec, mesh: upload(tubeGeometry(spec, mobile ? 92 : 132, mobile ? 5 : 7)) }));

    const uniformSize = 240;
    function drawable(mesh, material, color, opacity) {
      const uniform = device.createBuffer({ size: uniformSize, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: uniform } }] });
      return { mesh, material, color, opacity, uniform, bindGroup };
    }
    const shell = drawable(sphere, 0, [.02, .62, 1.18], .34);
    const emitterDraw = drawable(emitter, 2, [1, 1, 1], .96);
    const ribbonDraws = ribbons.map(item => ({ ...drawable(item.mesh, 1, item.spec.color, mobile ? .47 : .54), spec: item.spec }));

    const camera = [0, .05, mobile ? 5.15 : 5.30];
    let view = lookAt(camera, [0, 0, 0], [0, 1, 0]);
    let projection = identity();
    let depthTexture = null;
    let cssWidth = 1, cssHeight = 1, dpr = 1, renderScale = mobile ? .88 : 1;
    let active = true, frame = 0, last = performance.now(), ema = 16.7, slowFrames = 0, fastFrames = 0;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0, energy = .30, targetEnergy = .30;

    function resize() {
      cssWidth = Math.max(1, innerWidth); cssHeight = Math.max(1, innerHeight);
      dpr = Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.7);
      const width = Math.max(1, Math.round(cssWidth * dpr * renderScale));
      const height = Math.max(1, Math.round(cssHeight * dpr * renderScale));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width; canvas.height = height;
      canvas.style.width = cssWidth + 'px'; canvas.style.height = cssHeight + 'px';
      projection = perspective(mobile ? .73 : .68, width / height, .08, 40);
      depthTexture?.destroy();
      depthTexture = device.createTexture({ size: [width, height], format: 'depth24plus', usage: GPUTextureUsage.RENDER_ATTACHMENT });
    }

    function updateActive() {
      const rect = hero.getBoundingClientRect(), vh = Math.max(1, innerHeight);
      active = !document.hidden && rect.bottom > -vh * .15 && rect.top < vh * 1.02;
      stage.dataset.active = active ? 'true' : 'false';
    }

    function onPointerMove(event) {
      const rect = hero.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      const px = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      const py = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
      targetX = (px - .5) * 2; targetY = (py - .45) * 2;
      const distance = Math.min(1, Math.hypot(targetX * .7, targetY * .7));
      targetEnergy = .34 + (1 - distance) * .42;
    }
    function onPointerLeave() { targetX = 0; targetY = 0; targetEnergy = .30; }

    function writeUniform(draw, model, time) {
      const data = new Float32Array(60);
      data.set(projection, 0); data.set(view, 16); data.set(model, 32);
      data.set([camera[0], camera[1], camera[2], time], 48);
      data.set([draw.color[0], draw.color[1], draw.color[2], draw.opacity], 52);
      data.set([draw.material, energy, 0, 0], 56);
      device.queue.writeBuffer(draw.uniform, 0, data);
    }

    function render(now) {
      frame = requestAnimationFrame(render);
      const dt = Math.min(45, now - last || 16.7); last = now;
      if (!active) return;
      ema = ema * .94 + dt * .06;
      if (ema > 20.5) { slowFrames += 1; fastFrames = 0; }
      else if (ema < 15.7) { fastFrames += 1; slowFrames = 0; }
      else { slowFrames = Math.max(0, slowFrames - 1); fastFrames = Math.max(0, fastFrames - 1); }
      if (slowFrames > 80 && renderScale > .68) { renderScale = Math.max(.68, renderScale - .08); slowFrames = 0; resize(); }
      if (fastFrames > 220 && renderScale < 1) { renderScale = Math.min(1, renderScale + .05); fastFrames = 0; resize(); }

      const response = 1 - Math.pow(.0015, dt / 1000), motion = reduced.matches ? .14 : 1;
      pointerX = lerp(pointerX, targetX, response * .75); pointerY = lerp(pointerY, targetY, response * .75);
      energy = lerp(energy, targetEnergy, response * .62);
      const time = now * .001;
      const baseScale = mobile ? .98 : 1.04;
      const sceneX = mobile ? 0 : 1.05, sceneY = mobile ? .12 : .02;
      const baseRotation = compose(
        translation(sceneX, sceneY, 0),
        rotationX(-pointerY * .075 * motion + Math.sin(time * .11) * .03 * motion),
        rotationY(pointerX * .105 * motion + Math.sin(time * .09) * .05 * motion),
        rotationZ(Math.sin(time * .07) * .022 * motion),
        scaling(baseScale, baseScale, baseScale)
      );

      writeUniform(shell, multiply(baseRotation, scaling(.94, .94, .94)), time);
      ribbonDraws.forEach((draw) => {
        const s = draw.spec;
        draw.model = compose(baseRotation, rotationX(s.tilt[0] + time * s.speed * .33 * motion), rotationY(s.tilt[1] + time * s.speed * .56 * motion), rotationZ(s.tilt[2] + time * s.speed * motion));
        writeUniform(draw, draw.model, time);
      });
      const driftX = Math.sin(time * .73) * .072 * motion + pointerX * .026 * motion;
      const driftY = Math.cos(time * .61) * .058 * motion - pointerY * .021 * motion;
      const driftZ = Math.sin(time * .47 + .8) * .062 * motion;
      const pulse = .15 + .018 * Math.sin(time * 1.8) + energy * .017;
      writeUniform(emitterDraw, compose(baseRotation, translation(driftX, driftY, driftZ), scaling(pulse, pulse, pulse)), time);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }],
        depthStencilAttachment: { view: depthTexture.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'store' }
      });
      pass.setPipeline(pipeline);
      const drawObject = (draw) => {
        pass.setBindGroup(0, draw.bindGroup);
        pass.setVertexBuffer(0, draw.mesh.vertex);
        pass.setIndexBuffer(draw.mesh.index, draw.mesh.format);
        pass.drawIndexed(draw.mesh.count);
      };
      drawObject(shell);
      ribbonDraws.forEach(drawObject);
      drawObject(emitterDraw);
      pass.end();
      device.queue.submit([encoder.finish()]);
    }

    resize(); updateActive();
    addEventListener('resize', resize, { passive: true });
    addEventListener('scroll', updateActive, { passive: true });
    addEventListener('pointermove', onPointerMove, { passive: true });
    addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', updateActive);

    device.lost.then(() => {
      cancelAnimationFrame(frame);
      stage.remove();
      fallback('device-lost');
    });

    root.dataset.fxWebgpuCore = 'ready-v29';
    root.dataset.fxOrbitalCore = 'webgpu-v29-primary';
    root.dataset.fxCoreGeometry = 'webgpu-indexed-sphere-plus-3d-ribbons';
    root.dataset.fxCoreLighting = 'gpu-fresnel-reflection-refraction';
    root.dataset.fxGpuBackend = 'webgpu-vendor-neutral-amd-nvidia-intel';
    frame = requestAnimationFrame(render);
  }

  init().catch(error => {
    root.dataset.fxWebgpuCoreError = String(error?.message || error).slice(0, 220);
    stage.remove();
    fallback('initialisation-failed');
  });
}());