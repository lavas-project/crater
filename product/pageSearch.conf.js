/**
 * @file 大搜静态文件
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

export default {

    name: 'pageSearch',

    // referrer url patterns
    referrerPattern: /\/s\?/,

    validateReferrer: 'https://m.baidu.com/s?word=123&ts=0&t_kt=0&ie=utf-8&rsv_iqid=2950933944&rsv_t=59feNNSsxLiVpQVUwj7SxdZ%252BTEvttKzgZj7zBw%252BUz%252FRihNQcWwKR&sa=ib&rsv_pq=2950933944',

    routers: [
        {
            method: 'get',
            // static file url patterns
            urlPattern: /se\/static\/(js|pmd|css)\/.*(css|js)$/,
            strategy: 'networkFirst',
            validate: [{
                url: '/se/static/js/uiamd/bdbox/follow_4ff41a2.js'
            }]
        }
    ]
};
