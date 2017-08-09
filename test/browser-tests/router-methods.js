/**
 * @file 基于sw-toolbox修改的路由规则单测
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-env browser, mocha */

'use strict';

describe('Test router', function () {
    const swUtils = window.goog.swUtils;
    const SW_FILE_PATH = '/dist/service-worker.js';
    const REQUEST_DIR = '/test/data/files/';
    const validMethod = ['get', 'post', 'put', 'delete'];

    // 测试通过不同方法获取到的内容是否符合预期
    const testMethodInner = (method, fileUrl, expectedContent) => {
        return swUtils.getIframe()
            .then(iframe => iframe.contentWindow.fetch(fileUrl, {method}))
            .then(response => {
                response.status.should.equal(200);
                return response.text();
            })
            .then(responseText => responseText.should.equal(expectedContent));
    };

    // 注册service-worker并处理all
    const testMethod = (method, fileUrl, expectedContent) => {
        return swUtils.activateSW(SW_FILE_PATH).then(() => {
            if (method === 'all') {
                return Promise.all(
                    validMethod.map(fetchMethod => {
                        return testMethodInner(fetchMethod, fileUrl, expectedContent);
                    })
                );
            }

            return testMethodInner(method, fileUrl, expectedContent);
        })
    }

    it('should retrieve content using GET method', () => {
        return testMethod('get', REQUEST_DIR + 'router-get.txt', 'router get content');
    });

    it('should retrieve content using POST method', () => {
        return testMethod('post', REQUEST_DIR + 'router-post.txt', 'router post content');
    });

    it('should retrieve content using PUT method', () => {
        return testMethod('put', REQUEST_DIR + 'router-put.txt', 'router put content');
    });

    it('should retrieve content using DELETE method', () => {
        return testMethod('delete', REQUEST_DIR + 'router-delete.txt', 'router delete content');
    });

    it('should retrieve content using ALL method', () => {
        return testMethod('all', REQUEST_DIR + 'router-all.txt', 'router all content');
    });
});
