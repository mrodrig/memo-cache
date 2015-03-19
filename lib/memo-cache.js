'use strict';

var _ = require('underscore'); // Require underscore

/**
 * Where data and settings are stored.
 * Each entry in this Object is of the following format:
 *  {
 *      options : Object, // This is where client settings for this cache are stored
 *      cache   : Object  // This is where client data is stored
 *  }
 * @type {Object}
 */
var caches = {};

/**
 * Default options for both the cache and memoization functionality
 * @type {Object}
 */
var defaultOptions = {
    cloneValues : false
};

// Export the following functions that will be client accessible
module.exports = {

    /**
     * Client accessible caching functions
     * These are all synchronous as it is important to ensure that the cache is updated in real-time
     */
    cache : {
        create : function (cacheName, options) {
            return cacheOps.create(cacheName, _.defaults(options || {}, defaultOptions));
        },

        set    : function (cacheName, key, value) {
            return cacheOps.set(cacheName, key, value);
        },

        get    : function (cacheName, key) {
            return cacheOps.get(cacheName, key);
        },

        clear  : function (cacheName) {
            return cacheOps.clear(cacheName);
        },

        size   : function (cacheName) {
            return cacheOps.size(cacheName);
        }
    },

    memoize  : function (fn, options) {
        throw new Error('Not Yet Implemented');
    }

};

var cacheOps = {
    create : function (cacheName, options) {
        if (cacheName) {
            caches[cacheName] = {
                options : options,
                cache   : {}
            }
            return true;
        }
        return false;
    },

    set : function (cacheName, key, value) {
        // TODO: do we need to clone the value before caching it?
        if (caches[cacheName] && caches[cacheName].cache && key) {
            caches[cacheName].cache[key] = value;
            return value;
        }
        return null;
    },

    get : function (cacheName, key) {
        // TODO: do we need to clone the value before caching it?
        if (caches[cacheName] && caches[cacheName].cache && caches[cacheName].cache[key] && key) {
            var value = caches[cacheName].cache[key];
            return caches[cacheName].options.cloneValues ? clone(value) : value;
        }
        return null;
    },

    clear : function (cacheName) {
        if (caches[cacheName]) {
            caches[cacheName].cache = {};
            return true;
        }
        return null;
    },

    size : function (cacheName){
        if (!cacheName) {
            return _.reduce(_.keys(caches),
                function (accumulator, cacheObject) {
                    return accumulator + _.keys(cacheObject.cache).length
                }, 0);
        } else {
            return caches[cacheName] ? _.keys(caches[cacheName].cache).length : null;
        }
    }
}

var clone = function (value){
    return value;
};