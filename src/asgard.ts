/// <reference path="../typings/d3/d3.d.ts" />


module Asgard {


    /**
     * 模块名
     * @type {string}
     */
    export var name:string = 'asgard';

    /**
     * 版本号
     * @type {string}
     */
    export var version:string = '0.0.1';


    /**
     * @type {function}
     */
     var nullFunction = ():void=> {};


    /**
     * 事件容器
     *
     * @type {{}}
     */
     var listenerContainer = {};

    /**
     * 扩展d3事件
     *
     *
     * d3.on(type,listener) 只支持绑定一个listener
     * @param type
     * @param listener
     */
    d3.selection.prototype.addEventListener = function (type, listener) {

        var listenerFunction = function (e) {

            e = e || window.event;

            d3.event = e;

            listener.call(this);
        }

        if (!listenerContainer[type]) {
            listenerContainer[type] = [];
        }

        listenerContainer[type].push({
            listenerFunction: listenerFunction,
            listener: listener
        });

        this.node().addEventListener(type, listenerFunction);
    }

    d3.selection.prototype.removeEventListener = function (type, listener) {

        var typeListeners = listenerContainer[type];

        if (typeListeners) {
            for (var i = 0, l = typeListeners.length; i < l; i++) {
                var typeListener = typeListeners[i];
                if (typeListener.listener === listener) {
                    this.node().removeEventListener(type, typeListener.listenerFunction);
                }
            }
        }

    }

    /**
     * Stock Margin Options 接口
     */
    export interface StockMarginOptionsInterface {
        left?:number;
        top?:number;
        bottom?:number;
        right?:number
    }

    /**
     * Stock Chart Options 接口
     */
    export interface StockChartOptionsInterface {
        name:string;
        type:string;
        dataName:string;
    }

    /**
     * Stock Component Options 接口
     */
    export interface StockComponentOptionsInterface {
        name:string;
        type:string;
    }

    /**
     * Stock Data Options 接口
     */
    export interface StockDataOptionsInterface {
        name:string;
        data:any[];
        isDefault?:boolean;
    }

    /**
     * Util Module
     */
    export module Util {

        var toString = Object.prototype.toString;

        /**
         * 判断是否是函数
         *
         * @param value
         * @returns {boolean}
         */
        export function isFunction(value) {
            return toString.call(value) === '[object Function]' || typeof value === 'function';
        }

        /**
         * 判断是否是数组
         * @param value
         * @returns {boolean}
         */
        export function isArray(value:any):boolean {
            return toString.call(value) === '[object Array]';
        }


        /**
         * hump to
         * @param str
         * @returns {string}
         */
        export function humpSplit(str) {
            return str.replace(/([A-Z])/g, "-$1").toLowerCase();
        }


        /**
         * 生成className
         * @param object
         * @param suffix
         * @returns {string}
         */
        export function generateClassName(object:Object, suffix?:string):string {
            return name.toLowerCase() + humpSplit(getClassName(object)) + (suffix ? '-' + suffix : '');
        }

        /**
         * 获取类名
         * @param obj
         * @returns {string}
         */
        export function getClassName(obj:any):string {
            if (obj && obj.constructor) {
                var strFun = obj.constructor.toString();
                var className = strFun.substr(0, strFun.indexOf('('));
                className = className.replace('function', '');
                return className.replace(/(^\s*)|(\s*$)/ig, '');
            }
            return typeof(obj);
        }

        /**
         * 首字母大写
         * @param str
         * @returns {string}
         */
        export function capitalize(str:string):string {
            return String(str.charAt(0)).toUpperCase() + String(str.substr(1));
        }
    }


    /**
     * Stock Data Module
     */
    export module StockData {

        /**
         * Data 接口
         */
        export interface DataInterface {
            start:number;
            end:number;
            high:number;
            low:number;
            open:number;
            close:number;
            price:number;
        }

        /**
         * Data 容器
         */
        export class DataContainer {

            _stock:Stock;
            _defaultDataName:string;
            _originData:{[name:string]:Object[]} = {};
            _data:{[name:string]:DataInterface[]} = {};

            /**
             * Constructor
             *
             * @param stock
             */
            constructor(stock:Stock) {
                this._stock = stock;
            }

            /**
             * 默认的格式化数据
             *
             * @param data
             * @returns DataInterface[]
             */
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


            dataChange():DataContainer {

                var stock = this._stock,
                    xScale = stock.getXScale(),
                    yScale = stock.getYScale();

                xScale.domain(this.getXdomain());
                yScale.domain(this.getYdomain());

                stock.isZoom() && stock.getZoom().x(xScale);

                return this;
            }


            /**
             * 添加一个数据
             *
             * 会保留原始数据和格式化后数据
             *
             * @param options
             * @returns {Asgard.StockData.DataContainer}
             */
            addData(options:StockDataOptionsInterface):DataContainer {

                if (options.isDefault) {
                    this._defaultDataName = options.name;
                }

                if (!this._defaultDataName) {
                    this._defaultDataName = options.name;
                }

                this._originData[options.name] = options.data;
                this._data[options.name] = this.format(options.data);

                this.dataChange();

                return this;
            }

