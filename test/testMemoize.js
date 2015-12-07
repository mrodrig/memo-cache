var should = require('should'),
    assert = require('assert'),
    _ = require('underscore'),
    memoCache,
    testFunctionSingleParam,
    testFunctionObjectParam,
    testFunctionSingleParamDefaultMemoized,
    testFunctionObjectParamDefaultMemoized,
    testFunctionSingleParamCustomMemoized,
    testFunctionObjectParamCustomMemoized,
    cacheMissCounter;

// From stackoverflow, for LRU testing purposes
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

var hashFunction = function (prop, arg1) {
            if (_.isNull(arg1)) {
                return 'null';
            } else if (arg1 !== undefined) {
                arg1 = prop ? arg1[prop] : arg1;
                return arg1.toString();
            }
            return '__noArgs';
        },
        customSingleOptions = {
        cloneValues : true, // Should values be cloned before storing and before returning them to the caller
        maxSize : 5, // The maximum number of keys that should be kept in the cache
        /**
         * Function which maps the input arguments for memoization to a unique string for storing the result in the cache
         * @param args Array argument array
         * @returns {string} key to be used to store the result in the function cache
         */
        memoHashFunction: _.partial(hashFunction, null)
    },
    customObjectOptions = {
        cloneValues : true, // Should values be cloned before storing and before returning them to the caller
        maxSize : 5, // The maximum number of keys that should be kept in the cache
        /**
         * Function which maps the input arguments for memoization to a unique string for storing the result in the cache
         * @param args Array argument array
         * @returns {string} key to be used to store the result in the function cache
         */
        memoHashFunction: _.partial(hashFunction, 'val')
    };

