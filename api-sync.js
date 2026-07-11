/**
 * Cloud sync bridge — localStorage ↔ MongoDB via Express API.
 * Offline-first: local saves always win immediately; cloud push is async + debounced.
 */
(function (global) {
  var STORAGE_DEVICE_ID = 'rh_device_id';
  var STORAGE_CLOUD_UPDATED = 'rh_cloud_updated_at';
  var pushTimer = null;
  var pushInFlight = false;
  var pendingPush = false;
  var getStateFn = null;

  function getApiBase() {
    var meta = document.querySelector('meta[name="myndly-api"]');
    if (meta && meta.content) {
      var value = meta.content.trim();
      if (value === 'same-origin' || value === '/') return location.origin;
      return value.replace(/\/$/, '');
    }
    if (location.port === '3001' || location.port === String(global.__MYNDLY_API_PORT || '')) {
      return location.origin;
    }
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return '';
  }

  function isEnabled() {
    return Boolean(getApiBase()) && navigator.onLine !== false;
  }

  function getDeviceId() {
    try {
      var existing = localStorage.getItem(STORAGE_DEVICE_ID);
      if (existing) return existing;
      var id = (global.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'dev-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      localStorage.setItem(STORAGE_DEVICE_ID, id);
      return id;
    } catch (e) {
      return 'fallback-device';
    }
  }

  function getLocalUpdatedAt() {
    try {
      return Number(localStorage.getItem(STORAGE_CLOUD_UPDATED) || 0);
    } catch (e) {
      return 0;
    }
  }

  function setLocalUpdatedAt(ts) {
    try {
      localStorage.setItem(STORAGE_CLOUD_UPDATED, String(ts));
    } catch (e) { /* ignore */ }
  }

  function localHasData(state) {
    return Boolean(
      (state.reminders && state.reminders.length) ||
      (state.todos && state.todos.length) ||
      (state.dailyTasks && state.dailyTasks.length)
    );
  }

  async function pushState(state) {
    if (!isEnabled()) return false;

    var payload = {
      reminders: state.reminders || [],
      todos: state.todos || [],
      dailyTasks: state.dailyTasks || [],
      updatedAt: state.updatedAt || Date.now()
    };

    var res = await fetch(getApiBase() + '/api/sync/' + encodeURIComponent(getDeviceId()), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Cloud push failed (' + res.status + ')');

    var data = await res.json();
    setLocalUpdatedAt(data.updatedAt || payload.updatedAt);
    return true;
  }

  async function pullState() {
    if (!isEnabled()) return null;

    var res = await fetch(getApiBase() + '/api/sync/' + encodeURIComponent(getDeviceId()));
    if (!res.ok) throw new Error('Cloud pull failed (' + res.status + ')');
    return res.json();
  }

  async function flushPush() {
    if (!getStateFn || pushInFlight) {
      if (getStateFn) pendingPush = true;
      return;
    }

    pushInFlight = true;
    pendingPush = false;

    try {
      await pushState(getStateFn());
    } catch (err) {
      console.warn('Myndly cloud sync push failed', err);
    } finally {
      pushInFlight = false;
      if (pendingPush) flushPush();
    }
  }

  function schedulePush(getState) {
    getStateFn = getState;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(flushPush, 800);
  }

  async function pullAndMerge(opts) {
    if (!isEnabled() || !opts || typeof opts.getLocal !== 'function' || typeof opts.applyRemote !== 'function') {
      return { appliedRemote: false };
    }

    try {
      var local = opts.getLocal();
      var localUpdatedAt = getLocalUpdatedAt();
      var remote = await pullState();

      if (remote.hasData && remote.updatedAt > localUpdatedAt) {
        opts.applyRemote(remote);
        setLocalUpdatedAt(remote.updatedAt);
        return { appliedRemote: true };
      }

      if (localHasData(local) && (!remote.hasData || localUpdatedAt > remote.updatedAt)) {
        await pushState(local);
      }

      return { appliedRemote: false };
    } catch (err) {
      console.warn('Myndly cloud sync pull failed', err);
      return { appliedRemote: false, error: err };
    }
  }

  global.MyndlyApiSync = {
    isEnabled: isEnabled,
    getApiBase: getApiBase,
    getDeviceId: getDeviceId,
    schedulePush: schedulePush,
    pullAndMerge: pullAndMerge,
    pushState: pushState
  };
})(typeof window !== 'undefined' ? window : global);
