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

setInterval(updateClock, 500);

window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {

        if (properties.schemecolor) {
            const [r, g, b] = properties.schemecolor.value.split(' ').map(v => Math.round(parseFloat(v) * 255));
            document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }

        if (properties.weather !== undefined) {
            weatherFunction = properties.weather.value;
        } else {
            weatherFunction = true;
        }

        if (properties.city) {
            city = properties.city.value;
            getWeather();
            clearInterval(weatherRefreshInterval);
            weatherRefreshInterval = setInterval(getWeather, 1800000);
        } else {
            city = '';
        }
    }
};

let city;
let weatherFunction;
let weatherRefreshInterval = null;

ensureSunAndMoon();
setInterval(ensureSunAndMoon, 60000);

async function getWeather() {
    if (!city) return;
    try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const weatherData = await response.json();
        const description = weatherData.current_condition[0].weatherDesc[0].value.toLowerCase();
        const temp = weatherData.current_condition[0].temp_C;
        const cityName = weatherData.nearest_area[0].areaName[0].value;

        $('#city').text(cityName);
        $('#temperature').text(`${Math.round(temp)}°C`);
        $('#weather').text(weatherData.current_condition[0].weatherDesc[0].value);

        stopAllAnimations();

        if (weatherFunction) {
            if (description.includes('rain') || description.includes('drizzle')) {
                startRainAnimation();
            } else if (description.includes('thunder') || description.includes('storm')) {
                startStormAnimation();
            } else if (description.includes('snow') || description.includes('blizzard') || description.includes('sleet') || description.includes('ice pellet')) {
                startSnowAnimation();
            } else if (description.includes('cloud') || description.includes('overcast')) {
                startCloudyAnimation();
            }
        }
    } catch (error) {
        console.error("Hubo un problema con la solicitud del clima:", error);
        $('#city').text("Not available");
        $('#temperature').text("Not available");
        $('#weather').text("Not available");
        stopAllAnimations();
    }
}