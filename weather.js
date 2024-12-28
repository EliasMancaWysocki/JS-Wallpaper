function startRainAnimation() {
    if (window.rainInterval) {
        return; // Si ya hay un intervalo activo, no iniciar otro
    }

    window.rainInterval = setInterval(() => {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * window.innerWidth + 'px';
        drop.style.top = '-20px';
        document.body.appendChild(drop);

        const fallDuration = Math.random() * 1000 + 1000;

        const startTime = performance.now();
        const dropFall = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = elapsedTime / fallDuration;

            if (progress < 1) {
                drop.style.top = window.innerHeight * progress + 'px';
                requestAnimationFrame(dropFall);
            } else {
                drop.remove();
            }
        };

        requestAnimationFrame(dropFall);
    }, 100); // Cada 200ms se generará una gota de lluvia
}

function stopRainAnimation() {
    clearInterval(window.rainInterval); // Detener el intervalo
    window.rainInterval = null; // Resetear la variable
    document.querySelectorAll('.rain-drop').forEach(drop => drop.remove()); // Eliminar gotas existentes
}

let simulatedTime = null; // Variable para definir una hora simulada

function setSimulatedTime(hour, minute = 0) {
    simulatedTime = { hour, minute };
    updateAnimations(); // Llama a las animaciones con la hora simulada
}

function getCurrentTime() {
    if (simulatedTime) {
        return simulatedTime.hour + simulatedTime.minute / 60; // Hora simulada
    }
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60; // Hora real
}

function ensureSunAndMoon() {
    const hours = getCurrentTime(); // Hora actual o simulada
    const sunrise = 6;
    const sunset = 19;

    // Desplazamiento hacia la izquierda
    const offsetX = 100; // Ajusta este valor según lo que necesites

    // Sol - calcula su posición
    const sun = document.querySelector('.sun') || document.createElement('div');
    sun.className = 'sun';
    sun.style.position = 'fixed';
    sun.style.width = '100px';
    sun.style.height = '100px';
    sun.style.background = 'yellow';
    sun.style.borderRadius = '50%';
    sun.style.zIndex = '1';

    if (!document.body.contains(sun)) {
        document.body.appendChild(sun);
    }

    const sunProgress = (hours - sunrise) / (sunset - sunrise);
    if (hours >= sunrise && hours <= sunset) {
        // Movimiento del sol durante el día
        const sunCenterX = window.innerWidth / 2 - offsetX;
        const sunCenterY = window.innerHeight / 3;
        const sunRadius = window.innerHeight / 3;

        sun.style.left = `${sunCenterX + sunRadius * Math.cos(Math.PI * (1 - sunProgress))}px`;
        sun.style.top = `${sunCenterY - sunRadius * Math.sin(Math.PI * (1 - sunProgress))}px`;
        sun.style.display = 'block';
    } else {
        sun.style.display = 'none'; // Oculta el sol fuera del día
    }

    // Luna - calcula su posición
    const moon = document.querySelector('.moon') || document.createElement('div');
    moon.className = 'moon';
    moon.style.position = 'fixed';
    moon.style.width = '50px';
    moon.style.height = '50px';
    moon.style.background = 'white';
    moon.style.borderRadius = '50%';
    moon.style.zIndex = '1';

    if (!document.body.contains(moon)) {
        document.body.appendChild(moon);
    }

    const nightStart = 19.01;
    const nightEnd = 6;
    const nightLength = (24 - nightStart) + nightEnd;

    let moonProgress;
    if (hours >= nightStart) {
        moonProgress = (hours - nightStart) / nightLength;
    } else {
        moonProgress = (hours + (24 - nightStart)) / nightLength;
    }

    if (hours >= nightStart || hours < nightEnd) {
        // Movimiento de la luna durante la noche
        const moonCenterX = window.innerWidth / 2 - offsetX;
        const moonCenterY = window.innerHeight / 2.5;
        const moonRadius = window.innerHeight / 3;

        moon.style.left = `${moonCenterX + moonRadius * Math.cos(Math.PI * (1 - moonProgress))}px`;
        moon.style.top = `${moonCenterY - moonRadius * Math.sin(Math.PI * (1 - moonProgress))}px`;
        moon.style.display = 'block';
    } else {
        moon.style.display = 'none'; // Oculta la luna fuera de la noche
    }
}

