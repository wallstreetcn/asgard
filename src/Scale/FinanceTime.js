import Utils from '../Utils/Utils.js';
import Scale from './Scale.js';
import Linear from './Linear.js';

var Time = {

};

function timeInterval(local, step, number) {

    function ceil(date) {
        step(date = local(new Date(date - 1)), 1);
        return date;
    }

    function range(t0, t1, dt) {
        var time = ceil(t0), times = [];
        if (dt > 1) {
            while (time < t1) {
                if (!(number(time) % dt)) times.push(new Date(+time));
                step(time, 1);
            }
        } else {
            while (time < t1) times.push(new Date(+time)), step(time, 1);
        }
        return times;
    }

    local.ceil = ceil;
    local.range = range;

    return local;
}

Time.second = timeInterval(function (date) {
    return new Date(Math.floor(date / 1e3) * 1e3);
}, function (date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 1e3); // DST breaks setSeconds
}, function (date) {
    return date.getSeconds();
});

Time.minute = timeInterval(function (date) {
    return new Date(Math.floor(date / 6e4) * 6e4);
}, function (date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 6e4); // DST breaks setMinutes
}, function (date) {
    return date.getMinutes();
});

Time.hour = timeInterval(function (date) {
    var timezone = date.getTimezoneOffset() / 60;
    return new Date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
}, function (date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 36e5); // DST breaks setHours
}, function (date) {
    return date.getHours();
});

Time.day = timeInterval(function (date) {
    var day = new Date(2000, 0);
    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
}, function (date, offset) {
    date.setDate(date.getDate() + offset);
}, function (date) {
    return date.getDate() - 1;
});

Time.dayOfYear = function(date) {
    var year = this.year(date);
    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
};

Time.month = function () {

    var that = this;

    return timeInterval(function (date) {
        date = that.day(date);
        date.setDate(1);
        return date;
    }, function (date, offset) {
        date.setMonth(date.getMonth() + offset);
    }, function (date) {
        return date.getMonth();
    });
}

Time.year = function () {

    var that = this;

    return timeInterval(function (date) {
        date = that.day(date);
        date.setMonth(0, 1);
        return date;
    }, function (date, offset) {
        date.setFullYear(date.getFullYear() + offset);
    }, function (date) {
        return date.getFullYear();
    });
}