var memoizeTests = function () {
    describe('memoCache.memoize', function () {
        beforeEach(function () {
            memoCache = require('.././lib/memo-cache');

            cacheMissCounter = 0;
            testFunctionSingleParam = function (param1) {
                cacheMissCounter++;
                return param1;
            };

            testFunctionObjectParam = function (param) {
                cacheMissCounter++;
                return param;
            };

            // Cache Key: __function0
            testFunctionSingleParamDefaultMemoized = memoCache.memoize(testFunctionSingleParam); // defaultOptions
            // Cache Key: __function1
            testFunctionSingleParamCustomMemoized = memoCache.memoize(testFunctionSingleParam, customSingleOptions);
            // Cache Key: __function2
            testFunctionObjectParamDefaultMemoized = memoCache.memoize(testFunctionObjectParam); // defaultOptions
            // Cache Key: __function3
            testFunctionObjectParamCustomMemoized = memoCache.memoize(testFunctionObjectParam, customObjectOptions);

        });

        describe('Single Param - Default Options', function () {
            it('should have an empty cache initially', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(0);
                done();
            });

            it('should populate the cache when the function is called', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionSingleParamDefaultMemoized('test');
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(1);
                done();
            });

            it('should not call the function when the result is already memoized', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionSingleParamDefaultMemoized('test');
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(1);
                testFunctionSingleParamDefaultMemoized('test');
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should clear the function cache when already empty', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(0);
                testFunctionSingleParamDefaultMemoized.clear();
                tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(0);
                done();
            });

            it('should clear the function cache when not empty', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionSingleParamDefaultMemoized('test');
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(1);
                testFunctionSingleParamDefaultMemoized.clear();
                tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should not be limited by a max size, tests with 100 calls without sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    var tmp = cacheMissCounter;
                    testFunctionSingleParamDefaultMemoized(num.toString());
                    cacheMissCounter.should.equal(tmp+1);
                });
                cacheMissCounter.should.equal(NUM_ITERATIONS);
                var tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(NUM_ITERATIONS);
                done();
            });

            it('should not be limited by a max size, tests with 100 calls with sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    var tmp = cacheMissCounter;
                    sleep(1); // sleep 1 millisecond
                    testFunctionSingleParamDefaultMemoized(num.toString());
                    cacheMissCounter.should.equal(tmp+1);
                });
                cacheMissCounter.should.equal(NUM_ITERATIONS);
                var tmp = testFunctionSingleParamDefaultMemoized.size();
                tmp.should.equal(NUM_ITERATIONS);
                done();
            });
        });

        describe('Single Param - Custom Options', function () {
            it('should have an empty cache initially', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(0);
                done();
            });

            it('should populate the cache when the function is called', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionSingleParamCustomMemoized('test');
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(1);
                done();
            });

            it('should not call the function when the result is already memoized', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionSingleParamCustomMemoized('test');
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(1);
                testFunctionSingleParamCustomMemoized('test');
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should clear the function cache when already empty', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(0);
                testFunctionSingleParamCustomMemoized.clear();
                tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(0);
                done();
            });

            it('should clear the function cache when not empty', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionSingleParamCustomMemoized('test');
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(1);
                testFunctionSingleParamCustomMemoized.clear();
                tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should be limited by the specified max size, tests with 100 calls without sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    var tmp = cacheMissCounter;
                    testFunctionSingleParamCustomMemoized(num.toString());
                    cacheMissCounter.should.equal(tmp+1);
                });
                cacheMissCounter.should.equal(NUM_ITERATIONS);
                var tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(customSingleOptions.maxSize);
                done();
            });

            it('should not be limited by a max size, tests with 100 calls with sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    var tmp = cacheMissCounter;
                    sleep(1); // sleep 1 millisecond
                    testFunctionSingleParamCustomMemoized(num.toString());
                    cacheMissCounter.should.equal(tmp+1);
                });
                cacheMissCounter.should.equal(NUM_ITERATIONS);
                var tmp = testFunctionSingleParamCustomMemoized.size();
                tmp.should.equal(customSingleOptions.maxSize);
                done();
            });
        });

        describe('Object Param - Default Options', function () {
            it('should have an empty cache initially', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(0);
                done();
            });

            it('should populate the cache when the function is called', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionObjectParamDefaultMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(1);
                done();
            });

            it('should not call the function when the result is already memoized', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionObjectParamDefaultMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(1);
                testFunctionObjectParamDefaultMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should clear the function cache when already empty', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(0);
                testFunctionObjectParamDefaultMemoized.clear();
                tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(0);
                done();
            });

            it('should clear the function cache when not empty', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionObjectParamDefaultMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(1);
                testFunctionObjectParamDefaultMemoized.clear();
                tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should not be limited by a max size, tests with 100 calls without sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    testFunctionObjectParamDefaultMemoized({val: num.toString()});
                    cacheMissCounter.should.equal(1); // Default toString returns [object Object] for hash
                });
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(1);
                done();
            });

            it('should not be limited by a max size, tests with 100 calls with sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    sleep(1); // sleep 1 millisecond
                    testFunctionObjectParamDefaultMemoized({val: num.toString()});
                    cacheMissCounter.should.equal(1);
                });
                cacheMissCounter.should.equal(1); // Default toString returns [object Object] hash, only 1 val cached
                var tmp = testFunctionObjectParamDefaultMemoized.size();
                tmp.should.equal(1);
                done();
            });
        });

        describe('Object Param - Custom Options', function () {
            it('should have an empty cache initially', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(0);
                done();
            });

            it('should populate the cache when the function is called', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionObjectParamCustomMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(1);
                done();
            });

            it('should not call the function when the result is already memoized', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionObjectParamCustomMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(1);
                testFunctionObjectParamCustomMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should clear the function cache when already empty', function (done) {
                cacheMissCounter.should.equal(0);
                var tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(0);
                testFunctionObjectParamCustomMemoized.clear();
                tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(0);
                done();
            });

            it('should clear the function cache when not empty', function (done) {
                cacheMissCounter.should.equal(0);
                testFunctionObjectParamCustomMemoized({val : 'test'});
                cacheMissCounter.should.equal(1);
                var tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(1);
                testFunctionObjectParamCustomMemoized.clear();
                tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(0);
                cacheMissCounter.should.equal(1);
                done();
            });

            it('should be limited by the specified max size, tests with 100 calls without sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    var tmp = cacheMissCounter;
                    testFunctionObjectParamCustomMemoized({val:num.toString()});
                    cacheMissCounter.should.equal(tmp+1);
                });
                cacheMissCounter.should.equal(NUM_ITERATIONS);
                var tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(customObjectOptions.maxSize);
                done();
            });

            it('should not be limited by a max size, tests with 100 calls with sleeping', function (done) {
                var NUM_ITERATIONS = 100;
                cacheMissCounter.should.equal(0);
                _.each(_.range(NUM_ITERATIONS), function (num) {
                    var tmp = cacheMissCounter;
                    sleep(1); // sleep 1 millisecond
                    testFunctionObjectParamCustomMemoized({val:num.toString()});
                    cacheMissCounter.should.equal(tmp+1);
                });
                cacheMissCounter.should.equal(NUM_ITERATIONS);
                var tmp = testFunctionObjectParamCustomMemoized.size();
                tmp.should.equal(customObjectOptions.maxSize);
                done();
            });
        });
    });
};

module.exports = {
    runTests: function () {
        describe('Memoization Functionality', function() {
            // Cache Tests
            memoizeTests();
        });
    }
};