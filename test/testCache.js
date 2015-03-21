var should = require('should'),
    _ = require('underscore'),
    async = require('async'),
    memoCache = require('.././lib/memo-cache');

var options = {

};

var cacheTests = function () {
    describe('memoCache.cache', function () {
        describe('Options Specified', function () {
            it('should equal true', function(done) {
                true.should.equal(true);
                done();
            });
        });

        describe('Options Un-specified', function (done) {

        });
    });
};

module.exports = {
    runTests: function () {
        describe('"," Delimited', function() {
            // Cache Tests
            cacheTests();
        });
    }
};