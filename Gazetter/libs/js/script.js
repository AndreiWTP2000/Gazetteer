/* Preloader */
$(window).on("load", () => {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(4000)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});
/*Global Variables */
let marker;
let defaultIcon = L.icon({
  iconUrl: `././image/map-pins/default-marker.png`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});
let exchangeRates = [];
/**FUNCTIONS */
/*Highlight Border Function */
var curentCountry;
let sameBorderStopReRender;
const highlightBorders = (countryCode2, getBoundsSwitch) => {
  if (countryCode2 === sameBorderStopReRender) return;
  sameBorderStopReRender = countryCode2;
  if (curentCountry) {
    map.removeLayer(curentCountry);
  }
  $.ajax({
    url: "libs/php/getCountryBorders.php",
    type: "GET",
    dataType: "JSON",
    data: {
      countryCode2: countryCode2,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        const countryBorders = result.data;
        const borderStyle = {
          stroke: true,
          weight: 2,
          color: "#0077ff",
          lineCap: "round",
          lineJoin: "round",
          dashArray: "4",
          fill: false,
        };
        curentCountry = L.geoJSON(countryBorders, {
          style: borderStyle,
        }).addTo(map);
      }
      // if (getBoundsSwitch) {
      map.fitBounds(curentCountry.getBounds(), {
        pan: true,
        animate: true,
        duration: 1.0,
      });

      // }
    },
  });
};
/* Reverse Geocoding function*/
const reversGeocoding = (latitude, longitude, switchRoutine) => {
  $.ajax({
    url: "libs/php/reverseGeocoding.php",
    type: "GET",
    dataType: "JSON",
    data: {
      lat: latitude,
      lng: longitude,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        const countryCode =
          result.data.results[0].components["ISO_3166-1_alpha-3"];
        const countryCodeShort =
          result.data.results[0].components["ISO_3166-1_alpha-2"];
        const country =
          result.data.results[0].components.country ??
          result.data.results[0].components.body_of_water;
        if (switchRoutine === "user_location") {
          $("#select-option-menu").find("option:selected").text(country);
          selectRoutine(countryCodeShort, countryCode, country);
          return;
        } else if (switchRoutine === "click_location") {
          $("#select-option-menu").find("option:selected").text(country);
          clickRoutine(countryCodeShort, countryCode, country);
        }
        const continent = result.data.results[0].components.continent;
        const address = result.data.results[0].formatted;

        $("#modal-continent").text(continent ? continent : "N/S");
        $("#address").text(address ? address : "N/S");
        $(".modal-address").text(address ? address : "N/S");
        $(".country").text(country ? country : "N/S");
        $("#country-code").text(countryCode ? countryCode : "N/S");
      }
    },
  });
};
/* Get Timezone Function */
const getTimezone = (latitude, longitude) => {
  $.ajax({
    url: "libs/php/geoNamesApi.php",
    type: "GET",
    dataType: "JSON",
    data: {
      api: "timezone",
      lat: latitude,
      lng: longitude,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        const apiDateTime = result.data.time;
        const dateObject = new Date(apiDateTime);
        const formattedDatetime = dateObject.toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const timezone = result.data.timezoneId;
        const timezoneOffset = `UTC ${result.data.rawOffset}`;
        const sunrise = result.data.sunrise;
        const sunset = result.data.sunset;
        formattedDatetime
          ? $("#modal-date-time").text(formattedDatetime)
          : $("#modal-date-time").text("N/S");
        timezone
          ? $("#modal-timezone-id").text(timezone)
          : $("#modal-timezone-id").text("N/S");
        timezoneOffset
          ? $("#modal-timezone-offset").text(timezoneOffset)
          : $("#modal-timezone-offset").text("N/S");
        sunrise
          ? $("#modal-sunrise").text(sunrise.slice(11))
          : $("#modal-sunrise").text("N/S");
        sunset
          ? $("#modal-sunset").text(sunset.slice(11))
          : $("#modal-sunset").text("N/S");
      }
    },
  });
};
/* Get Weather Function */
const getWeather = (latitude, longitude) => {
  $.ajax({
    url: "libs/php/openWeatherApi.php",
    type: "GET",
    dataType: "JSON",
    data: {
      lat: latitude,
      lng: longitude,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        const currentTemp = `${Math.floor(result.data.current.temp)}°C`;
        $(".weather-current-temp").text(currentTemp);
        const iconLink = `https://openweathermap.org/img/wn/${result.data.current.weather[0].icon}@2x.png`;
        $("#weather-current-icon").attr("src", iconLink);
        var currentTimestamp = result.data.current.dt;
        var currentTimestampInMilliseconds = currentTimestamp * 1000;
        var currentDateObject = new Date(currentTimestampInMilliseconds);
        var hour = currentDateObject.getHours();
        var locationTime = hour + result.data.timezone_offset / 3600;
        /* Hourly Weather Forcast */
        $(".hourly-weather").empty();
        for (var i = 0; i < 24; i++) {
          var formattedLocationTime;
          if (locationTime < 10) {
            formattedLocationTime = `0${locationTime}:00`;
          } else if (locationTime < 25) {
            formattedLocationTime = `${locationTime}:00`;
          } else {
            locationTime = locationTime - 24;
            formattedLocationTime = `0${locationTime}:00`;
          }
          var hourlyWeather = ` <div class="flex-column me-4">
                                    <p class="small mb-0"><strong>${Math.floor(
                                      result.data.hourly[i].temp
                                    )}°C</strong></p>
                                    <img src="https://openweathermap.org/img/wn/${
                                      result.data.hourly[i].weather[0].icon
                                    }.png" alt=${
            result.data.hourly[i].weather[0].icon.description
          } />
                                    <p class="mb-0"><strong>${
                                      i === 0 ? "Now" : formattedLocationTime
                                    }</strong></p>
                                  </div>`;
          locationTime++;
          $(".hourly-weather").append(hourlyWeather);
        }
      }
      /* Daily Weather Forcast */
      $(".daily-weather").empty();
      var currentDay = currentDateObject.getDay();
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (var i = 0; i < 5; i++) {
        if (currentDay > 6) currentDay = 0;
        var dailyWeather = `<div class="flex-column">
                                <p class="small mb-0"><strong>${Math.floor(
                                  result.data.daily[i].temp.day
                                )}°C</strong></p>
                                <img src="https://openweathermap.org/img/wn/${
                                  result.data.daily[i].weather[0].icon
                                }.png" alt=${
          result.data.daily[i].weather[0].description
        } />
                                <p class="mb-0"><strong>${
                                  daysOfWeek[currentDay]
                                }</strong></p>
                              </div>
          `;
        $(".daily-weather").append(dailyWeather);
        currentDay++;
      }
    },
  });
};
/* Get Largest Cities Function*/
const getCities = (countryCode) => {
  citiesLayerGroup.clearLayers();
  $("#cities-body").empty();
  if (countryCode) {
    $.ajax({
      url: "libs/php/getLargestCities.php",
      type: "GET",
      dataType: "JSON",
      data: {
        countryCode: countryCode,
      },
      success: (result) => {
        if (result.status.name == "ok") {
          for (var i = 0; i < result.data.geonames.length; i++) {
            var population = result.data.geonames[i].population;
            var formattedPopulation = population.toLocaleString();
            var city = `
                      <tr>
                        <th scope="row">${i + 1}</th>
                        <td>${result.data.geonames[i].name}</td>
                        <td>${formattedPopulation}</td>
                      </tr>
                      `;
            $("#cities-body").append(city);
            var cityIcon = L.icon({
              iconUrl: `././image/map-pins/pin${i + 1}.png`,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -35],
            });
            var markerCity = L.marker(
              [result.data.geonames[i].lat, result.data.geonames[i].lng],
              { icon: cityIcon }
            );
            markerCity
              .bindPopup(`<h5>${result.data.geonames[i].name}</h5>`)
              .openPopup();
            citiesLayerGroup.addLayer(markerCity);

            citiesLayerGroup.remove();
          }
        }
      },
    });
  }
};
/*Get National Holidays Function */
const getHoliday = (country) => {
  if (country) {
    $.ajax({
      url: "libs/php/nationalHolidays.php",
      type: "GET",
      dataType: "JSON",
      data: {
        country: country.slice(0, 2),
      },
      success: (result) => {
        if (result.status.name == "ok") {
          $("#holiday-body").empty();
          const holidayArray = result.data.holidays;
          if (holidayArray) {
            for (var i = 0; i < holidayArray.length; i++) {
              var rawDate = Date.parse(holidayArray[i].date);
              const dateFormatter = new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              var date = dateFormatter.format(rawDate);
              var holiday = `
                                <tr>
                                     <td class="nowrap  col-8">${holidayArray[i].name}</td>
                                     <td class="nowrap">${date}</td>
                                 </tr>
                              `;
              $("#holiday-body").append(holiday);
            }
          } else {
            $("#holiday-body").append(
              `<h3 class="text-muted text-center">No holidays found.</h3>`
            );
          }
        }
      },
    });
  } else {
    $("#holiday-body").empty();
    $("#holiday-body").append(
      `<h3 class="text-muted text-center mt-4">No holidays found.</h3>`
    );
  }
};
/* Get Nearby Wikipedia Resuults Function */
const getWikipedia = (latitude, longitude) => {
  $("#wikipedia-body").empty();
  $.ajax({
    url: "libs/php/getWikipediaGeosearch.php",
    type: "GET",
    dataType: "JSON",
    data: {
      lat: latitude,
      lng: longitude,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        if (result.data.query.geosearch.length > 0) {
          for (var i = 0; i < result.data.query.geosearch.length; i++) {
            var pageId = result.data.query.geosearch[i].pageid;
            $.ajax({
              url: "libs/php/getWikipediaInfo.php",
              type: "GET",
              dataType: "JSON",
              data: {
                pageId: pageId,
              },
              success: (result) => {
                if (result.status.name == "ok") {
                  var articlePage = Object.keys(result.data.query.pages);

                  var wikipedia = `
                          <tr>
                               <td clas="wiki-container">
                               <h2>${result.data.query.pages[articlePage].title}</h2>
                               <p class="text-short">${result.data.query.pages[articlePage].extract}</p>
                               <a href="${result.data.query.pages[articlePage].fullurl}" target="_blank" class="test-dark">Read more</a>
                               </td>
                           </tr>
                        `;
                  $("#wikipedia-body").append(wikipedia);
                }
              },
            });
          }
        } else {
          $("#wikipedia-body").append(
            `<h3 class="text-muted text-center mt-4">No results found within 10 km.</h3>`
          );
        }
      }
    },
  });
};
/* Get Coordinates By City Name Function*/
const getCoordinatesByName = (cityName, countryName, countryCode2) => {
  $.ajax({
    url: "libs/php/getCoordinatesByName.php",
    type: "GET",
    dataType: "JSON",
    data: {
      cityName: cityName,
      countryName: countryName,
      countryCode2: countryCode2,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        if (marker) {
          map.removeLayer(marker);
        }
        lat = result.lat;
        lon = result.lon;
        $("#lat").text(lat);
        $("#lng").text(lon);
        marker = L.marker([lat, lon], { icon: defaultIcon }).addTo(map);
        marker
          .bindPopup(`This is ${cityName}, the capital of ${countryName}`)
          .openPopup();
        /** */
        getTimezone(lat, lon);
        getWeather(lat, lon);
        getWikipedia(lat, lon);
        reversGeocoding(lat, lon);
      }
    },
  });
};

