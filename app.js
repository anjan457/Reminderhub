const STORAGE_KEYS = {
    theme: 'rh_theme',
    dark: 'rh_dark',
    reminders: 'rh_reminders',
    todos: 'rh_todos',
    dailyTasks: 'rh_daily_tasks',
    customCategories: 'rh_custom_categories',
    focusAnim: 'rh_focus_anim',
    focusSessions: 'rh_focus_sessions',
    reminderShowCompleted: 'rh_reminder_show_completed',
    notificationSettings: 'rh_notification_settings',
    notificationLog: 'rh_notification_log'
};

const FOCUS_ANIMS = ['breathe', 'aurora', 'waves', 'orbit', 'ripple', 'nebula', 'float', 'none'];
const FOCUS_ANIM_LABELS = { breathe: 'Breathe', aurora: 'Aurora', waves: 'Waves', orbit: 'Orbit', ripple: 'Ripple', nebula: 'Nebula', float: 'Float', none: 'Off' };
const FOCUS_ANIM_CLASSES = FOCUS_ANIMS.map(function(a) { return 'focus-anim--' + a; });
const THEME_TO_FOCUS_ANIM = { default: 'breathe', blue: 'waves', green: 'float', purple: 'nebula' };

const DEFAULT_REMINDER_CATEGORIES = ['Personal', 'Study', 'Work', 'Health', 'Event'];
const DEFAULT_TODO_CATEGORIES = ['Study', 'Market', 'Work', 'Personal', 'Health'];
let customCategories = [];

const THEMES = {
    default: { bg: '#f5f7fb', panel: '#ffffff', panelSoft: '#f8fafc', border: '#e5e7eb', text: '#1f2937', muted: '#6b7280', primary: '#6366f1', primaryStrong: '#4f46e5' },
    blue: { bg: '#eff6ff', panel: '#ffffff', panelSoft: '#f8fbff', border: '#dbeafe', text: '#172554', muted: '#64748b', primary: '#2563eb', primaryStrong: '#1d4ed8' },
    green: { bg: '#f0fdf4', panel: '#ffffff', panelSoft: '#f7fef9', border: '#d1fae5', text: '#14532d', muted: '#4b5563', primary: '#16a34a', primaryStrong: '#15803d' },
    purple: { bg: '#faf5ff', panel: '#ffffff', panelSoft: '#fcf8ff', border: '#eadcff', text: '#3b0764', muted: '#6b7280', primary: '#9333ea', primaryStrong: '#7e22ce' }
};

const DARK_OVERRIDES = {
    bg: '#0f172a', panel: '#111827', panelSoft: '#1f2937', border: '#334155', text: '#e5e7eb', muted: '#94a3b8'
};

const reminderForm = document.getElementById('reminderForm');
const homeReminderList = document.getElementById('homeReminderList');
const allReminderList = document.getElementById('allReminderList');
const totalRemindersEl = document.getElementById('totalReminders');
const activeTodosEl = document.getElementById('activeTodos');
const todayEventsEl = document.getElementById('todayEvents');
const modal = document.getElementById('allRemindersModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');
const todoInput = document.getElementById('todoInput');
const todoTimeInput = document.getElementById('todoTimeInput');
const todoCategoryInput = document.getElementById('todoCategoryInput');
const todoNoteInput = document.getElementById('todoNoteInput');
const todoNotifyInput = document.getElementById('todoNotifyInput');
const todoSearchInput = document.getElementById('todoSearchInput');
const reminderDigestBtn = document.getElementById('reminderDigestBtn');
const notifSettingsModal = document.getElementById('notifSettingsModal');
const notifSettingsClose = document.getElementById('notifSettingsClose');
const notifEmailInput = document.getElementById('notifEmailInput');
const notifDailyDigest = document.getElementById('notifDailyDigest');
const notifBrowserEnabled = document.getElementById('notifBrowserEnabled');
const notifTimezoneLabel = document.getElementById('notifTimezoneLabel');
const notifSaveBtn = document.getElementById('notifSaveBtn');
const notifPermissionBtn = document.getElementById('notifPermissionBtn');
const notifLogList = document.getElementById('notifLogList');
const todoList = document.getElementById('todoList');
const addTodoBtn = document.getElementById('addTodoBtn');
const selectedDateTasks = document.getElementById('selectedDateTasks');
const currentDateLine = document.getElementById('currentDateLine');
const todayFabBtn = document.getElementById('todayFabBtn');
const todayFabBadge = document.getElementById('todayFabBadge');
const todayPanel = document.getElementById('todayPanel');
const todayBackdrop = document.getElementById('todayBackdrop');
const todayPanelClose = document.getElementById('todayPanelClose');
const todayPanelBody = document.getElementById('todayPanelBody');
const categorySelect = document.getElementById('category');
const categoryCtxMenu = document.getElementById('categoryCtxMenu');
const reminderCatPickerBtn = document.getElementById('reminderCatPickerBtn');
const reminderCatPickerPanel = document.getElementById('reminderCatPickerPanel');
const reminderCatPickerList = document.getElementById('reminderCatPickerList');
const todoCatPickerBtn = document.getElementById('todoCatPickerBtn');
const todoCatPickerPanel = document.getElementById('todoCatPickerPanel');
const todoCatPickerList = document.getElementById('todoCatPickerList');

const CATEGORY_PICKERS = [
    { key: 'reminder', defaults: DEFAULT_REMINDER_CATEGORIES, btn: reminderCatPickerBtn, panel: reminderCatPickerPanel, list: reminderCatPickerList, hidden: categorySelect },
    { key: 'todo', defaults: DEFAULT_TODO_CATEGORIES, btn: todoCatPickerBtn, panel: todoCatPickerPanel, list: todoCatPickerList, hidden: todoCategoryInput }
];

let ctxCategoryName = null;
let ctxPickerKey = null;
const darkModeToggle = document.getElementById('darkModeToggle');
const themeMenuBtn = document.getElementById('themeMenuBtn');
const themeMenuPanel = document.getElementById('themeMenuPanel');
const openFocusBtn = document.getElementById('openFocusBtn');
const focusFullscreen = document.getElementById('focusFullscreen');
const focusAnimLayer = document.getElementById('focusAnimLayer');
const focusBackBtn = document.getElementById('focusBackBtn');
const themeButtons = Array.from(document.querySelectorAll('.btn-theme'));

// Feature 1: Quick dark mode toggle
const quickDarkBtn = document.getElementById('quickDarkBtn');

// Feature 6: Show completed reminders toggle
const showCompletedBtn = document.getElementById('showCompletedBtn');
let showCompletedReminders = readStorageString(STORAGE_KEYS.reminderShowCompleted, 'false') === 'true';

// Feature 7: Filter chips
const todoFilterChips = document.getElementById('todoFilterChips');
let activeTodoFilter = 'all';

let reminders = readStorageArray(STORAGE_KEYS.reminders);
let todos = normalizeTodos(readStorageArray(STORAGE_KEYS.todos));
let dailyTasks = normalizeDailyTasks(readStorageArray(STORAGE_KEYS.dailyTasks));
let calendarDate = new Date();
let selectedCalendarDate = getTodayISO();

function getTodayISO() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}

function readStorageArray(key) {
    try {
        const value = localStorage.getItem(key);
        const parsed = value ? JSON.parse(value) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Invalid localStorage data for', key, error);
        return [];
    }
}

function readStorageString(key, fallback) {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
}

function saveReminders() {
    localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(reminders));
    pushStateToOfflineStore();
}
function saveTodos() {
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
    pushStateToOfflineStore();
}
function saveDailyTasks() { localStorage.setItem(STORAGE_KEYS.dailyTasks, JSON.stringify(dailyTasks)); }

function pushStateToOfflineStore() {
    if (!window.MyndlySync) return Promise.resolve();
    var payload = {
        todos: todos,
        reminders: reminders,
        notificationSettings: getNotificationSettings(),
        updatedAt: Date.now()
    };
    return MyndlySync.writeAppState(payload).then(function () {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'STATE_UPDATED' });
        }
    }).catch(function (err) {
        console.warn('Offline sync write failed', err);
    });
}

function mergeTodosFromServiceWorker(updatedTodos) {
    if (!Array.isArray(updatedTodos)) return;
    todos = normalizeTodos(updatedTodos);
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
    renderTodos();
    updateStats();
}

async function ensureTodoNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    var permission = await Notification.requestPermission();
    return permission === 'granted';
}
function saveTheme(themeName) { localStorage.setItem(STORAGE_KEYS.theme, themeName); }
function saveDarkMode(enabled) { localStorage.setItem(STORAGE_KEYS.dark, String(enabled)); }

function applyCssVariables(palette) {
    const root = document.documentElement;
    root.style.setProperty('--bg', palette.bg);
    root.style.setProperty('--panel', palette.panel);
    root.style.setProperty('--panel-soft', palette.panelSoft);
    root.style.setProperty('--border', palette.border);
    root.style.setProperty('--text', palette.text);
    root.style.setProperty('--muted', palette.muted);
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-strong', palette.primaryStrong);
}

function updateThemeButtonState(themeName) {
    themeButtons.forEach(function (button) {
        button.classList.toggle('active', button.dataset.theme === themeName);
    });
}

function getSavedThemeName() {
    const savedTheme = readStorageString(STORAGE_KEYS.theme, 'default');
    return THEMES[savedTheme] ? savedTheme : 'default';
}

function isDarkModeEnabled() {
    return readStorageString(STORAGE_KEYS.dark, 'false') === 'true';
}

function getMergedPalette(themeName, darkEnabled) {
    const baseTheme = THEMES[themeName] || THEMES.default;
    if (!darkEnabled) return baseTheme;
    return {
        ...baseTheme,
        bg: DARK_OVERRIDES.bg,
        panel: DARK_OVERRIDES.panel,
        panelSoft: DARK_OVERRIDES.panelSoft,
        border: DARK_OVERRIDES.border,
        text: DARK_OVERRIDES.text,
        muted: DARK_OVERRIDES.muted
    };
}

function applyTheme(themeName, darkEnabled) {
    const palette = getMergedPalette(themeName, darkEnabled);
    applyCssVariables(palette);
    updateThemeButtonState(themeName);
    document.body.classList.toggle('dark', darkEnabled);
    if (darkModeToggle) darkModeToggle.textContent = darkEnabled ? '☀️ Light' : '🌙 Dark';
    // Feature 1: update quick dark btn icon
    if (quickDarkBtn) quickDarkBtn.textContent = darkEnabled ? '☀️' : '🌙';
}

