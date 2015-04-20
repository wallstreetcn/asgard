module Asgard.Stock.Charts {

    export class Ohlc extends Base {

        isUp(d:Data.ChartDataInterface):boolean {
            return d.open < d.close;
        }

        isDown(d:Data.ChartDataInterface):boolean {
            return d.open > d.close;
        }

        getOhlcData():OhlcChartDataInterface {

            return this.getStockChart()
                .getData()
                .getChartDataById(this.getChartDataId()).
                reduce((result:OhlcChartDataInterface, d:Data.ChartDataInterface):OhlcChartDataInterface => {
                    if (this.isUp(d)) {
                        result.up.push(d);
                    } else if (this.isDown(d)) {
                        result.down.push(d);
                    } else {
                        result.equal.push(d)
                    }
                    return result;
                }, {
                    up: [],
                    down: [],
                    equal: []
                });

        }

        draw():ChartInterface {

            var ohlcChartData = this.getOhlcData();

            ['up', 'down', 'equal'].forEach((key)=> {

                var className = Util.generateClassName(this, key),
                    stockChart = this.getStockChart(),
                    yScale = stockChart.getYScale(),
                    xScale = stockChart.getXScale();

                this.initSelection(ohlcChartData[key], className).attr('d', (data:Data.ChartDataInterface[]):string => {

                    return data.map((d:Data.ChartDataInterface):string=> {
                        var open = yScale(d.open),
                            close = yScale(d.close),
                            rangeBand = this.barWidth(),
                            xPoint = xScale(d.start),
                            xValue = xScale(d.start) - rangeBand / 2;

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