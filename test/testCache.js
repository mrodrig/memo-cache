var should = require('should'),
    assert = require('assert'),
    _ = require('underscore'),
    memoCache,
    testCache,
    optsCache;

var defaultOptions = {
        cloneValues : false, // Should values be cloned before storing and before returning them to the caller
        maxSize : null, // The maximum number of keys that should be kept in the cache
        /**
         * Function which maps the input arguments for memoization to a unique string for storing the result in the cache
         * @param args Array argument array
         * @returns {string} key to be used to store the result in the function cache
         */
        memoHashFunction: function (args) {
            return args.length ? args[0].toString() : '__noArgs';
        }
    },
    customOptions = {
        cloneValues : true, // Should values be cloned before storing and before returning them to the caller
        maxSize : 5, // The maximum number of keys that should be kept in the cache
        /**
         * Function which maps the input arguments for memoization to a unique string for storing the result in the cache
         * @param args Array argument array
         * @returns {string} key to be used to store the result in the function cache
         */
        memoHashFunction: function (args) {
            return args.length ? args[0].toString() : '__noArgs';
        }
    };

var cacheTests = function () {
    describe('memoCache.cache', function () {
        beforeEach(function () {
            memoCache = require('.././lib/memo-cache');
        });

        describe('Cache Creation', function () {
            it('should create a cache using the default options', function (done) {
                var myCache = memoCache.cache.create('myCache');
                (typeof myCache).should.equal('object');
                (typeof myCache.set).should.equal('function');
                (typeof myCache.get).should.equal('function');
                (typeof myCache.exists).should.equal('function');
                (typeof myCache.clear).should.equal('function');
                (typeof myCache.size).should.equal('function');
                (typeof myCache.options).should.equal('function');
                var options = memoCache.cache.options('myCache');
                JSON.stringify(options).should.equal(JSON.stringify(defaultOptions));
                (typeof options.memoHashFunction).should.equal('function');
                done();
            });

            it('should create a cache with the specified options', function (done) {
                var myCache = memoCache.cache.create('myCache', customOptions);
                (typeof myCache).should.equal('object');
                (typeof myCache.set).should.equal('function');
                (typeof myCache.get).should.equal('function');
                (typeof myCache.exists).should.equal('function');
                (typeof myCache.clear).should.equal('function');
                (typeof myCache.size).should.equal('function');
                (typeof myCache.options).should.equal('function');
                var options = memoCache.cache.options('myCache');
                JSON.stringify(options).should.equal(JSON.stringify(customOptions));
                (typeof options.memoHashFunction).should.equal('function');
                done();
            });
        });

        describe('Cache Functions', function () {
            beforeEach(function () {
                testCache = memoCache.cache.create('testCache');
                optsCache = memoCache.cache.create('testCache', customOptions);
            });

            describe('set and get', function () {
                it('should set and get a value in the cache - using memoCache.cache', function (done) {
                    var tmp = memoCache.cache.set('testCache', 'testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = memoCache.cache.get('testCache', 'testKey');
                    tmp.should.equal('testValue');
                    done();
                });

                it('should set and get a value in the cache - using returned cache functions', function (done) {
                    var tmp = testCache.set('testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = testCache.get('testKey');
                    tmp.should.equal('testValue');
                    done();
                });

                it('should return null when set is not provided correct info', function (done) {
                    // Using memoCache.cache functions
                    var tmp = memoCache.cache.set('cacheThatDoesntExist', 'testKey', 'testValue');
                    assert.equal(tmp, null);
                    tmp = memoCache.cache.set('testCache', 'testKey'); // No value
                    assert.equal(tmp, null);
                    tmp = memoCache.cache.set('testCache'); // No key or value
                    assert.equal(tmp, null);
                    tmp = memoCache.cache.set(); // No key or value
                    assert.equal(tmp, null);
                    // Using returned cache functions
                    tmp = testCache.set('testKey3');
                    assert.equal(tmp, null);
                    tmp = testCache.set();
                    assert.equal(tmp, null);
                    done();
                });

                it('should return null when get is called without correct info', function (done) {
                    // Using memoCache.cache functions
                    var tmp = memoCache.cache.get('keyThatDoesntExist');
                    assert.equal(tmp, null);
                    tmp = memoCache.cache.get();
                    assert.equal(tmp, null);
                    // Using returned cache functions
                    tmp = testCache.get('keyThatDoesntExist');
                    assert.equal(tmp, null);
                    tmp = testCache.get();
                    assert.equal(tmp, null);
                    done();
                });

                it('should get the value via cache functions when set via library functions', function (done) {
                    var tmp = memoCache.cache.set('testCache', 'testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = testCache.get('testKey');
                    tmp.should.equal('testValue');
                    done();
                });

                it('should get the value via library functions when set via cache functions', function (done) {
                    var tmp = testCache.set('testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = memoCache.cache.get('testCache', 'testKey');
                    tmp.should.equal('testValue');
                    done();
                });
            });

            describe('exists', function () {
                beforeEach(function () {
                    testCache.set('testKey', 'testValue');
                });

                it('should return true if the cache has a value at the key', function (done) {
                    var tmp = testCache.exists('testKey');
                    tmp.should.equal(tmp, true);
                    done();
                });

                it('should return false if the cache has no value at the key', function (done) {
                    var tmp = testCache.exists('nonExistentKey');
                    tmp.should.equal(tmp, false);
                    done();
                });
            });
        });
    });
};

module.exports = {
    runTests: function () {
        describe('Caching Functionality', function() {
            // Cache Tests
            cacheTests();
        });
    }
};