importScripts('./sync-store.js');

const CACHE_NAME = 'myndly-offline-v6';
const APP_SHELL = ['./', './index.html', './styles.css', './app.js', './sync-store.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
const TODO_CHECK_MS = 30000;
// These files always try network first so updates show immediately
const NETWORK_FIRST = ['index.html', 'app.js', 'styles.css', 'sync-store.js'];

let todoCheckTimer = null;

function isNetworkFirst(url) {
    return url.pathname === '/' || url.pathname.endsWith('/') ||
        NETWORK_FIRST.some(function(f) { return url.pathname.endsWith(f); });
}

function networkFirst(request) {
    return fetch(request).then(function(response) {
        if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(request, clone); });
        }
        return response;
    }).catch(function() {
        return caches.match(request).then(function(cached) {
            if (cached) return cached;
            if (request.mode === 'navigate') return caches.match('./index.html');
            return new Response('Offline', { status: 503 });
        });
    });
}

function cacheFirst(request) {
    return caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request).then(function (networkResponse) {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                var clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(request, clone);
                });
            }
            return networkResponse;
        }).catch(function () {
            if (request.mode === 'navigate') {
                return caches.match('./index.html');
            }
            return caches.match(request);
        });
    });
}

function showTodoNotification(todo) {
    var body = MyndlySync.buildTodoNotificationBody(todo);
    return self.registration.showNotification('Myndly — Todo', {
        body: body,
        tag: 'myndly-todo-' + todo.id,
        renotify: true,
        data: { type: 'todo', id: todo.id, url: './index.html' }
    });
}

function runTodoNotificationCheck() {
    return MyndlySync.readAppState().then(function (state) {
        if (!state || !Array.isArray(state.todos) || !state.todos.length) return;
        var now = new Date();
        var result = MyndlySync.processTodoNotifications(state.todos, now, function (todo) {
            showTodoNotification(todo);
        });
        if (!result.changed) return;
        state.todos = result.todos;
        state.updatedAt = Date.now();
        return MyndlySync.writeAppState(state).then(function () {
            return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
                clients.forEach(function (client) {
                    client.postMessage({ type: 'TODOS_NOTIFIED', todos: result.todos });
                });
            });
        });
    }).catch(function (err) {
        console.warn('SW todo check failed', err);
    });
}

function scheduleTodoCheckLoop() {
    if (todoCheckTimer) clearTimeout(todoCheckTimer);
    todoCheckTimer = setTimeout(function () {
        runTodoNotificationCheck().finally(scheduleTodoCheckLoop);
    }, TODO_CHECK_MS);
}

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_SHELL);
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (name) { return name !== CACHE_NAME; }).map(function (name) {
                    return caches.delete(name);
                })
            );
        }).then(function () {
            return self.clients.claim();
        }).then(function () {
            // Tell all open tabs to reload so they pick up fresh files
            return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
                clients.forEach(function(client) { client.postMessage({ type: 'SW_UPDATED' }); });
            });
        }).then(function () {
            scheduleTodoCheckLoop();
            return runTodoNotificationCheck();
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    var url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    if (isNetworkFirst(url)) {
        event.respondWith(networkFirst(event.request));
    } else {
        event.respondWith(cacheFirst(event.request));
    }
});

self.addEventListener('message', function (event) {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }
    if (event.data.type === 'STATE_UPDATED' || event.data.type === 'CHECK_TODOS_NOW') {
        runTodoNotificationCheck();
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    var target = (event.notification.data && event.notification.data.url) || './index.html';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
            if (clients.length) {
                clients[0].focus();
                return;
            }
            return self.clients.openWindow(target);
        })
    );
});
