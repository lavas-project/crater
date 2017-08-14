/**
 * @file 测试策略和路由规则的配置文件
 * @author wangyisheng@outlook.com (wangyisheng)
 * @author chenqiushi@baidu.com (chenqiushi)
 */

'use strict';

export default {

    name: 'test',

    // referrer url patterns
    referrerPattern: /\/test/,

    validateReferrer: '/test/browser-tests/index.html',

    routers: [
        /* ============================ 策略测试部分 ============================ */
        {
            method: 'get',
            // static file url patterns
            urlPattern: /test\/data\/files\/networkOnly\.txt$/,
            strategy: 'networkOnly',
            validate: [{
                url: '/test/data/files/networkOnly.txt'
            }]
        },
        {
            method: 'get',
            urlPattern: /test\/data\/files\/cacheOnly\.txt$/,
            strategy: 'cacheOnly',
            validate: [{
                url: '/test/data/files/cacheOnly.txt'
            }]
        },
        {
            method: 'get',
            urlPattern: /test\/data\/files\/fastest\.txt$/,
            strategy: 'fastest',
            validate: [{
                url: '/test/data/files/fastest.txt'
            }]
        },
        {
            method: 'get',
            urlPattern: /test\/data\/files\/cacheFirst\.txt$/,
            strategy: 'cacheFirst',
            validate: [{
                url: '/test/data/files/cacheFirst.txt'
            }]
        },
        {
            method: 'get',
            urlPattern: /test\/data\/files\/networkFirst\.txt$/,
            strategy: 'networkFirst',
            validate: [{
                url: '/test/data/files/networkFirst.txt'
            }]
        },
        // for networkFirst 错误请求
        {
            method: 'get',
            urlPattern: /test\/data\/files\/badrequest$/,
            strategy: 'networkFirst',
            validate: [{
                url: '/test/data/files/badrequest'
            }]
        },
        // for networkFirst 超时请求
        {
            method: 'get',
            urlPattern: /test\/data\/files\/timeout$/,
            strategy: 'networkFirst',
            validate: [{
                url: '/test/data/files/timeout'
            }]
        },
        // for maxAge, maxEntries 配置项
        {
            method: 'get',
            urlPattern: /test\/data\/files\/text-\d\.txt$/,
            strategy: 'networkFirst',
            validate: [{
                url: '/test/data/files/text-1.txt'
            }]
        },

        /* ============================ 路由测试部分 ============================ */
        {
            method: 'get',
            urlPattern: /test\/data\/files\/router-get\.txt$/,
            strategy: 'fastest',
            validate: [{
                url: '/test/data/files/router-get.txt'
            }]
        },
        {
            method: 'post',
            urlPattern: /test\/data\/files\/router-post\.txt$/,
            strategy: 'fastest',
            validate: [{
                url: '/test/data/files/router-post.txt'
            }]
        },
        {
            method: 'put',
            urlPattern: /test\/data\/files\/router-put\.txt$/,
            strategy: 'fastest',
            validate: [{
                url: '/test/data/files/router-put.txt'
            }]
        },
        {
            method: 'delete',
            urlPattern: /test\/data\/files\/router-delete\.txt$/,
            strategy: 'fastest',
            validate: [{
                url: '/test/data/files/router-delete.txt'
            }]
        },
        {
            method: 'all',
            urlPattern: /test\/data\/files\/router-all\.txt$/,
            strategy: 'fastest',
            validate: [{
                url: '/test/data/files/router-all.txt'
            }]
        }
    ],

    options: {
        timeout: 2000,
        cache: {
            maxEntries: 2,
            maxAge: 1000
        }
    }
};