function setTheme(themeName) {
    const normalizedTheme = THEMES[themeName] ? themeName : 'default';
    saveTheme(normalizedTheme);
    applyTheme(normalizedTheme, isDarkModeEnabled());
}

function toggleDarkMode() {
    const nextState = !isDarkModeEnabled();
    saveDarkMode(nextState);
    applyTheme(getSavedThemeName(), nextState);
}

function applySavedTheme() {
    applyTheme(getSavedThemeName(), isDarkModeEnabled());
}

function getSavedFocusAnim() {
    const saved = readStorageString(STORAGE_KEYS.focusAnim, '');
    if (FOCUS_ANIMS.indexOf(saved) >= 0) return saved;
    return THEME_TO_FOCUS_ANIM[getSavedThemeName()] || 'breathe';
}

function applyFocusAnim(id) {
    if (!focusAnimLayer) return;
    const picked = FOCUS_ANIMS.indexOf(id) >= 0 ? id : 'breathe';
    focusAnimLayer.classList.remove.apply(focusAnimLayer.classList, FOCUS_ANIM_CLASSES);
    focusAnimLayer.classList.add('focus-anim--' + picked);
    localStorage.setItem(STORAGE_KEYS.focusAnim, picked);
    updateFocusSwitcher(picked);
}

function updateFocusSwitcher(current) {
    var nameEl = document.getElementById('focusSwName');
    var dotsEl = document.getElementById('focusSwDots');
    if (nameEl) nameEl.textContent = FOCUS_ANIM_LABELS[current] || current;
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    FOCUS_ANIMS.forEach(function(anim) {
        var dot = document.createElement('button');
        dot.className = 'focus-sw-dot' + (anim === current ? ' active' : '');
        dot.title = FOCUS_ANIM_LABELS[anim] || anim;
        dot.addEventListener('click', function(e) { e.stopPropagation(); applyFocusAnim(anim); });
        dotsEl.appendChild(dot);
    });
}

function openFocusFullscreen() {
    if (!focusFullscreen) return;
    closeThemeMenu();
    var current = getSavedFocusAnim();
    applyFocusAnim(current);
    focusFullscreen.hidden = false;
    document.body.style.overflow = 'hidden';
    // Feature 12: update session count
    updatePomodoroSessionCount();
}

function closeFocusFullscreen() {
    if (!focusFullscreen) return;
    focusFullscreen.hidden = true;
    document.body.style.overflow = '';
    // Stop ambient sounds when leaving focus
    stopAllAmbient();
    // Pause pomodoro
    if (pomodoroRunning) togglePomodoro();
}

function extractTags(text) {
    const matches = String(text).match(/#[a-zA-Z0-9_]+/g) || [];
    return Array.from(new Set(matches.map(function (tag) { return tag.toLowerCase(); })));
}

function normalizeTodos(rawTodos) {
    return rawTodos.map(function (todo, index) {
        const title = typeof todo.title === 'string' ? todo.title : (todo.text || 'Untitled Task');
        return {
            id: todo.id || Date.now() + index,
            title: title,
            completed: Boolean(todo.completed),
            time: todo.time || '',
            date: todo.date || getTodayISO(),
            category: todo.category || 'Personal',
            priority: todo.priority || 'Medium',
            note: todo.note || '',
            notifyBefore: String(todo.notifyBefore || 5),
            notificationSentFor: todo.notificationSentFor || null,
            tags: Array.isArray(todo.tags) ? todo.tags.map(function (tag) { return String(tag).toLowerCase(); }) : extractTags(title + ' ' + (todo.note || '')),
            // Feature 9: subtasks
            subtasks: Array.isArray(todo.subtasks) ? todo.subtasks : []
        };
    });
}

function normalizeDailyTasks(rawTasks) {
    return rawTasks.map(function (task, index) {
        return {
            id: task.id || Date.now() + 5000 + index,
            title: task.title || 'Untitled Task',
            date: task.date || getTodayISO(),
            time: task.time || '09:00',
            category: task.category || 'Personal',
            priority: task.priority || 'Medium',
            note: task.note || '',
            tags: Array.isArray(task.tags) ? task.tags.map(function (tag) { return String(tag).toLowerCase(); }) : extractTags((task.title || '') + ' ' + (task.note || '')),
            completed: Boolean(task.completed),
            linkedTodoId: task.linkedTodoId || null
        };
    });
}

function createReminderObject(formData) {
    const dateTime = new Date(formData.date + 'T' + formData.time);
    return {
        id: Date.now(),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        category: formData.category,
        priority: formData.priority,
        note: formData.note,
        pinOrder: formData.pinOrder ? Number(formData.pinOrder) : null,
        // Feature 6
        completed: false,
        // Feature 8
        repeat: formData.repeat || 'none',
        createdAt: new Date().toISOString(),
        targetISO: dateTime.toISOString()
    };
}

function createDailyTaskObject(formData) {
    return {
        id: Date.now() + Math.floor(Math.random() * 10000),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        category: formData.category,
        priority: formData.priority,
        note: formData.note,
        tags: extractTags(formData.title + ' ' + (formData.note || '')),
        completed: false,
        linkedTodoId: formData.linkedTodoId || null
    };
}

function createTodoObject(formData) {
    return {
        id: Date.now(),
        title: formData.title,
        completed: false,
        time: formData.time || '',
        date: formData.date || selectedCalendarDate,
        category: formData.category || 'Personal',
        priority: formData.priority || 'Medium',
        note: formData.note || '',
        notifyBefore: String(formData.notifyBefore || 5),
        notificationSentFor: null,
        tags: extractTags(formData.title + ' ' + (formData.note || '')),
        // Feature 9
        subtasks: []
    };
}

function loadCustomCategories() {
    customCategories = [];
    const seen = new Set();
    readStorageArray(STORAGE_KEYS.customCategories).forEach(function (item) {
        if (typeof item !== 'string') return;
        const trimmed = item.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        customCategories.push(trimmed);
    });
}

function saveCustomCategories() {
    localStorage.setItem(STORAGE_KEYS.customCategories, JSON.stringify(customCategories));
}

function mergeCategoryLists(defaults) {
    const seen = new Set(defaults.map(function (d) { return d.toLowerCase(); }));
    const merged = defaults.slice();
    customCategories.forEach(function (name) {
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(name);
    });
    return merged;
}

function getPickerByKey(key) {
    return CATEGORY_PICKERS.find(function (p) { return p.key === key; });
}

function closeAllCategoryPanels() {
    CATEGORY_PICKERS.forEach(function (p) {
        if (p.panel) p.panel.hidden = true;
    });
}

function toggleCategoryPanel(picker) {
    if (!picker || !picker.panel) return;
    const willOpen = picker.panel.hidden;
    closeAllCategoryPanels();
    picker.panel.hidden = !willOpen;
}

function hideCategoryCtxMenu() {
    if (categoryCtxMenu) categoryCtxMenu.hidden = true;
    ctxCategoryName = null;
    ctxPickerKey = null;
}

function showCategoryCtxMenu(x, y, pickerKey, categoryName) {
    if (!categoryCtxMenu) return;
    ctxPickerKey = pickerKey;
    ctxCategoryName = categoryName || null;
    const addBtn = categoryCtxMenu.querySelector('[data-ctx="add"]');
    const renameBtn = categoryCtxMenu.querySelector('[data-ctx="rename"]');
    const deleteBtn = categoryCtxMenu.querySelector('[data-ctx="delete"]');
    const onItem = Boolean(categoryName);
    if (addBtn) addBtn.hidden = onItem;
    if (renameBtn) renameBtn.hidden = !onItem;
    if (deleteBtn) deleteBtn.hidden = !onItem;
    categoryCtxMenu.hidden = false;
    categoryCtxMenu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
    categoryCtxMenu.style.top = Math.min(y, window.innerHeight - 120) + 'px';
}

function setPickerValue(picker, name) {
    if (!picker || !picker.hidden) return;
    picker.hidden.value = name;
    if (picker.btn) picker.btn.textContent = name + ' ▾';
}

function renderCategoryPickerList(picker) {
    if (!picker || !picker.list) return;
    const list = mergeCategoryLists(picker.defaults);
    const current = picker.hidden ? picker.hidden.value : '';
    picker.list.innerHTML = list.map(function (name) {
        const active = name.toLowerCase() === String(current).toLowerCase() ? ' is-active' : '';
        return '<li class="cat-picker-item' + active + '" data-cat="' + escapeHTML(name) + '">' + escapeHTML(name) + '</li>';
    }).join('');
}

function refreshAllCategoryPickers() {
    CATEGORY_PICKERS.forEach(renderCategoryPickerList);
}

function renderAllCategoryPickers() {
    refreshAllCategoryPickers();
}

function migrateCategoryName(oldName, newName) {
    const oldKey = String(oldName).toLowerCase();
    const next = String(newName).trim();
    if (!next) return;
    reminders.forEach(function (r) {
        if (String(r.category).toLowerCase() === oldKey) r.category = next;
    });
    todos.forEach(function (t) {
        if (String(t.category).toLowerCase() === oldKey) t.category = next;
    });
    dailyTasks.forEach(function (t) {
        if (String(t.category).toLowerCase() === oldKey) t.category = next;
    });
    saveReminders();
    saveTodos();
    saveDailyTasks();
}

function categoryExistsAnywhere(name) {
    const key = String(name).toLowerCase();
    const all = mergeCategoryLists(DEFAULT_REMINDER_CATEGORIES)
        .concat(mergeCategoryLists(DEFAULT_TODO_CATEGORIES));
    const seen = new Set();
    return all.some(function (n) {
        const k = n.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return k === key;
    });
}

function addCustomCategory(rawName, pickerKey) {
    const name = String(rawName || '').trim();
    if (!name) {
        alert('ক্যাটাগরির নাম লিখুন।');
        return false;
    }
    if (categoryExistsAnywhere(name)) {
        alert('এই নামের ক্যাটাগরি আগে থেকেই আছে।');
        return false;
    }
    customCategories.push(name);
    saveCustomCategories();
    renderAllCategoryPickers();
    const picker = pickerKey ? getPickerByKey(pickerKey) : null;
    if (picker) setPickerValue(picker, name);
    return true;
}

function renameCategory(oldName, pickerKey) {
    const next = prompt('Rename category:', oldName);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) {
        alert('নাম খালি রাখা যাবে না।');
        return;
    }
    if (trimmed.toLowerCase() === String(oldName).toLowerCase()) return;
    if (categoryExistsAnywhere(trimmed)) {
        alert('এই নামের ক্যাটাগরি আগে থেকেই আছে।');
        return;
    }
    const idx = customCategories.findIndex(function (n) {
        return n.toLowerCase() === String(oldName).toLowerCase();
    });
    if (idx >= 0) {
        customCategories[idx] = trimmed;
    } else {
        customCategories.push(trimmed);
    }
    saveCustomCategories();
    migrateCategoryName(oldName, trimmed);
    CATEGORY_PICKERS.forEach(function (picker) {
        if (picker.hidden && picker.hidden.value.toLowerCase() === String(oldName).toLowerCase()) {
            setPickerValue(picker, trimmed);
        } else {
            renderCategoryPickerList(picker);
        }
    });
    renderAll();
}

