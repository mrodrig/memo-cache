let cacheTests = require('./testCache');
    memoTests  = require('./testMemoize');

describe('memo-cache Module', function() {
    cacheTests.runTests();
    memoTests.runTests();
});