            /**
             * 移除数据 ,不允许删除默认数据
             *
             * 如果数据是defaultDataName 则删除defaultDataName
             * @param name
             * @returns {Asgard.StockData.DataContainer}
             */
            removeData(name:string):DataContainer {

                delete this._data[name];
                delete this._originData[name];

                this.dataChange();

                return this;
            }

            /**
             * 根据name获取数据
             *
             * @param name
             * @returns {DataInterface[]}
             */
            getDataByName(name:string):DataInterface[] {
                return this._data[name];
            }


            /**
             * 获取格式化后数据
             *
             * @returns {{}}
             */
            getData():{[name:string]:DataInterface[]} {
                return this._data;
            }

            /**
             * 获取默认数据名
             *
             * @returns {string}
             */
            getDefaultDataName():string {
                return this._defaultDataName;
            }

            /**
             * 获取默认数据
             *
             * @returns {DataInterface[]}
             */
            getDefaultData():DataInterface[] {
                return this._data[this._defaultDataName];
            }

            /**
             * 获取原始数据
             *
             * @param name
             * @returns {Object[]}
             */
            getOriginData(name:string):Object[] {
                return this._originData[name];
            }

            /**
             * 获取数据显示的数量
             *
             * 如果Stock可进行缩放，无需将所有数据显示在可视范围内
             *
             * @returns {number}
             */
            getShowCount():number {

                var width = this._stock.getWidth(),
                    right = this._stock.getMargin().left,
                    left = this._stock.getMargin().right;

                return (width - right - left) / 15;
            }

            /**
             * 获取x的domain
             *
             * x轴一般对应的是Date,Stock限制只能有相同的interval的数据，所以不需要考虑多个数据源的domain,
             * 使用默认的数据，如果可以缩放，截取下数据,因为不需要将数据全部展现出来
             *
             * @returns {Date[]}
             */
            getXdomain():Date[] {

                var data = this.getDataByName(this._defaultDataName);

                if (this._stock.isZoom()) {
                    data = Array.prototype.slice.apply(data, [0, this.getShowCount()]);
                }

                var date:Date[] = d3.extent<Date>(data.map((d:DataInterface):Date => {
                    return new Date(d.start);
                }));

                return this._disposeMinAndMaxDate(date);

            }

            /**
             * 处理最小最大时间
             *
             * 为了让数据显示不超出x可视范围，对最小和最大时间进行合适的修改
             *
             * @todo : 针对不同的interval,需要进行不同的修改
             *
             * @param date
             * @returns {Date[]}
             * @private
             */
            _disposeMinAndMaxDate(date:Date[]):Date[] {

                var minDate:Date = date[0],
                    maxDate:Date = date[1];

                minDate.setMinutes(minDate.getMinutes() - 2);
                maxDate.setMinutes(maxDate.getMinutes() + 2);

                return [minDate, maxDate];
            }

            /**
             * 处理最小和最大价格
             *
             * 为了让数据显示不超出y可视范围，对最小和最大价格进行合适的修改
             *
             * @param price
             * @private
             */
            _disposeMinAndMaxPrice(price:number[]):number[] {

                var min = price[0],
                    max = price[1],
                    diff = (max - min) * 0.1;

                return [
                    min - diff,
                    max + diff
                ];
            }


            /**
             * 获取y的domain
             *
             * 通过xdomain,来获取数据范围，然后获取可是范围内的最高和最低值
             *
             * @todo: 如果数据有多个，并且价格差距很大，需要考虑以%的形式
             *
             * @returns {number[]}
             */
            getYdomain():number[] {

                var xDomain = this._stock.getXScale().domain(),
                    data = this._stock.getDataContainer().getDataByDateRange(xDomain[0], xDomain[1]);

                if (this._stock.isZoom()) {

                    for (var name in data) {
                        data[name] = Array.prototype.slice.apply(data[name], [0, this.getShowCount()]);
                    }

                }


                return this.getMinAndMaxPrice(data);

            }

            /**
             * 获取数据最大和最小时间
             *
             * 使用默认的数据就可以
             *
             * @returns {Date[]}
             */
            getMinAndMaxDate():Date[] {
                return this._disposeMinAndMaxDate(d3.extent(this.getDefaultData().map((d:DataInterface) => {
                    return new Date(d.start);
                })));
            }


            /**
             * 根据时间获取最接近的那条数据
             *
             * @param date
             * @returns {Asgard.StockData.DataInterface}
             */
            getNearDataByDate(date:Date) {

                var data:DataInterface[] = this._data[this._defaultDataName],
                    l:number = data.length,
                    i:number,
                    left:number,
                    time = date.getTime();


                // 数据是从新到旧,找比当前时间小的时间，找到说明当前时间左边的值找到
                for (i = 0; i < l; i++) {
                    if (left === undefined && data[i].start < time) {
                        left = i;
                        break;
                    }
                }

                // 如果左边的值找不到，可能当前时间已经是最后条数据了,直接放回最后条数据
                if (left === undefined) {
                    return data[l - 1];
                }

                // 找当前时间的右边值
                var right = left - 1;

                // 当前已经在最右边了
                if (right < 0) {
                    return data[left];
                }

                // 比较左边和右边的数据，哪个比较接近当前时间，则返回哪个
                var leftData:DataInterface = data[left],
                    rightData:DataInterface = data[right];

                if (time - leftData.start < rightData.start - time) {
                    return leftData;
                } else {
                    return rightData;
                }

            }