function deleteCategory(name) {
    if (String(name).toLowerCase() === 'personal') {
        alert('Personal ক্যাটাগরি delete করা যাবে না।');
        return;
    }
    if (!confirm('Delete "' + name + '"? এই ক্যাটাগরির সব আইটেম Personal-এ যাবে।')) return;
    customCategories = customCategories.filter(function (n) {
        return n.toLowerCase() !== String(name).toLowerCase();
    });
    saveCustomCategories();
    migrateCategoryName(name, 'Personal');
    CATEGORY_PICKERS.forEach(function (picker) {
        if (picker.hidden && picker.hidden.value.toLowerCase() === String(name).toLowerCase()) {
            setPickerValue(picker, 'Personal');
        } else {
            renderCategoryPickerList(picker);
        }
    });
    renderAll();
}

function initCategoryPickers() {
    CATEGORY_PICKERS.forEach(function (picker) {
        renderCategoryPickerList(picker);
        if (picker.btn) {
            picker.btn.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleCategoryPanel(picker);
            });
        }
        if (picker.list) {
            picker.list.addEventListener('click', function (e) {
                const item = e.target.closest('.cat-picker-item');
                if (!item) return;
                setPickerValue(picker, item.getAttribute('data-cat'));
                closeAllCategoryPanels();
            });
            picker.list.addEventListener('contextmenu', function (e) {
                const item = e.target.closest('.cat-picker-item');
                if (!item) return;
                e.preventDefault();
                showCategoryCtxMenu(e.clientX, e.clientY, picker.key, item.getAttribute('data-cat'));
            });
        }
        if (picker.panel) {
            picker.panel.addEventListener('contextmenu', function (e) {
                if (e.target.closest('.cat-picker-item')) return;
                e.preventDefault();
                showCategoryCtxMenu(e.clientX, e.clientY, picker.key, null);
            });
        }
    });

    if (categoryCtxMenu) {
        categoryCtxMenu.addEventListener('click', function (e) {
            const action = e.target.closest('[data-ctx]');
            if (!action || !ctxPickerKey) return;
            const picker = getPickerByKey(ctxPickerKey);
            const kind = action.getAttribute('data-ctx');
            if (kind === 'add') {
                const name = prompt('New category name:');
                if (name !== null) addCustomCategory(name, ctxPickerKey);
            } else if (kind === 'rename' && ctxCategoryName) {
                renameCategory(ctxCategoryName, ctxPickerKey);
            } else if (kind === 'delete' && ctxCategoryName) {
                deleteCategory(ctxCategoryName);
            }
            hideCategoryCtxMenu();
            if (picker) renderCategoryPickerList(picker);
        });
    }

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.cat-picker') && !e.target.closest('.cat-ctx-menu')) {
            closeAllCategoryPanels();
            hideCategoryCtxMenu();
        }
    });
    document.addEventListener('contextmenu', function (e) {
        if (!e.target.closest('.cat-picker-panel') && !e.target.closest('.cat-ctx-menu')) {
            hideCategoryCtxMenu();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllCategoryPanels();
            hideCategoryCtxMenu();
        }
    });
}

function syncTodoIntoCalendar(todo) {
    const existing = dailyTasks.find(function (task) {
        return task.linkedTodoId === todo.id;
    });
    if (existing) {
        existing.title = todo.title;
        existing.date = todo.date;
        existing.time = todo.time || '09:00';
        existing.category = todo.category;
        existing.priority = todo.priority || 'Medium';
        existing.note = todo.note || '';
        existing.tags = Array.isArray(todo.tags) ? todo.tags.slice() : [];
        existing.completed = todo.completed;
        return;
    }
    dailyTasks.push(createDailyTaskObject({
        title: todo.title,
        date: todo.date,
        time: todo.time || '09:00',
        category: todo.category,
        priority: todo.priority || 'Medium',
        note: todo.note || '',
        linkedTodoId: todo.id
    }));
}

reminderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = {
        title: document.getElementById('title').value.trim(),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value,
        note: document.getElementById('note').value.trim(),
        pinOrder: document.getElementById('pinOrder').value.trim(),
        repeat: document.getElementById('reminderRepeat').value  // Feature 8
    };
    if (!formData.title || !formData.date || !formData.time) {
        alert('Please fill in title, date and time.');
        return;
    }
    reminders.push(createReminderObject(formData));
    sortReminders();
    saveReminders();
    renderAll();
    reminderForm.reset();
    setPickerValue(getPickerByKey('reminder'), 'Personal');
});

addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
    }
});
todoSearchInput.addEventListener('input', renderTodos);

function getLocalTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
        return 'UTC';
    }
}

function getTodayISOInTimezone(timezone) {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    } catch (e) {
        return getTodayISO();
    }
}

function getLocalTimePartsInTimezone(timezone) {
    const parts = { hour: 0, minute: 0 };
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        }).formatToParts(new Date()).forEach(function (p) {
            if (p.type === 'hour') parts.hour = Number(p.value);
            if (p.type === 'minute') parts.minute = Number(p.value);
        });
    } catch (e) {
        const n = new Date();
        parts.hour = n.getHours();
        parts.minute = n.getMinutes();
    }
    return parts;
}

function defaultNotificationSettings() {
    return {
        email: '',
        dailyDigestEnabled: true,
        digestHour: 7,
        browserNotifyEnabled: true,
        timezone: getLocalTimezone(),
        lastDigestDate: null
    };
}

function getNotificationSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.notificationSettings);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!parsed || typeof parsed !== 'object') return defaultNotificationSettings();
        return {
            ...defaultNotificationSettings(),
            ...parsed,
            timezone: parsed.timezone || getLocalTimezone()
        };
    } catch (e) {
        return defaultNotificationSettings();
    }
}

function saveNotificationSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.notificationSettings, JSON.stringify(settings));
    pushStateToOfflineStore();
}

function getNotificationLog() {
    try {
        const raw = readStorageArray(STORAGE_KEYS.notificationLog);
        return raw.filter(function (x) { return x && typeof x === 'object'; }).slice(0, 50);
    } catch (e) {
        return [];
    }
}

function appendNotificationLog(entry) {
    const log = getNotificationLog();
    log.unshift({
        id: Date.now(),
        at: new Date().toISOString(),
        channel: entry.channel || 'system',
        title: entry.title || 'Notification',
        body: entry.body || '',
        email: entry.email || ''
    });
    localStorage.setItem(STORAGE_KEYS.notificationLog, JSON.stringify(log.slice(0, 50)));
    renderNotificationLog();
}

function renderNotificationLog() {
    if (!notifLogList) return;
    const log = getNotificationLog();
    if (!log.length) {
        notifLogList.innerHTML = '<li>No notifications sent yet.</li>';
        return;
    }
    notifLogList.innerHTML = log.map(function (item) {
        const when = new Date(item.at).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        return '<li><strong>' + escapeHTML(item.title) + ' · ' + escapeHTML(item.channel) + '</strong>' +
            escapeHTML(when) + (item.email ? ' → ' + escapeHTML(item.email) : '') +
            '<br>' + escapeHTML(item.body).slice(0, 200) + (item.body.length > 200 ? '…' : '') + '</li>';
    }).join('');
}

function fillNotificationSettingsForm() {
    const s = getNotificationSettings();
    if (notifEmailInput) notifEmailInput.value = s.email || '';
    if (notifDailyDigest) notifDailyDigest.checked = s.dailyDigestEnabled !== false;
    if (notifBrowserEnabled) notifBrowserEnabled.checked = s.browserNotifyEnabled !== false;
    if (notifTimezoneLabel) notifTimezoneLabel.textContent = s.timezone || getLocalTimezone();
    renderNotificationLog();
}

function openNotificationSettings() {
    fillNotificationSettingsForm();
    if (notifSettingsModal) notifSettingsModal.classList.add('open');
}

function closeNotificationSettings() {
    if (notifSettingsModal) notifSettingsModal.classList.remove('open');
}

function saveNotificationSettingsFromForm() {
    const email = (notifEmailInput?.value || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    const settings = {
        ...getNotificationSettings(),
        email: email,
        dailyDigestEnabled: notifDailyDigest ? notifDailyDigest.checked : true,
        browserNotifyEnabled: notifBrowserEnabled ? notifBrowserEnabled.checked : true,
        digestHour: 7,
        timezone: getLocalTimezone()
    };
    saveNotificationSettings(settings);
    if (notifTimezoneLabel) notifTimezoneLabel.textContent = settings.timezone;
    appendNotificationLog({
        channel: 'settings',
        title: 'Settings saved',
        body: email ? 'Daily digest to ' + email + ' at 7:00 AM (' + settings.timezone + ')' : 'Daily digest off (no email)',
        email: email
    });
    alert('Notification settings saved.');
}

async function requestBrowserNotificationPermission() {
    if (!('Notification' in window)) {
        alert('This browser does not support notifications.');
        return false;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        appendNotificationLog({ channel: 'browser', title: 'Browser alerts enabled', body: 'You will receive on-screen notifications.' });
        return true;
    }
    alert('Browser notification permission was not granted.');
    return false;
}

function getUpcomingRemindersForDigest() {
    const settings = getNotificationSettings();
    const tz = settings.timezone || getLocalTimezone();
    const today = getTodayISOInTimezone(tz);
    return reminders
        .filter(function (r) {
            if (r.completed) return false;
            return String(r.date) >= today;
        })
        .sort(function (a, b) {
            return new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00'));
        })
        .slice(0, 25);
}

function buildDigestText(upcoming) {
    const settings = getNotificationSettings();
    const tz = settings.timezone || getLocalTimezone();
    const today = getTodayISOInTimezone(tz);
    if (!upcoming.length) {
        return 'Myndly — ' + today + '\n\nNo upcoming reminders. You are all clear for now.';
    }
    var lines = ['Myndly — Upcoming reminders (' + today + ')', 'Timezone: ' + tz, ''];
    upcoming.forEach(function (r, i) {
        lines.push((i + 1) + '. ' + r.title + ' — ' + formatDate(r.date) + ' ' + to12Hour(r.time) + ' · ' + r.category + ' · ' + priorityBadge(r.priority));
        if (r.note) lines.push('   Note: ' + r.note);
    });
    return lines.join('\n');
}

async function sendDigestEmail(email, subject, body) {
    try {
        const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                _subject: subject,
                _template: 'box',
                _captcha: 'false',
                message: body
            })
        });
        return res.ok;
    } catch (e) {
        console.warn('Email digest failed', e);
        return false;
    }
}

