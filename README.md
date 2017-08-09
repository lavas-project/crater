# sfe-sw

## 介绍

sfe-sw 为百度搜索([https://www.baidu.com/](https://www.baidu.com/) 和 [https://m.baidu.com/](https://m.baidu.com/))提供 service-worker 支持，用以缓存 js, css 等静态文件，提升 WEB 页面访问速度，符合 PWA 渐进的思想，从而提升用户体验。

## 运行方式

sfe-sw会生成一份 `service-worker.js` 提供给百度搜索 WEB 站点。其中包含每个垂类(产品)各自的配置，告诉 `service-worker.js` 应该对__哪些静态资源__以__何种策略__进行缓存，此外也包括一些配置参数。不同产品之间由 `request.referrer` 进行区分，防止互相干扰。

因为百度搜索整站使用同一个 `service-worker.js` ，并且注册的 `scope` 为 `/` ，因此需要将各个产品的缓存文件互相隔离开来，避免互相影响。目前 sfe-sw 允许每个产品缓存最多50个文件，超过这个限制之后，我们会采取 LRU 策略([Least Recently Used](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU))对缓存进行更替。后续我们会根据实际线上运行情况调整这个限制的值，以获得更优的效果。

关于 `service-worker.js` 如何对静态文件进行缓存，可以参阅 lavas 的官网文档中对 service worker 的 [介绍](https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-introduction)。简单来说，在 `install` 阶段对预缓存(pre-cache)资源进行缓存；在 `fetch` 阶段对产品添加的符合规则的静态资源尝试使用产品配置的策略进行读取并返回。

## 如何使用

每个产品向 sfe-sw 提供自己的配置文件即可使用，这个过程采用提交 pull request 来实现。所以核心问题归结为如何编写这个配置文件和如何提交这两部分。下面将逐一讲述：

### 如何编写配置文件

#### 一个简单的配置文件

配置文件统一存放于 `product/*.conf.js`，并在 `product/index.js` 中统一对外暴露并被引用。

我们先来看一个简单的配置文件示例

```javascript
'use strict';

export default {

    // 产品名称（不可重复）
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

1. `name` 用以区分各个产品线，因此不能重复。最终的缓存名称会命名为 `@sfe-sw-${name}`
2. `urlPattern` 用以匹配每个资源请求的 referrer 来决定使用哪个配置文件
3. `routers` 用以列出所有匹配规则和缓存策略，供 `fetch` 阶段逐个匹配并应用策略

下面将对配置文件一些比较重要的部分进行详细说明。

#### routers

因为支持多条规则，因此 `routers` 是一个由对象构成的数组。其中每个对象可以包含 `method`, `urlPattern`, `strategy`, `validate` 四个属性。这里要重点讲一下 `urlPattern` 属性， `validate` 将放在最后讲述。

`urlPattern` 在上面的示例中是一个正则表达式，用以匹配静态文件的 URL 。但此外它也可以是一个方法，参数为 `request`，返回 `true/false` 来给出匹配结果。这主要是为了满足产品根据不同请求来动态确定是否需要读取缓存，也是对正则表达式的一个扩展，例如下面的配置：

```javascript
{
    method: 'get',
    urlPattern(request) {
        if (request.xxx) {
            reutrn /some\/path/.test(request.url);
        }
        else {
            return false;
        }
    },
    strategy: 'fastest',
    validate: [...]
}
```

在使用方法的情况下，对应的 `validate` 数组中的对象将不在提供 `url` 属性，而是提供可以通过验证的 `request` 对象，供检查代码使用。

#### precache

通过 `routers` 的配置，service-worker 可以在 `fetch` 阶段进行资源的匹配和缓存策略的应用。而这样带来的问题是，第一次访问时缓存里并没有目标对象，所以首次访问就一定需要通过网络请求进行 (`cacheOnly`除外)， 使得缓存策略不“那么”完美。对于那些我们已知的，一定会被访问的，我们希望提升访问速度的静态资源我们应当采取 `precache` 的方式，在 `install` 阶段即进行缓存，这样来到 `fetch` 时可以直接读取缓存（如果需要读取的话）。

`precache` 的配置方法也很简单，直接将需要的资源路径以__字符串__的形式写在数组里即可，这里__不支持__正则表达式。

```javascript
export default {
    name: 'xxx',
    urlPattern: /xxx/,
    routers: [...],
    precache: [
        '/news/static/cacheFirst.js',
        '/news/static/main.css'
    ]
}
```

要特别注意的是，所有 `precache` 配置的资源路径__必须__匹配之前配置的 `routers` 中的某一条，否则会被忽略。

#### strategies

项目内置了 5 种 请求-缓存 策略供业务方使用：

- networkFirst

网络请求优先。对于匹配该策略的请求，Service Worker 会优先从网络获取，如果成功，将请求内容返回并保存/更新 到 Cache Strorage 中。如果网络请求失败，则去 Cache Storage 中进行匹配读取，返回缓存的内容。需要注意的是，如果配置了 `options.timeout` 参数，网络请求会在大于这个超时时间后，直接去读取缓存，避免出现弱网环境一直等待服务器超时的情况出现。

- cacheFirst

缓存优先。优先去匹配缓存中的内容，匹配成功即返回，若失败则进行网络请求，返回请求结果并更新至缓存列表。适用于固定不变的静态资源。如果配置了 `options.cache.maxAge`，将只会返回在此有效期内的缓存内容。

- fastest

快速优先。同时进行网络请求和缓存读取，返回两者中较快的。在缓存中有匹配内容的情况下，这种策略通常都是缓存读取较快。但同时网络请求也会进行，并将最新的内容更新至缓存列表，保证下一次访问时，缓存返回的内容相对较新。

- cacheOnly

只读缓存。始终匹配读取缓存，不进行网络请求，如果匹配失败则抛出错误，请求失败。如果配置了 `options.cache.maxAge`，将只会返回在此有效期内的缓存内容。

- networkOnly

只进行网络请求。始终只进行网络请求，若失败也不去读取缓存。与正常请求行为表现一致。


#### options

sfe-sw 还支持一些额外的配置项。它们分别是：

1. `timeout`: `number` 类型，单位毫秒(ms)，默认值3000。用于对网络请求增加一个超时限制。如`networkFirst`策略中一旦网络请求超过这个时长，则读取缓存并返回。
2. `cache.maxEntries`: `number` 类型，默认值50。表示单个产品的缓存数量最大值，多于这个值会采取 LRU 策略进行淘汰。这个配置目前__不允许__超过50。
3. `cache.maxAge`: `number` 类型，单位毫秒(ms)，默认值 24 \* 60 \* 60 \* 1000。表示单个产品的缓存最长时间，过期的缓存将会被清除。在配合上述各种策略使用时，此参数将在读取缓存内容时起作用，不会返回此有效期外的缓存内容。

一个示例写法如下：

```javascript
export default {
    name: 'xxx',
    urlPattern: /xxx/,
    routers: [...],
    options: {
        timeout: 5000,
        cache: {
            maxEntries: 30,
            maxAge: 60 * 60 * 1000
        }
    }
}
```

#### 检查配置文件

因为配置文件是由各产品自行编写，加之最终生成的 `service-worker.js` 是把各产品线的配置融合到一起，因此需要最大限度的保证配置文件的合法性和互相隔离，避免互相影响产生不可预知的问题。

sfe-sw 提供了一个内置的检查工具，可以通过运行命令 `npm run check` 发起检查，如果输出结果为 `pass` 则表示正常，否则会提示相应的错误。

检查主要分为两大类：内部检查和交叉检查。

* 内部检查
    * 检查每条 `validate` 是否能被 `urlPattern` 匹配，如不能则报错
    * 检查每条 `precache` 是否能被 `urlPattern` 匹配，如不能则报错

* 交叉检查 （两两比对）
    * 检查两个配置文件的 `name` 是否相同，如相同则报错
    * 检查配置A的每条 `validate url` 是否能被配置B的 `urlPattern` 匹配，如能则报错

#### 一个比较完整的示例

```javascript
'use strict';

export default {

    name: 'news',

    // referrer url patterns
    urlPattern: /news/,

    routers: [
        {
            method: 'get',
            // static file url patterns
            urlPattern: /news\/static\/cache.*\.js$/,
            strategy: 'cacheFirst',
            validate: [{
                url: '/news/static/cache.js'
            }]
        },
        {
            method: 'get',
            urlPattern(request) {
                if (!request.referrer) {
                    return true;
                }

                return /news\/static\/fast.*\.js$/.test(request.url);
            },
            strategy: 'fastest',
            validate: [{
                request: {
                    url: '/news/static/fat.js'
                }
            }, {
                request: {
                    url: '/news/static/faster.js',
                    referrer: 'http://somewhere'
                }
            }, {
                request: {
                    url: '/news/static/fastest.js',
                    referrer: 'http://somewhere/else'
                }
            }]
        },
        {
            method: 'get',
            urlPattern: /news\/static\/main\.css$/,
            strategy: 'networkFirst',
            validate: [{
                url: '/news/static/main.css'
            }]
        },
        {
            method: 'get',
            urlPattern: /news\/static\/jquery.js$/,
            strategy: 'networkOnly',
            validate: [{
                url: '/news/static/jquery.js'
            }]
        }
    ],

    precache: [
        '/news/static/cache.js',
        '/news/static/main.css'
    ],

    options: {
        timeout: 5000,
        cache: {
            maxEntries: 30,
            maxAge: 1000 * 60 * 60 * 24
        }
    }
};
```

### 如何提交配置文件

sfe-sw 项目代码存放于 iCode 平台上，因此我们只需要找到项目，对其提交评审需求即可。具体来说，步骤大致为：

1. 找到项目，[链接](http://icode.baidu.com/repo/baidu%2Fsfe%2Fsw/files/master/tree/)
2. 获得可写权限。目前可以联系负责人[彭星(pengxing@baidu.com), 王轶盛(wangyisheng@baidu.com), 陈秋实(chenqiushi@baidu.com)]
3. 将代码克隆到本地。方法可按照点击左上角“克隆代码库”后弹出的提示操作。
4. 切换到 `dev-product` 分支。(`git checkout dev-product`)
5. 编写自己的配置文件，方法参考上文。注意不要与其他配置文件重名并符合命名规范(xxx.conf.js)
6. 提交评审需求 (`git commit -a`和`git push origin HEAD:refs/for/dev-product`)
7. 在 iCode 平台添加评审人（可以是上述负责人之一），必要时可 HI 联系，等待合入后即可。

另外在提交前，建议在本地运行 `npm run lint` 和 `npm run validate`，通过这两项检查后再提交可节省重复修改的时间。这两条命令的具体作用将在下一段介绍。

## 其他命令

sfe-sw 项目中还集成了一些命令，如下：

- npm start
- npm run build

这两条命令作用相同，运行后将构建整个项目，打包生成 `service-worker.js` 位于目录 `dist` 内部。

- npm run lint

使用依赖的 `fecs` 进行代码检查。虽然 iCode 平台也集成了代码检查功能，但在提交前使用这条命令检查有助于及时发现并修改问题，避免多次提交评审。此外 `fecs` 的检查力度也要较 iCode 更强一些，建议开发者__在提交前确保通过代码风格检查__。

- npm run validate

这条命令可以检查所有产品的配置文件(`product/*.conf.js`)是否合法，检查方法已经在上面进行描述(包括内部检查和交叉检查)。运行命令之后，如果输出结果为 `pass`， 则检查成功；否则会打印出具体的错误。

在 iCode 平台集成的自动构建中，也会加入这一条命令。如果无法通过，则无法提交并上线，因此建议开发者__在提交前确保能够通过检查__。

- npm run test

这是对 sfe-sw 的缓存策略，路由匹配和预缓存等内部代码进行单测的命令，__一般开发者不必关注__。此外它只支持 Linux 和 Mac OS 系统，因此在 Windows 运行失败是正常情况。
