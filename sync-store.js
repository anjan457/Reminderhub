/**
 * Shared offline store + todo notification timing (app + service worker).
 */
(function (global) {
    const DB_NAME = 'myndly-offline-v1';
    const DB_VERSION = 1;
    const STORE_NAME = 'kv';
    const STATE_KEY = 'app-state';

    function openDB() {
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onerror = function () { reject(req.error); };
            req.onsuccess = function () { resolve(req.result); };
            req.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    }

    function writeAppState(state) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(state, STATE_KEY);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function readAppState() {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var req = tx.objectStore(STORE_NAME).get(STATE_KEY);
                req.onsuccess = function () { resolve(req.result || null); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function buildTodoDueDate(todo) {
        var parts = String(todo.time || '').split(':');
        var due = new Date(String(todo.date) + 'T00:00:00');
        due.setHours(Number(parts[0] || 0), Number(parts[1] || 0), 0, 0);
        return due;
    }

    function getTodoDueKey(todo) {
        return String(todo.date) + 'T' + String(todo.time || '').slice(0, 5);
    }

    function getTodoNotifyHit(todo, now) {
        if (todo.completed || !todo.time || !todo.date) return null;
        var due = buildTodoDueDate(todo);
        var notifyAt = new Date(due.getTime() - Number(todo.notifyBefore || 5) * 60000);
        var dueKey = getTodoDueKey(todo);
        var windowEnd = new Date(due.getTime() + 60000);
        if (now >= notifyAt && now <= windowEnd && todo.notificationSentFor !== dueKey) {
            return { dueKey: dueKey, due: due };
        }
        return null;
    }

    function buildTodoNotificationBody(todo) {
        var timeLabel = todo.time ? String(todo.time).slice(0, 5) : '';
        return (todo.title || 'Task') + ' • ' + (todo.category || '') + (timeLabel ? ' • ' + timeLabel : '');
    }

    function processTodoNotifications(todos, now, onNotify) {
        var changed = false;
        var updated = todos.map(function (todo) {
            var hit = getTodoNotifyHit(todo, now);
            if (hit) {
                if (typeof onNotify === 'function') onNotify(todo, hit);
                changed = true;
                return Object.assign({}, todo, { notificationSentFor: hit.dueKey });
            }
            return todo;
        });
        return { todos: updated, changed: changed };
    }

    global.MyndlySync = {
        writeAppState: writeAppState,
        readAppState: readAppState,
        getTodoNotifyHit: getTodoNotifyHit,
        buildTodoNotificationBody: buildTodoNotificationBody,
        processTodoNotifications: processTodoNotifications
    };
})(typeof self !== 'undefined' ? self : window);
