/**
 * Login / register modal + profile section UI.
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
    if (title) title.textContent = isLogin ? 'Sign in' : 'Sign up';
    setAuthError('');
  }

  function openAuthModal(mode) {
    closeProfileModal();
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

  function setProfileSaveError(message) {
    var el = $('profileSaveError');
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
  }

  function renderAvatarPreview(user, urlOverride) {
    var avatarEl = $('profileAvatar');
    var imgEl = $('profileAvatarImg');
    var url = (urlOverride !== undefined ? urlOverride : (user && user.avatarUrl) || '').trim();

    if (imgEl && avatarEl) {
      if (url) {
        imgEl.src = url;
        imgEl.hidden = false;
        avatarEl.hidden = true;
        imgEl.onerror = function () {
          imgEl.hidden = true;
          avatarEl.hidden = false;
          avatarEl.textContent = getInitials(user);
        };
      } else {
        imgEl.removeAttribute('src');
        imgEl.hidden = true;
        avatarEl.hidden = false;
        avatarEl.textContent = getInitials(user);
      }
    }
  }

  function fillProfileForm(user) {
    var nameInput = $('profileDisplayName');
    var emailInput = $('profileEmailReadonly');
    var phoneInput = $('profilePhone');
    var urlInput = $('profileAvatarUrl');

    if (nameInput) nameInput.value = (user && user.name) || '';
    if (emailInput) emailInput.value = (user && user.email) || '';
    if (phoneInput) phoneInput.value = (user && user.phone) || '';
    if (urlInput) urlInput.value = (user && user.avatarUrl) || '';
    renderAvatarPreview(user);
    setProfileSaveError('');
  }

  function updateProfileSection() {
    var signedIn = $('profileSignedIn');
    var signedOut = $('profileSignedOut');
    var loggedIn = global.MyndlyAuth && MyndlyAuth.isLoggedIn();

    if (signedIn) signedIn.hidden = !loggedIn;
    if (signedOut) signedOut.hidden = loggedIn;

    if (!loggedIn) return;

    var user = MyndlyAuth.getUser();
    fillProfileForm(user);

    var syncEl = $('profileSyncStatus');
    var memberEl = $('profileMemberSince');

    if (syncEl) {
      if (!navigator.onLine) {
        syncEl.textContent = 'Offline — local data saved on this device';
      } else if (global.MyndlyApiSync && MyndlyApiSync.isEnabled()) {
        syncEl.textContent = 'Cloud sync active';
      } else {
        syncEl.textContent = 'Signed in';
      }
    }

    if (memberEl) {
      var since = formatMemberSince(user && user.createdAt);
      memberEl.textContent = since;
      memberEl.hidden = !since;
    }
  }

  async function openProfileModal() {
    closeAuthModal();
    if (global.MyndlyAuth && MyndlyAuth.isLoggedIn()) {
      try {
        await MyndlyAuth.fetchProfile();
      } catch (e) {
        console.warn('Could not refresh profile', e);
      }
    }
    updateProfileSection();
    var modal = $('profileModal');
    if (modal) modal.classList.add('open');
  }

  function closeProfileModal() {
    var modal = $('profileModal');
    if (modal) modal.classList.remove('open');
  }

  function getInitials(user) {
    if (!user) return '?';
    if (user.name && user.name.trim()) {
      return user.name.trim().charAt(0).toUpperCase();
    }
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  }

  function formatMemberSince(iso) {
    if (!iso) return '';
    try {
      return 'Member since ' + new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  function updateAccountButton() {
    var btn = $('accountBtn');
    if (!btn || !global.MyndlyAuth) return;

    if (MyndlyAuth.isLoggedIn()) {
      var user = MyndlyAuth.getUser();
      btn.textContent = 'Profile';
      btn.title = user && user.email ? ('Profile — ' + user.email) : 'Profile';
      btn.classList.add('account-btn--signed-in');
    } else {
      btn.textContent = 'Sign in';
      btn.title = 'Profile & sign in';
      btn.classList.remove('account-btn--signed-in');
    }
    updateProfileSection();
  }

  function notifyAuthChange(loggedIn) {
    updateAccountButton();
    if (loggedIn) updateProfileSection();
    if (typeof authChangeHandler === 'function') {
      authChangeHandler(loggedIn);
    }
  }

  function friendlyFetchError(err) {
    if (location.hostname.endsWith('github.io')) {
      return 'Sign in does not work on GitHub Pages. Use http://localhost:3000 with notify_backend running.';
    }
    if (!err || !err.message) return 'Something went wrong';
    if (err.message === 'Failed to fetch' || /CORS/i.test(err.message)) {
      var api = (global.MyndlyAuth && MyndlyAuth.getApiBase()) || location.origin;
      return 'Backend unreachable. Open ONLY http://localhost:3000 (not :3001). API: ' + api + '/api/...';
    }
    return err.message;
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
      openProfileModal();
    } catch (err) {
      setAuthError(friendlyFetchError(err) || 'Sign in failed');
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
      openProfileModal();
    } catch (err) {
      setAuthError(friendlyFetchError(err) || 'Registration failed');
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (!global.MyndlyAuth || !MyndlyAuth.isLoggedIn()) return;

    var name = ($('profileDisplayName') && $('profileDisplayName').value.trim()) || '';
    var phone = ($('profilePhone') && $('profilePhone').value.trim()) || '';
    var avatarUrl = ($('profileAvatarUrl') && $('profileAvatarUrl').value.trim()) || '';

    try {
      setProfileSaveError('');
      var user = await MyndlyAuth.updateProfile({ name: name, phone: phone, avatarUrl: avatarUrl });
      fillProfileForm(user);
      updateAccountButton();
      var saveBtn = $('profileForm') && $('profileForm').querySelector('.profile-save-btn');
      if (saveBtn) {
        var oldText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        setTimeout(function () { saveBtn.textContent = oldText; }, 1500);
      }
    } catch (err) {
      setProfileSaveError(friendlyFetchError(err) || 'Could not save profile');
    }
  }

  function handleLogout() {
    if (!global.MyndlyAuth) return;
    MyndlyAuth.logout().then(function () {
      closeProfileModal();
      notifyAuthChange(false);
    });
  }

  function initAuthUI(options) {
    authChangeHandler = options && options.onAuthChange;

    var accountBtn = $('accountBtn');
    var authCloseBtn = $('authCloseBtn');
    var profileCloseBtn = $('profileCloseBtn');
    var profileLogoutBtn = $('profileLogoutBtn');
    var profileSignInBtn = $('profileSignInBtn');
    var profileSignUpBtn = $('profileSignUpBtn');
    var profileForm = $('profileForm');
    var profileAvatarUrl = $('profileAvatarUrl');
    var profileDisplayName = $('profileDisplayName');
    var loginForm = $('authLoginForm');
    var registerForm = $('authRegisterForm');
    var loginTab = $('authTabLogin');
    var registerTab = $('authTabRegister');
    var authModal = $('authModal');
    var profileModal = $('profileModal');

    if (accountBtn) {
      accountBtn.addEventListener('click', function () {
        openProfileModal();
      });
    }

    if (profileCloseBtn) profileCloseBtn.addEventListener('click', closeProfileModal);
    if (profileLogoutBtn) profileLogoutBtn.addEventListener('click', handleLogout);
    if (profileSignInBtn) profileSignInBtn.addEventListener('click', function () { openAuthModal('login'); });
    if (profileSignUpBtn) profileSignUpBtn.addEventListener('click', function () { openAuthModal('register'); });
    if (profileForm) profileForm.addEventListener('submit', handleProfileSubmit);

    if (profileAvatarUrl) {
      profileAvatarUrl.addEventListener('input', function () {
        renderAvatarPreview(MyndlyAuth.getUser(), profileAvatarUrl.value.trim());
      });
    }

    if (profileDisplayName) {
      profileDisplayName.addEventListener('input', function () {
        var user = MyndlyAuth.getUser();
        var avatarEl = $('profileAvatar');
        if (avatarEl && !($('profileAvatarUrl') && $('profileAvatarUrl').value.trim())) {
          avatarEl.textContent = getInitials({ name: profileDisplayName.value, email: user && user.email });
        }
      });
    }

    if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
    if (loginTab) loginTab.addEventListener('click', function () { setAuthMode('login'); });
    if (registerTab) registerTab.addEventListener('click', function () { setAuthMode('register'); });
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

    if (authModal) {
      authModal.addEventListener('click', function (e) {
        if (e.target === authModal) closeAuthModal();
      });
    }

    if (profileModal) {
      profileModal.addEventListener('click', function (e) {
        if (e.target === profileModal) closeProfileModal();
      });
    }

    updateAccountButton();
  }

  global.MyndlyAuthUI = {
    init: initAuthUI,
    open: openAuthModal,
    close: closeAuthModal,
    openProfile: openProfileModal,
    closeProfile: closeProfileModal,
    updateAccountButton: updateAccountButton,
    updateProfileSection: updateProfileSection
  };
})(typeof window !== 'undefined' ? window : global);
