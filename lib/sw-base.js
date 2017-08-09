/**
 * @file sw-base基础库
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

import router from './router';
import {installListener, activateListener, fetchListener} from './listeners';
import defaults from './defaults';
import precache from './precache';

self.addEventListener('install', installListener);
self.addEventListener('activate', activateListener);
self.addEventListener('fetch', fetchListener);

export default {
    add(referrerPattern, method, urlPattern, strategy, options) {
        router.add(referrerPattern, method, urlPattern, defaults.getStrategy(strategy), defaults.getOptions(options));
    },

    precache(cacheName, fileList) {
        precache.add(cacheName, fileList);
    },

    setDefaultOptions(options) {
        return defaults.setOptions(options);
    },

    setDefaultStrategy(strategy) {
        return defaults.setStrategy(strategy);
    }
};
