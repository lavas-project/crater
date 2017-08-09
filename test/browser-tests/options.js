/**
 * @file options 单测
 * @author chenqiushi (chenqiushi@baidu.com)
 */
/* eslint-env browser, mocha */

'use strict';

describe('Test Options Parameters', function() {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const CACHE_NAME = '@sfe-sw-test@';

    /**
    * Prepends a common prefix to several partial URLs, and returns the absolute URLs.
    * @param {Array.<String>} urls The partial URLs.
    * @return {Array.<String>} The absolute URLs.
    */
    let absoluteTestDataFileUrls = urls => urls.map(url => {
        return String(new URL(url, `${location.origin}/test/data/files/`));
    });

    /**
     * @param {Number} timeout The number of milliseconds to pause for.
     * @return {Promise} A promise that resolves after a specified delay.
     */
    let pause = timeout => {
        return new Promise(resolve => setTimeout(resolve, timeout));
    };

    /**
     * Performs a series of fetch() calls on an iframe, then pauses.
     * @param {iframe} iframe The iframe whose contentWindow will be used to fetch().
     * @param {Array.<String>} urls The URLs to fetch.
     * @return {Promise} A promise that resolves following the fetches and a delay.
     */
    let sequentialFetch = (iframe, urls) => {
        return urls.reduce(
                (chain, url) => {
                    return chain.then(() => iframe.contentWindow.fetch(url));
                }, Promise.resolve()
            )
            .then(() => pause(500));
    };

    /**
     * Asserts that the keys in cachedAssets match exactly the list of expected URLs.
     * @param {Object} cachedAssets The result from a call to swUtils.getAllCachedAssets().
     * @param {Array.<String>} expectedUrls The expected cache contents.
     */
    let assertCacheContents = (cachedAssets, expectedUrls) => {
        const expectedLength = expectedUrls.length;
        const cachedUrls = Object.keys(cachedAssets);
        const filteredUrls = cachedUrls.filter(url => expectedUrls.includes(url));
        filteredUrls.should.have.lengthOf(expectedLength);
        cachedUrls.should.have.lengthOf(expectedLength);
    };


    describe('options.cache.maxAge && options.cache.maxEntries', function() {
        it('should cache according to global maxAge & maxEntries option', function() {

            const urls = absoluteTestDataFileUrls(
                [
                    'text-1.txt',
                    'text-2.txt',
                    'text-3.txt',
                    'text-4.txt'
                ]);

            return swUtils.activateSW(SW_FILE_PATH).then(iframe => {
                return iframe.contentWindow.fetch(urls[0])
                    .then(() => pause(1500))
                    .then(() => sequentialFetch(iframe, urls.slice(1, 3)))
                    .then(() => swUtils.getAllCachedAssets(CACHE_NAME))
                    .then(cachedAssets => assertCacheContents(cachedAssets, urls.slice(1, 3)))
                    .then(() => sequentialFetch(iframe, urls.slice(2, 4)))
                    .then(() => swUtils.getAllCachedAssets(CACHE_NAME))
                    .then(cachedAssets => assertCacheContents(cachedAssets, urls.slice(2, 4)));
            });
        });
    });
});
