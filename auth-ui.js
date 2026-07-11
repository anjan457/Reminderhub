/**
 * Login / register modal UI.
 */
(function (global) {
  var authChangeHandler = null;

  function $(id) {
    return document.getElementById(id);
  }

  function setAuthError(message) {
    var el = $('authError');
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
  }

  function setAuthMode(mode) {
    var isLogin = mode === 'login';
    var loginForm = $('authLoginForm');
    var registerForm = $('authRegisterForm');
    var loginTab = $('authTabLogin');
    var registerTab = $('authTabRegister');
    var title = $('authModalTitle');

    if (loginForm) loginForm.hidden = !isLogin;
    if (registerForm) registerForm.hidden = isLogin;
    if (loginTab) loginTab.classList.toggle('active', isLogin);
    if (registerTab) registerTab.classList.toggle('active', !isLogin);
    if (title) title.textContent = isLogin ? 'Sign in' : 'Create account';
    setAuthError('');
  }

  function openAuthModal(mode) {
    var modal = $('authModal');
    if (!modal) return;
    setAuthMode(mode || 'login');
    modal.classList.add('open');
  }

  function closeAuthModal() {
    var modal = $('authModal');
    if (modal) modal.classList.remove('open');
    setAuthError('');
  }

  function updateAccountButton() {
    var btn = $('accountBtn');
    if (!btn || !global.MyndlyAuth) return;

    if (MyndlyAuth.isLoggedIn()) {
      var user = MyndlyAuth.getUser();
      btn.textContent = user && user.email ? user.email.split('@')[0] : 'Account';
      btn.title = user ? ('Signed in as ' + user.email) : 'Account';
      btn.classList.add('account-btn--signed-in');
    } else {
      btn.textContent = 'Sign in';
      btn.title = 'Sign in to sync your data';
      btn.classList.remove('account-btn--signed-in');
    }
  }

  function notifyAuthChange(loggedIn) {
    updateAccountButton();
    if (typeof authChangeHandler === 'function') {
      authChangeHandler(loggedIn);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    var email = ($('authLoginEmail') && $('authLoginEmail').value) || '';
    var password = ($('authLoginPassword') && $('authLoginPassword').value) || '';

    try {
      setAuthError('');
      await MyndlyAuth.login(email, password);
      closeAuthModal();
      notifyAuthChange(true);
    } catch (err) {
      setAuthError(err.message || 'Sign in failed');
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    var email = ($('authRegisterEmail') && $('authRegisterEmail').value) || '';
    var password = ($('authRegisterPassword') && $('authRegisterPassword').value) || '';
    var confirm = ($('authRegisterConfirm') && $('authRegisterConfirm').value) || '';

    if (password !== confirm) {
      setAuthError('Passwords do not match');
      return;
    }

    try {
      setAuthError('');
      await MyndlyAuth.register(email, password);
      closeAuthModal();
      notifyAuthChange(true);
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
    }
  }

  function handleLogout() {
    if (!global.MyndlyAuth) return;
    MyndlyAuth.logout().then(function () {
      notifyAuthChange(false);
    });
  }

  function initAuthUI(options) {
    authChangeHandler = options && options.onAuthChange;

    var accountBtn = $('accountBtn');
    var accountLogoutBtn = $('accountLogoutBtn');
    var authCloseBtn = $('authCloseBtn');
    var loginForm = $('authLoginForm');
    var registerForm = $('authRegisterForm');
    var loginTab = $('authTabLogin');
    var registerTab = $('authTabRegister');
    var modal = $('authModal');

    if (accountBtn) {
      accountBtn.addEventListener('click', function () {
        if (MyndlyAuth.isLoggedIn()) return;
        openAuthModal('login');
      });
    }

    if (accountLogoutBtn) {
      accountLogoutBtn.addEventListener('click', handleLogout);
    }

    if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
    if (loginTab) loginTab.addEventListener('click', function () { setAuthMode('login'); });
    if (registerTab) registerTab.addEventListener('click', function () { setAuthMode('register'); });
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeAuthModal();
      });
    }

    updateAccountButton();
  }

  global.MyndlyAuthUI = {
    init: initAuthUI,
    open: openAuthModal,
    close: closeAuthModal,
    updateAccountButton: updateAccountButton
  };
})(typeof window !== 'undefined' ? window : global);
