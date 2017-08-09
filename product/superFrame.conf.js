/**
 * @file superframe静态文件
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

export default {

    name: 'superFrame',

    // referrer url patterns
    referrerPattern: /\/sf\?/,

    validateReferrer: 'https://m.baidu.com/sf?openapi=1&dspName=iphone&from_sf=1&pd=city&resource_id=4324&ms=1&ms=1&word=%E5%8C%97%E4%BA%AC&hide=1&apitn=tangram&top=%7B%22sfhs%22%3A2%7D&city_name=None&title=%E5%8C%97%E4%BA%AC%E6%97%85%E6%B8%B8&lid=4572408700669128688&frsrcid=32228&frorder=1',

    routers: [
        {
            method: 'get',
            // static file url patterns
            urlPattern: /se\/static\/sf\/.*(css|js)$/,
            strategy: 'networkFirst',
            validate: [{
                url: '/se/static/sf/app/pmd/pmd/deps/naboo_eaee39f.js'
            }]
        }
    ]
};
