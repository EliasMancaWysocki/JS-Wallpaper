// ── Helpers ───────────────────────────────────────────────────────────────────

function setField(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (value === null || value === undefined || value === '') {
        el.innerHTML = "<span class='mediumpurple'>null</span>";
    } else {
        const safe = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        el.innerHTML = "<span class='sandybrown'>\"" + safe + "\"</span>";
    }
}

// ── Weather ───────────────────────────────────────────────────────────────────

let windSpeedKmph = 0;
let windDirDegree = 90;

function getWeatherObjectHTML() {
    const comment = showLastUpdated
        ? `  <span class='comment'>// last_updated: <span id='weather-updated'><span class='mediumpurple'>null</span></span></span>`
        : '';
    return `<span class='cornflowerblue'>{</span>
        <span class='greenyellow'>city:</span> <span id='city'><span class='mediumpurple'>null</span></span>,
        <span class='greenyellow'>temp:</span> <span id='temperature'><span class='mediumpurple'>null</span></span>,
        <span class='greenyellow'>condition:</span> <span id='condition'><span class='mediumpurple'>null</span></span>,
        <span class='greenyellow'>wind:</span> <span id='wind'><span class='mediumpurple'>null</span></span>
    <span class='cornflowerblue'>}</span>,${comment}`;
}

function ensureWeatherExpanded() {
    if (!document.getElementById('city')) {
        document.getElementById('weather-value').innerHTML = getWeatherObjectHTML();
    }
}

function collapseWeather() {
    document.getElementById('weather-value').innerHTML = "<span class='mediumpurple'>null</span>,";
    stopAllAnimations();
}

async function getWeather() {
    if (city) {
        await fetchWeather(encodeURIComponent(city));
    } else if (useGeolocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude.toFixed(4);
                const lon = pos.coords.longitude.toFixed(4);
                await fetchWeather(`${lat},${lon}`);
            },
            async () => { await fetchWeather(''); }
        );
    } else {
        await fetchWeather('');
    }
}

async function fetchWeather(location) {
    try {
        const url = location ? `https://wttr.in/${location}?format=j1` : `https://wttr.in/?format=j1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status}`);
        const data = await response.json();

        const cond      = data.current_condition[0];
        const description = cond.weatherDesc[0].value;
        const temp        = Math.round(cond.temp_C);
        const cityName    = data.nearest_area[0].areaName[0].value;
        windSpeedKmph     = parseInt(cond.windspeedKmph) || 0;
        // wttr.in da la dirección DE DONDE VIENE el viento (conv. meteorológica).
        // Convertimos a "hacia dónde va" para que Math.sin() dé el vector correcto.
        windDirDegree     = ((parseInt(cond.winddirDegree) || 0) + 180) % 360;
        const windDir16   = cond.winddir16Point || '';

        const now = new Date();
        const updated = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        ensureWeatherExpanded();
        setField('city', cityName);
        setField('temperature', `${temp}°C`);
        setField('condition', description);
        setField('wind', windSpeedKmph > 0 ? `${windSpeedKmph} km/h ${windDir16}`.trim() : null);
        const wuEl = document.getElementById('weather-updated');
        if (wuEl) wuEl.textContent = `"${updated}"`;

        stopAllAnimations();

        if (weatherFunction) {
            const desc = description.toLowerCase();
            if (desc.includes('thunder') || desc.includes('storm')) {
                startStormAnimation();
            } else if (desc.includes('rain') || desc.includes('drizzle')) {
                startRainAnimation();
            } else if (desc.includes('snow') || desc.includes('blizzard') || desc.includes('sleet') || desc.includes('ice pellet')) {
                startSnowAnimation();
            } else if (desc.includes('cloud') || desc.includes('overcast')) {
                startCloudyAnimation();
            }
            // Leaves appear whenever it's windy enough (not in snow)
            if (!desc.includes('snow') && !desc.includes('blizzard')) {
                startLeavesAnimation();
            }
        }
    } catch (error) {
        console.error('Weather error:', error);
        collapseWeather();
    }
}