/*Get Capital Function */
const getCapital = (countryCode2, switchSearch, countryName) => {
  if (countryCode2) {
    $.ajax({
      url: "libs/php/getCapital.php",
      type: "GET",
      dataType: "JSON",
      data: {
        countryCode2: countryCode2,
      },
      success: (result) => {
        if (result.status.name == "ok") {
          const capital = result.capital[0];
          if (switchSearch === "1") {
            getCoordinatesByName(capital, countryName, countryCode2);
          }
          const currencyKey = Object.keys(result.currencies);
          const currencyNames = result.currencies[currencyKey];
          const currency = ` ${currencyNames.symbol ?? ""} ${
            currencyNames.name
          } (${currencyKey})`;
          const languagesKey = Object.keys(result.languages);
          let languages = "";
          for (const key of languagesKey) {
            languages = languages + result.languages[key] + ", ";
          }
          languages = languages.slice(0, languages.length - 2);
          const population = result.population;
          let formattedPopulation;
          if (population < 1000000000) {
            const populationInMillions = (population / 1000000).toFixed(2);
            formattedPopulation = populationInMillions + "M";
          } else {
            const populationInBillions = (population / 1000000000).toFixed(1);
            formattedPopulation = populationInBillions + "B";
          }
          const flag = result.flags[1];
          $("#capital-city").text(capital);
          $("#modal-currency").text(currency);
          $(".currencyCodeShort").text(currencyKey);
          $("#fromCurrencyCode").text(currencyKey);
          $("#currencySymbol").text(currencyNames.symbol);
          $("#modal-languages").text(languages);
          $("#modal-population").text(formattedPopulation);
          $(".country-flag").removeClass("hidden");
          $(".country-flag").attr("src", flag);
          /* Exchange On load */
          const exchangeRate =
            exchangeRates[$("#currencyTo").val()] /
            exchangeRates[$("#fromCurrencyCode").text()];
          var toNumber = (1 * exchangeRate).toFixed(2);
          $("#toCurrency").val(toNumber);
          $("#exchange-total").text(`${toNumber} ${$("#currencyTo").val()}`);
        }
      },
    });
  } else {
    $("#capital-city").text("N/S");
    $("#modal-currency").text("N/S");
    $("#modal-languages").text("N/S");
    $("#modal-population").text("N/S");
    $(".country-flag").addClass("hidden");
  }
};