function sendBrowserDigestNotification(summary, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    try {
        new Notification(summary, { body: body.slice(0, 240), tag: 'rh-daily-digest' });
        return true;
    } catch (e) {
        return false;
    }
}

async function runDailyDigest() {
    const settings = getNotificationSettings();
    if (!settings.dailyDigestEnabled) return;

    const upcoming = getUpcomingRemindersForDigest();
    const digestText = buildDigestText(upcoming);
    const subject = 'Myndly — Daily upcoming reminders';
    const summary = upcoming.length
        ? 'You have ' + upcoming.length + ' upcoming reminder(s) today and ahead'
        : 'No upcoming reminders';

    let emailOk = false;
    let browserOk = false;

    if (settings.email && settings.browserNotifyEnabled !== false) {
        emailOk = await sendDigestEmail(settings.email, subject, digestText);
    }

    if (settings.browserNotifyEnabled !== false) {
        browserOk = sendBrowserDigestNotification(summary, digestText);
    }

    const tz = settings.timezone || getLocalTimezone();
    settings.lastDigestDate = getTodayISOInTimezone(tz);
    saveNotificationSettings(settings);

    appendNotificationLog({
        channel: emailOk ? 'email+browser' : (browserOk ? 'browser' : 'digest'),
        title: 'Daily digest (7:00 AM)',
        body: summary + (emailOk ? ' · Email sent' : settings.email ? ' · Email failed' : ''),
        email: settings.email || ''
    });
}

function checkDailyDigest() {
    const settings = getNotificationSettings();
    if (!settings.dailyDigestEnabled) return;

    const tz = settings.timezone || getLocalTimezone();
    const parts = getLocalTimePartsInTimezone(tz);
    const todayKey = getTodayISOInTimezone(tz);
    const digestHour = Number(settings.digestHour) || 7;

    if (parts.hour !== digestHour) return;
    if (settings.lastDigestDate === todayKey) return;

    runDailyDigest();
}

reminderDigestBtn?.addEventListener('click', function () {
    openNotificationSettings();
});
notifSettingsClose?.addEventListener('click', closeNotificationSettings);
notifSettingsModal?.addEventListener('click', function (e) {
    if (e.target === notifSettingsModal) closeNotificationSettings();
});
notifSaveBtn?.addEventListener('click', saveNotificationSettingsFromForm);
notifPermissionBtn?.addEventListener('click', requestBrowserNotificationPermission);

openModalBtn.addEventListener('click', function () { modal.classList.add('open'); });
closeModalBtn.addEventListener('click', function () { modal.classList.remove('open'); });
modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });

document.getElementById('prevMonth')?.addEventListener('click', function () {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
    renderCalendar();
});
document.getElementById('nextMonth')?.addEventListener('click', function () {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
    renderCalendar();
});

function closeThemeMenu() {
    if (!themeMenuPanel || !themeMenuBtn) return;
    themeMenuPanel.hidden = true;
    themeMenuBtn.setAttribute('aria-expanded', 'false');
}

function openThemeMenu() {
    if (!themeMenuPanel || !themeMenuBtn) return;
    themeMenuPanel.hidden = false;
    themeMenuBtn.setAttribute('aria-expanded', 'true');
}

themeMenuBtn?.addEventListener('click', function (e) {
    e.stopPropagation();
    if (themeMenuPanel && !themeMenuPanel.hidden) closeThemeMenu();
    else openThemeMenu();
});

themeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        setTheme(button.dataset.theme);
        closeThemeMenu();
    });
});
darkModeToggle?.addEventListener('click', toggleDarkMode);

// Feature 1: Quick dark mode toggle button
quickDarkBtn?.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleDarkMode();
});

// Note toggle
(function() {
    var toggle = document.getElementById('todoNoteToggle');
    var area = document.getElementById('todoNoteInput');
    if (!toggle || !area) return;
    toggle.addEventListener('click', function() {
        var isOpen = !area.hidden;
        area.hidden = isOpen;
        toggle.textContent = isOpen ? '+ Note' : '− Note';
        toggle.classList.toggle('open', !isOpen);
        if (!isOpen) area.focus();
    });
})();
openFocusBtn?.addEventListener('click', function () {
    openFocusFullscreen();
});
focusBackBtn?.addEventListener('click', closeFocusFullscreen);

todayFabBtn?.addEventListener('click', function () {
    if (todayPanel && !todayPanel.hidden && todayPanel.classList.contains('open')) {
        closeTodayPanel();
    } else {
        openTodayPanel();
    }
});
todayPanelClose?.addEventListener('click', closeTodayPanel);
todayBackdrop?.addEventListener('click', closeTodayPanel);

document.getElementById('focusSwPrev')?.addEventListener('click', function(e) {
    e.stopPropagation();
    var cur = getSavedFocusAnim();
    var idx = FOCUS_ANIMS.indexOf(cur);
    applyFocusAnim(FOCUS_ANIMS[(idx - 1 + FOCUS_ANIMS.length) % FOCUS_ANIMS.length]);
});
document.getElementById('focusSwNext')?.addEventListener('click', function(e) {
    e.stopPropagation();
    var cur = getSavedFocusAnim();
    var idx = FOCUS_ANIMS.indexOf(cur);
    applyFocusAnim(FOCUS_ANIMS[(idx + 1) % FOCUS_ANIMS.length]);
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.theme-menu-wrap')) closeThemeMenu();
});
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (focusFullscreen && !focusFullscreen.hidden) { closeFocusFullscreen(); return; }
    if (todayPanel && !todayPanel.hidden) { closeTodayPanel(); return; }
    closeThemeMenu();
});

/* ════════════════════════════════════════
   Feature 6: Reminder Mark as Done / Show Completed
════════════════════════════════════════ */
function toggleReminderComplete(id) {
    var r = reminders.find(function(r) { return r.id === id; });
    if (!r) return;
    r.completed = !r.completed;
    saveReminders();
    renderReminderLists();
}

function updateShowCompletedBtn() {
    if (!showCompletedBtn) return;
    showCompletedBtn.classList.toggle('active', showCompletedReminders);
    showCompletedBtn.textContent = showCompletedReminders ? 'Hide Completed' : 'Show Completed';
}

showCompletedBtn?.addEventListener('click', function() {
    showCompletedReminders = !showCompletedReminders;
    localStorage.setItem(STORAGE_KEYS.reminderShowCompleted, String(showCompletedReminders));
    updateShowCompletedBtn();
    renderReminderLists();
});

/* ════════════════════════════════════════
   Feature 7: Filter Chips
════════════════════════════════════════ */
function initFilterChips() {
    if (!todoFilterChips) return;
    todoFilterChips.querySelectorAll('.filter-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            activeTodoFilter = chip.getAttribute('data-filter');
            todoFilterChips.querySelectorAll('.filter-chip').forEach(function(c) {
                c.classList.toggle('active', c === chip);
            });
            renderTodos();
        });
    });
}

function filterTodosByChip(todoArr) {
    switch (activeTodoFilter) {
        case 'active': return todoArr.filter(function(t) { return !t.completed; });
        case 'completed': return todoArr.filter(function(t) { return t.completed; });
        case 'high': return todoArr.filter(function(t) { return t.priority === 'High'; });
        case 'medium': return todoArr.filter(function(t) { return t.priority === 'Medium'; });
        case 'low': return todoArr.filter(function(t) { return t.priority === 'Low'; });
        default: return todoArr;
    }
}

/* ════════════════════════════════════════
   Feature 9: Sub-tasks
════════════════════════════════════════ */
function addSubtask(todoId, text) {
    text = String(text || '').trim();
    if (!text) return;
    todos = todos.map(function(t) {
        if (t.id !== todoId) return t;
        var subtasks = Array.isArray(t.subtasks) ? t.subtasks.slice() : [];
        subtasks.push({ id: Date.now(), text: text, completed: false });
        return { ...t, subtasks: subtasks };
    });
    saveTodos();
    renderTodos();
}

function toggleSubtask(todoId, subtaskId) {
    todos = todos.map(function(t) {
        if (t.id !== todoId) return t;
        var subtasks = (Array.isArray(t.subtasks) ? t.subtasks : []).map(function(s) {
            if (s.id !== subtaskId) return s;
            return { ...s, completed: !s.completed };
        });
        return { ...t, subtasks: subtasks };
    });
    saveTodos();
    renderTodos();
}

/* ════════════════════════════════════════
   Sort / utility
════════════════════════════════════════ */
function sortReminders() {
    reminders.sort(function (a, b) {
        const aPinned = Number.isFinite(Number(a.pinOrder)) && a.pinOrder !== null && a.pinOrder !== '';
        const bPinned = Number.isFinite(Number(b.pinOrder)) && b.pinOrder !== null && b.pinOrder !== '';
        if (aPinned && bPinned) return Number(a.pinOrder) - Number(b.pinOrder);
        if (aPinned) return -1;
        if (bPinned) return 1;
        return new Date(a.targetISO) - new Date(b.targetISO);
    });
}

function sortDailyTasks() {
    dailyTasks.sort(function (a, b) { return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time); });
}

async function addTodo() {
    const title = todoInput.value.trim();
    if (!title) return;
    if (todoTimeInput.value) {
        await ensureTodoNotificationPermission();
    }
    const category = todoCategoryInput.value;
    const todo = createTodoObject({
        title: title,
        time: todoTimeInput.value,
        category: category,
        notifyBefore: todoNotifyInput.value,
        date: selectedCalendarDate,
        priority: 'Medium',
        note: todoNoteInput.value.trim()
    });
    todos.unshift(todo);
    syncTodoIntoCalendar(todo);
    sortDailyTasks();
    todoInput.value = '';
    todoTimeInput.value = '';
    setPickerValue(getPickerByKey('todo'), 'Study');
    todoNotifyInput.value = '5';
    todoNoteInput.value = '';
    var noteToggle = document.getElementById('todoNoteToggle');
    if (noteToggle && !todoNoteInput.hidden) {
        todoNoteInput.hidden = true;
        noteToggle.textContent = '+ Note';
        noteToggle.classList.remove('open');
    }
    saveTodos();
    saveDailyTasks();
    renderTodos();
    updateStats();
    renderCalendar();
}

