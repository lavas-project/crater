# crater

[![Build Status](https://img.shields.io/travis/lavas-project/crater.svg?style=flat-square)](https://travis-ci.org/lavas-project/crater)

![crater](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1502705187782&di=efa34e8b6d96e4dc8552b05fd26f2afe&imgtype=0&src=http%3A%2F%2Fs10.sinaimg.cn%2Fmiddle%2Fa02624d8xb76cd4403679%26690)

## 介绍

[PWA](https://lavas.baidu.com/doc) 是提升 WEB 站点体验的一种新方法，能提供用户原生应用的体验，其核心之一在于 [service-worker](https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-introduction)。

我们为开发者提供了一个快速的，减少开发成本的统一解决方案：crater。它能够为站点提供 service-worker 支持，用以缓存 js, css 等静态文件，提升 WEB 页面访问速度，符合 PWA 渐进的思想，从而提升用户体验，并且用户不需要进行任何相关的编码，只需要编写配置文件即可。

crater 模拟的运行环境是这样的：一个 WEB 站点中分为多个互不相关的模块（用 referrer 作为区分），每个模块可以控制自身的静态文件缓存策略，并编写成各自的配置文件。由 crater 生成统一的 service-worker 并交由站点注册，从而生效。

一个比较具体的例子是百度搜索首页 [https://m.baidu.com/](https://m.baidu.com/)，每一条搜索结果都可能由不同的模块负责，并且具有不同的 referrer 以示区别。

## 运行方式

crater 会生成一份 `service-worker.js` 提供给 WEB 站点。其中包含每个模块的配置，告诉 `service-worker.js` 应该对 __哪些静态资源__ 以 __何种策略__ 进行缓存，此外也包括一些配置参数。如上所述，不同模块之间由 `request.referrer` 进行区分，防止互相干扰。

因为整个 WEB 站点使用同一个 `service-worker.js` ，并且注册的 `scope` 建议为 `/` ，因此需要将各个模块的缓存文件互相隔离开来，避免互相影响。目前 crater 允许每个模块缓存最多50个文件，超过这个限制之后，我们会采取 LRU 策略([Least Recently Used](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU))对缓存进行更替。当然这个值也是可以在配置项中进行调整的。

关于 `service-worker.js` 如何对静态文件进行缓存，可以参阅 lavas 的官网文档中对 service worker 的 [介绍](https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-introduction)。简单来说，在 `install` 阶段对预缓存(pre-cache)资源进行缓存；在 `fetch` 阶段对模块添加的符合规则的静态资源尝试使用模块配置的策略进行读取并返回。

## 更多信息

详细的使用方法和设计思路等更多信息请参阅 [Wiki](https://github.com/lavas-project/crater/wiki)