            /**
             * 获取当前价格
             *
             * @returns {number}
             */
            getCurrentPrice():number {

                var currentData = this.getDefaultData()[0];

                return currentData.close > currentData.open ? currentData.close : currentData.open;

            }


            /**
             * 获取一个时间范围内的所有数据
             *
             * 如果有多个数据，不同数据要区分
             *
             * @param gtValue
             * @param ltValue
             * @returns {{}}
             */
            getDataByDateRange(gtValue:any, ltValue:any):Object {

                var data = {}, emptyCount = 0, dataCount = 0;

                for (var name in this._data) {

                    data[name] = [];

                    this._data[name].forEach((d:DataInterface):void=> {
                        if (d.start >= gtValue && d.start <= ltValue) {
                            data[name].push(d);
                        }
                    });

                    if (data[name].length === 0) {
                        emptyCount++;
                    }

                    dataCount++;
                }


                // 所有数据都为空,则不判断范围返回所有数据
                if (emptyCount === dataCount) {
                    return this._data;
                }


                return data;
            }


            /**
             * 获取数据内的最高和最低价格
             *
             * @todo:如果数据有多个，需要使用百分比计算
             *
             * @param data
             * @returns {any[]}
             */
            getMinAndMaxPrice(data:Object):number[] {

                var allData = [], min, max;

                // @todo:这里不应该合并多个数据
                for (var key in data) {
                    allData = allData.concat(data[key]);
                }

                min = d3.min(allData, (d:DataInterface):number => {
                    return d.low;
                });

                max = d3.max(allData, (d:DataInterface):number => {
                    return d.high;
                });

                // 去掉该功能，考虑到最高价和最低价可能差太多而显示不正常
                // 为了组件currentPriceLine考虑，最低价不能高于当前价格，最高价也不能低于当前价格
                // var currentPrice = this.getCurrentPrice();
                // min = Math.min(min,currentPrice);
                // max = Math.max(max,currentPrice);

                return this._disposeMinAndMaxPrice([min, max]);


            }

