var app = angular.module('geoInfo', ['ngRoute', 'ngAnimate']);


app.factory('getCountries', ['$http', '$rootScope', function ($http, $rootScope)
{
    if ($rootScope.countries)
        return $rootScope.countries;
    else {
        return $http({
            url: 'http://api.geonames.org/countryInfoJSON?username=fatherbox',
            method: 'GET'

        })
            .then(function (data, status, headers, config) {
                console.log('Success!');
                // called when the data is available
                $rootScope.countries = data.data.geonames;
                $rootScope.countryNames = Array.prototype.map.call($rootScope.countries, function (el) {
                    return el.countryName;
                });
                return data.data.geonames;

            },
            function (data, status, headers, config) {
                console.log('Failure :(');
                // called when an error occurs or
                // the server returns data with an error status
            });
    }


}]);

app.factory('getNeighbours', ['$http', function ($http)
{
    return function (countryID)
    {

            return $http({
                url: 'http://api.geonames.org/neighboursJSON?username=fatherbox',
                method: 'GET',
                params: {country: countryID}

            })
                .then(function (data, status, headers, config) {
                    console.log('Success!');
                    // called when the data is available
                    return data.data.geonames;

                },
                function (data, status, headers, config) {
                    console.log('Failure :(');
                    // called when an error occurs or
                    // the server returns data with an error status
                });
        }




}])

app.factory('getCityInfo', ['$http', function ($http)
{
    return function (cityName)
    {

        return $http({
            url: 'http://api.geonames.org/searchJSON?username=fatherbox',
            method: 'GET',
            params: {q: cityName, name: cityName, name_equals: cityName, isNameRequired: true, cities: 'cities15000'}

        })
            .then(function (data, status, headers, config) {
                console.log('Success!');
                // called when the data is available
                return data.data.geonames[0];

            },
            function (data, status, headers, config) {
                console.log('Failure :(');
                // called when an error occurs or
                // the server returns data with an error status
            });
    }

}])



app.config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/', {
        templateUrl : 'home.html',
        controller : 'homeCtrl'
    })
        .when('/countries', {
            templateUrl : 'countries.html',
            controller : 'countriesCtrl',
            resolve:
            {
                countriesList: ['getCountries' , function(getCountries)
                {
                    return getCountries;
                }]

            }
        })
        .when('/countries/:country/capital', {
            templateUrl : 'countryInfo.html',
            controller : 'countryInfoCtrl',
            resolve:
            {
                countriesList: ['getCountries', function (getCountries)
                {
                    return getCountries;
                }],
                countryNames: ['getCountries' ,function (getCountries)
                {

                    return getCountries.then(function (data) {
                        return Array.prototype.map.call(data, function (el) {
                            return el.countryName;
                        });
                    });
                }],
                neighbours: ['$route', 'getCountries', 'getNeighbours', function ($route, getCountries, getNeighbours)
                {
                    return getCountries.then(
                        function (data) {
                            var countryName = $route.current.params.country;

                                var cNames = Array.prototype.map.call(data, function (el) {
                                    return el.countryName;
                                });

                            var cPosition = cNames.indexOf (countryName);
                            if (cPosition != -1)
                            {
                                var cCode = data[cPosition].countryCode;

                                return getNeighbours(cCode);



                            }



                        });


                }],
                capitalInfo: ['$route', 'getCountries', 'getCityInfo', function ($route, getCountries, getCityInfo)
                {

                    return getCountries.then(
                        function (data) {
                            var countryName = $route.current.params.country;

                            var cNames = Array.prototype.map.call(data, function (el) {
                                return el.countryName;
                            });

                            var cPosition = cNames.indexOf (countryName);
                            if (cPosition != -1)
                            {
                                var capital = data[cPosition].capital;

                                return getCityInfo(capital);



                            }



                        });

                }]

            }
        })
}])



/*app.run(['$http', '$rootScope'], function ($http, $rootScope)
{
    $http({
        url: 'http://api.geonames.org/countryInfoJSON?username=fatherbox',
        method: 'GET'

    })
        .then(function(data, status, headers, config) {
            console.log('Success!');
            // called when the data is available
            $rootScope.countries = data.data.geonames;
            $rootScope.countryNames = Array.prototype.map.call($rootScope.countries, function (el)
            {
                return el.countryName;
            });
        },
        function(data, status, headers, config) {
            console.log('Failure :(');
            // called when an error occurs or
            // the server returns data with an error status
        });


});

function getCountryList (http, rootScope)
{

    return http({
        url: 'http://api.geonames.org/countryInfoJSON?username=fatherbox',
        method: 'GET'

    })
        .then(function(data, status, headers, config) {
            console.log('Success!');
            // called when the data is available
            rootScope.countries = data.data.geonames;
            rootScope.countryNames = Array.prototype.map.call(rootScope.countries, function (el)
            {
                return el.countryName;
            });

            return rootScope.countries;

        },
        function(data, status, headers, config) {
            console.log('Failure :(');
            // called when an error occurs or
            // the server returns data with an error status
        });
}
*/
app.controller('countriesCtrl', ['$scope', '$rootScope', '$http', '$location', 'countriesList', function ($scope, $rootScope, $http, $location, countriesList)
{
    $scope.countriesList = countriesList;
    $scope.gotoCountryInfo = function (code)
    {
        $location.path("countries/" + code + "/capital");

    }


}])

app.controller('countryInfoCtrl', ['$rootScope', '$scope', '$http', '$routeParams', 'getCountries',
    'countryNames', 'neighbours', 'capitalInfo',
    function ($rootScope, $scope, $http, $routeParams, getCountries, countryNames, neighbours, capitalInfo)
{
    var country = $routeParams.country;


    //if ($rootScope.countryNames) {


        var countryPos = countryNames.indexOf(country);

            if (countryPos == -1) {
                return;
            }
            else {
            $scope.country = $rootScope.countries[countryPos];
            $scope.neighbours = neighbours;
                $scope.country.capitalPopulation = capitalInfo.population;
        }

   // }


}]);

app.controller('homeCtrl', ['$scope', '$http', function ($scope, $http)
{


}])