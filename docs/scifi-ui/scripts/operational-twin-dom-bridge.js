(function () {
  'use strict';

  if (window.FormatXOperationalTwin) return;
  const root = document.documentElement;

  function text(selector) {
    return document.querySelector(selector)?.textContent?.trim() || '';
  }

  function getReport() {
    const simulatorState = root.dataset.simulatorState || 'idle';
    if (!['complete', 'blocked'].includes(simulatorState)) return null;

    const events = Array.from(document.querySelectorAll('#event-log p')).map(entry => ({
      time: entry.querySelector('time')?.textContent?.trim() || '00:00.000',
      level: entry.className || 'info',
      label: entry.querySelector('b')?.textContent?.trim() || 'EVENT',
      message: entry.querySelector('span')?.textContent?.trim() || ''
    }));

    const riskLevel = document.querySelectorAll('.risk-scale i.active').length || 1;
    const consoleStatus = text('#console-status');
    const outcome = simulatorState === 'complete' ? 'verified' : (consoleStatus === 'SAFETY INTERLOCK' ? 'blocked' : 'fail-closed');

    return {
      schema: 'formatx-operational-twin-dom-report-v1',
      generated_at: new Date().toISOString(),
      simulation_only: true,
      real_device_access: false,
      language: root.lang === 'en' ? 'en' : 'hu',
      project: {
        id: text('.scenario-card[aria-pressed="true"] strong').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: text('#fact-project'),
        platform: text('#fact-platform'),
        target: text('#fact-target'),
        target_meta: text('#telemetry-target-meta'),
        estimated_duration: text('#fact-duration'),
        risk_level: riskLevel,
        safety_interlock: Boolean(document.getElementById('safety-gate')?.checked),
        fault_injection: Boolean(document.getElementById('fault-injection')?.checked)
      },
      outcome,
      reason: outcome === 'verified' ? null : consoleStatus.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      elapsed: text('#sim-clock'),
      workflow: ['discover', 'plan', 'lock', 'execute', 'verify'],
      events
    };
  }

  window.FormatXOperationalTwin = Object.freeze({
    version: 'operational-twin-dom-bridge-v1',
    getReport,
    getConfiguration: function () {
      return {
        language: root.lang === 'en' ? 'en' : 'hu',
        simulatorState: root.dataset.simulatorState || 'idle',
        project: text('#fact-project'),
        platformName: text('#fact-platform'),
        target: text('#fact-target')
      };
    }
  });

  root.dataset.fxOperationalTwinBridge = 'ready';
  document.dispatchEvent(new CustomEvent('formatx:operational-twin-ready'));
}());
