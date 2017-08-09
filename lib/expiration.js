/**
 * @file 通过读取 maxAge maxEntries 的配置来清理缓存
 *       缓存的信息：timestamp，url，index 等保存在 indexedDB 中
 *
 * @author chenqiushi (chenqiushi@baidu.com)
 */

const DB_PREFIX = 'baidu-';
const DB_VERSION = 1;
const STORE_NAME = 'store';

// cache名称 和 db 的映射
let cacheNameToDbPromise = {};

/**
 * 获得当前 cacheName 对应的数据库连接
 *
 * @param  {string} cacheName 缓存名
 * @return {Promise} indexDB
 */
export function getDb(cacheName) {
    if (!(cacheName in cacheNameToDbPromise)) {
        cacheNameToDbPromise[cacheName] = openDb(cacheName);
    }

    return cacheNameToDbPromise[cacheName];
}

/**
 * 将缓存对应的 url timestamp 写入数据库
 *
 * @param {Object} db  数据库对象
 * @param {string} url 缓存对应的 url
 * @return {Promise} 数据库对象
 */
export function setTimestampForUrl(db, url) {
    return new Promise((resolve, reject) => {
        // 新建事务
        let transaction = db.transaction(STORE_NAME, 'readwrite');
        let os = transaction.objectStore(STORE_NAME);

        let now = Date.now();
        // 写入数据
        os.put({
            url: url,
            timestamp: now
        });

        transaction.oncomplete = () => resolve(db);
        transaction.onabort = () => reject(transaction.error);
    });
}

/**
 * 清理缓存，得到需要清理的缓存 url
 *
 * @param {Object} db  数据库对象
 * @param {number} maxEntries 最大缓存数量
 * @param {number} maxAge 最大缓存寿命
 * @return {Promise} 需要清理的缓存的 url
 */
export function expireCaches(db, maxEntries, maxAge) {
    return expireOld(db, maxAge)
        .then(oldUrls =>
            expireExtra(db, maxEntries)
            .then(extraUrls => oldUrls.concat(extraUrls))
        );
}

/**
 * 打开数据库连接
 *
 * @param  {string} cacheName 缓存名称
 * @return {Promise} indexDB
 */
function openDb(cacheName) {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(DB_PREFIX + cacheName, DB_VERSION);

        // 第一次打开该数据库，或者数据库版本发生变化
        request.onupgradeneeded = () => {
            // 创建 store, 并指定键名为 url
            let objectStore = request.result.createObjectStore(
                STORE_NAME,
                {keyPath: 'url'}
            );

            // 创建索引
            objectStore.createIndex(
                'timestamp',
                'timestamp',
                {unique: false}
            );
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

/**
 * 清理数据库过期的缓存信息
 *
 * @param {Object} db  数据库对象
 * @param {number} maxAge 最大缓存寿命
 * @return {Promise} 过期的缓存 urls
 */
function expireOld(db, maxAge) {
    if (!maxAge) {
        Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
        // 过期的缓存 url
        let urls = [];
        let now = Date.now();

        let transaction = db.transaction(STORE_NAME, 'readwrite');
        let objectStore = transaction.objectStore(STORE_NAME);
        let index = objectStore.index('timestamp');

        // 遍历数据，找出过期的 url
        index.openCursor().onsuccess = cursorEvent => {
            let cursor = cursorEvent.target.result;
            if (cursor) {
                if (now - maxAge > cursor.value.timestamp) {
                    let url = cursor.value.url;
                    urls.push(url);
                    objectStore.delete(url);
                    cursor.continue();
                }
            }
        };

        transaction.oncomplete = () => resolve(urls);
        transaction.onabort = reject;

    });
}

/**
 * 清理数据库中超出数量的缓存信息 （LRU）
 *
 * @param {Object} db  数据库对象
 * @param {number} maxEntries 最大缓存数量
 * @return {Promise} 超额的缓存 urls
 */
function expireExtra(db, maxEntries) {
    if (!maxEntries) {
        Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
        // 超过限制数量的缓存 url
        let urls = [];

        let transaction = db.transaction(STORE_NAME, 'readwrite');
        let objectStore = transaction.objectStore(STORE_NAME);
        let index = objectStore.index('timestamp');

        let countRequest = index.count();
        countRequest.onsuccess = () => {
            // 删除前的初始数量
            let initCount = countRequest.result;

            // 如果超出数量限制，遍历数据，删除老的
            if (initCount > maxEntries) {
                index.openCursor().onsuccess = cursorEvent => {
                    let cursor = cursorEvent.target.result;
                    if (cursor) {
                        let url = cursor.value.url;
                        urls.push(url);
                        objectStore.delete(url);
                        // 继续，直到数量不超出限制
                        if (initCount - urls.length > maxEntries) {
                            cursor.continue();
                        }
                    }
                };
            }
        };

        transaction.oncomplete = () => resolve(urls);
        transaction.onabort = reject;
    });
}
