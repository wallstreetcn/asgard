var zh_CN = d3.locale({
    "decimal": "。",
    "thousands": "，",
    "grouping": [3],
    "currency": ["RMB", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%Y/%m/%d",
    "time": "%H:%M:%S",
    "periods": ["上午", "下午"],
    "days": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    "shortDays": ["日", "一", "二", "三", "四", "五", "六"],
    "months": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    "shortMonths": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
});

d3.time.format = zh_CN.timeFormat;

function rebindCallback(target, source, postSetCallback) {
    var i = 2, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = doRebind(target, source, source[method], postSetCallback);
    return target;
}

function doRebind(target, source, method, postSetCallback) {
    return function () {
        var value = method.apply(source, arguments);
        if (postSetCallback && value === source) postSetCallback();
        return value === source ? target : value;
    };
}

function zoomable(linear, zoomed, domainLimit) {
    var scale = {},
        clamp = true;

    scale['invert'] = linear.invert;

    scale['domain'] = function (_) {
        if (!arguments.length) return linear.domain();

        if (clamp) linear.domain([Math.max(domainLimit[0], _[0]), Math.min(domainLimit[1], _[1])]);
        else linear.domain(_);

        if (zoomed) zoomed(); // Callback to that we have been zoomed
        return scale;
    };

    scale['range'] = function (_) {
        if (!arguments.length) return linear.range();
        throw "zoomable is a read only range. Use this scale for zooming only";
    };

    scale['copy'] = function () {
        return zoomable(linear.copy(), zoomed, domainLimit);
    };

    scale['clamp'] = function (_) {
        if (!arguments.length) return clamp;
        clamp = _;
        return scale;
    };

    return scale;
}

function financetDate(index, domain, padding, outerPadding, zoomLimit) {

    var dateIndexMap,
        tickState = {tickFormat: dailyTickMethod[dailyTickMethod.length - 1][2]},
        band = 3;

    function scale_widen(widening, width) {
        widening = widening || 0;

        return function (d, i, array) {
            if (array.length > 2) throw "array.length > 2 unsupported. array.length = " + array.length;
            width = width || (array[array.length - 1] - array[0]);
            return d + (i * 2 - 1) * width * widening;
        };
    }

    var index = index || d3.scale.linear();
    var domain = domain || [new Date(0), new Date(1)];
    var padding = padding || 0.2;
    var outerPadding = outerPadding || 0.65; // 2边间距
    var zoomLimit = zoomLimit || index.domain();

    /**
     * Scales the value to domain. If the value is not within the domain, will currently brutally round the data:
     * - If before min domain, will round to 1 index value before min domain
     * - If after max domain, will round to 1 index value after min domain
     * - If within domain, but not mapped to domain value, uses d3.bisect to find nearest domain index
     *
     * This logic was not required until the domain was being updated and scales re-rendered and this line
     * https://github.com/mbostock/d3/blob/abbe1c75c16c3e9cb08b1d0872f4a19890d3bb58/src/svg/axis.js#L107 was causing error.
     * New scale generated ticks that old scale did not have, causing error during transform. To avoid error this logic
     * was added.
     *
     * @param x The value to scale
     * @param offset Apply an index offset to the mapped x (date) parameter
     * @returns {*}
     */
    function scale(x, offset) {


        var mappedIndex = dateIndexMap[+x];
        offset = offset || 0;

        // Make sure the value has been mapped, if not, determine if it's just before, round in, or just after domain
        if (mappedIndex === undefined) {
            if (domain[0] > x) mappedIndex = -1; // Less than min, round just out of domain
            else mappedIndex = d3.bisect(domain, x); // else let bisect determine where in or just after than domain it is
        }

        return index(mappedIndex + offset);
    }

    /**
     * Invert the passed range coordinate to the corresponding domain. Returns null if no valid domain available.
     *
     * @param y
     * @returns {null} If the range value cannot be mapped. eg, if range value is outside of the mapped domain
     */
    scale['invert'] = function (y) {
        var d = domain[scale['invertToIndex'](y)];
        return d ? d : null;
    };

    /**
     * Inverts the coordinate to the corresponding domain. <b>NOTE: </b> May return values outside of the domain such
     * as negative indexes, or an index greater than what is available in the domain.
     *
     * @param y
     * @returns {number} A number representing the index in the domain the range value has been inverted to. May return
     * values outside of the domain such as negatives or value greater than domain().length-1
     */
    scale['invertToIndex'] = function (y) {
        return Math.round(index.invert(y));
    };

    /**
     * As the underlying structure relies on a full array, ensure the full domain is passed here,
     * not just min and max values.
     *
     * @param _ The full domain array
     * @returns {*}
     */
    scale['domain'] = function (_) {
        if (!arguments.length) {
            var visible = index.domain();

            if (visible[0] < 0 && visible[visible.length - 1] < 0) return []; // if it's all negative return empty, nothing is visible

            visible = [
                Math.max(Math.ceil(visible[0]), 0), // If min is fraction, it is partially out of view, but still partially visible, round up (ceil)
                Math.min(Math.floor(visible[visible.length - 1]), domain.length - 1) // If max is fraction, is partially out of view, but still partially visible, round down (floor)
            ];

            return domain.slice(visible[0], visible[visible.length - 1] + 1); // Grab visible domain, inclusive
        }

        domain = _;
        return applyDomain();
    };

    function zoomed() {
        band = rangeBand(index, domain, padding);
        return scale;
    }

    function domainMap() {
        dateIndexMap = lookupIndex(domain);
    }

    function applyDomain() {
        domainMap();
        index.domain([0, domain.length - 1]);
        zoomed();
        // Apply outerPadding and widen the outer edges by pulling the domain in to ensure start and end bands are fully visible
        index.domain(index.range().map(scale_widen(outerPadding, band)).map(index.invert));
        zoomLimit = index.domain(); // Capture the zoom limit after the domain has been applied
        return zoomed();
    }

    scale['copy'] = function () {
        return financetDate(index.copy(), domain, padding, outerPadding, zoomLimit);
    };

    /**
     * Equivalent to d3's ordinal.rangeBand(). It could not be named rangeBand as d3 uses the method
     * to determine how axis ticks should be rendered. This scale is a hybrid ordinal and linear scale,
     * such that scale(x) returns y at center of the band as does d3.scale.linear()(x) does, whereas
     * d3.scale.ordinal()(x) returns y at the beginning of the band. When rendering svg axis, d3
     * compensates for this checking if rangeBand is defined and compensates as such.
     * @returns {number}
     */
    scale['band'] = function () {
        return band;
    };

    scale['outerPadding'] = function (_) {
        if (!arguments.length) return outerPadding;
        outerPadding = _;
        return applyDomain();
    };

    scale['padding'] = function (_) {
        if (!arguments.length) return padding;
        padding = _;
        return applyDomain();
    };

    scale['zoomable'] = function () {
        return zoomable(index, zoomed, zoomLimit);
    };

    /*
     * Ticks based heavily on d3 implementation. Attempted to implement this using composition with d3.time.scale,
     * but in the end there were sufficient differences to 'roll my own'.
     * - Different base tick steps: millis not required (yet!)
     * - State based tick formatting given the non continuous, even steps of ticks
     * - Supporting daily and intraday continuous (no gaps) plotting
     * https://github.com/mbostock/d3/blob/e03b6454294e1c0bbe3125f787df56c468658d4e/src/time/scale.js#L67
     */
    /**
     * Generates ticks as continuous as possible against the underlying domain. Where continuous time ticks
     * fall on where there is no matching domain (such as weekend or holiday day), it will be replaced with
     * the nearest domain datum ahead of the tick to keep close to continuous.
     * @param interval
     * @param steps
     * @returns {*}
     */
    scale['ticks'] = function (interval, steps) {

        // interval = 10;
        // steps = undefined;

        // visiable domain 200 data length
        var visibleDomain = scale['domain'](),


        // linear domain [-0.52,199.52]
            indexDomain = index.domain();


        if (!visibleDomain.length) return []; // Nothing is visible, no ticks to show

        //var method = interval === undefined ? tickMethod(visibleDomain, indexDomain, 10) :
        //    typeof interval === 'number' ? tickMethod(visibleDomain, indexDomain, interval) : null;
        //  tickState.tickFormat = method ? method[2] : tickMethod(visibleDomain, indexDomain, 10)[2];

        var method;

        // 其实对于date来讲 interval肯定不能是number,10只是均分时间的基数
        // interval 默认 10
        if (interval === undefined || typeof interval !== 'number') {
            interval = 10;
        }

        // 时间的方法，获取哪种时间，step是多少
        method = tickMethod(visibleDomain, indexDomain, interval);

        // 数据格式化方式
        tickState.tickFormat = method[2];

        if (method) {
            interval = method[0];
            steps = method[1];
        }

        // 从步进值 从开始时间，到结束时间 生成时间范围 ，
        var intervalRange = interval.range(visibleDomain[0], +visibleDomain[visibleDomain.length - 1] + 1, steps);

        var returnData = intervalRange
            .map(domainTicks(visibleDomain))    // 找到intervalRange里对应的visibleDomain数据
            .reduce(sequentialDuplicates, []);  // 过滤掉重复的数据


        return returnData;
    };

    /**
     * NOTE: The type of tick format returned is dependant on ticks that were generated. To obtain the correct
     * format for ticks, ensure ticks function is called first, otherwise a default tickFormat will be returned
     * which may not be the optimal representation of the current domain state.
     * @returns {Function}
     */
    scale['tickFormat'] = function () {
        return function (date) {
            return tickState.tickFormat(date);
        };
    };

    rebindCallback(scale, index, zoomed, 'range');

    domainMap();
    return zoomed();
}

function rangeBand(linear, domain, padding) {
    return (Math.abs(linear(domain.length - 1) - linear(0)) / Math.max(1, domain.length - 1)) * (1 - padding);
}

var dayFormat = d3.time.format('%b %e'),
    yearFormat = d3.time.format.multi([
        ['%b %Y', function (d) {
            return d.getMonth();
        }],
        ['%Y', function () {
            return true;
        }]
    ]),
    intraDayFormat = d3.time.format.multi([
        [":%S", function (d) {
            return d.getSeconds();
        }],
        ["%I:%M", function (d) {
            return d.getMinutes();
        }],
        ["%I %p", function (d) {
            return true;
        }]
    ]),
    genericTickMethod = [d3.time.second, 1, d3.time.format.multi([
        [":%S", function (d) {
            return d.getSeconds();
        }],
        ["%I:%M", function (d) {
            return d.getMinutes();
        }],
        ["%I %p", function (d) {
            return d.getHours();
        }],
        ['%b %e', function () {
            return true;
        }]
    ])
    ];

var dailyStep = 864e5,
    dailyTickSteps = [
        dailyStep,  // 1-day
        6048e5,     // 1-week
        2592e6,     // 1-month
        7776e6,     // 3-month
        31536e6     // 1-year
    ];

var dailyTickMethod = [
    [d3.time.day, 1, dayFormat],
    [d3.time.monday, 1, dayFormat],
    [d3.time.month, 1, yearFormat],
    [d3.time.month, 3, yearFormat],
    [d3.time.year, 1, yearFormat]
];

var intraDayTickSteps = [
    1e3,    // 1-second
    5e3,    // 5-second
    15e3,   // 15-second
    3e4,    // 30-second
    6e4,    // 1-minute
    3e5,    // 5-minute
    9e5,    // 15-minute
    18e5,   // 30-minute
    36e5,   // 1-hour
    108e5,  // 3-hour
    216e5,  // 6-hour
    432e5,  // 12-hour
    864e5   // 1-day
];

var intraDayTickMethod = [
    [d3.time.second, 1, intraDayFormat],
    [d3.time.second, 5, intraDayFormat],
    [d3.time.second, 15, intraDayFormat],
    [d3.time.second, 30, intraDayFormat],
    [d3.time.minute, 1, intraDayFormat],
    [d3.time.minute, 5, intraDayFormat],
    [d3.time.minute, 15, intraDayFormat],
    [d3.time.minute, 30, intraDayFormat],
    [d3.time.hour, 1, intraDayFormat],
    [d3.time.hour, 3, intraDayFormat],
    [d3.time.hour, 6, intraDayFormat],
    [d3.time.hour, 12, intraDayFormat],
    [d3.time.day, 1, dayFormat]
];

/**
 * Calculates the proportion of domain that is visible. Used to reduce the overall count by this factor
 * @param visibleDomain
 * @param indexDomain
 * @returns {number}
 */
function countK(visibleDomain, indexDomain) {
    return visibleDomain.length / (indexDomain[indexDomain.length - 1] - indexDomain[0]);
}

function tickMethod(visibleDomain, indexDomain, count) {

    // visibleDomain 200 data
    // indexDomain [-0.52,199.52]
    // count

    // 如果只有一个数据
    if (visibleDomain.length == 1) return genericTickMethod;


    // 计算开始和结束的时间的范围
    var visibleDomainExtent = visibleDomain[visibleDomain.length - 1] - visibleDomain[0];

   // console.log(visibleDomainExtent);

    // 时间范围 / dailyStep 来判断是否是每日之内
    var intraDay = visibleDomainExtent / dailyStep < 1;

    //  获取时间数值(获取秒,获取分等)和格式化的列表
    var tickMethods = intraDay ? intraDayTickMethod : dailyTickMethod;

    // 时间的间隔
    var tickSteps = intraDay ? intraDayTickSteps : dailyTickSteps;

    // 计算域是可见的比例。使用这个因素，以降低整体的计数,...可能可以不要哦
    var k = Math.min(Math.round(countK(visibleDomain, indexDomain) * count), count);

    //  计算出每个ticks中间要显示多少毫秒的时间
    var target = visibleDomainExtent / k;

    // 通过2分计算出 target 应该属于哪个step后面
    var i = d3.bisect(tickSteps, target);
    // 最大的step ,则返回最后的tick method
    if (i == tickMethods.length) {
        return tickMethods[i - 1];
    } else {
        if (i) {

            var key;
            // 当前位置的前面和后面找一个值比较接近的step
            if (target / tickSteps[i - 1] < tickSteps[i] / target) {
                key = i - 1;
            } else {
                key = i;
            }

            return tickMethods[key];
        } else {
            // i == 0;
            return tickMethods[i]
        }
    }


}

function lookupIndex(array) {
    var lookup = {};
    array.forEach(function (d, i) {
        lookup[+d] = i;
    });
    return lookup;
}

function domainTicks(visibleDomain) {

    // 生成map
    var visibleDomainLookup = lookupIndex(visibleDomain);

    return function (d) {
        // 使用当前时间去找map得索引
        var value = visibleDomainLookup[+d];
        if (value !== undefined) return visibleDomain[value];


        // 如果当前时间在所有stocks数据内不存在

        // 通过时间去找他接近的时间
        // [1,3,4,5,6] 2
        // 2 找不到 就去数组找到2插入的位置 在第2位。 使用3代替2
        return visibleDomain[d3.bisect(visibleDomain, d)];
    };
}

function sequentialDuplicates(previous, current) {

    if (previous.length === 0 || previous[previous.length - 1] !== current)
        previous.push(current);

    return previous;
}
