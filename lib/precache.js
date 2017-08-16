/**
 * @file 记录每个产品预缓存列表
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

// 存储预缓存文件列表，格式：
// {
//     cacheName: [xxx],
//     ...
// }
let precacheList = {};

export default {

    /**
     * 添加预缓存文件
     *
     * @param {string} cacheName 缓存名称
     * @param {Array<string>} fileList 缓存文件列表
     */
    add(cacheName, fileList) {
        if (Array.isArray(fileList) && fileList.length !== 0) {
            precacheList[cacheName] = fileList;
        }
    },

    /**
     * 获取所有预缓存文件列表
     *
     * @return {Object} 预缓存文件对象
     */
    getList() {
        return precacheList;
    }
};
