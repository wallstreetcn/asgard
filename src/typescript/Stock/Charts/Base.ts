module Asgard.Stock.Charts {

    export class Base implements ChartInterface {

        protected id:string;
        protected container:D3.Selection;
        protected stockChart:StockChart;
        protected containerPosition:string;
        protected dataId:string;

        barWidth():number{
            return Math.max(this.getStockChart().getXScale().band(),1);
        }

        setDataId(dataId:string):ChartInterface {
            this.dataId = dataId;
            return this;
        }

        getDataId():string {
            return this.dataId;
        }

        getId():string {
            return this.id;
        }

        setId(id:string):ChartInterface {
            this.id = id;
            return this;
        }

        setContainerPosition(containerPosition:string):ChartInterface {
            this.containerPosition = containerPosition;
            return this;
        }

        getContainerPosition() {
            return this.containerPosition;
        }

        getContainer():D3.Selection {
            return this.container;
        }

        setContainer(container:D3.Selection):ChartInterface {
            this.container = container;
            return this;
        }

        getStockChart():StockChart {
            return this.stockChart;
        }

        setStockChart(stockChart:StockChart):ChartInterface {
            this.stockChart = stockChart;
            return this;
        }

        draw():ChartInterface {
            return this;
        }

        parseOptions(options:Options.ChartInterface):ChartInterface {
            this.setId(options.id);
            this.setDataId(options.dataId);
            this.setContainerPosition(options.containerPosition || ':first-child');
            return this;
        }

        initSelection(data:Data.DataInterface[], className):D3.Selection {

            var selection:any = this.getContainer()
                .selectAll('path.' + className)
                .data([data]);

            if (selection.empty()) {
                selection = selection.enter().append('path');
            } else {
                if (selection.enter().empty()) {
                    selection.exit().remove();
                } else {
                    selection.enter().append('path');
                }
            }

            return selection;
        }

        protected initContainer():ChartInterface {

            if (!this.getContainer()) {

                var container = this.getStockChart().getDataDom()
                    .insert('g', this.getContainerPosition())
                    .classed(Util.generateClassName(this), true)
                    .classed(this.getId(), true);

                this.setContainer(container);
            }

            return this;
        }

        isUp(d:Data.DataInterface):boolean {
            return d.open < d.close;
        }

        isDown(d:Data.DataInterface):boolean {
            return d.open > d.close;
        }

        getOhlcData():OhlcChartDataInterface {

            return this.getStockChart()
                .getDataContainer()
                .getDataById(this.getDataId()).
                reduce((result:OhlcChartDataInterface, d:Data.DataInterface):OhlcChartDataInterface => {
                    if (this.isUp(d)) {
                        result.up.push(d);
                    } else if (this.isDown(d)) {
                        result.down.push(d);
                    } else {
                        result.equal.push(d)
                    }
                    return result;
                }, {
                    up: [],
                    down: [],
                    equal: []
                });

        }
        constructor(stockChart:StockChart, options:Options.ChartInterface) {
            this.setStockChart(stockChart);
            this.parseOptions(options);
            this.initContainer();
        }
    }


}