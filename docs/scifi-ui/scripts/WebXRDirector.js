// @ts-check

/**
 * Native WebXR session director for the FormatX WebGPU stage.
 * No frame-level allocations are performed by this class.
 */
export class WebXRDirector {
  /**
   * @param {{renderer:any, world:any, scene:any}} options
   */
  constructor({ renderer, world, scene }) {
    this.renderer = renderer;
    this.world = world;
    this.scene = scene;
    this.session = null;
    this.mode = '';
    this.savedBackground = scene.background;
    this.savedPosition = world.position.clone();
    this.savedQuaternion = world.quaternion.clone();
    this.savedScale = world.scale.clone();
    this.onSessionEnd = this.onSessionEnd.bind(this);
    this.onMessage = this.onMessage.bind(this);

    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    addEventListener('message', this.onMessage);

    window.FormatXXR = Object.freeze({
      requestVR: () => this.request('immersive-vr'),
      requestAR: () => this.request('immersive-ar'),
      end: () => this.end(),
      supports: mode => this.supports(mode)
    });
  }

  async supports(mode) {
    if (!navigator.xr || !isSecureContext) return false;
    try {
      return await navigator.xr.isSessionSupported(mode);
    } catch (_) {
      return false;
    }
  }

  async request(mode) {
    if (this.session) {
      if (this.mode === mode) return this.session;
      await this.end();
    }
    if (!await this.supports(mode)) {
      this.publish('unsupported', mode);
      throw new Error(`${mode} is not supported by this browser or device`);
    }

    const overlay = document.body;
    const options = mode === 'immersive-ar'
      ? {
          requiredFeatures: ['local'],
          optionalFeatures: ['local-floor', 'hit-test', 'anchors', 'dom-overlay', 'layers'],
          domOverlay: { root: overlay }
        }
      : {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers']
        };

    this.publish('requesting', mode);
    const session = await navigator.xr.requestSession(mode, options);
    this.session = session;
    this.mode = mode;
    session.addEventListener('end', this.onSessionEnd, { once: true });

    if (mode === 'immersive-ar') {
      this.renderer.xr.setReferenceSpaceType('local');
      this.scene.background = null;
      this.renderer.setClearColor(0x000000, 0);
      this.world.position.set(0, 0, -1.35);
      this.world.quaternion.identity();
      this.world.scale.setScalar(0.32);
    } else {
      this.renderer.xr.setReferenceSpaceType('local-floor');
      this.world.position.set(0, 1.35, -2.75);
      this.world.quaternion.identity();
      this.world.scale.setScalar(0.56);
    }

    await this.renderer.xr.setSession(session);
    this.publish('presenting', mode);
    return session;
  }

  async end() {
    if (!this.session) return;
    const session = this.session;
    this.session = null;
    try {
      await session.end();
    } catch (_) {
      this.restoreWorld();
    }
  }

  onSessionEnd() {
    const endedMode = this.mode;
    this.session = null;
    this.mode = '';
    this.restoreWorld();
    this.publish('ended', endedMode);
  }

  restoreWorld() {
    this.world.position.copy(this.savedPosition);
    this.world.quaternion.copy(this.savedQuaternion);
    this.world.scale.copy(this.savedScale);
    this.scene.background = this.savedBackground;
    this.renderer.setClearColor(0x010307, 1);
  }

  onMessage(event) {
    const data = event.data;
    if (!data || data.type !== 'formatx:xr') return;
    if (data.action === 'end') {
      void this.end();
      return;
    }
    const mode = data.mode === 'immersive-ar' ? 'immersive-ar' : 'immersive-vr';
    void this.request(mode).catch(error => {
      this.publish('error', mode, error instanceof Error ? error.message : String(error));
    });
  }

  publish(state, mode, message = '') {
    try {
      parent.postMessage({
        type: 'formatx:xrstate',
        state,
        mode,
        message
      }, location.origin);
    } catch (_) {}
  }

  dispose() {
    removeEventListener('message', this.onMessage);
    void this.end();
    try { delete window.FormatXXR; } catch (_) {}
  }
}
