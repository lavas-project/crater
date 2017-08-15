/**
 * @file 测试conf文件是否有重叠
 * @author wangyisheng@outlook.com (wangyisheng)
 */

'use strict';

import ora from 'ora';
import chalk from 'chalk';
import product from '../../product';

const spinner = ora('Validating product config files').start();

function print(message) {
    spinner.succeed(chalk.green(message));
}

function printError(message) {
    spinner.fail(chalk.red(message));
    process.exit(1);
}

function loadConfigs() {
    let configs = [];

    Object.keys(product).forEach(name => {
        configs.push(product[name]);
        print(`load ${name} config complete`);
    });

    return configs;
}

async function checkConfig() {
    let configs = loadConfigs();

    if (!Array.isArray(configs) || configs.length === 0) {
        printError('product/*.conf.js cannot be empty');
    }
    else {
        isSingleConfigValid(configs) && isMultiConfigValid(configs);
    }
}

/**
 * 单个产品配置内部是否合法
 * 主要检查test.validUrl是否符合上面每一条router
 *
 * @param {Array} configs 所有产品配置构成的数组
 * @return {boolean} 是否合法
 */
function isSingleConfigValid(configs) {
    process.stdout.write('\n');

    return configs.reduce(
        (valid, config) => valid && isSingleConfigValidInner(config),
        true
    );
}

/* eslint-disable fecs-max-statements */
function isSingleConfigValidInner(config) {
    let {name, referrerPattern, validateReferrer, routers, precache} = config;

    if (!name) {
        printError('product config name is required');
        return false;
    }

    if (typeof referrerPattern !== 'object') {
        printError(`${name} config: valid referrerPattern is required`);
        return false;
    }

    if (!validateReferrer) {
        printError(`${name} config: validateReferrer is required`);
        return false;
    }

    if (!Array.isArray(routers) || routers.length === 0) {
        printError(`${name} config: routers is required`);
        return false;
    }

    // 检查referrer
    if (!referrerPattern.test(validateReferrer)) {
        printError(`${name} config: validateReferrer cannot be matched by referrerPattern`);
        return false;
    }

    // 检查每个router的validate
    for (let i = 0; i < routers.length; i++) {
        let router = routers[i];
        let validate = router.validate;

        if (!Array.isArray(validate) || validate.length === 0) {
            printError(`${name} config: validate of routers[${i}] is required`);
            return false;
        }

        for (let j = 0; j < validate.length; j++) {
            let validateItem = validate[j];

            if (typeof router.urlPattern === 'object') {
                if (!validateItem.url) {
                    printError(`${name} config: validate url of routers[${i}] is required`);
                    return false;
                }

                if (!router.urlPattern.test(validateItem.url)) {
                    printError(`${name} config: validate url '${validateItem.url}' `
                        + `cannot be matched by urlPattern ${router.urlPattern}`);
                    return false;
                }
            }
            else if (typeof router.urlPattern === 'function') {
                if (!validateItem.request) {
                    printError(`${name} config: validate request[${j}] of routers[${i}] is required`);
                    return false;
                }

                if (!router.urlPattern(validateItem.request)) {
                    printError(`${name} config: validate request[${j}] of routers[${i}] `
                        + 'cannot be matched by urlPattern function');
                    return false;
                }
            }
            else {
                printError(`${name} config: unknown urlPattern of routers[${i}]`);
                return false;
            }
        }
    }

    // 检查precache是否符合router
    if (Array.isArray(precache) && precache.length !== 0) {
        for (let i = 0; i < precache.length; i++) {
            let precacheUrl = precache[i];
            let matched = false;

            for (let j = 0; j < routers.length; j++) {
                let router = routers[j];

                if (typeof router.urlPattern === 'function') {
                    continue;
                }

                if (router.urlPattern.test(precacheUrl)) {
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                printError(`${name} config: precache url ${precacheUrl} cannot be matched by any routers`);
                return false;
            }
        }
    }

    print(`single validation for ${name} config complete`);

    return true;
}
/* eslint-enable fecs-max-statements */

/**
 * 多个产品之间是否合法
 * 主要检查互相的test.validUrl是否*不能*符合其他产品配置的router
 *
 * @param {Array} configs 所有产品配置构成的数组
 * @return {boolean} 是否合法
 */
function isMultiConfigValid(configs) {
    process.stdout.write('\n');

    if (configs.length === 1) {
        print('cross validation complete');
        return true;
    }

    for (let i = 0; i < configs.length; i++) {
        let config = configs[i];

        for (let j = i + 1; j < configs.length; j++) {
            let anotherConfig = configs[j];

            if (!checkCrossConfig(config, anotherConfig)) {
                return false;
            }
        }
    }

    print('cross validation complete');

    return true;
}

// 交替检查
function checkCrossConfig(config, anotherConfig) {
    return checkCrossConfigInner(config, anotherConfig) && checkCrossConfigInner(anotherConfig, config);
}

// 检查config中的validate是否可以匹配anotherConfig中的pattern
function checkCrossConfigInner(config, anotherConfig) {
    let {name, routers, validateReferrer} = config;
    let {name: anotherName, routers: anotherRouters, referrerPattern: anotherReferrerPattern} = anotherConfig;

    if (name === anotherName) {
        printError(`duplicate config name: ${name}`);
        return false;
    }

    if (anotherReferrerPattern.test(validateReferrer)) {
        printError(`'${validateReferrer}' of ${name} config can be matched `
            + `by referrerPattern ${anotherReferrerPattern} of ${anotherName} config`);
        return false;
    }

    for (let i = 0; i < routers.length; i++) {
        let router = routers[i];

        for (let j = 0; j < anotherRouters.length; j++) {
            let anotherRouter = anotherRouters[j];

            if (typeof anotherRouter.urlPattern === 'function') {
                continue;
            }

            for (let k = 0; k < router.validate.length; k++) {
                let validateItem = router.validate[k];
                let url = validateItem.url || validateItem.request.url;

                if (url && anotherRouter.urlPattern.test(url)) {
                    printError(`'${url}' of ${name} config can be matched `
                        + `by urlPattern ${anotherRouter.urlPattern} of ${anotherName} config`);
                    return false;
                }
            }
        }
    }

    return true;
}

try {
    checkConfig();
    spinner.stop();
}
catch (e) {
    printError(e);
    spinner.stop();
}
