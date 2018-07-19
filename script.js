// Open weather API Key
var api_key = '7b371ff33bf7c8589f05eb50e8efe90c';

var cityInput = document.querySelector('#cityInput');
var go = document.querySelector('button[type=submit]');
var alert = document.querySelector('.alert');
var display = document.querySelector('.display');
var url;
var city;

go.addEventListener('click', function(e) {
  e.preventDefault();
  var letterSpaces = /^[a-zA-Z, ]+$/;

  if (cityInput.value.match(letterSpaces)) {
    city = cityInput.value.trim();
    url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${api_key}`;
    getWeather();
    cityInput.value = '';
  }
});

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
      <h4 class="text-center mt-2">Weather in ${city}:</h4> 
      <p>Current Temperature: ${f} / ${c}</p>
      <p>Humidity: ${h}</p>
      `;
      display.appendChild(output);
    })
    .catch(function(error) {
      console.log(error);
      display.innerHTML = '';
      alert.classList.remove('d-none');
      setTimeout(function() {
        alert.classList.add('d-none');
      }, 2000);
    });
}
