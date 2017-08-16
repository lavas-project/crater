/**
 * @file 将传入的参数进行合法校验并和默认值合并
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

// 默认配置项
let defaultOptions = {
    debug: false,
    timeout: 3000,
    cache: {
        name: '@sw@',
        maxEntries: 50,
        maxAge: 24 * 60 * 60 * 1000
    }
};
// 默认缓存策略
let defaultStrategy = 'networkFirst';

// 目前可用的策略集合
const validStrategy = ['fastest', 'networkFirst', 'cacheFirst', 'networkOnly', 'cacheOnly'];

// 根据传入的type验证配置项是否合法
function isValid(value, type = 'number') {
    if (type === 'number') {
        return !isNaN(value);
    }

    if (type === 'string') {
        return value !== undefined && value !== null;
    }

    if (type === 'boolean') {
        return typeof value === 'boolean';
    }

    return false;
}

/**
 * 将传入的options过滤掉不合法值，并和默认值合并
 *
 * @param {Object} options 用户配置
 * @return {Object} 合并后的配置项
 */
function mergeOptions(options) {
    let resultOptions = {
        cache: {}
    };

    if (isValid(options.debug, 'boolean')) {
        resultOptions.debug = options.debug;
    }

    if (isValid(options.timeout)) {
        resultOptions.timeout = options.timeout;
    }
    else {
        resultOptions.timeout = defaultOptions.timeout;
    }

    if (typeof options.cache === 'object') {
        if (isValid(options.cache.name, 'string')) {
            resultOptions.cache.name = options.cache.name;
        }
        else {
            resultOptions.cache.name = defaultOptions.cache.name;
        }

        if (isValid(options.cache.maxEntries)) {
            resultOptions.cache.maxEntries = options.cache.maxEntries;
        }
        else {
            resultOptions.cache.maxEntries = defaultOptions.cache.maxEntries;
        }

        if (isValid(options.cache.maxAge)) {
            resultOptions.cache.maxAge = options.cache.maxAge;
        }
        else {
            resultOptions.cache.maxAge = defaultOptions.cache.maxAge;
        }
    }
    else {
        resultOptions.cache = defaultOptions.cache;
    }

    return resultOptions;
}

export default {

    /**
     * 获取合并后的配置项
     *
     * @param {Object} options 用户配置
     * @return {Object} 合并后的配置
     */
    getOptions(options) {
        if (!options) {
            return defaultOptions;
        }

        return mergeOptions(options);
    },

    /**
     * 获取缓存策略（去除不合法的值）
     *
     * @param {string} strategy 用户配置的策略
     * @return {string} 实际策略
     */
    getStrategy(strategy) {
        if (validStrategy.indexOf(strategy) !== -1) {
            return strategy;
        }

        return defaultStrategy;
    },

    /**
     * 设置默认配置
     *
     * @param {Object} options 新的默认配置
     */
    setOptions(options) {
        defaultOptions = mergeOptions(options);
    },

    /**
     * 设置默认缓存策略
     *
     * @param {string} strategy 新的默认缓存策略
     */
    setStrategy(strategy) {
        if (validStrategy.indexOf(strategy) !== -1) {
            defaultStrategy = strategy;
        }
    }
};