// ── Sol & Luna ────────────────────────────────────────────────────────────────

function ensureSunAndMoon() {
    const now     = new Date();
    const hours   = now.getHours() + now.getMinutes() / 60;
    const sunrise = 6, sunset = 19;
    const offsetX = -50; // negativo = desplaza el arco a la derecha del centro

    // Sol
    let sun = document.querySelector('.sun');
    if (!sun) {
        sun = document.createElement('div');
        sun.className = 'sun';
        document.body.appendChild(sun);
    }
    const textBox = document.getElementById('container').getBoundingClientRect();

    if (hours >= sunrise && hours <= sunset) {
        const p  = (hours - sunrise) / (sunset - sunrise);
        const cx = window.innerWidth / 2 - offsetX;
        const cy = window.innerHeight * 0.98;
        const r  = window.innerWidth / 2.4;
        sun.style.left    = `${cx + r * Math.cos(Math.PI * (1 - p)) - 50}px`;
        sun.style.top     = `${cy - r * Math.sin(Math.PI * (1 - p)) - 50}px`;
        sun.style.display = 'block';
        requestAnimationFrame(() => {
            const sb = sun.getBoundingClientRect();
            const tb = document.getElementById('container').getBoundingClientRect();
            sun.style.opacity = overlaps(sb, tb, 60) ? '0.12' : '1';
        });
    } else {
        sun.style.display = 'none';
    }

    // Luna
    let moon = document.querySelector('.moon');
    if (!moon) {
        moon = document.createElement('div');
        moon.className = 'moon';
        document.body.appendChild(moon);
    }
    const nightStart  = 19.01, nightEnd = 6;
    const nightLength = (24 - nightStart) + nightEnd;
    const mp = hours >= nightStart
        ? (hours - nightStart) / nightLength
        : (hours + (24 - nightStart)) / nightLength;

    if (hours >= nightStart || hours < nightEnd) {
        const cx = window.innerWidth / 2 - offsetX;
        const cy = window.innerHeight * 0.95;
        const r  = window.innerWidth / 2.5;
        moon.style.left    = `${cx + r * Math.cos(Math.PI * (1 - mp)) - 30}px`;
        moon.style.top     = `${cy - r * Math.sin(Math.PI * (1 - mp)) - 30}px`;
        moon.style.display = 'block';
        requestAnimationFrame(() => {
            const mb = moon.getBoundingClientRect();
            const tb = document.getElementById('container').getBoundingClientRect();
            moon.style.opacity = overlaps(mb, tb, 40) ? '0.12' : '1';
        });
    } else {
        moon.style.display = 'none';
    }
}

function overlaps(a, b, margin) {
    return a.left < b.right + margin && a.right > b.left - margin &&
           a.top  < b.bottom + margin && a.bottom > b.top - margin;
}

// ── Lluvia (Canvas) ───────────────────────────────────────────────────────────

let rainCanvas = null;
let rainRafId  = null;

