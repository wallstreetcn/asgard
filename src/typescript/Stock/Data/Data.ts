module Asgard.Stock.Data {

    export interface ChartDataInterface {
        start:number;
        end:number;
        high:number;
        low:number;
        open:number;
        close:number;
        price:number;
        volume:number;
    }

    export interface ChartDataObjectInterface {
        [id:string]:ChartDataInterface[]
    }

    export class Data {

        protected stockChart:StockChart;
        protected chartData:ChartDataObjectInterface = {};
        protected defaultId:string;
        protected viewableClosePrice:number;

        constructor(stockChart:StockChart) {
            this.setStockChart(stockChart);
        }

        setViewableClosePrice(viewableClosePrice:number):Data {
            this.viewableClosePrice = viewableClosePrice;
            return this;
        }

        getViewableClosePrice():number {
            return this.viewableClosePrice;
        }

        setDefaultId(defaultId:string):Data {
            this.defaultId = defaultId;
            return this;
        }

        getDefaultId():string {
            return this.defaultId;
        }

        getStockChart():StockChart {
            return this.stockChart;
        }

        setStockChart(stockChart:StockChart):Data {
            this.stockChart = stockChart;
            return this;
        }

        addData(options:Options.DataInerface):Data {

            if (options.type === 'chart') {
                if (options.default || !this.getDefaultId()) {
                    this.setDefaultId(options.id);
                }

                this.chartData[options.id] = this.chartDataFormat(options.data);
            }

            this.dataChange();

            return this;
        }

        chartDataFormat(data:Object[]):ChartDataInterface[] {
            return data.map((d) => {
                return {
                    start: d['start'] * 1000,
                    end: d['end'] * 1000,
                    high: d['high'],
                    low: d['low'],
                    open: d['open'],
                    close: d['close'],
                    price: d['price'],
                    volume: d['volume']
                }
            });
        }

        /**
         * 数据变化
         *
         * @returns {Asgard.Stock.Data.Data}
         */
        dataChange():Data {

            var stockChart = this.getStockChart(),
                xScale = stockChart.getXScale(),
                yScale = stockChart.getYScale();

            xScale.domain(this.getXdomain());
            yScale.domain(this.getYdomain());

            return this;
        }

        getViewableChartData():Object {

            var data = {},
                emptyCount = 0,
                dataCount = 0,
                chartData = this.chartData,
                xDomain = d3.extent(this.getStockChart().getXScale().domain());

            for (var id in chartData) {

                data[id] = [];

                chartData[id].forEach((d:ChartDataInterface):void=> {
                    if (d.start >= xDomain[0] && d.start <= xDomain[1]) {
                        data[id].push(d);
                    }
                });

                if (data[id].length === 0) {
                    emptyCount++;
                }

                dataCount++;
            }

            // 所有数据都为空,则不判断范围返回所有数据
            if (emptyCount === dataCount) {
                data = chartData;
            }

            return data;
        }

        getChartDataById(id:string):ChartDataInterface[] {
            return this.chartData[id];
        }

        getXdomain():any[] {
            return this.getChartDataById(this.getDefaultId()).map((d:ChartDataInterface):Date => {
                return new Date(d.start);
            }).reverse();
        }

        getDefaultChartData():ChartDataInterface[]{
            return this.getChartDataById(this.getDefaultId());
        }
        getChartData():ChartDataObjectInterface {
            return this.chartData;
        }

        getChartDataCount():number {
            return d3.keys(this.getChartData()).length;
        }

        /**
         * 处理最小和最大价格
         *
         * 为了让数据显示不超出y可视范围，对最小和最大价格进行合适的修改
         *
         * @param price
         */
        protected disposeMinAndMaxPrice(price:number[]):number[] {

            var min = price[0],
                max = price[1],
                diff = (max - min) * 0.1;

            return [
                min - diff,
                max + diff
            ];
        }


        /**
         * 获取不同数据的最高和最低价格
         *
         * @param data
         * @returns {number[]}
         */
        getMinAndMaxPrice(data:Object):number[] {

            var allData = [], min, max;

            for (var key in data) {
                allData = allData.concat(data[key]);
            }

            min = d3.min(allData, (d:ChartDataInterface):number => {
                return d.low;
            });

            max = d3.max(allData, (d:ChartDataInterface):number => {
                return d.high;
            });

            return this.disposeMinAndMaxPrice([min, max]);

        }

        calculateRange(price:number):number {
            return (price - this.getViewableClosePrice()) / this.getViewableClosePrice();
        }

        getYdomain():number[] {

            var viewableChartData = this.getViewableChartData();

            // 计算最高和最低
            var minAndMaxPrice = this.getMinAndMaxPrice(viewableChartData);

            // 获取可视区的收盘价
            var defaultData = viewableChartData[this.getDefaultId()];

            // 先设置一下可视区closePrice,缓存着，后期渲染时在用
            this.setViewableClosePrice(defaultData[defaultData.length - 1].close);


            // 数据数量存在1个以上
            if (this.getChartDataCount() > 1) {

                // @todo:2种情况，1种价钱差不多，1种差太多

                // 计算最高涨幅和最低涨幅
                var minGains = this.calculateRange(minAndMaxPrice[0]),
                    maxGains = this.calculateRange(minAndMaxPrice[1]),
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

            return minAndMaxPrice;

        }


    }

}