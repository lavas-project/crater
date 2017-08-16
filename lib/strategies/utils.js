/**
 * @file Strategies utils
 * @author tracy (qiushidev@gmail.com)
 */
import * as expiration from '../expiration';

// 成功状态码正则
// 为什么 404 也要 success 并缓存，讨论如下：
// https://github.com/wibblymat/shed/issues/5
// https://github.com/GoogleChrome/sw-toolbox/issues/75
const SUCCESS_RESPONSE_REGEXP = /^0|([123]\d\d)|(40[14567])|410$/;
// 缓存清理队列
let cleanCacheQueue;

/**
 * 请求并缓存
 *
 * @param  {Request} req Request
 * @param  {Object} options options
 * @return {Promise}
 */
export function fetchAndCache(req, options) {
    return fetch(req.clone()).then(res => {
        // 只缓存成功的 GET 请求
        if (req.method === 'GET' && isSuccResponse(res.status)) {
            // 保存到 cache storage
            let cacheName;
            let cacheOptions;
            if (options && options.cache) {
                cacheName = options.cache.name;
                cacheOptions = options.cache;
            }

            caches.open(cacheName).then(
                cache => cache.put(req, res)
                    .then(() => {
                        // 保存后，如果设置了 maxEntries || maxAge
                        // 进行清理缓存的操作
                        if ((cacheOptions.maxEntries || cacheOptions.maxAge)
                            && cacheName
                        ) {
                            queueCachesExpiration(req, cache, cacheOptions);
                        }
                    })
            );
        }

        return res.clone();
    });
}

/**
 * 判断缓存的返回是否有效（在过期时间以内）
 *
 * @param  {Response}  res         返回内容
 * @param  {number}  maxAge        最大缓存时长（ms）
 * @return {boolean}               当前返回是否有效（未过期）
 */
export function isResponseFresh(res, maxAge) {
    if (!res) {
        return false;
    }

    if (maxAge) {
        let dateHeader = res.headers.get('date');
        if (dateHeader) {
            let parsedDate = new Date(dateHeader);

            let now = Date.now();
            if ((parsedDate.getTime() + maxAge) < now) {
                return false;
            }
        }
    }

    return true;
}

/**
 * 根据状态码判断是否为成功的返回
 *
 * @param  {number}  status 返回状态码
 * @return {boolean}        是否为成功的返回
 */
export function isSuccResponse(status) {
    return SUCCESS_RESPONSE_REGEXP.test(status);
}

/**
 * 建立 promise 队列，并开始清理
 *
 * @param {Request} req Request
 * @param {Object} cache 缓存对象
 * @param {Object} options options
 */
function queueCachesExpiration(req, cache, options) {
    let cleanup = cleanCache.bind(null, req, cache, options);

    if (cleanCacheQueue) {
        cleanCacheQueue = cleanCacheQueue.then(cleanup);
    }
    else {
        cleanCacheQueue = cleanup();
    }
}

/**
 * 连接数据库，根据 option 清理数据库，并删除 cache storage 中的缓存
 *
 * @param {Request} req Request
 * @param {Object} cache 缓存对象
 * @param {Object} cacheOptions cacheOptions
 * @return {Promise} promise
 */
function cleanCache(req, cache, cacheOptions) {
    let {name, maxAge, maxEntries} = cacheOptions;
    let reqUrl = req.url;

    // 获取 db
    return expiration.getDb(name)
        .then(db =>
            // 写入数据，每个 url 对应 timestamp
            expiration.setTimestampForUrl(db, reqUrl)
        )
        .then(db =>
            // 开始去数据库清理缓存数据，得到需要清理的 urls
            expiration.expireCaches(db, maxEntries, maxAge)
        )
        .then(urls => {
            let deletePromises = urls.map(url => cache.delete(url));
            return Promise.all(deletePromises);
        });

}
