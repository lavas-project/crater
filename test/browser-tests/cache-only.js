/**
 * @file cache-only 单测
 * @author tracy (qiushidev@gmail.com)
 */

/* eslint-env browser, mocha */

'use strict';

describe('Test cacheOnly', function () {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const REQUEST_PATH = '/test/data/files/cacheOnly.txt';
    const CACHE_NAME = '@sw-test@';

    it('should return nothing from the empty cache', function () {
        return swUtils.activateSW(SW_FILE_PATH)
            .then(iframe => {
                return iframe.contentWindow.fetch(REQUEST_PATH);
            })
            .then((response) => {
                throw new Error('This shouldn\'t have returned a value');
            }, () => {
                // NOOP
            });
    });

    it('should return value from the cache', function () {
        const date = String(Date.now());
        let iframe;
        return swUtils.activateSW(SW_FILE_PATH)
            .then(newIframe => {
                iframe = newIframe;
            })
            .then(() => {
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.put(REQUEST_PATH, new Response(date));
            })
            .then(() => {
                return iframe.contentWindow.fetch(REQUEST_PATH);
            })
            .then(response => {
                response.status.should.equal(200);
                return response.text();
            })
            .then(response => {
                response.should.equal(String(date));
            });
    });

    it('should return value from the cache even if cache has been deleted', function () {
        const date = String(Date.now());
        let iframe;
        return swUtils.activateSW(SW_FILE_PATH)
            .then(newIframe => {
                iframe = newIframe;
            })
            .then(() => {
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.put(REQUEST_PATH, new Response(date));
            })
            .then(() => {
                return iframe.contentWindow.fetch(REQUEST_PATH);
            })
            .then(response => {
                response.status.should.equal(200);
                return response.text();
            })
            .then(response => {
                response.should.equal(String(date));
            })
            .then(() => {
                return window.caches.open(CACHE_NAME);
            })
            .then(cache => {
                return cache.delete(REQUEST_PATH);
            })
            .then(() => {
                return iframe.contentWindow.fetch(REQUEST_PATH);
            })
            .then(() => {
                throw new Error('This should have rejected');
            }, () => {
                // NOOP - Error is valid here
            });
    });
});