module Asgard.Stock.Options {

    export interface DataInterface {
        id:string;
        data:any[];
        default?:boolean;
    }

    export interface ComponentInterface {
        id:string;
        type:string;
    }

    export interface AxisComponentInterface extends ComponentInterface {
        orient:string;
        tickPercent?:boolean;
        showField?:string;
    }

    export interface ChartInterface {
        id:string;
        type:string;
        dataId:string;
        containerPosition?:string;
    }

    export interface LineChartInterface extends ChartInterface{
        priceSource:string;
        showDot:boolean;
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
        data?:DataInterface[]
    }

}

