module Asgard.Stock.Components {

    export class Axis extends Base {

        private orient:string;
        private d3Axis:D3.Svg.Axis;
        private tickPercent:boolean;
        private showField:string;

        setShowField(showField:string):ComponentInterface {

            switch (this.getOrient()) {
                case 'left':
                case 'right':
                    this.showField = showField || Data.DEFAULT_Y_SHOW_FIELD;
                    break;
                case 'top':
                case 'bottom':
                    // top bottom 必须是 date
                    this.showField = Data.DEFAULT_X_SHOW_FIELD;
                    break;
            }

            return this;
        }

        getShowField():string {
            return this.showField;
        }

        setTickPercent(tickPercent:boolean):ComponentInterface {
            this.tickPercent = tickPercent;
            return this;
        }

        getTickPercent():boolean {
            return this.tickPercent;
        }

        setOrient(orient:string):ComponentInterface {

            if (orient) {
                switch (orient) {
                    case 'left':
                    case 'right':
                    case 'top':
                    case 'bottom':
                        this.orient = orient;
                        this.d3Axis.orient(orient);
                        break;
                    default :
                        //if (this.getStockChart().isDebug()) {
                        //    throw new Error('Axis组件orient属性必须为left、right、top、bottom');
                        //}
                }
            }
            return this;
        }

        getOrient():string {
            return this.orient;
        }

        getD3Axis():D3.Svg.Axis {
            return this.d3Axis;
        }

        setD3Axis(d3Axis:D3.Svg.Axis):ComponentInterface {
            this.d3Axis = d3Axis;
            return this;
        }

        percentTickPercentFormat():ComponentInterface {
            this.getD3Axis().tickFormat((d:number):string=> {
                return d3.format(',.2fs')(this.getStockChart().getDataContainer().calculateRange(d) * 100) + '%';
            });
            return this;
        }

        parseOptions(options:Options.AxisComponentInterface):ComponentInterface {

            super.parseOptions(options);

            if (!this.getD3Axis()) {
                this.setD3Axis(d3.svg.axis());
            }

            this.setTickPercent(options.tickPercent);

            this.setOrient(options.orient);

            this.setShowField(options.showField);

            this.getD3Axis()
                .innerTickSize(0)
                .outerTickSize(0);//.tickPadding(10);

            if (this.getTickPercent()) {
                this.percentTickPercentFormat();
            }

            return this;
        }

        draw():ComponentInterface {

            // scale may be change
            this.getD3Axis().scale(this.getScaleByOrient())

            var selection:any = this.getSelection().selectAll('g').data([this]);

            if (selection.empty()) {
                selection = selection.enter().append('g');
            }

            selection.attr(this.getTransformByOrient());

            selection.call(this.getD3Axis());

            return this;

        }

        protected getTransformByOrient():Object {
            var x,
                y,
                stockChart = this.getStockChart(),
                margin = stockChart.getMargin(),
                width = stockChart.getWidth(),
                height = stockChart.getHeight();


            switch (this.getOrient()) {
                case 'left':
                    x = margin.left;
                    y = margin.top;
                    break;
                case 'right':
                    x = margin.left + width;
                    y = margin.top;
                    break;
                case 'bottom':
                    x = margin.left;
                    y = height + margin.top;
                    break;

                case 'top':
                    x = margin.left;
                    y = margin.top;
                    break;

            }

            return {'transform': 'translate(' + x + ',' + y + ')'};
        }

        protected getScaleByOrient():any {
            switch (this.getOrient()) {
                case 'bottom':
                case 'top':
                    return this.getStockChart().getXScale();
                    break;
                case 'left':
                case 'right':
                    return this.getStockChart().getYScale();
                    break;
            }
        }

    }

}