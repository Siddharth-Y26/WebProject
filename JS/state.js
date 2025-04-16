const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }

    if (currentScroll > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});
// Replace with your API keys
const weatherAPIKey = "dfd567bc4c2244ddb7e134214251404"; // WeatherAPI key
const openWeatherKey = "736e4879e098396f30493def54e88d1f";  // OpenWeatherMap API key

// ----- Weather Functions -----
function displayWeatherAPI(data, weatherInfo) {
  const { temp_c, condition } = data.current;
  weatherInfo.innerHTML = `
    🌡️ ${temp_c}°C <br>
    <img src="https:${condition.icon}" alt="icon" style="width: 40px; height: 40px; margin-bottom:-12px; object-fit: contain;">${condition.text}
  `;
}

function displayWeatherOWM(data, weatherInfo) {
  const temp = data.main.temp.toFixed(1);
  const description = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  weatherInfo.innerHTML = `
    🌡️ ${temp}°C <br>
    <img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="icon" style="width: 40px; height: 40px; margin-bottom:-12px; object-fit: contain;">${description}
  `;
}

function fetchCombinedWeather(locationName, card) {
  const weatherInfo = document.createElement("p");
  weatherInfo.className = "weather-info";
  weatherInfo.innerText = "Weather: Loading...";
  card.querySelector(".attraction-content").appendChild(weatherInfo);

  // First, use getCoordinates to obtain an accurate lat/lon for the location.
  getCoordinates(locationName)
    .then(coords => {
      // Use the coordinates for the query if available.
      const queryParam = coords ? `${coords.lat},${coords.lon}` : encodeURIComponent(locationName);

      // Try WeatherAPI using the coordinate query (q can be "lat,lon")
      fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${queryParam}&aqi=no`)
        .then(res => res.json())
        .then(data => {
          // If WeatherAPI returns valid data, display it.
          if (!data.error) {
            displayWeatherAPI(data, weatherInfo);
          } else {
            console.warn("WeatherAPI failed for " + locationName + ", falling back to OpenWeatherMap");
            // If WeatherAPI fails, use OpenWeatherMap via coordinates (if available).
            if (coords) {
              fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${openWeatherKey}&units=metric`)
                .then(res => res.json())
                .then(dataOWM => {
                  if (dataOWM.cod === 200) {
                    displayWeatherOWM(dataOWM, weatherInfo);
                  } else {
                    weatherInfo.innerHTML = "Weather: Not found";
                  }
                })
                .catch(err => {
                  console.error("OpenWeatherMap fetch failed", err);
                  weatherInfo.innerHTML = "Weather: Not found";
                });
            } else {
              weatherInfo.innerHTML = "Weather: Not found";
            }
          }
        })
        .catch(err => {
          console.error("Combined Weather fetch failed", err);
          weatherInfo.innerHTML = "Weather: Error fetching";
        });
    })
    .catch(err => {
      console.error("Failed to get coordinates for weather fetch", err);
      weatherInfo.innerHTML = "Weather: Not found";
    });
}


// ----- Transport Functions -----
async function getCoordinates(place) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`);
  const data = await res.json();
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name
    };
  }
  return null;
}

// Returns candidate transport details for each category (distance, name, coordinates)
async function getNearbyTransport(lat, lon) {
  const query = `
    [out:json];
    (
      node["aeroway"="aerodrome"](around:300000,${lat},${lon});
      way["aeroway"="aerodrome"](around:300000,${lat},${lon});
      relation["aeroway"="aerodrome"](around:300000,${lat},${lon});
      node["railway"="station"](around:300000,${lat},${lon});
      way["railway"="station"](around:300000,${lat},${lon});
      relation["railway"="station"](around:300000,${lat},${lon});
      node["amenity"="bus_station"](around:300000,${lat},${lon});
      way["amenity"="bus_station"](around:300000,${lat},${lon});
      relation["amenity"="bus_station"](around:300000,${lat},${lon});
    );
    out center;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: "data=" + encodeURIComponent(query)
  });

  const data = await response.json();
  console.log("Overpass result:", data);

  const results = {
    airport: { dist: Infinity, name: null, lat: null, lon: null },
    railway: { dist: Infinity, name: null, lat: null, lon: null },
    bus:     { dist: Infinity, name: null, lat: null, lon: null },
  };

  if (data.elements && data.elements.length > 0) {
    data.elements.forEach(element => {
      let elemLat = element.lat;
      let elemLon = element.lon;
      if (!elemLat || !elemLon) {
        if (element.center) {
          elemLat = element.center.lat;
          elemLon = element.center.lon;
        }
      }
      if (!elemLat || !elemLon) return;

      const dist = parseFloat(getDistanceFromLatLonInKm(lat, lon, elemLat, elemLon).toFixed(2));

      if (element.tags) {
        if (element.tags.aeroway === "aerodrome" && dist < results.airport.dist) {
          results.airport = { dist, name: element.tags.name || "Unnamed Airport", lat: elemLat, lon: elemLon };
        }
        if (element.tags.railway === "station" && dist < results.railway.dist) {
          results.railway = { dist, name: element.tags.name || "Unnamed Station", lat: elemLat, lon: elemLon };
        }
        if (element.tags.amenity === "bus_station" && dist < results.bus.dist) {
          results.bus = { dist, name: element.tags.name || "Unnamed Bus Stand", lat: elemLat, lon: elemLon };
        }
      }
    });
  } else {
    console.log("No elements returned in Overpass query");
  }
  return results;
}

