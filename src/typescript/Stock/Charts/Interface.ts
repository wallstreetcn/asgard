module Asgard.Stock.Charts {

    export interface ChartsInterface {
        [id:string]:ChartInterface
    }

    export interface ChartInterface {
        draw():ChartInterface;
    }

    export interface OhlcChartDataInterface{
        up:Data.ChartDataInterface[];
        down:Data.ChartDataInterface[];
        equal:Data.ChartDataInterface[];
    }

}