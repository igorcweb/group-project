'use strict';
// Open Weather
var ow_api_key = '7b371ff33bf7c8589f05eb50e8efe90c';
//Google Maps
var gm_api_key = 'AIzaSyATPSbFvHa14zbdf5HYoPBO4jCwteR8GfM';
var clock = document.querySelector('.clock');
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
var f = true; // Set degrees to Fahrenheit
var localTime;
var mapDisplay = document.querySelector('#map');
var sunrise;
var sunset;
var timeZone;
var address;
var venues = [];
var zoom = 5;

setInterval(function() {
  var curTime = moment().format('hh:mm:ss a');
  clock.innerHTML = `<p>${curTime}</p>`;
}, 1000);

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
      getVenues();
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
    zoom: zoom,
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

//jb
// var fsqId = 'KIM42M0LDXED1IRRX43F0CR2R43NMMXWUTHWIZUDKZC2F1KI';
// var fsqSecret = 'XSELTNF1LWEKLEV1WLDN1TZTN2QYRDIX0TSIEOCXM0VIJM12';

function getVenues() {
  var date = moment().format('YYYYMMDD');
  // var fsqId = 'KJJTGGS4TT053WQY0KCUNSE1F2E5OJD3VLFSPEE505GQ11WL';
  // var fsqSecret = 'EJ3M4LML42LW3SWSALG0ZAQ4OJ3QESIY3BHHGVWRXCM4UQBK';
  var fsqId = '5YSIJTHSTZH1IIYGA2C04SDNEV2LQTOQB3E4W0TQOI3114XG';
  var fsqSecret = 'MA4KPK10BK15GJG10A52QX2ILMWWYZOCMXL44ELGUIVJERNZ';
  var fSqUrl = `https://api.foursquare.com/v2/venues/search?ll=${lat},${lng}&client_id=${fsqId}&client_secret=${fsqSecret}&v=${date}`;

  axios
    .get(fSqUrl)
    .then(function(res) {
      var data = res.data.response.venues;
      data.forEach(function(venue) {
        if (venue.categories[0]) {
          var icon = venue.categories[0].icon.prefix + 'bg_64.png';
          var category = venue.categories[0].name.toLowerCase();
          if (
            category.includes('restaurant') ||
            category.includes('grill') ||
            category.includes('gallery') ||
            category.includes('park') ||
            category.includes('coffee') ||
            category.includes('food') ||
            category.includes('historic') ||
            category.includes('landmark') ||
            category.includes('monument') ||
            category.includes('ski') ||
            category.includes('sport') ||
            category.includes('yoga') ||
            category.includes('gym') ||
            category.includes('hotel') ||
            category.includes('transport') ||
            category.includes('bank') ||
            category.includes('salon') ||
            category.includes('gift') ||
            category.includes('shop') ||
            category.includes('museum') ||
            category.includes('hall') ||
            category.includes('library') ||
            category.includes('trail')
          ) {
            //Limit list to 10 items
            if (venues.length < 10) {
              // Get coordinates
              lat = venue.location.lat;
              lng = venue.location.lng;
              venues.push(
                `<li class="venue" data-lat=${lat} data-lng=${lng}><img src="${icon}"> ${
                  venue.name
                }</li>`
              );
            }
          }
        }
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function valAlert() {
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
  var celsius = Math.round(tempKelvin - 273.15);
  return celsius;
}

function fahrenheit(tempKelvin) {
  var fahrenheit = Math.round((tempKelvin - 273.15) * 1.8 + 32);
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
      var tempMax = f
        ? fahrenheit(data.main.temp_max)
        : celsius(data.main.temp_max);
      var tempMin = f
        ? fahrenheit(data.main.temp_min)
        : celsius(data.main.temp_min);
      var degree = f ? '°F' : '°C';
      var btnDegree = f ? '°C' : '°F';
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
      var windSpeed = Math.round(data.wind.speed * 2.2369) + ' mph';
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
      output.innerHTML = `
      <div class="jumbotron jumbotron-fluid py-1 m-0">
        <h4>${formattedAddress}</h4>
        <h5 class="time text-center mb-2">Local Time - ${localTime}</h5>
      </div>
      <div class="row">
        <div class="col-sm venues order-2 order-sm-1">
          <ul class="venues">
          ${list}
          </ul>
        </div>
        <div class="col-sm weather order-1 order-sm2">
          <p>${tempOutput} |<span class="set-temp"> ${btnDegree} </span></p>
          <p class="desc">${desc}</p>
          <p><img class="icon" src="${owIcon}"></p>
          <p>Humidity: ${h}</p>
          <p>Wind: ${windDirection} ${windSpeed}</p>
          <p>Sunrise: ${sunriseTz} / Sunset: ${sunsetTz}<p>
        </div>
      </div>
      `;
      venues = [];
      display.appendChild(output);
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
    zoom = 5;
    console.log('address: ', address);
    initializeMap();
    integrateGoogleMaps(address);
    getWeather();
    locInput.value = '';
  } else if (address) {
    valAlert();
  }
});

document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('set-temp')) {
    f = !f;
    getWeather();
  }
});

display.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('venue')) {
    lat = e.target.dataset.lat;
    lng = e.target.dataset.lng;
    zoom = 15;
    initializeMap();
    google.maps.event.addListener(marker, 'dragend', function() {
      zoom = 15;
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
        })
        .catch(function(error) {
          console.log(error);
        });
    });
  }
});
