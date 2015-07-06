module Asgard.Stock.Options {

    export interface DataInterface {
        id:string;
        data:any[];
        default?:boolean;
        dataFormat:(any)=>Data.DataInterface;
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

    export interface LineChartInterface extends ChartInterface {
        priceSource:string;
        showDot:boolean;
    }

    export interface VolumeChartInterface extends ChartInterface {
        volumeHeight:number;
    }

    export interface StockChartInterface {
        components?:ComponentInterface[];
        charts?:ChartInterface[];
        data?:DataInterface[];
        zoom?:boolean;
        debug?:boolean
    }

}

