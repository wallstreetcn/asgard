export default class Zoom {

    constructor(options = {}) {
        if (options.scale) {
            this.scale = options.scale;
        }

        if (options.canvas) {
            this.canvas = options.canvas;
        }

        this.view = {
            x: 0,
            y: 0,
            k: 1
        };
        this.initMousewheel();
    }

    zoomDelta(e) {
        if (this.zoomWheel === 'wheel') {
            return -e.deltaY * (e.deltaMode ? 120 : 1);
        } else {
            return -e.detail;
        }
    }

    initMousewheel() {
        if ("onwheel" in document) {
            this.zoomWheel = "wheel";
        } else {
            this.zoomWheel = "MozMousePixelScroll";
        }
    }

    translateTo(center, translate) {
        translate = [translate[0] * this.view.k + this.view.x, translate[1] * this.view.k + this.view.y];

        this.view.x += center[0] - translate[0];
        this.view.y += center[1] - translate[1];

        return this;
    }

    zoom(callback) {

        var originRange = this.scale.getRange();

        this.canvas.addEventListener(this.zoomWheel, (e)=> {

            e.preventDefault();

            this.view = {
                x: 0,
                y: 0,
                k: 1
            };

            let center = [e.clientX, e.clientY],
                translate = [(center[0] - this.view.x) / this.view.k, (center[1] - this.view.y) / this.view.k];

            this.view.k = Math.pow(2, this.zoomDelta(e) * .002) * this.view.k;

            this.translateTo(center, translate);

            var range = [];
            range[0] = (originRange[0] - this.view.x) / this.view.k;
            range[1] = (originRange[1] - this.view.x) / this.view.k;

            var domain = [this.scale.indexLinear.invert(range[0]), this.scale.indexLinear.invert(range[1])];

            this.scale.indexLinear.setDomain(domain);

            console.log(domain);

            callback();
        });
    }


}