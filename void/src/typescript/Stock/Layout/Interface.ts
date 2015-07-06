module Asgard.Stock.Layout {

    export var defaultMargin = {
        left: 0,
        top: 0,
        bottom: 0,
        right: 0
    };

    export interface MarginInterface {
        left?:number;
        top?:number;
        bottom?:number;
        right?:number
    }

    export interface LayoutOptionsInterface {
        id:string;
        stockChart:StockChart;
        height:any;
        margin?:MarginInterface;
    }

    export interface StockLayoutOptionsInterface {
        width?:number;
        height?:number;
        selection?:any;
        zoom?:boolean;
        margin?:MarginInterface;
        layouts:LayoutOptionsInterface[]
    }

}