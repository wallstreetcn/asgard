module Asgard {

    export class StockChart {

        protected width:number;
        protected height:number;
        protected margin:Stock.Options.MarginInterface
        protected interval:string;
        protected selection:D3.Selection;

        protected zoom:boolean;
        protected debug:boolean;
        protected resize:boolean;

        protected hiddenClass:string;
        protected visibilityClass:string;

        protected charts:Stock.Charts.ChartsInterface = {};
        protected components:Stock.Components.ComponentsInterface = {};
        protected data:Stock.Data.Data;

        protected baseContainer:D3.Selection;
        protected dataContainer:D3.Selection;

        protected xScale:any;
        protected yScale:any;

        protected d3Zoom:D3.Behavior.Zoom;

        constructor(selection:any, options:Stock.Options.StockChartInterface = {}) {

            // selection 不能修改，所以不用setSelection
            this.selection = Util.convertSelection(selection);

            var defaultOptions = Stock.Options.DefaultStockChart;
            // extend options
            Util.extend(defaultOptions,options);
            // set important property
            this.setMargin(defaultOptions.margin).setWidth(defaultOptions.width).setHeight(defaultOptions.height);

            this.initScale();
            this.initContainer();

            for (var key in defaultOptions) {
                switch (key) {
                    case 'width':
                    case 'height':
                    case 'margin':
                        continue;
                }

                var methodName = 'set' + Util.capitalize(key);
                methodName in this && this[methodName](defaultOptions[key]);
            }

            this.isZoom() && this.initZoom();
        }

        initZoom():StockChart {

            var zoom = this.getD3Zoom();

            this.getBaseContainer().call(zoom);

            // @todo: domain 需要在dataChange后改变
            zoom.x(this.getXScale()['zoomable']().domain([30,10000])).on('zoom', ()=> {

                // y 不缩放，所以计算当前范围内的最高和最低价格
                this.getYScale().domain(this.getData().getYdomain());

                // 触发自定义事件
                // this._zoomEvent.call(this, d3.event);

                this.draw();

            });


            return this;
        }

        initScale():StockChart {

            if (!this.getXScale()) {
                // @todo : xscale...
                this.setXScale(window['financetDate']());
            }

            this.getXScale().range([0, this.getWidth()]);

            if (!this.getYScale()) {
                this.setYScale(d3.scale.linear());
            }
            this.getYScale().range([this.getHeight(), 0]);

            return this;
        }

        initContainer():StockChart {

            var margin = this.getMargin(),
                baseContianer = this.getSelection()
                    .append('svg')
                    .attr({
                        width: this.getWidth() + margin.left + margin.right,
                        height: this.getHeight() + margin.top + margin.bottom
                    }),
                dataContainer = baseContianer
                    .append('g').attr({
                        transform: 'translate(' + margin.left + ',' + margin.top + ')',
                        width: this.getWidth(),
                        height: this.getHeight()
                    });


            var dataClip = dataContainer
                .append('g')
                .attr('clip-path', 'url(#plotAreaClip)');

            dataClip.append('clipPath')
                .attr('id', 'plotAreaClip').append('rect')
                .attr({
                    width: this.getWidth(),
                    height: this.getHeight()
                });

            this.setBaseContainer(baseContianer);
            this.setDataContainer(dataClip);

            return this;
        }

        setYScale(yScale:any):StockChart {
            this.yScale = yScale;
            return this;
        }

        setXScale(xScale:any):StockChart {
            this.xScale = xScale;
            return this;
        }

        getXScale():any {
            return this.xScale;
        }

        getYScale():any {
            return this.yScale;
        }

        getBaseContainer():D3.Selection {
            return this.baseContainer;
        }

        setBaseContainer(baseContainer:D3.Selection):StockChart {
            this.baseContainer = baseContainer;
            return this;
        }

        getDataContainer():D3.Selection {
            return this.dataContainer;
        }

        setDataContainer(dataContainer:D3.Selection):StockChart {
            this.dataContainer = dataContainer;
            return this;
        }

        getSelection():D3.Selection {
            return this.selection;
        }

        setWidth(width:number):StockChart {
            this.width = (width || this.getSelection().node().clientWidth) - this.getMargin().left - this.getMargin().right;
            return this;
        }

        getWidth():number {
            return this.width;
        }

        setHeight(height:number):StockChart {
            this.height = (height || this.getSelection().node().clientHeight) - this.getMargin().top - this.getMargin().bottom;
            return this;
        }

        getHeight():number {
            return this.height;
        }

        setDebug(debug:boolean):StockChart {
            this.debug = debug;
            return this;
        }

        isDebug():boolean {
            return this.debug;
        }

        setMargin(margin:Stock.Options.MarginInterface):StockChart {
            this.margin = margin;
            return this;
        }

        getMargin():Stock.Options.MarginInterface {
            return this.margin;
        }

        setInterval(interval:string):StockChart {

            this.interval = interval;

            return this;
        }

        getInterval():string {
            return this.interval;
        }

        isZoom():boolean {
            return this.zoom;
        }

        setZoom(zoom:boolean):StockChart {
            this.zoom = zoom;
            // @todo if set zoom .. need init zooom
            return this;
        }

        isResize():boolean {
            return this.resize;
        }

        setResize(resize:boolean):StockChart {
            this.resize = resize;
            // @todo if set resize .. need init resize
            return this;
        }

        getHiddenClass():string {
            return this.hiddenClass;
        }

        setHiddenClass(hiddenClass:string):StockChart {
            this.hiddenClass = hiddenClass;
            return this;
        }

        getVisibilityClass():string {
            return this.visibilityClass;
        }

        setVisibilityClass(visibilityClass:string):StockChart {
            this.visibilityClass = visibilityClass;
            return this;
        }

        addComponent(componentOptions:Stock.Options.ComponentInterface):StockChart {

            var type = Util.capitalize(componentOptions.type);


            var component = new Stock.Components[type](this, componentOptions);

            this.components[component.getId()] = component;

            return this;
        }

        setComponents(componentsOptions:Stock.Options.ComponentInterface[]):StockChart {

            // @todo need remove all components
            componentsOptions.forEach((componentOptions:Stock.Options.ComponentInterface):void => {
                this.addComponent(componentOptions);
            });

            return this;
        }

        addChart(chartOptions:Stock.Options.ChartInterface):StockChart {

            var type = Util.capitalize(chartOptions.type);


            var chart = new Stock.Charts[type](this, chartOptions);

            this.charts[chart.getId()] = chart;

            return this;
        }

        setCharts(chartsOptions:Stock.Options.ChartInterface[]):StockChart {

            // @todo need remove all charts
            chartsOptions.forEach((chartOptions:Stock.Options.ChartInterface):void => {
                this.addChart(chartOptions);
            });

            return this;
        }


        addData(dataOptions:Stock.Options.DataInerface):StockChart {
            this.getData().addData(dataOptions)
            return this;
        }

        getData():Stock.Data.Data {
            return this.data;
        }

        getD3Zoom():D3.Behavior.Zoom {
            if (!this.d3Zoom) {
                this.setD3Zoom(d3.behavior.zoom());
            }
            return this.d3Zoom;
        }

        setD3Zoom(d3Zoom:D3.Behavior.Zoom):StockChart {
            this.d3Zoom = d3Zoom;
            return this;
        }

        getComponents():Stock.Components.ComponentsInterface {
            return this.components;
        }

        getCharts():Stock.Charts.ChartsInterface {
            return this.charts;
        }

        setData(dataOptions:Stock.Options.DataInerface[]):StockChart {

            // reset data;
            this.data = new Stock.Data.Data(this);
            dataOptions.forEach((_dataOptions:Stock.Options.DataInerface):void=> {
                this.addData(_dataOptions);
            })

            return this;
        }

        draw():StockChart {

            var components = this.getComponents(),
                charts = this.getCharts();

            for (var id in components) {
                components[id].draw();
            }
            for (var id in charts) {
                charts[id].draw();
            }

            return this;
        }


    }

}