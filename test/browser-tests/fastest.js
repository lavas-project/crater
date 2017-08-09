/**
 * @file 基于sw-toolbox修改的cache-first单测
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-env browser, mocha */

'use strict';

describe('Test fastest', function() {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const CACHE_NAME = '@sw-test@';
    const REQUEST_PATH = '/test/data/files/fastest.txt';
    const ORIGIN_CONTENT = 'Origin content from fastest';
    const MODIFI_CONTENT = 'Modification content from testing';

    // 测试步骤
    // 1. 获取文件，验证是否为原始内容
    // 2. 读取缓存，验证是否为原始内容
    it('should return network value and add it to the cache', function() {
        return swUtils.activateSW(SW_FILE_PATH)
        .then(iframe => {
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
            responseText.trim().should.equal(ORIGIN_CONTENT);
        });
    });

    // 测试步骤
    // 1. 将修改内容写入缓存
    // 2. 获取文件，验证内容是否为原始内容或者修改内容
    // 3. 获取缓存，验证内容为原始内容（被fastest更新过了）
    it('should return cache or network value and update the cache with the network value', function() {
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
            if (responseText.trim() !== ORIGIN_CONTENT &&
                responseText.trim() !== MODIFI_CONTENT) {
                throw new Error('Reponse is neither the cache or response.');
            }

            return new Promise(resolve => {
                // Give the fastest step time to respond to request and
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
            responseText.trim().should.equal(ORIGIN_CONTENT);
        });
    });
});
