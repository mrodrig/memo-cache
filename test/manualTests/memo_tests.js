var memoCache = require('./../../lib/memo-cache'),
    _ = require('underscore');

var myFun = function (param) {
    console.log('cache miss!');
    return param;
};

var myFunMemoized = memoCache.memoize(myFun, {clone: false, maxSize: null, memoHashFunction: function (arg1) {
    return arg1 !== undefined ? arg1.val.toString() : '__noArgs';
}});

console.log('test', myFunMemoized({val:'test'}));
console.log('test', myFunMemoized({val:'test'}));