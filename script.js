// api links

const APIKEY = '28eb39bbdaa118f294b477907525a5cf';

let weatherApi = `https://api.openweathermap.org/data/2.5/forecast?lat=33.44&lon=-94.04&appid=28eb39bbdaa118f294b477907525a5cf`;


let geocodingApi = "https://api.openweathermap.org/geo/1.0/direct?q=London&appid=28eb39bbdaa118f294b477907525a5cf"

//dom components--------------------------------


// user-interaction dom
const user_Input = document.getElementById("user-input");
const search_btn = document.querySelector(".search-svg");

//adress dom
const cityName = document.querySelector(".cityname").firstElementChild;
const country_Name = document.querySelector(".cityname").children[1].children[0];
const current_latitude = document.querySelector(".lat");
const current_longitude = document.querySelector(".lon");

// temperature info dom
const recorder_temp = document.querySelector(".temp");
const temp_celcius = document.getElementById("celsius");
const temp_fahrenheit = document.getElementById("fahrenheit");
const temp_max_current = document.querySelector(".max-min-Temp").children[1];
const temp_min_current = document.querySelector(".max-min-Temp").children[3];

// console.log(weather_max_current);

// date-info dom
const current_Date = document.querySelector(".current_date");
const current_time = document.querySelector(".current_time");

//weather descriptiona and logo dom
const weather_description = document.querySelector(".weather-description");

//weather icon dom
const weather_image = document.querySelector(".weather-icon");
// console.log(weather_image.src);

//nearby-locations dom
const nearby_Locations_container = document.querySelector(".nearby-locations").children[0];

// more-weather-info dom
const atm_pressure = document.querySelector(".atm-pressure");
const humidity = document.querySelector(".current_humidity");
const cloudiness = document.querySelector(".current_cloud");
// console.log(cloudiness);
const sunrise = document.querySelector(".sunrise");
const sunset = document.querySelector(".sunset");
const wind_speed = document.querySelector(".wind-speed");
const wind_dir = document.querySelector(".wind-dir");

//forecast-info dom
const forecast_list = document.querySelector(".forecast-list");

//current forecast dom
const current_forecast_list = document.querySelector(".current-forecast-list");


//button to search city name and the respective functions
search_btn.addEventListener("click", () => {
  apiCall(user_Input.value);

  getallTimearray();

})


//geocoding functions
async function apiCall(userInput) {
  try {
    let geocode_result = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${userInput}&appid=${APIKEY}`);
    let geocode_response = await geocode_result.json();

    if (geocode_response.length > 0) {

      lat = geocode_response[0].lat;
      lon = geocode_response[0].lon;

      weatherReq(lat, lon);
      nearbyLocation(lat, lon);

      initializeOrUpdateMap(lat, lon, 10);

      // setting up coordinate information
      current_latitude.innerHTML = `Latitude: <span class="blue-text">${lat.toFixed(2)}</span>`;
      current_longitude.innerHTML = `Longitude: <span class="blue-text">${lon.toFixed(2)}</span>`;

    }
    else {
      alert("place does not exist");
    }

    // console.log(weather_response);

  }
  catch (err) {
    console.log("error spotted: ", err);
  }
}


//function to get weather data
async function weatherReq(lat, lon) {

  let weather_result = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`);
  let weather_response = await weather_result.json();
  // console.log(w);

  processDatas(weather_response);
}



//function for data processing
async function processDatas(responseWeather) {
  // ------recorder infos------
  console.log(responseWeather);

  let city = responseWeather.city.name;
  let country = responseWeather.city.country;
  let temp_list = responseWeather.list;





  if (user_Input.innerHTML === city) {
    cityName.innerHTML = city.toUpperCase();
  }
  else {
    cityName.innerHTML = user_Input.value;
    // address.innerHTML = city;
    country_Name.innerHTML = country;
  }



  // cityName.innerHTML = responseWeather.city.name;


}


//Array of time and date 
async function getallTimearray() {
  try {
    let geocode_result = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${user_Input.value}&appid=${APIKEY}`);
    let geocode_response = await geocode_result.json();

    if (geocode_response.length > 0) {

      lat = geocode_response[0].lat;
      lon = geocode_response[0].lon;

      let weather_result = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`);
      let weather_response = await weather_result.json();
      // console.log(weather_response);
      const dateArray = [];
      const timeArray = [];
      for (let i = 0; i < weather_response.list.length; i++) {
        let timeSeg = weather_response.list[i].dt_txt.split(" ")[1];
        let dateSeg = weather_response.list[i].dt_txt.split(" ")[0];
        dateArray.push(dateSeg);
        timeArray.push(timeSeg);
      }

      // console.log(timeArray);
      getTempanddate(weather_response, dateArray, timeArray);

    }
  }
  catch (err) {
    console.log("Erro: ", err);
  }

}

