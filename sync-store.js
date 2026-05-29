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

    function addDaysISO(dateISO, days) {
        var d = new Date(String(dateISO) + 'T12:00:00');
        d.setDate(d.getDate() + days);
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function getPlanEndDate(plan) {
        var days = Number(plan.durationDays) || 1;
        return addDaysISO(plan.startDate, days - 1);
    }

    function isDateInPlan(plan, dateISO) {
        if (!plan.startDate || !dateISO) return false;
        return dateISO >= plan.startDate && dateISO <= getPlanEndDate(plan);
    }

    function getDayProgress(plan, dateISO) {
        if (!plan.progress || !plan.progress[dateISO]) return {};
        return plan.progress[dateISO];
    }

    function getIncompleteItemTitles(plan, dateISO) {
        var prog = getDayProgress(plan, dateISO);
        var items = Array.isArray(plan.items) ? plan.items : [];
        return items.filter(function (item) { return !prog[item.id]; }).map(function (item) { return item.title; });
    }

    function isDayFullyComplete(plan, dateISO) {
        var items = Array.isArray(plan.items) ? plan.items : [];
        if (!items.length) return true;
        var prog = getDayProgress(plan, dateISO);
        return items.every(function (item) { return prog[item.id]; });
    }

    function getPlanDayIndex(plan, dateISO) {
        var start = new Date(String(plan.startDate) + 'T12:00:00');
        var cur = new Date(String(dateISO) + 'T12:00:00');
        var diff = Math.floor((cur - start) / 86400000) + 1;
        return diff > 0 ? diff : 1;
    }

    function parseTimeToMinutes(timeStr) {
        var parts = String(timeStr || '20:00').split(':');
        return Number(parts[0] || 0) * 60 + Number(parts[1] || 0);
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
            var n = new Date();
            return [n.getFullYear(), String(n.getMonth() + 1).padStart(2, '0'), String(n.getDate()).padStart(2, '0')].join('-');
        }
    }

    function getLocalTimePartsInTimezone(timezone) {
        var parts = { hour: 0, minute: 0 };
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
        } catch (e) { /* ignore */ }
        return parts;
    }

    function processStudyPlanNotifications(plans, now, timezone, onNotify) {
        if (!Array.isArray(plans) || !plans.length) return { plans: plans, changed: false };
        var changed = false;
        var tz = timezone || 'UTC';
        var today = getTodayISOInTimezone(tz);
        var nowMins = getLocalTimePartsInTimezone(tz);
        var nowTotal = nowMins.hour * 60 + nowMins.minute;

        var updated = plans.map(function (plan) {
            if (!plan.startDate || !Array.isArray(plan.items) || !plan.items.length) return plan;
            var notified = Object.assign({}, plan.notified || {});
            var checkMins = parseTimeToMinutes(plan.checkTime || '20:00');
            var morningMins = parseTimeToMinutes(plan.morningTime || '08:00');

            function markNotified(key) {
                if (!notified[key]) {
                    notified[key] = true;
                    changed = true;
                }
            }

            function fire(key, title, body) {
                if (notified[key]) return;
                if (typeof onNotify === 'function') onNotify({ plan: plan, title: title, body: body, key: key });
                markNotified(key);
            }

            // Missed past days (once per missed date)
            var cursor = plan.startDate;
            while (cursor < today && isDateInPlan(plan, cursor)) {
                if (!isDayFullyComplete(plan, cursor)) {
                    var missed = getIncompleteItemTitles(plan, cursor);
                    if (missed.length) {
                        var dayNum = getPlanDayIndex(plan, cursor);
                        fire(
                            'missed-' + plan.id + '-' + cursor,
                            plan.title + ' — Day ' + dayNum + ' incomplete',
                            'You missed: ' + missed.join(', ')
                        );
                    }
                }
                cursor = addDaysISO(cursor, 1);
            }

            if (isDateInPlan(plan, today)) {
                var incompleteToday = getIncompleteItemTitles(plan, today);
                var dayNumToday = getPlanDayIndex(plan, today);

                if (incompleteToday.length && nowTotal >= morningMins && nowTotal < morningMins + 2) {
                    fire(
                        'morning-' + plan.id + '-' + today,
                        plan.title + ' — Day ' + dayNumToday,
                        'Today: ' + incompleteToday.join(', ')
                    );
                }

                if (incompleteToday.length && nowTotal >= checkMins && nowTotal < checkMins + 3) {
                    fire(
                        'evening-' + plan.id + '-' + today,
                        plan.title + ' — still pending',
                        'Complete today: ' + incompleteToday.join(', ')
                    );
                }
            }

            if (!changed) return plan;
            return Object.assign({}, plan, { notified: notified });
        });

        return { plans: updated, changed: changed };
    }

    global.MyndlySync = {
        writeAppState: writeAppState,
        readAppState: readAppState,
        getTodoNotifyHit: getTodoNotifyHit,
        buildTodoNotificationBody: buildTodoNotificationBody,
        processTodoNotifications: processTodoNotifications,
        addDaysISO: addDaysISO,
        getPlanEndDate: getPlanEndDate,
        isDateInPlan: isDateInPlan,
        getDayProgress: getDayProgress,
        isDayFullyComplete: isDayFullyComplete,
        getIncompleteItemTitles: getIncompleteItemTitles,
        getPlanDayIndex: getPlanDayIndex,
        processStudyPlanNotifications: processStudyPlanNotifications
    };
})(typeof self !== 'undefined' ? self : window);
