module Asgard.Stock.Charts {

    export class Ohlc extends Base {

        draw():ChartInterface {

            var ohlcChartData = this.getOhlcData();

            ['up', 'down', 'equal'].forEach((key)=> {

                var className = Util.generateClassName(this, key),
                    stockChart = this.getStockChart(),
                    yScale = stockChart.getYScale(),
                    xScale = stockChart.getXScale();

                this.initPath(ohlcChartData[key], className).attr('d', (data:Data.DataInterface[]):string => {

                    return data.map((d:Data.DataInterface):string=> {
                        var open = yScale(d.open),
                            close = yScale(d.close),
                            rangeBand = this.barWidth(),
                            xPoint = xScale(d.date),
                            xValue = xScale(d.date) - rangeBand / 2;

                        return [
                            'M', xValue, open,
                            'l', rangeBand / 2, 0,
                            'M', xPoint, yScale(d.high),
                            'L', xPoint, yScale(d.low),
                            'M', xPoint, close,
                            'l', rangeBand / 2, 0
                        ].join(' ');
                    }).join(' ')
                }).classed(className, true).style('stroke-width', ()=> {
                    return Math.min(1, this.barWidth() / 2)
                });

            });

            return this;
        }
    }
}