function matchesTodoSearch(todo, query) {
    if (!query) return true;
    const lowerQuery = query.toLowerCase().trim();
    const haystack = [todo.title, todo.category, todo.note || '', (todo.tags || []).join(' ')].join(' ').toLowerCase();
    return haystack.includes(lowerQuery);
}

function toggleTodo(id) {
    todos = todos.map(function (todo) {
        if (todo.id !== id) return todo;
        return { ...todo, completed: !todo.completed, notificationSentFor: null };
    });
    const changedTodo = todos.find(function (todo) { return todo.id === id; });
    if (changedTodo) syncTodoIntoCalendar(changedTodo);
    saveTodos();
    saveDailyTasks();
    renderTodos();
    renderCalendar();
    renderSelectedDateTasks();
    updateStats();
}

function deleteTodo(id) {
    todos = todos.filter(function (todo) { return todo.id !== id; });
    dailyTasks = dailyTasks.filter(function (task) { return task.linkedTodoId !== id; });
    saveTodos();
    saveDailyTasks();
    renderTodos();
    renderCalendar();
    renderSelectedDateTasks();
    updateStats();
}

function toggleDailyTask(id) {
    dailyTasks = dailyTasks.map(function (task) {
        if (task.id !== id) return task;
        const updated = { ...task, completed: !task.completed };
        if (updated.linkedTodoId) {
            todos = todos.map(function (todo) {
                return todo.id === updated.linkedTodoId ? { ...todo, completed: updated.completed, notificationSentFor: null } : todo;
            });
            saveTodos();
        }
        return updated;
    });
    saveDailyTasks();
    renderAll();
}

function deleteDailyTask(id) {
    const linked = dailyTasks.find(function (task) { return task.id === id && task.linkedTodoId; });
    if (linked) {
        todos = todos.filter(function (todo) { return todo.id !== linked.linkedTodoId; });
        saveTodos();
    }
    dailyTasks = dailyTasks.filter(function (task) { return task.id !== id; });
    saveDailyTasks();
    renderAll();
}

function deleteReminder(id) {
    reminders = reminders.filter(function (reminder) { return reminder.id !== id; });
    saveReminders();
    renderAll();
}

function quickSetPin(id, value) {
    const target = reminders.find(function (reminder) { return reminder.id === id; });
    if (!target) return;
    const trimmed = String(value).trim();
    if (trimmed === '') {
        target.pinOrder = null;
    } else {
        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed) || parsed < 1) return;
        target.pinOrder = parsed;
    }
    sortReminders();
    saveReminders();
    renderAll();
}

function selectCalendarDate(dateISO) {
    selectedCalendarDate = dateISO;
    const selectedParts = dateISO.split('-').map(Number);
    calendarDate = new Date(selectedParts[0], selectedParts[1] - 1, 1);
    renderCalendar();
}

function getCountdownParts(targetISO) {
    const now = new Date();
    const target = new Date(targetISO);
    let diff = target - now;
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);
    return { expired: false, days: days, hours: hours, minutes: minutes, seconds: seconds };
}

function priorityBadge(priority) {
    if (priority === 'High') return '🔥 High';
    if (priority === 'Low') return '🌿 Low';
    return '⚡ Medium';
}

