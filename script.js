'use strict';
// Open Weather
var ow_api_key = '7b371ff33bf7c8589f05eb50e8efe90c';
//Google Maps
var gm_api_key = 'AIzaSyATPSbFvHa14zbdf5HYoPBO4jCwteR8GfM';

var locInput = document.querySelector('#locInput');
var go = document.querySelector('button[type=submit]');
var alert = document.querySelector('.alert');
var display = document.querySelector('#display');
var venues = document.querySelector('.venues');
var owUrl;
var formattedAddress;
var marker;
var map;
var lat;
var lng;
var F = true; // Set degrees to Fahrenheit
var localTime;
var mapDisplay = document.querySelector('#map');
var sunrise;
var sunset;
var timeZone;
var address;
var venues = [];

//Get data based on user's location
(function getlocation() {
  var geoIpUrl = 'https://geoip-db.com/json/';
  axios
    .get(geoIpUrl)
    .then(function(res) {
      var data = res.data;
      address = `${data.city}, ${data.country_name}`;
      lat = data.latitude;
      lng = data.longitude;
      initializeMap();
      integrateGoogleMaps(address);
      getWeather();
    })
    .catch(function(error) {
      console.log(error);
    });
})();

function initializeMap() {
  var mapOptions = {
    center: {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    },
    zoom: 5,
    // disableDefaultUI: true,
    zoomControl: true
  };

  //create map
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // create marker
  marker = new google.maps.Marker({
    position: {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    },
    map: map,
    draggable: true
  });
}
function getTimeZone(lat, lng) {
  var tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=1458000000&key=${gm_api_key}`;
  axios
    .get(tzUrl)
    .then(function(res) {
      timeZone = res.data.timeZoneId.toString();
      //console.log('timezone: ', timeZone);
      localTime = moment.tz(timeZone).format('MMMM Do, h:mm a');
      console.log('local time: ', localTime);
    })
    .catch(function(error) {
      console.log(error);
    });
}
function integrateGoogleMaps(address) {
  owUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=${ow_api_key}`;
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode(
    {
      address: address
    },
    function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        //some formatted addresses have numbers in them - this clears them out
        formattedAddress = results[0].formatted_address.replace(/[0-9]/g, '');
        lat = results[0].geometry.location.lat();
        lng = results[0].geometry.location.lng();
        owUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=${ow_api_key}`;
        mapDisplay.classList.remove('d-none');
        initializeMap();
        focusMap();
        focusMarker();
        getVenues();
        getWeather();
        getTimeZone(lat, lng);

        google.maps.event.addListener(marker, 'dragend', function() {
          lat = marker.position.lat();
          lng = marker.position.lng();
          //Get address from coordinates with reverse geocoding
          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyATPSbFvHa14zbdf5HYoPBO4jCwteR8GfM`
            )
            .then(function(res) {
              address = res.data.results[0].formatted_address;
              focusMap();
              integrateGoogleMaps(address);
              getTimeZone(lat, lng);
              getWeather();
            })
            .catch(function(error) {
              console.log(error);
            });
        });
      }
    }
  );
}

function getCardinalDirection(angle) {
  if (typeof angle === 'string') angle = parseInt(angle);
  if (angle <= 0 || angle > 360 || typeof angle === 'undefined') return '☈';
  var arrows = {
    north: '↑ N',
    north_east: '↗ NE',
    east: '→ E',
    south_east: '↘ SE',
    south: '↓ S',
    south_west: '↙ SW',
    west: '← W',
    north_west: '↖ NW'
  };

  var directions = Object.keys(arrows);
  var degree = 360 / directions.length;
  angle = angle + degree / 2;
  for (var i = 0; i < directions.length; i++) {
    if (angle >= i * degree && angle < (i + 1) * degree)
      return arrows[directions[i]];
  }
  return arrows['north'];
}

console.log('cardinal direction', getCardinalDirection(60));

