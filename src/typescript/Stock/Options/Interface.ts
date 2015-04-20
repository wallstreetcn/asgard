module Asgard.Stock.Options {

    export interface DataInerface {
        id:string;
        data:any[];
        default?:boolean;
        type:string;
    }

    export interface ComponentInterface {
        id:string;
        type:string;
    }

    export interface AxisComponentInterface extends ComponentInterface {
        orient:string;
    }

    export interface ChartInterface {
        id:string;
        type:string;
        chartDataId:string;
    }

    export interface LineChartInterface extends ChartInterface{
        priceSource:string;
    }

    export interface VolumeChartInterface extends ChartInterface{
        volumeHeight:number;
    }



    export interface MarginInterface {
        left?:number;
        top?:number;
        bottom?:number;
        right?:number
    }

    export interface StockChartInterface {
        width?:number;
        height?:number;
        interval?:string;
        zoom?:boolean;
        hiddenClass?:string;
        visibilityClass?:string;
        debug?:boolean;
        resize?:boolean;
        margin?:MarginInterface;
        components?:ComponentInterface[];
        charts?:ChartInterface[];
    }

}

