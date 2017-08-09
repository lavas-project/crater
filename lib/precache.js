/**
 * @file 记录每个产品预缓存列表
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

let precacheList = {};

export default {
    add(cacheName, fileList) {
        if (Array.isArray(fileList) && fileList.length !== 0) {
            precacheList[cacheName] = fileList;
        }
    },

    getList() {
        return precacheList;
    }
};
