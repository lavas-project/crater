/**
 * @file 测试脚本入口
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

require('babel-core/register')({
    plugins: [
        'transform-async-to-generator',
        'transform-decorators-legacy',
        'transform-es2015-modules-commonjs'
    ]
});

require('./productConfig');
