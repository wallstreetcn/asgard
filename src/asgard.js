/// <reference path="../typings/d3/d3.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Asgard;
(function (Asgard) {
    Asgard.name = 'asgard';
    Asgard.version = '0.0.1';
    var Util;
    (function (Util) {
        function isArray(value) {
            return toString.call(value) === '[object Array]';
        }
        Util.isArray = isArray;
        function generateClassName(object, suffix) {
            return Asgard.name.toLowerCase() + '-' + getClassName(object).toLowerCase() + '-' + suffix;
        }
        Util.generateClassName = generateClassName;
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
        function capitalize(str) {
            return String(str.charAt(0)).toUpperCase() +
                String(str.substr(1));
        }
        Util.capitalize = capitalize;
    })(Util = Asgard.Util || (Asgard.Util = {}));
    var StockData;
    (function (StockData) {
        var DataContainer = (function () {
            function DataContainer(stock) {
                this._originData = {};
                this._data = {};
                this._stock = stock;
            }
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
            DataContainer.prototype.getData = function (name) {
                return this._data[name];
            };
            DataContainer.prototype.getOriginData = function (name) {
                return this._originData[name];
            };
            DataContainer.prototype.getShowCount = function () {
                var width = this._stock._width, right = this._stock._margin.left, left = this._stock._margin.right;
                return (width - right - left) / 8;
            };
            DataContainer.prototype.getXdomain = function () {
                var data = this.getData(this._defaultName);
                if (this._stock.isZoom()) {
                    data = Array.prototype.slice.apply(data, [0, this.getShowCount()]);
                }
                var date = d3.extent(data.map(function (d) {
                    return new Date(d.start);
                }));
                var minDate = date[0], maxDate = date[1];
                return [
                    minDate.setMinutes(minDate.getMinutes() - 15),
                    maxDate.setMinutes(maxDate.getMinutes() + 15)
                ];
            };
            DataContainer.prototype.getYdomain = function () {
                var data = this.getData(this._defaultName);
                if (this._stock.isZoom()) {
                    data = Array.prototype.slice.apply(data, [0, this.getShowCount()]);
                }
                return this.getMinAndMaxPrice(data);
            };
            DataContainer.prototype.getDataByDateRange = function (gtValue, ltValue) {
                var data = [];
                for (var name in this._data) {
                    this._data[name].forEach(function (d) {
                        if (d.start >= gtValue && d.start <= ltValue) {
                            data.push(d);
                        }
                    });
                }
                return data;
            };
            DataContainer.prototype.getMinAndMaxPrice = function (data) {
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
                        .classed(Util.generateClassName(this, 'component'), true)
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
                    .ticks(8);
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
                var selection = this._stock.getContainer(this._name)
                    .selectAll('line').data(this._getTicks(this._orient));
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
                        .insert('g')
                        .classed(Util.generateClassName(this, 'chart'), true)
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
            Line.prototype._getCoordinate = function (prevData, currentData) {
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
            Line.prototype.draw = function () {
                var _this = this;
                var line = d3.svg.line().x(function (d) {
                    return d.x;
                }).y(function (d) {
                    return d.y;
                });
                var data = this._stock.getDataContainer().getData(this._dataName);
                var selection = this._stock.getContainer(this._name).selectAll('path').data(data);
                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }
                selection.attr('d', function (d, i) {
                    return line(_this._getCoordinate(data[i + 1], d));
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
            Area.prototype.draw = function () {
                var _this = this;
                var area = d3.svg.area().x(function (d) {
                    return d.x;
                }).y0(this._stock.getYScale()(0)).y1(function (d) {
                    return d.y;
                });
                var data = this._stock.getDataContainer().getData(this._dataName);
                var selection = this._stock.getContainer(this._name).selectAll('path').data(data);
                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }
                selection.attr('d', function (d, i) {
                    return area(_this._getCoordinate(data[i + 1], d));
                });
                return this;
            };
            return Area;
        })(Line);
        StockChart.Area = Area;
        var Ohlc = (function (_super) {
            __extends(Ohlc, _super);
            function Ohlc() {
                _super.apply(this, arguments);
            }
            Ohlc.prototype._isUp = function (d) {
                return d.close > d.open || d.close === d.open;
            };
            Ohlc.prototype._isDown = function (d) {
                return d.close < d.open;
            };
            return Ohlc;
        })(BaseChart);
        StockChart.Ohlc = Ohlc;
        var CandleStick = (function (_super) {
            __extends(CandleStick, _super);
            function CandleStick() {
                _super.apply(this, arguments);
            }
            CandleStick.prototype._parseOptions = function (options) {
                this._rectWidth = options['rectWidth'] || 4;
                return this;
            };
            CandleStick.prototype._highLowlineValue = function () {
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
            CandleStick.prototype.getZoomRectWidth = function () {
                var scale = 1;
                if (d3.event) {
                    scale = d3.event.scale;
                }
                scale = Math.max(1, scale);
                scale = Math.min(3, scale);
                return scale * this._rectWidth;
            };
            CandleStick.prototype.draw = function () {
                var _this = this;
                // line
                var selection = this._stock.getContainer(this._name).selectAll('path').data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('path');
                }
                selection.attr('d', this._highLowlineValue());
                // candle
                var selection = this._stock.getContainer(this._name).selectAll('rect').data(this._stock.getDataContainer().getData(this._dataName), function (d) {
                    return d.start;
                });
                if (selection.empty()) {
                    selection = selection.enter().append('rect');
                }
                var xScale = this._stock.getXScale(), yScale = this._stock.getYScale(), RectWidth = this.getZoomRectWidth();
                selection.attr('x', function (d) {
                    return xScale(new Date(d.start)) - RectWidth / 2;
                }).attr('y', function (d) {
                    return _this._isUp(d) ? yScale(d.close) : yScale(d.open);
                }).attr('width', RectWidth)
                    .attr('height', (function (d) {
                    var height = _this._isUp(d) ? yScale(d.open) - yScale(d.close) : yScale(d.close) - yScale(d.open);
                    return Math.max(height, 1);
                })).classed({
                    'up-day': this._isUp,
                    'down-day': this._isDown
                });
                return this;
            };
            return CandleStick;
        })(Ohlc);
        StockChart.CandleStick = CandleStick;
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
            this._zoom.scaleExtent([-2, 14]);
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
                    var xDomain = _this._xScale.domain();
                    var data = _this._dataContainer.getDataByDateRange(xDomain[0], xDomain[1]);
                    _this._yScale.domain(_this._dataContainer.getMinAndMaxPrice(data));
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
        return Stock;
    })();
    Asgard.Stock = Stock;
})(Asgard || (Asgard = {}));
//# sourceMappingURL=asgard.js.map