module Asgard.Stock.Charts {

    export class Base implements ChartInterface {

        protected id:string;
        protected container:D3.Selection;
        protected stockChart:StockChart;
        protected containerPosition:string = ':first-child';
        protected chartDataId:string;

        setChartDataId(chartDataId:string):ChartInterface {
            this.chartDataId = chartDataId;
            return this;
        }

        getChartDataId():string {
            return this.chartDataId;
        }

        getId():string {
            return this.id;
        }

        setId(id:string):ChartInterface {
            this.id = id;
            return this;
        }

        setContainerPosition(containerPosintion:string):ChartInterface {
            this.containerPosition = containerPosintion;
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
            this.setChartDataId(options.chartDataId);
            return this;
        }

        protected initContainer():ChartInterface {

            if (!this.getContainer()) {

                var container = this.getStockChart().getDataContainer()
                    .insert('g', this.getContainerPosition())
                    .classed(Util.generateClassName(this), true)
                    .classed(this.getId(), true);

                this.setContainer(container);
            }

            return this;
        }


        constructor(stockChart:StockChart, options:Options.ChartInterface) {
            this.setStockChart(stockChart);
            this.parseOptions(options);
            this.initContainer();
        }
    }


}