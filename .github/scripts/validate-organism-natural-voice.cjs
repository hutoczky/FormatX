'use strict';

const fs = require('node:fs');

const guard = fs.readFileSync('docs/scifi-ui/scripts/organism-natural-voice.js', 'utf8');
const loader = fs.readFileSync('docs/scifi-ui/scripts/igloo-parity.js', 'utf8');
const queue = loader.split('const queue =', 2)[1]?.split('];', 1)[0] || '';

const assertions = [
  [guard.includes("fxOrganismNaturalVoiceGuard === 'ready-v1'"), 'natural voice ready marker missing'],
  [guard.includes('NATURAL_TOKENS'), 'natural/neural/online quality detection missing'],
  [guard.includes('LEGACY_TOKENS'), 'legacy Windows voice detection missing'],
  [guard.includes('desktop|legacy|sapi|onecore|mobile|compact'), 'Desktop/SAPI legacy block list missing'],
  [guard.includes("level === 'legacy' || level === 'standard'"), 'standard and legacy voices are not rejected'],
  [guard.includes("/microsoft/.test(value) && !/natural|neural|online/.test(value)"), 'non-natural Microsoft voice penalty missing'],
  [guard.includes("event.stopImmediatePropagation()"), 'legacy voice button takeover missing'],
  [guard.includes("ROOT.dataset.fxOrganismSpeechMode = 'natural-only-guard-v1'"), 'natural-only speech mode missing'],
  [guard.includes('SpeechSynthesisUtterance'), 'speech synthesis output missing'],
  [guard.includes('waitForVoice(1900)'), 'delayed online voice discovery missing'],
  [guard.includes('voiceschanged'), 'late browser voice loading support missing'],
  [guard.includes('A régi Windows rendszerhangot szándékosan nem használom.'), 'Hungarian legacy voice explanation missing'],
  [!guard.includes('fetch('), 'natural voice guard must not send text over the network'],
  [!guard.includes('XMLHttpRequest'), 'natural voice guard must not use XMLHttpRequest'],
  [!guard.includes('WebSocket'), 'natural voice guard must not use WebSocket'],
  [queue.includes('organism-natural-voice.js?v=20260730-natural-voice-1'), 'natural voice guard is missing from production loader'],
  [queue.indexOf('organism-voice.js') < queue.indexOf('organism-natural-voice.js'), 'guard must load after the dialogue module'],
  [queue.indexOf('organism-natural-voice.js') < queue.indexOf('organism-voice-foreground.js'), 'guard must load before foreground promotion'],
  [loader.includes("safe-ready-v21"), 'stable loader contract changed unexpectedly'],
];

for (const [ok, message] of assertions) {
  if (!ok) throw new Error(message);
}

console.log('PASS: natural-only Organism voice blocks legacy Windows voices and preserves the stable UI loader.');
