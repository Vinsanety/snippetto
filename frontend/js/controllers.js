angular.module('myApp.controllers', [])

.controller('loginController', ['$http', '$state', '$rootScope', function($http, $state, $rootScope) {
	var self = this
  this.showLogin = true
	//Bool scope variable to control the navbar in index.html

	var loadingModal = document.getElementById('myModal');

	var loadingDone = false;
	this.loadingNow = false;

	if (window.location.href.includes('code')) {
		this.loadingNow = true;
		loadingModal.className = 'in';
    self.showLogin = false
	}
	var intervalID = window.setInterval(getPosition, 500);

	function getPosition() {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			$rootScope.currentPosition = pos;
      console.log(pos);
			loadingDone = true;

		})
		if (loadingDone === true) {
			clearIntervalAndSuch();
		}
	}

	function clearIntervalAndSuch() {
		clearInterval(intervalID);
		displayPage();
	}

	function displayPage() {
		if (window.location.href.includes('code')) {
			var startingIndex = window.location.search.indexOf('code=') + 5
			$rootScope.code = window.location.search.substring(startingIndex, window.location.search.length)
			$http.post(`https://www.googleapis.com/oauth2/v4/token?code=${$rootScope.code}&client_id=709501805031-d87qamtke60go50st3tiv2lu235fpcfb.apps.googleusercontent.com&client_secret=Srv4Ep2JLkXSZnHdi_HGmYFY&redirect_uri=http://localhost:8000&grant_type=authorization_code`).then(function(response) {
				$rootScope.accessToken = response.data.access_token
				var postObj = {
					accessToken: $rootScope.accessToken
				}
				$http.post('http://localhost:3000/google/oauth', postObj).then(function(data) {
					$rootScope.username = data.data.email
					$http.post('http://localhost:3000/google/new', {
						username: $rootScope.username
					}).then(function(data) {
						$rootScope.user_id = data.data.user_id
						if (data.data.firstTimeUser) {
							$rootScope.firstTimeUser = true
						}
					})
				})
			})
		}
		loginAndSuch();
	}

	function loginAndSuch() {
		if (window.location.href.includes('code')) {
			$state.go('home')
		}
	}
}])

.controller('homeController', ['$http', '$rootScope', '$state', function($http, $rootScope, $state) {
}])


.controller('weatherController', ['$http', '$rootScope', '$state', function($http, $rootScope, $state) {
	var lat = $rootScope.currentPosition.lat
	var lng = $rootScope.currentPosition.lng

	function timeConverter(UNIX_timestamp) {
		var a = new Date(UNIX_timestamp * 1000);
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var hour = a.getHours();
		var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
		var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
		var sec = a.getSeconds();
		var mdy = month + ' ' + date + ' ' + year
		var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
		return mdy;
	}
	var self = this
	$http.post('http://localhost:3000/weather/getWeather', $rootScope.currentPosition).then(function(data) {
		self.weatherData = data.data
		self.city = data.data.name
		self.desc = data.data.weather[0].description
		self.temp = Math.ceil(data.data.main.temp) + '°'
		self.weatherImg = data.data.weather[0].icon
			// console.log('root: ',$rootScope.currentPosition.lat);

		$http.get(`http://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lng}&units=imperial&cnt=5&APPID=c98ec93f5a134adb4a37ca10c015d4e5`).then(function(obj) {
      console.log(obj.data.list[0].dt);
			self.day1 = timeConverter(obj.data.list[0].dt)
			self.day2 = timeConverter(obj.data.list[1].dt)
			self.day3 = timeConverter(obj.data.list[2].dt)
			self.min_temp1 = Math.ceil(obj.data.list[0].temp.min) + '°'
			self.max_temp1 = Math.ceil(obj.data.list[0].temp.max) + '°'
			self.min_temp2 = Math.ceil(obj.data.list[1].temp.min) + '°'
			self.max_temp2 = Math.ceil(obj.data.list[1].temp.max) + '°'
			self.min_temp3 = Math.ceil(obj.data.list[2].temp.min) + '°'
			self.max_temp3 = Math.ceil(obj.data.list[2].temp.max) + '°'
			self.day1_icon = obj.data.list[0].weather[0].icon
			self.day2_icon = obj.data.list[1].weather[0].icon

			self.day3_icon = obj.data.list[2].weather[0].icon
		})
	})
}])

