/// <reference path="../typings/d3/d3.d.ts" />


module Asgard {

    export var name = 'asgard';

    export var version = '0.0.1';

    export module Util {

        export function isArray(value:any):boolean {
            return toString.call(value) === '[object Array]';
        }

        export function generateClassName(object:Object, suffix:string):string {
            return name.toLowerCase() + '-' + getClassName(object).toLowerCase() + '-' + suffix;
        }

        export function getClassName(obj:Object):string {
            if (obj && obj.constructor) {
                var strFun = obj.constructor.toString();
                var className = strFun.substr(0, strFun.indexOf('('));
                className = className.replace('function', '');
                return className.replace(/(^\s*)|(\s*$)/ig, '');
            }
            return typeof(obj);
        }

        export function capitalize(str:string):string {
            return String(str.charAt(0)).toUpperCase() +
                String(str.substr(1));
        }
    }


    export module StockData {

        export interface DataInterface {
            start:number;
            end:number;
            high:number;
            low:number;
            open:number;
            close:number;
            price:number;
        }

        export class DataContainer {
            _stock:Stock;
            _defaultName:string;
            _originData:{[name:string]:Object[]} = {};
            _data:{[name:string]:DataInterface[]} = {};

            constructor(stock:Stock) {
                this._stock = stock;
            }

            format(data:Object[]):DataInterface[] {

                return data.map((d) => {
                    return {
                        start: d['start'] * 1000,
                        end: d['end'] * 1000,
                        high: d['high'],
                        low: d['low'],
                        open: d['open'],
                        close: d['close'],
                        price: d['price'],
                        volume: d['price']
                    }
                });
            }

            addData(options:StockDataOptionsInterface):DataContainer {

                if (options.isDefault) {
                    this._defaultName = options.name;
                }

                if (!this._defaultName) {
                    this._defaultName = options.name;
                }


                this._originData[options.name] = options.data;
                this._data[options.name] = this.format(options.data);
                return this;
            }

            getData(name:string):DataInterface[] {
                return this._data[name];
            }

            getOriginData(name:string):Object[] {
                return this._originData[name];
            }


            getShowCount():number {

                var width = this._stock._width,
                    right = this._stock._margin.left,
                    left = this._stock._margin.right;

                return (width - right - left) / 8;
            }

            getXdomain():any[] {

                var data = this.getData(this._defaultName);

                if (this._stock.isZoom()) {
                    data = Array.prototype.slice.apply(data, [0, this.getShowCount()]);
                }

                var date:Date[] = d3.extent<Date>(data.map((d:DataInterface):Date => {
                    return new Date(d.start);
                }));

                var minDate:Date = date[0], maxDate:Date = date[1];

                return [
                    minDate.setMinutes(minDate.getMinutes() - 15),
                    maxDate.setMinutes(maxDate.getMinutes() + 15)
                ];
            }

            getYdomain():number[] {

                var data = this.getData(this._defaultName);

                if (this._stock.isZoom()) {
                    data = Array.prototype.slice.apply(data, [0, this.getShowCount()]);
                }

                return this.getMinAndMaxPrice(data);

            }

            getDataByDateRange(gtValue:any, ltValue:any):DataInterface[] {

                var data = [];

                for (var name in this._data) {
                    this._data[name].forEach((d:DataInterface):void=> {
                        if (d.start >= gtValue && d.start <= ltValue) {
                            data.push(d);
                        }
                    });
                }

                return data;

            }

            getMinAndMaxPrice(data:DataInterface[]):number[] {

                var min, max, diff;

                min = d3.min(data, function (d) {
                    return d['low'];
                });

                max = d3.max(data, function (d) {
                    return d['high'];
                });

                diff = (max - min) * 0.1;

                return [
                    min - diff,
                    max + diff
                ];
            }

        }
    }


    /**
     * Stock Component
     */
    export module StockComponent {

        export interface ComponentInterface {
            _name:string;
            _stock:Stock;
            _init():ComponentInterface;
            _parseOptions(options:StockComponentOptionsInterface):ComponentInterface;
            _createContainer():ComponentInterface;
            draw():ComponentInterface;
            getName():string;
            getStock():Stock;
        }

