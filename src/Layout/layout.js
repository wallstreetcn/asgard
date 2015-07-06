import Layouts from '../Container/Layouts.js';
import Charts from '../Container/Charts.js';
import Components from '../Container/Components.js';
import {Chart as ChartClass} from '../Charts/Chart.js';
import {Component as ComponentClass} from '../Components/Component.js';

export default class Layout {

    constructor(options = {}) {

        this.layouts = new Layouts();
        this.layouts.addElementInject('setParentLayout', this);
        this.layouts.addElements(options.layouts);

        this.components = new Components();
        this.components.addElementInject('setLayout', this);
        this.components.addElements(options.components);

        // @todo layout => check setLayout => layout
        this.charts = new Charts();
        this.components.addElementInject('setLayout', this);
        this.charts.addElements(options.charts);

        this.setName(options.name || null);
        this.setXScale(options.xScale || null);
        this.setYScale(options.yScale || null);
        this.setWidth(options.width || null);
        this.setHeight(options.height || null);
    }

    addLayout(layout, placement = 'append') {
        if (layout instanceof Layout) {
            this.layouts.addElement(layout, placement);
        }
        return this;
    }

    addComponent(component, placement = 'append') {
        if (component instanceof ComponentClass) {
            this.components.addElement(component, placement);
        }
        return this;
    }

    addChart(chart, placement = 'append') {
        if (chart instanceof ChartClass) {
            this.charts.addElement(chart, placement);
        }
        return this;
    }


    setHeight(height) {
        this.height = height;
        return this;
    }

    getHeight() {
        return this.height;
    }

    setWidth(width) {
        this.width = width;
        return this;
    }

    getWidth() {
        return this.width;
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

    getName() {
        return this.name;
    }

    setName(name) {

        if (typeof name === 'String') {
            throw new TypeError('name 必须是字符串类型!');
        }

        return this;
    }

    render() {

    }

}
