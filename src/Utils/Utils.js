let class2type = {};

"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach((name)=> {
    class2type["[object " + name + "]"] = name.toLowerCase();
});


let ascending = function (a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};

var Utils = {
    String: {
        ucfirst: (str) => {
            return String(str.charAt(0)).toUpperCase() + String(str.substr(1));
        }
    },
    Array: {
        bisect: function (a, x, lo, hi) {

            if (arguments.length < 3) lo = 0;
            if (arguments.length < 4) hi = a.length;

            while (lo < hi) {
                var mid = lo + hi >>> 1;
                if (ascending(a[mid], x) > 0) hi = mid;
                else lo = mid + 1;
            }
            return lo;
        },
        map(obj, callback){

            let map = [];

            Utils.forEach(obj, (value, key)=> {
                var mapData = callback.call(obj, value, key);

                if (mapData) {
                    map.push(mapData);
                } else {
                    map.push(value);
                }
            });

            return map;
        }
    },
    Number: {
        range: function (start, stop, step) {
            if (arguments.length < 3) {
                step = 1;
                if (arguments.length < 2) {
                    stop = start;
                    start = 0;
                }
            }

            if ((stop - start) / step === Infinity)
                throw new TypeError("infinite 范围");

            let range = [],
                k = Utils.Number.rangeIntergerScale(Math.abs(step)),
                i = -1,
                j;

            start *= k, stop *= k, step *= k;
            if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k);
            else while ((j = start + step * ++i) < stop) range.push(j / k);

            return range;
        },
        rangeIntergerScale: function (x) {
            var k = 1;
            while (x * k % 1) k *= 10;
            return k;
        }
    },
    type(obj){
        if (obj == null) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
    },
    isFunction(obj){
        return this.type(obj) === 'function';
    },
    isObject(obj){
        return this.type(obj) === 'object';
    },
    isArray(obj){
        return this.type(obj) === 'array';
    },
    isPercent(str) {
        return /^-?\d+%$/.test(str);
    },
    isElement(node){
        return !!(node && node.nodeName);
    },
    forEach(obj, callback){
        if (this.isArray(obj)) {
            obj.forEach.call(obj, callback);
        } else if (this.isObject(obj)) {
            Object.keys(obj).forEach(function (key, i) {
                callback.call(obj, obj[key], key);
            });
        }
    }
}

export default Utils;