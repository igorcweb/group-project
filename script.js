'use strict';
// Open Weather
var ow_api_key = '7b371ff33bf7c8589f05eb50e8efe90c';
//Google Maps
var gm_api_key = 'AIzaSyATPSbFvHa14zbdf5HYoPBO4jCwteR8GfM';

var locInput = document.querySelector('#locInput');
var go = document.querySelector('button[type=submit]');
var alert = document.querySelector('.alert');
var display = document.querySelector('#display');
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

//Get data based on user's location
(function getlocation() {
  var geoIpUrl = 'https://geoip-db.com/json/';
  axios
    .get(geoIpUrl)
    .then(function(res) {
      var data = res.data;
      console.log(data);
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
        getWeather();
        getVenues();
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

function getVenues() {
  var date = moment().format('YYYYMMDD');
  var fsqId = 'KJJTGGS4TT053WQY0KCUNSE1F2E5OJD3VLFSPEE505GQ11WL';
  var fsqSecret = 'EJ3M4LML42LW3SWSALG0ZAQ4OJ3QESIY3BHHGVWRXCM4UQBK';
  var fSqUrl = `https://api.foursquare.com/v2/venues/search?ll=${lat},${lng}&client_id=${fsqId}&client_secret=${fsqSecret}&v=${date}`;

  axios
    .get(fSqUrl)
    .then(function(res) {
      var data = res.data.response.venues;
      console.log('venues: ', data);
      data.forEach(function(venue) {
        if (venue.categories[0]) {
          var icon = venue.categories[0].icon.prefix + '64.png';
          var category = venue.categories[0].name.toLowerCase();
          switch (true) {
            case category.includes('restaurant') || category.includes('grill'):
              console.log('restaurants: ', venue.name);
              console.log('icon: ', icon);
              break;
            case category.includes('gallery'):
              console.log('gallery: ', category);
              break;
            case category.includes('outdoor'):
              console.log('outdoors: ', category);
              break;
            case category.includes('park'):
              console.log('park: ', category);
              break;
            case category.includes('coffee'):
              console.log('coffee house: ', category);
              break;
            case category.includes('sport'):
              console.log('sports: ', category);
              break;
            case category.includes('yoga'):
              console.log('yoga: ', category);
              break;
            case category.includes('gym'):
              console.log('gym: ', category);
              break;
            case category.includes('hotel'):
              console.log('hotels: ', category);
              break;
            case category.includes('tour'):
              console.log('tours: ', category);
              break;
            case category.includes('transport'):
              console.log('transportation: ', category);
              break;
            case category.includes('bank'):
              console.log('bank: ', category);
              break;
            case category.includes('salon'):
              console.log('salon: ', category);
              break;
            case category.includes('gift'):
              console.log('gift: ', category);
              break;
            case category.includes('shop'):
              console.log('shop: ', category);
              break;
            case category.includes('food'):
              console.log('food: ', category);
              break;
            case category.includes('museum'):
              console.log('museum: ', category);
              break;
            case category.includes('hall'):
              console.log('hall: ', category);
              break;
            case category.includes('auditorium'):
              console.log('auditorium: ', category);
              break;
            case category.includes('library'):
              console.log('libraries: ', category);
              break;
            case category.includes('trail'):
              console.log('trail: ', category);
              break;
            case category.includes('ski'):
              console.log('ski: ', category);
              break;
            case category.includes('historic'):
              console.log('historic: ', category);
              break;
            case category.includes('landmark'):
              console.log('landmark: ', category);
              break;
            case category.includes('monument'):
              console.log('monument: ', category);
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
      getTimeZone(lat, lng);
      var sunrise = moment.unix(data.sys.sunrise).format('YYYY-MM-D HH:mm');
      var sunset = moment.unix(data.sys.sunset).format('YYYY-MM-D HH:mm');
      console.log(sunrise, ' ', sunset, 'sunrise sunset');

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
      console.log('Time Zone: ', timeZone);
      console.log('sunriseTz: ', sunriseTz);
      console.log('sunsetTz: ', sunsetTz);
      var tempOutput =
        tempMax !== tempMin
          ? `${tempMax}${degree} / ${tempMin}${degree}`
          : tempMax + degree;
      console.log('tempOutput: ', tempOutput);
      output.innerHTML = `
      <h4 class="text-center mt-2">${formattedAddress}</h4>
      <h5 class="time text-center mb-2">Local Time - ${localTime}</h5>
      <div class="row">
        <div class="col-sm venues">
          <p>Venues Placeholder</p>
        </div>
        <div class="col-sm weather">
          <p>${tempOutput} 
          <p class="desc">${desc}</p>
          <p><img src="${owIcon}"></p>
          </p>
          <p>Humidity: ${h}</p>
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

// display.addEventListener('click', function(e) {
//   if (e.target && e.target.classList.contains('fc')) {
//     F = !F;
//     getWeather();
//   }
// });

document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('set-temp')) {
    F = !F;
    getWeather();
  }
});

var timeStamp = moment().unix();
var currentTime = moment.unix(timeStamp).format('MM/DD/YYYY h:mm:ss a');

console.log('currentTime: ', currentTime);
