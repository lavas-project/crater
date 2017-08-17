/**
 * @file cacheOnly 只从缓存中读取
 * @author tracy (qiushidev@gmail.com)
 */

'use strict';

import {isResponseFresh} from './utils';

export default function (req, options) {
    let cacheName;
    let maxAge;
    if (options && options.cache) {
        cacheName = options.cache.name;
        maxAge = options.cache.maxAge;
    }

    return caches.open(cacheName).then(cache =>
        cache.match(req)
            .then(res => {
                // 返回在有效期内的缓存
                if (res && isResponseFresh(res, maxAge)) {
                    return res;
                }
                throw new Error('cache missed');
            })
    );
}
