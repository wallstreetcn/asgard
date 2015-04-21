module Asgard.Stock.Components {

    export class Base implements ComponentInterface {

        protected id:string;
        protected container:D3.Selection;
        protected stockChart:StockChart;
        protected containerPosition:string = ':first-child';

        getId():string {
            return this.id;
        }

        setId(id:string):ComponentInterface {
            this.id = id;
            return this;
        }

        setContainerPosition(containerPosintion:string):ComponentInterface {
            this.containerPosition = containerPosintion;
            return this;
        }

        getContainerPosition() {
            return this.containerPosition;
        }

        getContainer():D3.Selection {
            return this.container;
        }

        setContainer(container:D3.Selection):ComponentInterface {
            this.container = container;
            return this;
        }

        getStockChart():StockChart {
            return this.stockChart;
        }

        setStockChart(stockChart:StockChart):ComponentInterface {
            this.stockChart = stockChart;
            return this;
        }

        draw():ComponentInterface {
            return this;
        }

        parseOptions(options:Options.ComponentInterface):ComponentInterface {
            this.setId(options.id);
            return this;
        }

        protected initContainer():ComponentInterface {

            if (!this.getContainer()) {

                var container = this.getStockChart().getBaseDom()
                    .insert('g', this.getContainerPosition())
                    .classed(Util.generateClassName(this), true)
                    .classed(this.getId(), true);

                this.setContainer(container);
            }

            return this;
        }


        constructor(stockChart:StockChart, options:Options.ComponentInterface) {
            this.setStockChart(stockChart);
            this.parseOptions(options);
            this.initContainer();
        }
    }


}