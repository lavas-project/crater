# Product Sample

You should list all configures of your products here, including __WHAT__ resources should be cached in __WHICH__ strategy. Sample config files are as follows:

## Sample 1: pageSearch.conf.js

```javascript

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

```

## Sample 2: superFrame.conf.js

```javascript

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

```
