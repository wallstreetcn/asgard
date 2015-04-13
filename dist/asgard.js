/// <reference path="../typings/d3/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Asgard;
(function (Asgard) {
    /**
     * 库名
     *
     * @type {string}
     */
    Asgard.name = 'asgard';
    /**
     * 版本号
     * @type {string}
     */
    Asgard.version = '0.0.1';
    /**
     * Util Module
     */
    var Util;
    (function (Util) {
        var toString = Object.prototype.toString;
        /**
         * 判断是否是数组
         * @param value
         * @returns {boolean}
         */
        function isArray(value) {
            return toString.call(value) === '[object Array]';
        }
        Util.isArray = isArray;
        /**
         * 生成className
         * @param object
         * @param suffix
         * @returns {string}
         */
        function generateClassName(object, suffix) {
            return Asgard.name.toLowerCase() + '-' + getClassName(object).toLowerCase() + (suffix ? '-' + suffix : '');
        }
        Util.generateClassName = generateClassName;
        /**
         * 获取类名
         * @param obj
         * @returns {string}
         */
        function getClassName(obj) {
            if (obj && obj.constructor) {
                var strFun = obj.constructor.toString();
                var className = strFun.substr(0, strFun.indexOf('('));
                className = className.replace('function', '');
                return className.replace(/(^\s*)|(\s*$)/ig, '');
            }
            return typeof (obj);
        }
        Util.getClassName = getClassName;
        /**
         * 首字母大写
         * @param str
         * @returns {string}
         */
        function capitalize(str) {
            return String(str.charAt(0)).toUpperCase() + String(str.substr(1));
        }
        Util.capitalize = capitalize;
    })(Util = Asgard.Util || (Asgard.Util = {}));
    /**
     * Stock Data Module
     */
    var StockData;
    (function (StockData) {
        /**
         * Data 容器
         */
        var DataContainer = (function () {
            /**
             * Constructor
             *
             * @param stock
             */
            function DataContainer(stock) {
                this._originData = {};
                this._data = {};
                this._stock = stock;
            }
            /**
             * 默认的格式化数据
             *
             * @param data
             * @returns {{start: number, end: number, high: any, low: any, open: any, close: any, price: any, volume: any}[]}
             */
            DataContainer.prototype.format = function (data) {
                return data.map(function (d) {
                    return {
                        start: d['start'] * 1000,
                        end: d['end'] * 1000,
                        high: d['high'],
                        low: d['low'],
                        open: d['open'],
                        close: d['close'],
                        price: d['price'],
                        volume: d['price']
                    };
                });
            };
            /**
             * 添加一个数据
             *
             * 会保留原始数据和格式化后数据
             *
             * @param options
             * @returns {Asgard.StockData.DataContainer}
             */
            DataContainer.prototype.addData = function (options) {
                if (options.isDefault) {
                    this._defaultName = options.name;
                }
                if (!this._defaultName) {
                    this._defaultName = options.name;
                }
                this._originData[options.name] = options.data;
                this._data[options.name] = this.format(options.data);
                return this;
            };
            /**
             * 获取数据
             *
             * @param name
             * @returns {DataInterface[]}
             */
            DataContainer.prototype.getData = function (name) {
                return this._data[name];
            };
            /**
             * 获取原始数据
             *
             * @param name
             * @returns {Object[]}
             */
            DataContainer.prototype.getOriginData = function (name) {
                return this._originData[name];
            };
            /**
             * 获取数据显示的数量
             *
             * 如果Stock可进行缩放，无需将所有数据显示在可视范围内
             *
             * @returns {number}
             */
            DataContainer.prototype.getShowCount = function () {
                var width = this._stock._width, right = this._stock._margin.left, left = this._stock._margin.right;
                return (width - right - left) / 15;
            };
            /**
             * 获取x的domain
             *
             * x轴一般对应的是Date,Stock限制只能有相同的interval的数据，所以不需要考虑多个数据源的domain,
             * 使用默认的数据，如果可以缩放，截取下数据,因为不需要将数据全部展现出来
             * 为了让数据显示不超出可视范围，数据计算出来的范围进行合适的修改
             *
             * @returns {Date[]}
             */
            DataContainer.prototype.getXdomain = function () {
                var data = this.getData(this._defaultName);
                if (this._stock.isZoom()) {
                    data = Array.prototype.slice.apply(data, [0, this.getShowCount()]);
                }
                var date = d3.extent(data.map(function (d) {
                    return new Date(d.start);
                }));
                var minDate = date[0], maxDate = date[1];
                minDate.setMinutes(minDate.getMinutes() - 2);
                maxDate.setMinutes(maxDate.getMinutes() + 2);
                return [minDate, maxDate];
            };
            /**
             * 获取y的domain
             *
             * 通过xdomain,来获取数据范围，然后获取可是范围内的最高和最低值
             *
             * @todo: 如果数据有多个，并且价格差距很大，需要考虑以%的形式
             *
             * @returns {number[]}
             */
            DataContainer.prototype.getYdomain = function () {
                var xDomain = this._stock.getXScale().domain(), data = this._stock.getDataContainer().getDataByDateRange(xDomain[0], xDomain[1]);
                if (this._stock.isZoom()) {
                    for (var name in data) {
                        data[name] = Array.prototype.slice.apply(data[name], [0, this.getShowCount()]);
                    }
                }
                return this.getMinAndMaxPrice(data);
            };
            /**
             * 根据时间获取最接近的那条数据
             *
             * @param date
             * @returns {Asgard.StockData.DataInterface}
             */
            DataContainer.prototype.getNearDataByDate = function (date) {
                var data = this._data[this._defaultName], l = data.length, i, left, time = date.getTime();
                // 数据是从新到旧,找比当前时间小的时间，找到说明当前时间左边的值找到
                for (i = 0; i < l; i++) {
                    if (left === undefined && data[i].start < time) {
                        left = i;
                        break;
                    }
                }
                // 如果左边的值找不到，可能当前时间已经是最后条数据了,直接放回最后条数据
                if (left === undefined) {
                    return data[data.length - 1];
                }
                // 找当前时间的右边值
                var right = left - 1;
                // 当前已经在最右边了
                if (right < 0) {
                    return data[left];
                }
                // 比较左边和右边的数据，哪个比较接近当前时间，则返回哪个
                var leftData = data[left], rightData = data[right];
                if (time - leftData.start < rightData.start - time) {
                    return leftData;
                }
                else {
                    return rightData;
                }
            };
            /**
             * 获取一个时间范围内的所有数据
             *
             * 如果有多个数据，不同数据要区分
             *
             * @param gtValue
             * @param ltValue
             * @returns {{}}
             */
            DataContainer.prototype.getDataByDateRange = function (gtValue, ltValue) {
                var data = {};
                for (var name in this._data) {
                    data[name] = [];
                    this._data[name].forEach(function (d) {
                        if (d.start >= gtValue && d.start <= ltValue) {
                            data[name].push(d);
                        }
                    });
                }
                return data;
            };
            /**
             * 获取数据内的最高和最低价格
             *
             * @todo:如果数据有多个，需要使用百分比计算
             *
             * @param data
             * @returns {any[]}
             */
            DataContainer.prototype.getMinAndMaxPrice = function (data) {
                var allData = [], min, max, diff;
                for (var key in data) {
                    allData = allData.concat(data[key]);
                }
                min = d3.min(allData, function (d) {
                    return d.low;
                });
                max = d3.max(allData, function (d) {
                    return d.high;
                });
                diff = (max - min) * 0.1;
                return [
                    min - diff,
                    max + diff
                ];
            };
            return DataContainer;
        })();
        StockData.DataContainer = DataContainer;
    })(StockData = Asgard.StockData || (Asgard.StockData = {}));
    /**
     * Stock Component
     */
    var StockComponent;
    (function (StockComponent) {
        var BaseComponent = (function () {
            function BaseComponent(options, stock) {
                this._stock = stock;
                this._name = options.name;
                this._init();
                this._createContainer();
                this._parseOptions(options);
            }
            BaseComponent.prototype._init = function () {
                return this;
            };
            BaseComponent.prototype._parseOptions = function (options) {
                return this;
            };
            BaseComponent.prototype._createContainer = function () {
                var container = this._stock.getContainer(this._name);
                if (!container) {
                    container = this._stock
                        .getContainer('baseSvg')
                        .insert('g', ':first-child')
                        .classed(Util.generateClassName(this), true)
                        .classed(this._name, true);
                    this._stock.addContainer(this._name, container);
                }
                return this;
            };
            BaseComponent.prototype.draw = function () {
                return this;
            };
            BaseComponent.prototype.getStock = function () {
                return this._stock;
            };
            BaseComponent.prototype.getName = function () {
                return this._name;
            };
            return BaseComponent;
        })();
        StockComponent.BaseComponent = BaseComponent;
        var Axis = (function (_super) {
            __extends(Axis, _super);
            function Axis() {
                _super.apply(this, arguments);
            }
            Axis.prototype._init = function () {
                if (!this._d3Axis) {
                    this._d3Axis = d3.svg.axis();
                }
                return this;
            };
            Axis.prototype._parseOptions = function (options) {
                // set orient
                this.setOrient(options['orient']);
                // set default
                this._d3Axis.scale(this._getScale(this._orient))
                    .innerTickSize(0)
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
            };
            Axis.prototype.setOrient = function (orient) {
                switch (orient) {
                    case 'left':
                    case 'right':
                    case 'top':
                    case 'bottom':
                        break;
                    default:
                        throw new Error('Axis组件orient属性必须为left、right、top、bottom');
                }
                this._orient = orient;
                this._d3Axis.orient(orient);
                return this;
            };
            Axis.prototype.draw = function () {
                var selection = this._stock._containers[this._name].selectAll('g').data([this]);
                if (selection.empty()) {
                    selection = selection.enter().append('g').attr(this._getTransform(this._orient));
                }
                selection.call(this._d3Axis);
                return this;
            };
            Axis.prototype._getScale = function (orient) {
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
            };
            Axis.prototype._getTransform = function (orient) {
                var x, y, margin = this._stock._margin, width = this._stock._width, height = this._stock._height;
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
                return { 'transform': 'translate(' + x + ',' + y + ')' };
            };
            return Axis;
        })(BaseComponent);
        StockComponent.Axis = Axis;
        var Grid = (function (_super) {
            __extends(Grid, _super);
            function Grid() {
                _super.apply(this, arguments);
            }
            Grid.prototype._parseOptions = function (options) {
                this._stock.getContainer(this._name).attr('transform', 'translate(' + this._stock._margin.left + ',' + this._stock._margin.top + ')');
                this.setOrient(options['orient']);
                return this;
            };
            Grid.prototype.setOrient = function (orient) {
                switch (orient) {
                    case 'x':
                    case 'y':
                        break;
                    default:
                        throw new Error('Grid组件orient属性必须为x、y');
                }
                this._orient = orient;
                return this;
            };
            Grid.prototype._getTicks = function (orient) {
                switch (orient) {
                    case 'y':
                        return this._stock.getYScale().ticks();
                        break;
                    case 'x':
                        return this._stock.getXScale().ticks();
                        break;
                }
            };
            Grid.prototype.draw = function () {
                var selection = this._stock
                    .getContainer(this._name)
                    .selectAll('line')
                    .data(this._getTicks(this._orient));
                if (selection.empty()) {
                    selection = selection.enter().append('line');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
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
            };
            return Grid;
        })(BaseComponent);
        StockComponent.Grid = Grid;
        var Tips = (function (_super) {
            __extends(Tips, _super);
            function Tips() {
                _super.apply(this, arguments);
            }
            // tips 需要显示在最前面，所以重写_createContainer方法
            Tips.prototype._createContainer = function () {
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
            };
            Tips.prototype.draw = function () {
                var stock = this._stock, xLine = stock.getContainer(this._name + '-x'), yLine = stock.getContainer(this._name + '-y'), xClassName = Util.generateClassName(this, 'x'), yClassName = Util.generateClassName(this, 'y');
                if (!xLine) {
                    xLine = stock.getContainer(this._name).append('line').classed(xClassName, true);
                    stock.addContainer(this._name + '-x', xLine);
                }
                if (!yLine) {
                    yLine = stock.getContainer(this._name).append('line').classed(yClassName, true);
                    stock.addContainer(this._name + '-y', yLine);
                }
                this._stock.getContainer('baseSvg').on('mousemove', function () {
                    var x = d3.mouse(this)[0], y = d3.mouse(this)[1], margin = stock.getMargin(), width = stock.getWidth(), height = stock.getHeight();
                    if (x < margin.left || x > (margin.left + width) || y < margin.top || y > (margin.top + height)) {
                        xLine.classed(stock.getHiddenClass(), true);
                        yLine.classed(stock.getHiddenClass(), true);
                        return;
                    }
                    var date = stock._xScale.invert(x - margin.left);
                    var nearData = stock.getDataContainer().getNearDataByDate(date);
                    var nearDataX = stock._xScale(nearData.start) + margin.left;
                    xLine.attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y).classed(stock.getHiddenClass(), false).attr('transform', 'translate(' + margin.left + ',0)');
                    yLine.attr('x1', nearDataX).attr('y1', 0).attr('x2', nearDataX).attr('y2', height).classed(stock.getHiddenClass(), false).attr('transform', 'translate(0,' + margin.top + ')');
                });
                return this;
            };
            return Tips;
        })(BaseComponent);
        StockComponent.Tips = Tips;
    })(StockComponent = Asgard.StockComponent || (Asgard.StockComponent = {}));
    /**
     * Stock Chart
     */
    var StockChart;
    (function (StockChart) {
        var BaseChart = (function () {
            function BaseChart(options, stock) {
                this._stock = stock;
                this._name = options.name;
                this._dataName = options.dataName;
                this._init();
                this._createContainer();
                this._parseOptions(options);
            }
            BaseChart.prototype._init = function () {
                return this;
            };
            BaseChart.prototype._parseOptions = function (options) {
                return this;
            };
            BaseChart.prototype._createContainer = function () {
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
            };
            BaseChart.prototype.getName = function () {
                return this._name;
            };
            BaseChart.prototype.getStock = function () {
                return this._stock;
            };
            BaseChart.prototype.getDataName = function () {
                return this._dataName;
            };
            BaseChart.prototype.draw = function () {
                return this;
            };
            return BaseChart;
        })();
        StockChart.BaseChart = BaseChart;
        var Line = (function (_super) {
            __extends(Line, _super);
            function Line() {
                _super.apply(this, arguments);
            }
            Line.prototype._getPriceByPriceScource = function (data) {
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
            };
            Line.prototype._parseOptions = function (options) {
                this._priceSource = options['priceSource'] || 'close';
                return this;
            };
            Line.prototype._getSvgCoordinate = function (prevData, currentData) {
                var prevDate, prevPrice, xScale = this._stock.getXScale(), yScale = this._stock.getYScale();
                if (!prevData) {
                    prevDate = new Date(currentData.start);
                    prevPrice = currentData[this._priceSource];
                }
                else {
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
            };
            Line.prototype._createSvg = function () {
                return d3.svg.line().x(function (d) {
                    return d.x;
                }).y(function (d) {
                    return d.y;
                });
            };
            Line.prototype.draw = function () {
                var _this = this;
                var svg = this._createSvg(), data = this._stock.getDataContainer().getData(this._dataName), selection = this._stock.getContainer(this._name).selectAll('path').data(data);
                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('path');
                    }
                }
                selection.attr('d', function (d, i) {
                    return svg(_this._getSvgCoordinate(data[i + 1], d));
                });
                return this;
            };
            return Line;
        })(BaseChart);
        StockChart.Line = Line;
        var Area = (function (_super) {
            __extends(Area, _super);
            function Area() {
                _super.apply(this, arguments);
            }
            Area.prototype._createSvg = function () {
                var yScale = this._stock.getYScale();
                return d3.svg.area().x(function (d) {
                    return d.x;
                }).y0(yScale(0)).y1(function (d) {
                    return d.y;
                });
            };
            return Area;
        })(Line);
        StockChart.Area = Area;
        var Ohlc = (function (_super) {
            __extends(Ohlc, _super);
            function Ohlc() {
                _super.apply(this, arguments);
            }
            Ohlc.prototype._parseOptions = function (options) {
                this._rectWidth = options['rectWidth'] || 4;
                return this;
            };
            Ohlc.prototype.getZoomRectWidth = function () {
                var scale = 1;
                if (d3.event) {
                    scale = d3.event.scale;
                }
                scale = Math.max(1, scale);
                scale = Math.min(4, scale);
                return scale * this._rectWidth;
            };
            Ohlc.prototype.setRectWidth = function (rectWidth) {
                this._rectWidth = rectWidth;
                return this;
            };
            Ohlc.prototype.getRectWidth = function () {
                return this._rectWidth;
            };
            Ohlc.prototype._isUp = function (d) {
                return d.close > d.open;
            };
            Ohlc.prototype._isDown = function (d) {
                return d.close < d.open;
            };
            Ohlc.prototype._isConsolidation = function (d) {
                return d.close === d.open;
            };
            return Ohlc;
        })(BaseChart);
        StockChart.Ohlc = Ohlc;
        var Candle = (function (_super) {
            __extends(Candle, _super);
            function Candle() {
                _super.apply(this, arguments);
            }
            Candle.prototype._drawHighLowLine = function () {
                var selection = this._stock.getContainer(this._name)
                    .selectAll('path')
                    .data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('path');
                    }
                }
                selection.attr('d', this._highLowline()).classed(Util.generateClassName(this, 'line'), true);
                return this;
            };
            Candle.prototype._drawCandleRect = function () {
                var _this = this;
                var selection = this._stock.getContainer(this._name)
                    .selectAll('rect')
                    .data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('rect');
                    }
                }
                var xScale = this._stock.getXScale(), yScale = this._stock.getYScale(), RectWidth = this.getZoomRectWidth();
                selection
                    .attr('x', function (d) {
                    return xScale(new Date(d.start)) - RectWidth / 2;
                })
                    .attr('y', function (d) {
                    return _this._isUp(d) ? yScale(d.close) : yScale(d.open);
                })
                    .attr('width', RectWidth)
                    .attr('height', (function (d) {
                    var height = _this._isUp(d) ? yScale(d.open) - yScale(d.close) : yScale(d.close) - yScale(d.open);
                    return Math.max(height, 1);
                }))
                    .classed(Util.generateClassName(this, 'rect'), true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;
            };
            Candle.prototype.draw = function () {
                this._drawHighLowLine();
                this._drawCandleRect();
                return this;
            };
            Candle.prototype._highLowline = function () {
                var d3Line = d3.svg.line()
                    .x(function (d) {
                    return d.x;
                })
                    .y(function (d) {
                    return d.y;
                }), xScale = this._stock._xScale, yScale = this._stock._yScale;
                return function (d) {
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
            };
            return Candle;
        })(Ohlc);
        StockChart.Candle = Candle;
        var HollowCandle = (function (_super) {
            __extends(HollowCandle, _super);
            function HollowCandle() {
                _super.apply(this, arguments);
            }
            HollowCandle.prototype._drawHighLine = function () {
                var className = Util.generateClassName(this, 'high-line'), selection = this._stock.getContainer(this._name)
                    .selectAll('path.' + className)
                    .data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('path');
                    }
                }
                selection.attr('d', this._highLine()).classed(className, true);
                return this;
            };
            HollowCandle.prototype._lowLine = function () {
                var d3Line = d3.svg.line()
                    .x(function (d) {
                    return d.x;
                })
                    .y(function (d) {
                    return d.y;
                }), xScale = this._stock._xScale, yScale = this._stock._yScale;
                return function (d) {
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
            };
            HollowCandle.prototype._highLine = function () {
                var d3Line = d3.svg.line()
                    .x(function (d) {
                    return d.x;
                })
                    .y(function (d) {
                    return d.y;
                }), xScale = this._stock._xScale, yScale = this._stock._yScale;
                return function (d) {
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
            };
            HollowCandle.prototype._drawLowLine = function () {
                var className = Util.generateClassName(this, 'low-line'), selection = this._stock.getContainer(this._name)
                    .selectAll('path.' + className)
                    .data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('path');
                    }
                }
                selection.attr('d', this._lowLine()).classed(className, true);
                return this;
            };
            HollowCandle.prototype.draw = function () {
                this._drawHighLine();
                this._drawLowLine();
                this._drawCandleRect();
                return this;
            };
            return HollowCandle;
        })(Candle);
        StockChart.HollowCandle = HollowCandle;
        var Bars = (function (_super) {
            __extends(Bars, _super);
            function Bars() {
                _super.apply(this, arguments);
            }
            Bars.prototype._drawCloseRect = function () {
                var _this = this;
                var className = Util.generateClassName(this, 'close-rect'), selection = this._stock.getContainer(this._name)
                    .selectAll('rect.' + className)
                    .data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('rect');
                    }
                }
                var xScale = this._stock.getXScale(), yScale = this._stock.getYScale(), RectWidth = this.getZoomRectWidth();
                selection
                    .attr('x', function (d) {
                    var x = xScale(new Date(d.start));
                    if (_this._isUp(d)) {
                        x -= RectWidth + RectWidth / 2;
                    }
                    else {
                        x -= RectWidth - RectWidth / 2;
                    }
                    return x;
                })
                    .attr('y', function (d) {
                    var y;
                    if (_this._isUp(d)) {
                        y = yScale(d.open);
                    }
                    else {
                        y = yScale(d.close);
                    }
                    return y;
                })
                    .attr('width', RectWidth * 2)
                    .attr('height', (function (d) {
                    return RectWidth;
                }))
                    .classed(className, true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;
            };
            Bars.prototype._drawOpenRect = function () {
                var _this = this;
                var className = Util.generateClassName(this, 'open-rect'), selection = this._stock.getContainer(this._name)
                    .selectAll('rect.' + className)
                    .data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('rect');
                    }
                }
                var xScale = this._stock.getXScale(), yScale = this._stock.getYScale(), RectWidth = this.getZoomRectWidth();
                selection
                    .attr('x', function (d) {
                    var x = xScale(new Date(d.start));
                    if (_this._isDown(d)) {
                        x -= RectWidth + RectWidth / 2;
                    }
                    else {
                        x -= RectWidth - RectWidth / 2;
                    }
                    return x;
                })
                    .attr('y', function (d) {
                    var y;
                    if (_this._isDown(d)) {
                        y = yScale(d.open);
                    }
                    else {
                        y = yScale(d.close);
                    }
                    return y;
                })
                    .attr('width', RectWidth * 2)
                    .attr('height', (function (d) {
                    return RectWidth;
                }))
                    .classed(className, true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;
            };
            Bars.prototype._drawHighLowRect = function () {
                var className = Util.generateClassName(this, 'high-low-rect'), selection = this._stock.getContainer(this._name)
                    .selectAll('rect.' + className)
                    .data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                }
                else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    }
                    else {
                        selection.enter().append('rect');
                    }
                }
                var xScale = this._stock.getXScale(), yScale = this._stock.getYScale(), RectWidth = this.getZoomRectWidth();
                selection
                    .attr('x', function (d) {
                    return xScale(new Date(d.start)) - RectWidth / 2;
                })
                    .attr('y', function (d) {
                    return yScale(d.high);
                })
                    .attr('width', RectWidth)
                    .attr('height', (function (d) {
                    var height = yScale(d.low) - yScale(d.high);
                    return Math.max(height, 1);
                }))
                    .classed(className, true)
                    .classed(Util.generateClassName(this, 'up'), this._isUp)
                    .classed(Util.generateClassName(this, 'down'), this._isDown)
                    .classed(Util.generateClassName(this, 'consolidation'), this._isConsolidation);
                return this;
            };
            Bars.prototype.draw = function () {
                this._drawHighLowRect();
                this._drawOpenRect();
                this._drawCloseRect();
                return this;
            };
            return Bars;
        })(Ohlc);
        StockChart.Bars = Bars;
    })(StockChart = Asgard.StockChart || (Asgard.StockChart = {}));
    var Stock = (function () {
        function Stock(selection, options) {
            var _this = this;
            this._width = 900;
            this._height = 300;
            this._margin = { left: 50, top: 50, bottom: 50, right: 75 };
            this._interval = '1D';
            this._containers = {};
            this._components = {};
            this._charts = {};
            this._sync = [];
            this._hiddenClass = Asgard.name + '-hide';
            // 重要的options
            options.width && (this._width = options.width);
            options.height && (this._height = options.height);
            options.interval && (this._interval = options.interval);
            options.margin && (this._margin = options.margin);
            options.isZoom && (this._isZoom = options.isZoom);
            this._initContainer(selection);
            this._initScale();
            this._isZoom && this._initZoom();
            Util.isArray(options.components) && options.components.forEach(function (component) { return _this.addComponent(component); });
            Util.isArray(options.charts) && options.charts.forEach(function (chart) { return _this.addChart(chart); });
            Util.isArray(options.data) && options.data.forEach(function (data) { return _this.addData(data); });
        }
        Stock.prototype._initZoom = function () {
            this._zoom = d3.behavior.zoom();
            var scaleExtend;
            switch (this._interval) {
                case '1':
                    scaleExtend = [1, 3];
                    break;
            }
            this._zoom.scaleExtent(scaleExtend);
            this.getContainer('baseSvg').call(this._zoom);
            this.zoom(function () {
            });
            return this;
        };
        Stock.prototype._initContainer = function (selection) {
            var baseContainer, baseSvgContainer, dataContainer, dataClipContainer, margin = this.getMargin();
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
        };
        Stock.prototype._initScale = function () {
            this._xScale = d3.time.scale().range([0, this._width]);
            this._yScale = d3.scale.linear().rangeRound([this._height, 0]);
            return this;
        };
        Stock.prototype.zoom = function (callback) {
            var _this = this;
            if (this._isZoom) {
                // y 不需要缩放
                this._zoom.x(this._xScale);
                this._zoom.on('zoom', function () {
                    // y 不缩放，所以计算当前范围内的最高和最低价格
                    _this._yScale.domain(_this._dataContainer.getYdomain());
                    // 对需要同步的Stock 进行xScale,yScale设置
                    _this._sync.forEach(function (stock) {
                        var xScale = stock.getXScale(), yScale = stock.getYScale();
                        xScale.domain(_this._xScale.domain());
                        yScale.domain(_this._yScale.domain());
                        stock._zoom.x(xScale);
                        stock._zoom.y(yScale);
                        stock.draw();
                    });
                    _this.draw();
                    callback();
                });
            }
            return this;
        };
        Stock.prototype.addSync = function (stock) {
            this._sync.push(stock);
            return this;
        };
        Stock.prototype.draw = function () {
            this.drawComponent();
            this.drawChart();
            return this;
        };
        Stock.prototype.drawComponent = function () {
            for (var name in this._components) {
                this._components[name].draw();
            }
            return this;
        };
        Stock.prototype.drawChart = function () {
            for (var name in this._charts) {
                this._charts[name].draw();
            }
            return this;
        };
        Stock.prototype.addData = function (options) {
            if (!this._dataContainer) {
                this._dataContainer = new StockData.DataContainer(this);
            }
            this._dataContainer.addData(options);
            this._xScale.domain(this._dataContainer.getXdomain());
            this._yScale.domain(this._dataContainer.getYdomain());
            this.isZoom() && this._zoom.x(this._xScale);
            return this;
        };
        Stock.prototype.addChart = function (options) {
            var type = Util.capitalize(options.type), instance = new StockChart[type](options, this), name = instance.getName();
            if (!name) {
                throw new Error('图表必须设置一个name');
            }
            this._charts[name] = instance;
            return this;
        };
        Stock.prototype.addComponent = function (options) {
            var type = Util.capitalize(options.type), instance = new StockComponent[type](options, this), name = instance.getName();
            if (!name) {
                throw new Error('组件必须设置一个name');
            }
            this._components[name] = instance;
            return this;
        };
        Stock.prototype.addContainer = function (name, selection) {
            this._containers[name] = selection;
            return this;
        };
        Stock.prototype.getContainer = function (name) {
            return this._containers[name];
        };
        Stock.prototype.getContainers = function () {
            return this._containers;
        };
        Stock.prototype.setWidth = function (width) {
            this._width = width;
            return this;
        };
        Stock.prototype.getWidth = function () {
            return this._width;
        };
        Stock.prototype.setHeight = function (height) {
            this._height = height;
            return this;
        };
        Stock.prototype.getHeight = function () {
            return this._height;
        };
        Stock.prototype.setInterval = function (interval) {
            this._interval = interval;
            return this;
        };
        Stock.prototype.getInterval = function () {
            return this._interval;
        };
        Stock.prototype.setMargin = function (margin) {
            this._margin = margin;
            return this;
        };
        Stock.prototype.getMargin = function () {
            return this._margin;
        };
        Stock.prototype.getXScale = function () {
            return this._xScale;
        };
        Stock.prototype.getYScale = function () {
            return this._yScale;
        };
        Stock.prototype.isZoom = function () {
            return this._isZoom;
        };
        Stock.prototype.getZoom = function () {
            return this._zoom;
        };
        Stock.prototype.getDataContainer = function () {
            return this._dataContainer;
        };
        Stock.prototype.getHiddenClass = function () {
            return this._hiddenClass;
        };
        return Stock;
    })();
    Asgard.Stock = Stock;
})(Asgard || (Asgard = {}));
//# sourceMappingURL=asgard.js.map