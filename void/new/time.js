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