function formatDate(dateString) {
    const parts = String(dateString).split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return String(dateString);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function to12Hour(timeString) {
    if (!timeString) return 'No time';
    const parts = String(timeString).split(':');
    const date = new Date();
    date.setHours(Number(parts[0] || 0), Number(parts[1] || 0), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function maybeNotifyTodos() {
    if (!window.MyndlySync) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var now = new Date();
    var result = MyndlySync.processTodoNotifications(todos, now, function (todo) {
        var body = MyndlySync.buildTodoNotificationBody(todo);
        try {
            new Notification('Myndly — Todo', { body: body, tag: 'myndly-todo-' + todo.id });
        } catch (e) { /* ignore */ }
        appendNotificationLog({ channel: 'browser', title: 'Todo Reminder', body: body });
    });
    if (result.changed) {
        todos = normalizeTodos(result.todos);
        localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
        pushStateToOfflineStore();
        renderTodos();
    }
}

/* ════════════════════════════════════════
   Feature 2: Due Date color class helper
════════════════════════════════════════ */
function getTodoDueDateClass(todo) {
    if (!todo.date || todo.completed) return '';
    var today = getTodayISO();
    if (todo.date < today) return 'todo-item--overdue';
    if (todo.date === today) return 'todo-item--today';
    return 'todo-item--upcoming';
}

/* ════════════════════════════════════════
   Render Reminder Card (Feature 6, 8)
════════════════════════════════════════ */
function renderReminderCard(reminder) {
    const countdown = getCountdownParts(reminder.targetISO);
    const countdownHTML = countdown.expired
        ? '<div class="unit"><strong>Done</strong><span>Status</span></div>'
        : '<div class="unit"><strong>' + countdown.days + '</strong><span>Days</span></div>' +
        '<div class="unit"><strong>' + countdown.hours + '</strong><span>Hours</span></div>' +
        '<div class="unit"><strong>' + countdown.minutes + '</strong><span>Min</span></div>' +
        '<div class="unit"><strong>' + countdown.seconds + '</strong><span>Sec</span></div>';
    const pinHtml = reminder.pinOrder ? '<div class="badge pin-badge">📌 Pin ' + escapeHTML(String(reminder.pinOrder)) + '</div>' : '';
    const pinValue = reminder.pinOrder ? ' value="' + escapeHTML(String(reminder.pinOrder)) + '"' : '';
    // Feature 8: repeat badge
    var repeatBadge = (reminder.repeat && reminder.repeat !== 'none')
        ? '<span class="repeat-badge">🔁 ' + escapeHTML(reminder.repeat) + '</span>'
        : '';
    // Feature 6: done button
    var isDone = Boolean(reminder.completed);
    var doneBtn = '<button class="reminder-done-btn ' + (isDone ? 'done' : '') + '" type="button" onclick="toggleReminderComplete(' + reminder.id + ')">' + (isDone ? '✓ Done' : '✓ Mark Done') + '</button>';
    var completedClass = isDone ? ' reminder--completed' : '';
    return '<div class="swipe-wrapper" data-id="' + reminder.id + '" data-type="reminder">' +
        '<div class="swipe-delete-reveal">🗑 Delete</div>' +
        '<div class="swipe-content reminder-card' + completedClass + '" data-reminder-id="' + reminder.id + '" data-target-iso="' + escapeHTML(reminder.targetISO) + '">' +
        '<div>' +
        '<div class="reminder-top">' +
        '<div><h3>' + escapeHTML(reminder.title) + '</h3><p>' + escapeHTML(reminder.note || 'No note added yet.') + '</p></div>' +
        '<div class="icon-btns reminder-pin-wrap">' + pinHtml + repeatBadge + '<div class="badge">' + priorityBadge(reminder.priority) + '</div></div>' +
        '</div>' +
        '<div class="reminder-footer">' +
        '<div class="reminder-meta">' +
        '<span>📅 ' + formatDate(reminder.date) + '</span>' +
        '<span>🕒 ' + to12Hour(reminder.time) + '</span>' +
        '<span>🏷 ' + escapeHTML(reminder.category) + '</span>' +
        '</div>' +
        '<div class="icon-btns">' +
        doneBtn +
        '<input class="pin-input" type="number" min="1" placeholder="Pin"' + pinValue + ' onchange="quickSetPin(' + reminder.id + ', this.value)" />' +
        '<button class="btn btn-danger" type="button" onclick="deleteReminder(' + reminder.id + ')">Delete</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="mini-countdown reminder-countdown">' + countdownHTML + '</div>' +
        '</div>' +
        '</div>';
}

function buildCountdownHTML(targetISO) {
    const countdown = getCountdownParts(targetISO);
    if (countdown.expired) return '<div class="unit"><strong>Done</strong><span>Status</span></div>';
    return '<div class="unit"><strong>' + countdown.days + '</strong><span>Days</span></div>' +
        '<div class="unit"><strong>' + countdown.hours + '</strong><span>Hours</span></div>' +
        '<div class="unit"><strong>' + countdown.minutes + '</strong><span>Min</span></div>' +
        '<div class="unit"><strong>' + countdown.seconds + '</strong><span>Sec</span></div>';
}

function refreshReminderCountdowns() {
    document.querySelectorAll('.reminder-card[data-target-iso]').forEach(function (card) {
        const targetISO = card.getAttribute('data-target-iso');
        const countdownEl = card.querySelector('.reminder-countdown');
        if (countdownEl) countdownEl.innerHTML = buildCountdownHTML(targetISO);
    });
}

/* ════════════════════════════════════════
   Feature 3: Nice empty state helper
════════════════════════════════════════ */
function emptyStateHTML(icon, title, sub) {
    return '<div class="empty-state-nice">' +
        '<div class="empty-icon">' + icon + '</div>' +
        '<p class="empty-title">' + escapeHTML(title) + '</p>' +
        '<p class="empty-sub">' + escapeHTML(sub) + '</p>' +
        '</div>';
}

function renderReminderLists() {
    sortReminders();
    // Feature 6: filter based on showCompletedReminders
    var displayReminders = showCompletedReminders
        ? reminders
        : reminders.filter(function(r) { return !r.completed; });
    var topFive = displayReminders.slice(0, 5);
    homeReminderList.innerHTML = topFive.length === 0
        ? emptyStateHTML('🔔', 'No reminders yet', 'Add your first reminder using the form below.')
        : topFive.map(renderReminderCard).join('');
    allReminderList.innerHTML = reminders.length === 0
        ? emptyStateHTML('🔔', 'No reminders saved', 'Create a reminder using the form on the left.')
        : reminders.map(renderReminderCard).join('');
    // Re-attach swipe listeners after render
    attachSwipeListeners();
}

/* ════════════════════════════════════════
   Feature 7 + Feature 2 + Feature 9: renderTodos
════════════════════════════════════════ */
function renderTodos() {
    const query = todoSearchInput.value.trim();
    var filtered = todos.filter(function (todo) { return matchesTodoSearch(todo, query); });
    filtered = filterTodosByChip(filtered);

    // Show/hide filter chips row
    if (todoFilterChips) {
        todoFilterChips.hidden = todos.length === 0;
    }

    if (filtered.length === 0) {
        todoList.innerHTML = emptyStateHTML('📋', 'No tasks found', todos.length === 0 ? 'Add your first task above!' : 'Try a different search or filter.');
        return;
    }
    todoList.innerHTML = filtered.map(function (todo) {
        const tagsHtml = (todo.tags || []).length
            ? '<div class="todo-tags">' + todo.tags.map(function (tag) { return '<span class="todo-tag">' + escapeHTML(tag) + '</span>'; }).join('') + '</div>'
            : '';

        // Feature 9: subtasks HTML
        var subtasks = Array.isArray(todo.subtasks) ? todo.subtasks : [];
        var subtaskItemsHtml = subtasks.map(function(s) {
            return '<div class="subtask-item ' + (s.completed ? 'done-sub' : '') + '">' +
                '<input type="checkbox" ' + (s.completed ? 'checked' : '') + ' onchange="toggleSubtask(' + todo.id + ',' + s.id + ')" />' +
                '<span>' + escapeHTML(s.text) + '</span>' +
                '</div>';
        }).join('');
        var subtaskSection = '<div class="subtask-section">' +
            (subtasks.length ? '<div class="subtask-list">' + subtaskItemsHtml + '</div>' : '') +
            '<div class="subtask-add-row">' +
            '<input type="text" placeholder="Add sub-task…" id="subtask-input-' + todo.id + '" />' +
            '<button class="btn btn-ghost" type="button" onclick="addSubtaskFromInput(' + todo.id + ')">+ Sub-task</button>' +
            '</div>' +
            '</div>';

        // Feature 2: due date class
        var dueDateClass = getTodoDueDateClass(todo);

        return '<div class="swipe-wrapper" data-id="' + todo.id + '" data-type="todo">' +
            '<div class="swipe-delete-reveal">🗑 Delete</div>' +
            '<div class="swipe-content todo-item ' + (todo.completed ? 'completed' : '') + ' ' + dueDateClass + '">' +
            '<div class="todo-left">' +
            '<input type="checkbox" ' + (todo.completed ? 'checked' : '') + ' onchange="toggleTodo(' + todo.id + ')" />' +
            '<div class="todo-main">' +
            '<div class="todo-text">' + escapeHTML(todo.title) + '</div>' +
            '<div class="todo-meta-line">' +
            '<span>📅 ' + formatDate(todo.date) + '</span>' +
            '<span>🕒 ' + to12Hour(todo.time) + '</span>' +
            '<span class="category-chip">🏷 ' + escapeHTML(todo.category) + '</span>' +
            '<span>🔔 ' + escapeHTML(String(todo.notifyBefore)) + ' min আগে</span>' +
            '</div>' +
            (todo.note ? '<div class="helper">📝 ' + escapeHTML(todo.note) + '</div>' : '') +
            tagsHtml +
            subtaskSection +
            '</div>' +
            '</div>' +
            '<button class="btn btn-danger" type="button" onclick="deleteTodo(' + todo.id + ')">Delete</button>' +
            '</div>' +
            '</div>';
    }).join('');
    // Re-attach swipe listeners
    attachSwipeListeners();
}

// Helper called from inline onclick
function addSubtaskFromInput(todoId) {
    var input = document.getElementById('subtask-input-' + todoId);
    if (!input) return;
    addSubtask(todoId, input.value);
}

function getSelectedDateCombinedTasks() {
    const calendarTodos = todos.filter(function (todo) {
        return todo.date === selectedCalendarDate;
    }).map(function (todo) {
        return {
            id: todo.id,
            source: 'todo',
            title: todo.title,
            time: todo.time,
            category: todo.category,
            priority: todo.priority || 'Medium',
            note: todo.note || '',
            tags: Array.isArray(todo.tags) ? todo.tags.slice() : [],
            completed: todo.completed
        };
    });

    const plannerTasks = dailyTasks.filter(function (task) {
        return task.date === selectedCalendarDate;
    }).map(function (task) {
        return {
            id: task.id,
            source: 'planner',
            title: task.title,
            time: task.time,
            category: task.category,
            priority: task.priority,
            note: task.note,
            tags: Array.isArray(task.tags) ? task.tags.slice() : [],
            completed: task.completed
        };
    });

    return calendarTodos.concat(plannerTasks).sort(function (a, b) {
        return String(a.time || '').localeCompare(String(b.time || ''));
    });
}

function renderSelectedDateTasks() {
    if (!selectedDateTasks) return;
    const tasks = getSelectedDateCombinedTasks();
    if (tasks.length === 0) {
        selectedDateTasks.innerHTML = emptyStateHTML('📅', 'No tasks for ' + formatDate(selectedCalendarDate), 'Select another date or add a new task.');
        return;
    }
    selectedDateTasks.innerHTML = tasks.map(function (task) {
        const toggleFn = task.source === 'todo' ? 'toggleTodo' : 'toggleDailyTask';
        const deleteFn = task.source === 'todo' ? 'deleteTodo' : 'deleteDailyTask';
        const sourceLabel = task.source === 'todo' ? 'Todo' : 'Calendar Task';
        const tagsHtml = (task.tags || []).length
            ? '<div class="todo-tags">' + task.tags.map(function (tag) { return '<span class="todo-tag">' + escapeHTML(tag) + '</span>'; }).join('') + '</div>'
            : '';
        return '<div class="todo-item ' + (task.completed ? 'completed' : '') + '">' +
            '<div class="todo-left">' +
            '<input type="checkbox" ' + (task.completed ? 'checked' : '') + ' onchange="' + toggleFn + '(' + task.id + ')" />' +
            '<div>' +
            '<div class="todo-text">' + escapeHTML(task.title) + '</div>' +
            '<div class="helper">📌 ' + sourceLabel + ' • 🕒 ' + to12Hour(task.time) + ' • 🏷 ' + escapeHTML(task.category) + ' • ' + priorityBadge(task.priority || 'Medium') + '</div>' +
            (task.note ? '<div class="helper">📝 ' + escapeHTML(task.note) + '</div>' : '') +
            tagsHtml +
            '</div>' +
            '</div>' +
            '<button class="btn btn-danger" type="button" onclick="' + deleteFn + '(' + task.id + ')">Delete</button>' +
            '</div>';
    }).join('');
}

function updateStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    totalRemindersEl.textContent = String(reminders.length);
    activeTodosEl.textContent = String(todos.filter(function (todo) { return !todo.completed; }).length);
    todayEventsEl.textContent = String(
        dailyTasks.filter(function (task) {
            const parts = String(task.date).split('-').map(Number);
            return parts[1] - 1 === currentMonth && parts[0] === currentYear;
        }).length +
        todos.filter(function (todo) {
            const parts = String(todo.date).split('-').map(Number);
            return parts[1] - 1 === currentMonth && parts[0] === currentYear;
        }).length
    );
}

function renderCalendar() {
    if (!calendarGrid) return;
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    if (monthLabel) monthLabel.textContent = calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const reminderDays = new Set(reminders.filter(function (reminder) {
        const parts = String(reminder.date).split('-').map(Number);
        return parts[0] === year && parts[1] - 1 === month;
    }).map(function (reminder) { return Number(String(reminder.date).split('-')[2]); }));

    const taskDays = new Set(dailyTasks.filter(function (task) {
        const parts = String(task.date).split('-').map(Number);
        return parts[0] === year && parts[1] - 1 === month;
    }).map(function (task) { return Number(String(task.date).split('-')[2]); }));

    const todoDays = new Set(todos.filter(function (todo) {
        const parts = String(todo.date).split('-').map(Number);
        return parts[0] === year && parts[1] - 1 === month;
    }).map(function (todo) { return Number(String(todo.date).split('-')[2]); }));

    let html = '';
    for (let i = 0; i < firstDay; i += 1) {
        html += '<div class="day empty"></div>';
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
        const dateISO = [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const isSelected = selectedCalendarDate === dateISO;
        const hasContent = reminderDays.has(day) || taskDays.has(day) || todoDays.has(day);
        html += '<div class="day ' + (isToday ? 'today ' : '') + (isSelected ? 'selected ' : '') + (hasContent ? 'has-reminder' : '') + '" onclick="selectCalendarDate(\'' + dateISO + '\')">' + day + '</div>';
    }
    calendarGrid.innerHTML = html;
    renderSelectedDateTasks();
}

function showTodayLine() {
    if (!currentDateLine) return;
    const now = new Date();
    currentDateLine.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

/* ── Today FAB ── */
function getTodayTasks() {
    var todayISO = getTodayISO();
    var todayTodos = todos.filter(function (t) { return t.date === todayISO; }).map(function (t) {
        return { id: t.id, source: 'todo', title: t.title, time: t.time, category: t.category, priority: t.priority, note: t.note, tags: t.tags || [], completed: t.completed };
    });
    var todayPlanner = dailyTasks.filter(function (t) { return t.date === todayISO; }).map(function (t) {
        return { id: t.id, source: 'planner', title: t.title, time: t.time, category: t.category, priority: t.priority, note: t.note, tags: t.tags || [], completed: t.completed };
    });
    return todayTodos.concat(todayPlanner).sort(function (a, b) {
        return String(a.time || '').localeCompare(String(b.time || ''));
    });
}

function updateTodayFabBadge() {
    if (!todayFabBadge) return;
    var count = getTodayTasks().filter(function (t) { return !t.completed; }).length;
    if (count > 0) {
        todayFabBadge.textContent = count > 9 ? '9+' : String(count);
        todayFabBadge.hidden = false;
    } else {
        todayFabBadge.hidden = true;
    }
}

function renderTodayPanel() {
    if (!todayPanelBody) return;
    var tasks = getTodayTasks();
    if (tasks.length === 0) {
        todayPanelBody.innerHTML = emptyStateHTML('🎉', 'All clear for today!', 'No tasks scheduled. Enjoy your day.');
        return;
    }
    todayPanelBody.innerHTML = tasks.map(function (task) {
        var toggleFn = task.source === 'todo' ? 'toggleTodo' : 'toggleDailyTask';
        var deleteFn = task.source === 'todo' ? 'deleteTodo' : 'deleteDailyTask';
        var sourceLabel = task.source === 'todo' ? 'Todo' : 'Task';
        var timeStr = task.time ? '🕒 ' + to12Hour(task.time) + ' · ' : '';
        return '<div class="todo-item ' + (task.completed ? 'completed' : '') + '">' +
            '<div class="todo-left">' +
            '<input type="checkbox" ' + (task.completed ? 'checked' : '') + ' onchange="' + toggleFn + '(' + task.id + ');renderTodayPanel();updateTodayFabBadge();" />' +
            '<div>' +
            '<div class="todo-text">' + escapeHTML(task.title) + '</div>' +
            '<div class="helper">' + timeStr + escapeHTML(task.category) + ' · ' + sourceLabel + '</div>' +
            '</div></div>' +
            '<button class="btn btn-danger btn-sm" type="button" onclick="' + deleteFn + '(' + task.id + ');renderTodayPanel();updateTodayFabBadge();">×</button>' +
            '</div>';
    }).join('');
}

function openTodayPanel() {
    if (!todayPanel || !todayBackdrop) return;
    renderTodayPanel();
    todayPanel.hidden = false;
    todayBackdrop.hidden = false;
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            todayPanel.classList.add('open');
            todayBackdrop.classList.add('open');
        });
    });
    todayFabBtn && todayFabBtn.classList.add('open');
}

