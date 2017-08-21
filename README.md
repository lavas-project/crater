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

如何使用 crater 为你的站点生成 `service-worker.js` 以及如何注册生效，请参考 Wiki 的[使用方法](https://github.com/lavas-project/crater/wiki/%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)部分

## 设计思路

关于 crater 的设计思路，内部模块结构等信息请参阅 Wiki 的[设计思路](https://github.com/lavas-project/crater/wiki/%E8%AE%BE%E8%AE%A1%E6%80%9D%E8%B7%AF)部分
