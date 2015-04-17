angular.module('asgard', [])

    .value('urls', {
        chart: 'http://api.markets.wallstreetcn.com:80/v1/chart.json'
    })


    .controller('exampleController', ['$scope', '$http', 'urls', function ($scope, $http, urls) {

        // event
        var leftOptions = angular.element('.left-options'),
            leftOptionsControlButton = angular.element('.left-options-control button'),
            leftOptionsCloseButton = angular.element('.left-options-close');

        leftOptionsCloseButton.on('click',function(){
            leftOptions.animate({left:-300},function(){
                leftOptionsControlButton.removeClass('close-status');
            });
        });

        leftOptionsControlButton.on('click',function(){
            leftOptionsControlButton.addClass('close-status');
            leftOptions.animate({left:0});
        });

        $scope.messages = {
            SHOW_CONTAINER: '已显示的',
            HIDE_CONTAINER: '已隐藏的',
            USE_COMPONENT: '已使用',
            USE_CHART: '已使用',
            USE_DATA: '已使用',
            USE_UNUSED_COMPONENT: '未使用',
            NONE_SELECTED_SHOW_CONTAINER: '请选择需要显示的Container',
            NONE_SELECTED_HIDE_CONTAINER: '请选择需要隐藏的Container',
            NONE_SELECTED_REMOVE_CHART: '请选择需要删除的Chart',
            NONE_SELECTED_REMOVE_COMPONENT: '请选择需要删除的Component',
            NONE_SELECTED_UNUSED_COMPONENT: '请选择需要使用的Component',
            NONE_SELECTED_REMOVE_DATA: '请选择需要删除的Data',
            INTERVAL_DIFFERENT_COMPARE: '不相同的interval不能进行比较'
        }

        $scope.charts = [
            'Line', 'Area', 'Candle', 'HollowCandle', 'Bars'
        ];


        $scope.components = [
            {
                name: 'axis-left',
                type: 'axis',
                orient: 'left'
            },
            {
                name: 'axis-right',
                type: 'axis',
                orient: 'right'
            },
            {
                name: 'axis-bottom',
                type: 'axis',
                orient: 'bottom'
            },
            {
                name: 'axis-top',
                type: 'axis',
                orient: 'top'
            },
            {
                name: 'grid-x',
                type: 'grid',
                orient: 'x'
            },
            {
                name: 'grid-y',
                type: 'grid',
                orient: 'y'
            },
            {
                name: 'grid-x',
                type: 'grid',
                orient: 'x'
            },
            {
                name: 'tips',
                type: 'tips'
            },
            {
                name: 'current-price-line',
                type: 'currentPriceLine'
            }
        ];


        $scope.finances = [
            {
                name: '上证股票',
                symbol: 'sh000001'
            },
            {
                name: '平安银行',
                symbol: 'SZ000001'
            },
            {
                name: '黄金',
                symbol: 'XAUUSD'
            },
            {
                name: '美国10年期国债',
                symbol: 'US10YEAR'
            },
            {
                name: '恒生指数',
                symbol: 'HKG33'
            },
            {
                name: '美元指数',
                symbol: 'USDOLLARINDEX'
            }
        ];

        $scope.intervals = [
            '1', '5', '15', '30', '1D', '1h', '4h', '1W', '1M'
        ];

        $scope.errorMessage = null;
        $scope.currentChart = 'Candle';
        $scope.currentInterval = '1D';
        $scope.currentSymbol = 'sh000001';
        $scope.currentComponents = [];

        // init default components
        for (var key in $scope.components) {
            var component = $scope.components[key];
            switch (component.name) {
                case 'axis-top':
                case 'axis-left':
                    break;
                default:
                    $scope.currentComponents.push(component);
            }
        }

        $scope.asgard = false;
        $scope.currentWidth = 0;
        $scope.currentHeight = 0;
        $scope.currentMarginLeft = 0;
        $scope.currentMarginTop = 50;
        $scope.currentMarginBottom = 65;
        $scope.currentMarginRight = 70;

        $scope.currentShowContainer = $scope.messages.SHOW_CONTAINER;
        $scope.currentHideContainer = $scope.messages.HIDE_CONTAINER;
        $scope.currentUseComponent = $scope.messages.USE_COMPONENT;
        $scope.currentUseChart = $scope.messages.USE_CHART;
        $scope.currentUseData = $scope.messages.USE_DATA;
        $scope.currentUnusedComponent = $scope.messages.USE_UNUSED_COMPONENT;

        $scope.useData = [];
        $scope.showContainers = [];
        $scope.hideContainers = [];
        $scope.useComponents = [];
        $scope.unusedComponents = [];
        $scope.useCharts = [];

        var updateNames = function () {

            //leftOptionsCloseButton.trigger('click');

            $scope.errorMessage = false;

            $scope.currentShowContainer = $scope.messages.SHOW_CONTAINER;
            $scope.currentHideContainer = $scope.messages.HIDE_CONTAINER;
            $scope.currentUseComponent = $scope.messages.USE_COMPONENT;
            $scope.currentUseChart = $scope.messages.USE_CHART;
            $scope.currentUseData = $scope.messages.USE_DATA;
            $scope.currentUnusedComponent = $scope.messages.USE_UNUSED_COMPONENT;

            $scope.showContainers = [$scope.messages.SHOW_CONTAINER];
            $scope.hideContainers = [$scope.messages.HIDE_CONTAINER];
            $scope.useComponents = [$scope.messages.USE_COMPONENT];
            $scope.useCharts = [$scope.messages.USE_CHART];
            $scope.useData = [$scope.messages.USE_DATA];
            $scope.unusedComponents = [$scope.messages.USE_UNUSED_COMPONENT];

            var useContainersNames = $scope.asgard.getContainerNames(),
                components = $scope.components,
                name;

            $scope.useData = $scope.useData.concat($scope.asgard.getDataNames());

            $scope.useCharts = $scope.useCharts.concat($scope.asgard.getChartNames());

            $scope.useComponents = $scope.useComponents.concat($scope.asgard.getComponentNames());

            useContainersNames.forEach(function(name){
                if ($scope.asgard.containerIsHide(name)) {
                    $scope.hideContainers.push(name);
                } else {
                    $scope.showContainers.push(name);
                }
            });

            for (var key in components) {
                name = components[key].name;
                if ($scope.useComponents.indexOf(name) == -1) {
                    $scope.unusedComponents.push(name);
                }
            }

        }


        var initAsgard = function () {
            if (!$scope.asgard) {
                $scope.asgard = new Asgard.Stock('.right-stock', {
                    width: $scope.currentWidth,
                    height: $scope.currentHeight,
                    margin: {
                        left: $scope.currentMarginLeft,
                        top: $scope.currentMarginTop,
                        bottom: $scope.currentMarginBottom,
                        right: $scope.currentMarginRight
                    },
                    isZoom: true,
                    //zoomEvent:function(e){
                    //    console.log('zoom',this,e);
                    //},
                    debug: true,
                    isResize:true,
                    //resizeEvent:function(e){
                    //    console.log('resize',this,e);
                    //},
                    components: $scope.currentComponents
                });
            }
        };

        var getPromise = function () {
            var config = {
                params: {
                    callback: 'JSON_CALLBACK',
                    symbol: $scope.currentSymbol,
                    interval: $scope.currentInterval,
                    rows: 1000
                }
            };

            return $http.jsonp(urls.chart, config);
        }


        $scope.addComponent = function () {

            if ($scope.currentUnusedComponent === $scope.messages.USE_UNUSED_COMPONENT) {
                $scope.errorMessage = $scope.messages.NONE_SELECTED_UNUSED_COMPONENT;
                return;
            }

            var components = $scope.components;

            for (var key in components) {
                if (components[key].name === $scope.currentUnusedComponent) {
                    $scope.asgard.addComponent(components[key]);
                    break;
                }
            }

            updateNames();
            $scope.asgard.draw();

        }

        $scope.removeData = function () {

            if ($scope.currentUseData === $scope.messages.USE_DATA) {
                $scope.errorMessage = $scope.messages.NONE_SELECTED_REMOVE_DATA;
                return;
            }

            try {
                $scope.asgard.removeData($scope.currentUseData);
            } catch (e) {
                $scope.errorMessage = e.message;
                return;
            }

            updateNames();

            $scope.asgard.draw();
        }

        $scope.removeChart = function () {

            if ($scope.currentUseChart === $scope.messages.USE_CHART) {
                $scope.errorMessage = $scope.messages.NONE_SELECTED_REMOVE_CHART;
                return;
            }

            try {
                $scope.asgard.removeChart($scope.currentUseChart);
            } catch (e) {
                $scope.errorMessage = e.message;
                return;
            }

            updateNames();

            $scope.asgard.draw();

        }

        $scope.removeComponent = function () {

            if ($scope.currentUseComponent === $scope.messages.USE_COMPONENT) {
                $scope.errorMessage = $scope.messages.NONE_SELECTED_REMOVE_COMPONENT;
                return;
            }


            $scope.asgard.removeComponent($scope.currentUseComponent);

            updateNames();

            $scope.asgard.draw();
        }

        $scope.show = function () {

            if ($scope.currentHideContainer === $scope.messages.HIDE_CONTAINER) {
                $scope.errorMessage = $scope.messages.NONE_SELECTED_SHOW_CONTAINER;
                return;
            }

            $scope.asgard.showContainer($scope.currentHideContainer);

            updateNames();
        }

        $scope.hide = function () {

            if ($scope.currentShowContainer === $scope.messages.SHOW_CONTAINER) {
                $scope.errorMessage = $scope.messages.NONE_SELECTED_HIDE_CONTAINER;
                return;
            }

            $scope.asgard.hideContainer($scope.currentShowContainer);
            updateNames();
        }

        $scope.add = function () {


            getPromise().success(function (data) {

                data = data.results;

                initAsgard();

                $scope.asgard.clearData();

                $scope.asgard.setInterval($scope.currentInterval);

                $scope.asgard.addData({
                    name: $scope.currentSymbol,
                    data: data
                });

                $scope.asgard.addChart({
                    name: $scope.currentSymbol + '-' + $scope.currentChart,
                    type: $scope.currentChart,
                    dataName: $scope.currentSymbol
                });

                $scope.asgard.draw();


                updateNames();

            });

        };

        $scope.compare = function () {

            getPromise().success(function (data) {

                data = data.results;

                initAsgard();

                // interval 不相同不能比较
                if ($scope.currentInterval !== $scope.asgard.getInterval()) {
                    $scope.errorMessage = $scope.messages.INTERVAL_DIFFERENT_COMPARE
                    return;
                }

                $scope.asgard.addData({
                    name: $scope.currentSymbol,
                    data: data
                });

                $scope.asgard.addChart({
                    name: $scope.currentSymbol + '-' + $scope.currentChart,
                    type: $scope.currentChart,
                    dataName: $scope.currentSymbol
                });

                $scope.asgard.draw();

                updateNames();

            });

        };


    }]);