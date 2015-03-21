'use strict';

var _ = require('underscore'); // Require underscore

/** PROTOTYPES **/
// http://stackoverflow.com/questions/1833588/javascript-clone-a-function
Function.prototype.clone = function() {
    var currentFn = this;
    var cloneFn = function temporary() { return currentFn.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            cloneFn[key] = this[key];
        }
    }
    return cloneFn;
};

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

var memoizedFunctionCounter = 0;

/**
 * Default options for both the cache and memoization functionality
 * @type {Object}
 */
var defaultOptions = {
    cloneValues : false,
    maxSize : null,
    memoHashFunction: function (args) {
        return args.length ? args[0].toString() : '__noArgs';
    }
};

var controller = {

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

        exists : function (cacheName, key) {
            return cacheOps.exists(cacheName, key);
        },

        clear  : function (cacheName) {
            return cacheOps.clear(cacheName);
        },

        size   : function (cacheName) {
            return cacheOps.size(cacheName);
        },

        options: function (cacheName) {
            return cacheOps.options(cacheName);
        }
    },

    /**
     * Client accessible memoization function
     * @param fn {Function} the function to be cached
     * @param options {Object} the options that you want to use for caching
     * @returns {Function} memoized version of the function
     */
    memoize  : function (fn, options) {
        options = _.defaults(options || {}, defaultOptions);
        var functionCacheName = '__function' + memoizedFunctionCounter++;

        var memoizedFn = function (hashValue) {
            var fnCache = controller.cache.create(functionCacheName, options);
            hashValue = arguments.length > 1 ? options.memoHashFunction.apply(this, arguments) : hashValue;
            if (!fnCache.exists(hashValue)) {
                fnCache.set(hashValue, fn.apply(this, arguments));
            }
            return options.clone ? clone(fnCache.get(hashValue)) : fnCache.get(hashValue);
        };

        memoizedFn.clear = _.partial(controller.cache.clear, functionCacheName);
        memoizedFn.size  = _.partial(controller.cache.size,  functionCacheName);

        return memoizedFn;
    }

};

/** Internal Cache Operators **/
var cacheOps = {
    create : function (cacheName, options) {
        if (cacheName) {
            caches[cacheName] = {
                options : options,
                accesses: [],
                cache   : {}
            };
            return { // Return a 'reference' to this cache so that operations can be performed without specifying the cache name every time
                set    : _.partial(controller.cache.set, cacheName),
                get    : _.partial(controller.cache.get, cacheName),
                exists : _.partial(controller.cache.exists, cacheName),
                clear  : _.partial(controller.cache.clear, cacheName),
                size   : _.partial(controller.cache.size, cacheName),
                options: _.partial(controller.cache.options, cacheName)
            };
        }
        throw new Error('Must provide a cache name in order to create a cache');
    },

    set : function (cacheName, key, value) {
        if (cacheName && caches[cacheName] && caches[cacheName].cache && key) {
            //cacheOps.options(cacheName).maxSize
            caches[cacheName].cache[key] = caches[cacheName].options.cloneValues ? clone(value) : value;
            return caches[cacheName].cache[key];
        }
        return null;
    },

    get : function (cacheName, key) {
        if (cacheName && caches[cacheName] && caches[cacheName].cache && caches[cacheName].cache[key] && key) {
            var value = caches[cacheName].cache[key];
            return caches[cacheName].options.cloneValues ? clone(value) : value;
        }
        return null;
    },

    exists : function (cacheName, key) {
        if (cacheName && caches[cacheName] && caches[cacheName].cache) {
            return caches[cacheName].cache[key] !== undefined;
        }
        return false;
    },

    clear : function (cacheName) {
        if (cacheName && caches[cacheName]) {
            caches[cacheName].cache = {};
            return true;
        }
        return null;
    },

    size : function (cacheName) {
        if (!cacheName) {
            return _.reduce(_.keys(caches),
                function (accumulator, cacheName) {
                    return accumulator + _.keys(caches[cacheName].cache).length
                }, 0);
        } else {
            return caches[cacheName] ? _.keys(caches[cacheName].cache).length : null;
        }
    },

    options : function (cacheName) {
        if (cacheName && caches[cacheName]) {
            return caches[cacheName].options;
        }
        return null;
    }
}

/**
 * Generates a deep copy of the value that is passed in
 * Only called if the options provided specify that a cloning is enabled
 * @param value
 * @returns {*} a new deep copy of the value that was passed in
 */
var clone = function (value) {
    if (_.isFunction(value)) {
        return value.clone();
    } else if (_.isDate(value)) {
        return new Date(value.getTime());
    } else if (_.isRegExp(value)) {
        return new RegExp(value.valueOf());
    } else if (_.isArray(value) || _.isObject(value)) {
        return JSON.parse(JSON.stringify(value));
    } else { // Number, Boolean, String
        // No need to clone - returned by value, not reference
        return value;
    }
};

module.exports = controller;