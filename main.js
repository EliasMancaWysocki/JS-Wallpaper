window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.schemecolor) {
            const [r, g, b] = properties.schemecolor.value
                .split(' ')
                .map(v => Math.round(parseFloat(v) * 255));
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

updateClock();
setInterval(updateClock, 500);
ensureSunAndMoon();
setInterval(ensureSunAndMoon, 60000);
