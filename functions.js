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
const city = "La Calera, Córdoba";
const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

async function getWeather() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const weatherData = await response.json();

        $('#city').text(weatherData.name);
        $('#weather').text(`${Math.round(weatherData.main.temp)}°C`);

    } catch (error) {
        console.error("Hubo un problema con la solicitud del clima:", error);
        $('#city').text("Not available");
        $('#weather').text("Not available");
    }
}

// Funciones para añadir animaciones
function addRain() {
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement("div");
        drop.className = "raindrop";
        drop.style.left = Math.random() * 100 + "vw";
        drop.style.setProperty("--i", i);
        document.body.appendChild(drop);
    }
}

function addSnow() {
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.style.left = Math.random() * 100 + "vw";
        flake.style.setProperty("--i", i);
        document.body.appendChild(flake);
    }
}

function addLightning() {
    for (let i = 0; i < 3; i++) {
        const flash = document.createElement("div");
        flash.className = "lightning";
        flash.style.setProperty("--i", i);
        document.body.appendChild(flash);
    }
}

// Llama a la función al cargar la app
getWeather();

// Configura un intervalo de actualización de una hora
setInterval(getWeather, 1800000);
