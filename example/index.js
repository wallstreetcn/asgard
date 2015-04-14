angular.module('asgard', [])

    .value('urls', {
        finances: 'http://api.markets.wallstreetcn.com:80/v1/finances?callback=JSON_CALLBACK'
    })


    .controller('exampleController', ['$scope', '$http', 'urls', function ($scope, $http, urls) {

        $scope.currentChannel = -1;

        $scope.finances = {};

        $scope.channels = [
            'forex',
            'commodity',
            'indice',
            'bond',
            'cfdindice',
            'stock'
        ];


        $scope.$watch('currentChannel',function(newValue,oldValue){

            if(newValue === -1){
                return;
            }

            var config = {
                params: {
                    type: newValue
                }
            };

            $http.jsonp(urls.finances, config).success(function (data) {

                data = data.results;

                console.log(data);

            });

        });




    }]);