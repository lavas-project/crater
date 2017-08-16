/**
 * @file 公用 utils
 * @author tracy (qiushidev@gmail.com)
 */
import defaults from './defaults';

/**
 * 打印debug信息，非debug环境不打印
 *
 * @param {string} msg debug信息
 */
export function debug(msg) {
    let isDebug = defaults.getOptions().debug;

    if (isDebug) {
        console.log('[SW DEBUG INFO]:');
        console.log(msg);
    }
}
