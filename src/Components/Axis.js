import Component from './Component.js';

export default class Axis extends Component {

    constructor(options) {
        super();
        if (options.orient) {
            this.orient = options.orient;
        }
    }

    setOrient(orient) {
        this.orient = orient;
        return this;
    }

    getOrient() {
        return this.orient;
    }

    setScale(scale) {
        this.scale = scale;
        return this;
    }

    getScale() {

        if (!this.scale) {
            switch (this.orient) {
                case 'left':
                case 'right':
                    return this.layout.getYScale();
                    break;
                case 'top':
                case 'bottom':
                    return this.layout.getXScale();
                    break;
            }

        }

        return this.scale;
    }

    getWidth() {
        return this.layout.getWidth();
    }

    getHeight() {
        return this.layout.getHeight();
    }

    renderLine() {
        var ctx = this.layout.getContext();

        ctx.beginPath();
        switch (this.orient) {
            case 'right':
                ctx.moveTo(this.getWidth(), this.layout.getPaddingByOrient('top'));
                ctx.lineTo(this.getWidth(), this.getHeight());
                break;
            case 'bottom':
                ctx.moveTo(0, this.getHeight());
                ctx.lineTo(this.getWidth(), this.getHeight());
                break;
        }
        ctx.stroke();
    }

    renderTicks(){

        var ctx = this.layout.getContext();

        let tickLine = 3;
        let space = 3;
        let fontSize = 12;

        if (this.orient === 'right') {

            let ticks = this.getScale().ticks();

            ticks.forEach((tick,i)=> {
                if(i === 0){
                    return;
                }
                ctx.font = fontSize + "px";
                var originY = this.getScale().scale(tick);
                ctx.beginPath();
                ctx.moveTo(this.getWidth(), originY);
                ctx.lineTo(this.getWidth() + tickLine, originY);
                ctx.stroke();
                ctx.fillText(tick, this.getWidth() + tickLine + space, originY + 5);
            });
        }


        if(this.orient === 'bottom'){

            let ticks = this.getScale().ticks(),
                prevTextX = 0;

            ticks.forEach((tick,i)=> {

                ctx.font = fontSize + "px";

                let text = this.getScale().getTickFormat()(tick);
                let textWidth = ctx.measureText(text).width;

                var originX = this.getScale().scale(tick),
                    textX =  originX - textWidth/2;

                if(!prevTextX || (textX - prevTextX) > (textWidth + 30)){
                    ctx.beginPath();
                    ctx.moveTo(originX, this.getHeight());
                    ctx.lineTo(originX, this.getHeight() + tickLine);
                    ctx.stroke();
                    ctx.fillText(text,textX, this.getHeight() + fontSize + tickLine + space);
                    prevTextX = textX;
                }

            });

        }


    }


    render() {
        this.renderLine();
        this.renderTicks();
    }
}