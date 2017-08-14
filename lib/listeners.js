/**
 * @file service-worker各个生命周期的响应函数
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import precache from './precache';
import router from './router';

export function installListener(event) {
    let precacheList = precache.getList();
    let promiseList = [];

    Object.keys(precacheList).forEach(cacheName => {
        let fileList = precacheList[cacheName];

        promiseList.push(caches.open(cacheName).then(cache => cache.addAll(fileList)));
    });

    if (promiseList.length === 0) {
        return;
    }

    event.waitUntil(Promise.all(promiseList).then(() => self.skipWaiting()));
}

export function activateListener(event) {
    event.waitUntil(self.clients.claim());
}

export function fetchListener(event) {
    let matchItem = router.match(event.request);

    if (matchItem && typeof matchItem.strategy === 'function') {
        event.respondWith(matchItem.strategy(event.request, matchItem.options));
    }
}
