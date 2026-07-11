/**
 * Cloud sync bridge — frontend (notify) ↔ notify_backend API.
 */
(function (global) {
  var pushTimer = null;
  var pushInFlight = false;
  var pendingPush = false;
  var getStateFn = null;

  function getApiBase() {
    var meta = document.querySelector('meta[name="myndly-api"]');
    if (meta && meta.content) {
      return meta.content.trim().replace(/\/$/, '');
    }
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    return '';
  }

  function isLoggedIn() {
    return global.MyndlyAuth && MyndlyAuth.isLoggedIn();
  }

  function isEnabled() {
    return Boolean(getApiBase()) && isLoggedIn() && navigator.onLine !== false;
  }

  function getCloudUpdatedKey() {
    var user = global.MyndlyAuth && MyndlyAuth.getUser();
    return user ? 'rh_cloud_updated_at_' + user.id : 'rh_cloud_updated_at';
  }

  function getLocalUpdatedAt() {
    try {
      return Number(localStorage.getItem(getCloudUpdatedKey()) || 0);
    } catch (e) {
      return 0;
    }
  }

  function setLocalUpdatedAt(ts) {
    try {
      localStorage.setItem(getCloudUpdatedKey(), String(ts));
    } catch (e) { /* ignore */ }
  }

  function stampItems(items, ts) {
    return (items || []).map(function (item) {
      return Object.assign({}, item, { updatedAt: item.updatedAt || ts });
    });
  }

  function authHeaders() {
    if (global.MyndlyAuth) return MyndlyAuth.authHeaders();
    return { 'Content-Type': 'application/json' };
  }

  function hasRemoteData(data) {
    return Boolean(
      (data.reminders && data.reminders.length) ||
      (data.todos && data.todos.length) ||
      (data.dailyTasks && data.dailyTasks.length)
    );
  }

  async function syncWithServer(state) {
    if (!isEnabled()) return null;

    var ts = state.updatedAt || Date.now();
    var payload = {
      reminders: stampItems(state.reminders, ts),
      todos: stampItems(state.todos, ts),
      dailyTasks: stampItems(state.dailyTasks, ts)
    };

    var res = await fetch(getApiBase() + '/api/sync', {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    if (res.status === 401 && global.MyndlyAuth) {
      MyndlyAuth.logout();
      throw new Error('Session expired — sign in again');
    }
    if (!res.ok) throw new Error('Cloud sync failed (' + res.status + ')');

    var data = await res.json();
    return {
      reminders: data.reminders || [],
      todos: data.todos || [],
      dailyTasks: data.dailyTasks || [],
      updatedAt: data.syncedAt || ts,
      hasData: hasRemoteData(data)
    };
  }

  async function flushPush() {
    if (!getStateFn || pushInFlight) {
      if (getStateFn) pendingPush = true;
      return;
    }

    pushInFlight = true;
    pendingPush = false;

    try {
      await syncWithServer(getStateFn());
    } catch (err) {
      console.warn('Myndly cloud sync push failed', err);
    } finally {
      pushInFlight = false;
      if (pendingPush) flushPush();
    }
  }

  function schedulePush(getState) {
    if (!isLoggedIn()) return;
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
      var remote = await syncWithServer(local);

      if (remote) {
        opts.applyRemote(remote);
        setLocalUpdatedAt(remote.updatedAt);
        return { appliedRemote: true };
      }

      return { appliedRemote: false };
    } catch (err) {
      console.warn('Myndly cloud sync failed', err);
      return { appliedRemote: false, error: err };
    }
  }

  global.MyndlyApiSync = {
    isEnabled: isEnabled,
    isLoggedIn: isLoggedIn,
    getApiBase: getApiBase,
    schedulePush: schedulePush,
    pullAndMerge: pullAndMerge,
    syncWithServer: syncWithServer
  };
})(typeof window !== 'undefined' ? window : global);
