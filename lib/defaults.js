/**
 * @file 处理strategy和options的默认值等
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

let defaultOptions = {
    debug: false,
    timeout: 3000,
    cache: {
        name: '@sw@',
        maxEntries: 50,
        maxAge: 24 * 60 * 60 * 1000
    }
};
let defaultStrategy = 'networkFirst';

const validStrategy = ['fastest', 'networkFirst', 'cacheFirst', 'networkOnly', 'cacheOnly'];

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
    // 将options和defaultOptions合并后返回
    getOptions(options) {
        if (!options) {
            return defaultOptions;
        }

        return mergeOptions(options);
    },

    getStrategy(strategy) {
        if (validStrategy.indexOf(strategy) !== -1) {
            return strategy;
        }

        return defaultStrategy;
    },

    setOptions(options) {
        defaultOptions = mergeOptions(options);
    },

    setStrategy(strategy) {
        if (validStrategy.indexOf(strategy) !== -1) {
            defaultStrategy = strategy;
        }
    }
};
