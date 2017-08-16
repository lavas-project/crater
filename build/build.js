/**
 * @file build entry
 * @author wangyisheng@outlook.com (wangyisheng)
 */

var ora = require('ora');
var rm = require('rimraf');
var chalk = require('chalk');
var webpack = require('webpack');
var config = require('./config');
var webpackConfig = require('./webpack.conf');
var oraInfo = process.env.NODE_ENV === 'testing' ? 'Testing' : 'Production';

var spinner = ora('building for ' + oraInfo + '...');
spinner.start();

// 删除上一次的输出目录
rm(config.build.outputPath, function (err) {
    if (err) {
        throw err;
    }
    // webpack编译
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

        if (stats.compilation.errors && stats.compilation.errors.length !== 0) {
            console.log(chalk.red('  Build Fail.\n'));
            process.exit(1);
        }

        console.log(chalk.cyan('  Build complete.\n'));

        process.exit();
    });
});
