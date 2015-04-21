module Asgard.Stock.Charts {

    export class Volume extends Ohlc {

        volumeHeight:number;

        parseOptions(options:Options.VolumeChartInterface):ChartInterface {

            super.parseOptions(options);

            this.setVolumeHeight(options.volumeHeight || this.getStockChart().getHeight());

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
                data = stockChart.getDataContainer().getDataById(this.getDataId()),
                ohlcData = this.getOhlcData(),
                yScale = d3.scale.linear()
                    .range([this.getVolumeHeight(), 0])
                    .domain([0, d3.max(data, (d:Data.DataInterface):number=> {
                        return d.volume;
                    })]),
                xScale = stockChart.getXScale();

            ['up', 'down', 'equal'].forEach((key:string):void=>{

                var className = Util.generateClassName(this , key);

                this.initSelection(ohlcData[key], className)
                    .attr('transform','translate(' + 0 + ',' + (stockChart.getHeight() - this.getVolumeHeight()) + ')')
                    .attr('d', (data:Data.DataInterface[]):string=> {
                        return data.map((d:Data.DataInterface):string=> {

                            var vol = d.volume;

                            if (isNaN(vol)) return null;

                            var zero = yScale(0),
                                height = yScale(vol) - zero,
                                rangeBand = this.barWidth(),
                                xValue = xScale(d.date) - rangeBand / 2;

                            return [
                                'M', xValue, zero,
                                'l', 0, height,
                                'l', rangeBand, 0,
                                'l', 0, -height
                            ].join(' ');
                        }).join(' ');
                    }).classed(className, true);
            });

            return this;
        }


    }

}