/**
 * @file build entry
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-disable no-console */

// process.env.NODE_ENV = 'production';

var ora = require('ora');
var rm = require('rimraf');
var chalk = require('chalk');
var webpack = require('webpack');
var config = require('./config');
var webpackConfig = require('./webpack.conf');
var oraInfo = process.env.NODE_ENV === 'testing' ? 'Testing' : 'Production';

var spinner = ora('building for ' + oraInfo + '...');
spinner.start();

rm(config.build.outputPath, function (err) {
    if (err) {
        throw err;
    }
    webpack(webpackConfig, function (err, stats) {
        spinner.stop();
        if (err) {
            throw err;
        }
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n\n');

        console.log(chalk.cyan('  Build complete.\n'));

        process.exit();
    });
});
