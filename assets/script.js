// API key for OpenWeatherMap
const apiKey = "9cd63400f12f96bf82177a4476d05989";
// Retrieve the last search from local storage
let lastSearch = localStorage.getItem("lastSearch") || '';

// Event listener for search form
document.querySelector("#searchForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const cityInputEl = document.querySelector("#cityInput");
    const cityInput = cityInputEl.value.trim();
    if (cityInput) {
        getWeather(cityInput);
        saveLastSearch(cityInput);
        renderLastSearch();
        cityInputEl.value = "";
    }
});

// Event listeners for the preselected city buttons
document.querySelectorAll('#preselected-cities button').forEach(button => {
    button.addEventListener('click', () => {
        const city = button.textContent;
        getWeather(city);
        saveLastSearch(city);
        renderLastSearch();
    });
});

// Fetch weather data from OpenWeatherMap API
function getWeather(cityInput) {
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&appid=${apiKey}&units=imperial`;
    fetch(queryURL)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(function (data) {
            renderWeather(data);
        })
        .catch(function (error) {
            console.log("Error fetching data: ", error);
            document.querySelector('#weather-container').innerHTML = '<p>City not found. Please try again.</p>';
        });
}

// Save the last search to local storage
function saveLastSearch(city) {
    lastSearch = city;
    localStorage.setItem("lastSearch", lastSearch);
}

// Render the last search as a button
function renderLastSearch() {
    const recentSearch = document.querySelector("#recentSearch");
    recentSearch.innerHTML = ""; // Clear prior search
    if (lastSearch) {
        const button = document.createElement("button");
        button.className = "button is-fullwidth is-light mb-1";
        button.textContent = lastSearch;
        button.onclick = function () {
            getWeather(lastSearch);
        };
        recentSearch.appendChild(button);
    }
}

// Render and display weather data in cards
function renderWeather(data) {
    const weatherContainer = document.querySelector("#weather-container");
    weatherContainer.innerHTML = "";


    const dayData = data.list.filter(function (filterData) {
        return filterData.dt_txt.includes("12:00:00");
    });

    // Display current weather
    const currentWeather = dayData[0];
    const currentWeatherBox = `
        <div class="box current-weather">
            <img src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png" alt="${currentWeather.weather[0].description}">
            <div>
                <h2 class="title">${data.city.name} (${new Date(currentWeather.dt_txt).toLocaleDateString()})</h2>
                <p>Temp: ${currentWeather.main.temp} °F</p>
                <p>Wind: ${currentWeather.wind.speed} MPH</p>
                <p>Humidity: ${currentWeather.main.humidity} %</p>
            </div>
        </div>
    `;
    weatherContainer.insertAdjacentHTML('beforeend', currentWeatherBox);

    // Display 4-day forecast
    const forecastContainer = document.createElement('div');
    forecastContainer.className = 'forecast-container columns is-multiline';
    dayData.slice(1, 5).forEach(function (day) {
        const forecastBox = `
            <div class="column is-one-quarter">
                <div class="box weather-box">
                    <h4>${new Date(day.dt_txt).toLocaleDateString()}</h4>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                    <p>Temp: ${day.main.temp} °F</p>
                    <p>Wind: ${day.wind.speed} MPH</p>
                    <p>Humidity: ${day.main.humidity} %</p>
                </div>
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', forecastBox);
    });
    weatherContainer.appendChild(forecastContainer);
}

// Render last search on page load
renderLastSearch();
