module Asgard.Stock.Charts {

    export interface ChartsInterface {
        [id:string]:ChartInterface
    }

    export interface ChartInterface {
        draw():ChartInterface;
    }

}