<<<<<<< HEAD
.controller('trafficController', ['$http', '$rootScope', '$state', function($http, $rootScope, $state) {
	var selfTraffic = this;
	//User Origin var
	var origin1 = new google.maps.LatLng($rootScope.currentPosition);
	//Google maps objects for displaying/finding directions/showing traffic
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;
	var trafficLayer = new google.maps.TrafficLayer();
	//The map object
	var map = new google.maps.Map(document.getElementById('map'), mapOptions);
	//What's being sent to backend
	var serverObject = {};

	serverObject.origin1 = origin1;
	serverObject.userId = $rootScope.user_id;

	this.trafficSwitch = false;

	//Controls the Traffic view and form input to save addresses
	if ($rootScope.user_id) {
		this.trafficSwitch = true;
	}

	var mapOptions = {
		zoom: 15,
		center: origin1,
		mapTypeId: google.maps.MapTypeId.MAP
	}

	//Setting the map objects
	directionsDisplay.setMap(map);
	trafficLayer.setMap(map);

	$http.post('http://localhost:3000/traffic', serverObject).then(function(data) {
		selfTraffic.durationToDestination = data.data.durationToWork.text;
		calculateAndDisplayRoute(directionsService, directionsDisplay);

		function calculateAndDisplayRoute(directionsService, directionsDisplay) {
			directionsService.route({
				origin: origin1,
				destination: data.data.destinationCords,
				travelMode: 'DRIVING'
			}, function(response, status) {
				if (status === 'OK') {
					directionsDisplay.setDirections(response);
				} else {
					window.alert('Directions request failed due to ' + status);
				}
			});
		}
	})

	this.workAddGet = function(address) {
		address.id = $rootScope.user_id;
		$rootScope.workAddress = address;
		$http.post('http://localhost:3000/traffic/setAddress', $rootScope.workAddress).then(function(some) {
		})
	}
}])

=======
>>>>>>> upstream/master
.controller('funController', ['$http', '$rootScope', '$state', function($http, $rootScope, $state) {
	var foo = this
	$http.get('http://localhost:3000/fun/getFun').then(function(obj) {
		foo.qoute = obj.data.quoteText
		foo.author = obj.data.quoteAuthor
		$http.get('http://api.wordnik.com:80/v4/words.json/wordOfTheDay?api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5').then(function(obj2) {
			foo.word = obj2.data.word
			foo.definition = obj2.data.definitions[0].text
			foo.pof = obj2.data.definitions[0].partOfSpeech
			foo.example = obj2.data.examples[0].text
      console.log('example: ',obj2.data);
			$http.get('http://api.adviceslip.com/advice').then(function(obj3) {
				foo.advice = obj3.data.slip.advice
        console.log('advice: ', foo.advice);
				$http.get('https://api.chucknorris.io/jokes/random').then(function(obj4) {
					foo.chuckNorris = obj4.data.value
          console.log('chuck: ',foo.chuckNorris);
				})
			})
		})
	})

  this.toggleVisibility = function (id) {
    console.log(id);
    var e = document.getElementById(id);
		if (e.style.display == 'block')
			e.style.display = 'none';
		else
			e.style.display = 'block';
  }
}])

.controller('showTaskController', ['$http', '$rootScope', '$state', '$stateParams', function($http, $rootScope, $state, $stateParams) {
	$rootScope.header = 'views/header.html';
	var self = this
	$http.get(`http://localhost:3000/todo/showTask/${$stateParams.user_id}/${$stateParams.task_id}`).then(function(task) {
		console.log(task.data);
		self.task = task.data.task
		self.task_id = task.data.task_id
		self.user_id = task.data.user_id
		self.priority = task.data.priority
		self.due_date = task.data.due_date
		self.time = task.data.time
		self.description = task.data.description
	})

	this.edit = function() {
		var postObj = {
			user_id: $stateParams.user_id,
			task_id: $stateParams.task_id,
			task: self.task,
			priority: self.priority,
			due_date: self.due_date,
			time: self.time,
			description: self.description
		}
		$http.post('http://localhost:3000/todo/edit', postObj).then(function() {
			$state.go('todo')
		})
	}
}])
