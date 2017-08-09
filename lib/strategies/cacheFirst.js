/**
 * @file cacheFirst 缓存优先，如果失败再从网络请求获取
 * @author chenqiushi (chenqiushi@baidu.com)
 */
import {fetchAndCache, isResponseFresh} from './utils';

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
                return fetchAndCache(req, options);
            })
    );
}
