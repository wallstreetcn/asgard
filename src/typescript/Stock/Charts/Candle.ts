module Asgard.Stock.Charts {

    export class Candle extends Base {

        isUp(d:Data.ChartDataInterface):boolean {
            return d.open < d.close;
        }

        isDown(d:Data.ChartDataInterface):boolean {
            return d.open > d.close;
        }

        drawCandleRect(data:any):ChartInterface {

            ['up', 'down', 'equal'].forEach((key)=> {

                var className = Util.generateClassName(this,key),
                    stockChart = this.getStockChart(),
                    yScale = stockChart.getYScale(),
                    xScale = stockChart.getXScale(),
                    selection:any = this.getContainer()
                                        .selectAll('path.' + className)
                                        .data([data[key]]);

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('path');
                    }
                }


                selection.attr('d', function (data) {

                    return data.map(function (d) {
                        var path = [],
                            open = yScale(d.open),
                            close = yScale(d.close),
                            rangeBand = Math.max(xScale.band(), 1),
                            xValue = xScale(d.start) - rangeBand / 2;

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
                }).classed(Util.generateClassName(this, key), true);

            });

            return this;
        }

        drawHighLowLine(data:any):ChartInterface {

            ['up', 'down', 'equal'].forEach((key)=> {

                var className = Util.generateClassName(this, 'high-low-line-' + key),
                    stockChart = this.getStockChart(),
                    yScale = stockChart.getYScale(),
                    xScale = stockChart.getXScale(),

                    selection:any = this.getContainer()
                        .selectAll('path.' + className)
                        .data([data[key]]);

                if (selection.empty()) {
                    selection = selection.enter().append('path');
                } else {
                    if (selection.enter().empty()) {
                        selection.exit().remove();
                    } else {
                        selection.enter().append('path');
                    }
                }

                selection.attr('d', function (data) {

                    return data.map(function (d) {

                        var path = [],
                            open = yScale(d.open),
                            close = yScale(d.close),
                            rangeBand = Math.max(xScale.band(), 1),
                            xPoint = xScale(d.start),
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

            var data = this.getStockChart()
                .getData()
                .getChartDataById(this.getChartDataId()).
                reduce((result, d) => {
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

            console.log(data);

            this.drawCandleRect(data);
            this.drawHighLowLine(data);

            return this;

        }
    }
}