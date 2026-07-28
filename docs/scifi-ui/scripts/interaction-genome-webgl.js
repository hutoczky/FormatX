(function () {
  'use strict';

  if (window.FormatXGenomeRenderer3D) return;

  const VERSION = 'interaction-genome-webgl2-adaptive-4k-v2';
  const COLORS = {
    init: [0.46, 0.88, 1],
    scroll: [0.36, 0.78, 1],
    scene: [0.66, 0.43, 1],
    click: [1, 0.34, 0.72],
    language: [0.46, 0.94, 0.72],
    audio: [1, 0.72, 0.28],
    loop: [0.78, 0.52, 1],
    restore: [0.96, 0.99, 1]
  };

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  function identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  function multiply(output, left, right) {
    for (let column = 0; column < 4; column += 1) {
      const index = column * 4;
      const b0 = right[index];
      const b1 = right[index + 1];
      const b2 = right[index + 2];
      const b3 = right[index + 3];
      output[index] = left[0] * b0 + left[4] * b1 + left[8] * b2 + left[12] * b3;
      output[index + 1] = left[1] * b0 + left[5] * b1 + left[9] * b2 + left[13] * b3;
      output[index + 2] = left[2] * b0 + left[6] * b1 + left[10] * b2 + left[14] * b3;
      output[index + 3] = left[3] * b0 + left[7] * b1 + left[11] * b2 + left[15] * b3;
    }
    return output;
  }

  function perspective(output, fieldOfView, aspect, near, far) {
    const scale = 1 / Math.tan(fieldOfView / 2);
    output.fill(0);
    output[0] = scale / aspect;
    output[5] = scale;
    output[10] = (far + near) / (near - far);
    output[11] = -1;
    output[14] = 2 * far * near / (near - far);
    return output;
  }

  function lookAt(output, eye, target, up) {
    let zx = eye[0] - target[0];
    let zy = eye[1] - target[1];
    let zz = eye[2] - target[2];
    let length = Math.hypot(zx, zy, zz) || 1;
    zx /= length;
    zy /= length;
    zz /= length;

    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;
    length = Math.hypot(xx, xy, xz) || 1;
    xx /= length;
    xy /= length;
    xz /= length;

    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;

    output[0] = xx;
    output[1] = yx;
    output[2] = zx;
    output[3] = 0;
    output[4] = xy;
    output[5] = yy;
    output[6] = zy;
    output[7] = 0;
    output[8] = xz;
    output[9] = yz;
    output[10] = zz;
    output[11] = 0;
    output[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    output[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    output[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    output[15] = 1;
    return output;
  }

  function project(point, matrix, width, height) {
    const x = point[0];
    const y = point[1];
    const z = point[2];
    const clipX = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
    const clipY = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
    const clipW = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
    if (clipW <= 0.01) return null;
    return {
      x: (clipX / clipW * 0.5 + 0.5) * width,
      y: (1 - (clipY / clipW * 0.5 + 0.5)) * height,
      depth: clipW
    };
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Shader compilation failed';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'Program linking failed';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function physicalViewportWidth() {
    return Math.max(innerWidth * (devicePixelRatio || 1), screen.width * (devicePixelRatio || 1));
  }

  function chooseProfile(options) {
    const reducedMotion = Boolean(options.reducedMotion);
    const mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 720;
    const fourK = physicalViewportWidth() >= 3400;
    const memory = Number(navigator.deviceMemory || 8);
    const cores = Number(navigator.hardwareConcurrency || 8);
    const constrained = memory <= 4 || cores <= 4;

    if (reducedMotion) {
      return {
        name: fourK ? '4k-reduced' : 'reduced',
        fourK,
        targetFps: 12,
        maxDpr: fourK ? 1.1 : 1.35,
        maxPixels: fourK ? 2200000 : 1600000,
        particles: 150,
        lowPower: true
      };
    }

    if (mobile) {
      return {
        name: 'mobile-balanced',
        fourK: false,
        targetFps: 30,
        maxDpr: constrained ? 1.25 : 1.5,
        maxPixels: constrained ? 900000 : 1250000,
        particles: constrained ? 140 : 190,
        lowPower: true
      };
    }

    if (fourK) {
      return {
        name: constrained ? '4k-efficient' : '4k-balanced',
        fourK: true,
        targetFps: constrained ? 24 : 30,
        maxDpr: constrained ? 1 : 1.25,
        maxPixels: constrained ? 2100000 : 2800000,
        particles: constrained ? 190 : 260,
        lowPower: true
      };
    }

    return {
      name: constrained ? 'desktop-efficient' : 'desktop-quality',
      fourK: false,
      targetFps: constrained ? 30 : 45,
      maxDpr: constrained ? 1.25 : 1.6,
      maxPixels: constrained ? 1600000 : 2600000,
      particles: constrained ? 210 : 340,
      lowPower: constrained
    };
  }

  function loadStyle() {
    if (document.querySelector('link[data-fx-genome-webgl-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/interaction-genome-webgl.css?v=20260728-genome-webgl-4k-v2';
    link.dataset.fxGenomeWebglStyle = 'true';
    document.head.appendChild(link);
  }

  function create(canvas, options) {
    const profile = chooseProfile(options || {});
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: true,
      premultipliedAlpha: true,
      powerPreference: profile.lowPower ? 'low-power' : 'default',
      preserveDrawingBuffer: false
    });
    if (!gl) return null;

    const nodeProgram = createProgram(gl, `#version 300 es
      layout(location=0) in vec3 position;
      layout(location=1) in vec3 color;
      layout(location=2) in float size;
      layout(location=3) in float selected;
      uniform mat4 viewProjection;
      uniform float pixelRatio;
      out vec3 nodeColor;
      out float nodeSelected;
      void main() {
        vec4 projected = viewProjection * vec4(position, 1.0);
        gl_Position = projected;
        gl_PointSize = size * pixelRatio * clamp(9.0 / projected.w, 0.58, 2.3);
        nodeColor = color;
        nodeSelected = selected;
      }`, `#version 300 es
      precision highp float;
      in vec3 nodeColor;
      in float nodeSelected;
      out vec4 outputColor;
      void main() {
        vec2 point = gl_PointCoord * 2.0 - 1.0;
        float radius = dot(point, point);
        if (radius > 1.0) discard;
        float z = sqrt(max(0.0, 1.0 - radius));
        vec3 normal = normalize(vec3(point, z));
        vec3 light = normalize(vec3(-0.35, 0.65, 0.7));
        float diffuse = 0.16 + max(dot(normal, light), 0.0) * 0.74;
        float specular = pow(max(dot(reflect(-light, normal), vec3(0.0, 0.0, 1.0)), 0.0), 48.0);
        float rim = pow(1.0 - z, 3.0);
        vec3 color = nodeColor * diffuse
          + vec3(0.85, 0.95, 1.0) * specular * 0.72
          + mix(nodeColor, vec3(0.7, 0.92, 1.0), 0.55) * rim * (0.45 + nodeSelected * 0.8);
        float alpha = smoothstep(1.0, 0.72, radius) * (0.82 + nodeSelected * 0.18);
        outputColor = vec4(color, alpha);
      }`);

    const lineProgram = createProgram(gl, `#version 300 es
      layout(location=0) in vec3 position;
      layout(location=1) in vec3 color;
      uniform mat4 viewProjection;
      out vec3 lineColor;
      void main() {
        gl_Position = viewProjection * vec4(position, 1.0);
        lineColor = color;
      }`, `#version 300 es
      precision highp float;
      in vec3 lineColor;
      uniform float alpha;
      out vec4 outputColor;
      void main() { outputColor = vec4(lineColor, alpha); }`);

    const particleProgram = createProgram(gl, `#version 300 es
      layout(location=0) in vec4 particle;
      uniform mat4 viewProjection;
      uniform float time;
      uniform float pixelRatio;
      out float particleAlpha;
      void main() {
        vec3 position = particle.xyz;
        position.y = mod(position.y + time * (0.08 + fract(particle.w * 7.0) * 0.12) + 5.0, 10.0) - 5.0;
        position.x += sin(time * 0.23 + particle.w * 19.0 + position.y) * 0.16;
        position.z += cos(time * 0.19 + particle.w * 13.0 + position.y) * 0.16;
        vec4 projected = viewProjection * vec4(position, 1.0);
        gl_Position = projected;
        gl_PointSize = (1.8 + fract(particle.w * 17.0) * 3.0) * pixelRatio * clamp(8.0 / projected.w, 0.5, 2.0);
        particleAlpha = 0.15 + fract(particle.w * 5.0) * 0.4;
      }`, `#version 300 es
      precision mediump float;
      in float particleAlpha;
      out vec4 outputColor;
      void main() {
        vec2 point = gl_PointCoord * 2.0 - 1.0;
        float radius = dot(point, point);
        if (radius > 1.0) discard;
        outputColor = vec4(0.42, 0.86, 1.0, pow(1.0 - radius, 2.0) * particleAlpha);
      }`);

    const nodeVao = gl.createVertexArray();
    const nodeBuffer = gl.createBuffer();
    gl.bindVertexArray(nodeVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
    for (let index = 0; index < 4; index += 1) gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 32, 24);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 32, 28);

    const lineVao = gl.createVertexArray();
    const lineBuffer = gl.createBuffer();
    gl.bindVertexArray(lineVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);

    let seed = 0x51a27;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const particleData = new Float32Array(profile.particles * 4);
    for (let index = 0; index < profile.particles; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 2.4 + random() * 4;
      particleData[index * 4] = Math.cos(angle) * radius;
      particleData[index * 4 + 1] = random() * 10 - 5;
      particleData[index * 4 + 2] = Math.sin(angle) * radius;
      particleData[index * 4 + 3] = random();
    }

    const particleVao = gl.createVertexArray();
    const particleBuffer = gl.createBuffer();
    gl.bindVertexArray(particleVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
    gl.bindVertexArray(null);

    const uniforms = {
      node: {
        matrix: gl.getUniformLocation(nodeProgram, 'viewProjection'),
        pixelRatio: gl.getUniformLocation(nodeProgram, 'pixelRatio')
      },
      line: {
        matrix: gl.getUniformLocation(lineProgram, 'viewProjection'),
        alpha: gl.getUniformLocation(lineProgram, 'alpha')
      },
      particle: {
        matrix: gl.getUniformLocation(particleProgram, 'viewProjection'),
        time: gl.getUniformLocation(particleProgram, 'time'),
        pixelRatio: gl.getUniformLocation(particleProgram, 'pixelRatio')
      }
    };

    const runtime = {
      items: [],
      selected: -1,
      width: 1,
      height: 1,
      effectiveDpr: 1,
      resolutionScale: 1,
      backingPixels: 1,
      pointerX: 0.5,
      pointerY: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      dragging: false,
      dragX: 0,
      dragY: 0,
      orbit: 0,
      pitch: 0,
      hits: [],
      hover: -1,
      reduced: Boolean(options.reducedMotion),
      lost: false,
      frames: 0,
      resizeCount: 0,
      lineArray: new Float32Array(0),
      nodeArray: new Float32Array(0)
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0, 0, 0, 0);

    function resize() {
      const rectangle = canvas.getBoundingClientRect();
      const width = Math.max(1, rectangle.width);
      const height = Math.max(1, rectangle.height);
      const rawDpr = Math.min(profile.maxDpr, devicePixelRatio || 1);
      const desiredPixels = width * height * rawDpr * rawDpr;
      const resolutionScale = Math.min(1, Math.sqrt(profile.maxPixels / Math.max(1, desiredPixels)));
      const effectiveDpr = Math.max(0.72, rawDpr * resolutionScale);
      const backingWidth = Math.max(1, Math.round(width * effectiveDpr));
      const backingHeight = Math.max(1, Math.round(height * effectiveDpr));

      runtime.width = width;
      runtime.height = height;
      runtime.effectiveDpr = effectiveDpr;
      runtime.resolutionScale = resolutionScale;
      runtime.backingPixels = backingWidth * backingHeight;

      if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
        runtime.resizeCount += 1;
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      return runtime.backingPixels;
    }

    function makePoints(now) {
      const count = Math.max(1, runtime.items.length);
      const rotation = runtime.reduced ? 0.28 : now * 0.00012;
      const points = [];
      for (let index = 0; index < count; index += 1) {
        const ratio = count === 1 ? 0.5 : index / (count - 1);
        const y = 4.15 - ratio * 8.3;
        const angle = rotation + index * 0.82;
        const radius = 1.64 + Math.sin(index * 0.53) * 0.06;
        points.push({
          first: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
          second: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius],
          item: runtime.items[index] || { type: 'init' },
          index
        });
      }
      return points;
    }

    function ensureArrays(pointCount) {
      const requiredLines = (pointCount * 2 + pointCount * 2) * 6;
      const requiredNodes = pointCount * 2 * 8;
      if (runtime.lineArray.length !== requiredLines) runtime.lineArray = new Float32Array(requiredLines);
      if (runtime.nodeArray.length !== requiredNodes) runtime.nodeArray = new Float32Array(requiredNodes);
    }

    function render(now) {
      if (runtime.lost) return false;

      runtime.pointerX += (runtime.targetX - runtime.pointerX) * 0.06;
      runtime.pointerY += (runtime.targetY - runtime.pointerY) * 0.06;

      const time = runtime.reduced ? 0 : now * 0.001;
      const cameraOrbit = (runtime.reduced ? 0.36 : time * 0.055) + (runtime.pointerX - 0.5) * 0.9 + runtime.orbit;
      const cameraElevation = 0.35 + (0.5 - runtime.pointerY) * 0.7 + runtime.pitch;
      const eye = [Math.sin(cameraOrbit) * 8.6, cameraElevation * 2.6, Math.cos(cameraOrbit) * 8.6];
      const projection = identity();
      const view = identity();
      const viewProjection = identity();
      perspective(projection, Math.PI / 4.1, runtime.width / runtime.height, 0.12, 40);
      lookAt(view, eye, [0, 0, 0], [0, 1, 0]);
      multiply(viewProjection, projection, view);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(particleProgram);
      gl.uniformMatrix4fv(uniforms.particle.matrix, false, viewProjection);
      gl.uniform1f(uniforms.particle.time, time);
      gl.uniform1f(uniforms.particle.pixelRatio, runtime.effectiveDpr);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);
      gl.bindVertexArray(particleVao);
      gl.drawArrays(gl.POINTS, 0, profile.particles);
      gl.depthMask(true);

      const points = makePoints(now);
      ensureArrays(points.length);
      let lineOffset = 0;
      for (let strand = 0; strand < 2; strand += 1) {
        for (const point of points) {
          const position = strand ? point.second : point.first;
          const color = strand ? [0.46, 0.25, 0.82] : [0.15, 0.62, 0.82];
          runtime.lineArray.set([...position, ...color], lineOffset);
          lineOffset += 6;
        }
      }
      for (const point of points) {
        const color = COLORS[point.item.type] || COLORS.scroll;
        runtime.lineArray.set([...point.first, ...color, ...point.second, ...color], lineOffset);
        lineOffset += 12;
      }

      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(uniforms.line.matrix, false, viewProjection);
      gl.uniform1f(uniforms.line.alpha, 0.52);
      gl.bindVertexArray(lineVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, runtime.lineArray, gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.LINE_STRIP, 0, points.length);
      gl.drawArrays(gl.LINE_STRIP, points.length, points.length);
      for (let index = 0; index < points.length; index += 1) {
        gl.drawArrays(gl.LINES, points.length * 2 + index * 2, 2);
      }

      runtime.hits = [];
      let nodeOffset = 0;
      for (const point of points) {
        const color = COLORS[point.item.type] || COLORS.scroll;
        const selected = point.index === runtime.selected;
        const hovered = point.index === runtime.hover;
        const size = selected ? 27 : hovered ? 23 : 18;
        runtime.nodeArray.set([...point.first, ...color, size, selected ? 1 : 0], nodeOffset);
        nodeOffset += 8;
        runtime.nodeArray.set([...point.second, ...color, size, selected ? 1 : 0], nodeOffset);
        nodeOffset += 8;

        for (const position of [point.first, point.second]) {
          const hit = project(position, viewProjection, runtime.width, runtime.height);
          if (hit) runtime.hits.push({ x: hit.x, y: hit.y, radius: selected ? 26 : 20, index: point.index, depth: hit.depth });
        }
      }

      gl.useProgram(nodeProgram);
      gl.uniformMatrix4fv(uniforms.node.matrix, false, viewProjection);
      gl.uniform1f(uniforms.node.pixelRatio, runtime.effectiveDpr);
      gl.bindVertexArray(nodeVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, runtime.nodeArray, gl.DYNAMIC_DRAW);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, runtime.nodeArray.length / 8);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(null);

      runtime.frames += 1;
      return true;
    }

    function pointerMove(x, y, event) {
      runtime.targetX = clamp(x / runtime.width, 0, 1);
      runtime.targetY = clamp(y / runtime.height, 0, 1);
      if (runtime.dragging && event) {
        runtime.orbit += (event.clientX - runtime.dragX) * 0.006;
        runtime.pitch = clamp(runtime.pitch - (event.clientY - runtime.dragY) * 0.0035, -0.55, 0.55);
        runtime.dragX = event.clientX;
        runtime.dragY = event.clientY;
      }

      let best = -1;
      let distance = Infinity;
      for (const hit of runtime.hits) {
        const current = Math.hypot(hit.x - x, hit.y - y);
        if (current < hit.radius && current < distance) {
          best = hit.index;
          distance = current;
        }
      }
      runtime.hover = best;
      canvas.style.cursor = runtime.dragging ? 'grabbing' : best >= 0 ? 'pointer' : 'grab';
      return best;
    }

    canvas.addEventListener('pointerdown', event => {
      runtime.dragging = true;
      runtime.dragX = event.clientX;
      runtime.dragY = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('pointerup', event => {
      runtime.dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('pointercancel', event => {
      runtime.dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      runtime.lost = true;
      document.documentElement.dataset.fxInteractionGenomeRenderer = 'context-lost';
    });

    resize();

    return {
      kind: 'webgl2-pbr-4k-adaptive',
      profile,
      setData(items, selected) {
        runtime.items = Array.isArray(items) ? items : [];
        runtime.selected = Number.isInteger(selected) ? selected : -1;
      },
      resize,
      render,
      pointerMove,
      pointerLeave() {
        runtime.hover = -1;
        runtime.targetX = 0.5;
        runtime.targetY = 0.5;
      },
      click() {
        if (runtime.hover >= 0) options.onSelect?.(runtime.hover);
      },
      destroy() {
        [nodeProgram, lineProgram, particleProgram].forEach(program => gl.deleteProgram(program));
        [nodeBuffer, lineBuffer, particleBuffer].forEach(buffer => gl.deleteBuffer(buffer));
        [nodeVao, lineVao, particleVao].forEach(vao => gl.deleteVertexArray(vao));
      },
      getStatus() {
        const attributes = gl.getContextAttributes();
        return {
          version: VERSION,
          kind: 'webgl2-pbr-4k-adaptive',
          context: 'webgl2',
          antialias: Boolean(attributes?.antialias),
          depth: Boolean(attributes?.depth),
          quality: profile.name,
          fourK: profile.fourK,
          targetFps: profile.targetFps,
          effectiveDpr: Number(runtime.effectiveDpr.toFixed(3)),
          resolutionScale: Number(runtime.resolutionScale.toFixed(3)),
          maxPixels: profile.maxPixels,
          backingPixels: runtime.backingPixels,
          particles: profile.particles,
          nodes: runtime.items.length,
          selected: runtime.selected,
          frames: runtime.frames,
          resizeCount: runtime.resizeCount,
          contextLost: runtime.lost
        };
      }
    };
  }

  loadStyle();
  window.FormatXGenomeRenderer3D = Object.freeze({ version: VERSION, create });
}());