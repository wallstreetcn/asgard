import Chart from './Chart.js';

export default class Line extends Chart {

    constructor(options = {}) {
        super(options);
        this.data = options.data;
    }


    getWidth() {
        return this.layout.getWidth();
    }

    getHeight() {
        return this.layout.getHeight();
    }

    getYScale(){
        if(this.yScale){
            return this.yScale;
        }
        return this.layout.getYScale();
    }

    getXScale(){
        return this.layout.getXScale();
    }

    render() {

        let ctx = this.layout.getContext();

        ctx.save();
        ctx.rect(this.layout.getPaddingByOrient('left'), this.layout.getPaddingByOrient('top'), this.getWidth(), this.getHeight());
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.clip();

        let data = this.layout.data.getDataByName(this.data);

        for (var i = data.data.length - 1; i >= 0; i--) {

            var current = data.data[i];
            var next = data.data[i - 1];

            if (next) {
                ctx.beginPath();
                ctx.moveTo(this.getXScale().scale(new Date(current.date)), this.getYScale().scale(current.open));
                ctx.lineTo(this.getXScale().scale(new Date(next.date)), this.getYScale().scale(next.open));
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}