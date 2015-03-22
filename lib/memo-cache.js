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

/**
 * Counter which keeps track of the number of functions that are being memoized
 * This allows us to utilize the built-in caching functionality and just generate a
 *   cache specific to this function, while not having any name information about it
 */
var memoizedFunctionCounter = 0;

/**
 * Default options for both the cache and memoization functionality
 * @type {Object}
 */
var defaultOptions = {
    cloneValues : false, // Should values be cloned before storing and before returning them to the caller
    maxSize : null, // The maximum number of keys that should be kept in the cache
    /**
     * Function which maps the input arguments for memoization to a unique string for storing the result in the cache
     * @param args Array argument array
     * @returns {string} key to be used to store the result in the function cache
     */
    memoHashFunction: function (arg1) {
        if (arg1 === null) {
            return 'null';
        } else if (arg1 !== undefined) {
            return arg1.toString();
        }
        return '__noArgs';
    }
};

/**
 * Client Accessible Functions
 * @type {{cache: Object, memoize: Function}}
 */
var controller = {
    /**
     * Client accessible caching functions
     * These are all synchronous as it is important to ensure that the cache is updated in real-time
     */
    cache : {
        // Create a new cache with the given cache name and options (or defaults)
        create : function (cacheName, options) {
            return cacheOps.create(cacheName, _.defaults(options || {}, defaultOptions));
        },

        // Set the given key to the given value in the cache with the given cacheName
        set    : function (cacheName, key, value) {
            return cacheOps.set(cacheName, key, value);
        },

        // Get the given key's value in the cache with the given cacheName
        get    : function (cacheName, key) {
            return cacheOps.get(cacheName, key);
        },

        // Is there an entry in the cache with the given cacheName for the given key?
        exists : function (cacheName, key) {
            return cacheOps.exists(cacheName, key);
        },

        // Clear the entries in the cache with the given cacheName, but leave the options the same
        clear  : function (cacheName) {
            return cacheOps.clear(cacheName);
        },

        // Retrieve the size of the cache with the given cacheName
        // If no cacheName is provided, then the size of all caches
        //   (including memoized function caches) is returned
        size   : function (cacheName) {
            return cacheOps.size(cacheName);
        },

        // Retrieve the options for the cache with the given cacheName
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
        // Generate the options by merging in the default options
        options = _.defaults(options || {}, defaultOptions);
        // Generate the function's cache name of the form: __function0
        var functionCacheName = '__function' + memoizedFunctionCounter++,
        // Create the cache for this function
            cache = controller.cache.create(functionCacheName, options);

        // Memoized function to be returned to the client
        var memoizedFn = function (hashValue) {
            // Retrieve a reference to the created cache that the client can access
            var fnCache = cache;
            // Generate the hashValue, or key to store the function result at
            hashValue = options.memoHashFunction.apply(this, arguments);
            // If the cache does not already have the stored result, compute it and store it
            if (!fnCache.exists(hashValue)) {
                // Compute the result
                var result = fn.apply(this, arguments);
                // Store the result, or a clone if specified
                fnCache.set(hashValue, options.clone ? clone(result) : result);
            }
            // Return the value, or a clone if specified
            return options.clone ? clone(fnCache.get(hashValue)) : fnCache.get(hashValue);
        };

        // Allow users to clear the function cache
        memoizedFn.clear  = _.partial(controller.cache.clear, functionCacheName);
        // Allow users to get the size of the function cache
        memoizedFn.size   = _.partial(controller.cache.size,  functionCacheName);

        // Return the function, along with the clear and size functions
        return memoizedFn;
    }
};

