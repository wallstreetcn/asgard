angular.module('asgard', [])

    .value('api', {
        token: 'http://api.wallstreetcn.com/v2/itn/token/public',
        marketList: 'https://open.hs.net/quote/v1/market/list',
        marketDetail: 'https://open.hs.net/quote/v1/market/detail',
        kline: 'https://open.hs.net/quote/v1/kline'
    })


    .controller('exampleController', ['$scope', '$http', 'api', function ($scope, $http, api) {

        $scope.currentChart = 'candle';
        $scope.charts = [
            'line', 'area', 'candle', 'hollowCandle', 'ohlc'
        ];

        $scope.intervals = [
            '1', '5', '15', '30', '1h', '1D', '1W', '1M', '1Y'
        ];
        $scope.currentInterval = '0';

        $scope.token;


        $scope.marketList = [];
        $scope.currentFinanceMic;

        $scope.marketDetailGrp = [];
        $scope.currentProdCode;

        $scope.asgard;

        function initAsgard() {


            if ($scope.asgard) {
                $scope.asgard.getBaseDom().remove();
            }

            var candle = new Asgard.Stock.StockChart({
                components: [
                    {
                        id: 'right-axis',
                        type: 'axis',
                        orient: 'right'
                    }
                ]
            });

            var volume = new Asgard.Stock.StockChart({
                components: [
                    {
                        id: 'right-axis',
                        type: 'axis',
                        orient: 'right',
                        showField:'volume'
                    },
                    {
                        id: 'bottom-axis',
                        type: 'axis',
                        orient: 'bottom'
                    }
                ]
            });

            $scope.asgard = new Asgard.Stock.StockLayout('.stock',{
                zoom:true,
                margin:{
                    left:50,
                    top:50,
                    bottom:50,
                    right:50
                },
                layouts:[
                    {
                        id:'chart',
                        stockChart:candle,
                        height:'70%'
                    },
                    {
                        id:'volume',
                        stockChart:volume,
                        height:'30%'
                    }
                ]
            })

        }

        function getToken() {
            var config = {
                params: {
                    callback: 'JSON_CALLBACK'
                }
            };
            $http.jsonp(api.token, config).success(function (data) {
                $scope.token = data.results.access_token
                getMarketList();
            });
        };

        function getMarketList() {
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + $scope.token
                }
            };
            $http.get(api.marketList, config).success(function (data) {
                $scope.currentFinanceMic = 'SS'
                $scope.marketList = data.data;
            });
        }


        $scope.$watch('currentFinanceMic', function (newValue, oldValue) {

            if ($scope.token === undefined) {
                return;
            }

            var config = {
                headers: {
                    'Authorization': 'Bearer ' + $scope.token
                },
                params: {
                    finance_mic: newValue
                }
            };
            $http.get(api.marketDetail, config).success(function (data) {
                $scope.marketDetailGrp = data.data.market_detail_prod_grp;
            });
        });


        $scope.addChart = function () {

            var id = $scope.currentProdCode + '.' + $scope.currentFinanceMic;

            var config = {
                headers: {
                    Authorization: 'Bearer ' + $scope.token
                },
                params: {
                    get_type: 'offset',
                    prod_code: id,
                    candle_period: parseInt($scope.currentInterval) + 1,
                    data_count: 200
                }
            };

            $http.get(api.kline, config).success(function (data) {

                initAsgard();

                $scope.asgard.getLayout('chart').stockChart.addData({
                    id: id,
                    data: data.data,
                    dataFormat: function (data) {
                        var _data = [];
                        data.candle[id].forEach(function (candle) {

                            var d = {};

                            d.date = +(new Date(candle[0].toString().replace(
                                /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/,
                                '$4:$5 $2/$3/$1'
                            )));

                            d.open = candle[1];
                            d.high = candle[2];
                            d.low = candle[3];
                            d.close = candle[4];
                            d.volume = candle[5];
                            d.price = d.open;

                            _data.unshift(d);

                        });

                        return _data;
                    }
                }).addChart({
                    id: $scope.currentChart + '-' + id,
                    type: $scope.currentChart,
                    dataId: id
                });

                $scope.asgard.getLayout('volume').stockChart.addData({
                    id: id,
                    data: data.data,
                    dataFormat: function (data) {
                        var _data = [];

                        data.candle[id].forEach(function (candle) {

                            var d = {};

                            d.date = +(new Date(candle[0].toString().replace(
                                /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/,
                                '$4:$5 $2/$3/$1'
                            )));

                            d.open = candle[1];
                            d.high = candle[2];
                            d.low = candle[3];
                            d.close = candle[4];
                            d.volume = candle[5];
                            d.price = d.open;

                            _data.unshift(d);

                        });

                        return _data;
                    }
                }).addChart({
                    id: 'volume-' + id,
                    type: 'volume',
                    dataId: id
                });

                $scope.asgard.draw();
            });

        }


        getToken();


    }]);