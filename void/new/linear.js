function Linear() {
    this.domain = [];
    this.range = [];
};

Linear.prototype.getDomain = function () {
    return this.domain;
};
Linear.prototype.setDomain = function (domain) {
    this.domain = domain;
    return this;
};
Linear.prototype.setRange = function (range) {
    this.range = range;
    return this;
};
Linear.prototype.getRange = function () {
    return this.range;
};
Linear.prototype.scale = function (value) {
    return this.linear(this.domain, this.range, value);
};
Linear.prototype.invert = function (value) {
    return this.linear(this.range, this.domain, value);
};
Linear.prototype.ticks = function (count) {

    if (count === undefined) {
        count = 10;
    }

    var domain = this.domain;

    var start = domain[0],
        stop = domain[domain.length - 1];

    domain = start < stop ? [start, stop] : [stop, start];

    var span = domain[1] - domain[0],
        step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10)),
        err = count / span * step;

    // Filter ticks to get closer to the desired count.
    if (err <= .15) step *= 10;
    else if (err <= .35) step *= 5;
    else if (err <= .75) step *= 2;

    // Round start and stop values to step interval.
    domain[0] = Math.ceil(domain[0] / step) * step;
    domain[1] = Math.floor(domain[1] / step) * step + step * .5; // inclusive
    domain[2] = step;

    return Util.range.apply(Util, domain);
};

Linear.prototype.linear = function (a, b, value) {
    var t = (value - a[0]) / (a[1] - a[0]);
    return b[0] * (1 - t) + b[1] * t;
};