/*Get Airports Layer Control Function*/
const getAirports = (countryCode) => {
  airportLayerGroup.clearLayers();
  $.ajax({
    url: "libs/php/getLayerControl.php",
    type: "GET",
    dataType: "JSON",
    data: {
      api: "airport",
      countryCode: countryCode,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        var markersAirportCluster = L.markerClusterGroup();
        for (var i = 0; i < result.data.geonames.length; i++) {
          var airportIcon = L.icon({
            iconUrl: `././image/attraction-icon/marker-airport.png`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -35],
          });
          var markerAirport = L.marker(
            [result.data.geonames[i].lat, result.data.geonames[i].lng],
            { icon: airportIcon }
          );
          markerAirport.bindPopup(`<h5>${result.data.geonames[i].name}</h5>`);
          markersAirportCluster.addLayer(markerAirport);
          airportLayerGroup.addLayer(markersAirportCluster);
        }
      }
    },
  });
};
/*Get Cities in Layer Control Functions*/
const getCitiesLayerControl = (countryCode) => {
  citiesLayerGroupControl.clearLayers();
  $.ajax({
    url: "libs/php/getLayerControl.php",
    type: "GET",
    dataType: "JSON",
    data: {
      api: "city",
      countryCode: countryCode,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        var markersCitiesCluster = L.markerClusterGroup();
        for (var i = 0; i < result.data.geonames.length; i++) {
          var citiesIcon = L.icon({
            iconUrl: `././image/attraction-icon/building-location.png`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -35],
          });
          var markerCities = L.marker(
            [result.data.geonames[i].lat, result.data.geonames[i].lng],
            { icon: citiesIcon }
          );
          markerCities.bindPopup(`<h5>${result.data.geonames[i].name}</h5>`);
          markersCitiesCluster.addLayer(markerCities);
          citiesLayerGroupControl.addLayer(markersCitiesCluster);
        }
      }
    },
  });
};
/**----END FUNCTIONS----*/