function startCloudyAnimation() {
    if (!window.cloudInterval) {
        const createCloud = () => {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            document.body.appendChild(cloud);

            const startX = -200;
            const endX = window.innerWidth + 200;
            const topY = Math.random() * (window.innerHeight / 2);

            cloud.style.width = `${Math.random() * 100 + 150}px`; // Tamaño variable
            cloud.style.height = `${Math.random() * 50 + 80}px`; // Más "esponjoso"
            cloud.style.top = `${topY}px`;
            cloud.style.left = `${startX}px`;

            // Movimiento de las nubes
            let position = startX;
            const moveCloud = () => {
                position += 1; // Velocidad más lenta
                cloud.style.left = `${position}px`;

                // Detecta si la nube está detrás del texto
                const textBox = document.querySelector('#container').getBoundingClientRect();
                const cloudBox = cloud.getBoundingClientRect();

                if (
                    cloudBox.left < textBox.right &&
                    cloudBox.right > textBox.left &&
                    cloudBox.top < textBox.bottom &&
                    cloudBox.bottom > textBox.top
                ) {
                    cloud.style.opacity = 0.1; // Se vuelve casi invisible detrás del texto
                } else {
                    cloud.style.opacity = 1; // Recupera opacidad
                }

                // Elimina la nube si ya salió de la pantalla
                if (position > endX) {
                    cloud.remove();
                    clearInterval(cloud.timer);
                }
            };

            // Movimiento constante
            cloud.timer = setInterval(moveCloud, 50); // Cada 50ms
        };

        // Crea nubes cada 3 segundos
        window.cloudInterval = setInterval(createCloud, 3000);
    }
}

function stopCloudyAnimation() {
    clearInterval(window.cloudInterval);
    window.cloudInterval = null;
    document.querySelectorAll('.cloud').forEach(cloud => cloud.remove());
}

function startStormAnimation() {
    startRainAnimation(); // Usa la animación de lluvia existente

    if (!window.stormInterval) {
        const createLightning = () => {
            const flash = document.createElement('div');
            flash.className = 'lightning';
            document.body.appendChild(flash);

            flash.style.position = 'fixed';
            flash.style.top = '0';
            flash.style.left = '0';
            flash.style.width = '100%';
            flash.style.height = '100%';
            flash.style.background = 'rgba(255, 255, 255, 0.8)';
            flash.style.zIndex = '2000';
            flash.style.opacity = '0';

            flash.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 300,
                easing: 'ease-in-out',
            });

            setTimeout(() => flash.remove(), 300);
        };

        window.stormInterval = setInterval(createLightning, Math.random() * 3000 + 2000);
    }
}

function stopStormAnimation() {
    stopRainAnimation();
    clearInterval(window.stormInterval);
    window.stormInterval = null;
}

function startSnowAnimation() {
    if (!window.snowInterval) {
        const createSnowflake = () => {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            document.body.appendChild(snowflake);

            snowflake.style.position = 'fixed';
            snowflake.style.width = '10px';
            snowflake.style.height = '10px';
            snowflake.style.background = 'white';
            snowflake.style.borderRadius = '50%';
            snowflake.style.opacity = '0.8';
            snowflake.style.left = Math.random() * window.innerWidth + 'px';
            snowflake.style.top = '-20px';

            const fallDuration = Math.random() * 3000 + 2000;

            const startTime = performance.now();
            const fallSnowflake = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = elapsedTime / fallDuration;

                if (progress < 1) {
                    snowflake.style.top = `${window.innerHeight * progress}px`;
                    requestAnimationFrame(fallSnowflake);
                } else {
                    snowflake.remove();
                }
            };

            requestAnimationFrame(fallSnowflake);
        };

        window.snowInterval = setInterval(createSnowflake, 100);
    }
}

function stopSnowAnimation() {
    clearInterval(window.snowInterval);
    window.snowInterval = null;
    document.querySelectorAll('.snowflake').forEach(snowflake => snowflake.remove());
}

function stopAllAnimations() {
    stopRainAnimation();
    stopCloudyAnimation();
    stopStormAnimation();
    stopSnowAnimation();
}

function updateAnimations() {
    // Asegúrate de que el sol y la luna estén actualizados
    ensureSunAndMoon();

    // Detén todas las animaciones previas
    stopAllAnimations();

    // Ejemplo de descripción del clima (puedes reemplazarlo con la lógica real)
    const weatherDescription = 'clear'; // Cambia esto para probar otros climas

    // Inicia las animaciones según el clima
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