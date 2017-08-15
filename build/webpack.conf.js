/* eslint-disable */

var path = require('path');
var config = require('./config');
var webpack = require('webpack');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

var isTest = process.env.NODE_ENV === 'testing';

module.exports = {
    entry: isTest ?
        ['serviceworker-cache-polyfill', resolve('testMain.js')] :
        ['serviceworker-cache-polyfill', resolve('main.js')],
    output: {
        path: config.build.outputPath,
        filename: isTest ? 'service-worker.js' : 'service-worker-[hash:8].js'
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: isTest ?
                    [resolve('testMain.js'), resolve('product'), resolve('lib')] :
                    [resolve('main.js'), resolve('product'), resolve('lib')]
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        })
    ]
};
