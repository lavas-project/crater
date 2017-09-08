# crater

[![Build Status](https://img.shields.io/travis/lavas-project/crater.svg?style=flat-square)](https://travis-ci.org/lavas-project/crater)

![crater](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1502705187782&di=efa34e8b6d96e4dc8552b05fd26f2afe&imgtype=0&src=http%3A%2F%2Fs10.sinaimg.cn%2Fmiddle%2Fa02624d8xb76cd4403679%26690)

## 介绍

crater 的运行环境是这样的：一个 WEB 站点中存在多个互不相关的模块，每个模块可以控制自身的静态文件缓存策略，并编写成各自的配置文件。由 crater 生成统一的 service-worker 并交由站点注册，从而实现互相分离的静态文件缓存。

一个比较具体的例子是百度搜索首页。例如我们在百度移动端搜索[北京旅游](https://m.baidu.com/s?word=%E5%8C%97%E4%BA%AC%E6%97%85%E6%B8%B8)，观察请求的静态 JavaScript 文件。所有请求的 JavaScript 脚本的 referrer 都以 `https://m.baidu.com/s?` 开头。当我们点击第一条结果的“详细攻略”后，因为百度搜索的一种优化策略 `superframe` 允许页面在当页进行跳转，并通过 `pushState` 更改页面的[URL](https://m.baidu.com/sf?openapi=1&dspName=iphone&from_sf=1&pd=city&resource_id=4324&ms=1&ms=1&word=%E5%8C%97%E4%BA%AC&hide=1&apitn=tangram&top=%7B%22sfhs%22%3A2%7D&title=%E7%9B%AE%E7%9A%84%E5%9C%B0%E6%94%BB%E7%95%A5&city_name=%E4%B8%8A%E6%B5%B7&lid=12939499257738134900&frsrcid=32228&frorder=1)，也因此之后请求的 JavaScript 脚本的 referrer 都以 `https://m.baidu.com/sf?` 开头。如果我们想对这些跨模块的静态脚本进行不同策略的缓存，这时我们就需要 crater。

## 运行方式

crater 会根据根目录下的 `product` 目录中的配置文件生成一份 `service-worker.js` 提供给 WEB 站点。这些配置会告诉 `service-worker.js` 应该对 __哪些静态资源__ 以 __何种策略__ 进行缓存。因为整个 WEB 站点使用同一个 `service-worker.js` ，并且注册的 `scope` 建议为 `/` ，因此不同模块之间由 `request.referrer` 进行区分，各个模块的缓存文件也会互相被隔离开来，避免互相影响。

目前 crater 允许每个模块缓存最多50个文件，超过这个限制之后，我们会采取 LRU 策略([Least Recently Used](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU))对缓存进行更替。当然这个值也是可以在配置项中进行调整的。

关于 `service-worker.js` 如何对静态文件进行缓存，可以参阅 lavas 的官网文档中对 service worker 的 [介绍](https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-introduction)。简单来说，在 `install` 阶段对预缓存(pre-cache)资源进行缓存；在 `fetch` 阶段对模块添加的符合规则的静态资源尝试使用模块配置的策略进行读取并返回。

## 使用方式

开发者将代码 clone 到本地后有三个步骤需要进行：

### 编写配置文件

在 `product` 目录下编写至少一个配置文件，一个最简单的配置文件示例如下：

```javascript
'use strict';

export default {

    // 模块名称（不可重复）
    name: 'pageSearch',

    // referrer规则
    referrerPattern: /\/s\?/,

    // 可通过验证的referrer
    validateReferrer: 'https://m.baidu.com/s?word=123',

    routers: [
        {
            // HTTP方法匹配，可选值'get', 'post', 'put', 'delete', 'all'
            method: 'get',
            // 静态文件URL匹配规则
            urlPattern: /se\/static\/(js|pmd|css)\/.*(css|js)$/,
            // 缓存策略，可选值'networkFirst', 'networkOnly', 'cacheFirst', 'cacheOnly', 'fastest'
            strategy: 'networkFirst',
            // 可通过验证的url
            validate: [{
                url: '/se/static/js/uiamd/bdbox/follow_4ff41a2.js'
            }]
        }
    ]
};
```

这里包含了一个配置文件最基本的三个部分： `name`, `urlPattern`, `routers`。

1. `name` 用以区分各个模块，因此不能重复。最终的缓存名称会命名为 `@crater-${name}`
2. `urlPattern` 用以匹配每个资源请求的 referrer 来决定使用哪个配置文件
3. `routers` 用以列出所有匹配规则和缓存策略，供 `fetch` 阶段逐个匹配并应用策略

### 运行构建命令

在编写配置文件完成后，还需要运行两条命令：

1. `npm run validate`

    对配置文件进行校验检查

2. `npm run build` 或者 `npm start`

    构建生成 `service-worker-[hash:8].js`，位于目录 `dist` 下。

__注意__：为了区分每次打包结果，在生成的最终文件中添加了 `hash`。是否需要重命名脚本视具体情况而定，下文将统一使用 `service-worker.js` 来指代构建结果文件。

### 注册 service worker

在站点页面添加如下代码即可完成注册：

```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(function (registration) {
        // registration was successful
        console.log('service worker registration successful with scope ', registration.scope);
    }).catch(function (err) {
        // registration failed
        console.log(err);
    });
}
```

### 更多使用信息

更多的使用信息（包括配置文件详解和其他运行命令）可以参考 Wiki 的[使用信息](https://github.com/lavas-project/crater/wiki/%E4%BD%BF%E7%94%A8%E4%BF%A1%E6%81%AF)部分

## 设计思路

关于 crater 的设计思路，内部模块结构等信息请参阅 Wiki 的[设计思路](https://github.com/lavas-project/crater/wiki/%E8%AE%BE%E8%AE%A1%E6%80%9D%E8%B7%AF)部分
