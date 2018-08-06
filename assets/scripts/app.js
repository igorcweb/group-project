'use strict';
(function() {
  //Open Weather
  var ow_api_key = '7b371ff33bf7c8589f05eb50e8efe90c';
  // var ow_api_key = '874dc6e62ffb6c0e170725fb128a88d6';
  // var ow_api_key = '73fcbe6c9d572f580e2d82aa8001b067';
  //Google Maps
  var gm_api_key = 'AIzaSyARF6nY2h1NJte18_3LHs6rVKbWu-xEejw';
  var clock = document.querySelector('.clock');
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
  var f = true; // Set weather to Fahrenheit
  var localTime;
  var mapDisplay = document.querySelector('#map');
  var timeZone;
  var address;
  var venues = [];
  var zoom = 7;
  var output;

  //Clock
  setInterval(function() {
    var curTime = moment().format('h:mm:ss a');
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
      zoomControl: true
    };

    //Create map
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Create marker
    marker = new google.maps.Marker({
      position: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      map: map,
      draggable: true
    });
  }
  function getTimeZone() {
    var tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=1458000000&key=${gm_api_key}`;
    axios
      .get(tzUrl)
      .then(function(res) {
        timeZone = res.data.timeZoneId.toString();
        localTime = moment.tz(timeZone).format('MMMM Do, h:mm a');
      })
      .catch(function(error) {
        console.log('TZ error: ', error);
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
          formattedAddress = results[0].formatted_address;
          lat = results[0].geometry.location.lat();
          lng = results[0].geometry.location.lng();
          owUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=${ow_api_key}`;
          mapDisplay.classList.remove('d-none');
          initializeMap();
          focusMap();
          focusMarker();
          getTimeZone();
          getWeather();
          google.maps.event.addListener(marker, 'dragend', function() {
            lat = marker.position.lat();
            lng = marker.position.lng();
            // Get address from coordinates with reverse geocoding
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

  function getVenues() {
    var date = moment().format('YYYYMMDD');
    // var fsqId = 'KJJTGGS4TT053WQY0KCUNSE1F2E5OJD3VLFSPEE505GQ11WL';
    // var fsqSecret = 'EJ3M4LML42LW3SWSALG0ZAQ4OJ3QESIY3BHHGVWRXCM4UQBK';
    // var fsqId = 'KIM42M0LDXED1IRRX43F0CR2R43NMMXWUTHWIZUDKZC2F1KI';
    // var fsqSecret = 'XSELTNF1LWEKLEV1WLDN1TZTN2QYRDIX0TSIEOCXM0VIJM12';
    // var fsqId = 'DYQZLBSPANW4NYFXQTM5CPYSHMZONZ1A42HFLPNP2BQB3S4U';
    // var fsqSecret = '0JDHRDEI3GWQ21MWWDEOVRNLFQ0RUHKP5CACM5D5VF1HDXKP';
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
              (category.includes('park') && !category.includes('parking')) ||
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
              category.includes('trail') ||
              category.includes('spa')
            ) {
              //Limit list to 10 items
              if (venues.length < 10) {
                // Get coordinates
                lat = venue.location.lat;
                lng = venue.location.lng;
                venues.push(
                  `<a href="#map"><li class="venue list-group-item list-group-item-action" data-lat=${lat} data-lng=${lng}><img class="venue" src="${icon}"> ${
                    venue.name
                  }</li></a>`
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
        getTimeZone();
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
        var humidity = data.main.humidity + '%';
        output = document.createElement('div');
        output.setAttribute('class', 'text-center mt-2');
        var iconId = data.weather[0].icon;
        var owIcon = `https://openweathermap.org/img/w/${iconId}.png`;
        var desc = data.weather[0].description;
        var sunrise = moment.unix(data.sys.sunrise).format('YYYY-MM-D HH:mm');
        var sunset = moment.unix(data.sys.sunset).format('YYYY-MM-D HH:mm');
        var windSpeed = Math.round(data.wind.speed * 2.2369) + ' mph';
        var windAngle = data.wind.deg;
        var windDirection = getCardinalDirection(windAngle);
        sunrise = moment.tz(moment(sunrise).format(), timeZone);
        sunset = moment.tz(moment(sunset).format(), timeZone);
        var sunriseTz = sunrise
          .clone()
          .tz(timeZone)
          .format('h:mm a');
        var sunsetTz = sunset
          .clone()
          .tz(timeZone)
          .format('h:mm a');
        //Only display min and max temperatures if they are different
        var tempOutput =
          tempMax !== tempMin
            ? `${tempMax}${degree} / ${tempMin}${degree}`
            : tempMax + degree;
        getVenues();
        var list = venues.join('');
        console.log('VENUES: ', list);
        if (!list) {
          list =
            '<p class="alert">No venues found. Please try entering or moving the marker to a different location</p>';
        }
        renderData(
          formattedAddress,
          localTime,
          list,
          tempOutput,
          btnDegree,
          desc,
          owIcon,
          humidity,
          windDirection,
          windSpeed,
          sunriseTz,
          sunsetTz
        );
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function renderData(
    formattedAddress,
    localTime,
    list,
    tempOutput,
    btnDegree,
    desc,
    owIcon,
    humidity,
    windDirection,
    windSpeed,
    sunriseTz,
    sunsetTz
  ) {
    display.innerHTML = '';
    output.innerHTML = `
      <div class="jumbotron jumbotron-fluid py-1 m-0">
        <h4>${formattedAddress}</h4>
        <h5 class="time text-center mb-2">Local Time - ${localTime}</h5>
      </div>
      <div class="row">
        <div class="col venues order-2 order-sm-1">
          <ul class="venues list-group my-3">
          ${list}
          </ul>
        </div>
        <div class="col-lg-3 col-md-4 col-sm-5 offset-md-1 weather order-1 order-sm2 my-3">
          <p class="desc">${desc}</p>
          <p><img class="icon" src="${owIcon}"></p>
          <p class="temp">${tempOutput} |<span class="set-temp"> ${btnDegree} </span></p>
          <p class="humidity">Humidity: ${humidity}, Wind: ${windDirection} ${windSpeed}</p>
          <p class="sun">Sunrise: ${sunriseTz} / Sunset: ${sunsetTz}<p>
        </div>
      </div>
      `;
    venues = [];
    display.appendChild(output);
  }

  //Input Button
  go.addEventListener('click', function(e) {
    e.preventDefault();
    var regex = /^[a-zA-Z,. ]+$/;
    var address = locInput.value.replace('.', '').trim();
    if (address.match(regex)) {
      zoom = 7;
      initializeMap();
      integrateGoogleMaps(address);
      setTimeout(getWeather, 700);
      locInput.value = '';
    } else if (address) {
      valAlert();
    }
  });

  //Temperature Button
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('set-temp')) {
      f = !f;
      getWeather();
    }
  });

  //Venues Click Listener
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
            setTimeout(getWeather, 700);
          })
          .catch(function(error) {
            console.log(error);
          });
      });
    }
  });
})();