// function to get temperature and weather description and weather infos.
async function getTempanddate(temp_list, dateArray, timeArray) {

  let TimeArray = timeArray.map(time => getCurrentDateTime(undefined, time));
  // console.log(temp_list);
  // console.log(dateArray);

  // console.log(TimeArray);

  let user_date_time = getCurrentDateTime();

  let dateandTime = user_date_time.split(",");
  // user date and time 
  let User_date = dateandTime[0];
  let User_time = dateandTime[1];

  currentForecastList(User_date, User_time, temp_list);
  // console.log(User_date);
  futureForecast(User_date, temp_list, dateArray);
  //displaying the user date and time
  current_Date.innerHTML = User_date;
  current_time.innerHTML = User_time;

  let result = findLastSmallerOrEqualTime(TimeArray, User_time, dateArray, User_date);
  let last_valid_index = result.index;
  let last_valid_time = result.time;
  // console.log(last_valid_index);

  let matchCount = 0;

  for (let i = 0; i < dateArray.length; i++) {
    if (dateArray[i] === User_date) {
      matchCount++;
    }
  }

  // -----processing temperatures
  let current_temp = convertKelvinToCelsius
    (temp_list.list[last_valid_index].main.temp);
  let current_min_temp = convertKelvinToCelsius(temp_list.list[last_valid_index].main.temp_min);
  let current_max_temp = convertKelvinToCelsius(temp_list.list[last_valid_index].main.temp_max);
  let pressure = temp_list.list[last_valid_index].main.pressure;


  recorder_temp.innerHTML = current_temp;
  temp_max_current.innerHTML = current_max_temp;
  temp_min_current.innerHTML = current_min_temp;
  atm_pressure.innerHTML = `${pressure} hPa`;

  // -------processing weather description and icon
  let weather_icon = temp_list.list[last_valid_index].weather[0].icon;

  getWeatherIcon(weather_icon, undefined);

  weather_description.innerHTML = temp_list.list[last_valid_index].weather[0].description;


  //processsing humidity
  let humidity_level = temp_list.list[last_valid_index].main.humidity;
  humidity.innerHTML = `Humidity: <span class="blue-text">${humidity_level}%</span>`;

  //process cloudiness
  let cloudiness_level = temp_list.list[last_valid_index].clouds.all;
  cloudiness.innerHTML = `Cloudiness: <span class="blue-text">${cloudiness_level}%<span>`

  //sunrise and sunset time processing
  let sunrise_time = getTimeFromTimestamp(temp_list.city.sunrise)
  let sunset_time = getTimeFromTimestamp(temp_list.city.sunset)

  sunrise.innerHTML = `Sunrise: <span class="blue-text">${sunrise_time}</span>`
  sunset.innerHTML = `Sunset: <span class="blue-text">${sunset_time}</span>`


  // wind and wind speed processing
  let record_wind_speed = temp_list.list[last_valid_index].wind.speed;
  let record_wind_dir = temp_list.list[last_valid_index].wind.deg;

  wind_speed.innerHTML = `Wind-Speed: <span class="blue-text"> ${record_wind_speed} m/s </span>`
  wind_dir.innerHTML = `Wind-Dir: <span class="blue-text"> ${record_wind_dir}&deg;</span>`


}

