(function () {
  'use strict';

  if (window.FormatXGenomeRenderer3D) return;

  const VERSION = 'interaction-genome-cinematic-instanced-pbr-v3';
  const MAX_STATES = 48;
  const MAX_NODE_INSTANCES = MAX_STATES * 2;
  const MAX_TUBE_INSTANCES = (MAX_STATES - 1) * 2 + MAX_STATES;
  const NODE_STRIDE_FLOATS = 10;
  const TUBE_STRIDE_FLOATS = 12;
  const COLORS = {
    init: [0.46, 0.88, 1.0],
    scroll: [0.28, 0.72, 1.0],
    scene: [0.62, 0.38, 1.0],
    click: [1.0, 0.28, 0.68],
    language: [0.36, 0.95, 0.70],
    audio: [1.0, 0.68, 0.22],
    loop: [0.76, 0.45, 1.0],
    restore: [0.92, 0.98, 1.0]
  };

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const mix = (a, b, amount) => a + (b - a) * amount;

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

  function lookAt(output, eyeX, eyeY, eyeZ, targetY) {
    let zx = eyeX;
    let zy = eyeY - targetY;
    let zz = eyeZ;
    let length = Math.hypot(zx, zy, zz) || 1;
    zx /= length;
    zy /= length;
    zz /= length;

    let xx = zz;
    let xy = 0;
    let xz = -zx;
    length = Math.hypot(xx, xz) || 1;
    xx /= length;
    xz /= length;

    const yx = zy * xz;
    const yy = zz * xx - zx * xz;
    const yz = -zy * xx;

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
    output[12] = -(xx * eyeX + xz * eyeZ);
    output[13] = -(yx * eyeX + yy * eyeY + yz * eyeZ);
    output[14] = -(zx * eyeX + zy * eyeY + zz * eyeZ);
    output[15] = 1;
    return output;
  }

  function project(pointArray, offset, matrix, width, height) {
    const x = pointArray[offset];
    const y = pointArray[offset + 1];
    const z = pointArray[offset + 2];
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

  function createSphereGeometry(longitudes, latitudes) {
    const vertices = [];
    const indices = [];
    for (let latitude = 0; latitude <= latitudes; latitude += 1) {
      const v = latitude / latitudes;
      const theta = v * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let longitude = 0; longitude <= longitudes; longitude += 1) {
        const u = longitude / longitudes;
        const phi = u * Math.PI * 2;
        const x = Math.cos(phi) * sinTheta;
        const y = cosTheta;
        const z = Math.sin(phi) * sinTheta;
        vertices.push(x, y, z, x, y, z);
      }
    }
    const row = longitudes + 1;
    for (let latitude = 0; latitude < latitudes; latitude += 1) {
      for (let longitude = 0; longitude < longitudes; longitude += 1) {
        const first = latitude * row + longitude;
        const second = first + row;
        indices.push(first, second, first + 1, second, second + 1, first + 1);
      }
    }
    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
      triangles: indices.length / 3
    };
  }

  function createCylinderGeometry(radialSegments) {
    const vertices = [];
    const indices = [];
    for (let ring = 0; ring < 2; ring += 1) {
      const y = ring ? 0.5 : -0.5;
      for (let segment = 0; segment <= radialSegments; segment += 1) {
        const angle = segment / radialSegments * Math.PI * 2;
        const x = Math.cos(angle);
        const z = Math.sin(angle);
        vertices.push(x, y, z, x, 0, z);
      }
    }
    const row = radialSegments + 1;
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const a = segment;
      const b = segment + row;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
      triangles: indices.length / 3
    };
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
        name: fourK ? 'cinematic-4k-reduced' : 'cinematic-reduced',
        fourK,
        targetFps: 12,
        maxDpr: fourK ? 1.05 : 1.25,
        maxPixels: fourK ? 2400000 : 1700000,
        particles: 80,
        bloomScale: 0.25,
        blurPasses: 1,
        sphereSegments: 18,
        sphereRings: 12,
        tubeSegments: 10,
        autoOrbit: false,
        lowPower: true
      };
    }

    if (mobile) {
      return {
        name: constrained ? 'cinematic-mobile-efficient' : 'cinematic-mobile',
        fourK: false,
        targetFps: constrained ? 30 : 45,
        maxDpr: constrained ? 1.2 : 1.45,
        maxPixels: constrained ? 850000 : 1250000,
        particles: constrained ? 90 : 125,
        bloomScale: 0.27,
        blurPasses: 1,
        sphereSegments: constrained ? 16 : 20,
        sphereRings: constrained ? 10 : 13,
        tubeSegments: 10,
        autoOrbit: true,
        lowPower: true
      };
    }

    if (fourK) {
      return {
        name: constrained ? 'cinematic-4k-efficient' : 'cinematic-4k',
        fourK: true,
        targetFps: constrained ? 24 : 30,
        maxDpr: constrained ? 0.95 : 1.08,
        maxPixels: constrained ? 2400000 : 3400000,
        particles: constrained ? 110 : 160,
        bloomScale: 0.3,
        blurPasses: constrained ? 1 : 2,
        sphereSegments: constrained ? 20 : 26,
        sphereRings: constrained ? 14 : 18,
        tubeSegments: 12,
        autoOrbit: true,
        lowPower: constrained
      };
    }

    return {
      name: constrained ? 'cinematic-desktop-efficient' : 'cinematic-desktop-ultra',
      fourK: false,
      targetFps: constrained ? 45 : 60,
      maxDpr: constrained ? 1.3 : 1.75,
      maxPixels: constrained ? 1800000 : 3200000,
      particles: constrained ? 130 : 190,
      bloomScale: constrained ? 0.28 : 0.36,
      blurPasses: constrained ? 1 : 2,
      sphereSegments: constrained ? 20 : 28,
      sphereRings: constrained ? 14 : 20,
      tubeSegments: constrained ? 10 : 14,
      autoOrbit: true,
      lowPower: constrained
    };
  }

  function loadStyle() {
    if (document.querySelector('link[data-fx-genome-webgl-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './styles/interaction-genome-webgl.css?v=20260728-genome-cinematic-v3';
    link.dataset.fxGenomeWebglStyle = 'true';
    document.head.appendChild(link);
  }

  function createColorTarget(gl, width, height, withDepth) {
    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    let depth = null;
    if (withDepth) {
      depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.deleteTexture(texture);
      if (depth) gl.deleteRenderbuffer(depth);
      gl.deleteFramebuffer(framebuffer);
      throw new Error('FormatX cinematic framebuffer is incomplete');
    }
    return { framebuffer, texture, depth, width, height };
  }

  function destroyTarget(gl, target) {
    if (!target) return;
    gl.deleteTexture(target.texture);
    if (target.depth) gl.deleteRenderbuffer(target.depth);
    gl.deleteFramebuffer(target.framebuffer);
  }

  function create(canvas, options) {
    const profile = chooseProfile(options || {});
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: true,
      premultipliedAlpha: true,
      powerPreference: profile.lowPower ? 'low-power' : 'high-performance',
      preserveDrawingBuffer: false
    });
    if (!gl) return null;

    const fullscreenVertex = `#version 300 es
      precision highp float;
      out vec2 uv;
      void main() {
        vec2 position = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
        uv = position;
        gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
      }`;

    const backgroundProgram = createProgram(gl, fullscreenVertex, `#version 300 es
      precision highp float;
      in vec2 uv;
      uniform vec2 resolution;
      uniform vec2 pointer;
      uniform float time;
      out vec4 outputColor;
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      void main() {
        vec2 p = uv * 2.0 - 1.0;
        p.x *= resolution.x / max(1.0, resolution.y);
        vec2 drift = (pointer - 0.5) * 0.18;
        float radial = length(p - drift);
        float bandA = exp(-abs(p.y + sin(p.x * 1.35 + time * 0.08) * 0.16) * 5.8);
        float bandB = exp(-abs(p.y * 0.72 - cos(p.x * 1.7 - time * 0.06) * 0.19) * 7.2);
        float halo = exp(-radial * 1.45);
        vec3 base = mix(vec3(0.004, 0.009, 0.018), vec3(0.012, 0.026, 0.052), halo);
        base += vec3(0.015, 0.075, 0.11) * bandA * 0.42;
        base += vec3(0.065, 0.025, 0.11) * bandB * 0.34;
        vec2 starCell = floor((uv + vec2(time * 0.0009, 0.0)) * vec2(260.0, 150.0));
        float starSeed = hash(starCell);
        float star = smoothstep(0.994, 1.0, starSeed) * (0.25 + 0.75 * hash(starCell + 2.7));
        base += vec3(0.28, 0.64, 0.9) * star * (1.0 - smoothstep(0.25, 1.35, radial));
        float vignette = smoothstep(1.45, 0.28, radial);
        outputColor = vec4(base * (0.62 + vignette * 0.55), 1.0);
      }`);

    const sphereProgram = createProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec3 vertexPosition;
      layout(location=1) in vec3 vertexNormal;
      layout(location=2) in vec3 instancePosition;
      layout(location=3) in vec3 instanceColor;
      layout(location=4) in float instanceScale;
      layout(location=5) in vec2 instanceFlags;
      layout(location=6) in float instancePhase;
      uniform mat4 viewProjection;
      uniform vec3 cameraPosition;
      uniform float time;
      out vec3 worldPosition;
      out vec3 worldNormal;
      out vec3 baseColor;
      out vec2 flags;
      out vec3 viewDirection;
      void main() {
        float pulse = 1.0 + instanceFlags.x * (0.09 + sin(time * 2.2 + instancePhase) * 0.025)
          + instanceFlags.y * 0.045;
        vec3 local = vertexPosition * instanceScale * pulse;
        worldPosition = instancePosition + local;
        worldNormal = normalize(vertexNormal);
        baseColor = instanceColor;
        flags = instanceFlags;
        viewDirection = cameraPosition - worldPosition;
        gl_Position = viewProjection * vec4(worldPosition, 1.0);
      }`, `#version 300 es
      precision highp float;
      in vec3 worldPosition;
      in vec3 worldNormal;
      in vec3 baseColor;
      in vec2 flags;
      in vec3 viewDirection;
      uniform float time;
      out vec4 outputColor;
      const float PI = 3.14159265359;
      float distributionGGX(vec3 N, vec3 H, float roughness) {
        float a = roughness * roughness;
        float a2 = a * a;
        float nDotH = max(dot(N, H), 0.0);
        float denominator = nDotH * nDotH * (a2 - 1.0) + 1.0;
        return a2 / max(PI * denominator * denominator, 0.0001);
      }
      float geometrySchlick(float nDotV, float roughness) {
        float r = roughness + 1.0;
        float k = r * r / 8.0;
        return nDotV / max(nDotV * (1.0 - k) + k, 0.0001);
      }
      vec3 fresnelSchlick(float cosine, vec3 f0) {
        return f0 + (1.0 - f0) * pow(1.0 - cosine, 5.0);
      }
      vec3 evaluateLight(vec3 N, vec3 V, vec3 L, vec3 radiance, vec3 albedo, float metallic, float roughness) {
        vec3 H = normalize(V + L);
        float nDotL = max(dot(N, L), 0.0);
        float nDotV = max(dot(N, V), 0.0);
        float hDotV = max(dot(H, V), 0.0);
        vec3 f0 = mix(vec3(0.035), albedo, metallic);
        vec3 F = fresnelSchlick(hDotV, f0);
        float D = distributionGGX(N, H, roughness);
        float G = geometrySchlick(nDotV, roughness) * geometrySchlick(nDotL, roughness);
        vec3 specular = D * G * F / max(4.0 * nDotV * nDotL, 0.001);
        vec3 diffuse = (1.0 - F) * (1.0 - metallic) * albedo / PI;
        return (diffuse + specular) * radiance * nDotL;
      }
      void main() {
        vec3 N = normalize(worldNormal);
        vec3 V = normalize(viewDirection);
        float selected = flags.x;
        float hovered = flags.y;
        float metallic = 0.30 + selected * 0.12;
        float roughness = mix(0.24, 0.13, selected) - hovered * 0.025;
        vec3 keyLight = normalize(vec3(-0.48, 0.72, 0.56));
        vec3 rimLight = normalize(vec3(0.68, -0.18, -0.70));
        vec3 color = evaluateLight(N, V, keyLight, vec3(2.2, 2.55, 3.0), baseColor, metallic, roughness);
        color += evaluateLight(N, V, rimLight, vec3(0.85, 0.42, 1.25), baseColor, metallic, roughness * 1.25);
        float sky = N.y * 0.5 + 0.5;
        vec3 environment = mix(vec3(0.025, 0.04, 0.085), vec3(0.24, 0.48, 0.66), sky);
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        color += environment * baseColor * 0.22;
        color += mix(baseColor, vec3(0.68, 0.90, 1.0), 0.58) * fresnel * (0.42 + selected * 0.52);
        color += baseColor * (0.09 + selected * 0.48 + hovered * 0.22);
        float clearcoat = pow(max(dot(reflect(-keyLight, N), V), 0.0), 90.0);
        color += vec3(0.78, 0.92, 1.0) * clearcoat * (0.42 + selected * 0.38);
        outputColor = vec4(color, 1.0);
      }`);

    const coreProgram = createProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec3 vertexPosition;
      layout(location=2) in vec3 instancePosition;
      layout(location=3) in vec3 instanceColor;
      layout(location=4) in float instanceScale;
      layout(location=5) in vec2 instanceFlags;
      layout(location=6) in float instancePhase;
      uniform mat4 viewProjection;
      uniform float time;
      out vec3 glowColor;
      out float glowStrength;
      void main() {
        float pulse = 0.48 + instanceFlags.x * 0.12 + sin(time * 2.0 + instancePhase) * 0.025;
        vec3 position = instancePosition + vertexPosition * instanceScale * pulse;
        glowColor = instanceColor;
        glowStrength = 0.35 + instanceFlags.x * 1.35 + instanceFlags.y * 0.5;
        gl_Position = viewProjection * vec4(position, 1.0);
      }`, `#version 300 es
      precision highp float;
      in vec3 glowColor;
      in float glowStrength;
      out vec4 outputColor;
      void main() {
        outputColor = vec4(glowColor * glowStrength, 0.26 + glowStrength * 0.16);
      }`);

    const tubeProgram = createProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec3 vertexPosition;
      layout(location=1) in vec3 vertexNormal;
      layout(location=2) in vec3 instanceStart;
      layout(location=3) in vec3 instanceEnd;
      layout(location=4) in vec3 instanceColor;
      layout(location=5) in float instanceRadius;
      layout(location=6) in float instanceIntensity;
      layout(location=7) in float instancePhase;
      uniform mat4 viewProjection;
      uniform vec3 cameraPosition;
      uniform float time;
      out vec3 worldNormal;
      out vec3 tubeColor;
      out vec3 viewDirection;
      out float intensity;
      out float energy;
      void main() {
        vec3 axis = instanceEnd - instanceStart;
        float lengthAxis = max(length(axis), 0.0001);
        vec3 up = axis / lengthAxis;
        vec3 helper = abs(up.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 tangent = normalize(cross(helper, up));
        vec3 bitangent = cross(up, tangent);
        float pulse = 0.90 + 0.10 * sin(time * 2.4 + instancePhase);
        vec3 center = (instanceStart + instanceEnd) * 0.5;
        vec3 radial = tangent * vertexPosition.x + bitangent * vertexPosition.z;
        vec3 position = center + up * (vertexPosition.y * lengthAxis) + radial * instanceRadius * pulse;
        worldNormal = normalize(tangent * vertexNormal.x + bitangent * vertexNormal.z);
        tubeColor = instanceColor;
        viewDirection = cameraPosition - position;
        intensity = instanceIntensity;
        energy = 0.5 + 0.5 * sin(time * 2.0 + instancePhase + vertexPosition.y * 9.0);
        gl_Position = viewProjection * vec4(position, 1.0);
      }`, `#version 300 es
      precision highp float;
      in vec3 worldNormal;
      in vec3 tubeColor;
      in vec3 viewDirection;
      in float intensity;
      in float energy;
      out vec4 outputColor;
      void main() {
        vec3 N = normalize(worldNormal);
        vec3 V = normalize(viewDirection);
        vec3 L = normalize(vec3(-0.45, 0.78, 0.5));
        vec3 H = normalize(V + L);
        float diffuse = 0.18 + max(dot(N, L), 0.0) * 0.62;
        float specular = pow(max(dot(N, H), 0.0), 56.0);
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.6);
        vec3 color = tubeColor * diffuse * (0.72 + intensity * 0.42);
        color += vec3(0.72, 0.9, 1.0) * specular * 0.72;
        color += mix(tubeColor, vec3(0.55, 0.88, 1.0), 0.55) * fresnel * 0.48;
        color += tubeColor * energy * intensity * 0.14;
        outputColor = vec4(color, 0.92);
      }`);

    const particleProgram = createProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec4 particle;
      uniform mat4 viewProjection;
      uniform float time;
      uniform float pixelRatio;
      out float particleAlpha;
      void main() {
        vec3 position = particle.xyz;
        position.y = mod(position.y + time * (0.055 + fract(particle.w * 7.0) * 0.08) + 5.0, 10.0) - 5.0;
        position.x += sin(time * 0.19 + particle.w * 19.0 + position.y) * 0.11;
        position.z += cos(time * 0.16 + particle.w * 13.0 + position.y) * 0.11;
        vec4 projected = viewProjection * vec4(position, 1.0);
        gl_Position = projected;
        gl_PointSize = (1.1 + fract(particle.w * 17.0) * 1.9) * pixelRatio * clamp(7.0 / projected.w, 0.45, 1.7);
        particleAlpha = 0.08 + fract(particle.w * 5.0) * 0.22;
      }`, `#version 300 es
      precision mediump float;
      in float particleAlpha;
      out vec4 outputColor;
      void main() {
        vec2 point = gl_PointCoord * 2.0 - 1.0;
        float radius = dot(point, point);
        if (radius > 1.0) discard;
        outputColor = vec4(0.38, 0.78, 1.0, pow(1.0 - radius, 2.4) * particleAlpha);
      }`);

    const brightProgram = createProgram(gl, fullscreenVertex, `#version 300 es
      precision highp float;
      in vec2 uv;
      uniform sampler2D sourceTexture;
      out vec4 outputColor;
      void main() {
        vec3 color = texture(sourceTexture, uv).rgb;
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        float contribution = smoothstep(0.48, 0.92, luminance);
        outputColor = vec4(color * contribution, 1.0);
      }`);

    const blurProgram = createProgram(gl, fullscreenVertex, `#version 300 es
      precision highp float;
      in vec2 uv;
      uniform sampler2D sourceTexture;
      uniform vec2 direction;
      out vec4 outputColor;
      void main() {
        vec3 color = texture(sourceTexture, uv).rgb * 0.227027;
        color += texture(sourceTexture, uv + direction * 1.384615).rgb * 0.316216;
        color += texture(sourceTexture, uv - direction * 1.384615).rgb * 0.316216;
        color += texture(sourceTexture, uv + direction * 3.230769).rgb * 0.070270;
        color += texture(sourceTexture, uv - direction * 3.230769).rgb * 0.070270;
        outputColor = vec4(color, 1.0);
      }`);

    const compositeProgram = createProgram(gl, fullscreenVertex, `#version 300 es
      precision highp float;
      in vec2 uv;
      uniform sampler2D sceneTexture;
      uniform sampler2D bloomTexture;
      uniform vec2 resolution;
      uniform float time;
      uniform float bloomStrength;
      out vec4 outputColor;
      vec3 aces(vec3 x) {
        const float a = 2.51;
        const float b = 0.03;
        const float c = 2.43;
        const float d = 0.59;
        const float e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
      }
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      void main() {
        vec2 center = uv - 0.5;
        float aberration = 0.00065;
        vec3 scene;
        scene.r = texture(sceneTexture, uv + center * aberration).r;
        scene.g = texture(sceneTexture, uv).g;
        scene.b = texture(sceneTexture, uv - center * aberration).b;
        vec3 bloom = texture(bloomTexture, uv).rgb;
        vec3 color = scene + bloom * bloomStrength;
        color = aces(color * 1.12);
        float vignette = smoothstep(0.92, 0.28, dot(center, center) * 1.9);
        color *= 0.78 + vignette * 0.28;
        float grain = (hash(gl_FragCoord.xy + time * 17.0) - 0.5) * 0.012;
        color += grain;
        color = pow(max(color, 0.0), vec3(1.0 / 2.2));
        outputColor = vec4(color, 1.0);
      }`);

    const sphereGeometry = createSphereGeometry(profile.sphereSegments, profile.sphereRings);
    const cylinderGeometry = createCylinderGeometry(profile.tubeSegments);

    const sphereVao = gl.createVertexArray();
    const sphereVertexBuffer = gl.createBuffer();
    const sphereIndexBuffer = gl.createBuffer();
    const nodeInstanceBuffer = gl.createBuffer();
    gl.bindVertexArray(sphereVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphereGeometry.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereGeometry.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeInstanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_NODE_INSTANCES * NODE_STRIDE_FLOATS * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 40, 0);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 40, 12);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 40, 24);
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 2, gl.FLOAT, false, 40, 28);
    gl.enableVertexAttribArray(6);
    gl.vertexAttribPointer(6, 1, gl.FLOAT, false, 40, 36);
    for (let location = 2; location <= 6; location += 1) gl.vertexAttribDivisor(location, 1);

    const tubeVao = gl.createVertexArray();
    const tubeVertexBuffer = gl.createBuffer();
    const tubeIndexBuffer = gl.createBuffer();
    const tubeInstanceBuffer = gl.createBuffer();
    gl.bindVertexArray(tubeVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, tubeVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cylinderGeometry.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tubeIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cylinderGeometry.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, tubeInstanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_TUBE_INSTANCES * TUBE_STRIDE_FLOATS * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 48, 0);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 48, 12);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 48, 24);
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.FLOAT, false, 48, 36);
    gl.enableVertexAttribArray(6);
    gl.vertexAttribPointer(6, 1, gl.FLOAT, false, 48, 40);
    gl.enableVertexAttribArray(7);
    gl.vertexAttribPointer(7, 1, gl.FLOAT, false, 48, 44);
    for (let location = 2; location <= 7; location += 1) gl.vertexAttribDivisor(location, 1);

    let seed = 0x51a27;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const particleData = new Float32Array(profile.particles * 4);
    for (let index = 0; index < profile.particles; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 2.8 + random() * 4.6;
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

    const fullscreenVao = gl.createVertexArray();
    gl.bindVertexArray(null);

    const uniforms = {
      background: {
        resolution: gl.getUniformLocation(backgroundProgram, 'resolution'),
        pointer: gl.getUniformLocation(backgroundProgram, 'pointer'),
        time: gl.getUniformLocation(backgroundProgram, 'time')
      },
      sphere: {
        matrix: gl.getUniformLocation(sphereProgram, 'viewProjection'),
        camera: gl.getUniformLocation(sphereProgram, 'cameraPosition'),
        time: gl.getUniformLocation(sphereProgram, 'time')
      },
      core: {
        matrix: gl.getUniformLocation(coreProgram, 'viewProjection'),
        time: gl.getUniformLocation(coreProgram, 'time')
      },
      tube: {
        matrix: gl.getUniformLocation(tubeProgram, 'viewProjection'),
        camera: gl.getUniformLocation(tubeProgram, 'cameraPosition'),
        time: gl.getUniformLocation(tubeProgram, 'time')
      },
      particle: {
        matrix: gl.getUniformLocation(particleProgram, 'viewProjection'),
        time: gl.getUniformLocation(particleProgram, 'time'),
        pixelRatio: gl.getUniformLocation(particleProgram, 'pixelRatio')
      },
      bright: {
        source: gl.getUniformLocation(brightProgram, 'sourceTexture')
      },
      blur: {
        source: gl.getUniformLocation(blurProgram, 'sourceTexture'),
        direction: gl.getUniformLocation(blurProgram, 'direction')
      },
      composite: {
        scene: gl.getUniformLocation(compositeProgram, 'sceneTexture'),
        bloom: gl.getUniformLocation(compositeProgram, 'bloomTexture'),
        resolution: gl.getUniformLocation(compositeProgram, 'resolution'),
        time: gl.getUniformLocation(compositeProgram, 'time'),
        bloomStrength: gl.getUniformLocation(compositeProgram, 'bloomStrength')
      }
    };

    const runtime = {
      items: [],
      selected: -1,
      width: 1,
      height: 1,
      effectiveDpr: 1,
      resolutionScale: 1,
      dynamicScale: 1,
      backingPixels: 1,
      pointerX: 0.5,
      pointerY: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      dragging: false,
      dragMoved: false,
      dragX: 0,
      dragY: 0,
      orbit: 0,
      pitch: 0,
      cameraOrbit: 0,
      cameraElevation: 0.35,
      focusY: 0,
      hits: [],
      hover: -1,
      reduced: Boolean(options.reducedMotion),
      lost: false,
      frames: 0,
      resizeCount: 0,
      nodeCount: 0,
      tubeCount: 0,
      nodePositions: new Float32Array(MAX_NODE_INSTANCES * 3),
      nodeInstances: new Float32Array(MAX_NODE_INSTANCES * NODE_STRIDE_FLOATS),
      tubeInstances: new Float32Array(MAX_TUBE_INSTANCES * TUBE_STRIDE_FLOATS),
      projection: identity(),
      view: identity(),
      viewProjection: identity(),
      sceneTarget: null,
      bloomA: null,
      bloomB: null,
      bloomWidth: 1,
      bloomHeight: 1,
      lastFrameNow: 0,
      averageDelta: 1000 / profile.targetFps,
      qualityFrames: 0,
      qualityChanges: 0,
      drawCalls: 0,
      glErrors: 0
    };

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0, 0, 0, 1);

    function recreateTargets(width, height) {
      destroyTarget(gl, runtime.sceneTarget);
      destroyTarget(gl, runtime.bloomA);
      destroyTarget(gl, runtime.bloomB);
      runtime.sceneTarget = createColorTarget(gl, width, height, true);
      runtime.bloomWidth = Math.max(1, Math.round(width * profile.bloomScale));
      runtime.bloomHeight = Math.max(1, Math.round(height * profile.bloomScale));
      runtime.bloomA = createColorTarget(gl, runtime.bloomWidth, runtime.bloomHeight, false);
      runtime.bloomB = createColorTarget(gl, runtime.bloomWidth, runtime.bloomHeight, false);
    }

    function resize() {
      const rectangle = canvas.getBoundingClientRect();
      const width = Math.max(1, rectangle.width);
      const height = Math.max(1, rectangle.height);
      const rawDpr = Math.min(profile.maxDpr, devicePixelRatio || 1);
      const desiredPixels = width * height * rawDpr * rawDpr;
      const baseScale = Math.min(1, Math.sqrt(profile.maxPixels / Math.max(1, desiredPixels)));
      const resolutionScale = baseScale * runtime.dynamicScale;
      const effectiveDpr = Math.max(0.68, rawDpr * resolutionScale);
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
        recreateTargets(backingWidth, backingHeight);
        runtime.resizeCount += 1;
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      return runtime.backingPixels;
    }

    function writeNodeInstance(offset, positionOffset, color, scale, selected, hovered, phase) {
      const destination = runtime.nodeInstances;
      const positions = runtime.nodePositions;
      destination[offset] = positions[positionOffset];
      destination[offset + 1] = positions[positionOffset + 1];
      destination[offset + 2] = positions[positionOffset + 2];
      destination[offset + 3] = color[0];
      destination[offset + 4] = color[1];
      destination[offset + 5] = color[2];
      destination[offset + 6] = scale;
      destination[offset + 7] = selected ? 1 : 0;
      destination[offset + 8] = hovered ? 1 : 0;
      destination[offset + 9] = phase;
    }

    function writeTubeInstance(offset, startOffset, endOffset, color, radius, intensity, phase) {
      const destination = runtime.tubeInstances;
      const positions = runtime.nodePositions;
      destination[offset] = positions[startOffset];
      destination[offset + 1] = positions[startOffset + 1];
      destination[offset + 2] = positions[startOffset + 2];
      destination[offset + 3] = positions[endOffset];
      destination[offset + 4] = positions[endOffset + 1];
      destination[offset + 5] = positions[endOffset + 2];
      destination[offset + 6] = color[0];
      destination[offset + 7] = color[1];
      destination[offset + 8] = color[2];
      destination[offset + 9] = radius;
      destination[offset + 10] = intensity;
      destination[offset + 11] = phase;
    }

    function updateSceneData(now) {
      const count = Math.max(1, Math.min(MAX_STATES, runtime.items.length));
      const rotation = runtime.reduced ? 0.32 : now * 0.000105;
      runtime.nodeCount = count * 2;
      runtime.tubeCount = 0;
      runtime.hits.length = 0;

      for (let index = 0; index < count; index += 1) {
        const ratio = count === 1 ? 0.5 : index / (count - 1);
        const y = 4.2 - ratio * 8.4;
        const angle = rotation + index * 0.82;
        const radius = 1.66 + Math.sin(index * 0.53) * 0.075;
        const firstOffset = index * 6;
        const secondOffset = firstOffset + 3;
        runtime.nodePositions[firstOffset] = Math.cos(angle) * radius;
        runtime.nodePositions[firstOffset + 1] = y;
        runtime.nodePositions[firstOffset + 2] = Math.sin(angle) * radius;
        runtime.nodePositions[secondOffset] = Math.cos(angle + Math.PI) * radius;
        runtime.nodePositions[secondOffset + 1] = y;
        runtime.nodePositions[secondOffset + 2] = Math.sin(angle + Math.PI) * radius;

        const item = runtime.items[index] || { type: 'init' };
        const color = COLORS[item.type] || COLORS.scroll;
        const selected = index === runtime.selected;
        const hovered = index === runtime.hover;
        const scale = selected ? 0.33 : hovered ? 0.285 : 0.245;
        writeNodeInstance(index * 2 * NODE_STRIDE_FLOATS, firstOffset, color, scale, selected, hovered, index * 0.67);
        writeNodeInstance((index * 2 + 1) * NODE_STRIDE_FLOATS, secondOffset, color, scale, selected, hovered, index * 0.67 + Math.PI);
      }

      let tubeOffset = 0;
      for (let index = 0; index < count - 1; index += 1) {
        const firstA = index * 6;
        const firstB = (index + 1) * 6;
        const secondA = firstA + 3;
        const secondB = firstB + 3;
        writeTubeInstance(tubeOffset, firstA, firstB, [0.16, 0.62, 0.88], 0.052, 0.72, index * 0.41);
        tubeOffset += TUBE_STRIDE_FLOATS;
        runtime.tubeCount += 1;
        writeTubeInstance(tubeOffset, secondA, secondB, [0.52, 0.28, 0.92], 0.052, 0.72, index * 0.41 + 1.8);
        tubeOffset += TUBE_STRIDE_FLOATS;
        runtime.tubeCount += 1;
      }
      for (let index = 0; index < count; index += 1) {
        const first = index * 6;
        const second = first + 3;
        const item = runtime.items[index] || { type: 'init' };
        const color = COLORS[item.type] || COLORS.scroll;
        const selected = index === runtime.selected;
        writeTubeInstance(tubeOffset, first, second, color, selected ? 0.042 : 0.03, selected ? 1.2 : 0.58, index * 0.53);
        tubeOffset += TUBE_STRIDE_FLOATS;
        runtime.tubeCount += 1;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, nodeInstanceBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, runtime.nodeInstances);
      gl.bindBuffer(gl.ARRAY_BUFFER, tubeInstanceBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, runtime.tubeInstances);
    }

    function updateCamera(now) {
      const count = Math.max(1, Math.min(MAX_STATES, runtime.items.length));
      const selectedRatio = runtime.selected >= 0 && count > 1 ? runtime.selected / (count - 1) : 0.5;
      const desiredFocusY = runtime.selected >= 0 ? (4.2 - selectedRatio * 8.4) * 0.22 : 0;
      runtime.focusY += (desiredFocusY - runtime.focusY) * 0.045;
      runtime.pointerX += (runtime.targetX - runtime.pointerX) * 0.055;
      runtime.pointerY += (runtime.targetY - runtime.pointerY) * 0.055;

      const time = runtime.reduced ? 0 : now * 0.001;
      const autoOrbit = profile.autoOrbit ? time * 0.042 : 0.32;
      const desiredOrbit = autoOrbit + (runtime.pointerX - 0.5) * 0.72 + runtime.orbit;
      const desiredElevation = 0.34 + (0.5 - runtime.pointerY) * 0.52 + runtime.pitch;
      runtime.cameraOrbit += (desiredOrbit - runtime.cameraOrbit) * 0.045;
      runtime.cameraElevation += (desiredElevation - runtime.cameraElevation) * 0.05;

      const radius = 8.35;
      const eyeX = Math.sin(runtime.cameraOrbit) * radius;
      const eyeY = runtime.cameraElevation * 2.65 + runtime.focusY * 0.12;
      const eyeZ = Math.cos(runtime.cameraOrbit) * radius;
      perspective(runtime.projection, Math.PI / 4.25, runtime.width / runtime.height, 0.12, 42);
      lookAt(runtime.view, eyeX, eyeY, eyeZ, runtime.focusY);
      multiply(runtime.viewProjection, runtime.projection, runtime.view);
      return { eyeX, eyeY, eyeZ, time };
    }

    function bindTexture(unit, texture, location) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(location, unit);
    }

    function evaluateAdaptiveQuality(now) {
      if (runtime.reduced || !runtime.lastFrameNow) {
        runtime.lastFrameNow = now;
        return;
      }
      const delta = clamp(now - runtime.lastFrameNow, 1, 250);
      runtime.lastFrameNow = now;
      runtime.averageDelta = mix(runtime.averageDelta, delta, 0.055);
      runtime.qualityFrames += 1;
      if (runtime.qualityFrames < 120) return;
      runtime.qualityFrames = 0;
      const targetDelta = 1000 / profile.targetFps;
      let changed = false;
      if (runtime.averageDelta > targetDelta * 1.34 && runtime.dynamicScale > 0.72) {
        runtime.dynamicScale = Math.max(0.72, runtime.dynamicScale - 0.08);
        changed = true;
      } else if (runtime.averageDelta < targetDelta * 1.08 && runtime.dynamicScale < 1) {
        runtime.dynamicScale = Math.min(1, runtime.dynamicScale + 0.04);
        changed = true;
      }
      if (changed) {
        runtime.qualityChanges += 1;
        resize();
      }
    }

    function render(now) {
      if (runtime.lost || !runtime.sceneTarget) return false;
      evaluateAdaptiveQuality(now);
      updateSceneData(now);
      const camera = updateCamera(now);
      runtime.drawCalls = 0;

      gl.bindFramebuffer(gl.FRAMEBUFFER, runtime.sceneTarget.framebuffer);
      gl.viewport(0, 0, runtime.sceneTarget.width, runtime.sceneTarget.height);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.useProgram(backgroundProgram);
      gl.uniform2f(uniforms.background.resolution, runtime.sceneTarget.width, runtime.sceneTarget.height);
      gl.uniform2f(uniforms.background.pointer, runtime.pointerX, runtime.pointerY);
      gl.uniform1f(uniforms.background.time, camera.time);
      gl.bindVertexArray(fullscreenVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      runtime.drawCalls += 1;

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.clear(gl.DEPTH_BUFFER_BIT);

      gl.useProgram(particleProgram);
      gl.uniformMatrix4fv(uniforms.particle.matrix, false, runtime.viewProjection);
      gl.uniform1f(uniforms.particle.time, camera.time);
      gl.uniform1f(uniforms.particle.pixelRatio, runtime.effectiveDpr);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);
      gl.bindVertexArray(particleVao);
      gl.drawArrays(gl.POINTS, 0, profile.particles);
      runtime.drawCalls += 1;
      gl.depthMask(true);

      gl.useProgram(tubeProgram);
      gl.uniformMatrix4fv(uniforms.tube.matrix, false, runtime.viewProjection);
      gl.uniform3f(uniforms.tube.camera, camera.eyeX, camera.eyeY, camera.eyeZ);
      gl.uniform1f(uniforms.tube.time, camera.time);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(tubeVao);
      gl.drawElementsInstanced(gl.TRIANGLES, cylinderGeometry.indices.length, gl.UNSIGNED_SHORT, 0, runtime.tubeCount);
      runtime.drawCalls += 1;

      gl.useProgram(sphereProgram);
      gl.uniformMatrix4fv(uniforms.sphere.matrix, false, runtime.viewProjection);
      gl.uniform3f(uniforms.sphere.camera, camera.eyeX, camera.eyeY, camera.eyeZ);
      gl.uniform1f(uniforms.sphere.time, camera.time);
      gl.bindVertexArray(sphereVao);
      gl.drawElementsInstanced(gl.TRIANGLES, sphereGeometry.indices.length, gl.UNSIGNED_SHORT, 0, runtime.nodeCount);
      runtime.drawCalls += 1;

      gl.useProgram(coreProgram);
      gl.uniformMatrix4fv(uniforms.core.matrix, false, runtime.viewProjection);
      gl.uniform1f(uniforms.core.time, camera.time);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);
      gl.drawElementsInstanced(gl.TRIANGLES, sphereGeometry.indices.length, gl.UNSIGNED_SHORT, 0, runtime.nodeCount);
      runtime.drawCalls += 1;
      gl.depthMask(true);
      gl.disable(gl.BLEND);

      runtime.hits.length = 0;
      for (let index = 0; index < runtime.nodeCount; index += 1) {
        const positionOffset = index * 3;
        const hit = project(runtime.nodePositions, positionOffset, runtime.viewProjection, runtime.width, runtime.height);
        if (!hit) continue;
        const stateIndex = Math.floor(index / 2);
        runtime.hits.push({
          x: hit.x,
          y: hit.y,
          radius: stateIndex === runtime.selected ? 30 : 22,
          index: stateIndex,
          depth: hit.depth
        });
      }

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, runtime.bloomA.framebuffer);
      gl.viewport(0, 0, runtime.bloomWidth, runtime.bloomHeight);
      gl.useProgram(brightProgram);
      bindTexture(0, runtime.sceneTarget.texture, uniforms.bright.source);
      gl.bindVertexArray(fullscreenVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      runtime.drawCalls += 1;

      let source = runtime.bloomA;
      let destination = runtime.bloomB;
      for (let pass = 0; pass < profile.blurPasses; pass += 1) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);
        gl.viewport(0, 0, runtime.bloomWidth, runtime.bloomHeight);
        gl.useProgram(blurProgram);
        bindTexture(0, source.texture, uniforms.blur.source);
        gl.uniform2f(uniforms.blur.direction, 1 / runtime.bloomWidth, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        runtime.drawCalls += 1;
        const horizontal = destination;
        destination = source;
        source = horizontal;

        gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);
        bindTexture(0, source.texture, uniforms.blur.source);
        gl.uniform2f(uniforms.blur.direction, 0, 1 / runtime.bloomHeight);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        runtime.drawCalls += 1;
        const vertical = destination;
        destination = source;
        source = vertical;
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.useProgram(compositeProgram);
      bindTexture(0, runtime.sceneTarget.texture, uniforms.composite.scene);
      bindTexture(1, source.texture, uniforms.composite.bloom);
      gl.uniform2f(uniforms.composite.resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(uniforms.composite.time, camera.time);
      gl.uniform1f(uniforms.composite.bloomStrength, runtime.reduced ? 0.52 : 0.78);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      runtime.drawCalls += 1;
      gl.bindVertexArray(null);

      const error = gl.getError();
      if (error !== gl.NO_ERROR) runtime.glErrors += 1;
      runtime.frames += 1;
      return true;
    }

    function pointerMove(x, y, event) {
      runtime.targetX = clamp(x / runtime.width, 0, 1);
      runtime.targetY = clamp(y / runtime.height, 0, 1);
      if (runtime.dragging && event) {
        const deltaX = event.clientX - runtime.dragX;
        const deltaY = event.clientY - runtime.dragY;
        if (Math.abs(deltaX) + Math.abs(deltaY) > 2) runtime.dragMoved = true;
        runtime.orbit += deltaX * 0.0052;
        runtime.pitch = clamp(runtime.pitch - deltaY * 0.0032, -0.52, 0.52);
        runtime.dragX = event.clientX;
        runtime.dragY = event.clientY;
      }

      let best = -1;
      let distance = Infinity;
      let depth = Infinity;
      for (const hit of runtime.hits) {
        const current = Math.hypot(hit.x - x, hit.y - y);
        if (current < hit.radius && (current < distance || hit.depth < depth)) {
          best = hit.index;
          distance = current;
          depth = hit.depth;
        }
      }
      runtime.hover = best;
      canvas.style.cursor = runtime.dragging ? 'grabbing' : best >= 0 ? 'pointer' : 'grab';
      return best;
    }

    canvas.addEventListener('pointerdown', event => {
      runtime.dragging = true;
      runtime.dragMoved = false;
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
      kind: 'webgl2-cinematic-instanced-pbr',
      profile,
      setData(items, selected) {
        runtime.items = Array.isArray(items) ? items.slice(-MAX_STATES) : [];
        runtime.selected = Number.isInteger(selected) ? clamp(selected, -1, runtime.items.length - 1) : -1;
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
        if (!runtime.dragMoved && runtime.hover >= 0) options.onSelect?.(runtime.hover);
        runtime.dragMoved = false;
      },
      destroy() {
        destroyTarget(gl, runtime.sceneTarget);
        destroyTarget(gl, runtime.bloomA);
        destroyTarget(gl, runtime.bloomB);
        [backgroundProgram, sphereProgram, coreProgram, tubeProgram, particleProgram, brightProgram, blurProgram, compositeProgram]
          .forEach(program => gl.deleteProgram(program));
        [sphereVertexBuffer, sphereIndexBuffer, nodeInstanceBuffer, tubeVertexBuffer, tubeIndexBuffer, tubeInstanceBuffer, particleBuffer]
          .forEach(buffer => gl.deleteBuffer(buffer));
        [sphereVao, tubeVao, particleVao, fullscreenVao].forEach(vao => gl.deleteVertexArray(vao));
      },
      getStatus() {
        const attributes = gl.getContextAttributes();
        return {
          version: VERSION,
          kind: 'webgl2-cinematic-instanced-pbr',
          context: 'webgl2',
          antialias: Boolean(attributes?.antialias),
          depth: Boolean(attributes?.depth),
          quality: profile.name,
          fourK: profile.fourK,
          targetFps: profile.targetFps,
          effectiveDpr: Number(runtime.effectiveDpr.toFixed(3)),
          resolutionScale: Number(runtime.resolutionScale.toFixed(3)),
          dynamicScale: Number(runtime.dynamicScale.toFixed(3)),
          maxPixels: profile.maxPixels,
          backingPixels: runtime.backingPixels,
          particles: profile.particles,
          nodes: runtime.items.length,
          nodeInstances: runtime.nodeCount,
          tubeInstances: runtime.tubeCount,
          selected: runtime.selected,
          frames: runtime.frames,
          resizeCount: runtime.resizeCount,
          qualityChanges: runtime.qualityChanges,
          drawCalls: runtime.drawCalls,
          glErrors: runtime.glErrors,
          contextLost: runtime.lost,
          instancedMeshes: true,
          nodeGeometry: 'uv-sphere',
          tubeGeometry: 'instanced-cylinder',
          sphereTriangles: sphereGeometry.triangles,
          tubeTriangles: cylinderGeometry.triangles,
          postProcessing: 'rgba8-bloom-aces-vignette',
          bloom: true,
          bloomPasses: profile.blurPasses,
          toneMapping: 'ACES-filmic',
          adaptiveQuality: true
        };
      }
    };
  }

  loadStyle();
  window.FormatXGenomeRenderer3D = Object.freeze({ version: VERSION, create });
}());