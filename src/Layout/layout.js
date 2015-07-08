import Charts from '../Containers/Charts.js';
import Components from '../Containers/Components.js';
import {Chart as ChartClass} from '../Charts/Chart.js';
import {Component as ComponentClass} from '../Components/Component.js';
import Utils from '../Utils/Utils.js';
import Linear from '../Scale/Linear.js';
import FinanceTime from '../Scale/FinanceTime.js';
import Data from '../Data/Data.js';
import Zoom from '../Event/Zoom.js';

export default class Layout {

    constructor(options) {

        this.padding = {};
        this.isRendered = true;
        this.initContainer();
        this.parseOptions(options);
    }

    parseOptions(options = {}) {

        // canvas 必须先被设置
        if (options.canvas) {
            this.setCanvas(options.canvas);
        }

        if (options.padding) {
            this.setPadding(options.padding);
        }

        if (options.canvasWidth) {
            this.setCanvasWidth(options.canvasWidth);
        }

        if (options.canvasHeight) {
            this.setCanvasHeight(options.canvasHeight);
        }

        if (options.data) {
            this.data = options.data;
        } else {
            this.data = new Data();
        }

        if (options.yScale) {
            this.setYScale(options.yScale);
        } else {
            this.setYScale(new Linear());
        }

        if (options.xScale) {
            this.setXScale(options.xScale);
        } else {
            this.setXScale(new FinanceTime());
        }

        if (options.zoom) {
            this.setZoom(options.zoom);
        }

        this.components.addElements(options.components);
        this.charts.addElements(options.charts);

    }

    initContainer() {
        this.components = new Components();
        this.components.addElementInject('layout', this);

        this.charts = new Charts();
        this.components.addElementInject('layout', this);
    }


    setContainer(container) {
        this.container = container;
        return this;
    }

    getContainer(container) {
        return this.container;
    }

    addLayout(layout, placement = 'append') {
        this.layouts.addElement(layout, placement);
        return this;
    }

    addComponent(component, placement = 'append') {
        this.components.addElement(component, placement);
        return this;
    }

    addChart(chart, placement = 'append') {
        this.charts.addElement(chart, placement);
        return this;
    }

    getCanvasHeight() {
        return this.canvas.height;
    }

    getCanvasWidth() {
        return this.canvas.width;
    }

    setCanvasHeight(height) {
        this.canvas.height = height;
        return this;
    }

    setCanvasWidth(width) {
        this.canvas.width = width;
        return this;
    }

    setPadding(padding) {
        this.padding = padding;
        return this;
    }

    getPadding() {
        return this.padding;
    }

    getPaddingByOrient(orient) {
        return this.padding[orient] || 0;
    }

    getWidth() {
        return this.getCanvasWidth() - this.getPaddingByOrient('left') - this.getPaddingByOrient('right');
    }

    getHeight() {
        return this.getCanvasHeight() - this.getPaddingByOrient('top') - this.getPaddingByOrient('bottom');
    }

    getXScale() {
        return this.xScale;
    }

    setXScale(xScale) {
        this.xScale = xScale;
        return this;
    }

    getYScale() {
        return this.yScale;
    }

    setYScale(yScale) {
        this.yScale = yScale;
        return this;
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        return this;
    }

    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.canvas.getContext('2d');
    }

    setZoom(zoom) {
        this.zoom = zoom;
        return this;
    }


    render() {

        this.getContext().clearRect(0, 0,this.getCanvasWidth(), this.getCanvasHeight());

        if (this.isRendered && this.yScale) {
            this.yScale.setRange([this.getPaddingByOrient('top'), this.getHeight()]);
            this.yScale.setDomain([5000, 3000]);
        }

        if (this.isRendered && this.xScale) {
            this.xScale.setRange([this.getPaddingByOrient('left'), this.getWidth()]);
            this.xScale.setDomain(this.data.getXDomain());
        }

        if (this.isRendered && this.zoom) {
            // zoom 只缩放x
            this.zoomEvent = new Zoom({
                scale: this.getXScale(),
                canvas: this.getCanvas()
            });

            this.zoomEvent.zoom(() => {
                //console.log(this);
                this.render();
            });
        }

        this.components.render();
        this.charts.render();

        this.isRendered = false;
    }

}
