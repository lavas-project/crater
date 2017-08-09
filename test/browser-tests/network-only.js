/**
 * @file network-first 单测
 * @author chenqiushi (chenqiushi@baidu.com)
 */
/* eslint-env browser, mocha */

'use strict';

describe('Test networkOnly', function() {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const CACHE_NAME = '@sw-test@';
    const REQUEST_PATH = '/test/data/files/networkOnly.txt';

    it('should retrieve the first value from the network and not put anything in the cache', function() {
        let iframe;
        return swUtils.activateSW(SW_FILE_PATH)
            .then(newIframe => {
                iframe = newIframe;
                // Call the iframes fetch event so it goes through the service worker
                return iframe.contentWindow.fetch(REQUEST_PATH);
            })
            .then(response => {
                response.status.should.equal(200);
                return response.text();
            })
            .then(responseText => {
                responseText.trim().should.equal('Hello, World!');
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.match(REQUEST_PATH);
            })
            .then(response => {
                (typeof response).should.equal('undefined');
            });
    });

    it('should retrieve the first value from the network and not update the cache', function() {
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
                responseText.trim().should.equal('Hello, World!');
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.match(REQUEST_PATH);
            })
            .then(response => {
                return response.text();
            })
            .then(responseText => {
                responseText.trim().should.equal(TEST_INPUT);
            });
    });
});