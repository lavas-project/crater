/**
 * @file networkFirst 网络请求优先，如果失败再从缓存中获取
 * @author tracy (qiushidev@gmail.com)
 */

'use strict';

import {fetchAndCache, isSuccResponse, isResponseFresh} from './utils';

export default function (req, options) {

    let cacheName;
    // 最大超时时间, 单位 ms
    let timeout;
    // 缓存寿命
    let maxAge;

    if (options && options.cache) {
        cacheName = options.cache.name;
        timeout = options.timeout;
        maxAge = options.cache.maxAge;
    }

    return caches.open(cacheName).then(cache => {
        let timeoutId;
        let promisesArray = [];
        let cachePromise;
        let networkPromise;

        // 请求优先，失败读取缓存。若经过 timeout 时长超时仍未返回，直接读取缓存（前提是设置了 cache.timeout）
        if (timeout) {
            cachePromise = new Promise(resolve => {
                timeoutId = setTimeout(() => {
                    cache.match(req).then(res => {
                        // 返回在有效期内的缓存
                        if (isResponseFresh(res, maxAge)) {
                            resolve(res);
                        }
                    });
                }, timeout);
            });

            promisesArray.push(cachePromise);
        }

        networkPromise = fetchAndCache(req, options)
            .then(response => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                if (isSuccResponse(response.status)) {
                    return response;
                }

                throw new Error('Bad response');
            })
            .catch(() =>
                // 网络请求失败，fallback to cache
                cache.match(req)
            );

        promisesArray.push(networkPromise);

        return Promise.race(promisesArray);

    });
}
