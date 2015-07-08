import Utils from '../Utils/Utils.js';
import Scale from './Scale.js';

export default class Linear extends Scale {

    constructor(options = {}) {
        super(options);
        this.domain = options.domain || [0, 1];
        this.range = options.range || [0, 1];
    }

    linear(a, b, value) {
        var t = (value - a[0]) / (a[1] - a[0]);
        return b[0] * (1 - t) + b[1] * t;
    }

    scale(value) {
        return this.linear(this.domain, this.range, value);
    }

    invert(value) {
        return this.linear(this.range, this.domain, value);
    }

    ticks(count = 10) {

        let domain = this.domain,
            start = domain[0],
            stop = domain[domain.length - 1];

        domain = start < stop ? [start, stop] : [stop, start];

        let span = domain[1] - domain[0],
            step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10)),
            err = count / span * step;

        // Filter ticks to get closer to the desired count.
        if (err <= .15) step *= 10;
        else if (err <= .35) step *= 5;
        else if (err <= .75) step *= 2;

        // Round start and stop values to step interval.
        start = Math.ceil(domain[0] / step) * step;
        stop = Math.floor(domain[1] / step) * step + step * .5; // inclusive

        return Utils.Number.range(start,stop,step);
    }
}