function closeTodayPanel() {
    if (!todayPanel || !todayBackdrop) return;
    todayPanel.classList.remove('open');
    todayBackdrop.classList.remove('open');
    todayFabBtn && todayFabBtn.classList.remove('open');
    setTimeout(function () {
        todayPanel.hidden = true;
        todayBackdrop.hidden = true;
    }, 420);
}

function renderAll() {
    renderReminderLists();
    renderTodos();
    renderCalendar();
    updateStats();
    updateTodayFabBadge();
}

/* ════════════════════════════════════════
   Feature 10: Pomodoro Timer
════════════════════════════════════════ */
var POMODORO_FOCUS_SECS = 25 * 60;
var POMODORO_BREAK_SECS = 5 * 60;
var pomodoroRunning = false;
var pomodoroIsFocus = true;
var pomodoroSecsLeft = POMODORO_FOCUS_SECS;
var pomodoroInterval = null;

function formatPomodoroTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function updatePomodoroDisplay() {
    var timerEl = document.getElementById('pomodoroTimer');
    var modeEl = document.getElementById('pomodoroMode');
    var startBtn = document.getElementById('pomodoroStart');
    if (timerEl) timerEl.textContent = formatPomodoroTime(pomodoroSecsLeft);
    if (modeEl) modeEl.textContent = pomodoroIsFocus ? 'Focus' : 'Break';
    if (startBtn) {
        startBtn.textContent = pomodoroRunning ? 'Pause' : 'Start';
        startBtn.classList.toggle('running', pomodoroRunning);
    }
}

function pomodoroSessionEnded() {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    // Feature 12: Save focus session
    if (pomodoroIsFocus) {
        saveFocusSession({ date: getTodayISO(), duration: 25, type: 'focus' });
        updatePomodoroSessionCount();
    }
    // Switch mode
    pomodoroIsFocus = !pomodoroIsFocus;
    pomodoroSecsLeft = pomodoroIsFocus ? POMODORO_FOCUS_SECS : POMODORO_BREAK_SECS;
    updatePomodoroDisplay();
    // Notification
    var msg = pomodoroIsFocus ? 'Break over! Time to focus.' : 'Focus session complete! Take a break.';
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Myndly Pomodoro', { body: msg });
    }
}

function tickPomodoro() {
    if (pomodoroSecsLeft <= 0) {
        pomodoroSessionEnded();
        return;
    }
    pomodoroSecsLeft -= 1;
    updatePomodoroDisplay();
}

function togglePomodoro() {
    if (pomodoroRunning) {
        pomodoroRunning = false;
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
    } else {
        pomodoroRunning = true;
        pomodoroInterval = setInterval(tickPomodoro, 1000);
    }
    updatePomodoroDisplay();
}

function resetPomodoro() {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroIsFocus = true;
    pomodoroSecsLeft = POMODORO_FOCUS_SECS;
    updatePomodoroDisplay();
}

document.getElementById('pomodoroStart')?.addEventListener('click', function(e) { e.stopPropagation(); togglePomodoro(); });
document.getElementById('pomodoroReset')?.addEventListener('click', function(e) { e.stopPropagation(); resetPomodoro(); });

/* ════════════════════════════════════════
   Feature 12: Focus Session History
════════════════════════════════════════ */
function saveFocusSession(session) {
    var sessions = readStorageArray(STORAGE_KEYS.focusSessions);
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.focusSessions, JSON.stringify(sessions));
}

function updatePomodoroSessionCount() {
    var countEl = document.getElementById('pomodoroSessionCount');
    if (!countEl) return;
    var today = getTodayISO();
    var sessions = readStorageArray(STORAGE_KEYS.focusSessions);
    var count = sessions.filter(function(s) { return s.date === today && s.type === 'focus'; }).length;
    countEl.textContent = String(count);
}

/* ════════════════════════════════════════
   Feature 11: Ambient Sounds
════════════════════════════════════════ */
var ambientCtx = null;
var ambientNodes = {};

function getAudioContext() {
    if (!ambientCtx) ambientCtx = new (window.AudioContext || window.webkitAudioContext)();
    return ambientCtx;
}

function createWhiteNoiseBuffer(ctx) {
    var bufferSize = ctx.sampleRate * 2;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

function startAmbient(type) {
    stopAmbient(type);
    var ctx = getAudioContext();
    var gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.5);
    gainNode.connect(ctx.destination);

    if (type === 'rain') {
        // Filtered white noise
        var bufferSource = ctx.createBufferSource();
        bufferSource.buffer = createWhiteNoiseBuffer(ctx);
        bufferSource.loop = true;
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.8;
        bufferSource.connect(filter);
        filter.connect(gainNode);
        bufferSource.start();
        ambientNodes[type] = { source: bufferSource, gain: gainNode, extra: [filter] };
    } else if (type === 'forest') {
        // Layered oscillators
        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 1);
        var oscs = [];
        var freqs = [220, 320, 440, 550, 660, 880];
        freqs.forEach(function(freq, i) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq + (Math.random() * 30 - 15);
            var oscGain = ctx.createGain();
            oscGain.gain.value = 0.08 + Math.random() * 0.12;
            osc.connect(oscGain);
            oscGain.connect(gainNode);
            osc.start();
            // slight LFO modulation
            var lfo = ctx.createOscillator();
            lfo.frequency.value = 0.5 + Math.random() * 1.5;
            var lfoGain = ctx.createGain();
            lfoGain.gain.value = 5;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();
            oscs.push(osc, lfo);
        });
        ambientNodes[type] = { source: oscs[0], gain: gainNode, extra: oscs };
    } else if (type === 'noise') {
        // Pure white noise, medium gain
        var bufSrc = ctx.createBufferSource();
        bufSrc.buffer = createWhiteNoiseBuffer(ctx);
        bufSrc.loop = true;
        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.5);
        bufSrc.connect(gainNode);
        bufSrc.start();
        ambientNodes[type] = { source: bufSrc, gain: gainNode };
    }
}

function stopAmbient(type) {
    var node = ambientNodes[type];
    if (!node) return;
    var ctx = getAudioContext();
    try {
        node.gain.gain.setValueAtTime(node.gain.gain.value, ctx.currentTime);
        node.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        setTimeout(function() {
            try {
                if (node.source && node.source.stop) node.source.stop();
                if (node.extra) node.extra.forEach(function(n) { try { if (n.stop) n.stop(); } catch(e){} });
            } catch(e) {}
        }, 450);
    } catch(e) {}
    delete ambientNodes[type];
}

function stopAllAmbient() {
    ['rain', 'forest', 'noise'].forEach(stopAmbient);
    document.querySelectorAll('.ambient-btn').forEach(function(b) { b.classList.remove('active'); });
}

function initAmbientButtons() {
    var map = { ambientRain: 'rain', ambientForest: 'forest', ambientNoise: 'noise' };
    Object.keys(map).forEach(function(id) {
        var btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var type = map[id];
            if (ambientNodes[type]) {
                stopAmbient(type);
                btn.classList.remove('active');
            } else {
                startAmbient(type);
                btn.classList.add('active');
            }
        });
    });
}

/* ════════════════════════════════════════
   Feature 13: Swipe to Delete
════════════════════════════════════════ */
function attachSwipeListeners() {
    document.querySelectorAll('.swipe-wrapper').forEach(function(wrapper) {
        // Avoid re-attaching
        if (wrapper._swipeAttached) return;
        wrapper._swipeAttached = true;

        var startX = 0;
        var currentX = 0;
        var isDragging = false;
        var content = wrapper.querySelector('.swipe-content');
        var reveal = wrapper.querySelector('.swipe-delete-reveal');

        wrapper.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        wrapper.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            var diff = startX - currentX;
            if (diff < 0) diff = 0;
            if (diff > 160) diff = 160;
            if (content) content.style.transform = 'translateX(-' + diff + 'px)';
            if (diff >= 80) {
                wrapper.classList.add('swiped');
            } else {
                wrapper.classList.remove('swiped');
            }
        }, { passive: true });

        wrapper.addEventListener('touchend', function() {
            if (!isDragging) return;
            isDragging = false;
            var diff = startX - currentX;
            if (diff >= 160) {
                // Auto-delete
                var id = Number(wrapper.getAttribute('data-id'));
                var type = wrapper.getAttribute('data-type');
                if (type === 'reminder') deleteReminder(id);
                else if (type === 'todo') deleteTodo(id);
            } else if (diff >= 80) {
                // Show delete button; click it to confirm
                reveal && reveal.addEventListener('click', function() {
                    var id = Number(wrapper.getAttribute('data-id'));
                    var type = wrapper.getAttribute('data-type');
                    if (type === 'reminder') deleteReminder(id);
                    else if (type === 'todo') deleteTodo(id);
                }, { once: true });
            } else {
                // Reset
                if (content) content.style.transform = '';
                wrapper.classList.remove('swiped');
            }
        }, { passive: true });
    });
}

/* ════════════════════════════════════════
   Feature 14: PWA — Register Service Worker
════════════════════════════════════════ */
let deferredInstallPrompt = null;
const menuInstallBtn = document.getElementById('menuInstallBtn');
const installHelpModal = document.getElementById('installHelpModal');
const installHelpClose = document.getElementById('installHelpClose');
const installHelpSummary = document.getElementById('installHelpSummary');
const installHelpSteps = document.getElementById('installHelpSteps');
const installHelpNote = document.getElementById('installHelpNote');

function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function getInstallBlockers() {
    var blockers = [];
    if (isAppInstalled()) blockers.push('already_installed');
    if (!window.isSecureContext) blockers.push('not_secure');
    if (location.protocol === 'file:') blockers.push('file_protocol');
    if (!('serviceWorker' in navigator)) blockers.push('no_sw');
    return blockers;
}

