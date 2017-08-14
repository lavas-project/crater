# sw (名字待定，NOT FINISHED)

## 介绍

sw 为站点提供 service-worker 支持，用以缓存 js, css 等静态文件，提升 WEB 页面访问速度，符合 PWA 渐进的思想，从而提升用户体验。

## 运行方式

sw 会生成一份 `service-worker.js` 提供给 WEB 站点。其中包含每个垂类(产品)各自的配置，告诉 `service-worker.js` 应该对__哪些静态资源__以__何种策略__进行缓存，此外也包括一些配置参数。不同产品之间由 `request.referrer` 进行区分，防止互相干扰。

因为百度搜索整站使用同一个 `service-worker.js` ，并且注册的 `scope` 为 `/` ，因此需要将各个产品的缓存文件互相隔离开来，避免互相影响。目前 sfe-sw 允许每个产品缓存最多50个文件，超过这个限制之后，我们会采取 LRU 策略([Least Recently Used](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU))对缓存进行更替。后续我们会根据实际线上运行情况调整这个限制的值，以获得更优的效果。

关于 `service-worker.js` 如何对静态文件进行缓存，可以参阅 lavas 的官网文档中对 service worker 的 [介绍](https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-introduction)。简单来说，在 `install` 阶段对预缓存(pre-cache)资源进行缓存；在 `fetch` 阶段对产品添加的符合规则的静态资源尝试使用产品配置的策略进行读取并返回。

> 感谢 [sw-toolbox](https://github.com/GoogleChrome/sw-toolbox) 的实践，sw 参考了缓存策略的部分实现。