        export class BaseComponent implements ComponentInterface {

            _name:string;
            _stock:Stock;

            constructor(options:StockComponentOptionsInterface, stock:Stock) {
                this._stock = stock;
                this._name = options.name;

                this._init();
                this._createContainer();
                this._parseOptions(options);
            }

            _init():ComponentInterface {
                return this;
            }

            _parseOptions(options:StockComponentOptionsInterface):ComponentInterface {
                return this;
            }

            _createContainer():ComponentInterface {

                var container = this._stock.getContainer(this._name);

                if (!container) {
                    container = this._stock
                        .getContainer('baseSvg')
                        .insert('g', ':first-child')
                        .classed(Util.generateClassName(this, 'component'), true)
                        .classed(this._name, true);

                    this._stock.addContainer(this._name, container);
                }

                return this;
            }

            draw():ComponentInterface {
                return this;
            }

            getStock():Stock {
                return this._stock;

            }

            getName():string {
                return this._name;
            }

        }

        export class Axis extends BaseComponent {

            _d3Axis:D3.Svg.Axis;
            _orient:string;

            _init():ComponentInterface {

                if (!this._d3Axis) {
                    this._d3Axis = d3.svg.axis();
                }

                return this;
            }

            _parseOptions(options:StockComponentOptionsInterface):ComponentInterface {

                // set orient
                this.setOrient(options['orient']);

                // set default
                this._d3Axis.scale(this._getScale(this._orient))
                    .innerTickSize(0)
                    .outerTickSize(0)
                    .tickPadding(10)
                    .ticks(8)


                var key, values;
                for (key in options) {
                    values = options[key];
                    switch (key) {
                        case 'type':
                        case 'name':
                        case 'orient':
                            break;
                        case 'className':
                            this._stock.getContainer(this._name).classed(values, true);
                            break;
                        default:
                            if (key in this._d3Axis) {
                                if (!Util.isArray(values)) {
                                    values = [values];
                                }
                                this._d3Axis[key].apply(this._d3Axis, values);
                            }
                    }
                }

                return this;
            }

            setOrient(orient:string):ComponentInterface {

                switch (orient) {
                    case 'left':
                    case 'right':
                    case 'top':
                    case 'bottom':
                        break;
                    default :
                        throw new Error('Axis组件orient属性必须为left、right、top、bottom');
                }

                this._orient = orient;

                this._d3Axis.orient(orient);

                return this;
            }

            draw():ComponentInterface {

                var selection:any = this._stock._containers[this._name].selectAll('g').data([this]);

                if (selection.empty()) {
                    selection = selection.enter().append('g').attr(this._getTransform(this._orient));
                }

                selection.call(this._d3Axis);

                return this;

            }

            _getScale(orient):any {
                switch (orient) {
                    case 'bottom':
                    case 'top':
                        return this._stock._xScale;
                        break;
                    case 'left':
                    case 'right':
                        return this._stock._yScale;
                        break;
                }
            }

            _getTransform(orient) {

                var x,
                    y,
                    margin = this._stock._margin,
                    width = this._stock._width,
                    height = this._stock._height;

                switch (orient) {
                    case 'left':
                        x = margin.left;
                        y = margin.top;
                        break;
                    case 'right':
                        x = margin.left + width;
                        y = margin.top;
                        break;
                    case 'bottom':
                        x = margin.left;
                        y = height + margin.top;
                        break;

                    case 'top':
                        x = margin.left;
                        y = margin.top;
                        break;

                }

                return {'transform': 'translate(' + x + ',' + y + ')'};
            }
        }

        export class Grid extends BaseComponent {

            _orient:string;

            _parseOptions(options:StockComponentOptionsInterface):ComponentInterface {

                this._stock.getContainer(this._name).attr('transform', 'translate(' + this._stock._margin.left + ',' + this._stock._margin.top + ')');

                this.setOrient(options['orient']);

                return this;
            }

            setOrient(orient:string):ComponentInterface {

                switch (orient) {
                    case 'x':
                    case 'y':
                        break;
                    default :
                        throw new Error('Grid组件orient属性必须为x、y');
                }

                this._orient = orient;

                return this;
            }