            /**
             * 获取数据的所有names
             *
             * @returns {string[]}
             */
            getDataNames():string[]{
                return d3.keys(this._data);
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

                // @todo : 是否要考虑可以设置插入前还是插入后
                if (!container) {
                    container = this._stock
                        .getContainer('baseSvg')
                        .insert('g', ':first-child')
                        .classed(Util.generateClassName(this), true)
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
                this._d3Axis.scale(this._getScale(this._orient)).innerTickSize(0)
                    .outerTickSize(0)
                    .tickPadding(10)
                    .ticks(6);


                var key, values;
                for (key in options) {
                    values = options[key];
                    switch (key) {
                        case 'type':
                        case 'name':
                        case 'orient':
                        case 'scale':
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


                var selection:any = this._stock.getContainer(this._name).selectAll('g').data([this]);

                if (selection.empty()) {
                    selection = selection.enter().append('g');
                }

                selection.attr(this._getTransform(this._orient));

                selection.call(this._d3Axis);

                return this;

            }

            _getScale(orient):any {
                switch (orient) {
                    case 'bottom':
                    case 'top':
                        return this._stock.getXScale();
                        break;
                    case 'left':
                    case 'right':
                        return this._stock.getYScale();
                        break;
                }
            }

            _getTransform(orient) {

                var x,
                    y,
                    margin = this._stock.getMargin(),
                    width = this._stock.getWidth(),
                    height = this._stock.getHeight();

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

                this._stock.getContainer(this._name).attr('transform', 'translate(' + this._stock.getMargin().left + ',' + this._stock.getMargin().top + ')');

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

                var selection:any = this._stock
                    .getContainer(this._name)
                    .selectAll('line')
                    .data(this._getTicks(this._orient));

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

        export class Tips extends BaseComponent {

            _show(tips:Tips, stock:Stock, data:StockData.DataInterface) {

                //var showContainerName = tips.getName() + '-show',
                //    showContainer = stock.getContainer(showContainerName);
                //
                //if (!showContainer) {
                //    showContainer = stock.getContainer('baseSvg').append('g');
                //    stock.addContainer(showContainerName, showContainer);
                //}

                // @todo:......

            }

            _parseOptions(options:StockComponentOptionsInterface):ComponentInterface {

                Util.isFunction(options['show']) && (this._show = options['show']);

                return this;
            }

            // tips 需要显示在最前面，所以重写_createContainer方法
            _createContainer():ComponentInterface {

                var container = this._stock.getContainer(this._name);

                if (!container) {
                    container = this._stock
                        .getContainer('baseSvg')
                        .insert('g')
                        .classed(Util.generateClassName(this), true)
                        .classed(this._name, true);

                    this._stock.addContainer(this._name, container);
                }

                return this;
            }

            draw():ComponentInterface {

                var stock = this._stock,
                    tips = this,
                    xLine = stock.getContainer(this._name + '-x'),
                    yLine = stock.getContainer(this._name + '-y'),
                    xClassName = Util.generateClassName(this, 'x'),
                    yClassName = Util.generateClassName(this, 'y');


                if (!xLine) {
                    xLine = stock.getContainer(this._name).append('line').classed(xClassName, true);
                    stock.addContainer(this._name + '-x', xLine);
                }

                if (!yLine) {
                    yLine = stock.getContainer(this._name).append('line').classed(yClassName, true);
                    stock.addContainer(this._name + '-y', yLine);
                }

                this._stock.getContainer('baseSvg').on('mousemove', function () {

                    var x = d3.mouse(this)[0],
                        y = d3.mouse(this)[1],
                        margin = stock.getMargin(),
                        width = stock.getWidth(),
                        height = stock.getHeight(),
                        visibilityClass = stock.getVisibilityClass();

                    if (x < margin.left || x > (margin.left + width) || y < margin.top || y > (margin.top + height)) {
                        xLine.classed(visibilityClass, true);
                        yLine.classed(visibilityClass, true);
                        return;
                    }

                    var date = stock.getXScale().invert(x - margin.left);

                    var nearData = stock.getDataContainer().getNearDataByDate(date);

                    var nearDataX = stock.getXScale()(nearData.start) + margin.left;

                    xLine.attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y).classed(visibilityClass, false).attr('transform', 'translate(' + margin.left + ',0)');
                    yLine.attr('x1', nearDataX).attr('y1', 0).attr('x2', nearDataX).attr('y2', height).classed(visibilityClass, false).attr('transform', 'translate(0,' + margin.top + ')');

                    tips._show.call(this, tips, stock, nearData, d3.mouse(this), this);

                });

                return this;

            }
        }


        export class CurrentPriceLine extends BaseComponent {

            draw():ComponentInterface {

                var selection:any = this._stock.getContainer(this._name).selectAll('line').data([this]),
                    yScale = this._stock.getYScale();

                if (selection.empty()) {
                    selection = selection.enter().append('line');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('line');
                    }
                }


                var currentPrice = this._stock.getDataContainer().getCurrentPrice(),
                    margin = this._stock.getMargin(),
                    y = yScale(currentPrice) + margin.top;


                selection.attr("x1", margin.left)
                    .attr("y1", y)
                    .attr("x2", this._stock.getWidth() + margin.left)
                    .attr("y2", y).classed(this._stock.getHiddenClass(), y < margin.top || y > (margin.top + this._stock.getHeight()));

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
                        .append('g')
                        .classed(Util.generateClassName(this), true)
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

            _getSvgCoordinate(prevData:StockData.DataInterface, currentData:StockData.DataInterface):Object[] {

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

            _createSvg():D3.Svg.Line {
                return d3.svg.line().x(function (d) {
                    return d.x;
                }).y(function (d) {
                    return d.y;
                });
            }


            draw():ChartInterface {

                var svg = this._createSvg(),
                    data = this._stock.getDataContainer().getDataByName(this._dataName),
                    selection:any = this._stock.getContainer(this._name).selectAll('path').data(data);

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('path');
                    }
                }

                selection.attr('d', (d:StockData.DataInterface, i:number) => {
                    return svg(this._getSvgCoordinate(data[i + 1], d));
                });

                return this;

            }
        }

        export class Area extends Line {

            _createSvg():D3.Svg.Area {

                var yScale = this._stock.getYScale();

                return d3.svg.area().x((d):number => {
                    return d.x;
                }).y0(yScale(0)).y1((d):number => {
                    return d.y;
                });
            }

        }

        export class Ohlc extends BaseChart {

            _rectWidth:number;

            _parseOptions(options:StockChartOptionsInterface):ChartInterface {

                this._rectWidth = options['rectWidth'] || 4;
                return this;
            }

            _isUp(d:StockData.DataInterface):boolean {
                return d.close > d.open;
            }

            _isDown(d:StockData.DataInterface):boolean {
                return d.close < d.open;
            }

            _isConsolidation(d:StockData.DataInterface):boolean {
                return d.close === d.open;
            }

            getZoomRectWidth():number {

                var scale = 1;

                if (d3.event && d3.event.type === 'zoom') {
                    scale = d3.event.scale;
                }

                scale = Math.max(1, scale);
                //scale = Math.min(4, scale);

                return scale * this._rectWidth;
            }


            setRectWidth(rectWidth:number):ChartInterface {
                this._rectWidth = rectWidth;
                return this;
            }

            getRectWidth():number {
                return this._rectWidth;
            }
        }

        export class Candle extends Ohlc {

            _drawHighLowLine():ChartInterface {

                var selection:any = this._stock.getContainer(this._name)
                    .selectAll('path')
                    .data(
                    this._stock.getDataContainer().getDataByName(this._dataName)
                    , (d:StockData.DataInterface):number => {
                        return d.start;
                    }
                );

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('path');
                    }
                }

                selection.attr('d', this._highLowline()).classed(Util.generateClassName(this, 'high-low-line'), true);
                return this;
            }

            _drawCandleRect():ChartInterface {
                var selection:any = this._stock.getContainer(this._name)
                    .selectAll('rect')
                    .data(
                    this._stock.getDataContainer().getDataByName(this._dataName),
                    (d:StockData.DataInterface):number=> {
                        return d.start;
                    }
                );


                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('rect');
                    }
                }

