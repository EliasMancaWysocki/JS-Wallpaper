$(document).ready(async function () {
    await getCity();
    await getWeatherFunction();
    if (city != null) {
        getWeather();
        setInterval(getWeather, 1800000);
    }
})

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    $('#hour').text(hours);
    $('#minutes').text(minutes);
    $('#seconds').text(seconds);
    $('#day').text(now.getDate());
    $('#month').text(`"${now.toLocaleString('en-US', { month: 'long' })}"`);
    $('#year').text(now.getFullYear());
}
updateClock();

setInterval(updateClock, 1);

const apiKey = "525ee573f0fffb372bd679c4ec659fa6";
let url;
let city;
let weatherFunction;

ensureSunAndMoon();
setInterval(ensureSunAndMoon, 60000); // Cada segundo actualiza su posición

async function getWeather() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const weatherData = await response.json();
        const weatherDescription = weatherData.weather[0].description.toLowerCase();

        $('#city').text(weatherData.name);
        $('#temperature').text(`${Math.round(weatherData.main.temp)}°C`);
        $('#weather').text(weatherData.weather[0].description);

        stopAllAnimations(); 

        if (weatherFunction) {
            if (weatherDescription.includes('rain')) {
                startRainAnimation();
            } else if (weatherDescription.includes('cloud')) {
                startCloudyAnimation();
            } else if (weatherDescription.includes('storm')) {
                startStormAnimation();
            } else if (weatherDescription.includes('snow')) {
                startSnowAnimation();
            }
        }
    } catch (error) {
        console.error("Hubo un problema con la solicitud del clima:", error);
        $('#city').text("Not available");
        $('#weather').text("Not available");
        stopAllAnimations();
    }
}

async function getPropertyData() {
    try {
        // Carga el archivo JSON
        const response = await fetch('project.json'); // Ruta al archivo
        if (!response.ok) {
            throw new Error(`Error al cargar el archivo: ${response.status}`);
        }

        const data = await response.json();
        return data.general.properties;

    } catch (error) {
        console.error("Error al obtener los datos del archivo JSON:", error);
    }
}

async function getCity() {
    try {
        const properties = await getPropertyData();
        const data = properties.city?.value;

        if (data && data !== '') {
            city = data;
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        } else {
            console.error("No se pudo obtener la ciudad del archivo JSON.");
        }
    } catch (error) {
        console.error("Error al obtener la ciudad:", error);
    }
}

async function getWeatherFunction() {
    try {
        const properties = await getPropertyData();
        const data = properties.weather?.value;

        if (data && data !== null) {
            weatherFunction = data;
        } else {
            console.error("Weather function false.");
        }
    } catch (error) {
        console.error("Error al obtener la funcionalidad del clima:", error);
    }
}