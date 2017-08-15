/**
 * @file 主入口
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import sw from './lib/sw-base';
import product from './product';

function getCacheName(config) {
    return `@crater-${config.name}@`;
}

function addRoute(config) {
    let cacheName = getCacheName(config);
    let {referrerPattern, options} = config;

    if (typeof referrerPattern !== 'object') {
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

Object.keys(product).forEach(name => {
    let config = product[name];

    addPrecache(config);
    addRoute(config);
});