function getVenues() {
  var date = moment().format('YYYYMMDD');
  var fsqId = 'KJJTGGS4TT053WQY0KCUNSE1F2E5OJD3VLFSPEE505GQ11WL';
  var fsqSecret = 'EJ3M4LML42LW3SWSALG0ZAQ4OJ3QESIY3BHHGVWRXCM4UQBK';
  var fSqUrl = `https://api.foursquare.com/v2/venues/search?ll=${lat},${lng}&client_id=${fsqId}&client_secret=${fsqSecret}&v=${date}`;

  axios
    .get(fSqUrl)
    .then(function(res) {
      var data = res.data.response.venues;
      data.forEach(function(venue) {
        if (venue.categories[0]) {
          var icon = venue.categories[0].icon.prefix + 'bg_64.png';
          var category = venue.categories[0].name.toLowerCase();
          switch (true) {
            case category.includes('restaurant') || category.includes('grill'):
              console.log('restaurants: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('gallery'):
              console.log('gallery: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('outdoor'):
              console.log('outdoor: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('park'):
              console.log('park: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('coffee'):
              console.log('coffee: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('sport'):
              console.log('sport: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('yoga'):
              console.log('yoga: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('gym'):
              console.log('gym: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('hotel'):
              console.log('hotel: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('tour'):
              console.log('tour: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('transport'):
              console.log('transport: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('bank'):
              console.log('bank: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('salon'):
              console.log('salon: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('gift'):
              console.log('gift: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('shop'):
              console.log('shop: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('food'):
              console.log('food: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('museum'):
              console.log('museum: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('hall'):
              console.log('hall: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('auditorium'):
              console.log('auditorium: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('library'):
              console.log('library: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('trail'):
              console.log('trail: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('ski'):
              console.log('ski: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('historic'):
              console.log('historic: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('landmark'):
              console.log('landmark: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
            case category.includes('monument'):
              console.log('monument: ', venue.name);
              console.log('icon: ', icon);
              venues.push(`<li><img src="${icon}"> ${venue.name}</li>`);
              break;
          }
        }
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

go.addEventListener('click', function(e) {
  e.preventDefault();
  var regex = /^[a-zA-Z,. ]+$/;
  var address = locInput.value.replace('.', '').trim();
  if (address.match(regex)) {
    console.log('address: ', address);
    initializeMap();
    integrateGoogleMaps(address);
    getVenues();
    locInput.value = '';
  } else if (address) {
    valAlert();
  }
});

function valAlert() {
  console.log('valAlert running');
  locInput.value = '';
  display.innerHTML = '';
  mapDisplay.classList.add('d-none');
  alert.classList.remove('d-none');
  setTimeout(function() {
    alert.classList.add('d-none');
  }, 3000);
}

function focusMap() {
  map.setCenter(marker.position);
}

function focusMarker() {
  marker.setPosition({
    lat: lat,
    lng: lng
  });
}

function celsius(tempKelvin) {
  var celsius = _.round(tempKelvin - 273.15);
  return celsius;
}

function fahrenheit(tempKelvin) {
  var fahrenheit = _.round((tempKelvin - 273.15) * 1.8 + 32);
  return fahrenheit;
}

function getWeather() {
  axios
    .get(owUrl)
    .then(function(res) {
      getVenues();
      getTimeZone(lat, lng);
      display.innerHTML = '';
      var data = res.data;
      var tempMax = F
        ? fahrenheit(data.main.temp_max)
        : celsius(data.main.temp_max);
      var tempMin = F
        ? fahrenheit(data.main.temp_min)
        : celsius(data.main.temp_min);
      var degree = F ? '°F' : '°C';
      console.log(data);
      var h = data.main.humidity + '%';
      var output = document.createElement('div');
      output.setAttribute('class', 'text-center mt-2');
      //Only display min and max temperatures if they are different      iconId = data.weather[0].icon;
      var iconId = data.weather[0].icon;
      console.log('iconId: ', iconId);
      var owIcon = `http://openweathermap.org/img/w/${iconId}.png`;
      var desc = data.weather[0].description;
      var sunrise = moment.unix(data.sys.sunrise).format('YYYY-MM-D HH:mm');
      var sunset = moment.unix(data.sys.sunset).format('YYYY-MM-D HH:mm');
      //console.log(sunrise, ' ' sunset, 'sunrise sunset');
      var windSpeed = _.round(data.wind.speed * 2.2369) + 'mph';
      console.log('wind speed: ', windSpeed);
      var windAngle = data.wind.deg;
      console.log('windAngle: ', windAngle);
      var windDirection = getCardinalDirection(windAngle);
      console.log(windDirection);
      sunrise = moment(sunrise).tz(timeZone);
      sunset = moment(sunset).tz(timeZone);
      var sunriseTz = sunrise
        .clone()
        .tz(timeZone)
        .format('h:mm a');
      var sunsetTz = sunset
        .clone()
        .tz(timeZone)
        .format('h:mm a');
      var tempOutput =
        tempMax !== tempMin
          ? `${tempMax}${degree} / ${tempMin}${degree}`
          : tempMax + degree;
      console.log('tempOutput: ', tempOutput);
      var list = venues.join('');
      console.log('VENUES: ', list);
      venues = [];
      output.innerHTML = `
      <h4 class="text-center mt-2">${formattedAddress}</h4>
      <h5 class="time text-center mb-2">Local Time - ${localTime}</h5>
      <div class="row">
        <div class="col-sm venues">
        <h4>Venues</h4>
          <ul class="venues">
          ${list}
          </ul>
        </div>
        <div class="col-sm weather">
          <p>${tempOutput}</p>
          <p class="desc">${desc}</p>
          <p><img src="${owIcon}"></p>
          <p>Humidity: ${h}</p>
          <p>Wind: ${windDirection} ${windSpeed}</p>
          <p>Sunrise: ${sunriseTz} / Sunset: ${sunsetTz}<p>
        </div>
      </div>
      `;
      display.appendChild(output);
    })
    .catch(function(error) {
      console.log(error);
    });
}

document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('set-temp')) {
    F = !F;
    getWeather();
  }
});

var timeStamp = moment().unix();
var currentTime = moment.unix(timeStamp).format('MM/DD/YYYY h:mm:ss a');

console.log('currentTime: ', currentTime);