/* Map */
var map = L.map("map").setView([40, 10], 3);

var citiesLayerGroup = L.layerGroup().addTo(map);
var attractionLayerGroup = L.layerGroup().addTo(map);

var airportLayerGroup = L.layerGroup();
var citiesLayerGroupControl = L.layerGroup();
/* Layer Control */
var mainMap = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}",
  {
    minZoom: 0,
    maxZoom: 20,
    ext: "png",
  }
).addTo(map);
var satelliteMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
);
var streetsMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
);

var baseMaps = {
  "Main View": mainMap,
  "Streets View": streetsMap,
  "Satellite View": satelliteMap,
};

var overlayMaps = {
  Airports: airportLayerGroup,
  Cities: citiesLayerGroupControl,
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

$(document).ready(() => {
  /*Populate Select Menu */
  $.ajax({
    url: "libs/php/populateSelect.php",
    type: "GET",
    dataType: "JSON",
    success: (result) => {
      if (result.status.name == "ok") {
        result.data.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        for (let i = 0; i < result.data.length; i++) {
          $("#select-option-menu").append(
            $("<option>", {
              text: result.data[i].name,
              value: result.data[i].is_a2,
              "data-extra-info": result.data[i].is_a3,
            })
          );
        }
      }
    },
  });
  /* Get user's location */
  const getCoordinates = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    $("#lat").text(latitude);
    $("#lng").text(longitude);
    reversGeocoding(latitude, longitude, "user_location");
  };
  const errorCallback = (error) => {
    alert(
      `Sorry, we couldn't retrieve your current location. 
  
  Please ensure that location services are enabled on your device and try again.`
    );
  };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getCoordinates, errorCallback);
  }
  /* End Get user's location */
  $.ajax({
    url: "libs/php/exchangeRate.php",
    type: "GET",
    dataType: "JSON",
    success: (result) => {
      if (result.status.name == "ok") {
        exchangeRates = result.data.rates;
        const currencyCode = Object.keys(result.data.rates);

        for (let i = 0; i < currencyCode.length; i++) {
          if (currencyCode[i] !== "USD") {
            $("#currencyTo").append(
              `<option value=${currencyCode[i]}>${currencyCode[i]}</option>`
            );
          }
        }
      }
    },
  });
});