Time.week = function(){
    var that = this;
    return timeInterval(function(date) {
        (date = that.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
        return date;
    }, function(date, offset) {
        date.setDate(date.getDate() + Math.floor(offset) * 7);
    }, function(date) {
        var day = that.year(date).getDay();
        return Math.floor((that.dayOfYear(date) + (day + 6) % 7) / 7) - (day !== 6);
    });
}


export default class FinanceTime extends Scale {

    constructor(options = {}) {
        super(options);
        this.domain = options.domain ||[new Date(0), new Date()];
        this.range = options.range || [0, 1];
        this.indexLinear = new Linear();
        this.domainMap = {};
        this.secondFormat = function (d) {
            return d.getMinutes() + ':' + d.getSeconds();
        };
        this.minuteFormat = function (d) {
            return d.getHours() + ':' + d.getMinutes();
        };
        this.hourFormat = this.minuteFormat;
        this.dayFormat = function (d) {
            return d.getMonth() + '月' + d.getDay() + '号' + d.getHours() + ':' + d.getMinutes();
        }

        this.intraDayTickMethod = [
            [Time.second, 1, this.secondFormat],
            [Time.second, 5, this.secondFormat],
            [Time.second, 15, this.secondFormat],
            [Time.second, 30, this.secondFormat],
            [Time.minute, 1, this.minuteFormat],
            [Time.minute, 5, this.minuteFormat],
            [Time.minute, 15, this.minuteFormat],
            [Time.minute, 30, this.minuteFormat],
            [Time.hour, 1, this.hourFormat],
            [Time.hour, 3, this.hourFormat],
            [Time.hour, 6, this.hourFormat],
            [Time.hour, 12, this.hourFormat],
            [Time.day, 1, this.dayFormat]
        ];
        this.dailyTickMethod = [
            [Time.day, 1, this.dayFormat],
            [Time.week, 1, this.dayFormat],
            [Time.month, 1, this.dayFormat],
            [Time.month, 3, this.dayFormat],
            [Time.year, 1, this.dayFormat]
        ];
        this.intraDayTickSteps = [
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
        this.dailyStep = 864e5;

        this.dailyTickSteps = [
            this.dailyStep,  // 1-day
            6048e5,     // 1-week
            2592e6,     // 1-month
            7776e6,     // 3-month
            31536e6     // 1-year
        ];

    }

    getDomain() {

        var visible = this.indexLinear.getDomain();

        if (visible[0] < 0 && visible[visible.length - 1] < 0) {
            return [];
        }

        visible = [
            Math.max(Math.ceil(visible[0]), 0),
            Math.min(Math.floor(visible[visible.length - 1]), this.domain.length - 1)
        ];

        return this.domain.slice(visible[0], visible[visible.length - 1] + 1);

    }


    setDomain(domain) {
        this.domain = domain;
        this.applyIndexLinearDomain();
        return this;
    }

    applyIndexLinearDomain() {
        this.indexLinear.setDomain([0, this.domain.length - 1]);
        this.domainMap = this.lookupDomainMap(this.domain);

        var range = this.indexLinear.getRange();
        // @todo ..set range padding;
        var padding = 20;

        this.indexLinear.setDomain([this.indexLinear.invert(range[0] - padding), this.indexLinear.invert(range[1] + padding)]);

        // zoom domain 最小的范围
        this.zoomLimit = this.indexLinear.getDomain();

    }

    getZoomLimit() {
        return this.zoomLimit;
    }

    setTickFormat(tickFormat) {
        this.tickFormat = tickFormat;
        return this;
    }

    getTickFormat() {
        return this.tickFormat;
    }

    lookupDomainMap(domain) {
        var domainMap = {};
        domain.forEach(function (d, i) {
            domainMap[+d] = i;
        });
        return domainMap;
    }

    scale(value) {

        var mappedIndex = this.domainMap[+value];

        if (mappedIndex === undefined) {
            if (this.domain[0] > value) {
                mappedIndex = -1;
            } else {
                mappedIndex = Utils.Array.bisect(this.domain, value);
            }
        }

        return this.indexLinear.scale(mappedIndex);
    }

    setRange (range) {
        this.indexLinear.setRange(range);
        this.applyIndexLinearDomain();
    };
    getRange() {
        return this.indexLinear.getRange();
    }

    invert(value) {
        var date = this.domain[Math.round(this.indexLinear.invert(value))];
        return date ? date : null;
    }

    ticks(count = 10) {

        var visibleDomain = this.getDomain(),
            indexDomain = this.indexLinear.getDomain();

        // 如果不存在数据
        if (!visibleDomain.length) {
            return [];
        }

        // 计算开始和结束的时间的范围
        var visibleDomainExtent = visibleDomain[visibleDomain.length - 1] - visibleDomain[0];

        // 时间范围 / dailyStep 来判断是否是每日之内
        var intraDay = visibleDomainExtent / this.dailyStep < 1;

        //  获取处理时间range的方法
        var tickMethods = intraDay ? this.intraDayTickMethod : this.dailyTickMethod;

        // 用来判断时间区域间隔
        var tickSteps = intraDay ? this.intraDayTickSteps : this.dailyTickSteps;


        //var k = Math.min(Math.round(visibleDomain.length / (indexDomain[indexDomain.length - 1] - indexDomain[0]) * count), count);

        //  计算出每个ticks中间要显示多少毫秒的时间
        var target = visibleDomainExtent / count;

        // 通过2分计算出 target 应该属于哪个step后面
        var i = Utils.Array.bisect(tickSteps, target);

        // tick method
        var method;

        // 最大的step ,则返回最后的tick method
        if (i == tickMethods.length) {
            method = tickMethods[i - 1];
        } else {
            if (i) {
                var key;
                // 当前位置的前面和后面找一个值比较接近的时间
                if (target / tickSteps[i - 1] < tickSteps[i] / target) {
                    key = i - 1;
                } else {
                    key = i;
                }
                method = tickMethods[key];
            } else {
                // i == 0;
                method = tickMethods[i]
            }
        }


        var interval = method[0];
        var steps = method[1];

        this.setTickFormat(method[2]);

        return visibleDomain;

        // 从步进值 从开始时间，到结束时间 生成时间范围
        // interval.range(visibleDomain[0], +visibleDomain[visibleDomain.length - 1] + 1, steps);
        // var intervalRange = visibleDomain;


        // 保存实际的数据
        // var domainTimes = [];

        //var visibleDomainMap = this.lookupDomainMap(visibleDomain);

        // 找到intervalRange里对应的visibleDomain数据
        //intervalRange.forEach(function (d) {
        //    // 使用当前时间去找map得索引
        //    var value = visibleDomainMap[+d];
        //
        //    if (value !== undefined) {
        //        domainTimes.push(visibleDomain[value]);
        //    } else {
        //        // 如果当前时间在所有stocks数据内不存在
        //        // 通过时间去找他接近的时间
        //        // [1,3,4,5,6] 2
        //        // 2 找不到 就去数组找到2插入的位置 在第2位。 使用3代替2
        //        domainTimes.push(visibleDomain[Util.Array.bisect(visibleDomain, d)]);
        //    }
        //});
        //
        //// 过滤掉相同的时间
        //var filterRepeatDomainTimes = [];
        //domainTimes.forEach(function (d) {
        //    if (filterRepeatDomainTimes.length === 0 || filterRepeatDomainTimes[filterRepeatDomainTimes.length - 1] !== d) {
        //        filterRepeatDomainTimes.push(d);
        //    }
        //});


        //return filterRepeatDomainTimes;
    }

;

}