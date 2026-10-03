'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

test('worker crystal and sphere remain closed, outward and within the surface budget', () => {
  const context = vm.createContext({});
  const source = fs.readFileSync(path.join(__dirname, '../../docs/scifi-ui/scripts/formatx-crystal-worker-r564.js'), 'utf8');
  vm.runInContext(source + '\nthis.mesh = geometry();', context);
  const { arrays, count } = context.mesh;
  assert.equal(count, 1584, '12×24 surface must not grow');
  assert.equal(arrays.length, 4);
  assert.ok(arrays.reduce((bytes, array) => bytes + array.byteLength, 0) <= 76032);

  const point = (array, index) => Array.from(array.slice(index * 3, index * 3 + 3));
  const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
  const key = p => p.map(v => Math.round(v * 1e6)).join(',');
  for (const [positions, normals, smooth] of [[arrays[0], arrays[2], false], [arrays[1], arrays[3], true]]) {
    const edges = new Map();
    for (let i = 0; i < count; i += 3) {
      const p = [point(positions, i), point(positions, i + 1), point(positions, i + 2)];
      const u = p[1].map((v, j) => v - p[0][j]), v = p[2].map((q, j) => q - p[0][j]);
      const face = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
      assert.ok(Math.hypot(...face) > 1e-8, 'degenerate triangle');
      assert.ok(dot(face, p[0]) > 0, 'back-face culling requires outward winding');
      for (let j = 0; j < 3; j++) {
        const n = point(normals, i + j);
        assert.ok([...p[j], ...n].every(Number.isFinite));
        assert.ok(Math.abs(Math.hypot(...n) - 1) < 1e-6, 'unit normal required');
        assert.ok(dot(n, p[j]) > 0, 'normal points into the closed volume');
        if (smooth) assert.ok(dot(n, p[j]) / Math.hypot(...p[j]) > .99999);
        else assert.ok(dot(n, face) / Math.hypot(...face) > .99999);
        const a = key(p[j]), b = key(p[(j + 1) % 3]);
        const edge = a < b ? a + '|' + b : b + '|' + a;
        edges.set(edge, (edges.get(edge) || 0) + 1);
      }
    }
    assert.ok([...edges.values()].every(n => n === 2), 'each closed-volume edge must have two faces');
  }
});