/*Select Menu Routine */
/*Select Menu Routin Function */
const selectRoutine = (countryCode2, countryCode3, countryName) => {
  $("#country-code").text(countryCode3);

  highlightBorders(countryCode2, 1);
  getCapital(countryCode2, "1", countryName);
  getCities(countryCode2);
  getHoliday(countryCode2);
  getAirports(countryCode2);
  getCitiesLayerControl(countryCode2);
};
/*Select Menu Action */
$("#select-option-menu").on("change", function () {
  const countryCode2 = $(this).val();
  const countryCode3 = $(this).find("option:selected").data("extra-info");
  const countryName = $(this).find("option:selected").text();

  selectRoutine(countryCode2, countryCode3, countryName);
});
/*Click Routine Function */
const clickRoutine = (countryCode2, countryCode3, countryName) => {
  highlightBorders(countryCode2);
  getCapital(countryCode2, "0", countryName);
  getCities(countryCode2);
  getHoliday(countryCode2);
  getAirports(countryCode2);
  getCitiesLayerControl(countryCode2);
};
/*Click Routine */
map.on("click", function (e) {
  if (marker) {
    map.removeLayer(marker);
  }
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;
  $("#lat").text(lat);
  $("#lng").text(lng);
  console;
  getTimezone(lat, lng);
  getWeather(lat, lng);
  getWikipedia(lat, lng);
  reversGeocoding(lat, lng, "click_location");
  attractionLayerGroup.clearLayers();

  marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
});
/*---ATRACTION BUTTONS----*/
/* Get Attractions */
const getAttractions = (latitude, longitude, attraction) => {
  $("#action-loader").removeClass("hidden");
  attractionLayerGroup.clearLayers();
  $.ajax({
    url: "libs/php/getAttractions.php",
    type: "GET",
    dataType: "JSON",
    data: {
      lat: latitude,
      lng: longitude,
      attraction: attraction,
    },
    success: (result) => {
      if (result.status.name == "ok") {
        var markersAttractionCluster = L.markerClusterGroup();
        if (result.data.results.length > 0) {
          for (var i = 0; i < result.data.results.length; i++) {
            var attractionIcon = L.icon({
              iconUrl: result.data.results[i].icon,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -35],
            });

            var markerAtraction = L.marker(
              [
                result.data.results[i].geometry.location.lat,
                result.data.results[i].geometry.location.lng,
              ],
              { icon: attractionIcon }
            );

            markerAtraction.bindPopup(
              `<div id="popup-container">
              <h5>${result.data.results[i].name}</h5>
              <p>Address: ${result.data.results[i].vicinity}</p>
              <p>Rating: ${result.data.results[i].rating} &#9733</p>
              </div>`
            );

            markersAttractionCluster.addLayer(markerAtraction);
            attractionLayerGroup.addLayer(markersAttractionCluster);
          }
          map.fitBounds(markersAttractionCluster.getBounds(), {
            pan: true,
            animate: true,
            duration: 1.0,
          });
          $("#action-loader").addClass("hidden");
        } else {
          $("#action-loader").addClass("hidden");
          setTimeout(function () {
            alert(`Sorry, we couldn't find any ${attraction}s nearby.`);
          }, 100);
        }
      }
    },
  });
};

