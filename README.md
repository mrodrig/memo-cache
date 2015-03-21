# Node Memoization/Caching Library

[![Build Status](https://travis-ci.org/mrodrig/memo-cache.svg?branch=master)](https://travis-ci.org/mrodrig/memo-cache)
![David - Dependency Checker Icon](https://david-dm.org/mrodrig/memo-cache.png)
[![Monthly Downloads](http://img.shields.io/npm/dm/memo-cache.svg)](https://www.npmjs.org/package/memo-cache)
[![NPM version](https://img.shields.io/npm/v/memo-cache.svg)](https://www.npmjs.org/package/memo-cache)

A memoization and caching library for NodeJS.

## Installation

```bash
$ npm install memo-cache
```

## Usage

```javascript
var memoCache = require('memo-cache');
```

### API

####Caching:
#####memoCache.cache.createCache(cacheName, options)
* ```cacheName``` String - name of the cache
* ```options``` Object - options for the cache, specifying any of the following:
 * ```cloneValues``` Boolean - should returned values be clones of the original? [Default: false]
 * ```maxSize``` Integer - maximum number of keys to store in this cache; if null, then unlimited [Default: null]

Return Value: An object with the following functions to modify the created cache.  Please note that these functions do not require the cacheName.
* set     : function (key, value)
* get     : function (key)
* exists  : function (key)
* clear   : function ()
* size    : function ()
* options : function ()

```javascript
var myCache = memoCache.cache.create('myCache');
console.log(myCache);
// Output:
// { set: [Function],     -- function(key, value)
//  get: [Function],      -- function(key)
//  exists: [Function],   -- function(key)
//  clear: [Function],    -- function()
//  size: [Function],     -- function()
//  options: [Function] } -- function()
```

#####memoCache.cache.set(cacheName, key, value)
* ```cacheName``` String - name of the cache
* ```key``` String - key to be used to store the value
* ```value``` _Any_ - value to be stored in the cache

Return Value: If the item is stored, then the stored value is returned, otherwise ```null``` is returned.

```javascript
memoCache.cache.set('myCache', 'isExample', true);
// OR (if using the myCache variable from above):
myCache.set('isExample', true);
```

#####memoCache.cache.get(cacheName, key)
* ```cacheName``` String - name of the cache
* ```key``` String - key to be used to retrieve the value

Return Value: If there is an item stored at the given key, then the stored value is returned, otherwise ```null``` is returned.

```javascript
memoCache.cache.get('myCache', 'isExample'); // => true
memoCache.cache.get('myCache', 'isNotExample'); // => null
// OR (if using the myCache variable from above):
myCache.get('isExample'); // => true
myCache.get('isNotExample'); // => null
```

#####memoCache.cache.remove(cacheName, key)
* ```cacheName``` String - name of the cache
* ```key``` String - key to be deleted

Return Value: If there is an item stored at the given key, then the stored value is returned, otherwise ```null``` is returned.

```javascript
memoCache.cache.remove('myCache', 'isExample'); // => true
memoCache.cache.remove('myCache', 'isNotExample'); // => null
// OR (if using the myCache variable from above):
myCache.remove('isExample'); // => true
myCache.remove('isNotExample'); // => null
```

#####memoCache.cache.exists(cacheName, key)
* ```cacheName``` String - name of the cache
* ```key``` String - key to be checked

Return Value: If there is an item stored at the given key, then ```true``` is returned, otherwise ```false``` is returned.

```javascript
memoCache.cache.exists('myCache', 'isExample'); // => true
memoCache.cache.exists('myCache', 'isNotExample'); // => false
// OR (if using the myCache variable from above):
myCache.exists('isExample'); // => true
myCache.exists('isNotExample'); // => false
```

#####memoCache.cache.clear(cacheName)
* ```cacheName``` String - name of the cache

Return Value: If the cache is cleared, then ```true``` is returned, otherwise ```false``` is returned.

```javascript
memoCache.cache.clear('myCache'); // => true
// OR (if using the myCache variable from above):
myCache.clear(); // => true
```

#####memoCache.cache.size(cacheName)
* ```cacheName``` String - (optional) name of the cache; If not specified, the size of all caches is returned

Return Value: The size of the cache(s).

```javascript
memoCache.cache.size('myCache'); // => 1
memoCache.cache.size(); // => 1 
// OR (if using the myCache variable from above):
myCache.size(); // => 1
```

#####memoCache.cache.options(cacheName)
* ```cacheName``` String - name of the cache

Return Value: If the cache exists, then the options object is returned, otherwise ```null``` is returned.

```javascript
memoCache.cache.options('myCache'); // => { cloneValues: boolean, maxSize: Number, memoHashFunction: Function }
// OR (if using the myCache variable from above):
myCache.options(); // => { cloneValues: boolean, maxSize: Number, memoHashFunction: Function }
```

####Memoization:
#####memoCache.memoize(function, options)
* ```cacheName``` String - name of the cache
* ```options``` Object - options for the cache, specifying any of the following:
 * ```cloneValues``` Boolean - should returned values be clones of the original? [Default: false]
 * ```maxSize``` Integer - maximum number of keys to store in this cache; if null, then unlimited [Default: null]
 * ```memoHashFunction``` Function - used to map the input arguments to a String. The result of this function becomes the key for the function result value

```javascript
require memoCache = require('memo-cache');
var myFunction = function (aString) { console.log('cache miss!'); return aString; };

var myFunctionMemoized = memoCache.memoize(myFunction, {maxSize: 10});
myFunctionMemoized('testing'); // => 'testing' (Prints 'cache miss!' to the console)
myFunctionMemoized('testing'); // => 'testing' (Does not print 'cache miss!')
```

## Tests

*No tests are currently implemented while this module is in development*

```bash
$ npm test
```

_Note_: This requires `mocha`, `should`, `async`, and `underscore`.

## Features

- Cache Functionality via memoCache.cache
- Can create multiple caches (allowing 'namespaces')
- Memoization Functionality via memoCache.memoize()
- Least Recently Used implementation when options.maxSize specified
- Caching and Memoization included in one module (usually separate)