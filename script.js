function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.textContent.replace(/\s/g, '').toLowerCase() === id);
  });
  if (id === 'map') loadMap();
}

const apiKey = 'aff3dd890447ec7f94cbb1fcd4aca778'; // Your API key
let coords = null;

function getWeather() {
  const city = document.getElementById('city').value.trim();
  if (!city) {
    document.getElementById('error-msg').textContent = 'Please enter a city name.';
    return;
  }
  document.getElementById('error-msg').textContent = '';

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error('City not found');
      return res.json();
    })
    .then(data => {
      coords = { lat: data.coord.lat, lon: data.coord.lon };

      document.getElementById('humidity').textContent = data.main.humidity + ' %';
      document.getElementById('Temperature').textContent = data.main.temp + ' °C';
      document.getElementById('Pressure').textContent = data.main.pressure + ' hPa';
      document.getElementById('Wind').textContent = data.wind.speed + ' m/s';

      document.getElementById('sun-times').innerHTML = `
        <div><strong>Sunrise:</strong> ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</div>
        <div><strong>Sunset:</strong> ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</div>
      `;

      loadDailyForecast(coords.lat, coords.lon);
      loadHourlyForecast(coords.lat, coords.lon);
      loadAirQuality(coords.lat, coords.lon);

      showSection('current');
    })
    .catch(() => {
      document.getElementById('error-msg').textContent = 'City not found or API error.';
    });
}

function loadDailyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      let html = '<h2>7-Day Forecast</h2>';
      data.daily.forEach(day => {
        let date = new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        html += `
          <div class="forecast-day">
            <div>${date}</div>
            <img src="<http://openweathermap.org/img/wn/${day.weather>[0].icon}@2x.png" alt="${day.weather[0].description}" />
            <div>Min: ${day.temp.min.toFixed(1)}°C</div>
            <div>Max: ${day.temp.max.toFixed(1)}°C</div>
          </div>
        `;
      });
      document.getElementById('daily').innerHTML = html;
    });
}

function loadHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      let html = '<h2>Hourly Forecast (Next 12 Hours)</h2>';
      data.hourly.slice(0, 12).forEach(hour => {
        let time = new Date(hour.dt * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        html += `
          <div class="forecast-day">
            <div>${time}</div>
            <img src="<http://openweathermap.org/img/wn/${hour.weather>[0].icon}@2x.png" alt="${hour.weather[0].description}" />
            <div>${hour.temp.toFixed(1)}°C</div>
            <div>Rain: ${(hour.pop * 100).toFixed(0)}%</div>
          </div>
        `;
      });
      document.getElementById('hourly').innerHTML = html;
    });
}

function loadAirQuality(lat, lon) {
  fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.list && data.list.length > 0) {
        const aqi = data.list[0].main.aqi;
        const desc = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1] || 'Unknown';
        const colors = ['#4caf50', '#ffeb3b', '#ff9800', '#f44336', '#b71c1c'];
        const color = colors[aqi - 1] || '#555';
        const el = document.getElementById('air-qual');
        el.textContent = `AQI: ${aqi} (${desc})`;
        el.style.color = color;
      }
    });
}

function loadMap() {
  const iframe = document.getElementById('weather-map');
  if (!coords) {
    iframe.src = '';
    return;
  }
  iframe.src = `https://openweathermap.org/weathermap?basemap=map&layer=temperature&lat=${coords.lat}&lon=${coords.lon}&zoom=6`;
}
