/**
 * @file 基于sw-toolbox修改的cache-first单测
 * @author wangyisheng@outlook.com (wangyisheng)
 */

/* eslint-env browser, mocha */

'use strict';

describe('Test cacheFirst', function () {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const CACHE_NAME = '@sw-test@';
    const REQUEST_PATH = '/test/data/files/cacheFirst.txt'
    const ORIGIN_CONTENT = 'Origin content from cache first';
    const MODIFI_CONTENT = 'Modification content from testing';

    // 测试步骤：
    // 1. 写入缓存
    // 2. fetch并检查是否读到正确的内容
    // 3. 检查缓存内是否是正确的内容
    it('should retrieve the first value from the cache and not update it', function () {
        let iframe;

        return swUtils.activateSW(SW_FILE_PATH)
        .then(newIframe => {
            iframe = newIframe;
        })
        .then(() => {
            return window.caches.open(CACHE_NAME);
        })
        .then(cache => {
            return cache.put(REQUEST_PATH, new Response(MODIFI_CONTENT));
        })
        .then(() => {
            return iframe.contentWindow.fetch(REQUEST_PATH);
        })
        .then(response => {
            response.status.should.equal(200);
            return response.text();
        })
        .then(responseText => {
            responseText.trim().should.equal(MODIFI_CONTENT);
            return window.caches.open(CACHE_NAME);
        })
        .then(cache => {
            return cache.match(REQUEST_PATH);
        })
        .then(response => {
            return response.text();
        })
        .then(responseText => {
            responseText.trim().should.equal(MODIFI_CONTENT);
        });
    });

    // 测试步骤
    // 1. 直接获取文件，检查是否为原始内容
    // 2. 获取缓存，检查是否为原始内容
    // 3. 将修改内容写入缓存
    // 4. 获取文件，检查是否为修改内容
    it('should retrieve the first value from the network and then the altered cache', function () {
        let iframe;

        return swUtils.activateSW(SW_FILE_PATH)
        .then(newIframe => {
            iframe = newIframe;
        })
        .then(() => {
            return iframe.contentWindow.fetch(REQUEST_PATH);
        })
        .then(response => {
            response.status.should.equal(200);
            return response.text();
        })
        .then(responseText => {
            responseText.trim().should.equal(ORIGIN_CONTENT);
            return new Promise(resolve => {
                // Give the fastest step time to respond to request and
                // update the cacheFirst
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
            responseText.trim().should.equal(ORIGIN_CONTENT);
            return window.caches.open(CACHE_NAME);
        })
        .then(cache => {
            return cache.put(REQUEST_PATH, new Response(MODIFI_CONTENT));
        })
        .then(() => {
            return iframe.contentWindow.fetch(REQUEST_PATH);
        })
        .then(response => {
            response.status.should.equal(200);
            return response.text();
        })
        .then(responseText => {
            responseText.trim().should.equal(MODIFI_CONTENT);
        });
    });
});
