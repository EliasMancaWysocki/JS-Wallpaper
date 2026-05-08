let city = '';
let weatherFunction = true;
let weatherRefreshInterval = null;

async function getWeather() {
    if (!city) return;
    try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (!response.ok) throw new Error(`${response.status} - ${response.statusText}`);

        const data        = await response.json();
        const description = data.current_condition[0].weatherDesc[0].value.toLowerCase();
        const temp        = data.current_condition[0].temp_C;
        const cityName    = data.nearest_area[0].areaName[0].value;

        $('#city').text(cityName);
        $('#temperature').text(`${Math.round(temp)}°C`);
        $('#weather').text(data.current_condition[0].weatherDesc[0].value);

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
        console.error('Weather fetch failed:', error);
        $('#city').text('Not available');
        $('#temperature').text('Not available');
        $('#weather').text('Not available');
        stopAllAnimations();
    }
}
