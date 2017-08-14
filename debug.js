/**
 * @file 调试入口
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

/* eslint-disable fecs-no-require */
/* eslint-disable no-console */
require('babel-core/register')({
    plugins: [
        'transform-async-to-generator',
        'transform-decorators-legacy',
        'transform-es2015-modules-commonjs'
    ]
});

let router = require('./lib/router').default;

global.self = {
    addEventListener(event, listener) {
        if (event === 'fetch') {
            setTimeout(() => {
                let matchItem = router.match({
                    method: 'get',
                    referrer: 'https://m.baidu.com/sf?word=123',
                    url: 'https://m.baidu.com/se/static/js/uiamd/bdbox/follow_4ff41a2.js'
                });
                console.log(matchItem);
            }, 500);
        }
    }
};

require('./main');
/* eslint-enable fecs-no-require */
/* eslint-enable no-console */
