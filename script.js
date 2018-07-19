// Open weather API Key
var api_key = '7b371ff33bf7c8589f05eb50e8efe90c';

var cityInput = document.querySelector('#cityInput');
var go = document.querySelector('button[type=submit]');
var alert = document.querySelector('.alert');
var display = document.querySelector('.display');
var url;
var city;
var address;
var marker;
var map;
var mapDisplay = document.querySelector('#map');
// var infoContent;
// var infowindow = new google.maps.InfoWindow({
//   content: infoContent
// });

// map and marker function
function initializeMap() {
  mapDisplay.classList.remove('d-none');
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

go.addEventListener('click', function(e) {
  e.preventDefault();
  address = cityInput.value.replace('.', '').trim();
  console.log('address: ', address);
  if (address) {
    url = `http://api.openweathermap.org/data/2.5/weather?q=${address}&APPID=${api_key}`;
    getWeather();
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: address
      },
      function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          lat = results[0].geometry.location.lat();
          lng = results[0].geometry.location.lng();
          // loadWeather();
          // updateInputs();
          // focusMarker();
          // focusMap();
          initializeMap();
          focusMap();
          focusMarker();
          google.maps.event.addListener(marker, 'dragend', function() {
            lat = marker.position.lat();
            lng = marker.position.lng();
            //loadWeather();
            //updateInputs();
            focusMap();
          });
        }
      }
    );
    cityInput.value = '';
  }
});

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
    .get(url)
    .then(function(res) {
      display.innerHTML = '';
      var data = res.data;
      var tempKelvin = data.main.temp;
      console.log(data);
      var f = fahrenheit(tempKelvin) + '°F';
      var c = celsius(tempKelvin) + '°C';
      var h = data.main.humidity + '%';
      var output = document.createElement('div');
      output.setAttribute('class', 'text-center mt-2');
      output.innerHTML = `
      <h4 class="text-center mt-2">Weather in ${address}:</h4> 
      <p>Current Temperature: ${f} / ${c}</p>
      <p>Humidity: ${h}</p>
      `;
      display.appendChild(output);
    })
    .catch(function(error) {
      console.log(error);
      mapDisplay.classList.add('d-none');
      display.innerHTML = '';
      alert.classList.remove('d-none');
      setTimeout(function() {
        alert.classList.add('d-none');
      }, 2000);
    });
}
