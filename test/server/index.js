/**
 * 基于 toolbox 修改的测试 express 服务器
 */

'use strict';

/* eslint-env node */

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

// If the user tries to go to the root of the server, redirect them
// to the browser test path
app.get('/', function(req, res) {
    res.redirect('/test/browser-tests/');
});

let _server;

function startServer(staticAssetsPath, portNumber) {
    if (_server) {
        _server.close();
    }

    // 0 will pick a random port number
    if (typeof portNumber === 'undefined') {
        portNumber = 0;
    }

    // 让静态文件可以通过任何HTTP方法来访问
    app.use('/test/data/files', function (req, res, next) {
        req.method = 'GET';
        next();
    });
    // Allow all assets in the project to be served, including any
    // required js code from the project
    //
    // Add service worker allowed header to avoid any scope restrictions
    // NOTE: NOT SAFE FOR PRODUCTION!!!
    app.use('/', express.static(staticAssetsPath, {
        setHeaders: function(res) {
            res.setHeader('Service-Worker-Allowed', '/');
        }
    }));
    app.use(cookieParser());

    // If the user tries to go to the root of the test server, redirect them
    // to /test/
    app.get('/', function(req, res) {
        res.redirect('/test/browser-tests/');
    });

    // Iframes need to have a page loaded so the service worker will have
    // a page to claim and control. This is done by returning a basic
    // html file for /test/iframe/<timestamp>
    app.get('/test/iframe/:timestamp', function(req, res) {
        res.sendFile(path.join(__dirname, '..', 'data', 'test-iframe.html'));
    });

    // for networkFirst 错误请求
    app.get('/test/data/files/badrequest', function(req, res) {
        res.status(500).send({
            error: 'something blew up'
        });
    });

    // for networkFirst 超时请求
    app.get('/test/data/files/timeout', function(req, res) {
        setTimeout(function() {
            res.send('timeout result');
        }, 2500);
    });

    return new Promise(resolve => {
        // Start service on desired port
        _server = app.listen(portNumber, function() {
            resolve(_server.address().port);
        });
    });
}

function killServer() {
    if (_server) {
        _server.close();
        _server = null;
    }
}

module.exports = {
    startServer: startServer,
    killServer: killServer
};
