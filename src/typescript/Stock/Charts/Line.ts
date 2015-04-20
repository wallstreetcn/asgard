module Asgard.Stock.Charts {

    export class Line extends Base {

        protected priceSource;

        setPriceSource(priceSource:string):ChartInterface {
            this.priceSource = priceSource;
            return this;
        }

        getPriceSource():string {
            return this.priceSource;
        }

        parseOptions(options:Options.LineChartInterface):ChartInterface {

            super.parseOptions(options);

            this.setPriceSource(options.priceSource || 'close');

            return this;
        }

        getPriceByPriceScource(data:Data.ChartDataInterface):number {

            switch (this.getPriceSource()) {
                case 'hl2':
                    return (data.high + data.low) / 2;
                case 'hlc2':
                    return (data.high + data.low + data.close) / 2;
                case 'ohlc4':
                    return (data.open + data.high + data.low + data.close) / 2;
                case 'open':
                case 'close':
                case 'high':
                case 'low':
                    return data[this.getPriceSource()];
            }
        }

        drawLine():ChartInterface {

            var stockChart = this.getStockChart(),
                yScale = stockChart.getYScale(),
                xScale = stockChart.getXScale(),
                data = stockChart.getData().getChartDataById(this.getChartDataId()),
                className = Util.generateClassName(this, 'line'),
                d3SvgLine = d3.svg.line().interpolate('monotone').defined((d) => {
                    return d.close !== null;
                }).x((d) => {
                    return xScale(d.start);
                }).y((d) => {
                    return yScale(this.getPriceByPriceScource(d));
                });

            this.initSelection(data, className)
                .attr('d', d3SvgLine)
                .classed(className, true);

            return this;
        }

        draw():ChartInterface {
            this.drawLine();
            return this;
        }

    }


}