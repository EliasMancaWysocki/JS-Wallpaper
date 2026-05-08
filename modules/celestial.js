function ensureSunAndMoon() {
    const now   = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    const W = animContainer.clientWidth;
    const H = animContainer.clientHeight;

    // Sol
    const sun = animContainer.querySelector('.sun') || document.createElement('div');
    sun.className    = 'sun';
    sun.style.width  = '22px';
    sun.style.height = '22px';
    if (!animContainer.contains(sun)) animContainer.appendChild(sun);

    const sunrise = 6, sunset = 19;
    const sunProgress = (hours - sunrise) / (sunset - sunrise);
    if (hours >= sunrise && hours <= sunset) {
        sun.style.left    = `${W / 2 + (W / 2.5) * Math.cos(Math.PI * (1 - sunProgress))}px`;
        sun.style.top     = `${H / 2 - (H / 2.5) * Math.sin(Math.PI * (1 - sunProgress))}px`;
        sun.style.display = 'block';
    } else {
        sun.style.display = 'none';
    }

    // Luna
    const moon = animContainer.querySelector('.moon') || document.createElement('div');
    moon.className    = 'moon';
    moon.style.width  = '14px';
    moon.style.height = '14px';
    if (!animContainer.contains(moon)) animContainer.appendChild(moon);

    const nightStart  = 19.01, nightEnd = 6;
    const nightLength = (24 - nightStart) + nightEnd;
    const moonProgress = hours >= nightStart
        ? (hours - nightStart) / nightLength
        : (hours + (24 - nightStart)) / nightLength;

    if (hours >= nightStart || hours < nightEnd) {
        moon.style.left    = `${W / 2 + (W / 2.5) * Math.cos(Math.PI * (1 - moonProgress))}px`;
        moon.style.top     = `${H / 2 - (H / 2.5) * Math.sin(Math.PI * (1 - moonProgress))}px`;
        moon.style.display = 'block';
    } else {
        moon.style.display = 'none';
    }
}