// Haversine formula to calculate the distance (in km) between two coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Updated createRouteButton that returns an anchor element styled like a button within a container.
// Helper to create a button linking to Google Maps Directions.
// This function returns a DOM element (a container with a text span and a button element)
function createRouteButton(origin, candidate) {
  // Build the Google Maps Directions URL.
  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${candidate.lat},${candidate.lon}&travelmode=driving`;

  // Create a container for the candidate's info and the button.
  const container = document.createElement("div");

  // Create and append a text element to show candidate name and distance.
  const textEl = document.createElement("span");
  textEl.textContent = `${candidate.name} - ${candidate.dist} km `;
  container.appendChild(textEl);

  // Create the button element.
  const btn = document.createElement("button");
  btn.textContent = "Get Directions";
  btn.className = "transport-button";
  // Add a click event listener that opens the URL.
  btn.addEventListener("click", () => {
    window.open(url, '_blank');
  });
  container.appendChild(btn);

  return container;
}


async function showNearbyTransportForCard(card, title) {
  const distanceInfo = document.createElement("div");
  distanceInfo.className = "distance-info";
  distanceInfo.innerHTML = `<span class="spinner">&#x27F3;</span> Searching nearby transport...`;
  card.querySelector(".attraction-content").appendChild(distanceInfo);

  const attractionCoords = await getCoordinates(title);
  if (!attractionCoords) {
    distanceInfo.textContent = "Transport: Location not found";
    return;
  }

  const nearby = await getNearbyTransport(attractionCoords.lat, attractionCoords.lon);

  // Clear previous content to build output using DOM elements.
  distanceInfo.innerHTML = "";
  
  // Create container for Airport output.
  const airportDiv = document.createElement("div");
  airportDiv.className = "transport-output";
  const airportLabel = document.createElement("span");
  airportLabel.textContent = "✈️ Airport: ";
  airportDiv.appendChild(airportLabel);
  if (nearby.airport.name) {
    if (nearby.airport.dist > 30) {
      airportDiv.appendChild(document.createTextNode("Farther than 30 km"));
    } else {
      airportDiv.appendChild(createRouteButton(attractionCoords, nearby.airport));
    }
  } else {
    airportDiv.appendChild(document.createTextNode("Not found"));
  }
  distanceInfo.appendChild(airportDiv);

  // Create container for Railway output.
  const railwayDiv = document.createElement("div");
  railwayDiv.className = "transport-output";
  const railwayLabel = document.createElement("span");
  railwayLabel.textContent = "🚆 Railway Station: ";
  railwayDiv.appendChild(railwayLabel);
  if (nearby.railway.name) {
    if (nearby.railway.dist > 30) {
      railwayDiv.appendChild(document.createTextNode("Farther than 30 km"));
    } else {
      railwayDiv.appendChild(createRouteButton(attractionCoords, nearby.railway));
    }
  } else {
    railwayDiv.appendChild(document.createTextNode("Not found"));
  }
  distanceInfo.appendChild(railwayDiv);

  // Create container for Bus output.
  const busDiv = document.createElement("div");
  busDiv.className = "transport-output";
  const busLabel = document.createElement("span");
  busLabel.textContent = "🚌 Bus Stand: ";
  busDiv.appendChild(busLabel);
  if (nearby.bus.name) {
    if (nearby.bus.dist > 30) {
      busDiv.appendChild(document.createTextNode("Farther than 30 km"));
    } else {
      busDiv.appendChild(createRouteButton(attractionCoords, nearby.bus));
    }
  } else {
    busDiv.appendChild(document.createTextNode("Not found"));
  }
  distanceInfo.appendChild(busDiv);
}

// ----- On Window Load, Process Each Attraction Card -----
window.onload = () => {
  const cards = document.querySelectorAll(".attraction-card");
  cards.forEach((card, index) => {
    const title = card.querySelector(".attraction-title").textContent.trim();
    fetchCombinedWeather(title, card);
    setTimeout(() => {
      showNearbyTransportForCard(card, title);
    }, index * 1500);
  });
};