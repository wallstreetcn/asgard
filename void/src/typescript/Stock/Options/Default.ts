module Asgard.Stock.Options {

    export class DefaultStockChart {
        charts:Options.ChartInterface[] = [];
        components:Options.ComponentInterface[] = [];
        data:Options.DataInterface[] = [];
        debug:boolean = false;
        zoom:boolean = true
    }

}