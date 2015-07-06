module Asgard.Stock.Charts {

    export class Volume extends Ohlc {

        draw():ChartInterface {

            var stockChart = this.getStockChart(),
                data = stockChart.getDataContainer().getDataById(this.getDataId()),
                ohlcData = this.getOhlcData(),
                yScale = stockChart.getYScale(),
                xScale = stockChart.getXScale();

            ['up', 'down', 'equal'].forEach((key:string):void=>{

                var className = Util.generateClassName(this , key);

                this.initPath(ohlcData[key], className)
                    .attr('d', (data:Data.DataInterface[]):string=> {
                        return data.map((d:Data.DataInterface):string=> {

                            var vol = d.volume;

                            if (isNaN(vol)) return null;

                            var zero = yScale(0),
                                height = yScale(vol) - zero,
                                rangeBand = this.barWidth(),
                                xValue = xScale(d.date) - rangeBand / 2;

                            return [
                                'M', xValue, zero,
                                'l', 0, height,
                                'l', rangeBand, 0,
                                'l', 0, -height
                            ].join(' ');
                        }).join(' ');
                    }).classed(className, true);
            });

            return this;
        }


    }

}