                var xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale(),
                    RectWidth = this.getZoomRectWidth();

                selection
                    .attr('x', (d:StockData.DataInterface):number => {
                        return xScale(new Date(d.start)) - RectWidth / 2;
                    })
                    .attr('y', (d:StockData.DataInterface):number => {
                        return this._isUp(d) ? yScale(d.close) : yScale(d.open);
                    })
                    .attr('width', RectWidth)
                    .attr('height', ((d:StockData.DataInterface):number => {
                        var height = this._isUp(d) ? yScale(d.open) - yScale(d.close) : yScale(d.close) - yScale(d.open);

                        return Math.max(height, 1);
                    }))
                    .classed(Util.generateClassName(this, 'rect'), true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;
            }

            draw():ChartInterface {

                this._drawHighLowLine();
                this._drawCandleRect();

                return this;

            }

            _highLowline() {
                var d3Line = d3.svg.line()
                        .x((d:{x:number;y:number}) => {
                            return d.x;
                        })
                        .y((d:{x:number;y:number}) => {
                            return d.y;
                        }),
                    xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale();


                return (d:StockData.DataInterface):any => {
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
        }

        export class HollowCandle extends Candle {

            _drawHighLine():ChartInterface {

                var className = Util.generateClassName(this, 'high-line'),
                    selection:any = this._stock.getContainer(this._name)
                        .selectAll('path.' + className)
                        .data(
                        this._stock.getDataContainer().getDataByName(this._dataName)
                        , (d:StockData.DataInterface):number => {
                            return d.start;
                        }
                    );

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('path');
                    }
                }

                selection.attr('d', this._highLine()).classed(className, true);
                return this;
            }

            _lowLine() {
                var d3Line = d3.svg.line()
                        .x((d:{x:number;y:number}) => {
                            return d.x;
                        })
                        .y((d:{x:number;y:number}) => {
                            return d.y;
                        }),
                    xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale();


                return (d:StockData.DataInterface):any => {
                    return d3Line([
                        {
                            x: xScale(new Date(d.start)),
                            y: yScale(Math.min(d.close, d.open))
                        },
                        {
                            x: xScale(new Date(d.start)),
                            y: yScale(d.low)
                        }
                    ]);
                };
            }

            _highLine() {
                var d3Line = d3.svg.line()
                        .x((d:{x:number;y:number}) => {
                            return d.x;
                        })
                        .y((d:{x:number;y:number}) => {
                            return d.y;
                        }),
                    xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale();


                return (d:StockData.DataInterface):any => {
                    return d3Line([
                        {
                            x: xScale(new Date(d.start)),
                            y: yScale(d.high)
                        },
                        {
                            x: xScale(new Date(d.start)),
                            y: yScale(Math.max(d.close, d.open))
                        }
                    ]);
                };
            }

            _drawLowLine():ChartInterface {

                var className = Util.generateClassName(this, 'low-line'),
                    selection:any = this._stock.getContainer(this._name)
                        .selectAll('path.' + className)
                        .data(
                        this._stock.getDataContainer().getDataByName(this._dataName)
                        , (d:StockData.DataInterface):number => {
                            return d.start;
                        }
                    );

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('path');
                    }
                }

                selection.attr('d', this._lowLine()).classed(className, true);

                return this;
            }

