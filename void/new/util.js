var Util = {
    ascending: function (a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    },
    bisect: function (a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (this.ascending(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    },
    range: function (start, stop, step) {
        if (arguments.length < 3) {
            step = 1;
            if (arguments.length < 2) {
                stop = start;
                start = 0;
            }
        }
        if ((stop - start) / step === Infinity) throw new Error("infinite range");
        var range = [],
            k = this.rangeIntergerScale(Math.abs(step)),
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

};