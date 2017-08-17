/**
 * @file Strategies export
 * @author tracy (qiushidev@gmail.com)
 */

'use strict';

import cacheFirst from './cacheFirst';
import cacheOnly from './cacheOnly';
import fastest from './fastest';
import networkFirst from './networkFirst';
import networkOnly from './networkOnly';

export default {
    cacheFirst,
    cacheOnly,
    fastest,
    networkFirst,
    networkOnly
};
