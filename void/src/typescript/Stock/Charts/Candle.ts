module Asgard.Stock.Charts {

    export class Candle extends Ohlc {

        drawCandleRect(ohlcChartData:OhlcChartDataInterface):ChartInterface {

            ['up', 'down', 'equal'].forEach((key)=> {

                var className = Util.generateClassName(this, key),
                    stockChart = this.getStockChart(),
                    yScale = stockChart.getYScale(),
                    xScale = stockChart.getXScale();

                this.initPath(ohlcChartData[key], className).attr('d', (data:Data.DataInterface[]):string => {

                    return data.map((d):string => {
                        var path = [],
                            open = yScale(d.open),
                            close = yScale(d.close),
                            rangeBand = Math.max(xScale.band(), 1),
                            xValue = xScale(d.date) - rangeBand / 2;

                        path.push(
                            'M', xValue, open,
                            'l', rangeBand, 0
                        );

                        if (open != close) {
                            path.push(
                                'L', xValue + rangeBand, close,
                                'l', -rangeBand, 0,
                                'L', xValue, open
                            );
                        }

                        return path.join(' ');

                    }).join(' ')
                }).classed(className, true);

            });

            return this;
        }

        drawHighLowLine(ohlcChartData:OhlcChartDataInterface):ChartInterface {

            ['up', 'down', 'equal'].forEach((key)=> {

                var className = Util.generateClassName(this, 'high-low-line-' + key),
                    stockChart = this.getStockChart(),
                    yScale = stockChart.getYScale(),
                    xScale = stockChart.getXScale();

                this.initPath(ohlcChartData[key], className).attr('d', (data:Data.DataInterface[]):string => {

                    return data.map((d:Data.DataInterface):string => {

                        var path = [],
                            open = yScale(d.open),
                            close = yScale(d.close),
                            rangeBand = Math.max(xScale.band(), 1),
                            xPoint = xScale(d.date),
                            xValue = xPoint - rangeBand / 2;

                        // Top
                        path.push(
                            'M', xPoint, yScale(d.high),
                            'L', xPoint, Math.min(open, close)
                        );

                        if (open == close) {
                            path.push(
                                'M', xValue, open,
                                'l', rangeBand, 0
                            );
                        }
                        // Bottom
                        path.push(
                            'M', xPoint, Math.max(open, close),
                            'L', xPoint, yScale(d.low)
                        );

                        return path.join(' ');

                    }).join(' ');

                }).classed(className, true);
            });

            return this;
        }

        draw():ChartInterface {

            var ohlcChartData = this.getOhlcData();

            this.drawCandleRect(ohlcChartData);
            this.drawHighLowLine(ohlcChartData);

            return this;

        }
    }
}