module Asgard.Stock.Data {

    export class DataContainer implements DataContainerInterface {

        protected stockChart:StockChart;
        protected dataPoll:DataPollInterface = {};
        protected defaultId:string;
        protected viewableClosePrice:number;
        protected dataChanged:boolean = true;

        constructor(stockChart:StockChart) {
            this.setStockChart(stockChart);
        }

        isDataChanged():boolean {
            return this.dataChanged;
        }

        setDataChanged(dataChanged:boolean):DataContainerInterface {
            this.dataChanged = dataChanged
            return this;
        }

        getStockChart():StockChart {
            return this.stockChart;
        }

        setStockChart(stockChart:StockChart):DataContainerInterface {
            this.stockChart = stockChart;
            return this;
        }

        setDefaultId(defaultId:string):DataContainerInterface {
            this.defaultId = defaultId;
            return this;
        }

        getDefaultId():string {
            return this.defaultId;
        }

        setViewableClosePrice(viewableClosePrice:number):DataContainerInterface {
            this.viewableClosePrice = viewableClosePrice;
            return this;
        }

        getViewableClosePrice():number {
            return this.viewableClosePrice;
        }

        getDataPoll():DataPollInterface {
            return this.dataPoll;
        }

        setDataPoll(dataPoll:DataPollInterface):DataContainerInterface {
            this.dataPoll = dataPoll;
            return this;
        }

        addData(options:Options.DataInterface):DataContainer {

            if (options.default || !this.getDefaultId()) {
                this.setDefaultId(options.id);
            }

            // @todo:如果数据已经存在，再一次添加，可以考虑合并原始数据，并且过滤掉重复数据
            this.dataPoll[options.id] = Util.isFunction(options.dataFormat) ? options.dataFormat.call(this, options.data) : this.dataFormat(options.data);

            this.setDataChanged(true);

            return this;
        }

        dataFormat(data:Object[]):DataInterface[] {

            return data.map((d:any):DataInterface => {
                return {
                    date: d.start * 1000,
                    high: d.high,
                    low: d.low,
                    open: d.open,
                    close: d.close,
                    price: d.price,
                    volume: d.volume
                }
            });
        }


        getDefaultData():DataInterface[] {
            return this.getDataById(this.getDefaultId());
        }


        /**
         * 数据变化
         *
         * @return {Asgard.Stock.Data.DataContainer}
         */
        dataChange():DataContainer {

            if(this.isDataChanged()){

                var stockChart = this.getStockChart(),
                    xScale = stockChart.getXScale(),
                    yScale = stockChart.getYScale();

                xScale.domain(this.getXDomain());
                yScale.domain(this.getYDomain());

                this.setDataChanged(false);
            }

            return this;
        }

        getDataById(id:string):DataInterface[] {
            return this.dataPoll[id];
        }

        getDataCount():number {
            return d3.keys(this.getDataPoll()).length;
        }

        getViewableChartData():DataPollInterface {

            var viewableData:DataPollInterface = {},
                emptyCount = 0,
                dataCount = 0,
                data = this.getDataPoll(),
                xDomain = d3.extent(this.getStockChart().getXScale().domain());

            for (var id in data) {

                viewableData[id] = [];

                data[id].forEach((d:DataInterface):void=> {
                    if (d.date >= xDomain[0] && d.date <= xDomain[1]) {
                        viewableData[id].push(d);
                    }
                });

                if (viewableData[id].length === 0) {
                    emptyCount++;
                }

                dataCount++;
            }

            // 所有数据都为空,则不判断范围返回所有数据
            if (emptyCount === dataCount) {
                viewableData = data;
            }

            return viewableData;
        }

        getXDomain():Date[] {
            return this.getDataById(this.getDefaultId()).map((d:DataInterface):Date => {
                return new Date(d[DEFAULT_X_SHOW_FIELD]);
            }).reverse();
        }


        getYDomain():number[] {

            var rightAxisShowField = DEFAULT_Y_SHOW_FIELD,
                components = this.getStockChart().getComponents();

            for (var id in components) {
                var component = components[id];

                if (component instanceof Components.Axis && component.getOrient() === 'right') {
                    rightAxisShowField = component.getShowField();
                }
            }

            var viewableChartData = this.getViewableChartData();


            var minAndMax = [];


            // 最高最低价需要用high和low比较单独处理
            if (rightAxisShowField === DEFAULT_Y_SHOW_FIELD) {

                minAndMax = this.getMinAndMaxByPrice(viewableChartData);

            } else {

                minAndMax = this.getMinAndMaxByField(viewableChartData, rightAxisShowField);
            }


            // 获取可视区的收盘价
            var defaultData = viewableChartData[this.getDefaultId()];
            // 先设置一下可视区closePrice,缓存着，后期渲染时在用
            this.setViewableClosePrice(defaultData[defaultData.length - 1].close);

            // 数据数量存在1个以上，并且是价格
            if (this.getDataCount() > 1 && rightAxisShowField === DEFAULT_Y_SHOW_FIELD) {

                // @todo:2种情况，1种价钱差不多，1种差太多

                // 计算最高涨幅和最低涨幅
                var minGains = this.calculateRange(minAndMax[0]),
                    maxGains = this.calculateRange(minAndMax[1]),
                    start,
                    end;

                if (minGains < 0 && maxGains < 0) { // 2种都跌
                    start = 0;
                    end = minGains;
                } else if (minGains > 0 && maxGains > 0) { // 2种都涨
                    start = 0;
                    end = maxGains;
                } else {
                    start = minGains;
                    end = maxGains;
                }

                return [start, end];

            }

            return minAndMax;

        }

        /**
         * 获取不同数据的最高和最低价格
         *
         * @param data
         * @returns {number[]}
         */
        getMinAndMaxByPrice(data:DataPollInterface):number[] {

            var allData = [], min, max;

            for (var key in data) {
                allData = allData.concat(data[key]);
            }

            min = d3.min(allData, (d:DataInterface):number => {
                return d.low;
            });

            max = d3.max(allData, (d:DataInterface):number => {
                return d.high;
            });

            return this.disposeMinAndMaxPrice([min, max]);

        }

        getMinAndMaxByField(data:DataPollInterface, field:string):number[] {

            var allData = [];

            for (var key in data) {
                allData = allData.concat(data[key]);
            }

            return d3.extent(allData, (d:DataInterface)=> {
                return d[field];
            });

        }

        /**
         * 处理最小和最大价格
         *
         * 为了让数据显示不超出y可视范围，对最小和最大价格进行合适的修改
         *
         * @param price
         */
        disposeMinAndMaxPrice(price:number[]):number[] {

            var min = price[0],
                max = price[1],
                diff = (max - min) * 0.1;

            return [
                min - diff,
                max + diff
            ];
        }

        /**
         * 计算涨幅
         *
         * @param price
         * @returns {number}
         */
        calculateRange(price:number):number {
            return (price - this.getViewableClosePrice()) / this.getViewableClosePrice();
        }

        /**
         * 根据时间获取最接近的那条数据
         *
         * @param date
         * @returns {Asgard.StockData.DataInterface}
         */
        getNearDataByDate(date:Date):DataInterface {

            var data:DataInterface[] = this.getDefaultData(),
                l:number = data.length,
                i:number,
                left:number,
                time = date.getTime();

            // 数据是从新到旧,找比当前时间小的时间，找到说明当前时间左边的值找到
            for (i = 0; i < l; i++) {
                if (left === undefined && data[i].date < time) {
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

            if (time - leftData.date < rightData.date - time) {
                return leftData;
            } else {
                return rightData;
            }

        }


    }

}