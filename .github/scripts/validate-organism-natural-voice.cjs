'use strict';

const fs = require('node:fs');

const guard = fs.readFileSync('docs/scifi-ui/scripts/organism-natural-voice.js', 'utf8');
const loader = fs.readFileSync('docs/scifi-ui/scripts/igloo-parity.js', 'utf8');
const queue = loader.split('const queue =', 2)[1]?.split('];', 1)[0] || '';

const assertions = [
  [guard.includes("fxOrganismNaturalVoiceGuard === 'ready-v2'"), 'adaptive voice ready marker missing'],
  [guard.includes('function voiceScore(voice)'), 'adaptive voice scoring missing'],
  [guard.includes("else if (voice?.default) score += 80"), 'browser default voice fallback missing'],
  [guard.includes("selectedVoice?.name || 'browser-default'"), 'browser default voice label missing'],
  [guard.includes('synth.resume()'), 'speech synthesis resume support missing'],
  [guard.includes('event.stopImmediatePropagation()'), 'voice button compatibility takeover missing'],
  [guard.includes("ROOT.dataset.fxOrganismSpeechCompatibility = 'adaptive-v2'"), 'adaptive speech mode marker missing'],
  [guard.includes('SpeechSynthesisUtterance'), 'speech synthesis output missing'],
  [guard.includes('voiceschanged'), 'late browser voice loading support missing'],
  [guard.includes('watchdog = window.setTimeout'), 'speech start watchdog missing'],
  [guard.includes("setStatus(copy().unavailable, 'error')"), 'visible speech error state missing'],
  [!guard.includes("level === 'legacy' || level === 'standard'"), 'standard voices must not be blocked'],
  [!guard.includes('A régi Windows rendszerhangot szándékosan nem használom.'), 'legacy-only rejection message returned'],
  [!guard.includes('fetch('), 'speech compatibility layer must not send text over the network'],
  [!guard.includes('XMLHttpRequest'), 'speech compatibility layer must not use XMLHttpRequest'],
  [!guard.includes('WebSocket'), 'speech compatibility layer must not use WebSocket'],
  [queue.includes('organism-natural-voice.js?v=20260730-natural-voice-2'), 'adaptive voice module is missing from production loader'],
  [queue.indexOf('organism-voice.js') < queue.indexOf('organism-natural-voice.js'), 'compatibility layer must load after the dialogue module'],
  [queue.indexOf('organism-natural-voice.js') < queue.indexOf('organism-voice-foreground.js'), 'compatibility layer must load before foreground promotion'],
  [loader.includes('safe-ready-v22'), 'stable loader v22 marker missing'],
];

for (const [ok, message] of assertions) {
  if (!ok) throw new Error(message);
}

console.log('PASS: adaptive Organism speech supports natural, system and browser-default voices without changing the UI layout.');