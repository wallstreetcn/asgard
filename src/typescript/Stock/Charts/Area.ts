module Asgard.Stock.Charts {

    export class Area extends Line {

        drawArea():ChartInterface{

            var stockChart = this.getStockChart(),
                yScale = stockChart.getYScale(),
                xScale = stockChart.getXScale(),
                data = stockChart.getDataContainer().getDataById(this.getDataId()),
                className = Util.generateClassName(this, 'area'),
                d3SvgArea = d3.svg.area().interpolate('monotone').defined((d) => {
                    return d.close !== null;
                }).x((d) => {
                    return xScale(d.start);
                }).y0((d) => {
                    return yScale(0);
                }).y1((d) => {
                    return yScale(this.getPriceByPriceScource(d));
                });

            this.initSelection(data, className)
                .attr('d', d3SvgArea)
                .classed(className, true);

            return this;

        }

        draw():ChartInterface{
            this.drawLine();
            this.drawArea();
            this.isShowDot() && this.drawDot();
            return this;
        }


    }
}