            _getTicks(orient):any[] {
                switch (orient) {
                    case 'y':
                        return this._stock.getYScale().ticks();
                        break;
                    case 'x':
                        return this._stock.getXScale().ticks();
                        break;
                }
            }

            draw():ComponentInterface {

                var selection:any = this._stock.getContainer(this._name)
                    .selectAll('line').data(this._getTicks(this._orient));

                if (selection.empty()) {
                    selection = selection.enter().append('line');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('line');
                    }

                }

                switch (this._orient) {
                    case 'y':
                        selection.attr('x1', 0)
                            .attr('y1', this._stock.getYScale())
                            .attr('x2', this._stock.getWidth())
                            .attr('y2', this._stock.getYScale());
                        break;
                    case 'x':
                        selection.attr('x1', this._stock.getXScale())
                            .attr('y1', 0)
                            .attr('x2', this._stock.getXScale())
                            .attr('y2', this._stock.getHeight());
                        break;
                }

                return this;

            }


        }
    }

    /**
     * Stock Chart
     */
    export module StockChart {

        export interface ChartInterface {
            _name:string;
            _stock:Stock;
            _dataName:string;

            _init():ChartInterface;
            _parseOptions(options:StockChartOptionsInterface):ChartInterface;
            _createContainer():ChartInterface;
            getName():string;
            getStock():Stock;
            getDataName():string;
            draw():ChartInterface;
        }

        export class BaseChart implements ChartInterface {
            _name:string;
            _stock:Stock;
            _dataName:string;

            _init():ChartInterface {
                return this;
            }

            _parseOptions(options:StockChartOptionsInterface):ChartInterface {
                return this;
            }

            _createContainer():ChartInterface {

                var container = this._stock.getContainer(this._name);

                if (!container) {
                    container = this._stock
                        .getContainer('dataClip')
                        .insert('g')
                        .classed(Util.generateClassName(this, 'chart'), true)
                        .classed(this._name, true);
                }
                this._stock.addContainer(this._name, container);

                return this;
            }

            getName():string {
                return this._name;
            }

            getStock():Stock {
                return this._stock;
            }

            getDataName():string {
                return this._dataName;
            }

            draw():ChartInterface {
                return this;
            }

            constructor(options:StockChartOptionsInterface, stock:Stock) {
                this._stock = stock;
                this._name = options.name;
                this._dataName = options.dataName;
                this._init();
                this._createContainer();
                this._parseOptions(options);
            }
        }

        export class Line extends BaseChart {

            /**
             * open
             * close
             * high
             * low
             * hl2 = (high + low) / 2
             * hlc2 = (high + low + close) / 2
             * ohlc4 = (open + high + low +close) / 4
             */
            _priceSource:string;

            _getPriceByPriceScource(data):number {

                switch (this._priceSource) {
                    case 'hl2':
                        return (data['high'] + data['low']) / 2;
                    case 'hlc2':
                        return (data['high'] + data['low'] + data['close']) / 2;
                    case 'ohlc4':
                        return (data['open'] + data['high'] + data['low'] + data['close']) / 2;
                    case 'open':
                    case 'close':
                    case 'high':
                    case 'low':
                        return data[this._priceSource];
                }


            }

            _parseOptions(options:StockChartOptionsInterface):ChartInterface {

                this._priceSource = options['priceSource'] || 'close';

                return this;
            }

            _getCoordinate(prevData:StockData.DataInterface, currentData:StockData.DataInterface):Object[] {

                var prevDate,
                    prevPrice,
                    xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale();

                if (!prevData) {
                    prevDate = new Date(currentData.start);
                    prevPrice = currentData[this._priceSource];
                } else {
                    prevDate = new Date(prevData.start);
                    prevPrice = this._getPriceByPriceScource(prevData);
                }

                return [{
                    x: xScale(new Date(currentData.start)),
                    y: yScale(currentData[this._priceSource])
                }, {
                    x: xScale(prevDate),
                    y: yScale(prevPrice)
                }];
            }

            draw():ChartInterface {

                var line = d3.svg.line().x(function (d) {
                    return d.x;
                }).y(function (d) {
                    return d.y;
                });

                var data = this._stock.getDataContainer().getData(this._dataName);

                var selection:any = this._stock.getContainer(this._name).selectAll('path').data(data);

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }


                selection.attr('d', (d:StockData.DataInterface, i:number) => {
                    return line(this._getCoordinate(data[i + 1], d));
                });

                return this;

            }
        }

        export class Area extends Line {

            draw():ChartInterface {

                var area = d3.svg.area().x((d) => {
                    return d.x;
                }).y0(this._stock.getYScale()(0)).y1((d) => {
                    return d.y;
                });

                var data = this._stock.getDataContainer().getData(this._dataName);

                var selection:any = this._stock.getContainer(this._name).selectAll('path').data(data);

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }

                selection.attr('d', (d:StockData.DataInterface, i:number) => {
                    return area(this._getCoordinate(data[i + 1], d));

                });

                return this;
            }
        }

        export class Ohlc extends BaseChart {
            _isUp(d:StockData.DataInterface):boolean {
                return d.close > d.open || d.close === d.open;
            }

            _isDown(d:StockData.DataInterface):boolean {
                return d.close < d.open;
            }

        }


        export class CandleStick extends Ohlc {

            _rectWidth:number;

            _parseOptions(options:StockChartOptionsInterface):ChartInterface {

                this._rectWidth = options['rectWidth'] || 4;

                return this;
            }

            _highLowlineValue() {
                var d3Line = d3.svg.line()
                        .x((d:{x:number;y:number}) => {
                            return d.x;
                        })
                        .y((d:{x:number;y:number}) => {
                            return d.y;
                        }),
                    xScale = this._stock._xScale,
                    yScale = this._stock._yScale;


                return (d:StockData.DataInterface) => {
                    return d3Line([
                        {
                            x: xScale(new Date(d.start)),
                            y: yScale(d.high)
                        },
                        {
                            x: xScale(new Date(d.start)),
                            y: yScale(d.low)
                        }
                    ]);
                };
            }

            getZoomRectWidth():number {

                var scale = 1;

                if (d3.event) {
                    scale = d3.event.scale;
                }

                scale = Math.max(1, scale);
                scale = Math.min(3, scale);

                return scale * this._rectWidth;
            }

            draw():ChartInterface {


                // line
                var selection:any = this._stock.getContainer(this._name).selectAll('path').data(this._stock.getDataContainer().getData(this._dataName), (d:StockData.DataInterface):number => {
                    return d.start;
                });

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }

                selection.attr('d', this._highLowlineValue());


                // candle
                var selection:any = this._stock.getContainer(this._name).selectAll('rect').data(this._stock.getDataContainer().getData(this._dataName), (d:StockData.DataInterface):number=> {
                    return d.start;
                });

                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                }

                var xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale(),
                    RectWidth = this.getZoomRectWidth();


                selection.attr('x', (d:StockData.DataInterface):number => {
                    return xScale(new Date(d.start)) - RectWidth / 2;
                }).attr('y', (d:StockData.DataInterface):number => {
                    return this._isUp(d) ? yScale(d.close) : yScale(d.open);
                }).attr('width', RectWidth)
                    .attr('height', ((d) => {
                        var height = this._isUp(d) ? yScale(d.open) - yScale(d.close) : yScale(d.close) - yScale(d.open);

                        return Math.max(height, 1);
                    })).classed({
                        'up-day': this._isUp,
                        'down-day': this._isDown
                    });


                return this;

            }
        }


        // @todo ....
        //export class HighLowRect extends BaseChart {
        //
        //    _rectWidth:number;
        //    _upClassName:string;
        //    _downClassName:string;
        //
        //    _isUp(d:StockData.DataInterface):boolean {
        //        return d['close'] > d['open'] || d.close === d.open;
        //    }
        //
        //    _isDown(d:StockData.DataInterface):boolean {
        //        return d['close'] < d['open'];
        //    }
        //
        //    _parseOptions(options:StockChartOptionsInterface):ChartInterface {
        //
        //        this._rectWidth = options['rectWidth'] || 2;
        //
        //        this._downClassName = options['downClassName'] || 'down-rect';
        //        this._upClassName = options['upClassName'] || 'up-rect';
        //
        //        return this;
        //    }
        //
        //
        //    setUpClassName(className:string):ChartInterface{
        //        this._upClassName = className;
        //        return this;
        //    }
        //
        //    setDownClassName(className:string):ChartInterface{
        //        this._downClassName = className;
        //        return this;
        //    }
        //
        //    setRectWidth(rectWidth:number):ChartInterface{
        //        this._rectWidth = rectWidth;
        //        return this;
        //    }
        //
        //    getRectWidth():number {
        //        return this._rectWidth;
        //    }
        //
        //    getZoomRectWidth():number{
        //        var scale = 1;
        //
        //        if (d3.event) {
        //            scale = d3.event.scale;
        //        }
        //
        //        scale = Math.max(1, scale);
        //        scale = Math.min(3, scale);
        //
        //        return scale * this._rectWidth;
        //    }
        //
        //    draw():ChartInterface {
        //
        //        var selection:any = this._stock.getContainer(this._name).selectAll('rect').data(this._stock.getDataContainer().getData(this._dataName), (d:StockData.DataInterface):number => {
        //            return d.start;
        //        });
        //
        //        if (selection.empty()) {
        //            selection = selection.enter().append('rect');
        //        }
        //
        //        var xScale = this._stock.getXScale(),
        //            yScale = this._stock.getYScale(),
        //            zoomRectWidth = this.getZoomRectWidth(),
        //            classed = {};
        //
        //        classed[this._upClassName] = this._isUp;
        //        classed[this._downClassName] = this._isDown;
        //
        //        selection.attr('x', (d:StockData.DataInterface)=>{
        //            return xScale(new Date(d.start)) - zoomRectWidth/2;
        //        }).attr('y',  (d:StockData.DataInterface)=>{
        //            return yScale(d.high);
        //        }).attr('width', zoomRectWidth)
        //        .attr('height', (d:StockData.DataInterface)=>{
        //            return Math.max(yScale(d.low) - yScale(d.high),1);
        //        }).classed(classed);
        //
        //        return this;
        //    }
        //}
        //
        //export class Ohlc extends HighLowRect {
        //
        //    _rectHeight:number;
        //
        //    draw():ChartInterface {
        //        super.draw();
        //        this._drawOpenRect();
        //        this._drawCloseRect();
        //        return this;
        //    }
        //
        //    _parseOptions(options:StockChartOptionsInterface):ChartInterface {
        //
        //        super._parseOptions(options);
        //
        //        this._rectHeight = options['rectHeight'] || 10;
        //        return this;
        //    }
        //
        //    _drawCloseRect():ChartInterface {
        //
        //        var className = Util.generateClassName(this, 'close'),
        //            xScale = this._stock.getXScale(),
        //            yScale = this._stock.getYScale(),
        //            rectWidth = this.getZoomRectWidth(),
        //            superRectWidth = super.getZoomRectWidth(),
        //            classed = {};
        //
        //        classed[this._upClassName] = this._isUp;
        //        classed[this._downClassName] = this._isDown;
        //
        //        var selection:any = this._stock.getContainer(this._name).selectAll('rect.' + className).data(this._stock.getDataContainer().getData(this._dataName), (d:StockData.DataInterface):number => {
        //            return d.start;
        //        });
        //
        //        if (selection.empty()) {
        //            selection = selection.enter().append('rect');
        //        }
        //
        //        selection.attr('x', (d:StockData.DataInterface):number=> {
        //
        //            var x = xScale(new Date(d.start));
        //
        //            if (this._isUp(d)) {
        //                x -= rectWidth + superRectWidth/2;
        //            }else{
        //                x += superRectWidth/2;
        //            }
        //
        //            return x;
        //
        //        }).attr('y', (d) => {
        //            return (this._isUp(d) ? yScale(d.open) : yScale(d.close)) - this._rectHeight;
        //        }).attr('width', rectWidth)
        //            .attr('height', this._rectHeight)
        //            .classed(className, true).classed(classed);
        //
        //        return this;
        //    }
        //
        //    _drawOpenRect():ChartInterface {
        //
        //        var className = Util.generateClassName(this, 'open'),
        //            xScale = this._stock.getXScale(),
        //            yScale = this._stock.getYScale(),
        //            rectWidth = this.getZoomRectWidth(),
        //            superRectWidth = super.getZoomRectWidth(),
        //            classed = {};
        //
        //        classed[this._upClassName] = this._isUp;
        //        classed[this._downClassName] = this._isDown;
        //
        //        var selection:any = this._stock.getContainer(this._name).selectAll('rect.' + className).data(this._stock.getDataContainer().getData(this._dataName), (d:StockData.DataInterface):number => {
        //            return d.start;
        //        });
        //
        //        if (selection.empty()) {
        //            selection = selection.enter().append('rect');
        //        }
        //
        //        selection.attr('x', (d) => {
        //
        //            var x = xScale(new Date(d.start));
        //
        //            if (this._isDown(d)) {
        //                x -= rectWidth + superRectWidth/2;
        //            }else{
        //                x += superRectWidth/2;
        //            }
        //
        //            return x;
        //        }).attr('y', (d) => {
        //            return (this._isDown(d) ? yScale(d.open) : yScale(d.close)) - this._rectHeight;
        //        }).attr('width', rectWidth)
        //            .attr('height', this._rectHeight)
        //            .classed(className, true)
        //            .classed(classed);;
        //
        //        return this;
        //    }
        //
        //}


    }


    export interface StockMarginOptionsInterface {
        left?:number;
        top?:number;
        bottom?:number;
        right?:number
    }

    export interface StockChartOptionsInterface {
        name:string;
        type:string;
        dataName:string;
    }

    export interface StockComponentOptionsInterface {
        name:string;
        type:string;
    }

    export interface StockDataOptionsInterface {
        name:string;
        data:any[];
        isDefault?:boolean;
    }

    export class Stock {

        _width:number = 900;
        _height:number = 300;
        _margin:StockMarginOptionsInterface = {left: 50, top: 50, bottom: 50, right: 75};
        _interval:string = '1D';
        _xScale:any;
        _yScale:any;
        _containers = {};
        _components = {};
        _charts = {};
        _dataContainer;
        _isZoom:boolean;
        _zoom:D3.Behavior.Zoom;
        _sync:Stock[] = [];

        constructor(selection:any, options:any) {

            // 重要的options
            options.width && (this._width = options.width);
            options.height && (this._height = options.height);
            options.interval && (this._interval = options.interval);
            options.margin && (this._margin = options.margin);
            options.isZoom && (this._isZoom = options.isZoom);

            this._initContainer(selection);
            this._initScale();
            this._isZoom && this._initZoom();

            Util.isArray(options.components) && options.components.forEach((component) => this.addComponent(component));
            Util.isArray(options.charts) && options.charts.forEach((chart) => this.addChart(chart));
            Util.isArray(options.data) && options.data.forEach((data) => this.addData(data));
        }

        _initZoom():Stock {
            this._zoom = d3.behavior.zoom();
            this._zoom.scaleExtent([-2, 14]);
            this.getContainer('baseSvg').call(this._zoom);
            this.zoom(():void=> {
            })
            return this;
        }

        _initContainer(selection:any):Stock {

            var baseContainer,
                baseSvgContainer,
                dataContainer,
                dataClipContainer,
                margin = this.getMargin();

            baseContainer = selection instanceof d3.selection ? selection : d3.select(selection);

            baseSvgContainer = baseContainer.append('svg').attr({
                width: this.getWidth() + margin.left + margin.right,
                height: this.getHeight() + margin.top + margin.bottom
            });

            dataContainer = baseSvgContainer.append('g').attr({
                transform: 'translate(' + margin.left + ',' + margin.top + ')',
                width: this.getWidth(),
                height: this.getHeight()
            });

            dataClipContainer = dataContainer.append('g')
                .attr('clip-path', 'url(#plotAreaClip)');

            dataClipContainer.append('clipPath')
                .attr('id', 'plotAreaClip')
                .append('rect')
                .attr({
                    width: this.getWidth(),
                    height: this.getHeight()
                });

            this.addContainer('base', baseContainer)
                .addContainer('baseSvg', baseSvgContainer)
                .addContainer('data', dataContainer)
                .addContainer('dataClip', dataClipContainer);

            return this;
        }

        _initScale():Stock {
            this._xScale = d3.time.scale().range([0, this._width]);
            this._yScale = d3.scale.linear().rangeRound([this._height, 0]);
            return this;
        }

        zoom(callback:() => void):Stock {
            if (this._isZoom) {
                // y 不需要缩放
                this._zoom.x(this._xScale);
                this._zoom.on('zoom', ()=> {

                    // y 不缩放，所以计算当前范围内的最高和最低价格
                    var xDomain = this._xScale.domain();
                    var data = this._dataContainer.getDataByDateRange(xDomain[0], xDomain[1]);
                    this._yScale.domain(this._dataContainer.getMinAndMaxPrice(data));

                    // 对需要同步的Stock 进行xScale,yScale设置
                    this._sync.forEach((stock) => {

                        var xScale = stock.getXScale(),
                            yScale = stock.getYScale();

                        xScale.domain(this._xScale.domain());
                        yScale.domain(this._yScale.domain());

                        stock._zoom.x(xScale);
                        stock._zoom.y(yScale);

                        stock.draw();
                    });

                    this.draw();

                    callback();

                });
            }
            return this;
        }

        addSync(stock:Stock):Stock {
            this._sync.push(stock);
            return this;
        }

        draw():Stock {

            this.drawComponent();
            this.drawChart();
            return this;
        }

        drawComponent():Stock {

            for (var name in this._components) {
                this._components[name].draw();
            }

            return this;
        }

        drawChart():Stock {

            for (var name in this._charts) {
                this._charts[name].draw();
            }

            return this;
        }


        addData(options:StockDataOptionsInterface):Stock {

            if (!this._dataContainer) {
                this._dataContainer = new StockData.DataContainer(this);
            }

            this._dataContainer.addData(options);

            this._xScale.domain(this._dataContainer.getXdomain());
            this._yScale.domain(this._dataContainer.getYdomain());

            this.isZoom() && this._zoom.x(this._xScale);

            return this;
        }

        addChart(options:StockChartOptionsInterface):Stock {

            var type = Util.capitalize(options.type),
                instance = new StockChart[type](options, this),
                name = instance.getName();

            if (!name) {
                throw new Error('图表必须设置一个name');
            }

            this._charts[name] = instance;

            return this;
        }

        addComponent(options:StockComponentOptionsInterface):Stock {

            var type = Util.capitalize(options.type),
                instance = new StockComponent[type](options, this),
                name = instance.getName();

            if (!name) {
                throw new Error('组件必须设置一个name');
            }

            this._components[name] = instance;

            return this;
        }

        addContainer(name:string, selection:D3.Selection) {
            this._containers[name] = selection;
            return this;
        }

        getContainer(name:string):any {
            return this._containers[name];
        }

        getContainers() {
            return this._containers;
        }


        setWidth(width:number):Stock {
            this._width = width;
            return this;
        }

        getWidth():number {
            return this._width;

        }

        setHeight(height:number):Stock {
            this._height = height;
            return this;
        }

        getHeight():number {
            return this._height;

        }

        setInterval(interval:string):Stock {
            this._interval = interval;
            return this;
        }

        getInterval():string {
            return this._interval;

        }

        setMargin(margin:StockMarginOptionsInterface):Stock {
            this._margin = margin;
            return this;
        }

        getMargin():StockMarginOptionsInterface {
            return this._margin;
        }

        getXScale():any {
            return this._xScale;
        }

        getYScale():any {
            return this._yScale;
        }

        isZoom():boolean {
            return this._isZoom;
        }

        getZoom():D3.Behavior.Zoom {
            return this._zoom;
        }

        getDataContainer():StockData.DataContainer {
            return this._dataContainer;
        }

    }


}