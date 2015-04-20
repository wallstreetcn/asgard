module Asgard.Stock.Charts {

    export class Volume extends Ohlc {

        volumeHeight:number;


        parseOptions(options:Options.VolumeChartInterface):ChartInterface {

            super.parseOptions(options);

            this.setVolumeHeight(options.volumeHeight || this.getStockChart().getHeight() * 0.3);

            return this;
        }

        setVolumeHeight(volumeHeight:number):ChartInterface {
            this.volumeHeight = volumeHeight;
            return this;
        }


        getVolumeHeight():number {
            return this.volumeHeight;
        }



        draw():ChartInterface {

            var stockChart = this.getStockChart(),
                data = stockChart.getData().getChartDataById(this.getChartDataId()),
                yScale = d3.scale.linear()
                    .range([this.getVolumeHeight(), 0])
                    .domain([0, d3.max(data, (d:Data.ChartDataInterface):number=> {
                        return d.volume;
                    })]),
                xScale = stockChart.getXScale(),
                className = Util.generateClassName(this);


            //@todo:........ this this this
            //['up', 'down', 'equal'].forEach((key:string))

            this.initSelection(data, className)
                .attr('transform','translate(' + 0 + ',' + (stockChart.getHeight() - this.getVolumeHeight()) + ')')
                .attr('d', (data:Data.ChartDataInterface[]):string=> {
                    return data.map((d:Data.ChartDataInterface):string=> {

                        var vol = d.volume;

                        if (isNaN(vol)) return null;

                        var zero = yScale(0),
                            height = yScale(vol) - zero,
                            rangeBand = this.barWidth(),
                            xValue = xScale(d.start) - rangeBand / 2;

                        return [
                            'M', xValue, zero,
                            'l', 0, height,
                            'l', rangeBand, 0,
                            'l', 0, -height
                        ].join(' ');
                    }).join(' ');
                }).classed(className, true);


            return this;
        }


    }

}