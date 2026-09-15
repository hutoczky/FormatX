'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');

const release = JSON.parse(fs.readFileSync('docs/scifi-ui/data/current-release.json', 'utf8'));
const runtime = fs.readFileSync('docs/scifi-ui/scripts/release-metadata.js', 'utf8');
const projectAi = fs.readFileSync('billing-worker/src/project-ai.js', 'utf8');
const organism = fs.readFileSync('docs/scifi-ui/scripts/organism-voice.js', 'utf8');
const livingCore = fs.readFileSync('docs/scifi-ui/living-core.html', 'utf8');
const livingCoreRuntime = fs.readFileSync('docs/scifi-ui/scripts/living-core.js', 'utf8');
const homepage = fs.readFileSync('docs/scifi-ui/index.html', 'utf8');
const downloads = fs.readFileSync('docs/scifi-ui/downloads/index.html', 'utf8');
const productionWorker = fs.readFileSync('billing-worker/src/production-with-license.js', 'utf8');

assert.equal(release.ok, true, 'canonical release metadata is not available');
assert.equal(release.prerelease, false, 'canonical product release must not be prerelease');
assert.equal(release.source, 'github_published_release', 'unexpected canonical release source');
assert.equal(release.repository, 'hutoczky/FormatX-Updates', 'unexpected canonical release repository');
assert.match(release.version, /^v\d+$/i, 'canonical release version is invalid');
assert.match(release.release_url, /^https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/tag\/v\d+$/i, 'canonical release URL is not trusted');
assert.equal(release.channels?.multiplatform?.available, true, 'multiplatform full-release package is unavailable');
assert.match(release.channels.multiplatform.download_url, /^https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/download\/v\d+\/FormatX-Suite-Pro-V\d+\.zip$/i, 'multiplatform package URL is not canonical');
assert.match(release.channels.multiplatform.digest, /^sha256:[0-9a-f]{64}$/i, 'multiplatform SHA-256 digest missing');
assert.deepEqual(release.channels.multiplatform.supported_platforms, ['linux-bazzite', 'windows'], 'multiplatform native platform list drifted');
assert.equal(release.channels?.android?.available, true, 'official Android full release is unavailable');
assert.equal(release.channels.android.download_url, '/download/android', 'official Android route drifted');
assert.match(release.channels.android.digest, /^sha256:[0-9a-f]{64}$/i, 'Android SHA-256 digest missing');

for (const token of [
  "OFFICIAL_REPOSITORY = 'hutoczky/FormatX-Updates'",
  "release?.source === 'github_published_release'",
  'isOfficialGitHubReleaseUrl',
  'isOfficialGitHubDownloadUrl',
  'validDigest(asset.digest)',
  "ROOT.dataset.fxReleaseMetadata = state.available ? 'ready-v6' : 'fallback-v6'",
]) assert.ok(runtime.includes(token), `release runtime contract missing: ${token}`);
assert.ok(!runtime.includes("release?.source === 'formatx_release_service'\n        && isAllowedReleaseUrl"), 'legacy source-only trust gate remains');

for (const source of [projectAi, organism]) {
  assert.match(source, /5-day trial licence|5 napos próbalicenc/, 'five-day trial truth missing from interactive answer layer');
  assert.match(source, /Web.*technical preview|web.*technikai előnézet/i, 'web technical-preview truth missing');
  assert.match(source, /macOS.*planned|macOS.*tervezett/i, 'macOS planned truth missing');
  assert.match(source, /Android.*full release|Android.*teljes/i, 'Android full-release truth missing');
}

assert.ok(livingCore.includes('TELJES MULTIPLATFORM VERZIÓ'), 'Living Core full-release download label missing');
for (const [label, source] of [['homepage', homepage], ['downloads page', downloads], ['Living Core', livingCore]]) {
  assert.ok(source.includes('href="/download/multiplatform"'), `${label} does not use the versionless latest-release route`);
}
for (const token of [
  'FormatX-Updates/releases/latest',
  'readLiveReleaseMetadata',
  "'Cache-Control': 'no-store, max-age=0'",
  "'X-FormatX-Release'",
]) assert.ok(productionWorker.includes(token), `latest-release Worker contract missing: ${token}`);
for (const token of [
  "RELEASE_API = './data/current-release.json'",
  "RELEASE_DOWNLOAD = '/download/multiplatform'",
  'payload.channels?.multiplatform',
]) assert.ok(livingCoreRuntime.includes(token), `Living Core latest-release contract missing: ${token}`);
assert.ok(livingCore.includes('href="/download/android"'), 'Living Core official Android route missing');
assert.ok(!livingCore.includes('FormatX-Native-Android.apk'), 'Living Core still exposes Native beta as the main Android download');
assert.ok(!livingCore.includes('<strong>V92</strong>'), 'Living Core stale V92 label remains');

console.log(`PASS: release runtime trusts canonical ${release.version}, validates both SHA-256 digests and keeps every interactive public layer aligned with Full release + 5-day trial.`);