// function for converting unix timestamps
function getTimeFromTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// convert time to minute
function timeToNumber12HourFormat(time) {
  const [hourMinute, period] = time.split(" ");
  let [hours, minutes] = hourMinute.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

//  function to find the recent smallest time that the user time
function findLastSmallerOrEqualTime(timeArray, userTime, dateArray, User_date) {

  // console.log(timeArray);



  const userTimeValue = timeToNumber12HourFormat(userTime);
  // console.log(userTimeValue);
  let lastValidTime = null;
  let lastValidIndex = 1;

  for (let j = 0; j < dateArray.length; j++) {
    if (dateArray[j] === User_date) {
      for (let i = 0; i < timeArray.length; i++) {
        const currentTimeValue = timeToNumber12HourFormat(timeArray[i]);
        if (currentTimeValue <= userTimeValue) {
          lastValidTime = timeArray[i];
          lastValidIndex = i;
        } else {
          break;
        }
      }
    }

  }

  return { time: lastValidTime, index: lastValidIndex };
}


// function to get the weather icon
function getWeatherIcon(icon, forecast_icon) {
  // console.log(icon);
  let forecast_icon_code = "";
  if (icon !== undefined) {
    switch (icon) {
      case '01d':
      case '01n':
        weather_image.src = `./aseets/01d.png`
        break;
      case '02d':
      case '02n':
        weather_image.src = `./aseets/02n.png`
        break;
      case '03d':
      case '03n':
        weather_image.src = `./aseets/03d.png`
        break;
      case '04d':
      case '04n':
        weather_image.src = `./aseets/04d.png`
        break;
      case '09d':
      case '09n':
        weather_image.src = `./aseets/09d.png`
        break;
      case '10d':
      case '10n':
        weather_image.src = `./aseets/10d.png`
        break;
      case '11d':
      case '11n':
        weather_image.src = `./aseets/11d.png`
        break;
      case '13d':
      case '13n':
        weather_image.src = `./aseets/13d.png`
      case '50d':
      case '50n':
        weather_image.src = `./aseets/50d.png`;
    }
  }
  else {
    switch (forecast_icon) {
      case '01d':
      case '01n':
        forecast_icon_code = "01d";
        break;
      case '02d':
      case '02n':
        forecast_icon_code = "02n";
        break;
      case '03d':
      case '03n':
        forecast_icon_code = "03d";
        break;
      case '04d':
      case '04n':
        forecast_icon_code = "04d";
        break;
      case '09d':
      case '09n':
        forecast_icon_code = "09d";
        break;
      case '10d':
      case '10n':
        forecast_icon_code = "10d";
        break;
      case '11d':
      case '11n':
        forecast_icon_code = "11d";
        break;
      case '13d':
      case '13n':
        forecast_icon_code = "13d";
      case '50d':
      case '50n':
        forecast_icon_code = "50d";
    }
    return forecast_icon_code;
  }

}



// function to covert temp from kelvin to celcius
function convertKelvinToCelsius(kelvin) {
  if (typeof kelvin !== 'number') {
    alert("Invalid temperature value. Kelvin cannot be negative.");
  }

  const celsius = kelvin - 273.15;
  return celsius.toFixed(1);
}

// function to covert temp from kelvin to fahrenheit
function kelvinToFahrenheit(kelvin) {
  if (kelvin < 0) {
    throw new Error('Temperature in Kelvin cannot be negative.');
  }
  const fahrenheit = (kelvin - 273.15) * 9 / 5 + 32;
  return fahrenheit.toFixed(1); // Returns the value rounded to 2 decimal places
}


//function to get user time and date
function getCurrentDateTime(get_Data, convert_data) {
  if (get_Data === undefined && convert_data === undefined) {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${year}-${month}-${day},${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  }

  else {

    const [hours, minutes, seconds] = convert_data.split(':').map(Number);


    const period = hours >= 12 ? 'PM' : 'AM';


    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}


// event listener for celcius and fahrenheit

temp_fahrenheit.addEventListener("click", async () => {


  if (recorder_temp.innerHTML === "0°") {
    return
  }
  else {
    try {
      let geocode_result = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${user_Input.value}&appid=${APIKEY}`);
      let geocode_response = await geocode_result.json();

      if (geocode_response.length > 0) {

        lat = geocode_response[0].lat;
        lon = geocode_response[0].lon;

        let weather_result = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`);
        let weather_response = await weather_result.json();
        let kelvin_temp = weather_response.list[0].main.temp;
        let temp = kelvinToFahrenheit(kelvin_temp);

        if (recorder_temp.innerHTML === temp) {
          return
        }
        else {
          recorder_temp.innerHTML = temp;
        }
        // console.log(weather_response);

      }

    }
    catch (err) {
      console.log("error");
    }

  }

})



temp_celcius.addEventListener("click", async () => {


  if (recorder_temp.innerHTML === "0°") {
    return
  }
  else {
    try {
      let geocode_result = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${user_Input.value}&appid=${APIKEY}`);
      let geocode_response = await geocode_result.json();

      if (geocode_response.length > 0) {

        lat = geocode_response[0].lat;
        lon = geocode_response[0].lon;

        let weather_result = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`);
        let weather_response = await weather_result.json();
        let kelvin_temp = weather_response.list[0].main.temp;
        let temp = convertKelvinToCelsius(kelvin_temp);

        if (recorder_temp.innerHTML === temp) {
          return
        }
        else {
          recorder_temp.innerHTML = temp;
        }
        // console.log(weather_response);

      }

    }
    catch (err) {
      console.log("error");
    }

  }

})


//Map script
let map;
let marker;

