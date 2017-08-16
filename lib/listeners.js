/**
 * @file service-worker各个生命周期的响应函数
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import precache from './precache';
import router from './router';

/**
 * install阶段响应函数
 * 处理预缓存文件，并调用skipWaiting使sw立即生效
 *
 * @param {Object} event service-worker传入的事件
 */
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

/**
 * activate阶段响应函数
 * 调用claim使sw立即生效
 *
 * @param {Object} event service-worker传入的事件
 */
export function activateListener(event) {
    event.waitUntil(self.clients.claim());
}

/**
 * fetch阶段响应函数
 * 根据event找到匹配的规则，并调用对应的缓存策略
 *
 * @param {Object} event service-worker传入的事件
 */
export function fetchListener(event) {
    let matchItem = router.match(event.request);

    if (matchItem && typeof matchItem.strategy === 'function') {
        event.respondWith(matchItem.strategy(event.request, matchItem.options));
    }
}
