/**
 * Email login — talks to notify_backend (separate repo).
 */
(function (global) {
  var STORAGE_TOKEN = 'rh_auth_token';
  var STORAGE_USER = 'rh_auth_user';
  var cachedUser = null;

  function getApiBase() {
    if (global.MyndlyApiSync && MyndlyApiSync.getApiBase) {
      return MyndlyApiSync.getApiBase();
    }
    var meta = document.querySelector('meta[name="myndly-api"]');
    if (meta && meta.content) {
      return meta.content.trim().replace(/\/$/, '');
    }
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    return '';
  }

  function readStoredUser() {
    if (cachedUser) return cachedUser;
    try {
      var raw = localStorage.getItem(STORAGE_USER);
      cachedUser = raw ? JSON.parse(raw) : null;
      return cachedUser;
    } catch (e) {
      return null;
    }
  }

  function normalizeUser(user) {
    if (!user) return null;
    return {
      id: String(user.id || user._id || ''),
      email: user.email || '',
      name: user.name || ''
    };
  }

  function saveSession(token, user) {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(normalizeUser(user)));
    cachedUser = normalizeUser(user);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    cachedUser = null;
  }

  function getToken() {
    try {
      return localStorage.getItem(STORAGE_TOKEN) || '';
    } catch (e) {
      return '';
    }
  }

  function isLoggedIn() {
    return Boolean(getToken() && readStoredUser());
  }

  function getUser() {
    return readStoredUser();
  }

  function authHeaders(extra) {
    var headers = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
  }

  function readError(data, status) {
    if (data && data.error) return data.error;
    if (data && Array.isArray(data.errors) && data.errors.length) {
      return data.errors[0].msg || 'Request failed';
    }
    return 'Request failed (' + status + ')';
  }

  async function refreshAccessToken() {
    var base = getApiBase();
    if (!base) return false;

    var res = await fetch(base + '/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (!res.ok) return false;

    var data = await res.json();
    if (!data.accessToken) return false;

    saveSession(data.accessToken, readStoredUser());
    return true;
  }

  async function apiRequest(path, options, allowRetry) {
    var base = getApiBase();
    if (!base) throw new Error('API not configured');

    var res = await fetch(base + path, Object.assign({
      credentials: 'include'
    }, options, {
      headers: authHeaders(options && options.headers)
    }));

    if (res.status === 401 && allowRetry !== false && path !== '/api/auth/refresh') {
      var refreshed = await refreshAccessToken();
      if (refreshed) return apiRequest(path, options, false);
      clearSession();
      throw new Error('Session expired — sign in again');
    }

    var data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok) throw new Error(readError(data, res.status));
    return data;
  }

  async function register(email, password) {
    var data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password })
    });
    saveSession(data.accessToken, data.user);
    return normalizeUser(data.user);
  }

  async function login(email, password) {
    var data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password })
    });
    saveSession(data.accessToken, data.user);
    return normalizeUser(data.user);
  }

  async function restoreSession() {
    if (!getToken()) return null;

    try {
      var data = await apiRequest('/api/auth/me', { method: 'GET' });
      saveSession(getToken(), data);
      return normalizeUser(data);
    } catch (e) {
      clearSession();
      return null;
    }
  }

  async function logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    clearSession();
  }

  global.MyndlyAuth = {
    getApiBase: getApiBase,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    getToken: getToken,
    authHeaders: authHeaders,
    register: register,
    login: login,
    restoreSession: restoreSession,
    logout: logout
  };
})(typeof window !== 'undefined' ? window : global);
