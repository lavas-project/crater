/**
 * @file sw-base基础库对外接口
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import router from './router';
import {installListener, activateListener, fetchListener} from './listeners';
import defaults from './defaults';
import precache from './precache';

// 添加事件监听
self.addEventListener('install', installListener);
self.addEventListener('activate', activateListener);
self.addEventListener('fetch', fetchListener);

export default {

    /**
     * 添加一条路由规则
     *
     * @param {Object} referrerPattern 匹配referrer的正则表达式
     * @param {string} method HTTP方法，或者all
     * @param {Object|Function} urlPattern 匹配url的正则表达式，也可以接受方法，参数为request
     * @param {string} strategy 使用的缓存策略
     * @param {Object} options 使用的配置项
     */
    add(referrerPattern, method, urlPattern, strategy, options) {
        router.add(referrerPattern, method, urlPattern, defaults.getStrategy(strategy), defaults.getOptions(options));
    },

    /**
     * 添加预缓存文件
     *
     * @param {string} cacheName 缓存名称
     * @param {Array<string>} fileList 缓存文件列表
     */
    precache(cacheName, fileList) {
        precache.add(cacheName, fileList);
    },

    /**
     * 设置默认配置
     *
     * @param {Object} options 新的默认配置
     */
    setDefaultOptions(options) {
        defaults.setOptions(options);
    },

    /**
     * 设置默认缓存策略
     *
     * @param {string} strategy 新的默认缓存策略
     */
    setDefaultStrategy(strategy) {
        defaults.setStrategy(strategy);
    }
};
