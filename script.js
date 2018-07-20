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

//Get User's Location
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

// map and marker function
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
  //call info window up
  // infowindow.open(map, marker);
  // drag event
}

function integrateGoogleMaps(address) {
  owUrl = `http://api.openweathermap.org/data/2.5/weather?q=${address}&APPID=${ow_api_key}`;
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

        //Get timezone
        (function() {
          var tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=1458000000&key=${gm_api_key}`;
          axios
            .get(tzUrl)
            .then(function(res) {
              console.log('timezone: ', res.data.timeZoneId);
              var timeZone = res.data.timeZoneId.toString();
              console.log('timezone: ', timeZone);
              localTime = moment.tz(timeZone).format('MMMM Do, h:mm a');
              console.log('local time: ', localTime);
            })
            .catch(function(error) {
              console.log(error);
            });
        })();
        mapDisplay.classList.remove('d-none');

        // updateInputs();
        getWeather();
        initializeMap();
        focusMap();
        focusMarker();
        google.maps.event.addListener(marker, 'dragend', function() {
          lat = marker.position.lat();
          lng = marker.position.lng();
          focusMap();
        });
      }
    }
  );
}

go.addEventListener('click', function(e) {
  e.preventDefault();
  var regex = /^[a-zA-Z,. ]+$/;
  var address = locInput.value.replace('.', '').trim();
  if (address && address.match(regex)) {
    console.log('address: ', address);
    integrateGoogleMaps(address);
    locInput.value = '';
  } else {
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
  }, 4000);
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
        ? fahrenheit(data.main.temp_max) + '°F'
        : celsius(data.main.temp_max) + '°C';
      var tempMin = F
        ? fahrenheit(data.main.temp_min) + '°F'
        : celsius(data.main.temp_min) + '°C';
      var cfButton = F ? 'C' : 'F';
      console.log(data);
      var h = data.main.humidity + '%';
      var output = document.createElement('div');
      output.setAttribute('class', 'text-center mt-2');
      output.innerHTML = `
      <h4 class="text-center mt-2">${formattedAddress}</h4>
      <h5 class="time text-center mb-2">Local Time - ${localTime}</h5>

      <p>Today's Temperature: ${tempMax} / ${tempMin} <span><button class="fc p-0 btn btn-primary">${cfButton}</button></span></p>
      <p>Humidity: ${h}</p>
      `;
      display.appendChild(output);
    })
    .catch(function(error) {
      valAlert();
      console.log(error);
    });
}

display.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('fc')) {
    F = !F;
    getWeather();
  }
});

var dateString = moment.unix(1532037360).format('MM/DD/YYYY h:mm:ss a');

console.log('dateString: ', dateString);