function buildInstallHelpContent() {
    var blockers = getInstallBlockers();
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var isAndroid = /Android/i.test(ua);
    var steps = [];
    var note = '';

    if (blockers.indexOf('already_installed') >= 0) {
        return {
            summary: 'Myndly ইতিমধ্যে ইনস্টল করা আছে। হোম স্ক্রিন বা অ্যাপ লিস্ট থেকে খুলুন।',
            steps: [],
            note: ''
        };
    }

    if (blockers.indexOf('file_protocol') >= 0) {
        return {
            summary: 'ফোল্ডার থেকে সরাসরি খোলায় Chrome Install দেখায় না।',
            steps: [
                'Terminal খুলুন: cd Desktop/notify',
                'চালান: npx serve .',
                'ব্রাউজারে দেখানো http://localhost:... লিংক খুলুন',
                'তারপর ☰ মেনু → Install app, অথবা Chrome মেনু (⋮) → Install'
            ],
            note: 'file:/// দিয়ে খুললে কখনোই Install আসে না — অবশ্যই localhost বা https লাগবে।'
        };
    }

    if (blockers.indexOf('not_secure') >= 0) {
        return {
            summary: 'এই ঠিকানায় Install সমর্থিত নয় (HTTPS বা localhost লাগবে)।',
            steps: ['সাইট https:// বা http://localhost দিয়ে হোস্ট করুন'],
            note: ''
        };
    }

    if (isIOS) {
        return {
            summary: 'iPhone/iPad-এ Chrome-এর Install নেই — Safari ব্যবহার করুন।',
            steps: [
                'Safari-তে সাইট খুলুন',
                'নিচের Share বাটন (□↗) চাপুন',
                'Add to Home Screen → Add'
            ],
            note: 'iOS-এ PWA শুধু Safari থেকে হোম স্ক্রিনে যোগ করা যায়।'
        };
    }

    if (isAndroid) {
        steps = [
            'Chrome-এ সাইট খুলুন (localhost বা https)',
            'উপরে ডানে ⋮ মেনু → Install app বা Add to Home screen',
            'না থাকলে ☰ মেনু → Install app চাপুন (এই সাইটের বাটন)'
        ];
        note = 'কখনো কখনো ২–৩০ সেকেন্ড সাইটে থাকলে Install অপশন আসে।';
    } else {
        steps = [
            'Chrome/Edge-এ http://localhost বা https লিংক খুলুন',
            'ঠিকানা বারের ডানে ⊕ Install (থাকলে)',
            'না থাকলে ⋮ মেনু → Install Myndly / Install app',
            'অথবা এই সাইটের ☰ মেনু → Install app'
        ];
        note = 'Install না এলে: DevTools → Application → Manifest — Errors দেখুন।';
    }

    if (deferredInstallPrompt) {
        return {
            summary: 'ইনস্টল প্রস্তুত — নিচের বাটন চাপুন।',
            steps: ['☰ মেনু → Install app চাপুন', 'অথবা পেজের নিচের Install app ব্যানার'],
            note: ''
        };
    }

    return { summary: 'Chrome এখনও Install অফার করছে না।', steps: steps, note: note };
}

function openInstallHelpModal() {
    if (!installHelpModal) return;
    var content = buildInstallHelpContent();
    if (installHelpSummary) installHelpSummary.textContent = content.summary;
    if (installHelpSteps) {
        installHelpSteps.innerHTML = content.steps.length
            ? content.steps.map(function (s) { return '<li>' + escapeHTML(s) + '</li>'; }).join('')
            : '<li>কোনো অতিরিক্ত ধাপ নেই।</li>';
    }
    if (installHelpNote) installHelpNote.textContent = content.note || '';
    installHelpModal.classList.add('open');
}

function closeInstallHelpModal() {
    if (installHelpModal) installHelpModal.classList.remove('open');
}

async function triggerInstallFlow() {
    closeThemeMenu();
    if (isAppInstalled()) {
        openInstallHelpModal();
        return;
    }
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        var choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        var banner = document.getElementById('installBanner');
        if (banner) banner.hidden = true;
        if (choice.outcome === 'accepted') return;
    }
    openInstallHelpModal();
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function (reg) {
        console.log('SW registered:', reg.scope);
        if (reg.active) {
            reg.active.postMessage({ type: 'STATE_UPDATED' });
        }
    }).catch(function (err) {
        console.warn('SW registration failed:', err);
    });

    navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'TODOS_NOTIFIED') {
            mergeTodosFromServiceWorker(event.data.todos);
        }
    });
}

function initInstallPrompt() {
    var banner = document.getElementById('installBanner');
    var installBtn = document.getElementById('installAppBtn');
    var dismissBtn = document.getElementById('installDismissBtn');

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (banner && !isAppInstalled()) banner.hidden = false;
    });

    installBtn?.addEventListener('click', function () { triggerInstallFlow(); });
    menuInstallBtn?.addEventListener('click', function () { triggerInstallFlow(); });
    installHelpClose?.addEventListener('click', closeInstallHelpModal);
    installHelpModal?.addEventListener('click', function (e) {
        if (e.target === installHelpModal) closeInstallHelpModal();
    });

    dismissBtn?.addEventListener('click', function () {
        if (banner) banner.hidden = true;
        try { localStorage.setItem('rh_install_dismissed', '1'); } catch (err) { /* ignore */ }
    });

    if (isAppInstalled() && banner) banner.hidden = true;
    else {
        try {
            if (localStorage.getItem('rh_install_dismissed') === '1' && banner) banner.hidden = true;
        } catch (err) { /* ignore */ }
    }
}

function initOfflineStatus() {
    var el = document.getElementById('offlineStatus');
    if (!el) return;
    function update() {
        el.textContent = navigator.onLine ? '' : 'Offline — সব ডেটা এই ডিভাইসে সংরক্ষিত';
        el.hidden = navigator.onLine;
    }
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
}

function initTodoAlertBanner() {
    var banner = document.getElementById('todoAlertBanner');
    var btn = document.getElementById('todoAlertEnableBtn');
    if (!banner || !('Notification' in window)) return;
    function refresh() {
        banner.hidden = Notification.permission === 'granted' || Notification.permission === 'denied';
    }
    btn?.addEventListener('click', async function () {
        var ok = await ensureTodoNotificationPermission();
        refresh();
        if (ok) pushStateToOfflineStore();
    });
    refresh();
}

/* ════════════════════════════════════════
   Tests
════════════════════════════════════════ */
function runAppTests() {
    console.assert(priorityBadge('High') === '🔥 High', 'priorityBadge should map High');
    console.assert(priorityBadge('Low') === '🌿 Low', 'priorityBadge should map Low');
    console.assert(priorityBadge('Medium') === '⚡ Medium', 'priorityBadge should map Medium');
    console.assert(to12Hour('13:05').includes('1:05') || to12Hour('13:05').includes('01:05'), 'to12Hour should convert 13:05');
    console.assert(escapeHTML('<b>test</b>') === '&lt;b&gt;test&lt;/b&gt;', 'escapeHTML should escape tags');
    const reminder = createReminderObject({ title: 'Test', date: '2030-01-01', time: '10:00', category: 'Study', priority: 'High', note: 'x', pinOrder: '2', repeat: 'none' });
    console.assert(reminder.pinOrder === 2, 'createReminderObject should store pin order');
    const task = createDailyTaskObject({ title: 'Task #work', date: '2030-01-02', time: '09:15', category: 'Work', priority: 'Medium', note: 'n #note' });
    console.assert(task.completed === false, 'createDailyTaskObject should default completed to false');
    console.assert(task.tags.includes('#work') && task.tags.includes('#note'), 'createDailyTaskObject should extract tags');
    const normalized = normalizeTodos([{ text: 'Study math #study', note: 'revise #exam', completed: false }]);
    console.assert(normalized[0].tags.includes('#study') && normalized[0].tags.includes('#exam'), 'normalizeTodos should backfill tags from title and note');
    const searchTodo = createTodoObject({ title: 'Buy fish #market', time: '10:00', category: 'Market', notifyBefore: '15', date: '2030-01-03', note: 'fresh river fish #bazar' });
    console.assert(matchesTodoSearch(searchTodo, 'market') === true, 'matchesTodoSearch should match category/tag');
    console.assert(matchesTodoSearch(searchTodo, '#market') === true, 'matchesTodoSearch should match hash tag');
    console.assert(matchesTodoSearch(searchTodo, 'fresh') === true, 'matchesTodoSearch should match note');
    console.assert(createTodoObject({ title: 'Read #study', time: '09:00', category: 'Study', notifyBefore: '5', date: '2030-01-03', note: 'chapter 1' }).date === '2030-01-03', 'createTodoObject should store selected date');
    console.assert(formatDate('2030-01-03').includes('2030'), 'formatDate should format local date without shifting');
    const html = renderReminderCard({ id: 123, title: 'Pinned test', note: '', date: '2030-01-04', time: '12:00', category: 'Work', priority: 'Medium', pinOrder: 1, targetISO: new Date('2030-01-04T12:00:00').toISOString(), completed: false, repeat: 'none' });
    console.assert(html.includes('quickSetPin(123, this.value)'), 'renderReminderCard should wire quickSetPin with reminder id');
    console.assert(!html.includes('$1'), 'renderReminderCard should not contain $1 placeholder');
    console.assert(document.getElementById('openTaskPlannerBtn') === null, 'openTaskPlannerBtn should be removed from HTML');
    console.assert(document.getElementById('linkTodoToCalendarBtn') === null, 'linkTodoToCalendarBtn should be removed from HTML');
}

/* ════════════════════════════════════════
   Global exports
════════════════════════════════════════ */
window.deleteReminder = deleteReminder;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.selectCalendarDate = selectCalendarDate;
window.toggleDailyTask = toggleDailyTask;
window.deleteDailyTask = deleteDailyTask;
window.setTheme = setTheme;
window.toggleDarkMode = toggleDarkMode;
window.quickSetPin = quickSetPin;
window.toggleReminderComplete = toggleReminderComplete;
window.toggleSubtask = toggleSubtask;
window.addSubtaskFromInput = addSubtaskFromInput;
window.renderTodayPanel = renderTodayPanel;
window.updateTodayFabBadge = updateTodayFabBadge;

/* ════════════════════════════════════════
   Init
════════════════════════════════════════ */
loadCustomCategories();
sortReminders();
sortDailyTasks();
applySavedTheme();
initCategoryPickers();
initFilterChips();
fillNotificationSettingsForm();
showTodayLine();
updateShowCompletedBtn();
renderAll();
refreshReminderCountdowns();
maybeNotifyTodos();
checkDailyDigest();
updatePomodoroDisplay();
initAmbientButtons();
registerServiceWorker();
initInstallPrompt();
initOfflineStatus();
initTodoAlertBanner();
pushStateToOfflineStore();
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        maybeNotifyTodos();
        pushStateToOfflineStore();
    }
});
setInterval(refreshReminderCountdowns, 1000);
setInterval(maybeNotifyTodos, 15000);
setInterval(checkDailyDigest, 60000);
runAppTests();
