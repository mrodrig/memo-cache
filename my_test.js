var memoCache = require('./lib/memo-cache.js');

var new_cache = memoCache.cache.create('new_cache', {maxSize : 10});
console.log(new_cache);
memoCache.cache.set('new_cache', 'test', 3);
console.log(memoCache.cache.get('new_cache', 'test'));
console.log(new_cache.get('test'));
console.log(new_cache.size());
console.log(memoCache.cache.size());
memoCache.cache.clear('new_cache');
console.log(memoCache.cache.get('new_cache', 'test'));

var a = function (a) { console.log('cache miss!'); return a.toString(); };
var aMemo = memoCache.memoize(a);
console.log(aMemo);
var tmp = aMemo('test');
console.log(tmp);
console.log(aMemo.size());
var tmp2 = aMemo('test');
console.log('tmp2', tmp2);
var tmp = aMemo('test2');
console.log(aMemo.clear());
console.log(aMemo.size());