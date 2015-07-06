module Asgard.Stock {

    export interface StockChartInterface {

        setMargin(margin:Layout.MarginInterface):StockChart;
        draw():StockChart;
    }

    export class StockChart implements StockChartInterface {

        protected options:Options.StockChartInterface;

        protected charts:Charts.ChartsInterface = {};
        protected components:Components.ComponentsInterface = {};

        // object
        protected dataContainer:Data.DataContainerInterface;

        protected dataSelection:D3.Selection;
        protected dataClipSelection:D3.Selection;

        protected xScale:any;
        protected yScale:any;

        protected d3Zoom:D3.Behavior.Zoom;
        protected zoom:boolean;
        protected debug:boolean;

        protected width:number;
        protected height:number;
        protected margin:Layout.MarginInterface;
        protected selection:D3.Selection;


        constructor(options:Options.StockChartInterface = {}) {

            var defaultOptions = new Options.DefaultStockChart();
            // extend options
            Util.extend(defaultOptions, options);
            this.setOptions(defaultOptions);

            // init Data Container
            this.setDataContainer(new Data.DataContainer(this));

        }

        setMargin(margin:Layout.MarginInterface):StockChart {
            this.margin = margin;
            return this;
        }

        getMargin():Layout.MarginInterface {
            return this.margin;
        }

        setDebug(debug):StockChart {
            this.debug = debug;
            return this;
        }

        isDebug():boolean {
            return this.debug;
        }


        setSelection(selection:D3.Selection) {
            this.selection = selection;
            return this;
        }

        getSelection():D3.Selection {
            return this.selection;
        }

        setHeight(height:number):StockChart {
            this.height = height;
            return this;
        }

        setWidth(width:number):StockChart {
            this.width = width;
            return this;
        }

        getHeight():number {
            return this.height;
        }

        getWidth():number {
            return this.width;
        }

        setOptions(options:Options.StockChartInterface):StockChart {
            this.options = options;
            return this;
        }

        getOptions():Options.StockChartInterface {
            return this.options;
        }

        clearOptions():StockChart {
            this.options = null;
            return this;
        }

        parseOptions(options:Options.StockChartInterface) {

            options.data.forEach((dataOptions:Options.DataInterface):void=> {
                this.addData(dataOptions);
            });

            options.charts.forEach((chartOptions:Options.ChartInterface):void => {
                this.addChart(chartOptions);
            });

            options.components.forEach((componentOptions:Options.ComponentInterface):void => {
                this.addComponent(componentOptions);
            });

            // clearOptions
            this.clearOptions();

        }

        getD3Zoom():D3.Behavior.Zoom {
            return this.d3Zoom;
        }

        setD3Zoom(d3Zoom:D3.Behavior.Zoom):StockChart {
            this.d3Zoom = d3Zoom;
            return this;
        }


        initYScale():StockChart {

            var yScale = this.getYScale();

            if (!yScale) {
                yScale = d3.scale.linear();
                this.setYScale(yScale);
            }

            yScale.range([this.getHeight(), 0]);

            return this;
        }

        initContainer():StockChart {

            var margin = this.getMargin(),
                dataSelection = this.getDataSelection(),
                dataClipSelection = this.getDataClipSelection();

            if (!dataSelection) {
                dataSelection = this.getSelection().append('g');
                this.setDataSelection(dataSelection);
            }

            dataSelection.attr({
                transform: 'translate(' + margin.left + ',' + margin.top + ')'
            });

            if (!dataClipSelection) {
                var dataClipId = +new Date(),
                    dataClipSelection = dataSelection.append('g').attr('clip-path', 'url(#plotAreaClip-' + dataClipId + ')');

                dataClipSelection.append('clipPath').attr('id', 'plotAreaClip-' + dataClipId).append('rect');

                this.setDataClipSelection(dataClipSelection);
            }

            dataClipSelection.select('rect').attr({
                width: this.getWidth(),
                height: this.getHeight()
            });

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


        getDataClipSelection():D3.Selection {
            return this.dataClipSelection;
        }

        setDataClipSelection(dataClipSelection:D3.Selection):StockChart {
            this.dataClipSelection = dataClipSelection;
            return this;
        }

        getDataSelection():D3.Selection {
            return this.dataSelection;
        }

        setDataSelection(dataSelection:D3.Selection):StockChart {
            this.dataSelection = dataSelection;
            return this;
        }


        addComponent(componentOptions:Options.ComponentInterface):StockChart {

            var type = Util.capitalize(componentOptions.type);

            var component = new Components[type](this, componentOptions);

            this.components[component.getId()] = component;

            return this;
        }

        addChart(chartOptions:Options.ChartInterface):StockChart {

            var type = Util.capitalize(chartOptions.type);

            var chart = new Charts[type](this, chartOptions);

            this.charts[chart.getId()] = chart;

            return this;
        }

        addData(dataOptions:Options.DataInterface):StockChart {
            this.getDataContainer().addData(dataOptions);

            return this;
        }

        setDataContainer(dataContainer:Data.DataContainerInterface):StockChart {
            this.dataContainer = dataContainer;
            return this;
        }

        getDataContainer():Data.DataContainerInterface {
            return this.dataContainer;
        }

        getComponents():Components.ComponentsInterface {
            return this.components;
        }

        getCharts():Charts.ChartsInterface {
            return this.charts;
        }

        draw():StockChart {

            //if (this.isZoom() && !this.getD3Zoom()) {
            //
            //    this.setD3Zoom(d3.behavior.zoom());
            //    this.initZoom();
            //}

            this.initContainer();
            this.initYScale();

            if (this.getOptions()) {
                this.parseOptions(this.getOptions());
            }

            this.getD3Zoom().x(this.getXScale()['zoomable']());

            this.getYScale().domain(this.getDataContainer().getYDomain());

            this.getDataContainer().dataChange();


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