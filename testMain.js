/**
 * @file 测试入口
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import sw from './lib/sw-base';
import testConfig from './test/product/test.conf';
import precacheConfig from './test/product/precache.conf';

/**
 * 获取缓存名称
 *
 * @param {Object} config 配置对象
 * @return {string} 缓存名称
 */
function getCacheName(config) {
    return `@crater-${config.name}@`;
}

/**
 * 添加缓存路由规则
 *
 * @param {Object} config 配置对象
 */
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

    // 遍历config的routers，逐条添加到系统中
    config.routers.forEach(router => {
        let {method = 'all', urlPattern, strategy} = router;

        if (typeof urlPattern !== 'object' && typeof urlPattern !== 'function') {
            return;
        }

        sw.add(referrerPattern, method, urlPattern, strategy, options);
    });
}

/**
 * 添加预缓存文件
 *
 * @param {Object} config 配置文件
 */
function addPrecache(config) {
    let cacheName = getCacheName(config);

    sw.precache(cacheName, config.precache);
}

// 因为是测试，因此明确知道只有2个文件，并且一个是路由规则一个是预缓存
addPrecache(precacheConfig);
addRoute(testConfig);
