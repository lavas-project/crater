/**
 * @file 测试入口
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import sw from './lib/sw-base';
import testConfig from './test/product/test.conf';
import precacheConfig from './test/product/precache.conf';

function getCacheName(config) {
    return `@sw-${config.name}@`;
}

function addRoute(config) {
    let cacheName = getCacheName(config);
    let {referrerPattern, options} = config;

    if (typeof referrerPattern !== 'object' && typeof referrerPattern !== 'function') {
        return;
    }

    if (!options) {
        options = {
            cache: {
                name: cacheName
            }
        };
    }
    else if (!options.cache) {
        options.cache = {
            name: cacheName
        };
    }
    else {
        options.cache.name = cacheName;
    }

    config.routers.forEach(router => {
        let {method = 'all', urlPattern, strategy} = router;

        if (typeof urlPattern !== 'object' && typeof urlPattern !== 'function') {
            return;
        }

        sw.add(referrerPattern, method, urlPattern, strategy, options);
    });
}

function addPrecache(config) {
    let cacheName = getCacheName(config);

    sw.precache(cacheName, config.precache);
}

addPrecache(precacheConfig);

addRoute(testConfig);
