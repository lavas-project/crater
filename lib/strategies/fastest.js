/**
 * @file fastest 网络请求和缓存获取同时进行，取较快的
 * @author chenqiushi (chenqiushi@baidu.com)
 */
import {fetchAndCache} from './utils';
import cacheOnly from './cacheOnly';

export default function (req, options) {
    return new Promise(function (resolve, reject) {
        let rejected = false;

        function maybeResolve(res) {
            if (res instanceof Response) {
                resolve(res);
            }
            else {
                maybeReject('No result returned');
            }
        }

        function maybeReject(e) {
            if (rejected) {
                reject(e);
            }
            else {
                rejected = true;
            }
        }

        fetchAndCache(req.clone(), options)
            .then(maybeResolve, maybeReject);

        cacheOnly(req, options)
            .then(maybeResolve, maybeReject);
    });
}
