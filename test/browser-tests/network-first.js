/**
 * @file network-first 单测
 * @author chenqiushi (chenqiushi@baidu.com)
 */
/* eslint-env browser, mocha */

'use strict';

describe('Test networkFirst', function() {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const CACHE_NAME = '@sfe-sw-test@';
    const REQUEST_PATH = '/test/data/files/networkFirst.txt';

    it('should retrieve the first value from the network', function() {
        let iframe;
        const TEST_INPUT = 'hello';
        return swUtils.activateSW(SW_FILE_PATH)
            .then(newIframe => {
                iframe = newIframe;
            })
            .then(() => {
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.put(REQUEST_PATH, new Response(TEST_INPUT));
            })
            .then(() => {
                // Call the iframes fetch event so it goes through the service worker
                return iframe.contentWindow.fetch(REQUEST_PATH);
            })
            .then(response => {
                response.status.should.equal(200);
                return response.text();
            })
            .then(responseText => {
                responseText.trim().should.equal('networkFirst content');
                return new Promise(resolve => {
                    // Give the networkFirst step time to respond to request and
                    // update the cache
                    setTimeout(resolve, 500);
                });
            })
            .then(() => {
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.match(REQUEST_PATH);
            })
            .then(response => {
                return response.text();
            })
            .then(responseText => {
                // should 更新缓存
                responseText.trim().should.equal('networkFirst content');
            });
    });

    it('should retrieve the value from the cache for a bad request', function() {
        let iframe;
        const TEST_INPUT = 'hello';
        return swUtils.activateSW(SW_FILE_PATH)
            .then(newIframe => {
                iframe = newIframe;
            })
            .then(() => {
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.put('/test/data/files/badrequest', new Response(TEST_INPUT));
            })
            .then(() => {
                // Call the iframes fetch event so it goes through the service worker
                return iframe.contentWindow.fetch('/test/data/files/badrequest');
            })
            .then(response => {
                response.status.should.equal(200);
                return response.text();
            })
            .then(responseText => {
                responseText.trim().should.equal(TEST_INPUT);
            });
    });

    // 测试 option.timeout 配置项
    it('should retrieve the value from the cache for a timeout request', function() {
        let iframe;
        const TEST_INPUT = 'hello';
        return swUtils.activateSW(SW_FILE_PATH)
            .then(newIframe => {
                iframe = newIframe;
            })
            .then(() => {
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.put('/test/data/files/timeout', new Response(TEST_INPUT));
            })
            .then(() => {
                // Call the iframes fetch event so it goes through the service worker
                return iframe.contentWindow.fetch('/test/data/files/timeout');
            })
            .then(response => {
                response.status.should.equal(200);
                return response.text();
            })
            .then(responseText => {
                responseText.trim().should.equal(TEST_INPUT);
            });
    });

});