$("#cities-button").click(() => {
  citiesLayerGroup.addTo(map);
});

$("#restaurants-button").click(() => {
  const attraction = "restaurant";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
$("#bar-button").click(() => {
  const attraction = "bar";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
$("#gas-button").click(() => {
  const attraction = "petrol_station";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
$("#coffee-button").click(() => {
  const attraction = "coffee";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
$("#hotel-button").click(() => {
  const attraction = "hotel";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
$("#museum-button").click(() => {
  const attraction = "museum";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
$("#park-button").click(() => {
  const attraction = "park";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
$("#hospital-button").click(() => {
  const attraction = "hospital";
  const lat = $("#lat").text();
  const lng = $("#lng").text();
  getAttractions(lat, lng, attraction);
});
/*--------------------------------------- */

/* Currency Exchange */

$("#fromCurrency").on("input", function () {
  const exchangeRate =
    exchangeRates[$("#currencyTo").val()] /
    exchangeRates[$("#fromCurrencyCode").text()];

  var fromNumber = $("#fromCurrency").val();
  var toNumber = (fromNumber * exchangeRate).toFixed(2);

  $("#toCurrency").val(toNumber);
  $("#updateFromAmount").text(fromNumber);
  $("#exchange-total").text(`${toNumber} ${$("#currencyTo").val()}`);
});

$("#toCurrency").on("input", function () {
  const exchangeRate =
    exchangeRates[$("#fromCurrencyCode").text()] /
    exchangeRates[$("#currencyTo").val()];

  var toNumber = $("#toCurrency").val();
  var fromNumber = (toNumber * exchangeRate).toFixed(2);

  $("#fromCurrency").val(fromNumber);
  $("#updateFromAmount").text(fromNumber);
  $("#exchange-total").text(`${toNumber} ${$("#currencyTo").val()}`);
});

$("#currencyTo").on("click", function () {
  const exchangeRate =
    exchangeRates[$("#currencyTo").val()] /
    exchangeRates[$("#fromCurrencyCode").text()];

  var toNumber = ($("#fromCurrency").val() * exchangeRate).toFixed(2);

  $("#toCurrency").val(toNumber);
  $("#exchange-total").text(`${toNumber} ${$("#currencyTo").val()}`);
});
