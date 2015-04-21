module Asgard.Stock.Components {

    export class Tips extends Base {

        xLineContainer:D3.Selection;
        yLineContainer:D3.Selection;

        draw():ComponentInterface{

            var stockChart = this.getStockChart(),
                tips = this,
                xClassName = Util.generateClassName(this, 'x'),
                yClassName = Util.generateClassName(this, 'y'),
                xLineContainer = this.xLineContainer,
                yLineContainer = this.yLineContainer;

            if (!this.xLineContainer) {
                xLineContainer = this.xLineContainer = this.getContainer().append('line').classed(xClassName, true);
            }

            if (!this.yLineContainer) {
                yLineContainer = this.yLineContainer = this.getContainer().append('line').classed(yClassName, true);
            }

            stockChart.getBaseDom().on('mousemove', function () {

                var x = d3.mouse(this)[0],
                    y = d3.mouse(this)[1],
                    margin = stockChart.getMargin(),
                    width = stockChart.getWidth(),
                    height = stockChart.getHeight(),
                    visibilityClass = stockChart.getVisibilityClass();


                if (x < margin.left || x > (margin.left + width) || y < margin.top || y > (margin.top + height)) {
                    xLineContainer.classed(visibilityClass, true);
                    yLineContainer.classed(visibilityClass, true);
                    return;
                }

                var date = stockChart.getXScale().invert(x - margin.left);

                var nearData = stockChart.getDataContainer().getNearDataByDate(date);

                var nearDataX = stockChart.getXScale()(nearData['date']) + margin.left;

                xLineContainer.attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y).classed(visibilityClass, false).attr('transform', 'translate(' + margin.left + ',0)');
                yLineContainer.attr('x1', nearDataX).attr('y1', 0).attr('x2', nearDataX).attr('y2', height).classed(visibilityClass, false).attr('transform', 'translate(0,' + margin.top + ')');

                //tips._show.call(this, tips, stock, nearData, d3.mouse(this), this);

            });


            return this;
        }
    }
}