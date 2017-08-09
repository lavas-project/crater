/**
 * @file 用于记录和匹配URL
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

import strategies from './strategies';

// 数组元素结构：
// {
//     referrerPattern: /xxx/,
//     routers: {
//         'get': [], (reg: strategy)
//         'post': [],
//         'put': [],
//         'delete': [],
//         'all': []
//     }
// }
let routersArr = [];

const validMethod = ['get', 'post', 'put', 'delete', 'all'];

function addRouterMap(referrerPattern, method, urlPattern, strategy, options) {
    for (let i = 0; i < routersArr.length; i++) {
        let referrerObject = routersArr[i];

        if (referrerObject.referrerPattern.toString() === referrerPattern.toString()) {
            referrerObject.routers[method].push({urlPattern, strategy, options});
            return;
        }
    }

    let addObject = {
        referrerPattern,
        routers: {
            'get': [],
            'post': [],
            'put': [],
            'delete': [],
            'all': []
        }
    };
    addObject.routers[method].push({urlPattern, strategy, options});
    routersArr.push(addObject);
}

function getStrategy(name) {
    if (!name || Object.keys(strategies).indexOf(name) === -1) {
        return;
    }

    return strategies[name];
}

/**
 * 检测url是否匹配pattern。
 * 如果pattern是个方法，则传入request看返回。
 *
 * @param {Object|Function} pattern reg/function
 * @param {Object}          request 请求对象(event.request)
 * @return {boolean} 是否匹配
 */
function matchPattern(pattern, request) {
    if (typeof pattern === 'object') {
        return pattern.test(request.url);
    }

    if (typeof pattern === 'function') {
        return pattern(request);
    }

    return false;
}

/**
 * 按照配置文件匹配请求
 * 先匹配referrer判断哪个产品
 * 再匹配routers选出策略和配置项
 *
 * @param {Object} request event.request
 * @param {string} method  请求方法，也可传all
 * @return {Object} 匹配对象，{strategy, options}
 */
function matchInner(request, method) {
    let referrer = request.referrer;

    let matchProduct;
    for (let i = 0; i < routersArr.length; i++) {
        let product = routersArr[i];

        if (product.referrerPattern.test(referrer)) {
            matchProduct = product;
            break;
        }
    }

    if (!matchProduct) {
        return null;
    }

    let matchItem;
    for (let i = 0; i < matchProduct.routers[method].length; i++) {
        let router = matchProduct.routers[method][i];

        if (matchPattern(router.urlPattern, request)) {
            matchItem = router;
            break;
        }
    }

    if (!matchItem) {
        return null;
    }

    let {strategy, options} = matchItem;

    return {
        strategy: getStrategy(strategy),
        options
    };
}

export default {
    add(referrerPattern, method, urlPattern, strategy, options) {
        method = method.toLowerCase();

        if (validMethod.indexOf(method) === -1) {
            return;
        }

        addRouterMap(referrerPattern, method, urlPattern, strategy, options);
    },

    match(request) {
        let method = request.method.toLowerCase();
        let matchItem;

        // get, post, put, delete
        if (validMethod.indexOf(method) !== -1) {
            matchItem = matchInner(request, method);
        }

        // all
        if (!matchItem) {
            matchItem = matchInner(request, 'all');
        }

        if (!matchItem) {
            return null;
        }

        return matchItem;
    }
};
