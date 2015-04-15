angular.module('asgard', [])

    .value('urls', {
        chart: 'http://api.markets.wallstreetcn.com:80/v1/chart.json'
    })


    .controller('exampleController', ['$scope', '$http', 'urls', function ($scope, $http, urls) {

        $scope.messages = {
            SHOW_CONTAINER:'已显示的',
            HIDE_CONTAINER:'已隐藏的',
            USE_COMPONENT:'已使用',
            USE_CHART:'已使用',
            USE_DATA:'已使用'
        }

        $scope.charts = [
            'Line','Area','Candle','HollowCandle','Bars',
        ];

        $scope.finances = [
            {
                name: '上证股票',
                symbol: 'sh000001'
            },
            {
                name: '黄金',
                symbol: 'XAUUSD'
            }
        ];

        $scope.intervals = [
            '1','5','15','30','1D','1h','4h','1W','1M'
        ];

        $scope.currentChart = 'Candle';
        $scope.currentInterval = '1D';
        $scope.currentSymbol = 'sh000001';
        $scope.asgard = false;
        

        $scope.currentShowContainer = $scope.messages.SHOW_CONTAINER;
        $scope.currentHideContainer = $scope.messages.HIDE_CONTAINER;
        $scope.currentUseComponent = $scope.messages.USE_COMPONENT;
        $scope.currentUseChart = $scope.messages.USE_CHART;
        $scope.currentUseData = $scope.messages.USE_DATA;


        $scope.useData = [];
        $scope.showContainers = [];
        $scope.hideContainers = [];
        $scope.useComponents = [];
        $scope.useCharts = [];

        var updateNames = function(){

            $scope.currentShowContainer = $scope.messages.SHOW_CONTAINER;
            $scope.currentHideContainer = $scope.messages.HIDE_CONTAINER;
            $scope.currentUseComponent = $scope.messages.USE_COMPONENT;
            $scope.currentUseChart = $scope.messages.USE_CHART;
            $scope.currentUseData = $scope.messages.USE_DATA;

            $scope.showContainers = [$scope.messages.SHOW_CONTAINER];
            $scope.hideContainers = [$scope.messages.HIDE_CONTAINER];
            $scope.useComponents = [$scope.messages.USE_COMPONENT];
            $scope.useCharts = [$scope.messages.USE_CHART];
            $scope.useData = [$scope.messages.USE_DATA];

            var charts = $scope.asgard.getCharts(),
                components = $scope.asgard.getComponents(),
                containers = $scope.asgard.getContainers(),
                data = $scope.asgard.getDataContainer().getData();

            for(name in data){
                $scope.useData.push(name);
            }

            for(name in charts){
                $scope.useCharts.push(name);
            }

            for(name in components){
                $scope.useComponents.push(name);
            }

            for(name in containers){

                switch (name){
                    case 'base':
                    case 'baseSvg':
                    case 'data':
                    case 'dataClip':
                        continue;
                    break;
                }

                if($scope.asgard.containerIsHide(name)){
                    $scope.hideContainers.push(name);
                }else{
                    $scope.showContainers.push(name);
                }
            }

        }


        var initAsgard = function(){
            if (!$scope.asgard) {
                $scope.asgard = new Asgard.Stock('#svg', {
                    height:500,
                    margin: {
                        left: 0,
                        top: 50,
                        bottom: 65,
                        right: 70
                    },
                    isZoom: true,
                    components: [
                        {
                            name: 'axis-bottom',
                            type: 'axis',
                            orient: 'bottom'
                        },
                        {
                            name: 'axis-right',
                            type: 'axis',
                            orient: 'right'
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
                            name: 'tips',
                            type: 'tips'
                        },
                        {
                            name: 'current-price-line',
                            type: 'currentPriceLine'
                        }
                    ]
                });
            }
        };

        var getPromise = function(){
            var config = {
                params: {
                    callback: 'JSON_CALLBACK',
                    symbol: $scope.currentSymbol,
                    interval:$scope.currentInterval,
                    rows : 1000
                }
            };

            return $http.jsonp(urls.chart, config);
        }


        $scope.removeData = function(){

            if($scope.currentUseData === $scope.messages.USE_DATA){
                return;
            }

            $scope.asgard.removeData($scope.currentUseData);

            updateNames();
        }

        $scope.removeChart = function(){

            if($scope.currentUseChart === $scope.messages.USE_CHART){
                return;
            }

            $scope.asgard.removeChart($scope.currentUseChart);

            updateNames();

        }

        $scope.removeComponent = function(){

            if($scope.currentUseComponent === $scope.messages.USE_COMPONENT){
                return;
            }


            $scope.asgard.removeComponent($scope.currentUseComponent);

            updateNames();

        }

        $scope.show = function(){

            if($scope.currentHideContainer === $scope.messages.HIDE_CONTAINER){
                return;
            }

            $scope.asgard.showContainer($scope.currentHideContainer);

            updateNames();
        }

        $scope.hide = function(){

            if($scope.currentShowContainer === $scope.messages.SHOW_CONTAINER){
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
                    name:$scope.currentSymbol,
                    data:data
                });

                $scope.asgard.addChart({
                    name:$scope.currentSymbol + '-' + $scope.currentChart,
                    type:$scope.currentChart,
                    dataName:$scope.currentSymbol
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
                if($scope.currentInterval !== $scope.asgard.getInterval()){
                    return ;
                }

                $scope.asgard.addData({
                    name:$scope.currentSymbol,
                    data:data
                });

                $scope.asgard.addChart({
                    name:$scope.currentSymbol + '-' + $scope.currentChart,
                    type:$scope.currentChart,
                    dataName:$scope.currentSymbol
                });

                $scope.asgard.draw();

                updateNames();

            });

        };

    }]);