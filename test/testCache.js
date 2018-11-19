let should = require('should'),
    assert = require('assert'),
    _ = require('underscore'),
    memoCache,
    testCache,
    lruCache;

// From stackoverflow, for LRU testing purposes
function sleep(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

let defaultOptions = {
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
        memoHashFunction: defaultOptions.memoHashFunction
    };

let cacheTests = function () {
    describe('memoCache.cache', function () {
        beforeEach(function () {
            memoCache = require('../src/memo-cache');
        });

        describe('Cache Creation', function () {
            it('should create a cache using the default options', function (done) {
                let myCache = memoCache.cache.create('myCache');
                myCache.should.have.property('set');
                myCache.should.have.property('get');
                myCache.should.have.property('exists');
                myCache.should.have.property('clear');
                myCache.should.have.property('size');
                myCache.should.have.property('options');
                (typeof myCache).should.equal('object');
                (typeof myCache.set).should.equal('function');
                (typeof myCache.get).should.equal('function');
                (typeof myCache.exists).should.equal('function');
                (typeof myCache.clear).should.equal('function');
                (typeof myCache.size).should.equal('function');
                (typeof myCache.options).should.equal('function');
                done();
            });

            it('should create a cache with the specified options', function (done) {
                let myCache = memoCache.cache.create('myCache', customOptions);
                myCache.should.have.property('set');
                myCache.should.have.property('get');
                myCache.should.have.property('exists');
                myCache.should.have.property('clear');
                myCache.should.have.property('size');
                myCache.should.have.property('options');
                (typeof myCache).should.equal('object');
                (typeof myCache.set).should.equal('function');
                (typeof myCache.get).should.equal('function');
                (typeof myCache.exists).should.equal('function');
                (typeof myCache.clear).should.equal('function');
                (typeof myCache.size).should.equal('function');
                (typeof myCache.options).should.equal('function');
                done();
            });
        });

        describe('Cache Functions', function () {
            beforeEach(function () {
                testCache = memoCache.cache.create('testCache'); // defaultOptions
                lruCache = memoCache.cache.create('lruCache', customOptions);
            });

            describe('set and get', function () {
                it('should set and get a value in the cache - via library functions', function (done) {
                    let tmp = memoCache.cache.set('testCache', 'testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = memoCache.cache.get('testCache', 'testKey');
                    tmp.should.equal('testValue');
                    done();
                });

                it('should set and get a value in the cache - via cache functions', function (done) {
                    let tmp = testCache.set('testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = testCache.get('testKey');
                    tmp.should.equal('testValue');
                    done();
                });

                it('should return null when set is not provided correct info', function (done) {
                    // Using memoCache.cache functions
                    let tmp = memoCache.cache.set('cacheThatDoesntExist', 'testKey', 'testValue');
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
                    let tmp = memoCache.cache.get('keyThatDoesntExist');
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

                it('should get the value via cache functions when set - via library functions', function (done) {
                    let tmp = memoCache.cache.set('testCache', 'testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = testCache.get('testKey');
                    tmp.should.equal('testValue');
                    done();
                });

                it('should get the value via library functions when set - via cache functions', function (done) {
                    let tmp = testCache.set('testKey', 'testValue');
                    tmp.should.equal('testValue');
                    tmp = memoCache.cache.get('testCache', 'testKey');
                    tmp.should.equal('testValue');
                    done();
                });
                
                it('getAll should get an entire cache', function (done) {
                    testCache.set('testKey', 'testValue');
                    let cache = testCache.getAll();
                    cache == {testKey: 'testValue'};
                    
                    testCache.set('testKey2', 'testValue2');
                    cache = memoCache.cache.getAll('testCache');
                    cache == {'testKey': 'testValue', 'testKey2': 'testValue2'};
                    
                    done();
                });

                it('should clone the values returned - set - via library functions', function (done) {
                    // When cloning:
                    let tmp = memoCache.cache.set('lruCache', 'testKey', {test:'value'});
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value'}));
                    tmp.badValue = 'fail'; // try modifying the cached object
                    tmp = memoCache.cache.get('lruCache', 'testKey');
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value'}));

                    // When not cloning, the cache can be modified:
                    tmp = memoCache.cache.set('testCache', 'testKey', {test:'value'});
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value'}));
                    tmp.badValue = 'fail'; // try modifying the cached object
                    tmp = memoCache.cache.get('testCache', 'testKey');
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value', badValue : 'fail'}));

                    done();
                });

                it('should clone the values returned - set - via cache functions', function (done) {
                    // When cloning:
                    let tmp = lruCache.set('testKey', {test:'value'});
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value'}));
                    tmp.badValue = 'fail'; // try modifying the cached object
                    tmp = lruCache.get('testKey');
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value'}));

                    // When not cloning, the cache can be modified:
                    tmp = testCache.set('testKey', {test:'value'});
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value'}));
                    tmp.badValue = 'fail'; // try modifying the cached object
                    tmp = testCache.get('testKey');
                    JSON.stringify(tmp).should.equal(JSON.stringify({test:'value', badValue : 'fail'}));

                    done();
                });

                it('should perform the LRU algorithm when the maxSize is exceeded - via library functions', function (done) {
                    let NUM_ITERATIONS = 100;
                    let tmp = memoCache.cache.size('lruCache');
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        memoCache.cache.set('lruCache', num.toString(), num.toString());
                    });
                    tmp = memoCache.cache.size('lruCache');
                    tmp.should.equal(customOptions.maxSize);
                    done();
                });

                it('should perform the LRU algorithm when the maxSize is exceeded - via cache functions', function (done) {
                    let NUM_ITERATIONS = 100;
                    let tmp = lruCache.size();
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        lruCache.set(num.toString(), num.toString());
                    });
                    tmp = lruCache.size();
                    tmp.should.equal(customOptions.maxSize);
                    done();
                });

                it('should perform the LRU algorithm with sleep when the maxSize is exceeded - via library functions', function (done) {
                    let NUM_ITERATIONS = 100;
                    let tmp = memoCache.cache.size('lruCache');
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        sleep(1); // sleep for 5 millisecond
                        memoCache.cache.set('lruCache', num.toString(), num.toString());
                    });
                    tmp = memoCache.cache.size('lruCache');
                    tmp.should.equal(customOptions.maxSize);
                    done();
                });

                it('should perform the LRU algorithm with sleep when the maxSize is exceeded - via cache functions', function (done) {
                    let NUM_ITERATIONS = 100;
                    let tmp = lruCache.size();
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        sleep(1); // sleep for 1 millisecond
                        lruCache.set(num.toString(), num.toString());
                    });
                    tmp = lruCache.size();
                    tmp.should.equal(customOptions.maxSize);
                    done();
                });
            });

            describe('exists', function () {
                beforeEach(function () {
                    testCache.set('testKey', 'testValue');
                });

                it('should return true if the cache has a value at the key', function (done) {
                    let tmp = testCache.exists('testKey');
                    tmp.should.equal(tmp, true);
                    done();
                });

                it('should return false if the cache has no value at the key', function (done) {
                    let tmp = testCache.exists('nonExistentKey');
                    tmp.should.equal(tmp, false);
                    done();
                });
            });

            describe('size', function () {
                it('should read a size of 0 before any cache modifications', function (done) {
                    // Test library functions
                    let tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    // Test cache functions
                    tmp = testCache.size();
                    tmp.should.equal(0);
                    done();
                });

                it('should read the correct size when items are added', function (done) {
                    // Test library functions
                    let tmp = memoCache.cache.size('testCache');
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
                    let tmp = memoCache.cache.size('testCache');
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
                    let NUM_ITERATIONS = 100;
                    let tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        memoCache.cache.set('testCache', num.toString(), num.toString());
                    });
                    tmp = memoCache.cache.size('testCache');
                    tmp.should.equal(NUM_ITERATIONS);
                    done();
                });

                it('should add 100 items and read the correct size - via cache functions', function (done) {
                    let NUM_ITERATIONS = 100;
                    let tmp = testCache.size('testCache');
                    tmp.should.equal(0);
                    _.each(_.range(NUM_ITERATIONS), function (num) {
                        testCache.set(num.toString(), num.toString());
                    });
                    tmp = testCache.size('testCache');
                    tmp.should.equal(NUM_ITERATIONS);
                    done();
                });
            });

            describe('clear', function () {
                it('should clear an empty cache and have a size of 0', function (done) {
                    // Test library functions
                    let tmp = memoCache.cache.size('testCache');
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
                    let tmp = memoCache.cache.size('testCache');
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
                    let tmp = memoCache.cache.options('testCache');
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    tmp = testCache.options();
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    done();
                });

                it('should allow options to be modified by reference - via library functions', function (done) {
                    let tmp = memoCache.cache.options('testCache');
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    tmp.cloneValues = true;
                    tmp.maxSize = 5;
                    tmp = memoCache.cache.options('testCache');
                    JSON.stringify(tmp).should.equal(JSON.stringify(customOptions));
                    done();
                });

                it('should allow options to be modified by reference - via cache functions', function (done) {
                    let tmp = testCache.options();
                    JSON.stringify(tmp).should.equal(JSON.stringify(defaultOptions));
                    tmp.cloneValues = true;
                    tmp.maxSize = 5;
                    tmp = testCache.options();
                    JSON.stringify(tmp).should.equal(JSON.stringify(customOptions));
                    done();
                });

                it('should return null if the cache does not exist', function (done) {
                    let tmp = memoCache.cache.options('cacheThatDoesntExist');
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