/** Internal Cache Operators **/
var cacheOps = {
    /**
     * Create the cache with the given cacheName
     * Returns an object with functions that will perform operations directly on the cache with the given cacheName
     * @param cacheName String name of the cache
     * @param options Object options for this cache
     * @returns {{set: Function, get: Function, exists: Function, clear: Function, size: Function, options: Function}}
     */
    create : function (cacheName, options) {
        if (cacheName) {
            // Initialize the cache
            caches[cacheName] = {
                options : options,
                cache   : {}
            };
            // Return a 'reference' to this cache so that operations can be performed without specifying the cache name every time
            return {
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

    /**
     * Set the value in the cache with the given cacheName
     * @param cacheName String name of the cache
     * @param key String key to be used to store the value
     * @param value {*} value to be stored in the cache
     * @returns {*} if the item is stored: returns the value, otherwise null
     */
    set : function (cacheName, key, value) {
        if (cacheName && caches[cacheName] && caches[cacheName].cache && key && value) {
            performLeastRecentlyUsed(cacheName);
            caches[cacheName].cache[key] = {
                lastAccess : new Date().getTime(),  // Set the last access time
                value      : caches[cacheName].options.cloneValues ? clone(value) : value
            };
            return caches[cacheName].options.cloneValues ? clone(value) : value;
        }
        return null;
    },

    /**
     * Retrieve the value in the cache with the given cacheName
     * @param cacheName String name of the cache
     * @param key String key at which the value is stored at
     * @returns {*} if there is an item at the given key: returns the value, otherwise null
     */
    get : function (cacheName, key) {
        if (cacheName && key && caches[cacheName] && caches[cacheName].cache && caches[cacheName].cache[key]) {
            caches[cacheName].cache[key].lastAccess = new Date().getTime(); // Update the last access time
            var value = caches[cacheName].cache[key].value; // Retrieve the value
            return caches[cacheName].options.cloneValues ? clone(value) : value;
        }
        return null;
    },

    /**
     * Removes the entry for the given key in the cache with the given cacheName
     * @param cacheName String name of the cache
     * @param key String key at which the value is stored at
     * @returns {*} if there is an item at the given key: returns the value, otherwise null
     */
    remove : function (cacheName, key) {
        if (cacheName && key && caches[cacheName] && caches[cacheName].cache && caches[cacheName].cache[key]) {
            var value = caches[cacheName].cache[key].value;
            delete caches[cacheName].cache[key];
            return value;
        }
        return null;
    },

    /**
     * Does a value exist at the given key in the cache with the given cacheName
     * @param cacheName String name of the cache
     * @param key String key which is being tested
     * @returns {boolean} if there is an entry at the given key: true, otherwise false
     */
    exists : function (cacheName, key) {
        if (cacheName && caches[cacheName] && caches[cacheName].cache) {
            return caches[cacheName].cache[key] !== undefined;
        }
        return false;
    },

    /**
     * Clear the cache with the given cacheName
     * @param cacheName String name of the cache
     * @returns {boolean} if the cache is cleared: returns true, otherwise false
     */
    clear : function (cacheName) {
        if (cacheName && caches[cacheName]) {
            caches[cacheName].cache = {};
            return true;
        }
        return false;
    },

    /**
     * Retrieve the size of the cache with the given cacheName
     * If no cacheName is provided, this returns the sum of the sizes of all caches
     * @param cacheName String name of the cache (optional)
     * @returns {Number} the number of entries in the cache
     */
    size : function (cacheName) {
        if (!cacheName) {
            return _.reduce(_.keys(caches),
                function (accumulator, cacheName) {
                    return accumulator + _.keys(caches[cacheName].cache).length
                }, 0);
        } else {
            return caches[cacheName] && caches[cacheName].cache ? _.keys(caches[cacheName].cache).length : 0;
        }
    },

    /**
     * Retrieves the options stored for the cache with the given cacheName
     * @param cacheName String name of the cache
     * @returns {Object|null} if the cache exists: returns the options, otherwise null
     */
    options : function (cacheName) {
        if (cacheName && caches[cacheName]) {
            return caches[cacheName].options;
        }
        return null;
    }
};

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

/**
 * Performs a LRU algorithm on the cache with the given cacheName
 * @param cacheName String name of the cache
 * @returns {boolean} was the algorithm performed
 */
var performLeastRecentlyUsed = function (cacheName) {
    // Retrieves the maxSize option from the options
    var maxSize = cacheOps.options(cacheName).maxSize,
    // Retrieves the current size of the cache with the given cacheName
        size = cacheOps.size(cacheName),
    // Variables to identify the least recently used entry in the cache
        leastRecentlyUsed = {
            key : '',
            lastAccess : new Date().getTime()
        };
    // Do we need to perform the LRU algorithm?
    if (cacheName && caches[cacheName] && caches[cacheName].cache && !_.isNull(maxSize) && size >= maxSize) {
        // Find least recently used item (key and access time)
        _.each(_.keys(caches[cacheName].cache), function (cacheEntryKey) {
            // Retrieve the value for the given cacheEntryKey
            var cacheEntryValue = caches[cacheName].cache[cacheEntryKey];
            // If this entry was used less recently than the current entry
            if (cacheEntryValue.lastAccess <= leastRecentlyUsed.lastAccess) {
                // Set this entry as the least recently used item
                leastRecentlyUsed.key = cacheEntryKey;
                leastRecentlyUsed.lastAccess = cacheEntryValue.lastAccess;
            }
        });

        // Remove the least recently used key from the cache
        cacheOps.remove(cacheName, leastRecentlyUsed.key);
        return true;
    }
    return false;
};

// Export the client accessible functions for this module
module.exports = controller;