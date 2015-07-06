module Asgard.Stock.Charts {

    export class Line extends Base {

        protected priceSource:string;
        protected showDot:boolean;

        setShowDot(showDot:boolean):ChartInterface {
            this.showDot = showDot;
            return this;
        }

        isShowDot():boolean {
            return this.showDot;
        }

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

            this.setShowDot(options.showDot);

            return this;
        }

        getPriceByPriceScource(data:Data.DataInterface):number {

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

        drawDot():ChartInterface {

            var stockChart = this.getStockChart(),
                yScale = stockChart.getYScale(),
                xScale = stockChart.getXScale(),
                data = stockChart.getDataContainer().getDataById(this.getDataId()),
                className = Util.generateClassName(this, 'dot');

            this.initPath(data, className).attr('d', (data:Data.DataInterface[]):string => {

                return data.map((d:Data.DataInterface):string => {

                    var path = [],
                        r = this.barWidth() / 4,
                        cx = xScale(d.date),
                        cy = yScale(this.getPriceByPriceScource(d));

                    /**
                     * <path d="
                     *   M cx cy
                     *   m -r, 0
                     *   a r,r 0 1,1 (r * 2),0
                     *   a r,r 0 1,1 -(r * 2),0
                     *  "
                     *  />
                     */
                    path.push(
                        'M', cx, ',', cy,
                        'm', -r, ',', 0,
                        'a', r, ',', r, 0, 1, ',', 1, r * 2, 0,
                        'a', r, ',', r, 0, 1, ',', 1, -r * 2, 0
                    );

                    return path.join(' ');

                }).join(' ');

            }).classed(className, true);

            return this;
        }

        drawLine():ChartInterface {

            var stockChart = this.getStockChart(),
                yScale = stockChart.getYScale(),
                xScale = stockChart.getXScale(),
                data = stockChart.getDataContainer().getDataById(this.getDataId()),
                className = Util.generateClassName(this, 'line'),
                d3SvgLine = d3.svg.line().interpolate('monotone').defined((d) => {
                    return d.close !== null;
                }).x((d) => {
                    return xScale(d.date);
                }).y((d) => {
                    return yScale(this.getPriceByPriceScource(d));
                });

            this.initPath(data, className)
                .attr('d', d3SvgLine)
                .classed(className, true);

            return this;
        }

        draw():ChartInterface {
            this.drawLine();
            this.isShowDot() && this.drawDot();
            return this;
        }

    }


}