            draw():ChartInterface {

                this._drawHighLine();
                this._drawLowLine();
                this._drawCandleRect();

                return this;

            }
        }

        export class Bars extends Ohlc {

            _drawCloseRect():ChartInterface {

                var className = Util.generateClassName(this, 'close-rect'),
                    selection:any = this._stock.getContainer(this._name)
                        .selectAll('rect.' + className)
                        .data(
                        this._stock.getDataContainer().getDataByName(this._dataName),
                        (d:StockData.DataInterface):number=> {
                            return d.start;
                        }
                    );

                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('rect');
                    }
                }

                var xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale(),
                    RectWidth = this.getZoomRectWidth();

                selection
                    .attr('x', (d:StockData.DataInterface):number => {

                        var x = xScale(new Date(d.start));

                        if (this._isUp(d)) {
                            x -= RectWidth + RectWidth / 2;
                        } else {
                            x -= RectWidth - RectWidth / 2;
                        }
                        return x;


                    })
                    .attr('y', (d:StockData.DataInterface):number => {

                        var y;

                        if (this._isUp(d)) {
                            y = yScale(d.open);
                        } else {
                            y = yScale(d.close);
                        }


                        return y;

                    })
                    .attr('width', RectWidth * 2)
                    .attr('height', ((d:StockData.DataInterface):number => {
                        return RectWidth;
                    }))
                    .classed(className, true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;

            }

            _drawOpenRect():ChartInterface {

                var className = Util.generateClassName(this, 'open-rect'),
                    selection:any = this._stock.getContainer(this._name)
                        .selectAll('rect.' + className)
                        .data(
                        this._stock.getDataContainer().getDataByName(this._dataName),
                        (d:StockData.DataInterface):number=> {
                            return d.start;
                        }
                    );

                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('rect');
                    }
                }

                var xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale(),
                    RectWidth = this.getZoomRectWidth();

                selection
                    .attr('x', (d:StockData.DataInterface):number => {

                        var x = xScale(new Date(d.start));

                        if (this._isDown(d)) {
                            x -= RectWidth + RectWidth / 2;
                        } else {
                            x -= RectWidth - RectWidth / 2;
                        }
                        return x;

                    })
                    .attr('y', (d:StockData.DataInterface):number => {

                        var y;

                        if (this._isDown(d)) {
                            y = yScale(d.open);
                        } else {
                            y = yScale(d.close);
                        }


                        return y;
                    })
                    .attr('width', RectWidth * 2)
                    .attr('height', ((d:StockData.DataInterface):number => {
                        return RectWidth;
                    }))
                    .classed(className, true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;

            }

            _drawHighLowRect():ChartInterface {
                var className = Util.generateClassName(this, 'high-low-rect'),
                    selection:any = this._stock.getContainer(this._name)
                        .selectAll('rect.' + className)
                        .data(
                        this._stock.getDataContainer().getDataByName(this._dataName),
                        (d:StockData.DataInterface):number=> {
                            return d.start;
                        }
                    );

                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('rect');
                    }
                }

                var xScale = this._stock.getXScale(),
                    yScale = this._stock.getYScale(),
                    RectWidth = this.getZoomRectWidth();

                selection
                    .attr('x', (d:StockData.DataInterface):number => {
                        return xScale(new Date(d.start)) - RectWidth / 2;
                    })
                    .attr('y', (d:StockData.DataInterface):number => {
                        return yScale(d.high);
                    })
                    .attr('width', RectWidth)
                    .attr('height', ((d:StockData.DataInterface):number => {
                        var height = yScale(d.low) - yScale(d.high);
                        return Math.max(height, 1);
                    }))
                    .classed(className, true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;
            }

            draw():ChartInterface {

                this._drawHighLowRect();
                this._drawOpenRect();
                this._drawCloseRect();
                return this;
            }
        }

    }

    // stock start
    export class Stock {

        private _width:number;
        private _height:number;
        private _margin:StockMarginOptionsInterface = {left: 50, top: 50, bottom: 50, right: 75};
        private _interval:string = '1D';
        private _xScale:any;
        private _yScale:any;
        private _containers:Object = {};
        private _components:Object = {};
        private _charts:Object = {};
        private _dataContainer;
        private _isZoom:boolean;
        private _zoom:D3.Behavior.Zoom;
        private _sync:Stock[] = [];
        private _hiddenClass:string = name + '-hide';
        private _visibilityClass:string = name + '-visibility-hidden';
        private _debug:boolean = false;
        private _selection:D3.Selection;
        private _isResize:boolean = false;
        private _zoomEvent:() => void = nullFunction;
        private _resizeEvent:() => void = nullFunction;

        constructor(selection:any, options:any) {

            this._selection = this._convertSelection(selection);

            // 重要的options
            options.debug && (this._debug = options.debug);
            options.margin && (this._margin = options.margin);

            this.setWidth(options.width);
            this.setHeight(options.height);

            options.isResize && (this._isResize = options.isResize);
            options.resizeEvent && Util.isFunction(options.resizeEvent) && (this._resizeEvent = options.resizeEvent);
            options.isZoom && (this._isZoom = options.isZoom);
            options.zoomEvent && Util.isFunction(options.zoomEvent) && (this._zoomEvent = options.zoomEvent)

            // 使用setInterval,可以对zoom进行一些设置
            options.interval && (this.setInterval(options.interval));

            this._initContainer();
            this._initScale();
            this._isZoom && this._initZoom();
            this._isResize && this._initResize();

            Util.isArray(options.components) && options.components.forEach((component) => this.addComponent(component));
            Util.isArray(options.charts) && options.charts.forEach((chart) => this.addChart(chart));
            Util.isArray(options.data) && options.data.forEach((data) => this.addData(data));


        }


        /**
         * 将选择器转换成d3.selection
         *
         * @param selection
         * @returns {any}
         * @private
         */
        private _convertSelection(selection:any):D3.Selection {
            return selection instanceof d3.selection ? selection : d3.select(selection);
        }

        /**
         * 对zoom中的drag事件进行限制
         *
         * 当drag到最右或最左时，阻止d3.zoom的mousemove，防止drag到无数据区域
         *
         * @todo : 有个bug,如果大幅度drag到svg外部，zoom事件就无法阻止，应该是d3的问题
         *
         * @returns {Asgard.Stock}
         * @private
         */
        private _zoomDragLimit():Stock {

            var baseSvg = this.getContainer('baseSvg'),
                stock = this,
                dragged = false,
                startX;

            baseSvg.addEventListener('mousedown', function () {
                dragged = true;
                startX = d3.mouse(this)[0];

                var windowSelection = d3.select(window);

                var mouseupListener = function () {
                    dragged = false;
                    windowSelection['removeEventListener']('mouseup', mouseupListener);
                }

                windowSelection['addEventListener']('mouseup', mouseupListener);

            });


            baseSvg.addEventListener('mousemove', function () {

                // @todo 如果未draw。。getDataContainer会出问题

                var moveX = d3.mouse(this)[0],
                    domain = stock.getXScale().domain(),
                    minAndMaxDate = stock.getDataContainer().getMinAndMaxDate(),
                    minDate = minAndMaxDate[0],
                    maxDate = minAndMaxDate[1];

                // 当前的时间小于数据的最小时间，并且drag方向是往左
                if (domain[0] < minDate && startX < moveX) {
                    d3.event.stopPropagation();
                }

                // 当前的时间大于数据的最大时间，并且drag方向是往右
                if (domain[1] > maxDate && startX > moveX) {
                    d3.event.stopPropagation()
                }

            });

            return this;
        }

        private _initZoom():Stock {

            this._zoom = d3.behavior.zoom();

            this.getContainer('baseSvg').call(this._zoom);

            this._zoomDragLimit();

            // y 不需要缩放
            this._zoom.x(this._xScale);
            this._zoom.on('zoom', ()=> {

                // y 不缩放，所以计算当前范围内的最高和最低价格
                this._yScale.domain(this._dataContainer.getYdomain());

                // 触发自定义事件
                this._zoomEvent.call(this, d3.event);

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


            });


            return this;
        }

        private _initContainer():Stock {

            var baseSvgContainer = this.getContainer('baseSvg'),
                dataContainer = this.getContainer('data'),
                dataClipContainer = this.getContainer('dataClip'),
                dataClipPathContainer = this.getContainer('dataClipPath'),
                margin = this.getMargin();

            if (!baseSvgContainer) {
                baseSvgContainer = this.getSelection().append('svg');
                this.addContainer('baseSvg', baseSvgContainer);
            }

            baseSvgContainer.attr({
                width: this.getWidth() + margin.left + margin.right,
                height: this.getHeight() + margin.top + margin.bottom
            });


            if (!dataContainer) {
                dataContainer = baseSvgContainer.append('g');
                this.addContainer('data', dataContainer);
            }

            dataContainer.attr({
                transform: 'translate(' + margin.left + ',' + margin.top + ')',
                width: this.getWidth(),
                height: this.getHeight()
            });


            if (!dataClipContainer) {
                dataClipContainer = dataContainer.append('g').attr('clip-path', 'url(#plotAreaClip)');
                this.addContainer('dataClip', dataClipContainer);
            }

            if (!dataClipPathContainer) {
                dataClipPathContainer = dataClipContainer.append('clipPath').attr('id', 'plotAreaClip').append('rect');
                this.addContainer('dataClipPath', dataClipPathContainer);
            }

            dataClipPathContainer.attr({
                width: this.getWidth(),
                height: this.getHeight()
            });

            return this;
        }

        private _initScale():Stock {

            if (!this._xScale) {
                this._xScale = d3.time.scale();
            }
            this._xScale.range([0, this._width]);

            if (!this._yScale) {
                this._yScale = d3.scale.linear();
            }
            this._yScale.rangeRound([this._height, 0]);

            return this;
        }

        _initResize():Stock {

            var stock = this;

            d3.select(window)['addEventListener']('resize', function () {

                stock.setHeight(stock.getSelection().node().clientHeight);
                stock.setWidth(stock.getSelection().node().clientWidth);
                stock._initContainer()._initScale();
                stock.getDataContainer().dataChange();

                stock._resizeEvent.call(this, d3.event);

                stock.draw();
            });

            return this;

        }

        zoom(callback:() => void):Stock {
            this._zoomEvent = callback;
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
            this._width = (width || (this.getSelection().node().clientWidth || document.documentElement.clientWidth)) - this._margin.left - this._margin.right;
            return this;
        }

        getWidth():number {

            return this._width;

        }

        setHeight(height:number):Stock {

            this._height = (height || (this.getSelection().node().clientHeight || document.documentElement.clientHeight)) - this._margin.top - this._margin.bottom;

            return this;
        }

        getSelection():D3.Selection {
            return this._selection;
        }

        getHeight():number {
            return this._height;

        }

        setInterval(interval:string):Stock {

            this._interval = interval;

            var scaleExtend;

            switch (this._interval) {
                case '1':
                    scaleExtend = [1, 3];
                    break;
            }

            this._zoom.scaleExtent(scaleExtend);

            return this;
        }

        getComponents():Object {
            return this._components;
        }

        getCharts():Object {
            return this._charts;
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

        setIsZoom(isZoom:boolean):Stock {
            this._isZoom = isZoom;
            this._isZoom && this._initZoom();
            return this;
        }

        isZoom():boolean {
            return this._isZoom;
        }

        getZoom():D3.Behavior.Zoom {
            return this._zoom;
        }

        getZoomEvent():() => void {
            return this._zoomEvent;
        }

        clearData():Stock {

            // 清除数据，清除all charts，清除对应的container
            this._dataContainer = new StockData.DataContainer(this);

            for (var name in this._charts) {
                this._containers[name].remove();
                delete this._containers[name];
            }

            this._charts = {};

            return this;
        }

        getDataContainer():StockData.DataContainer {
            return this._dataContainer;
        }

        getHiddenClass():string {
            return this._hiddenClass;
        }

        getVisibilityClass():string {
            return this._visibilityClass;
        }

        setVisibilityClass(visibilityClass:string):Stock {
            this._visibilityClass = visibilityClass;
            return this;
        }

        containerIsHide(name:string):boolean {

            return this._containers[name].classed(this._hiddenClass);
        }

        hideContainer(name:string):Stock {

            this._containers[name].classed(this._hiddenClass, true);

            return this;
        }


        removeContainer(name:string):Stock {
            this._containers[name].remove();
            delete this._containers[name];
            return this;
        }

        showContainer(name:string):Stock {

            this._containers[name].classed(this._hiddenClass, false);

            return this;
        }

        toggleContainer(name:string):Stock {
            this._containers[name].classed(this._hiddenClass, !this.hideContainer(name));
            return this;
        }

        isDebug():boolean {
            return this._debug;
        }

        setDebug(debug:boolean):Stock {
            this._debug = debug;
            return this;
        }

        removeComponent(name:string):Stock {

            this.removeContainer(name);

            delete this._components[name];

            return this;
        }


        removeData(name:string):Stock {

            // 默认数据肯定不能删除
            if (this._dataContainer.getDefaultDataName() === name) {

                if (this.isDebug()) {
                    throw new Error('默认数据 ' + name + ' 无法删除');
                }

                return this;
            }

            // 删除数据对应的chart
            for (var chartName in this._charts) {
                if (this._charts[chartName].getDataName() === name) {
                    this.removeChart(chartName);
                }
            }

            this._dataContainer.removeData(name);

            return this;
        }


        /**
         * 移除chart,并且移除非默认的未使用到的数据
         *
         * @param name
         * @returns {Asgard.Stock}
         */
        removeChart(name:string):Stock {

            var dataName = this._charts[name].getDataName(),
                defaultName = this._dataContainer.getDefaultDataName(),
                hasOtherUse = false;

            // 检查除了自己以外的chart是否还有用该dataName
            for (var chartName in this._charts) {
                if (chartName !== name && this._charts[chartName].getDataName() === dataName) {
                    hasOtherUse = true;
                    break;
                }
            }

            // 如果是defaultName，并且不存在其他chart,该chart不能删除
            if (dataName === defaultName) {

                // 不存在其他chart,该chart不能删除
                if (!hasOtherUse) {

                    if (this.isDebug()) {
                        throw new Error('名字为' + name + '的Chart绑定了默认的数据(' + defaultName + ')，且默认数据没有与其他的Chart绑定，Chart无法删除');
                    }

                    return this;
                }

            }

            // 先删除当前chart,为后续删除数据removeData做准备
            delete this._charts[name];
            this.removeContainer(name);

            // 如果数据不是defaultName,并且不存在其他chart,可以删除数据
            if (dataName !== defaultName && !hasOtherUse) {
                // removeData中也有调用removeChart,不过已经没有其他chart引用该dataName,所以不会有死循环调用
                this.removeData(dataName);
            }

            return this;
        }

        getResizeEvent():() => void {
            return this._resizeEvent;
        }

        isResize():boolean {
            return this._isResize;
        }

        setIsResize(resize:boolean):Stock {
            this._isResize = resize;
            this._isResize && this._initResize();
            return this;
        }

        resize(callback:()=>{}):Stock {
            this._resizeEvent = callback;
            return this;
        }

        getDataNames():string[]{
            return this.getDataContainer().getDataNames();
        }
        getContainerNames():string[]{
            return d3.keys(this.getContainers()).filter((name:string):boolean=>{
                switch (name) {
                    case 'baseSvg':
                    case 'data':
                    case 'dataClip':
                    case 'dataClipPath':
                        return false;
                        break;
                    default:
                        return true;
                }
            });
        }

        getChartNames():string[]{
            return d3.keys(this.getCharts());
        }

        getComponentNames():string[]{
            return d3.keys(this.getComponents());
        }

        getComponent(name:string):StockComponent.ComponentInterface{
            return this._components[name];
        }
    }

}