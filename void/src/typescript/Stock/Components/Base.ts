module Asgard.Stock.Components {

    export class Base implements ComponentInterface {

        protected id:string;
        protected selection:D3.Selection;
        protected stockChart:StockChart;
        protected selectionPosition:string = ':first-child';

        getId():string {
            return this.id;
        }

        setId(id:string):ComponentInterface {
            this.id = id;
            return this;
        }

        setSelectionPosition(selectionPosition:string):ComponentInterface {
            this.selectionPosition = selectionPosition;
            return this;
        }

        getSelectionPosition():string{
            return this.selectionPosition;
        }

        getSelection():D3.Selection {
            return this.selection;
        }

        setSelection(selection:D3.Selection):ComponentInterface {
            this.selection = selection;
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

            if (!this.getSelection()) {

                var container = this.getStockChart().getSelection()
                    .insert('g', this.getSelectionPosition())
                    .classed(Util.generateClassName(this), true)
                    .classed(this.getId(), true);

                this.setSelection(container);
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