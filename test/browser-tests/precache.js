/**
 * @file 基于sw-toolbox修改的precache单测
 * @author wangyisheng@outlook.com (wangyisheng)
 */


/* eslint-env browser, mocha */

'use strict';

describe('Test precache', function() {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const CACHE_NAME = '@sw-precache@';

    let compareCachedAssets = (assetList, cachedAssets) => {
        return new Promise((resolve, reject) => {
            let cachedAssetsKeys = Object.keys(cachedAssets);
            cachedAssetsKeys.should.have.length(assetList.length);

            assetList.forEach(assetPath => {
                let key = location.origin + assetPath;
                if (typeof cachedAssets[key] === 'undefined') {
                    reject(new Error('Cache doesn\'t have a cache item for: ' + key));
                }

                cachedAssets[key].status.should.equal(200);
            });

            resolve();
        });
    };

    describe('Test precache', function() {
        // 测试步骤
        // 1. 在配置文件中配置precache
        // 2. 验证和实际内容是否相符
        it('should precache all desired assets from an array of strings', () => {
            let assetList = [
                '/test/data/files/precache-1.txt',
                '/test/data/files/precache-2.txt'
            ];

            return swUtils.activateSW(SW_FILE_PATH)
            .then(() => {
                return swUtils.getAllCachedAssets(CACHE_NAME);
            })
            .then(cachedAssets => {
                return compareCachedAssets(assetList, cachedAssets);
            });
        });
    });
});
