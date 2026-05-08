const animContainer = document.getElementById('animation-container');

function startRainAnimation() {
    if (window.rainInterval) return;

    window.rainInterval = setInterval(() => {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * animContainer.clientWidth + 'px';
        drop.style.top = '-10px';
        animContainer.appendChild(drop);

        const fallDuration = Math.random() * 1000 + 1000;
        const startTime = performance.now();

        const fall = (now) => {
            const progress = (now - startTime) / fallDuration;
            if (progress < 1) {
                drop.style.top = animContainer.clientHeight * progress + 'px';
                requestAnimationFrame(fall);
            } else {
                drop.remove();
            }
        };

        requestAnimationFrame(fall);
    }, 100);
}

function stopRainAnimation() {
    clearInterval(window.rainInterval);
    window.rainInterval = null;
    animContainer.querySelectorAll('.rain-drop').forEach(d => d.remove());
}

function startCloudyAnimation() {
    if (window.cloudInterval) return;

    const createCloud = () => {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        animContainer.appendChild(cloud);

        const W = animContainer.clientWidth;
        const H = animContainer.clientHeight;

        cloud.style.width  = `${Math.random() * 30 + 50}px`;
        cloud.style.height = `${Math.random() * 15 + 25}px`;
        cloud.style.top    = `${Math.random() * (H * 0.6)}px`;
        cloud.style.left   = '-80px';

        let position = -80;
        cloud.timer = setInterval(() => {
            position += 0.5;
            cloud.style.left = `${position}px`;
            if (position > W + 80) {
                cloud.remove();
                clearInterval(cloud.timer);
            }
        }, 50);
    };

    createCloud();
    window.cloudInterval = setInterval(createCloud, 4000);
}

function stopCloudyAnimation() {
    clearInterval(window.cloudInterval);
    window.cloudInterval = null;
    animContainer.querySelectorAll('.cloud').forEach(c => c.remove());
}

function startStormAnimation() {
    startRainAnimation();

    if (!window.stormInterval) {
        const createLightning = () => {
            const flash = document.createElement('div');
            animContainer.appendChild(flash);

            flash.style.position   = 'absolute';
            flash.style.inset      = '0';
            flash.style.background = 'rgba(255, 255, 255, 0.8)';
            flash.style.zIndex     = '20';
            flash.style.opacity    = '0';

            flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-in-out' });
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
    if (window.snowInterval) return;

    window.snowInterval = setInterval(() => {
        const flake = document.createElement('div');
        animContainer.appendChild(flake);

        flake.style.position     = 'absolute';
        flake.style.width        = '5px';
        flake.style.height       = '5px';
        flake.style.background   = 'white';
        flake.style.borderRadius = '50%';
        flake.style.opacity      = '0.8';
        flake.style.left         = Math.random() * animContainer.clientWidth + 'px';
        flake.style.top          = '-6px';

        const fallDuration = Math.random() * 2000 + 1500;
        const startTime    = performance.now();

        const fall = (now) => {
            const progress = (now - startTime) / fallDuration;
            if (progress < 1) {
                flake.style.top = `${animContainer.clientHeight * progress}px`;
                requestAnimationFrame(fall);
            } else {
                flake.remove();
            }
        };

        requestAnimationFrame(fall);
    }, 150);
}

function stopSnowAnimation() {
    clearInterval(window.snowInterval);
    window.snowInterval = null;
    animContainer.querySelectorAll('.snowflake').forEach(f => f.remove());
}

function stopAllAnimations() {
    stopRainAnimation();
    stopCloudyAnimation();
    stopStormAnimation();
    stopSnowAnimation();
}
