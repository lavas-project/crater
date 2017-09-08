/**
 * @file 主入口
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import sw from './lib/sw-base';

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

// import product/*
const product = requireAll(require.context('./product', true, /^\.\/.*\.js$/));

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

// 加载全部配置，每个都添加路由规则和预缓存
Object.keys(product).forEach(name => {
    let config = product[name];

    addPrecache(config);
    addRoute(config);
});