function startRainAnimation() {
    if (rainCanvas) return;
    rainCanvas = document.createElement('canvas');
    rainCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:10;';
    rainCanvas.width  = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    document.body.appendChild(rainCanvas);

    const ctx   = rainCanvas.getContext('2d');
    const count = Math.min(160 + windSpeedKmph * 1.5, 320);

    // windDirDegree = dirección hacia donde sopla → Math.sin da componente horizontal correcta
    const windRad = windDirDegree * Math.PI / 180;
    const vx = Math.sin(windRad) * Math.min(windSpeedKmph * 0.07, 7);
    const vy = 14;

    const drops = Array.from({ length: count }, () => ({
        x:       Math.random() * (rainCanvas.width + 200) - 100,
        y:       Math.random() * rainCanvas.height,
        len:     Math.random() * 12 + 8,
        speed:   Math.random() * 4 + 10,
        opacity: Math.random() * 0.35 + 0.25,
    }));

    function frame() {
        ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        ctx.lineCap = 'round';
        drops.forEach(d => {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + vx * (d.len / vy), d.y + d.len);
            ctx.strokeStyle = `rgba(174, 214, 241, ${d.opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            d.x += vx;
            d.y += d.speed;
            if (d.y > rainCanvas.height + d.len) {
                d.y = -d.len;
                d.x = Math.random() * (rainCanvas.width + 200) - 100;
            }
            if (d.x > rainCanvas.width + 50) d.x = -50;
            if (d.x < -50)                   d.x = rainCanvas.width + 50;
        });
        rainRafId = requestAnimationFrame(frame);
    }
    frame();
}

function stopRainAnimation() {
    if (rainRafId)  { cancelAnimationFrame(rainRafId); rainRafId = null; }
    if (rainCanvas) { rainCanvas.remove(); rainCanvas = null; }
}

// ── Nieve (Canvas) ────────────────────────────────────────────────────────────

let snowCanvas = null;
let snowRafId  = null;

function startSnowAnimation() {
    if (snowCanvas) return;
    snowCanvas = document.createElement('canvas');
    snowCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:10;';
    snowCanvas.width  = window.innerWidth;
    snowCanvas.height = window.innerHeight;
    document.body.appendChild(snowCanvas);

    const ctx       = snowCanvas.getContext('2d');
    const windRad   = windDirDegree * Math.PI / 180;
    const windDrift = Math.sin(windRad) * Math.min(windSpeedKmph * 0.06, 5);

    const flakes = Array.from({ length: 110 }, () => ({
        x:     Math.random() * snowCanvas.width,
        y:     Math.random() * snowCanvas.height,
        r:     Math.random() * 3 + 1.5,
        speed: Math.random() * 1.2 + 0.5,
        drift: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    function frame() {
        ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
        t += 0.018;
        flakes.forEach(f => {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
            ctx.fill();

            f.y += f.speed;
            f.x += f.drift * Math.sin(t + f.phase) + windDrift;
            if (f.y > snowCanvas.height + f.r)  { f.y = -f.r; f.x = Math.random() * snowCanvas.width; }
            if (f.x > snowCanvas.width  + 10)   f.x = -10;
            if (f.x < -10)                       f.x = snowCanvas.width + 10;
        });
        snowRafId = requestAnimationFrame(frame);
    }
    frame();
}

function stopSnowAnimation() {
    if (snowRafId)  { cancelAnimationFrame(snowRafId); snowRafId = null; }
    if (snowCanvas) { snowCanvas.remove(); snowCanvas = null; }
}

// ── Nubes ─────────────────────────────────────────────────────────────────────
// z-index 1 → van detrás del texto (z-index 2)
// El backdrop-filter del #container las difumina automáticamente al pasar detrás

function startCloudyAnimation() {
    if (window.cloudInterval) return;

    const windRad      = windDirDegree * Math.PI / 180;
    const windH        = Math.sin(windRad); // positivo = se mueve a la derecha
    const moveRight    = windH >= 0;
    const cloudSpeed   = (0.4 + windSpeedKmph * 0.025) * (moveRight ? 1 : -1);
    const spawnInterval = Math.max(1500, 5500 - windSpeedKmph * 65);

    function createCloud() {
        const w   = Math.random() * 140 + 160;
        const h   = w * (Math.random() * 0.18 + 0.42);
        const top = Math.random() * (window.innerHeight * 0.55);
        const op  = (Math.random() * 0.25 + 0.65).toFixed(2);

        const cloud = document.createElement('div');
        cloud.className = 'we-cloud';
        const startX = moveRight ? -w - 20 : window.innerWidth + 20;
        cloud.style.cssText = `
            position: fixed;
            z-index: 1;
            pointer-events: none;
            top: ${top}px;
            left: ${startX}px;
            width: ${w}px;
            height: ${h}px;
            background: rgba(195, 215, 238, ${op});
            border-radius: 50%;
            box-shadow:
                ${(w * 0.28).toFixed()}px ${(-h * 0.28).toFixed()}px 0 ${(h * 0.15).toFixed()}px rgba(210, 225, 245, ${op}),
                ${(w * 0.58).toFixed()}px ${(-h * 0.18).toFixed()}px 0 ${(h * 0.10).toFixed()}px rgba(205, 222, 242, ${(op * 0.92).toFixed(2)}),
                ${(-w * 0.10).toFixed()}px ${(-h * 0.18).toFixed()}px 0 ${(h * 0.08).toFixed()}px rgba(208, 220, 242, ${(op * 0.88).toFixed(2)});
            filter: blur(2px);
            transition: opacity 0.7s ease;
        `;
        document.body.appendChild(cloud);

        let x = startX;
        function move() {
            if (!cloud.parentNode) return;
            x += cloudSpeed;
            cloud.style.left = `${x}px`;
            if (moveRight ? x > window.innerWidth + 20 : x < -w - 20) { cloud.remove(); return; }
            const tb = document.getElementById('container').getBoundingClientRect();
            const cb = cloud.getBoundingClientRect();
            cloud.style.opacity = overlaps(cb, tb, 50) ? '0.1' : '1';
            requestAnimationFrame(move);
        }
        requestAnimationFrame(move);
    }

    // Spawn inicial para que no arranque la pantalla vacía
    for (let i = 0; i < 2; i++) setTimeout(createCloud, i * (spawnInterval / 2));
    window.cloudInterval = setInterval(createCloud, spawnInterval);
}

function stopCloudyAnimation() {
    clearInterval(window.cloudInterval);
    window.cloudInterval = null;
    document.querySelectorAll('.we-cloud').forEach(c => c.remove());
}

// ── Tormenta ──────────────────────────────────────────────────────────────────

let boltCanvas = null;

function drawLightningBolt(ctx, x1, y1, x2, y2, depth) {
    if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
    }
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * (Math.abs(x2 - x1) + Math.abs(y2 - y1)) * 0.38;
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 18;
    drawLightningBolt(ctx, x1, y1, mx, my, depth - 1);
    drawLightningBolt(ctx, mx, my, x2, y2, depth - 1);
}

function spawnBolt() {
    if (!boltCanvas) return;
    const ctx = boltCanvas.getContext('2d');
    ctx.clearRect(0, 0, boltCanvas.width, boltCanvas.height);

    const x     = Math.random() * boltCanvas.width * 0.7 + boltCanvas.width * 0.15;
    const yEnd  = boltCanvas.height * (0.55 + Math.random() * 0.35);

    ctx.strokeStyle = `rgba(200, 220, 255, ${(Math.random() * 0.35 + 0.45).toFixed(2)})`;
    ctx.lineWidth   = Math.random() * 1.5 + 0.5;
    ctx.shadowColor = 'rgba(180, 210, 255, 0.8)';
    ctx.shadowBlur  = 12;
    drawLightningBolt(ctx, x, 0, x + (Math.random() - 0.5) * 200, yEnd, 5);

    // Optional branch
    if (Math.random() > 0.4) {
        const bx = x + (Math.random() - 0.5) * 80;
        const by = yEnd * (0.3 + Math.random() * 0.35);
        ctx.strokeStyle = `rgba(190, 215, 255, ${(Math.random() * 0.2 + 0.25).toFixed(2)})`;
        ctx.lineWidth   = Math.random() * 0.8 + 0.3;
        drawLightningBolt(ctx, bx, by, bx + (Math.random() - 0.5) * 120, by + yEnd * 0.3, 4);
    }

    setTimeout(() => {
        if (boltCanvas) boltCanvas.getContext('2d').clearRect(0, 0, boltCanvas.width, boltCanvas.height);
    }, 120);

    window.boltTimeout = setTimeout(spawnBolt, Math.random() * 8000 + 3000);
}

function startBoltAnimation() {
    if (boltCanvas) return;
    boltCanvas = document.createElement('canvas');
    boltCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:1;';
    boltCanvas.width  = window.innerWidth;
    boltCanvas.height = window.innerHeight;
    document.body.appendChild(boltCanvas);
    window.boltTimeout = setTimeout(spawnBolt, Math.random() * 5000 + 2000);
}

function stopBoltAnimation() {
    clearTimeout(window.boltTimeout);
    window.boltTimeout = null;
    if (boltCanvas) { boltCanvas.remove(); boltCanvas = null; }
}

function startStormAnimation() {
    startRainAnimation();
    startBoltAnimation();
    if (window.stormFlashTimeout) return;

    function scheduleFlash() {
        window.stormFlashTimeout = setTimeout(() => {
            if (!window.stormFlashTimeout) return;
            const el = document.createElement('div');
            el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,220,0.72);z-index:2000;pointer-events:none;';
            document.body.appendChild(el);
            el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out' });
            setTimeout(() => el.remove(), 220);
            scheduleFlash();
        }, Math.random() * 7000 + 3000);
    }
    scheduleFlash();
}

function stopStormAnimation() {
    stopRainAnimation();
    stopBoltAnimation();
    clearTimeout(window.stormFlashTimeout);
    window.stormFlashTimeout = null;
}

// ── Hojas (frente al texto, z-index 5) ───────────────────────────────────────

let leavesInterval = null;

function startLeavesAnimation() {
    if (windSpeedKmph < 15 || leavesInterval) return;

    const speed      = 1.2 + windSpeedKmph * 0.045;
    const spawnRate  = Math.max(500, 4200 - windSpeedKmph * 65);

    function createLeaf() {
        const size = Math.random() * 10 + 10;
        const hue  = 75 + Math.random() * 80;

        const leaf = document.createElement('div');
        leaf.className = 'we-leaf';
        leaf.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${(size * 0.6).toFixed()}px;
            background: hsla(${hue.toFixed()}, 65%, 42%, 0.88);
            border-radius: 50% 0 50% 0;
            z-index: 5;
            pointer-events: none;
        `;
        document.body.appendChild(leaf);

        const windRad   = windDirDegree * Math.PI / 180;
        const windH     = Math.sin(windRad); // positivo = derecha
        const moveRight = windH >= 0;
        const vxMag     = 0.8 + windSpeedKmph * 0.055 + Math.random() * 0.5;
        const vx        = moveRight ? vxMag : -vxMag;
        const vy        = 0.9 + Math.random() * 0.6;

        let x = moveRight ? -size : window.innerWidth + size;
        let y = Math.random() * window.innerHeight * 0.75;
        let wobble   = Math.random() * Math.PI * 2;
        let rot      = Math.random() * 360;
        const spin   = (Math.random() - 0.5) * 4;

        function move() {
            if (!leaf.parentNode) return;
            wobble += 0.04;
            x += vx + Math.sin(wobble) * 0.5;
            y += vy;
            rot += spin;
            leaf.style.left      = `${x}px`;
            leaf.style.top       = `${y}px`;
            leaf.style.transform = `rotate(${rot}deg)`;
            if ((moveRight ? x > window.innerWidth + size : x < -size) || y > window.innerHeight + size) { leaf.remove(); return; }
            requestAnimationFrame(move);
        }
        requestAnimationFrame(move);
    }

    leavesInterval = setInterval(createLeaf, spawnRate);
}

function stopLeavesAnimation() {
    clearInterval(leavesInterval);
    leavesInterval = null;
    document.querySelectorAll('.we-leaf').forEach(l => l.remove());
}

// ── Control ───────────────────────────────────────────────────────────────────

function stopAllAnimations() {
    stopRainAnimation();
    stopCloudyAnimation();
    stopStormAnimation();
    stopBoltAnimation();
    stopSnowAnimation();
    stopLeavesAnimation();
}
