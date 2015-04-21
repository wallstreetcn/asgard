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
        protected dataContainer:Stock.Data.DataContainerInterface;
        protected sync:StockChart[] = [];

        protected baseDom:D3.Selection;
        protected dataDom:D3.Selection;

        protected xScale:any;
        protected yScale:any;

        protected d3Zoom:D3.Behavior.Zoom;


        constructor(selection:any, options:Stock.Options.StockChartInterface = {}) {

            // selection 不能修改，所以不用setSelection
            this.selection = Util.convertSelection(selection);

            this.parseOptions(options);
        }

        parseOptions(options:Stock.Options.StockChartInterface) {

            var defaultOptions = Stock.Options.DefaultStockChart;

            // extend options
            Util.extend(defaultOptions, options);

            // set important property
            this.setMargin(defaultOptions.margin);
            this.setWidth(defaultOptions.width);
            this.setHeight(defaultOptions.height);
            this.setInterval(defaultOptions.interval);

            this.setDebug(defaultOptions.debug);
            this.setResize(defaultOptions.resize);
            this.setHiddenClass(defaultOptions.hiddenClass);
            this.setVisibilityClass(defaultOptions.visibilityClass);
            this.setDataContainer(new Stock.Data.DataContainer(this));

            this.initDom();
            this.initScale();

            defaultOptions.data.forEach((dataOptions:Stock.Options.DataInterface):void=> {
                this.addData(dataOptions);
            })

            defaultOptions.charts.forEach((chartOptions:Stock.Options.ChartInterface):void => {
                this.addChart(chartOptions);
            });

            defaultOptions.components.forEach((componentOptions:Stock.Options.ComponentInterface):void => {
                this.addComponent(componentOptions);
            });

            // trigger data change
            this.getDataContainer().dataChange();

            // zoom 必须在数据填充后, xScale可以获取
            this.setZoom(defaultOptions.zoom);


        }

        initZoom():StockChart {

            var zoom = this.getD3Zoom();

            this.getBaseDom().call(zoom);

            var zoomable = this.getXScale()['zoomable']();//.domain([30, 10000]);

            // @todo: domain 需要在dataChange后改变
            zoom.x(zoomable).on('zoom', ()=> {
                // sync
                this.sync.forEach((stockChart:StockChart):void=>{



                    stockChart.getD3Zoom().scale(this.getD3Zoom().scale());

                    stockChart.getD3Zoom()['event'](stockChart.getBaseDom());
                });

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

        initDom():StockChart {

            var margin = this.getMargin(),
                baseDom = this.getSelection()
                    .append('svg')
                    .attr({
                        width: this.getWidth() + margin.left + margin.right,
                        height: this.getHeight() + margin.top + margin.bottom
                    }),
                dataDom = baseDom
                    .append('g').attr({
                        transform: 'translate(' + margin.left + ',' + margin.top + ')',
                        width: this.getWidth(),
                        height: this.getHeight()
                    });

            var dataClipId = +new Date();

            var dataClip = dataDom
                .append('g')
                .attr('clip-path', 'url(#plotAreaClip-'+dataClipId+')');

            dataClip.append('clipPath')
                .attr('id', 'plotAreaClip-' + dataClipId).append('rect')
                .attr({
                    width: this.getWidth(),
                    height: this.getHeight()
                });

            this.setBaseDom(baseDom);
            this.setDataDom(dataClip);

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

        getBaseDom():D3.Selection {
            return this.baseDom;
        }

        setBaseDom(baseDom:D3.Selection):StockChart {
            this.baseDom = baseDom;
            return this;
        }

        getDataDom():D3.Selection {
            return this.dataDom;
        }

        setDataDom(dataDom:D3.Selection):StockChart {
            this.dataDom = dataDom;
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

            if (this.zoom) {
                this.initZoom();
            }
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

        addChart(chartOptions:Stock.Options.ChartInterface):StockChart {

            var type = Util.capitalize(chartOptions.type);


            var chart = new Stock.Charts[type](this, chartOptions);

            this.charts[chart.getId()] = chart;

            return this;
        }

        addData(dataOptions:Stock.Options.DataInterface):StockChart {
            this.getDataContainer().addData(dataOptions)
            return this;
        }

        setDataContainer(dataContainer:Stock.Data.DataContainerInterface):StockChart {
            this.dataContainer = dataContainer;
            return this;
        }

        getDataContainer():Stock.Data.DataContainerInterface {
            return this.dataContainer;
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

        draw():StockChart {

            this.getYScale().domain(this.getDataContainer().getYDomain());

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

        addSync(stockChart:StockChart):StockChart {
            this.sync.push(stockChart);
            return this;
        }


    }

}