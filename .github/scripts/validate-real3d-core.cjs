'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = path.resolve(__dirname, '../..');
const engine = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-orbital-core-v28.js'), 'utf8');
const loader = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-reference-core-v26.js'), 'utf8');
const mobile = fs.readFileSync(path.join(repo, 'docs/scifi-ui/styles/formatx-real3d-mobile-v29.css'), 'utf8');

assert.match(engine, /getContext\(['"]webgl2['"]/i, 'core must use a real WebGL2 context');
assert.match(engine, /depth:\s*true/, 'WebGL context must use a depth buffer');
assert.match(engine, /gl\.enable\(gl\.DEPTH_TEST\)/, 'depth testing must be enabled');
assert.match(engine, /function\s+perspective\s*\(/, 'perspective projection is required');
assert.match(engine, /function\s+lookAt\s*\(/, '3D camera/view matrix is required');
assert.match(engine, /uniform\s+mat4\s+uProjection/, 'projection matrix must reach the vertex shader');
assert.match(engine, /uniform\s+mat4\s+uView/, 'view matrix must reach the vertex shader');
assert.match(engine, /uniform\s+mat4\s+uModel/, 'model matrix must reach the vertex shader');
assert.match(engine, /layout\(location=0\)\s+in\s+vec3\s+aPosition/, '3D vertex positions are required');
assert.match(engine, /layout\(location=1\)\s+in\s+vec3\s+aNormal/, '3D normals are required');
assert.match(engine, /sphereGeometry\(/, 'volumetric mesh geometry is required');
assert.match(engine, /tubeGeometry\(/, 'independent 3D orbital tube geometry is required');
assert.match(engine, /rotationX\(/, 'X-axis rotation is required');
assert.match(engine, /rotationY\(/, 'Y-axis rotation is required');
assert.match(engine, /rotationZ\(/, 'Z-axis rotation is required');
assert.match(engine, /pointerX/, 'interactive camera/object parallax is required');
assert.match(engine, /driftZ/, 'inner emitter must move through Z depth');
assert.match(engine, /native-webgl2-orbital-glass-v28/, 'runtime must identify the native WebGL2 renderer');

assert.match(loader, /formatx-real3d-mobile-v29\.css/, 'real-3D mobile composition must be loaded');
assert.match(loader, /fxReal3d\s*=\s*['"]webgl2-native['"]/, 'loader must expose native WebGL2 state');
assert.match(mobile, /data-fx-orbital-core="ready-v28"/, 'mobile layout must bind to the actual WebGL renderer state');
assert.match(mobile, /\.fx-three-stage-shell/, 'legacy pseudo-3D stage must be retired when native WebGL is active');
assert.match(mobile, /#fx-apex-canvas/, 'legacy canvas must be retired when native WebGL is active');
assert.doesNotMatch(mobile, /background-image\s*:\s*url\(/i, 'real-3D core composition must not substitute a poster image');

console.log('PASS: FormatX core is native WebGL2 3D with depth buffer, perspective camera, 3-axis transforms, volumetric geometry, Z-depth motion and mobile pseudo-3D retirement.');
