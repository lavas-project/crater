/**
 * @file 测试预缓存的配置文件
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

export default {

    name: 'precache',

    referrerPattern: /\/test/,

    // 只是为了测试因此没有写validateReferrer和routers配置项，正常情况不允许

    precache: [
        '/test/data/files/precache-1.txt',
        '/test/data/files/precache-2.txt'
    ]
};
