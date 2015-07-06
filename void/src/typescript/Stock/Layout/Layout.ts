module Asgard.Stock.Layout {

    export interface LayoutInterface {

        id:string;
        stockChart:StockChartInterface;

        height?:number;
        percentHeight?:string;
        selection?:D3.Selection;

        getId():string;
        setId(id:string):LayoutInterface;
        getStockChart():StockChartInterface;
        setStockChart(stockChart:StockChartInterface):LayoutInterface;

        getHeight():number;
        setHeight(height:number):LayoutInterface;
        getPercentHeight():string;
        setPercentHeight(percentHeight:string):LayoutInterface;
        getSelection():D3.Selection;
        setSelection(selection:D3.Selection):LayoutInterface;

    }

    export class Layout implements LayoutInterface {

        id:string;
        stockChart:StockChartInterface;

        height:number;
        percentHeight:string;
        selection:D3.Selection;

        constructor(layoutOptions:LayoutOptionsInterface) {

            this.setId(layoutOptions.id)
                .setStockChart(layoutOptions.stockChart);

            if (Util.isPercent(layoutOptions.height)) {
                this.setPercentHeight(layoutOptions.height);
            } else {
                this.setHeight(layoutOptions.height);
            }
        }

        getId():string {
            return this.id;
        }

        setId(id:string):LayoutInterface {
            this.id = id;
            return this;
        }

        getStockChart():StockChartInterface {
            return this.stockChart;
        }

        setStockChart(stockChart:StockChartInterface):LayoutInterface {
            this.stockChart = stockChart;
            return this;
        }

        getHeight():number {
            return this.height;
        }

        setHeight(height:number):LayoutInterface {
            this.height = height;
            return this;
        }


        getPercentHeight():string {
            return this.percentHeight;
        }

        setPercentHeight(percentHeight:string):LayoutInterface {
            this.percentHeight = percentHeight;
            return this;
        }

        getSelection():D3.Selection {
            return this.selection;
        }

        setSelection(selection:D3.Selection):LayoutInterface {
            this.selection = selection;
            return this;
        }
    }
}