function initializeOrUpdateMap(latitude, longitude, zoomLevel) {

  if (map) {
    map.setView([latitude, longitude], zoomLevel);

    if (marker) {
      marker.setLatLng([latitude, longitude]);
    } else {
      marker = L.marker([latitude, longitude]).addTo(map);
    }
  } else {
    map = L.map('map-container').setView([latitude, longitude], zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    marker = L.marker([latitude, longitude]).addTo(map);
  }
}

window.addEventListener('load', initializeDefaultMapView);

function initializeDefaultMapView() {
  // Check if the map already exists
  if (!map) {
    // Initialize the map with world view
    map = L.map('map-container').setView([0, 0], 0.5); // Centered at (0, 0) with zoom level 2

    // Add a tile layer (necessary for the map to render properly)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // No markers are added at this stage
  }
}

//Nearby location generator

function nearbyLocation(lat, lon) {
  const locations = [];
  function getRandomCoordinate(base, range) {
    return base + (Math.random() * range * 2 - range);
  }

  const range = 1;

  for (let i = 1; i <= 5; i++) {
    const randomLat = getRandomCoordinate(lat, range);
    const randomLon = getRandomCoordinate(lon, range);
    locations.push({ lat: randomLat.toFixed(2), lon: randomLon.toFixed(2) });
  }

  nearby_Locations_container.innerHTML = "";
  if (locations.length > 4 && locations.length <= 5) {

    locations.forEach(location => {
      const latitude = parseFloat(location.lat);
      const longitude = parseFloat(location.lon);
      getCityName(latitude, longitude);
    });
  }


  async function getCityName(lat, lon) {
    try {
      let weather_result = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`
      );
      let weather_response = await weather_result.json();

      let cityName = weather_response.city.name;
      const li = document.createElement("li");
      li.innerHTML = cityName;

      li.addEventListener("click", () => {
        //  apiCall(li.innerHTML);
        user_Input.value = li.innerHTML;
        apiCall(user_Input.value);
        getallTimearray();
      });

      nearby_Locations_container.appendChild(li);

    } catch (error) {
      console.error("Error fetching city name:", error);
    }
  }



}


// -------------------forecast script
function futureForecast(user_date, data_list, dateArray) {
  const forecast_array = [];
  const date = new Date(user_date);
  for (let i = 0; i < 6; i++) {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    forecast_array.push(formattedDate);
    date.setDate(date.getDate() + 1);
  }


  forecast_list.innerHTML = "";
  for (let j = 1; j < forecast_array.length; j++) {
    const forecastDate = `${forecast_array[j]} 12:00:00`;
    for (let i = 0; i < data_list.list.length; i++) {
      const forecast_time_date = data_list.list[i].dt_txt;
      if (forecast_time_date === forecastDate) {
        let info = data_list.list[i]
        console.log(info);
        setforecastInfo(info);
      }
    }
  }
  return -1;

}

function setforecastInfo(data_list) {
  let date = data_list.dt_txt.split(" ")[0];
  let temp = convertKelvinToCelsius(data_list.main.temp);
  let weather_condition = data_list.weather[0].description;
  function getDayName(dateString) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    return days[dayIndex];
  }
  let day = getDayName(date);
  let icon = getWeatherIcon(undefined, data_list.weather[0].icon);
  // console.log(icon);

  let list_item = `  <li>
                    <span>${day}</span>
                    <span>${temp}&deg;</span>
                    <span>${weather_condition}</span>
                    <img src="./aseets/${icon}.png" alt="weather-icon">
                </li>`;
  forecast_list.innerHTML += list_item;
}

// script for current forecast data

function currentForecastList(userdate, usertime, data_list) {
  const matchingtime = [];
  // const matchingindices = [];

  for (let i = 0; i < data_list.list.length; i++) {
    if (data_list.list[i].dt_txt.includes(userdate)) {
      let dummy_time = data_list.list[i].dt_txt.split(" ")[1];
      let time = convertTo12HourFormat(dummy_time);
      matchingtime.push(`${time},${i}`);
      // matchingindices.push(i); 
    }
  }


  console.log(matchingtime);
  // console.log(matchingindices);

  const userminute = timeToNumber12HourFormat(usertime);
  const listtime = [];
  // console.log(userminute);

  for (let i = 0; i < matchingtime.length; i++) {
    const currentMinutes = timeToNumber12HourFormat(matchingtime[i].split(",")[0]);
    if (currentMinutes >= userminute) {
      listtime.push(matchingtime[i]);
    }
  }

  // creating list elements
  if (listtime.length !== 0) {
    listtime.forEach(item => {
      let index = item.split(",")[1];
      let time = item.split(",")[0];
      let temp = convertKelvinToCelsius(data_list.list[index].main.temp);
      console.table({ "time": time, "position": index, "temp": temp });

      current_forecast_list.style.visibility = 'visible';
      let list = `<li>${time}: <span class="blue-text">${temp}&deg;</span></li>`
      current_forecast_list.innerHTML += list;
    })
  } else {
    //  current_forecast_list.style.visibility = 'hidden';
  }


}

function convertTo12HourFormat(time24) {
  let [hours, minutes, seconds] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
}


