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
                optsCache = memoCache.cache.create('optsCache', customOptions);
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

            describe('size', function () {
                it('should read a size of 0 before any cache modifications', function (done) {
                    // Test library functions
                    var tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    // Test cache functions
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    done();
                });

                it('should read the correct size when items are added', function (done) {
                    // Test library functions
                    var tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    memoCache.cache.set('testCache', 'testKey', 'testValue');
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(1);
                    // Test cache functions
                    tmp = testCache.size();
                    tmp.should.equal(1);
                    testCache.set('testKey2', 'testValue2');
                    tmp = testCache.size();
                    tmp.should.equal(2);
                    done();
                });

                it('should read the correct size after the cache is cleared', function (done) {
                    // Test library functions
                    var tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    memoCache.cache.set('testCache', 'testKey', 'testValue');
                    memoCache.cache.set('testCache', 'testKey2', 'testValue2');
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(2);
                    memoCache.cache.clear('testCache');
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    // Test cache functions
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    testCache.set('testKey', 'testValue');
                    testCache.set('testKey2', 'testValue2');
                    tmp = testCache.size();
                    tmp.should.equal(2);
                    testCache.clear();
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    done();
                });

                it('should add 100 items and read the correct size - via library functions', function (done) {
                    var NUM_ITERATIONS = 100;
                    var tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        memoCache.cache.set('testCache', num.toString(), num.toString());
                    });
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(NUM_ITERATIONS);
                    done();
                });

                it('should add 100 items and read the correct size - via cache functions', function (done) {
                    var NUM_ITERATIONS = 100;
                    var tmp = testCache.size('testCache');
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        testCache.set(num.toString(), num.toString());
                    });
                    tmp = testCache.size('testCache');
                    tmp.should.equal(NUM_ITERATIONS);
                    done();
                })
            });

            describe('clear', function () {
                it('should clear an empty cache and have a size of 0', function (done) {
                    // Test library functions
                    var tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    memoCache.cache.clear('testCache');
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    // Test cache functions
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    testCache.clear();
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    done();
                });

                it('should clear a non-empty cache and have a size of 0', function (done) {
                    // Test library functions
                    var tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    memoCache.cache.set('testCache', 'testKey', 'testValue');
                    memoCache.cache.set('testCache', 'testKey2', 'testValue2');
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(2);
                    memoCache.cache.clear('testCache');
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    tmp = memoCache.cache.get('testCache', 'testKey');
                    assert.equal(tmp, null);
                    tmp = memoCache.cache.get('testCache', 'testKey2');
                    assert.equal(tmp, null);
                    // Test cache functions
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    testCache.set('testKey', 'testValue');
                    testCache.set('testKey2', 'testValue2');
                    tmp = testCache.size();
                    tmp.should.equal(2);
                    testCache.clear();
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    tmp = testCache.get('testKey');
                    assert.equal(tmp, null);
                    tmp = testCache.get('testKey2');
                    assert.equal(tmp, null);
                    done();
                });
            });

            describe('options', function () {
                it('should retrieve the options from a cache that does exist', function (done) {
                    var tmp = memoCache.cache.options('testCache');
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    tmp = testCache.options();
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    done();
                });

                it('should allow options to be modified by reference - via library functions', function (done) {
                    var tmp = memoCache.cache.options('testCache');
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    tmp.cloneValues = true;
                    tmp.maxSize = 5;
                    tmp = memoCache.cache.options('testCache');
                    JSON.stringify(tmp).should.equal(JSON.stringify(customOptions));
                    done();
                });

                it('should allow options to be modified by reference - via cache functions', function (done) {
                    var tmp = testCache.options();
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    tmp.cloneValues = true;
                    tmp.maxSize = 5;
                    tmp = testCache.options();
                    JSON.stringify(tmp).should.equal(JSON.stringify(customOptions));
                    done();
                });

                it('should return null if the cache does not exist', function (done) {
                    var tmp = memoCache.cache.options('cacheThatDoesntExist');
                    assert.equal(tmp, null);
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