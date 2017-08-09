/**
 * @file 构建配置文件
 * @author wangyisheng@baidu.com (wangyisheng)
 */

var path = require('path');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = {
    build: {
        outputPath: resolve('dist'),
        productionSourceMap: false
    }
};
