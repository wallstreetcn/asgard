module Asgard.Stock.Charts {

    export class Area extends Line {

        drawArea():ChartInterface{

            var stockChart = this.getStockChart(),
                yScale = stockChart.getYScale(),
                xScale = stockChart.getXScale(),
                data = stockChart.getDataContainer().getDataById(this.getDataId()),
                className = Util.generateClassName(this, 'area'),
                d3SvgArea = d3.svg.area().interpolate('monotone').defined((d:Data.DataInterface):boolean => {
                    return d.close !== null;
                }).x((d:Data.DataInterface):number => {
                    return xScale(d.date);
                }).y0((d:Data.DataInterface):number => {
                    return yScale(0);
                }).y1((d:Data.DataInterface):number => {
                    return yScale(this.getPriceByPriceScource(d));
                });

            this.initPath(data, className)
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