module Asgard.Stock.Data{

    export var DEFAULT_X_SHOW_FIELD = 'date';
    export var DEFAULT_Y_SHOW_FIELD = 'price';

    export interface DataInterface {
        date:number;
        high:number;
        low:number;
        open:number;
        close:number;
        price:number;
        volume:number;
    }

    export interface DataPollInterface {
        [id:string]:DataInterface[]
    }

    export interface DataContainerInterface {
        getStockChart():StockChart;
        setStockChart(stockChart:StockChart):DataContainerInterface;
        setDefaultId(defaultId:string):DataContainerInterface;
        getDefaultId():string;
        setViewableClosePrice(viewableClosePrice:number):DataContainerInterface;
        getViewableClosePrice():number;
        getDataPoll():DataPollInterface;
        setDataPoll(dataPoll:DataPollInterface):DataContainerInterface;
        addData(options:Options.DataInterface):DataContainer;
        dataFormat(data:Object[]):DataInterface[];
        getDefaultData():DataInterface[];
        dataChange():DataContainer;
        getDataById(id:string):DataInterface[];
        getDataCount():number;
        getViewableChartData():DataPollInterface;
        getXDomain():Date[];
        getYDomain():number[];
        getMinAndMaxByPrice(data:DataPollInterface):number[];
        getMinAndMaxByField(data:DataPollInterface,field:string):number[];
        disposeMinAndMaxPrice(price:number[]):number[];
        calculateRange(price:number):number;
        getNearDataByDate(date:Date):DataInterface;
    }
}