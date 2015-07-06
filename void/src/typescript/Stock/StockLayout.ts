module Asgard.Stock {

    export interface StockLayoutInterface {

        getMargin():Layout.MarginInterface;
        setMargin(margin:Layout.MarginInterface):StockLayoutInterface;
        getD3Zoom():D3.Behavior.Zoom;
        setD3Zoom(d3Zoom:D3.Behavior.Zoom):StockLayoutInterface;
        initZoom():StockLayoutInterface;
        setZoom(zoom:boolean):StockLayoutInterface;
        isZoom():boolean;
        setXScale(xScale:any):StockLayoutInterface;
        getXScale():any;
        initXScale():StockLayoutInterface;
        getHiddenClass():string;
        setHiddenClass(hiddenClass:string):StockLayoutInterface;
        getVisibilityClass():string;
        setVisiblityClass(visibilityClass:string):StockLayoutInterface;
        getSvg():D3.Selection;
        setSvg(svg:D3.Selection):StockLayoutInterface;
        initSvg():StockLayoutInterface;
        setWidth(width:number):StockLayoutInterface;
        getWidth():number;
        setHeight(height:number):StockLayoutInterface;
        getHeight():number;
        getUsedHeight():number;
        setUsedHeight(usedHeight:number):StockLayoutInterface;
        addLayout(layoutOptions:Layout.LayoutOptionsInterface):StockLayoutInterface;
        getLayout(id:string):any;
        getLayouts():Layout.LayoutInterface[];
        initLayout():StockLayoutInterface;
        draw():StockLayoutInterface;
        getSelection():D3.Selection;
    }

    export class StockLayout implements StockLayoutInterface {

        protected zoom:boolean;
        protected width:number;
        protected height:number;
        protected selection:D3.Selection;
        protected svg:D3.Selection;
        protected hiddenClass:string = name + '-hide';
        protected visibilityClass:string = name + '-visibility-hidden';
        protected layouts:Layout.LayoutInterface[] = [];
        protected margin:Layout.MarginInterface;
        protected usedHeight:number = 0;
        protected xScale:any;
        protected d3Zoom:D3.Behavior.Zoom;

        constructor(selection:any, stockLayoutOptions:Layout.StockLayoutOptionsInterface) {
            this.selection = Util.convertSelection(selection);
            this.setHeight(stockLayoutOptions.height);
            this.setWidth(stockLayoutOptions.width);
            this.setZoom(stockLayoutOptions.zoom);

            var defaultMargin = Util.clone(Layout.defaultMargin);
            Util.extend(defaultMargin, stockLayoutOptions.margin);
            this.setMargin(defaultMargin);

            stockLayoutOptions.layouts.forEach((layout:Layout.LayoutOptionsInterface):void=> {
                this.addLayout(layout);
            });
        }


        getMargin():Layout.MarginInterface {
            return this.margin;
        }

        setMargin(margin:Layout.MarginInterface):StockLayoutInterface {
            this.margin = margin;
            return this;
        }


        getD3Zoom():D3.Behavior.Zoom {
            return this.d3Zoom;
        }

        setD3Zoom(d3Zoom:D3.Behavior.Zoom):StockLayoutInterface {
            this.d3Zoom = d3Zoom;
            return this;
        }

        initZoom():StockLayoutInterface {

            if (!this.getD3Zoom()) {

                var zoom = d3.behavior.zoom();

                this.getSvg().call(zoom);

                zoom.on('zoom', ()=> {
                    // d3.event.stopPropagation();
                    //// sync
                    //this.sync.forEach((stockChart:StockChart):void=> {
                    //    stockChart.setXScale(this.getXScale().copy());
                    //    stockChart.getD3Zoom().x(stockChart.getXScale()['zoomable']());
                    //    stockChart.draw();
                    //});

                    // 触发自定义事件
                    // this._zoomEvent.call(this, d3.event);

                    this.draw();

                });

                this.setD3Zoom(zoom);
            }

            return this;
        }

        setZoom(zoom:boolean):StockLayoutInterface {
            this.zoom = zoom;

            return this;
        }

        isZoom():boolean {
            return this.zoom;
        }

        setXScale(xScale:any):StockLayoutInterface {
            this.xScale = xScale;
            return this;
        }

        getXScale():any {
            return this.xScale;
        }

        initXScale():StockLayoutInterface {

            var xScale = this.getXScale(),
                margin = this.getMargin();

            if (!xScale) {
                xScale = window['financetDate']();
                this.setXScale(xScale);
            }

            xScale.range([0, this.getWidth() - margin.left - margin.right]);

            return this;
        }

        getHiddenClass():string {
            return this.hiddenClass;
        }

        setHiddenClass(hiddenClass:string):StockLayoutInterface {
            this.hiddenClass = hiddenClass;
            return this;
        }

        getVisibilityClass():string {
            return this.visibilityClass;
        }

        setVisiblityClass(visibilityClass:string):StockLayoutInterface {
            this.visibilityClass = visibilityClass;
            return this;
        }

        getLayouts():Layout.LayoutInterface[] {
            return this.layouts;
        }

        getSvg():D3.Selection {
            return this.svg;
        }

        setSvg(svg:D3.Selection):StockLayoutInterface {
            this.svg = svg;
            return this;
        }

        initSvg():StockLayoutInterface {

            var svg = this.getSvg();

            if (!svg) {
                svg = this.getSelection().append('svg')

                this.setSvg(svg);
            }

            svg.attr({
                width: this.getWidth(),
                height: this.getHeight()
            });

            return this;
        }

        getSelection():D3.Selection {
            return this.selection;
        }

        setWidth(width:number):StockLayoutInterface {
            this.width = width || this.getSelection().node().clientWidth;
            return this;
        }

        getWidth():number {
            return this.width;
        }

        setHeight(height:number):StockLayoutInterface {

            this.height = height || this.getSelection().node().clientHeight || document.documentElement.clientHeight;

            return this;
        }

        getHeight():number {
            return this.height;
        }

        getUsedHeight():number {
            return this.usedHeight;
        }

        setUsedHeight(usedHeight:number):StockLayoutInterface {
            this.usedHeight = usedHeight;
            return this;
        }

        addLayout(layoutOptions:Layout.LayoutOptionsInterface):StockLayoutInterface {

            this.layouts.push(new Layout.Layout(layoutOptions));

            return this;
        }

        getLayout(id:string):any {
            var i = 0, layouts = this.layouts, l = layouts.length;
            for (; i < l; i++) {
                var layout = layouts[i];
                if (layout.getId() === id) {
                    return layout;
                }
            }
            return false;
        }


        initLayout():StockLayoutInterface {

            // reset use height
            this.setUsedHeight(0);

            this.getLayouts().forEach((layout:Layout.LayoutInterface):void=> {

                var selection = layout.getSelection(),
                    height = layout.getHeight(),
                    percentHeight = layout.getPercentHeight();

                if (!selection) {
                    selection = this.getSvg().append('g');
                    layout.setSelection(selection);
                }

                if (!percentHeight) {
                    percentHeight = height / this.getHeight() * 100 + '%';
                }

                layout.height = height = Util.convertPercent(percentHeight) * this.getHeight();

                layout.percentHeight = percentHeight;

                selection.attr({
                    transform: 'translate(0,' + this.getUsedHeight() + ')'
                });

                this.setUsedHeight(this.getUsedHeight() + height);

            });

            return this;
        }


        draw():StockLayoutInterface {

            this.initXScale();
            this.initSvg();
            this.isZoom() && this.initZoom();
            this.initLayout();

            this.getLayouts().forEach((layout:Layout.LayoutInterface, i:number):void=> {

                var stockChart = layout.getStockChart(),
                    margin:Layout.MarginInterface = Util.clone(this.getMargin());

                // reset top , bottom
                if (i === 0) {
                    margin.bottom = 0;
                } else if (i === this.getLayouts().length - 1) {
                    margin.top = 0;
                } else {
                    margin.top = 0;
                    margin.bottom = 0;
                }

                // inject important property
                stockChart.setMargin(margin)
                    .setWidth(this.getWidth() - margin.left - margin.right)
                    .setHeight(layout.height - margin.top - margin.bottom)
                    .setSelection(layout.selection)
                    .setXScale(this.getXScale())
                    .setD3Zoom(this.getD3Zoom());

                stockChart.draw();
            });


            return this;
        }
    }
}